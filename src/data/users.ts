import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  appUsers,
  cities,
  stores,
} from "@/db/schema";
import { user as authUsers } from "@/db/auth-schema";

export async function getUsers() {
  return db
    .select({
      id: appUsers.id,
      fullName: appUsers.fullName,
      contact: appUsers.contact,
      email: appUsers.email,
      username: appUsers.username,
      authUserId: appUsers.authUserId,
      isActive: appUsers.isActive,
      storeName: stores.engName,
      cityName: cities.engName,
      createdAt: appUsers.createdAt,
    })
    .from(appUsers)
    .innerJoin(
      stores,
      eq(appUsers.storeId, stores.id),
    )
    .innerJoin(
      cities,
      eq(stores.cityId, cities.id),
    )
    .orderBy(asc(appUsers.fullName));
}

export async function getUserById(userId: number) {
  const records = await db
    .select({
      id: appUsers.id,
      fullName: appUsers.fullName,
      contact: appUsers.contact,
      email: appUsers.email,
      username: appUsers.username,
      storeId: appUsers.storeId,
      cityId: stores.cityId,
      authUserId: appUsers.authUserId,
      role: authUsers.role,
      isActive: appUsers.isActive,
    })
    .from(appUsers)
    .innerJoin(stores, eq(appUsers.storeId, stores.id))
    .leftJoin(authUsers, eq(appUsers.authUserId, authUsers.id))
    .where(eq(appUsers.id, userId))
    .limit(1);

  return records[0] ?? null;
}
