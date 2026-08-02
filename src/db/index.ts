import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as appSchema from "@/db/schema";
import * as authSchema from "@/db/auth-schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is missing. Add it to your .env.local file.",
  );
}

const sql = neon(databaseUrl);

const schema = {
  ...appSchema,
  ...authSchema,
};

export const db = drizzle({
  client: sql,
  schema,
});