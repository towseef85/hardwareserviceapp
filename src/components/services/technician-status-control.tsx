"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  updateTechnicianServiceStatusAction,
  type TechnicianStatusActionResult,
} from "@/actions/services";
import type { ServiceStatus } from "@/validations/service";

const nextStatusByCurrent: Partial<
  Record<ServiceStatus, ServiceStatus>
> = {
  created: "working",
  working: "tested",
  tested: "completed",
};

const buttonLabelByStatus: Partial<
  Record<ServiceStatus, string>
> = {
  working: "Start Working",
  tested: "Mark as Tested",
  completed: "Mark as Completed",
};

export function TechnicianStatusControl({
  serviceId,
  currentStatus,
}: {
  serviceId: number;
  currentStatus: ServiceStatus;
}) {
  const router = useRouter();
  const [result, setResult] =
    useState<TechnicianStatusActionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const nextStatus = nextStatusByCurrent[currentStatus];

  function updateStatus() {
    if (!nextStatus) return;

    setResult(null);
    startTransition(async () => {
      const actionResult =
        await updateTechnicianServiceStatusAction(
          serviceId,
          nextStatus,
        );

      setResult(actionResult);

      if (actionResult.success) {
        router.refresh();
      }
    });
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-semibold text-slate-900">
          Technician Workflow
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Current status:{" "}
          <span className="font-medium capitalize text-slate-800">
            {currentStatus}
          </span>
        </p>
        {result && (
          <p
            role={result.success ? "status" : "alert"}
            className={[
              "mt-2 text-sm",
              result.success
                ? "text-emerald-700"
                : "text-red-600",
            ].join(" ")}
          >
            {result.message}
          </p>
        )}
      </div>

      {nextStatus ? (
        <button
          type="button"
          onClick={updateStatus}
          disabled={isPending}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
              Updating...
            </>
          ) : (
            <>
              <CheckCircle2 size={17} />
              {buttonLabelByStatus[nextStatus]}
            </>
          )}
        </button>
      ) : (
        <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
          <CheckCircle2 size={17} />
          {currentStatus === "delivered"
            ? "Service delivered"
            : "Technician work completed"}
        </div>
      )}
    </section>
  );
}
