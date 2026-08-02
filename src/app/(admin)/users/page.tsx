import type { Metadata } from "next";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { UsersTable } from "@/components/users/users-table";
import { getUsers } from "@/data/users";
import { requirePermission } from "@/lib/authorization";
import { redirect } from "next/navigation";
import { hasRole } from "@/lib/current-user";

export const metadata: Metadata = {
  title: "Users",
};

export default async function UsersPage() {
  const access = await requirePermission("users", "view");
  if (!access.allowed) redirect("/unauthorized");
  const userRecords = await getUsers();

  const userList = userRecords.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    hasLoginAccount: Boolean(user.authUserId),
    email: user.email,
    contact: user.contact,
    storeName: user.storeName,
    cityName: user.cityName,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage Users and their assigned Stores."
        actions={
         <Link
  href="/users/create"
  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
>
  <UserPlus size={18} />
  Add User
</Link>
        }
      />

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        User creation will be enabled after Better Auth is configured so passwords are handled securely.
      </div>

      <UsersTable
        users={userList}
        canManageSecurity={hasRole(access.user.role, "admin")}
      />
    </div>
  );
}
