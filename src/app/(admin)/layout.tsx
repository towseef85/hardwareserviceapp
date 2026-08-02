import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AdminLayout } from "@/components/layout/admin-layout";
import {
  getCurrentUserAccess,
} from "@/lib/current-user";
import { getCurrentUserPermissions } from "@/lib/authorization";
import { navigationItems } from "@/components/layout/navigation-items";

type LayoutProps = {
  children: ReactNode;
};

export default async function Layout({
  children,
}: LayoutProps) {
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

  const permissions = await getCurrentUserPermissions();
  const viewableModules = new Set(
    permissions.filter((permission) => permission.canView).map((permission) => permission.moduleCode),
  );
  const allowedNavigationHrefs = navigationItems
    .filter((item) => !item.moduleCode || viewableModules.has(item.moduleCode))
    .map((item) => item.href);

  return (
    <AdminLayout
      currentUser={{
        name: access.fullName,
        email: access.email,
      }}
      allowedNavigationHrefs={allowedNavigationHrefs}
    >
      {children}
    </AdminLayout>
  );
}
