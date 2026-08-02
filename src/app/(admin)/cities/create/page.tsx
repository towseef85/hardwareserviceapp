import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CityForm } from "@/components/cities/city-form";
import { requirePermission } from "@/lib/authorization";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Add City",
};

export default async function CreateCityPage() {
  const access = await requirePermission("cities", "create");
  if (!access.allowed) redirect("/unauthorized");
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/cities"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Back to Cities
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Add City
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Enter the city information below.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 className="font-semibold text-slate-900">
            City Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Fields marked with an asterisk are required.
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <CityForm />
        </div>
      </div>
    </div>
  );
}
