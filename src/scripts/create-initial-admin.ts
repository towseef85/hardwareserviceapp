import { eq } from "drizzle-orm";

import { db } from "../db";
import { appUsers } from "../db/schema";
import { auth } from "../lib/auth";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `${name} is missing from the environment variables.`,
    );
  }

  return value;
}

const name = getRequiredEnv("INITIAL_ADMIN_NAME");
const email = getRequiredEnv("INITIAL_ADMIN_EMAIL");
const username = getRequiredEnv(
  "INITIAL_ADMIN_USERNAME",
);
const password = getRequiredEnv(
  "INITIAL_ADMIN_PASSWORD",
);

async function createInitialAdmin() {
  console.log("Creating the initial administrator...");

  const result = await auth.api.signUpEmail({
    body: {
      name,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      displayUsername: username,
      password,
    },
  });

  if (!result.user?.id) {
    throw new Error(
      "Better Auth did not return the created User ID.",
    );
  }

  const normalizedUsername = username.toLowerCase();
  const normalizedEmail = email.toLowerCase();

  const existingProfiles = await db
    .select({
      id: appUsers.id,
    })
    .from(appUsers)
    .where(eq(appUsers.username, normalizedUsername))
    .limit(1);

  if (existingProfiles.length > 0) {
    await db
      .update(appUsers)
      .set({
        fullName: name,
        email: normalizedEmail,
        authUserId: result.user.id,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(appUsers.id, existingProfiles[0].id));

    console.log(
      "Existing application profile linked to Better Auth.",
    );
  } else {
    console.warn(
      "Authentication account was created, but no matching app_users profile exists.",
    );

    console.warn(
      "The application profile will be created during the User management flow.",
    );
  }

  console.log(
    "Initial administrator created successfully.",
  );
  console.log(`Username: ${username}`);
}

createInitialAdmin()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error(
      "Failed to create initial administrator:",
      error,
    );

    process.exit(1);
  });