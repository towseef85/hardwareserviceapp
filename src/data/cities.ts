import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { cities } from "@/db/schema";

export async function getCities() {
  return db
    .select({
      id: cities.id,
      code: cities.code,
      engName: cities.engName,
      arbName: cities.arbName,
      createdAt: cities.createdAt,
    })
    .from(cities)
    .orderBy(asc(cities.engName));
}

export async function getCityOptions() {
  return db
    .select({
      id: cities.id,
      code: cities.code,
      engName: cities.engName,
    })
    .from(cities)
    .orderBy(asc(cities.engName));
}

export async function getCityById(cityId: number) {
  const cityRecords = await db
    .select({
      id: cities.id,
      code: cities.code,
      engName: cities.engName,
      arbName: cities.arbName,
    })
    .from(cities)
    .where(eq(cities.id, cityId))
    .limit(1);

  return cityRecords[0] ?? null;
}