"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  deleteStoreAction,
  type StoreActionResult,
} from "@/actions/stores";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { TableContainer } from "@/components/common/table-container";

export type StoreListItem = {
  id: number;
  code: string;
  engName: string;
  arbName: string | null;
  cityName: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
};

type StoresTableProps = {
  stores: StoreListItem[];
  canUpdate: boolean;
  canDelete: boolean;
};

export function StoresTable({
  stores,
  canUpdate,
  canDelete,
}: StoresTableProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [selectedStore, setSelectedStore] =
    useState<StoreListItem | null>(null);

  const [deleteError, setDeleteError] =
    useState<string | null>(null);

  function handleEdit(storeId: number) {
    router.push(`/stores/${storeId}/edit`);
  }

  function openDeleteDialog(store: StoreListItem) {
    setDeleteError(null);
    setSelectedStore(store);
  }

  function closeDeleteDialog() {
    if (isPending) {
      return;
    }

    setSelectedStore(null);
    setDeleteError(null);
  }

  function handleDelete() {
    if (!selectedStore) {
      return;
    }

    setDeleteError(null);

    startTransition(async () => {
      const result: StoreActionResult =
        await deleteStoreAction(selectedStore.id);

      if (!result.success) {
        setDeleteError(result.message);
        return;
      }

      setSelectedStore(null);
      router.refresh();
    });
  }

  return (
    <>
      {deleteError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {deleteError}
        </div>
      )}

      <TableContainer>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Code
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Store Name
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Arabic Name
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                City
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Phone
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Created
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {stores.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-14 text-center"
                >
                  <p className="text-sm font-medium text-slate-700">
                    No stores found
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Add your first Store to begin managing users.
                  </p>
                </td>
              </tr>
            ) : (
              stores.map((store) => (
                <tr
                  key={store.id}
                  className="transition-colors hover:bg-slate-50"
                >
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {store.code}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-900">
                    {store.engName}
                  </td>

                  <td
                    dir="rtl"
                    className="whitespace-nowrap px-5 py-4 text-left text-sm text-slate-600"
                  >
                    {store.arbName || "—"}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      {store.cityName}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                    {store.phone || "—"}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                    {store.email ? (
                      <a
                        href={`mailto:${store.email}`}
                        className="transition hover:text-slate-900 hover:underline"
                      >
                        {store.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                    {new Intl.DateTimeFormat("en", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(store.createdAt))}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {canUpdate && <button
                        type="button"
                        onClick={() => handleEdit(store.id)}
                        aria-label={`Edit ${store.engName}`}
                        title="Edit Store"
                        className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil size={17} />
                      </button>}

                      {canDelete && <button
                        type="button"
                        onClick={() => openDeleteDialog(store)}
                        aria-label={`Delete ${store.engName}`}
                        title="Delete Store"
                        className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={17} />
                      </button>}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableContainer>

      <ConfirmationDialog
        isOpen={selectedStore !== null}
        title="Delete Store"
        description={
          selectedStore
            ? `Are you sure you want to delete ${selectedStore.engName}? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete Store"
        isLoading={isPending}
        onConfirm={handleDelete}
        onCancel={closeDeleteDialog}
      />
    </>
  );
}
