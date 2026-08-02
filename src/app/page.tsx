import { redirect } from "next/navigation";

import {
  getCurrentUserAccess,
  hasRole,
} from "@/lib/current-user";

export default async function HomePage() {
  const access = await getCurrentUserAccess();

  if (access.status === "unauthenticated") {
    redirect("/login");
  }

  if (access.status === "inactive") {
    redirect("/account-disabled");
  }

  if (access.status === "profile-missing") {
    redirect("/profile-required");
  }

  if (!hasRole(access.role, "admin")) {
    redirect("/unauthorized");
  }

  redirect("/dashboard");
}