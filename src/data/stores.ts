import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { cities, stores } from "@/db/schema";

export async function getStores(storeId?: number) {
  return db
    .select({
      id: stores.id,
      code: stores.code,
      engName: stores.engName,
      arbName: stores.arbName,
      cityName: cities.engName,
      phone: stores.phone,
      email: stores.email,
      createdAt: stores.createdAt,
    })
    .from(stores)
    .innerJoin(
      cities,
      eq(stores.cityId, cities.id),
    )
    .where(storeId ? eq(stores.id, storeId) : undefined)
    .orderBy(asc(stores.engName));
}

export async function getStoreById(
  storeId: number,
  scopeStoreId?: number,
) {
  const storeRecords = await db
    .select({
      id: stores.id,
      code: stores.code,
      engName: stores.engName,
      arbName: stores.arbName,
      cityId: stores.cityId,
      phone: stores.phone,
      email: stores.email,
      address: stores.address,
    })
    .from(stores)
    .where(
      and(
        eq(stores.id, storeId),
        scopeStoreId ? eq(stores.id, scopeStoreId) : undefined,
      ),
    )
    .limit(1);

  return storeRecords[0] ?? null;
}

export async function getStoreOptions() {
  return db
    .select({
      id: stores.id,
      code: stores.code,
      engName: stores.engName,
      cityId: stores.cityId,
    })
    .from(stores)
    .orderBy(asc(stores.engName));
}
