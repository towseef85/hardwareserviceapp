import type { Metadata } from "next";
import { Building2 } from "lucide-react";

import { redirect } from "next/navigation";
import {
  getCurrentUserAccess,
  hasRole,
} from "@/lib/current-user";
import { LoginForm } from "@/components/auth/login-form";


export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage() {
  const access = await getCurrentUserAccess();

  if (access.status === "inactive") {
    redirect("/account-disabled");
  }

  if (access.status === "profile-missing") {
    redirect("/profile-required");
  }

  if (
    access.status === "active" &&
    !hasRole(access.role, "admin")
  ) {
    redirect("/unauthorized");
  }

  if (
    access.status === "active" &&
    hasRole(access.role, "admin")
  ) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Building2 size={24} />
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
              Store Admin
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to continue to the administration panel.
            </p>
          </div>

          <LoginForm />
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Authorized Users only
        </p>
      </div>
    </main>
  );
}