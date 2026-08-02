import type { Metadata } from "next";
import { ShieldX } from "lucide-react";

import { DisabledAccountCard } from '@/components/auth/disabled-account-card'

export const metadata: Metadata = {
  title: "Account Disabled",
};

export default function AccountDisabledPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <ShieldX size={28} />
        </div>

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
          Account Disabled
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Your account is currently inactive and cannot
          access this application.
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Contact an administrator if you believe this is
          a mistake.
        </p>

        <DisabledAccountCard />
      </div>
    </main>
  );
}