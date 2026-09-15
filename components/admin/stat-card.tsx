import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

import { cn, formatPercent } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  change: number;
  icon: LucideIcon;
  /** Texto del periodo comparado, ej. "vs. mes anterior". */
  hint?: string;
}

export function StatCard({ label, value, change, icon: Icon, hint }: StatCardProps) {
  const isPositive = change >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-500">
          <Icon className="size-5" />
        </span>

        <span
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
            isPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600",
          )}
        >
          <TrendIcon className="size-3.5" />
          {formatPercent(change)}
        </span>
      </div>

      <p className="mt-5 text-sm font-medium text-ink-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-ink-900">{value}</p>
      {hint ? <p className="mt-2 text-xs text-ink-500">{hint}</p> : null}
    </div>
  );
}
