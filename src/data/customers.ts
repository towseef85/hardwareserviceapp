import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { customers, stores } from "@/db/schema";

export async function getCustomers(storeId?: number) {
  return db
    .select({
      id: customers.id,
      storeId: customers.storeId,
      storeName: stores.engName,
      fullName: customers.fullName,
      mobile: customers.mobile,
      email: customers.email,
      address: customers.address,
      createdAt: customers.createdAt,
    })
    .from(customers)
    .innerJoin(stores, eq(customers.storeId, stores.id))
    .where(storeId ? eq(customers.storeId, storeId) : undefined)
    .orderBy(asc(customers.fullName));
}

export async function getCustomerById(
  customerId: number,
  storeId?: number,
) {
  const records = await db
    .select({
      id: customers.id,
      storeId: customers.storeId,
      fullName: customers.fullName,
      mobile: customers.mobile,
      email: customers.email,
      address: customers.address,
    })
    .from(customers)
    .where(
      storeId
        ? and(
            eq(customers.id, customerId),
            eq(customers.storeId, storeId),
          )
        : eq(customers.id, customerId),
    )
    .limit(1);

  return records[0] ?? null;
}

export async function getCustomerOptions(storeId: number) {
  return db
    .select({ id: customers.id, fullName: customers.fullName })
    .from(customers)
    .where(eq(customers.storeId, storeId))
    .orderBy(asc(customers.fullName));
}
