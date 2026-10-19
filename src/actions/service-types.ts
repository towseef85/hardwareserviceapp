"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { services, serviceTypes, stores } from "@/db/schema";
import { requirePermission } from "@/lib/authorization";
import { hasRole } from "@/lib/current-user";
import { serviceTypeSchema, type ServiceTypeFormValues } from "@/validations/service-type";

export type ServiceTypeActionResult = { success: boolean; message: string; fieldErrors?: Partial<Record<keyof ServiceTypeFormValues, string>> };
function validate(values: ServiceTypeFormValues): ServiceTypeActionResult | null { const result = serviceTypeSchema.safeParse(values); if (result.success) return null; const e = result.error.flatten().fieldErrors; return { success: false, message: "Please correct the highlighted fields.", fieldErrors: { storeId: e.storeId?.[0], name: e.name?.[0], description: e.description?.[0], isActive: e.isActive?.[0] } }; }
function storeIdFor(requested: number, user: { role: string | null; storeId: number }) { return hasRole(user.role, "admin") ? requested : user.storeId; }

export async function createServiceTypeAction(values: ServiceTypeFormValues): Promise<ServiceTypeActionResult> {
  const access = await requirePermission("service-types", "create"); if (!access.allowed) return { success: false, message: access.message };
  const invalid = validate(values); if (invalid) return invalid; const parsed = serviceTypeSchema.parse(values); const storeId = storeIdFor(Number(parsed.storeId), access.user);
  const store = await db.select({ id: stores.id }).from(stores).where(eq(stores.id, storeId)).limit(1); if (!store[0]) return { success: false, message: "The selected Store could not be found." };
  const inserted = await db.insert(serviceTypes).values({ storeId, name: parsed.name, isActive: parsed.isActive, description: parsed.description || null }).onConflictDoNothing().returning({ id: serviceTypes.id });
  if (!inserted[0]) return { success: false, message: "A Service Type with this name already exists in the Store.", fieldErrors: { name: "This name is already in use." } };
  revalidatePath("/service-types"); redirect("/service-types");
}

export async function updateServiceTypeAction(id: number, values: ServiceTypeFormValues): Promise<ServiceTypeActionResult> {
  const access = await requirePermission("service-types", "update"); if (!access.allowed) return { success: false, message: access.message };
  const invalid = validate(values); if (invalid) return invalid; const parsed = serviceTypeSchema.parse(values); const scopeStoreId = hasRole(access.user.role, "admin") ? undefined : access.user.storeId;
  const current = await getScoped(id, scopeStoreId); if (!current) return { success: false, message: "The Service Type could not be found." };
  const storeId = storeIdFor(Number(parsed.storeId), access.user);
  const selectedStore = await db.select({ id: stores.id }).from(stores).where(eq(stores.id, storeId)).limit(1); if (!selectedStore[0]) return { success: false, message: "The selected Store could not be found.", fieldErrors: { storeId: "Select a valid Store." } };
  if (current.storeId !== storeId) { const linked = await db.select({ id: services.id }).from(services).where(eq(services.serviceTypeId, id)).limit(1); if (linked[0]) return { success: false, message: "The Service Type's Store cannot be changed while Services are linked." }; }
  const duplicate = await db.select({ id: serviceTypes.id }).from(serviceTypes).where(and(eq(serviceTypes.storeId, storeId), eq(serviceTypes.name, parsed.name), ne(serviceTypes.id, id))).limit(1);
  if (duplicate[0]) return { success: false, message: "A Service Type with this name already exists in the Store.", fieldErrors: { name: "This name is already in use." } };
  await db.update(serviceTypes).set({ storeId, name: parsed.name, isActive: parsed.isActive, description: parsed.description || null, updatedAt: new Date() }).where(eq(serviceTypes.id, id)); revalidatePath("/service-types"); redirect("/service-types");
}
async function getScoped(id: number, storeId?: number) { const rows = await db.select({ id: serviceTypes.id, storeId: serviceTypes.storeId }).from(serviceTypes).where(storeId ? and(eq(serviceTypes.id, id), eq(serviceTypes.storeId, storeId)) : eq(serviceTypes.id, id)).limit(1); return rows[0]; }

export async function deleteServiceTypeAction(id: number): Promise<ServiceTypeActionResult> {
  const access = await requirePermission("service-types", "delete"); if (!access.allowed) return { success: false, message: access.message };
  const scopeStoreId = hasRole(access.user.role, "admin") ? undefined : access.user.storeId; if (!await getScoped(id, scopeStoreId)) return { success: false, message: "The Service Type could not be found." };
  const linked = await db.select({ id: services.id }).from(services).where(eq(services.serviceTypeId, id)).limit(1); if (linked[0]) return { success: false, message: "This Service Type cannot be deleted because Services are linked to it." };
  await db.delete(serviceTypes).where(eq(serviceTypes.id, id)); revalidatePath("/service-types"); return { success: true, message: "Service Type deleted successfully." };
}
