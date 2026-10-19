import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { UserEditForm } from "@/components/users/user-edit-form";
import { getCityOptions } from "@/data/cities";
import { getStoreOptions } from "@/data/stores";
import { getUserById } from "@/data/users";
import { requirePermission } from "@/lib/authorization";
import { hasRole } from "@/lib/current-user";

export const metadata: Metadata = { title: "Edit User" };

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission("users", "update");
  if (!access.allowed || !hasRole(access.user.role, "admin")) redirect("/unauthorized");

  const userId = Number((await params).id);
  if (!Number.isInteger(userId) || userId <= 0) notFound();

  const [user, cities, stores] = await Promise.all([
    getUserById(userId),
    getCityOptions(),
    getStoreOptions(),
  ]);
  if (!user) notFound();

  const role = hasRole(user.role, "admin")
    ? "admin"
    : hasRole(user.role, "store-admin")
      ? "store-admin"
      : "technician";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/users" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft size={17} /> Back to Users
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit User</h1>
        <p className="mt-1 text-sm text-slate-500">Update profile, login identity, role, Store, and account status.</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <UserEditForm
          userId={userId}
          cities={cities}
          stores={stores}
          hasLoginAccount={Boolean(user.authUserId)}
          defaultValues={{
            role,
            cityId: String(user.cityId),
            storeId: String(user.storeId),
            fullName: user.fullName,
            contact: user.contact ?? "",
            email: user.email,
            username: user.username,
            isActive: user.isActive,
          }}
        />
      </div>
    </div>
  );
}
