"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { deleteCustomerAction } from "@/actions/customers";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { TableContainer } from "@/components/common/table-container";

type Item = { id: number; fullName: string; mobile: string; email: string | null; storeName: string; createdAt: string };
export function CustomersTable({ customers, canUpdate, canDelete }: { customers: Item[]; canUpdate: boolean; canDelete: boolean }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  function remove() { if (!selected) return; startTransition(async () => { const result = await deleteCustomerAction(selected.id); if (!result.success) return setError(result.message); setSelected(null); router.refresh(); }); }
  return <>
    {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    <TableContainer><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr>{["Customer", "Mobile", "Email", "Store", "Created", "Actions"].map((h) => <th key={h} className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${h === "Actions" ? "text-right" : "text-left"}`}>{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-100 bg-white">{customers.length === 0 ? <tr><td colSpan={6} className="px-5 py-14 text-center text-sm text-slate-500">No Customers found.</td></tr> : customers.map((customer) => <tr key={customer.id} className="hover:bg-slate-50">
        <td className="px-5 py-4 text-sm font-medium text-slate-900">{customer.fullName}</td><td className="px-5 py-4 text-sm text-slate-600">{customer.mobile}</td><td className="px-5 py-4 text-sm text-slate-600">{customer.email ?? "—"}</td><td className="px-5 py-4 text-sm text-slate-600">{customer.storeName}</td><td className="px-5 py-4 text-sm text-slate-500">{new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(customer.createdAt))}</td>
        <td className="px-5 py-4"><div className="flex justify-end gap-1">{canUpdate && <Link href={`/customers/${customer.id}/edit`} className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600"><Pencil size={17} /></Link>}{canDelete && <button type="button" onClick={() => { setError(null); setSelected(customer); }} className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={17} /></button>}</div></td>
      </tr>)}</tbody></table></TableContainer>
    <ConfirmationDialog isOpen={Boolean(selected)} title="Delete Customer" description={selected ? `Delete ${selected.fullName}?` : ""} confirmLabel="Delete Customer" isLoading={pending} onConfirm={remove} onCancel={() => !pending && setSelected(null)} />
  </>;
}
