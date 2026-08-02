export default function CitiesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-28 animate-pulse rounded-md bg-slate-200" />
          <div className="h-4 w-64 animate-pulse rounded-md bg-slate-200" />
        </div>

        <div className="h-10 w-28 animate-pulse rounded-lg bg-slate-200" />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="h-12 animate-pulse border-b border-slate-200 bg-slate-100" />

        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex h-16 items-center gap-6 border-b border-slate-100 px-5 last:border-b-0"
          >
            <div className="h-6 w-14 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}