"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import {
  saveUserPermissionsAction,
  type PermissionActionResult,
} from "@/actions/permissions";
import { SubmitButton } from "@/components/common/submit-button";
import type { UserModulePermission } from "@/lib/permissions";

type PermissionFormProps = {
  appUserId: number;
  moduleNames: Record<string, string>;
  defaultPermissions: UserModulePermission[];
};

export function PermissionForm({
  appUserId,
  moduleNames,
  defaultPermissions,
}: PermissionFormProps) {
  const [permissions, setPermissions] = useState(
    defaultPermissions,
  );
  const [result, setResult] =
    useState<PermissionActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function updatePermission(
    moduleCode: UserModulePermission["moduleCode"],
    action: keyof Omit<
      UserModulePermission,
      "moduleCode"
    >,
    checked: boolean,
  ) {
    setPermissions((currentPermissions) =>
      currentPermissions.map((permission) =>
        permission.moduleCode === moduleCode
          ? { ...permission, [action]: checked }
          : permission,
      ),
    );
    setResult(null);
  }

  function handleSubmit() {
    startTransition(async () => {
      const actionResult =
        await saveUserPermissionsAction({
          appUserId,
          permissions,
        });

      setResult(actionResult);
    });
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-6"
    >
      {result && (
        <div
          role={result.success ? "status" : "alert"}
          className={[
            "rounded-lg border px-4 py-3 text-sm",
            result.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700",
          ].join(" ")}
        >
          {result.message}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Module
              </th>
              {[
                "Create",
                "View",
                "Update",
                "Delete",
              ].map((action) => (
                <th
                  key={action}
                  className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {action}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {permissions.map((permission) => (
              <tr key={permission.moduleCode}>
                <td className="px-5 py-4 text-sm font-medium text-slate-900">
                  {moduleNames[permission.moduleCode]}
                </td>
                {(
                  [
                    "canCreate",
                    "canView",
                    "canUpdate",
                    "canDelete",
                  ] as const
                ).map((action) => (
                  <td
                    key={action}
                    className="px-5 py-4 text-center"
                  >
                    <input
                      type="checkbox"
                      checked={permission[action]}
                      onChange={(event) =>
                        updatePermission(
                          permission.moduleCode,
                          action,
                          event.target.checked,
                        )
                      }
                      aria-label={`${moduleNames[permission.moduleCode]} ${action}`}
                      className="size-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <Link
          href="/users"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={() => {
            setPermissions(defaultPermissions);
            setResult(null);
          }}
          disabled={isPending}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          Reset
        </button>
        <SubmitButton
          isSubmitting={isPending}
          label="Save Permissions"
          submittingLabel="Saving..."
        />
      </div>
    </form>
  );
}
