"use client";

import Link from "next/link";
import { useState } from "react";
import {
  KeyRound,
  Pencil,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { TableContainer } from "@/components/common/table-container";
import { ChangePasswordDialog } from "@/components/users/change-password-dialog";

export type UserListItem = {
  id: number;
  fullName: string;
  username: string;
  hasLoginAccount: boolean;
  email: string;
  contact: string | null;
  storeName: string;
  cityName: string;
  isActive: boolean;
  createdAt: string;
};

type UsersTableProps = {
  users: UserListItem[];
  canManageSecurity: boolean;
};

export function UsersTable({
  users,
  canManageSecurity,
}: UsersTableProps) {
  const [passwordUser, setPasswordUser] =
    useState<UserListItem | null>(null);
  function handleDelete(userId: number) {
    console.log("Delete User:", userId);
  }

  return (
    <>
      <TableContainer>
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th
              scope="col"
              className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Full Name
            </th>

            <th
              scope="col"
              className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Username
            </th>

            <th
              scope="col"
              className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Email
            </th>

            <th
              scope="col"
              className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Contact
            </th>

            <th
              scope="col"
              className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Store
            </th>

            <th
              scope="col"
              className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              City
            </th>

            <th
              scope="col"
              className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Status
            </th>

            <th
              scope="col"
              className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Created
            </th>

            <th
              scope="col"
              className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {users.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                className="px-5 py-14 text-center"
              >
                <p className="text-sm font-medium text-slate-700">
                  No Users found
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Add your first User after authentication is configured.
                </p>
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.id}
                className="transition-colors hover:bg-slate-50"
              >
                <td className="whitespace-nowrap px-5 py-4">
                  <p className="text-sm font-medium text-slate-900">
                    {user.fullName}
                  </p>
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {user.username}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                  <a
                    href={`mailto:${user.email}`}
                    className="transition hover:text-slate-900 hover:underline"
                  >
                    {user.email}
                  </a>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                  {user.contact ? (
                    <a
                      href={`tel:${user.contact.replace(/\s/g, "")}`}
                      className="transition hover:text-slate-900 hover:underline"
                    >
                      {user.contact}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                  {user.storeName}
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                    {user.cityName}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <span
                    className={[
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                      user.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600",
                    ].join(" ")}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                  {new Intl.DateTimeFormat("en", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(user.createdAt))}
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    {canManageSecurity && (
                      <>
                        <Link
                          href={`/users/${user.id}/permissions`}
                          aria-label={`Manage permissions for ${user.fullName}`}
                          title="Manage Permissions"
                          className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <ShieldCheck size={17} />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setPasswordUser(user)}
                          aria-label={`Change password for ${user.fullName}`}
                          title={
                            user.hasLoginAccount
                              ? "Change Password"
                              : "Create Login and Set Password"
                          }
                          className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-amber-50 hover:text-amber-700"
                        >
                          <KeyRound size={17} />
                        </button>
                      </>
                    )}

                    {canManageSecurity && (
                      <Link
                        href={`/users/${user.id}/edit`}
                        aria-label={`Edit ${user.fullName}`}
                        title="Edit User"
                        className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil size={17} />
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(user.id)}
                      aria-label={`Delete ${user.fullName}`}
                      title="Delete User"
                      className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </TableContainer>

      <ChangePasswordDialog
        user={passwordUser}
        onClose={() => setPasswordUser(null)}
      />
    </>
  );
}
