import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type SummaryCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;
  href?: string;
  subtitle?: string;
};

export function SummaryCard({
  title,
  value,
  icon: Icon,
  href,
  subtitle,
}: SummaryCardProps) {
  const content = (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>
        <p className="mt-2 text-3xl font-bold text-slate-900">
          {value}
        </p>
        {subtitle && (
          <p className="mt-2 truncate text-xs text-slate-500">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        <Icon size={22} />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {content}
    </div>
  );
}
