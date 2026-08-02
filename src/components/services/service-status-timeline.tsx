import { CheckCircle2, Clock3 } from "lucide-react";

import type { ServiceStatus } from "@/validations/service";

type HistoryItem = {
  id: number;
  fromStatus: ServiceStatus | null;
  toStatus: ServiceStatus;
  changedByName: string | null;
  createdAt: Date;
};

export function ServiceStatusTimeline({
  history,
}: {
  history: HistoryItem[];
}) {
  return (
    <section className="w-full rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
        <h2 className="font-semibold text-slate-900">
          Service Timeline
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Status activity and the User responsible for each update.
        </p>
      </div>

      <div className="p-5 sm:p-6">
        {history.length === 0 ? (
          <p className="text-sm text-slate-500">
            No status history is available for this Service.
          </p>
        ) : (
          <ol className="relative space-y-0">
            {history.map((item, index) => {
              const isLast = index === history.length - 1;
              const title = item.fromStatus
                ? `Status changed from ${formatStatus(item.fromStatus)} to ${formatStatus(item.toStatus)}`
                : `Service created with status ${formatStatus(item.toStatus)}`;

              return (
                <li
                  key={item.id}
                  className="relative flex gap-4 pb-7 last:pb-0"
                >
                  {!isLast && (
                    <div className="absolute left-[17px] top-9 h-[calc(100%-1rem)] w-px bg-slate-200" />
                  )}
                  <div className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-4 ring-white">
                    {isLast ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <Clock3 size={17} />
                    )}
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-sm font-semibold text-slate-900">
                      {title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {new Intl.DateTimeFormat("en", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(item.createdAt)}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Updated by {item.changedByName ?? "System"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}

function formatStatus(status: ServiceStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
