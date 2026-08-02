"use server";

import {
  and,
  eq,
  or,
} from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAPIError } from "better-auth/api";

import { db } from "@/db";
import {
  appUsers,
  cities,
  stores,
} from "@/db/schema";
import {
  getCurrentUserAccess,
  hasRole,
} from "@/lib/current-user";
import { auth } from "@/lib/auth";
import {
  userSchema,
  type UserFormValues,
} from "@/validations/user";

export type UserActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<
        Record<keyof UserFormValues, string>
      >;
    };

function getValidationErrors(
  values: UserFormValues,
): UserActionResult | null {
  const result = userSchema.safeParse(values);

  if (result.success) {
    return null;
  }

  const errors = result.error.flatten().fieldErrors;

  return {
    success: false,
    message: "Please correct the highlighted fields.",
    fieldErrors: {
      role: errors.role?.[0],
      cityId: errors.cityId?.[0],
      storeId: errors.storeId?.[0],
      fullName: errors.fullName?.[0],
      contact: errors.contact?.[0],
      email: errors.email?.[0],
      username: errors.username?.[0],
      password: errors.password?.[0],
      confirmPassword: errors.confirmPassword?.[0],
      isActive: errors.isActive?.[0],
    },
  };
}

export async function createUserAction(
  values: UserFormValues,
): Promise<UserActionResult> {
  const requestHeaders = await headers();
const access = await getCurrentUserAccess();

if (access.status === "unauthenticated") {
  return {
    success: false,
    message: "Your session has expired. Sign in again.",
  };
}

if (access.status !== "active") {
  return {
    success: false,
    message:
      "Your account is not allowed to perform this action.",
  };
}

if (!hasRole(access.role, "admin")) {
  return {
    success: false,
    message:
      "You do not have permission to create Users.",
  };
}

  const validationError = getValidationErrors(values);

  if (validationError) {
    return validationError;
  }

  const validatedValues = userSchema.parse(values);

  const cityId = Number(validatedValues.cityId);
  const storeId = Number(validatedValues.storeId);

  const selectedStore = await db
    .select({
      id: stores.id,
    })
    .from(stores)
    .innerJoin(
      cities,
      eq(stores.cityId, cities.id),
    )
    .where(
      and(
        eq(stores.id, storeId),
        eq(cities.id, cityId),
      ),
    )
    .limit(1);

  if (selectedStore.length === 0) {
    return {
      success: false,
      message:
        "The selected Store does not belong to the selected City.",
      fieldErrors: {
        storeId:
          "Select a Store belonging to the selected City.",
      },
    };
  }

  const normalizedEmail =
    validatedValues.email.toLowerCase();

  const normalizedUsername =
    validatedValues.username.toLowerCase();

  const existingProfile = await db
    .select({
      id: appUsers.id,
      email: appUsers.email,
      username: appUsers.username,
    })
    .from(appUsers)
   .where(
  or(
    eq(appUsers.email, normalizedEmail),
    eq(appUsers.username, normalizedUsername),
  ),
    )
    .limit(1);

  if (existingProfile.length > 0) {
  const profile = existingProfile[0];

  if (profile.email === normalizedEmail) {
    return {
      success: false,
      message: "A User with this email already exists.",
      fieldErrors: {
        email: "This email is already in use.",
      },
    };
  }

  if (profile.username === normalizedUsername) {
    return {
      success: false,
      message:
        "A User with this username already exists.",
      fieldErrors: {
        username:
          "This username is already in use.",
      },
    };
  }
}

  let authUserId: string | null = null;

  try {
    const createdAuthUser = await auth.api.createUser({
      body: {
        name: validatedValues.fullName,
        email: normalizedEmail,
        password: validatedValues.password,
        role: validatedValues.role,

        data: {
          username: normalizedUsername,
          displayUsername: validatedValues.username,
        },
      },

      headers: requestHeaders,
    });

    authUserId = createdAuthUser.user.id;

    await db.insert(appUsers).values({
      fullName: validatedValues.fullName,
      contact: validatedValues.contact || null,
      email: normalizedEmail,
      username: normalizedUsername,
      storeId,
      authUserId,
      isActive: validatedValues.isActive,
    });
  } catch (error: unknown) {
    if (authUserId) {
      try {
        await auth.api.removeUser({
          body: {
            userId: authUserId,
          },
          headers: requestHeaders,
        });
      } catch (cleanupError: unknown) {
        console.error(
          "Failed to clean up Better Auth User:",
          cleanupError,
        );
      }
    }

    if (isAPIError(error)) {
      const message = error.message.toLowerCase();

      if (message.includes("email")) {
        return {
          success: false,
          message:
            "A User with this email already exists.",
          fieldErrors: {
            email: "This email is already in use.",
          },
        };
      }

      if (message.includes("username")) {
        return {
          success: false,
          message:
            "A User with this username already exists.",
          fieldErrors: {
            username:
              "This username is already in use.",
          },
        };
      }
    }

    console.error("Failed to create User:", error);

    return {
      success: false,
      message:
        "The User could not be created. Please try again.",
    };
  }

  revalidatePath("/users");
  redirect("/users");
}
