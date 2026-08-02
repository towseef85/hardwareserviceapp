import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { PermissionForm } from "@/components/permissions/permission-form";
import {
  getModules,
  getPermissionTargetUser,
} from "@/data/permissions";
import { getEffectivePermissionsForUser } from "@/lib/authorization";
import {
  hasRole,
  requireActiveAdmin,
} from "@/lib/current-user";

export const metadata: Metadata = {
  title: "User Permissions",
};

type UserPermissionsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function UserPermissionsPage({
  params,
}: UserPermissionsPageProps) {
  const access = await requireActiveAdmin();

  if (!access.allowed) {
    redirect("/unauthorized");
  }

  const { id } = await params;
  const appUserId = Number(id);

  if (!Number.isInteger(appUserId) || appUserId <= 0) {
    notFound();
  }

  const [targetUser, moduleRecords] =
    await Promise.all([
      getPermissionTargetUser(appUserId),
      getModules(),
    ]);

  if (!targetUser) {
    notFound();
  }

  const defaultPermissions =
    await getEffectivePermissionsForUser(
      appUserId,
      targetUser.role,
    );

  const isAdministrator = hasRole(
    targetUser.role,
    "admin",
  );
  const moduleNames = Object.fromEntries(
    moduleRecords.map((moduleRecord) => [
      moduleRecord.code,
      moduleRecord.name,
    ]),
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/users"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Back to Users
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          User Permissions
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage module access for {targetUser.fullName} (@{targetUser.username}).
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 className="font-semibold text-slate-900">
            Permission Matrix
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Permissions are denied unless explicitly enabled.
          </p>
        </div>

        <div className="p-5 sm:p-6">
          {isAdministrator ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              Administrators always have full access. Their access cannot be changed through permission rows.
            </div>
          ) : (
            <PermissionForm
              appUserId={appUserId}
              moduleNames={moduleNames}
              defaultPermissions={defaultPermissions}
            />
          )}
        </div>
      </div>
    </div>
  );
}
