import { count, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  cities,
  appUsers,
  customers,
  services,
  serviceTypes,
  stores,
} from "@/db/schema";

const serviceListSelection = {
  id: services.id,
  code: services.code,
  serviceTypeName: serviceTypes.name,
  description: services.description,
  customerName: customers.fullName,
  storeName: stores.engName,
  technicianName: appUsers.fullName,
  status: services.status,
  createdAt: services.createdAt,
};

async function getRecentServices(storeId?: number) {
  return db
    .select(serviceListSelection)
    .from(services)
    .innerJoin(
      serviceTypes,
      eq(services.serviceTypeId, serviceTypes.id),
    )
    .innerJoin(
      customers,
      eq(services.customerId, customers.id),
    )
    .innerJoin(stores, eq(services.storeId, stores.id))
    .leftJoin(
      appUsers,
      eq(services.assignedTechnicianId, appUsers.id),
    )
    .where(storeId ? eq(services.storeId, storeId) : undefined)
    .orderBy(desc(services.createdAt))
    .limit(10);
}

export async function getAdminDashboardData() {
  const [
    cityCount,
    storeCount,
    customerCount,
    serviceCount,
    recentServices,
  ] = await Promise.all([
    db.select({ value: count() }).from(cities),
    db.select({ value: count() }).from(stores),
    db.select({ value: count() }).from(customers),
    db.select({ value: count() }).from(services),
    getRecentServices(),
  ]);

  return {
    totalCities: cityCount[0]?.value ?? 0,
    totalStores: storeCount[0]?.value ?? 0,
    totalCustomers: customerCount[0]?.value ?? 0,
    totalServices: serviceCount[0]?.value ?? 0,
    recentServices,
  };
}

export async function getStoreAdminDashboardData(
  storeId: number,
) {
  const [assignedStore, customerCount, serviceCount, recentServices] =
    await Promise.all([
      db
        .select({
          id: stores.id,
          code: stores.code,
          name: stores.engName,
          cityName: cities.engName,
        })
        .from(stores)
        .innerJoin(cities, eq(stores.cityId, cities.id))
        .where(eq(stores.id, storeId))
        .limit(1),
      db
        .select({ value: count() })
        .from(customers)
        .where(eq(customers.storeId, storeId)),
      db
        .select({ value: count() })
        .from(services)
        .where(eq(services.storeId, storeId)),
      getRecentServices(storeId),
    ]);

  return {
    assignedStore: assignedStore[0] ?? null,
    totalStores: assignedStore[0] ? 1 : 0,
    totalCustomers: customerCount[0]?.value ?? 0,
    totalServices: serviceCount[0]?.value ?? 0,
    recentServices,
  };
}

export async function getTechnicianDashboardData(
  technicianId: number,
) {
  const recentServices = await db
    .select({
      id: services.id,
      code: services.code,
      serviceTypeName: serviceTypes.name,
      description: services.description,
      status: services.status,
      createdAt: services.createdAt,
    })
    .from(services)
    .innerJoin(
      serviceTypes,
      eq(services.serviceTypeId, serviceTypes.id),
    )
    .where(
      eq(services.assignedTechnicianId, technicianId),
    )
    .orderBy(desc(services.createdAt))
    .limit(10);

  return { recentServices };
}
