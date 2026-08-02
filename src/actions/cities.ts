"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { cities } from "@/db/schema";
import {
  citySchema,
  type CityFormValues,
} from "@/validations/city";
import { requireActiveAdmin } from "@/lib/current-user";

export type CityActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<
        Record<keyof CityFormValues, string>
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
function getValidationErrors(
  values: CityFormValues,
): CityActionResult | null {
  const validationResult = citySchema.safeParse(values);

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
    },
  };
}

export async function createCityAction(
  values: CityFormValues,
): Promise<CityActionResult> {
  const access = await requireActiveAdmin();

if (!access.allowed) {
  return {
    success: false,
    message: access.message,
  };
}
  const validationError = getValidationErrors(values);

  if (validationError) {
    return validationError;
  }

  const validatedValues = citySchema.parse(values);
  const normalizedCode =
    validatedValues.code.toUpperCase();

  const insertedCities = await db
    .insert(cities)
    .values({
      code: normalizedCode,
      engName: validatedValues.engName,
      arbName: validatedValues.arbName || null,
    })
    .onConflictDoNothing({
      target: cities.code,
    })
    .returning({
      id: cities.id,
    });

  if (insertedCities.length === 0) {
    return {
      success: false,
      message: "A city with this code already exists.",
      fieldErrors: {
        code: "This city code is already in use.",
      },
    };
  }

  revalidatePath("/cities");
  redirect("/cities");
}

export async function updateCityAction(
  cityId: number,
  values: CityFormValues,
): Promise<CityActionResult> {
  const access = await requireActiveAdmin();

if (!access.allowed) {
  return {
    success: false,
    message: access.message,
  };
}
  if (!Number.isInteger(cityId) || cityId <= 0) {
    return {
      success: false,
      message: "The selected city is invalid.",
    };
  }

  const validationError = getValidationErrors(values);

  if (validationError) {
    return validationError;
  }

  const validatedValues = citySchema.parse(values);
  const normalizedCode =
    validatedValues.code.toUpperCase();

  const existingCity = await db
    .select({
      id: cities.id,
    })
    .from(cities)
    .where(eq(cities.id, cityId))
    .limit(1);

  if (existingCity.length === 0) {
    return {
      success: false,
      message: "The city could not be found.",
    };
  }

  const duplicateCode = await db
    .select({
      id: cities.id,
    })
    .from(cities)
    .where(
      and(
        eq(cities.code, normalizedCode),
        ne(cities.id, cityId),
      ),
    )
    .limit(1);

  if (duplicateCode.length > 0) {
    return {
      success: false,
      message: "A city with this code already exists.",
      fieldErrors: {
        code: "This city code is already in use.",
      },
    };
  }

  await db
    .update(cities)
    .set({
      code: normalizedCode,
      engName: validatedValues.engName,
      arbName: validatedValues.arbName || null,
      updatedAt: new Date(),
    })
    .where(eq(cities.id, cityId));

  revalidatePath("/cities");
  revalidatePath(`/cities/${cityId}/edit`);

  redirect("/cities");
}

export async function deleteCityAction(
  cityId: number,
): Promise<CityActionResult> {
  const access = await requireActiveAdmin();

if (!access.allowed) {
  return {
    success: false,
    message: access.message,
  };
}
  if (!Number.isInteger(cityId) || cityId <= 0) {
    return {
      success: false,
      message: "The selected city is invalid.",
    };
  }

  try {
    const deletedCities = await db
      .delete(cities)
      .where(eq(cities.id, cityId))
      .returning({
        id: cities.id,
      });

    if (deletedCities.length === 0) {
      return {
        success: false,
        message:
          "The city could not be found. It may have already been deleted.",
      };
    }

    revalidatePath("/cities");

    return {
      success: true,
      message: "City deleted successfully.",
    };
  } catch (error: unknown) {
  if (isForeignKeyViolation(error)) {
    return {
      success: false,
      message:
        "This city cannot be deleted because one or more Stores are linked to it.",
    };
  }

  console.error("Failed to delete city:", error);

  return {
    success: false,
    message:
      "The city could not be deleted. Please try again.",
  };
}
}