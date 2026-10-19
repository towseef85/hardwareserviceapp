import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { StoreForm } from "@/components/stores/store-form";
import { getCityOptions } from "@/data/cities";
import { getStoreById } from "@/data/stores";
import { requirePermission } from "@/lib/authorization";
import { hasRole } from "@/lib/current-user";

type EditStorePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Edit Store",
};

export default async function EditStorePage({
  params,
}: EditStorePageProps) {
  const access = await requirePermission("stores", "update");
  if (!access.allowed) redirect("/unauthorized");
  const { id } = await params;
  const storeId = Number(id);

  if (!Number.isInteger(storeId) || storeId <= 0) {
    notFound();
  }

  const [store, cityOptions] = await Promise.all([
    getStoreById(
      storeId,
      hasRole(access.user.role, "admin")
        ? undefined
        : access.user.storeId,
    ),
    getCityOptions(),
  ]);

  if (!store) {
    notFound();
  }

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
          Edit Store
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update the information for {store.engName}.
        </p>
      </div>

      {cityOptions.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-900">
            No Cities are available
          </h2>

          <p className="mt-1 text-sm text-amber-800">
            At least one City is required to update a
            Store.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="font-semibold text-slate-900">
              Store Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Fields marked with an asterisk are
              required.
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <StoreForm
              mode="edit"
              storeId={store.id}
              cities={cityOptions}
              defaultValues={{
                code: store.code,
                engName: store.engName,
                arbName: store.arbName ?? "",
                cityId: String(store.cityId),
                phone: store.phone ?? "",
                email: store.email ?? "",
                address: store.address ?? "",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
