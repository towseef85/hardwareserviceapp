import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({
  path: ".env.local",
});

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is missing. Add it to your .env.local file.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: [
  "./src/db/schema.ts",
  "./src/db/auth-schema.ts",
],
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});