import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { CityForm } from "@/components/cities/city-form";
import { getCityById } from "@/data/cities";
import { requirePermission } from "@/lib/authorization";

type EditCityPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Edit City",
};

export default async function EditCityPage({
  params,
}: EditCityPageProps) {
  const access = await requirePermission("cities", "update");
  if (!access.allowed) redirect("/unauthorized");
  const { id } = await params;
  const cityId = Number(id);

  if (!Number.isInteger(cityId) || cityId <= 0) {
    notFound();
  }

  const city = await getCityById(cityId);

  if (!city) {
    notFound();
  }

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
          Edit City
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update the information for {city.engName}.
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
          <CityForm
            mode="edit"
            cityId={city.id}
            defaultValues={{
              code: city.code,
              engName: city.engName,
              arbName: city.arbName ?? "",
            }}
          />
        </div>
      </div>
    </div>
  );
}
