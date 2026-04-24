import type { ReleaseDetailPageData, ReleaseDetailQuickStat } from "@/types/analytics/release-detail";
import { cn } from "@/lib/utils";

export function ReleaseDetailStatsRow({
  data,
  stats,
}: {
  data: ReleaseDetailPageData;
  /** Если задано — показываем только эти метрики (например компактная сводка на странице лота). */
  stats?: ReleaseDetailQuickStat[];
}) {
  const items = stats ?? data.quickStats;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((s) => (
        <div
          key={s.label}
          className="flex min-h-0 min-w-0 flex-col gap-3 rounded-xl bg-[#111111] px-4 py-4 ring-1 ring-white/6 transition-colors hover:bg-white/4 hover:ring-white/9"
        >
          <div className="flex min-w-0 items-start justify-between gap-2">
            <p className="min-w-0 flex-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500 leading-relaxed">
              {s.label}
            </p>
            {s.info ? (
              <button
                type="button"
                title={s.info}
                aria-label={`Справка: ${s.label}. ${s.info}`}
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border border-zinc-600/90",
                  "font-serif text-[11px] font-semibold italic leading-none text-zinc-500",
                  "cursor-help transition-colors hover:border-zinc-500 hover:text-zinc-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25",
                )}
              >
                i
              </button>
            ) : null}
          </div>
          <p className="min-w-0 shrink-0 wrap-break-word font-mono text-[15px] font-semibold leading-normal tabular-nums text-white sm:text-base">
            {s.value}
          </p>
          {s.sub ? (
            <p className="shrink-0 text-[11px] leading-relaxed text-zinc-500">{s.sub}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
