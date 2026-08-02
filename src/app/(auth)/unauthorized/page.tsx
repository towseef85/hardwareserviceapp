import type { Metadata } from "next";
import { UnauthorizedActions } from "@/components/auth/unauthorized-actions";
import { LockKeyhole } from "lucide-react";

export const metadata: Metadata = {
  title: "Access Denied",
};

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-50 text-amber-700">
          <LockKeyhole size={27} />
        </div>

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
          Access Denied
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Your account is valid, but it does not have
          permission to open the administration panel.
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Ask an administrator to review your account role.
        </p>

      <UnauthorizedActions />
      </div>
    </main>
  );
}