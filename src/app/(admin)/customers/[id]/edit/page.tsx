import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { CustomerForm } from "@/components/customers/customer-form";
import { getCustomerById } from "@/data/customers";
import { getStoreOptions } from "@/data/stores";
import { requirePermission } from "@/lib/authorization";
import { hasRole } from "@/lib/current-user";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission("customers", "update");
  if (!access.allowed || hasRole(access.user.role, "technician")) redirect("/unauthorized");
  const id = Number((await params).id); if (!Number.isInteger(id) || id <= 0) notFound();
  const scopedStoreId = hasRole(access.user.role, "admin") ? undefined : access.user.storeId;
  const [customer, allStores] = await Promise.all([getCustomerById(id, scopedStoreId), getStoreOptions()]);
  if (!customer) notFound();
  const stores = hasRole(access.user.role, "admin") ? allStores : allStores.filter((store) => store.id === access.user.storeId);
  return <div className="mx-auto max-w-4xl space-y-6"><Link href="/customers" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600"><ArrowLeft size={17} />Back to Customers</Link><div><h1 className="text-2xl font-bold text-slate-900">Edit Customer</h1></div><div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><CustomerForm stores={stores} mode="edit" customerId={id} defaultValues={{ storeId: String(customer.storeId), fullName: customer.fullName, mobile: customer.mobile, email: customer.email ?? "", address: customer.address ?? "" }} /></div></div>;
}
