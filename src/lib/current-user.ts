import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { appUsers } from "@/db/schema";
import { auth } from "@/lib/auth";

export type CurrentUserAccess =
  | {
      status: "unauthenticated";
    }
  | {
      status: "profile-missing";
      authUserId: string;
      role: string | null;
    }
  | {
      status: "inactive";
      authUserId: string;
      role: string | null;
      profileId: number;
      fullName: string;
    }
  | {
      status: "active";
      authUserId: string;
      role: string | null;
      profileId: number;
      fullName: string;
      email: string;
      username: string;
      storeId: number;
    };

export function hasRole(
  roleValue: string | null | undefined,
  requiredRole: string,
): boolean {
  if (!roleValue) {
    return false;
  }

  return roleValue
    .split(",")
    .map((role) => role.trim().toLowerCase())
    .includes(requiredRole.toLowerCase());
}

export async function getCurrentUserAccess(): Promise<CurrentUserAccess> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      status: "unauthenticated",
    };
  }

  const role =
    "role" in session.user &&
    typeof session.user.role === "string"
      ? session.user.role
      : null;

  const profiles = await db
    .select({
      id: appUsers.id,
      fullName: appUsers.fullName,
      email: appUsers.email,
      username: appUsers.username,
      storeId: appUsers.storeId,
      isActive: appUsers.isActive,
    })
    .from(appUsers)
    .where(eq(appUsers.authUserId, session.user.id))
    .limit(1);

  const profile = profiles[0];

  if (!profile) {
    return {
      status: "profile-missing",
      authUserId: session.user.id,
      role,
    };
  }

  if (!profile.isActive) {
    return {
      status: "inactive",
      authUserId: session.user.id,
      role,
      profileId: profile.id,
      fullName: profile.fullName,
    };
  }

  return {
    status: "active",
    authUserId: session.user.id,
    role,
    profileId: profile.id,
    fullName: profile.fullName,
    email: profile.email,
    username: profile.username,
    storeId: profile.storeId,
  };
}

export type AdminActionAccessResult =
  | {
      allowed: true;
      user: Extract<
        CurrentUserAccess,
        { status: "active" }
      >;
    }
  | {
      allowed: false;
      message: string;
    };

export async function requireActiveAdmin(): Promise<AdminActionAccessResult> {
  const access = await getCurrentUserAccess();

  if (access.status === "unauthenticated") {
    return {
      allowed: false,
      message: "Your session has expired. Sign in again.",
    };
  }

  if (access.status === "inactive") {
    return {
      allowed: false,
      message: "Your account is inactive.",
    };
  }

  if (access.status === "profile-missing") {
    return {
      allowed: false,
      message:
        "Your login is not linked to an application profile.",
    };
  }

  if (!hasRole(access.role, "admin")) {
    return {
      allowed: false,
      message:
        "You do not have permission to perform this action.",
    };
  }

  return {
    allowed: true,
    user: access,
  };
}