"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  deleteCityAction,
  type CityActionResult,
} from "@/actions/cities";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { TableContainer } from "@/components/common/table-container";

export type CityListItem = {
  id: number;
  code: string;
  engName: string;
  arbName: string | null;
  createdAt: string;
};

type CitiesTableProps = {
  cities: CityListItem[];
};

export function CitiesTable({
  cities,
}: CitiesTableProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [selectedCity, setSelectedCity] =
    useState<CityListItem | null>(null);

  const [deleteError, setDeleteError] =
    useState<string | null>(null);

  function handleEdit(cityId: number) {
    router.push(`/cities/${cityId}/edit`);
  }

  function openDeleteDialog(city: CityListItem) {
    setDeleteError(null);
    setSelectedCity(city);
  }

  function closeDeleteDialog() {
    if (isPending) {
      return;
    }

    setSelectedCity(null);
    setDeleteError(null);
  }

  function handleDelete() {
    if (!selectedCity) {
      return;
    }

    setDeleteError(null);

    startTransition(async () => {
      const result: CityActionResult =
        await deleteCityAction(selectedCity.id);

      if (!result.success) {
        setDeleteError(result.message);
        return;
      }

      setSelectedCity(null);
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
              <th
                scope="col"
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Code
              </th>

              <th
                scope="col"
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                English Name
              </th>

              <th
                scope="col"
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Arabic Name
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
            {cities.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-14 text-center"
                >
                  <p className="text-sm font-medium text-slate-700">
                    No cities found
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Add your first city to begin managing stores.
                  </p>
                </td>
              </tr>
            ) : (
              cities.map((city) => (
                <tr
                  key={city.id}
                  className="transition-colors hover:bg-slate-50"
                >
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {city.code}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-900">
                    {city.engName}
                  </td>

                  <td
                    dir="rtl"
                    className="whitespace-nowrap px-5 py-4 text-left text-sm text-slate-600"
                  >
                    {city.arbName || "—"}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                    {new Intl.DateTimeFormat("en", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(city.createdAt))}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(city.id)}
                        aria-label={`Edit ${city.engName}`}
                        title="Edit city"
                        className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => openDeleteDialog(city)}
                        aria-label={`Delete ${city.engName}`}
                        title="Delete city"
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

      <ConfirmationDialog
        isOpen={selectedCity !== null}
        title="Delete City"
        description={
          selectedCity
            ? `Are you sure you want to delete ${selectedCity.engName}? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete City"
        isLoading={isPending}
        onConfirm={handleDelete}
        onCancel={closeDeleteDialog}
      />
    </>
  );
}