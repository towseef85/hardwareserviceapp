"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { cities, stores } from "@/db/schema";
import {
  storeSchema,
  type StoreFormValues,
} from "@/validations/store";
import { requireActiveAdmin } from "@/lib/current-user";

export type StoreActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<
        Record<keyof StoreFormValues, string>
      >;
    };

    function isForeignKeyViolation(
  error: unknown,
): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23503"
  );
}

function getStoreValidationErrors(
  values: StoreFormValues,
): StoreActionResult | null {
  
  const validationResult =
    storeSchema.safeParse(values);

  if (validationResult.success) {
    return null;
  }

  const errors =
    validationResult.error.flatten().fieldErrors;

  return {
    success: false,
    message: "Please correct the highlighted fields.",
    fieldErrors: {
      code: errors.code?.[0],
      engName: errors.engName?.[0],
      arbName: errors.arbName?.[0],
      cityId: errors.cityId?.[0],
      phone: errors.phone?.[0],
      email: errors.email?.[0],
      address: errors.address?.[0],
    },
  };
}

export async function createStoreAction(
  values: StoreFormValues,
): Promise<StoreActionResult> {
  const access = await requireActiveAdmin();

if (!access.allowed) {
  return {
    success: false,
    message: access.message,
  };
}
  const validationError =
    getStoreValidationErrors(values);

  if (validationError) {
    return validationError;
  }

  const validatedValues = storeSchema.parse(values);
  const cityId = Number(validatedValues.cityId);

  if (!Number.isInteger(cityId) || cityId <= 0) {
    return {
      success: false,
      message: "Please select a valid City.",
      fieldErrors: {
        cityId: "Please select a valid City.",
      },
    };
  }

  const selectedCity = await db
    .select({
      id: cities.id,
    })
    .from(cities)
    .where(eq(cities.id, cityId))
    .limit(1);

  if (selectedCity.length === 0) {
    return {
      success: false,
      message:
        "The selected City could not be found.",
      fieldErrors: {
        cityId:
          "This City no longer exists. Select another City.",
      },
    };
  }

  const normalizedCode =
    validatedValues.code.toUpperCase();

  const insertedStores = await db
    .insert(stores)
    .values({
      code: normalizedCode,
      engName: validatedValues.engName,
      arbName: validatedValues.arbName || null,
      cityId,
      phone: validatedValues.phone || null,
      email: validatedValues.email || null,
      address: validatedValues.address || null,
    })
    .onConflictDoNothing({
      target: stores.code,
    })
    .returning({
      id: stores.id,
    });

  if (insertedStores.length === 0) {
    return {
      success: false,
      message:
        "A Store with this code already exists.",
      fieldErrors: {
        code: "This Store code is already in use.",
      },
    };
  }

  revalidatePath("/stores");
  redirect("/stores");
}

export async function updateStoreAction(
  storeId: number,
  values: StoreFormValues,
): Promise<StoreActionResult> {
  const access = await requireActiveAdmin();

if (!access.allowed) {
  return {
    success: false,
    message: access.message,
  };
}
  if (!Number.isInteger(storeId) || storeId <= 0) {
    return {
      success: false,
      message: "The selected Store is invalid.",
    };
  }

  const validationError =
    getStoreValidationErrors(values);

  if (validationError) {
    return validationError;
  }

  const validatedValues = storeSchema.parse(values);
  const cityId = Number(validatedValues.cityId);

  if (!Number.isInteger(cityId) || cityId <= 0) {
    return {
      success: false,
      message: "Please select a valid City.",
      fieldErrors: {
        cityId: "Please select a valid City.",
      },
    };
  }

  const existingStore = await db
    .select({
      id: stores.id,
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  if (existingStore.length === 0) {
    return {
      success: false,
      message: "The Store could not be found.",
    };
  }

  const selectedCity = await db
    .select({
      id: cities.id,
    })
    .from(cities)
    .where(eq(cities.id, cityId))
    .limit(1);

  if (selectedCity.length === 0) {
    return {
      success: false,
      message: "The selected City could not be found.",
      fieldErrors: {
        cityId:
          "This City no longer exists. Select another City.",
      },
    };
  }

  const normalizedCode =
    validatedValues.code.toUpperCase();

  const duplicateCode = await db
    .select({
      id: stores.id,
    })
    .from(stores)
    .where(
      and(
        eq(stores.code, normalizedCode),
        ne(stores.id, storeId),
      ),
    )
    .limit(1);

  if (duplicateCode.length > 0) {
    return {
      success: false,
      message:
        "A Store with this code already exists.",
      fieldErrors: {
        code: "This Store code is already in use.",
      },
    };
  }

  await db
    .update(stores)
    .set({
      code: normalizedCode,
      engName: validatedValues.engName,
      arbName: validatedValues.arbName || null,
      cityId,
      phone: validatedValues.phone || null,
      email: validatedValues.email || null,
      address: validatedValues.address || null,
      updatedAt: new Date(),
    })
    .where(eq(stores.id, storeId));

  revalidatePath("/stores");
  revalidatePath(`/stores/${storeId}/edit`);

  redirect("/stores");
}

export async function deleteStoreAction(
  storeId: number,
): Promise<StoreActionResult> {
  const access = await requireActiveAdmin();

if (!access.allowed) {
  return {
    success: false,
    message: access.message,
  };
}
  if (!Number.isInteger(storeId) || storeId <= 0) {
    return {
      success: false,
      message: "The selected Store is invalid.",
    };
  }

  try {
    const deletedStores = await db
      .delete(stores)
      .where(eq(stores.id, storeId))
      .returning({
        id: stores.id,
      });

    if (deletedStores.length === 0) {
      return {
        success: false,
        message:
          "The Store could not be found. It may have already been deleted.",
      };
    }

    revalidatePath("/stores");

    return {
      success: true,
      message: "Store deleted successfully.",
    };
  } catch (error: unknown) {
  if (isForeignKeyViolation(error)) {
    return {
      success: false,
      message:
        "This Store cannot be deleted because one or more Users are linked to it.",
    };
  }

  console.error("Failed to delete Store:", error);

  return {
    success: false,
    message:
      "The Store could not be deleted. Please try again.",
  };
}
}