import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { CustomerForm } from "@/components/customers/customer-form";
import { getStoreOptions } from "@/data/stores";
import { requirePermission } from "@/lib/authorization";
import { hasRole } from "@/lib/current-user";

export default async function CreateCustomerPage() {
  const access = await requirePermission("customers", "create");
  if (!access.allowed || hasRole(access.user.role, "technician")) redirect("/unauthorized");
  const allStores = await getStoreOptions();
  const storeOptions = hasRole(access.user.role, "admin") ? allStores : allStores.filter((store) => store.id === access.user.storeId);
  return <div className="mx-auto max-w-4xl space-y-6"><Link href="/customers" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600"><ArrowLeft size={17} />Back to Customers</Link><div><h1 className="text-2xl font-bold text-slate-900">Add Customer</h1><p className="mt-1 text-sm text-slate-500">Enter the Customer information below.</p></div><div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><CustomerForm stores={storeOptions} defaultValues={{ storeId: storeOptions.length === 1 ? String(storeOptions[0].id) : "", fullName: "", mobile: "", email: "", address: "" }} /></div></div>;
}
