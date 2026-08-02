"use client";

import type { ReactNode } from "react";

import { AdminHeader } from "@/components/layout/admin-header";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { useSidebarStore } from "@/stores/use-sidebar-store";

type CurrentUser = {
  name: string;
  email: string;
};

type AdminLayoutProps = {
  children: ReactNode;
  currentUser: CurrentUser;
  allowedNavigationHrefs: string[];
};

export function AdminLayout({
  children,
  currentUser,
  allowedNavigationHrefs,
}: AdminLayoutProps) {
  const isCollapsed = useSidebarStore(
    (state) => state.isCollapsed,
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar allowedNavigationHrefs={allowedNavigationHrefs} />

      <AdminHeader currentUser={currentUser} />

      <main
        className={[
          "min-h-screen pt-16 transition-[padding] duration-300",
          "pl-0 lg:pl-64",
          isCollapsed ? "lg:pl-20" : "lg:pl-64",
        ].join(" ")}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
