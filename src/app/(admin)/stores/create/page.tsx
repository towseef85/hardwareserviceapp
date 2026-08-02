import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { StoreForm } from "@/components/stores/store-form";
import { getCityOptions } from "@/data/cities";
import { requirePermission } from "@/lib/authorization";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Add Store",
};

export default async function CreateStorePage() {
  const access = await requirePermission("stores", "create");
  if (!access.allowed) redirect("/unauthorized");
  const cityOptions = await getCityOptions();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/stores"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Back to Stores
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Add Store
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Enter the Store information and assign it to a City.
        </p>
      </div>

      {cityOptions.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-900">
            No Cities are available
          </h2>

          <p className="mt-1 text-sm text-amber-800">
            Create at least one City before adding a Store.
          </p>

          <Link
            href="/cities/create"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-amber-900 px-4 text-sm font-medium text-white transition hover:bg-amber-800"
          >
            Add City
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="font-semibold text-slate-900">
              Store Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Fields marked with an asterisk are required.
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <StoreForm cities={cityOptions} />
          </div>
        </div>
      )}
    </div>
  );
}
