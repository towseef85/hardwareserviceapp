"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { customers, services, stores } from "@/db/schema";
import { requirePermission } from "@/lib/authorization";
import { hasRole } from "@/lib/current-user";
import {
  customerSchema,
  type CustomerFormValues,
} from "@/validations/customer";

export type CustomerActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: Partial<Record<keyof CustomerFormValues, string>>;
};

function validationError(values: CustomerFormValues): CustomerActionResult | null {
  const result = customerSchema.safeParse(values);
  if (result.success) return null;
  const errors = result.error.flatten().fieldErrors;
  return {
    success: false,
    message: "Please correct the highlighted fields.",
    fieldErrors: {
      storeId: errors.storeId?.[0],
      fullName: errors.fullName?.[0],
      mobile: errors.mobile?.[0],
      email: errors.email?.[0],
      address: errors.address?.[0],
    },
  };
}

function resolveStoreId(
  requestedStoreId: number,
  user: { role: string | null; storeId: number },
) {
  return hasRole(user.role, "admin")
    ? requestedStoreId
    : user.storeId;
}

export async function createCustomerAction(
  values: CustomerFormValues,
): Promise<CustomerActionResult> {
  const access = await requirePermission("customers", "create");
  if (!access.allowed) return { success: false, message: access.message };
  if (hasRole(access.user.role, "technician")) {
    return { success: false, message: "Technicians cannot manage Customers." };
  }
  const invalid = validationError(values);
  if (invalid) return invalid;
  const parsed = customerSchema.parse(values);
  const storeId = resolveStoreId(Number(parsed.storeId), access.user);
  const store = await db.select({ id: stores.id }).from(stores)
    .where(eq(stores.id, storeId)).limit(1);
  if (!store[0]) return { success: false, message: "The selected Store could not be found." };
  const inserted = await db.insert(customers).values({
    storeId,
    fullName: parsed.fullName,
    mobile: parsed.mobile,
    email: parsed.email || null,
    address: parsed.address || null,
  }).onConflictDoNothing().returning({ id: customers.id });
  if (!inserted[0]) return {
    success: false,
    message: "A Customer with this mobile already exists in the Store.",
    fieldErrors: { mobile: "This mobile is already in use." },
  };
  revalidatePath("/customers");
  redirect("/customers");
}

export async function updateCustomerAction(
  customerId: number,
  values: CustomerFormValues,
): Promise<CustomerActionResult> {
  const access = await requirePermission("customers", "update");
  if (!access.allowed) return { success: false, message: access.message };
  if (hasRole(access.user.role, "technician")) return { success: false, message: "Technicians cannot manage Customers." };
  const invalid = validationError(values);
  if (invalid) return invalid;
  const parsed = customerSchema.parse(values);
  const scopeStoreId = hasRole(access.user.role, "admin") ? undefined : access.user.storeId;
  const current = await db.select({ id: customers.id, storeId: customers.storeId })
    .from(customers).where(scopeStoreId ? and(eq(customers.id, customerId), eq(customers.storeId, scopeStoreId)) : eq(customers.id, customerId)).limit(1);
  if (!current[0]) return { success: false, message: "The Customer could not be found." };
  const storeId = resolveStoreId(Number(parsed.storeId), access.user);
  const selectedStore = await db.select({ id: stores.id }).from(stores).where(eq(stores.id, storeId)).limit(1);
  if (!selectedStore[0]) return { success: false, message: "The selected Store could not be found.", fieldErrors: { storeId: "Select a valid Store." } };
  if (current[0].storeId !== storeId) {
    const linked = await db.select({ id: services.id }).from(services).where(eq(services.customerId, customerId)).limit(1);
    if (linked[0]) return { success: false, message: "The Customer's Store cannot be changed while Services are linked." };
  }
  const duplicate = await db.select({ id: customers.id }).from(customers)
    .where(and(eq(customers.storeId, storeId), eq(customers.mobile, parsed.mobile), ne(customers.id, customerId))).limit(1);
  if (duplicate[0]) return { success: false, message: "A Customer with this mobile already exists in the Store.", fieldErrors: { mobile: "This mobile is already in use." } };
  await db.update(customers).set({ storeId, fullName: parsed.fullName, mobile: parsed.mobile, email: parsed.email || null, address: parsed.address || null, updatedAt: new Date() }).where(eq(customers.id, customerId));
  revalidatePath("/customers");
  redirect("/customers");
}

export async function deleteCustomerAction(customerId: number): Promise<CustomerActionResult> {
  const access = await requirePermission("customers", "delete");
  if (!access.allowed) return { success: false, message: access.message };
  const scope = hasRole(access.user.role, "admin") ? eq(customers.id, customerId) : and(eq(customers.id, customerId), eq(customers.storeId, access.user.storeId));
  const linked = await db.select({ id: services.id }).from(services).where(eq(services.customerId, customerId)).limit(1);
  if (linked[0]) return { success: false, message: "This Customer cannot be deleted because Services are linked to it." };
  const deleted = await db.delete(customers).where(scope).returning({ id: customers.id });
  if (!deleted[0]) return { success: false, message: "The Customer could not be found." };
  revalidatePath("/customers");
  return { success: true, message: "Customer deleted successfully." };
}
