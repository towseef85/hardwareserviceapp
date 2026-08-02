import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  appUsers,
  cities,
  stores,
} from "@/db/schema";

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
