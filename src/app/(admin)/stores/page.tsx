import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { StoresTable } from "@/components/stores/stores-table";
import { getStores } from "@/data/stores";
import { requirePermission } from "@/lib/authorization";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Stores",
};

export default async function StoresPage() {
  const access = await requirePermission("stores", "view");
  if (!access.allowed) redirect("/unauthorized");
  const storeRecords = await getStores();

  const storeList = storeRecords.map((store) => ({
    id: store.id,
    code: store.code,
    engName: store.engName,
    arbName: store.arbName,
    cityName: store.cityName,
    phone: store.phone,
    email: store.email,
    createdAt: store.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stores"
        description="Manage Stores and their assigned Cities."
        actions={
          <Link
            href="/stores/create"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            <Plus size={18} />
            Add Store
          </Link>
        }
      />

      <StoresTable stores={storeList} />
    </div>
  );
}
