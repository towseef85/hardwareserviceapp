import { eq, inArray } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { user as authUsers } from "./auth-schema";

import {
  appUsers,
  cities,
  modules,
  stores,
} from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is missing. Add it to your .env.local file.",
  );
}

const sql = neon(databaseUrl);
const db = drizzle(sql);

const moduleSeedData = [
  {
    code: "cities",
    name: "Cities",
    description: "Manage City records.",
  },
  {
    code: "stores",
    name: "Stores",
    description: "Manage Store records.",
  },
  {
    code: "users",
    name: "Users",
    description: "Manage User records.",
  },
  {
    code: "customers",
    name: "Customers",
    description: "Manage repair-shop Customer records.",
  },
  {
    code: "service-types",
    name: "Service Types",
    description: "Manage the repair services offered by a Store.",
  },
  {
    code: "services",
    name: "Services",
    description: "Manage repair jobs and technician assignments.",
  },
];

const citySeedData = [
  {
    code: "RUH",
    engName: "Riyadh",
    arbName: "الرياض",
  },
  {
    code: "JED",
    engName: "Jeddah",
    arbName: "جدة",
  },
  {
    code: "DMM",
    engName: "Dammam",
    arbName: "الدمام",
  },
];

async function seedModules() {
  console.log("Seeding permission modules...");

  for (const moduleData of moduleSeedData) {
    await db
      .insert(modules)
      .values(moduleData)
      .onConflictDoUpdate({
        target: modules.code,
        set: {
          name: moduleData.name,
          description: moduleData.description,
          updatedAt: new Date(),
        },
      });
  }

  console.log("Permission module seed completed.");
}

async function seedCities() {
  console.log("Seeding cities...");

  await db
    .insert(cities)
    .values(citySeedData)
    .onConflictDoNothing({
      target: cities.code,
    });

  console.log("City seed completed.");
}

async function seedStores() {
  console.log("Seeding stores...");

  const requiredCities = await db
    .select({
      id: cities.id,
      code: cities.code,
    })
    .from(cities)
    .where(
      inArray(cities.code, ["RUH", "JED", "DMM"]),
    );

  const cityIdByCode = new Map(
    requiredCities.map((city) => [
      city.code,
      city.id,
    ]),
  );

  const riyadhCityId = cityIdByCode.get("RUH");
  const jeddahCityId = cityIdByCode.get("JED");
  const dammamCityId = cityIdByCode.get("DMM");

  if (
    !riyadhCityId ||
    !jeddahCityId ||
    !dammamCityId
  ) {
    throw new Error(
      "Required City seed data is missing. Seed Cities before Stores.",
    );
  }

  const storeSeedData = [
    {
      code: "STR-RUH-01",
      engName: "Riyadh Main Store",
      arbName: "فرع الرياض الرئيسي",
      cityId: riyadhCityId,
      phone: "+966 11 000 0001",
      email: "riyadh@example.com",
      address: "King Fahd Road, Riyadh",
    },
    {
      code: "STR-RUH-02",
      engName: "Riyadh North Store",
      arbName: "فرع شمال الرياض",
      cityId: riyadhCityId,
      phone: "+966 11 000 0002",
      email: "riyadh.north@example.com",
      address: "Northern Ring Road, Riyadh",
    },
    {
      code: "STR-JED-01",
      engName: "Jeddah Main Store",
      arbName: "فرع جدة الرئيسي",
      cityId: jeddahCityId,
      phone: "+966 12 000 0001",
      email: "jeddah@example.com",
      address: "Prince Sultan Road, Jeddah",
    },
    {
      code: "STR-DMM-01",
      engName: "Dammam Main Store",
      arbName: "فرع الدمام الرئيسي",
      cityId: dammamCityId,
      phone: "+966 13 000 0001",
      email: "dammam@example.com",
      address: "King Saud Street, Dammam",
    },
  ];

  await db
    .insert(stores)
    .values(storeSeedData)
    .onConflictDoNothing({
      target: stores.code,
    });

  console.log("Store seed completed.");
}

async function seedUsers() {
  console.log("Seeding Users...");

  const requiredStores = await db
    .select({
      id: stores.id,
      code: stores.code,
    })
    .from(stores)
    .where(
      inArray(stores.code, [
        "STR-RUH-01",
        "STR-JED-01",
        "STR-DMM-01",
      ]),
    );

  const storeIdByCode = new Map(
    requiredStores.map((store) => [
      store.code,
      store.id,
    ]),
  );

  const riyadhStoreId =
    storeIdByCode.get("STR-RUH-01");

  const jeddahStoreId =
    storeIdByCode.get("STR-JED-01");

  const dammamStoreId =
    storeIdByCode.get("STR-DMM-01");

  if (
    !riyadhStoreId ||
    !jeddahStoreId ||
    !dammamStoreId
  ) {
    throw new Error(
      "Required Store seed data is missing. Seed Stores before Users.",
    );
  }

  const userSeedData = [
    {
      fullName: "Ahmed Ali",
      contact: "+966 50 000 0001",
      email: "ahmed@example.com",
      username: "ahmed",
      storeId: riyadhStoreId,
      isActive: true,
    },
    {
      fullName: "Sara Mohammed",
      contact: "+966 50 000 0002",
      email: "sara@example.com",
      username: "sara",
      storeId: jeddahStoreId,
      isActive: true,
    },
    {
      fullName: "Omar Hassan",
      contact: "+966 50 000 0003",
      email: "omar@example.com",
      username: "omar",
      storeId: dammamStoreId,
      isActive: true,
    },
  ];

  await db
    .insert(appUsers)
    .values(userSeedData)
    .onConflictDoNothing({
      target: appUsers.username,
    });

  console.log("User seed completed.");
}

async function seedInitialAdminProfile() {
  console.log("Seeding initial administrator profile...");

  const adminAuthUsers = await db
    .select({
      id: authUsers.id,
    })
    .from(authUsers)
    .where(eq(authUsers.email, "admin@example.com"))
    .limit(1);

  const adminAuthUser = adminAuthUsers[0];

  if (!adminAuthUser) {
    console.warn(
      "Better Auth administrator does not exist. Skipping application administrator profile seed.",
    );

    return;
  }

  const adminStores = await db
    .select({
      id: stores.id,
    })
    .from(stores)
    .where(eq(stores.code, "STR-RUH-01"))
    .limit(1);

  const adminStore = adminStores[0];

  if (!adminStore) {
    throw new Error(
      "Store STR-RUH-01 was not found. Cannot seed the administrator profile.",
    );
  }

  await db
    .insert(appUsers)
    .values({
      fullName: "System Administrator",
      contact: null,
      email: "admin@example.com",
      username: "admin",
      storeId: adminStore.id,
      authUserId: adminAuthUser.id,
      isActive: true,
    })
    .onConflictDoNothing({
      target: appUsers.username,
    });

  await db
    .update(appUsers)
    .set({
      fullName: "System Administrator",
      email: "admin@example.com",
      authUserId: adminAuthUser.id,
      isActive: true,
      updatedAt: new Date(),
    })
    .where(eq(appUsers.username, "admin"));

  console.log(
    "Initial administrator profile seed completed.",
  );
}

async function runSeed() {
  await seedModules();
  await seedCities();
  await seedStores();
  await seedUsers();
    await seedInitialAdminProfile();
}

runSeed()
  .then(() => {
    console.log(
      "Database seeding finished successfully.",
    );

    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error(
      "Database seeding failed:",
      error,
    );

    process.exit(1);
  });
