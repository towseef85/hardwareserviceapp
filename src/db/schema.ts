import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const cities = pgTable( "cities", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    code: varchar("code", {length: 20}).notNull(),
    engName: varchar("eng_name", {length: 150}).notNull(),
    arbName: varchar("arb_name", {length: 150}),
    createdAt: timestamp("created_at", {withTimezone: true,
        mode: "date"}).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", {withTimezone: true,
      mode: "date"}).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("cities_code_unique_idx").on(table.code),
  ],
);


export const stores = pgTable(
  "stores",
  {
    id: integer("id")
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    code: varchar("code", {
      length: 30,
    }).notNull(),

    engName: varchar("eng_name", {
      length: 150,
    }).notNull(),

    arbName: varchar("arb_name", {
      length: 150,
    }),

    cityId: integer("city_id")
      .notNull()
      .references(() => cities.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    phone: varchar("phone", {
      length: 30,
    }),

    email: varchar("email", {
      length: 255,
    }),

    address: text("address"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("stores_code_unique_idx").on(table.code),

    index("stores_city_id_idx").on(table.cityId),
  ],
);

export const appUsers = pgTable(
  "app_users",
  {
    id: integer("id")
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    fullName: varchar("full_name", {
      length: 150,
    }).notNull(),

    contact: varchar("contact", {
      length: 30,
    }),

    email: varchar("email", {
      length: 255,
    }).notNull(),

    username: varchar("username", {
      length: 100,
    }).notNull(),

    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    authUserId: varchar("auth_user_id", {
      length: 255,
    }),

    isActive: boolean("is_active")
      .default(true)
      .notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("app_users_email_unique_idx").on(
      table.email,
    ),

    uniqueIndex("app_users_username_unique_idx").on(
      table.username,
    ),

    uniqueIndex("app_users_auth_user_id_unique_idx").on(
      table.authUserId,
    ),

    index("app_users_store_id_idx").on(
      table.storeId,
    ),
  ],
);

export const modules = pgTable(
  "modules",
  {
    id: integer("id")
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    code: varchar("code", {
      length: 50,
    }).notNull(),

    name: varchar("name", {
      length: 100,
    }).notNull(),

    description: text("description"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("modules_code_unique_idx").on(
      table.code,
    ),
  ],
);

export const userPermissions = pgTable(
  "user_permissions",
  {
    id: integer("id")
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    appUserId: integer("app_user_id")
      .notNull()
      .references(() => appUsers.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    moduleId: integer("module_id")
      .notNull()
      .references(() => modules.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    canCreate: boolean("can_create")
      .default(false)
      .notNull(),

    canView: boolean("can_view")
      .default(false)
      .notNull(),

    canUpdate: boolean("can_update")
      .default(false)
      .notNull(),

    canDelete: boolean("can_delete")
      .default(false)
      .notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex(
      "user_permissions_app_user_module_unique_idx",
    ).on(table.appUserId, table.moduleId),

    index("user_permissions_module_id_idx").on(
      table.moduleId,
    ),
  ],
);

export const serviceStatusEnum = pgEnum(
  "service_status",
  [
    "created",
    "working",
    "tested",
    "completed",
    "delivered",
  ],
);

export const customers = pgTable(
  "customers",
  {
    id: integer("id")
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    fullName: varchar("full_name", {
      length: 150,
    }).notNull(),
    mobile: varchar("mobile", {
      length: 30,
    }).notNull(),
    email: varchar("email", { length: 255 }),
    address: text("address"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("customers_store_mobile_unique_idx").on(
      table.storeId,
      table.mobile,
    ),
    index("customers_store_id_idx").on(table.storeId),
  ],
);

export const serviceTypes = pgTable(
  "service_types",
  {
    id: integer("id")
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    name: varchar("name", { length: 150 }).notNull(),
    isActive: boolean("is_active")
      .default(true)
      .notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("service_types_store_name_unique_idx").on(
      table.storeId,
      table.name,
    ),
    index("service_types_store_id_idx").on(table.storeId),
  ],
);

export const services = pgTable(
  "services",
  {
    id: integer("id")
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    code: varchar("code", { length: 80 }).notNull(),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    serviceTypeId: integer("service_type_id")
      .notNull()
      .references(() => serviceTypes.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    customerId: integer("customer_id")
      .notNull()
      .references(() => customers.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    description: text("description"),
    status: serviceStatusEnum("status")
      .default("created")
      .notNull(),
    assignedTechnicianId: integer("assigned_technician_id")
      .references(() => appUsers.id, {
        onDelete: "set null",
        onUpdate: "cascade",
      }),
    createdByAppUserId: integer("created_by_app_user_id")
      .notNull()
      .references(() => appUsers.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "date",
    }),
    deliveredAt: timestamp("delivered_at", {
      withTimezone: true,
      mode: "date",
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("services_code_unique_idx").on(table.code),
    index("services_store_id_idx").on(table.storeId),
    index("services_service_type_id_idx").on(
      table.serviceTypeId,
    ),
    index("services_customer_id_idx").on(table.customerId),
    index("services_assigned_technician_id_idx").on(
      table.assignedTechnicianId,
    ),
    index("services_status_idx").on(table.status),
  ],
);

export const serviceStatusHistory = pgTable(
  "service_status_history",
  {
    id: integer("id")
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    fromStatus: serviceStatusEnum("from_status"),
    toStatus: serviceStatusEnum("to_status").notNull(),
    changedByAppUserId: integer("changed_by_app_user_id")
      .references(() => appUsers.id, {
        onDelete: "set null",
        onUpdate: "cascade",
      }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("service_status_history_service_created_idx").on(
      table.serviceId,
      table.createdAt,
    ),
    index("service_status_history_changed_by_idx").on(
      table.changedByAppUserId,
    ),
  ],
);

export type AppUser = typeof appUsers.$inferSelect;
export type NewAppUser = typeof appUsers.$inferInsert;

export type City = typeof cities.$inferSelect;
export type NewCity = typeof cities.$inferInsert;

export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;

export type Module = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;

export type UserPermission =
  typeof userPermissions.$inferSelect;
export type NewUserPermission =
  typeof userPermissions.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export type ServiceType = typeof serviceTypes.$inferSelect;
export type NewServiceType = typeof serviceTypes.$inferInsert;

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type ServiceStatusHistory =
  typeof serviceStatusHistory.$inferSelect;
export type NewServiceStatusHistory =
  typeof serviceStatusHistory.$inferInsert;
