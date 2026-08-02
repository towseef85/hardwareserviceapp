"use server";

import { isAPIError } from "better-auth/api";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appUsers } from "@/db/schema";
import { user as authUsers } from "@/db/auth-schema";
import { auth } from "@/lib/auth";
import { requireActiveAdmin } from "@/lib/current-user";
import { adminChangePasswordSchema } from "@/validations/password";

export type ChangePasswordActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: {
        newPassword?: string;
        confirmPassword?: string;
      };
    };

export async function changeUserPasswordAction(
  appUserId: number,
  input: unknown,
): Promise<ChangePasswordActionResult> {
  const access = await requireActiveAdmin();

  if (!access.allowed) {
    revalidatePath("/users");

    return {
      success: false,
      message: access.message,
    };
  }

  if (!Number.isInteger(appUserId) || appUserId <= 0) {
    return {
      success: false,
      message: "The selected User is invalid.",
    };
  }

  const validationResult =
    adminChangePasswordSchema.safeParse(input);

  if (!validationResult.success) {
    const errors =
      validationResult.error.flatten().fieldErrors;

    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: {
        newPassword: errors.newPassword?.[0],
        confirmPassword: errors.confirmPassword?.[0],
      },
    };
  }

  const targetUsers = await db
    .select({
      authUserId: appUsers.authUserId,
      fullName: appUsers.fullName,
      email: appUsers.email,
      username: appUsers.username,
    })
    .from(appUsers)
    .where(eq(appUsers.id, appUserId))
    .limit(1);

  const targetUser = targetUsers[0];

  if (!targetUser) {
    return {
      success: false,
      message: "The selected User could not be found.",
    };
  }

  const requestHeaders = await headers();
  let authUserId = targetUser.authUserId;
  let createdAuthUserId: string | null = null;

  try {
    if (!authUserId) {
      const matchingAuthUsers = await db
        .select({ id: authUsers.id })
        .from(authUsers)
        .where(
          and(
            eq(authUsers.email, targetUser.email),
            eq(authUsers.username, targetUser.username),
          ),
        )
        .limit(1);

      const matchingAuthUser = matchingAuthUsers[0];

      if (matchingAuthUser) {
        const linkedProfiles = await db
          .select({ id: appUsers.id })
          .from(appUsers)
          .where(
            eq(
              appUsers.authUserId,
              matchingAuthUser.id,
            ),
          )
          .limit(1);

        if (
          linkedProfiles[0] &&
          linkedProfiles[0].id !== appUserId
        ) {
          return {
            success: false,
            message:
              "The matching login account is linked to another User.",
          };
        }

        authUserId = matchingAuthUser.id;
      } else {
        const createdAuthUser = await auth.api.createUser({
          body: {
            name: targetUser.fullName,
            email: targetUser.email.toLowerCase(),
            password:
              validationResult.data.newPassword,
            role: "technician",
            data: {
              username: targetUser.username.toLowerCase(),
              displayUsername: targetUser.username,
            },
          },
          headers: requestHeaders,
        });

        authUserId = createdAuthUser.user.id;
        createdAuthUserId = authUserId;
      }

      await db
        .update(appUsers)
        .set({
          authUserId,
          updatedAt: new Date(),
        })
        .where(eq(appUsers.id, appUserId));
    }

    if (!createdAuthUserId) {
      await auth.api.setUserPassword({
        body: {
          userId: authUserId,
          newPassword:
            validationResult.data.newPassword,
        },
        headers: requestHeaders,
      });
    }

    return {
      success: true,
      message: createdAuthUserId
        ? "Login account created and password set successfully."
        : "Password changed successfully.",
    };
  } catch (error: unknown) {
    if (createdAuthUserId) {
      try {
        await auth.api.removeUser({
          body: { userId: createdAuthUserId },
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
      return {
        success: false,
        message:
          error.message ||
          "The password could not be changed.",
      };
    }

    console.error("Failed to change User password:", error);

    return {
      success: false,
      message:
        "The password could not be changed. Please try again.",
    };
  }
}
