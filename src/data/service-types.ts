import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { serviceTypes, stores } from "@/db/schema";

export async function getServiceTypes(storeId?: number) {
  return db.select({ id: serviceTypes.id, storeId: serviceTypes.storeId, storeName: stores.engName, name: serviceTypes.name, isActive: serviceTypes.isActive, description: serviceTypes.description, createdAt: serviceTypes.createdAt })
    .from(serviceTypes).innerJoin(stores, eq(serviceTypes.storeId, stores.id))
    .where(storeId ? eq(serviceTypes.storeId, storeId) : undefined).orderBy(asc(serviceTypes.name));
}

export async function getServiceTypeById(id: number, storeId?: number) {
  const records = await db.select().from(serviceTypes).where(storeId ? and(eq(serviceTypes.id, id), eq(serviceTypes.storeId, storeId)) : eq(serviceTypes.id, id)).limit(1);
  return records[0] ?? null;
}

export async function getActiveServiceTypeOptions(storeId: number) {
  return db.select({ id: serviceTypes.id, name: serviceTypes.name }).from(serviceTypes)
    .where(and(eq(serviceTypes.storeId, storeId), eq(serviceTypes.isActive, true))).orderBy(asc(serviceTypes.name));
}
