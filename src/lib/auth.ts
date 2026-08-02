import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import {
  admin,
  username,
} from "better-auth/plugins";

import { db } from "@/db";
import * as authSchema from "@/db/auth-schema";
import {
  authAccessControl,
  authAdminRole,
  authLegacyUserRole,
  authStoreAdminRole,
  authTechnicianRole,
} from "@/lib/auth-permissions";

export const auth = betterAuth({
  appName: "Store Admin",

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),

  emailAndPassword: {
  enabled: true,
  disableSignUp: true,
  minPasswordLength: 8,
  maxPasswordLength: 128,
},

 plugins: [
  username({
    minUsernameLength: 3,
    maxUsernameLength: 30,
  }),

  admin({
    defaultRole: "user",
    ac: authAccessControl,
    roles: {
      admin: authAdminRole,
      "store-admin": authStoreAdminRole,
      technician: authTechnicianRole,
      user: authLegacyUserRole,
    },
  }),
],
});
