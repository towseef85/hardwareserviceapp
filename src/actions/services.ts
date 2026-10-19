"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { user as authUsers } from "@/db/auth-schema";
import {
  appUsers,
  customers,
  services,
  serviceStatusHistory,
  serviceTypes,
  stores,
} from "@/db/schema";
import { requirePermission } from "@/lib/authorization";
import {
  getCurrentUserAccess,
  hasRole,
} from "@/lib/current-user";
import { buildServiceCodeBase } from "@/lib/service-code";
import {
  serviceSchema,
  technicianServiceStatusSchema,
  type ServiceFormValues,
  type ServiceStatus,
} from "@/validations/service";

export type ServiceActionResult = { success: boolean; message: string; fieldErrors?: Partial<Record<keyof ServiceFormValues, string>> };
export type TechnicianStatusActionResult = {
  success: boolean;
  message: string;
};

const nextTechnicianStatus: Partial<
  Record<ServiceStatus, ServiceStatus>
> = {
  created: "working",
  working: "tested",
  tested: "completed",
};
function validation(values: ServiceFormValues): ServiceActionResult | null { const r = serviceSchema.safeParse(values); if (r.success) return null; const e = r.error.flatten().fieldErrors; return { success: false, message: "Please correct the highlighted fields.", fieldErrors: { storeId: e.storeId?.[0], serviceTypeId: e.serviceTypeId?.[0], customerId: e.customerId?.[0], assignedTechnicianId: e.assignedTechnicianId?.[0], description: e.description?.[0], status: e.status?.[0] } }; }
function scopedStore(requested: number, user: { role: string | null; storeId: number }) { return hasRole(user.role, "admin") ? requested : user.storeId; }

async function validateRelations(storeId: number, typeId: number, customerId: number, technicianId: number | null, allowedInactiveTypeId?: number): Promise<ServiceActionResult | { success: true; typeName: string; customerName: string }> {
  const [storeRows, typeRows, customerRows, technicianRows] = await Promise.all([
    db.select({ id: stores.id }).from(stores).where(eq(stores.id, storeId)).limit(1),
    db.select({ id: serviceTypes.id, name: serviceTypes.name, isActive: serviceTypes.isActive }).from(serviceTypes).where(and(eq(serviceTypes.id, typeId), eq(serviceTypes.storeId, storeId))).limit(1),
    db.select({ id: customers.id, fullName: customers.fullName }).from(customers).where(and(eq(customers.id, customerId), eq(customers.storeId, storeId))).limit(1),
    technicianId ? db.select({ id: appUsers.id, role: authUsers.role }).from(appUsers).innerJoin(authUsers, eq(appUsers.authUserId, authUsers.id)).where(and(eq(appUsers.id, technicianId), eq(appUsers.storeId, storeId), eq(appUsers.isActive, true))).limit(1) : Promise.resolve([]),
  ]);
  if (!storeRows[0]) return { success: false, message: "The selected Store could not be found.", fieldErrors: { storeId: "Select a valid Store." } };
  if (!typeRows[0] || (!typeRows[0].isActive && typeRows[0].id !== allowedInactiveTypeId)) return { success: false, message: "Select an active Service Type from this Store.", fieldErrors: { serviceTypeId: "Select an active Service Type." } };
  if (!customerRows[0]) return { success: false, message: "Select a Customer from this Store.", fieldErrors: { customerId: "Select a valid Customer." } };
  if (technicianId && (!technicianRows[0] || !hasRole(technicianRows[0].role, "technician"))) return { success: false, message: "Select an active Technician from this Store.", fieldErrors: { assignedTechnicianId: "Select a valid Technician." } };
  return { success: true, typeName: typeRows[0].name, customerName: customerRows[0].fullName };
}

export async function createServiceAction(values: ServiceFormValues): Promise<ServiceActionResult> {
  const access = await requirePermission("services", "create"); if (!access.allowed) return { success: false, message: access.message };
  const invalid = validation(values); if (invalid) return invalid; const parsed = serviceSchema.parse(values); const storeId = scopedStore(Number(parsed.storeId), access.user); const typeId = Number(parsed.serviceTypeId); const customerId = Number(parsed.customerId); const technicianId = parsed.assignedTechnicianId ? Number(parsed.assignedTechnicianId) : null;
  const relation = await validateRelations(storeId, typeId, customerId, technicianId); if (!("typeName" in relation)) return relation;
  const baseCode = buildServiceCodeBase(relation.typeName, relation.customerName); let createdId: number | null = null;
  for (let attempt = 1; attempt <= 50 && !createdId; attempt += 1) { const code = attempt === 1 ? baseCode : `${baseCode}-${attempt}`; const inserted = await db.insert(services).values({ code, storeId, serviceTypeId: typeId, customerId, description: parsed.description || null, status: "created", assignedTechnicianId: technicianId, createdByAppUserId: access.user.profileId, completedAt: null, deliveredAt: null }).onConflictDoNothing({ target: services.code }).returning({ id: services.id }); createdId = inserted[0]?.id ?? null; }
  if (!createdId) return { success: false, message: "A unique Service code could not be generated. Try again." };
  await db.insert(serviceStatusHistory).values({ serviceId: createdId, fromStatus: null, toStatus: "created", changedByAppUserId: access.user.profileId });
  revalidatePath("/services"); revalidatePath("/dashboard"); redirect("/services");
}

export async function updateServiceAction(id: number, values: ServiceFormValues): Promise<ServiceActionResult> {
  const access = await requirePermission("services", "update"); if (!access.allowed) return { success: false, message: access.message };
  const invalid = validation(values); if (invalid) return invalid; const parsed = serviceSchema.parse(values); const scopeStoreId = hasRole(access.user.role, "admin") ? undefined : access.user.storeId; const rows = await db.select({ id: services.id, serviceTypeId: services.serviceTypeId, status: services.status, completedAt: services.completedAt, deliveredAt: services.deliveredAt }).from(services).where(and(eq(services.id, id), scopeStoreId ? eq(services.storeId, scopeStoreId) : undefined)).limit(1); if (!rows[0]) return { success: false, message: "The Service could not be found." };
  const storeId = scopedStore(Number(parsed.storeId), access.user); const typeId = Number(parsed.serviceTypeId); const customerId = Number(parsed.customerId); const technicianId = parsed.assignedTechnicianId ? Number(parsed.assignedTechnicianId) : null; const relation = await validateRelations(storeId, typeId, customerId, technicianId, rows[0].serviceTypeId); if (!relation.success) return relation;
  const changedAt = new Date();
  const completedAt = parsed.status === "completed" || parsed.status === "delivered" ? rows[0].completedAt ?? changedAt : null;
  const deliveredAt = parsed.status === "delivered" ? rows[0].deliveredAt ?? changedAt : null;
  await db.update(services).set({ storeId, serviceTypeId: typeId, customerId, description: parsed.description || null, status: parsed.status, assignedTechnicianId: technicianId, completedAt, deliveredAt, updatedAt: changedAt }).where(eq(services.id, id));
  if (rows[0].status !== parsed.status) await db.insert(serviceStatusHistory).values({ serviceId: id, fromStatus: rows[0].status, toStatus: parsed.status, changedByAppUserId: access.user.profileId, createdAt: changedAt });
  revalidatePath("/services"); revalidatePath(`/services/${id}`); redirect("/services");
}

export async function deleteServiceAction(id: number): Promise<ServiceActionResult> {
  const access = await requirePermission("services", "delete"); if (!access.allowed) return { success: false, message: access.message };
  const scopeStoreId = hasRole(access.user.role, "admin") ? undefined : access.user.storeId; const deleted = await db.delete(services).where(and(eq(services.id, id), scopeStoreId ? eq(services.storeId, scopeStoreId) : undefined)).returning({ id: services.id }); if (!deleted[0]) return { success: false, message: "The Service could not be found." }; revalidatePath("/services"); return { success: true, message: "Service deleted successfully." };
}

export async function updateTechnicianServiceStatusAction(
  serviceId: number,
  targetStatus: unknown,
): Promise<TechnicianStatusActionResult> {
  const access = await getCurrentUserAccess();

  if (access.status !== "active") {
    return {
      success: false,
      message:
        "Your account is not allowed to perform this action.",
    };
  }

  if (!hasRole(access.role, "technician")) {
    return {
      success: false,
      message:
        "Only the assigned Technician can update this status.",
    };
  }

  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    return {
      success: false,
      message: "The selected Service is invalid.",
    };
  }

  const statusResult =
    technicianServiceStatusSchema.safeParse(targetStatus);

  if (!statusResult.success) {
    return {
      success: false,
      message: "The selected status is invalid.",
    };
  }

  const serviceRows = await db
    .select({
      id: services.id,
      status: services.status,
    })
    .from(services)
    .where(
      and(
        eq(services.id, serviceId),
        eq(
          services.assignedTechnicianId,
          access.profileId,
        ),
      ),
    )
    .limit(1);

  const service = serviceRows[0];

  if (!service) {
    return {
      success: false,
      message:
        "This Service is not assigned to your account.",
    };
  }

  const expectedStatus =
    nextTechnicianStatus[service.status];

  if (expectedStatus !== statusResult.data) {
    return {
      success: false,
      message:
        expectedStatus
          ? `The next allowed status is ${expectedStatus}.`
          : "No further Technician status updates are available.",
    };
  }

  const changedAt = new Date();
  const updatedServices = await db
    .update(services)
    .set({
      status: statusResult.data,
      completedAt:
        statusResult.data === "completed"
          ? changedAt
          : undefined,
      updatedAt: changedAt,
    })
    .where(
      and(
        eq(services.id, serviceId),
        eq(
          services.assignedTechnicianId,
          access.profileId,
        ),
        eq(services.status, service.status),
      ),
    )
    .returning({ id: services.id });

  if (!updatedServices[0]) {
    return {
      success: false,
      message:
        "The Service status changed elsewhere. Refresh and try again.",
    };
  }

  await db.insert(serviceStatusHistory).values({
    serviceId,
    fromStatus: service.status,
    toStatus: statusResult.data,
    changedByAppUserId: access.profileId,
    createdAt: changedAt,
  });

  revalidatePath("/services");
  revalidatePath(`/services/${serviceId}`);
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Service status updated to ${statusResult.data}.`,
  };
}
