export default function UsersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-24 animate-pulse rounded-md bg-slate-200" />
          <div className="h-4 w-72 animate-pulse rounded-md bg-slate-200" />
        </div>

        <div className="h-10 w-28 animate-pulse rounded-lg bg-slate-200" />
      </div>

      <div className="h-12 animate-pulse rounded-lg bg-blue-100" />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="h-12 animate-pulse border-b border-slate-200 bg-slate-100" />

        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex h-16 min-w-[1050px] items-center gap-8 border-b border-slate-100 px-5 last:border-b-0"
          >
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-6 w-20 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}