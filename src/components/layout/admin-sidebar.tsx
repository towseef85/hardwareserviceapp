"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";

import {
  applicationInfo,
  navigationItems,
} from "@/components/layout/navigation-items";
import { useSidebarStore } from "@/stores/use-sidebar-store";

type SidebarContentProps = {
  isCollapsed?: boolean;
  isMobile?: boolean;
  allowedNavigationHrefs: string[];
};



function SidebarContent({
  isCollapsed = false,
  isMobile = false,
  allowedNavigationHrefs,
}: SidebarContentProps) {
  const pathname = usePathname();

  const closeMobileSidebar = useSidebarStore(
    (state) => state.closeMobileSidebar,
  );

  const AppIcon = applicationInfo.icon;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-slate-200 px-4">
        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-3"
          onClick={isMobile ? closeMobileSidebar : undefined}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
            <AppIcon size={19} />
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {applicationInfo.name}
              </p>

              <p className="truncate text-xs text-slate-500">
                Administration
              </p>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navigationItems.filter((item) => allowedNavigationHrefs.includes(item.href)).map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.title : undefined}
              onClick={isMobile ? closeMobileSidebar : undefined}
              className={[
                "flex h-11 items-center rounded-lg text-sm font-medium transition-colors",
                isCollapsed ? "justify-center px-2" : "gap-3 px-3",
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")}
            >
              <Icon size={19} className="shrink-0" />

              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="border-t border-slate-200 p-4">
          <p className="text-xs text-slate-400">
            Store Administration System
          </p>
        </div>
      )}
    </div>
  );
}

export function AdminSidebar({ allowedNavigationHrefs }: { allowedNavigationHrefs: string[] }) {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const isMobileOpen = useSidebarStore((state) => state.isMobileOpen);
  const toggleCollapsed = useSidebarStore(
    (state) => state.toggleCollapsed,
  );
  const closeMobileSidebar = useSidebarStore(
    (state) => state.closeMobileSidebar,
  );

  return (
    <>
      <aside
        className={[
          "fixed inset-y-0 left-0 z-30 hidden border-r border-slate-200 bg-white transition-[width] duration-300 lg:block",
          isCollapsed ? "w-20" : "w-64",
        ].join(" ")}
      >
        <SidebarContent isCollapsed={isCollapsed} allowedNavigationHrefs={allowedNavigationHrefs} />

        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={
            isCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
          className="absolute -right-3 top-20 flex size-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-900"
        >
          <ChevronLeft
            size={16}
            className={[
              "transition-transform duration-300",
              isCollapsed ? "rotate-180" : "",
            ].join(" ")}
          />
        </button>
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={closeMobileSidebar}
            className="absolute inset-0 bg-slate-950/40"
          />

          <aside className="relative h-full w-72 bg-white shadow-xl">
            <button
              type="button"
              onClick={closeMobileSidebar}
              aria-label="Close sidebar"
              className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X size={20} />
            </button>

            <SidebarContent isMobile allowedNavigationHrefs={allowedNavigationHrefs} />
          </aside>
        </div>
      )}
    </>
  );
}
