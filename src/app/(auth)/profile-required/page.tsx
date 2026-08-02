import type { Metadata } from "next";
import { UserRoundX } from "lucide-react";

import { UnauthorizedActions } from "@/components/auth/unauthorized-actions";

export const metadata: Metadata = {
  title: "Profile Required",
};

export default function ProfileRequiredPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-blue-50 text-blue-700">
          <UserRoundX size={27} />
        </div>

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
          Business Profile Missing
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Your login account exists, but it is not linked
          to an application User profile.
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Ask an administrator to complete the account
          setup.
        </p>

        <UnauthorizedActions />
      </div>
    </main>
  );
}