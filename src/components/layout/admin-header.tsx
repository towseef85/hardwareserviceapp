"use client";

import { useState } from "react";
import {
  Bell,
  LogOut,
  Menu,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { useSidebarStore } from "@/stores/use-sidebar-store";

type AdminHeaderProps = {
  currentUser: {
    name: string;
    email: string;
  };
};

export function AdminHeader({
  currentUser,
}: AdminHeaderProps) {
  const router = useRouter();

  const [isSigningOut, setIsSigningOut] =
    useState(false);

  const isCollapsed = useSidebarStore(
    (state) => state.isCollapsed,
  );

  const openMobileSidebar = useSidebarStore(
    (state) => state.openMobileSidebar,
  );

  const initials = currentUser.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  async function handleSignOut() {
    setIsSigningOut(true);

    await authClient.signOut();

    router.replace("/login");
    router.refresh();
  }

  return (
    <header
      className={[
        "fixed right-0 top-0 z-20 h-16 border-b border-slate-200 bg-white/95 backdrop-blur transition-[left] duration-300",
        "left-0 lg:left-64",
        isCollapsed ? "lg:left-20" : "lg:left-64",
      ].join(" ")}
    >
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={openMobileSidebar}
            aria-label="Open sidebar"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >
            <Menu size={21} />
          </button>

          <div className="hidden items-center gap-2 rounded-lg bg-slate-100 px-3 sm:flex sm:w-72">
            <Search
              size={17}
              className="shrink-0 text-slate-400"
            />

            <input
              type="search"
              placeholder="Search..."
              className="h-10 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <p className="truncate text-sm font-medium text-slate-700 sm:hidden">
            Store Admin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="View notifications"
            className="relative flex size-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Bell size={20} />

            <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500" />
          </button>

          <div className="hidden items-center gap-3 rounded-lg px-2 py-1.5 sm:flex">
            <div className="flex size-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              {initials || "U"}
            </div>

            <div className="max-w-40 text-left">
              <p className="truncate text-sm font-medium leading-4 text-slate-800">
                {currentUser.name}
              </p>

              <p className="mt-1 truncate text-xs leading-3 text-slate-500">
                {currentUser.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            aria-label="Sign out"
            title="Sign out"
            className="flex size-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut size={19} />
          </button>
        </div>
      </div>
    </header>
  );
}