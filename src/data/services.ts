import { and, asc, desc, eq } from "drizzle-orm";
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
import { hasRole } from "@/lib/current-user";

export async function getServices(filters: { storeId?: number; technicianId?: number } = {}) {
  const conditions = [filters.storeId ? eq(services.storeId, filters.storeId) : undefined, filters.technicianId ? eq(services.assignedTechnicianId, filters.technicianId) : undefined].filter(Boolean);
  return db.select({ id: services.id, code: services.code, storeId: services.storeId, storeName: stores.engName, serviceTypeName: serviceTypes.name, customerName: customers.fullName, customerMobile: customers.mobile, description: services.description, status: services.status, technicianName: appUsers.fullName, createdAt: services.createdAt })
    .from(services).innerJoin(stores, eq(services.storeId, stores.id)).innerJoin(serviceTypes, eq(services.serviceTypeId, serviceTypes.id)).innerJoin(customers, eq(services.customerId, customers.id)).leftJoin(appUsers, eq(services.assignedTechnicianId, appUsers.id))
    .where(conditions.length ? and(...conditions) : undefined).orderBy(desc(services.createdAt));
}

export async function getTechnicianServices(technicianId: number) {
  return db.select({ id: services.id, code: services.code, serviceTypeName: serviceTypes.name, description: services.description, status: services.status, createdAt: services.createdAt })
    .from(services).innerJoin(serviceTypes, eq(services.serviceTypeId, serviceTypes.id)).where(eq(services.assignedTechnicianId, technicianId)).orderBy(desc(services.createdAt));
}

export async function getServiceById(id: number, filters: { storeId?: number; technicianId?: number } = {}) {
  const rows = await db.select({ id: services.id, code: services.code, storeId: services.storeId, serviceTypeId: services.serviceTypeId, customerId: services.customerId, description: services.description, status: services.status, assignedTechnicianId: services.assignedTechnicianId, customerName: customers.fullName, customerMobile: customers.mobile, customerEmail: customers.email, customerAddress: customers.address, serviceTypeName: serviceTypes.name, technicianName: appUsers.fullName, createdAt: services.createdAt })
    .from(services).innerJoin(serviceTypes, eq(services.serviceTypeId, serviceTypes.id)).innerJoin(customers, eq(services.customerId, customers.id)).leftJoin(appUsers, eq(services.assignedTechnicianId, appUsers.id))
    .where(and(eq(services.id, id), filters.storeId ? eq(services.storeId, filters.storeId) : undefined, filters.technicianId ? eq(services.assignedTechnicianId, filters.technicianId) : undefined)).limit(1);
  return rows[0] ?? null;
}

export async function getTechnicianServiceById(id: number, technicianId: number) {
  const rows = await db.select({ id: services.id, code: services.code, serviceTypeName: serviceTypes.name, description: services.description, status: services.status, createdAt: services.createdAt })
    .from(services).innerJoin(serviceTypes, eq(services.serviceTypeId, serviceTypes.id)).where(and(eq(services.id, id), eq(services.assignedTechnicianId, technicianId))).limit(1);
  return rows[0] ?? null;
}

export async function getServiceStatusHistory(
  serviceId: number,
) {
  return db
    .select({
      id: serviceStatusHistory.id,
      fromStatus: serviceStatusHistory.fromStatus,
      toStatus: serviceStatusHistory.toStatus,
      changedByName: appUsers.fullName,
      createdAt: serviceStatusHistory.createdAt,
    })
    .from(serviceStatusHistory)
    .leftJoin(
      appUsers,
      eq(
        serviceStatusHistory.changedByAppUserId,
        appUsers.id,
      ),
    )
    .where(eq(serviceStatusHistory.serviceId, serviceId))
    .orderBy(
      asc(serviceStatusHistory.createdAt),
      asc(serviceStatusHistory.id),
    );
}

export async function getServiceFormOptions(storeId?: number) {
  const storeCondition = storeId ? eq(stores.id, storeId) : undefined;
  const [storeRows, customerRows, typeRows, userRows] = await Promise.all([
    db.select({ id: stores.id, code: stores.code, engName: stores.engName }).from(stores).where(storeCondition).orderBy(asc(stores.engName)),
    db.select({ id: customers.id, storeId: customers.storeId, fullName: customers.fullName }).from(customers).where(storeId ? eq(customers.storeId, storeId) : undefined).orderBy(asc(customers.fullName)),
    db.select({ id: serviceTypes.id, storeId: serviceTypes.storeId, name: serviceTypes.name, isActive: serviceTypes.isActive }).from(serviceTypes).where(storeId ? eq(serviceTypes.storeId, storeId) : undefined).orderBy(asc(serviceTypes.name)),
    db.select({ id: appUsers.id, storeId: appUsers.storeId, fullName: appUsers.fullName, role: authUsers.role }).from(appUsers).innerJoin(authUsers, eq(appUsers.authUserId, authUsers.id)).where(and(storeId ? eq(appUsers.storeId, storeId) : undefined, eq(appUsers.isActive, true))).orderBy(asc(appUsers.fullName)),
  ]);
  return { stores: storeRows, customers: customerRows, serviceTypes: typeRows, technicians: userRows.filter((user) => hasRole(user.role, "technician")).map((user) => ({ id: user.id, storeId: user.storeId, fullName: user.fullName })) };
}
