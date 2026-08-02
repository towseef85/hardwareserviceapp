import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { CitiesTable } from "@/components/cities/cities-table";
import { PageHeader } from "@/components/common/page-header";
import { getCities } from "@/data/cities";
import { requirePermission } from "@/lib/authorization";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Cities",
};

export default async function CitiesPage() {
  const access = await requirePermission("cities", "view");
  if (!access.allowed) redirect("/unauthorized");
  const cityRecords = await getCities();

  const cityList = cityRecords.map((city) => ({
    id: city.id,
    code: city.code,
    engName: city.engName,
    arbName: city.arbName,
    createdAt: city.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cities"
        description="Manage the cities available in the system."
        actions={
          <Link
            href="/cities/create"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            <Plus size={18} />
            Add City
          </Link>
        }
      />

      <CitiesTable cities={cityList} />
    </div>
  );
}
