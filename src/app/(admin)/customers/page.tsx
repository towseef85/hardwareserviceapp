import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { CustomersTable } from "@/components/customers/customers-table";
import { PageHeader } from "@/components/common/page-header";
import { getCustomers } from "@/data/customers";
import { requirePermission } from "@/lib/authorization";
import { hasRole } from "@/lib/current-user";

export const metadata: Metadata = { title: "Customers" };
export default async function CustomersPage() {
  const access = await requirePermission("customers", "view");
  if (!access.allowed) redirect("/unauthorized");
  const storeId = hasRole(access.user.role, "admin") ? undefined : access.user.storeId;
  const records = await getCustomers(storeId);
  return <div className="space-y-6"><PageHeader title="Customers" description="Manage PC shop Customer records." actions={access.permission.canCreate ? <Link href="/customers/create" className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white"><Plus size={18} />Add Customer</Link> : undefined} />
    <CustomersTable customers={records.map((record) => ({ ...record, createdAt: record.createdAt.toISOString() }))} canUpdate={access.permission.canUpdate} canDelete={access.permission.canDelete} /></div>;
}
