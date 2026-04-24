import { PeriodButton } from "@/components/shared/exchange/period-button";
import { MARKET_OVERVIEW_PERIODS } from "@/constants/market-overview/page";
import type { MarketOverviewPeriod } from "@/types/market-overview";

import { MarketOverviewSummaryGrid } from "./market-overview-summary-grid";
import { MarketOverviewTopCards } from "./market-overview-top-cards";

export function MarketOverviewOverviewSection({
  period,
  onPeriodChange,
  lastUpdated,
}: {
  period: MarketOverviewPeriod;
  onPeriodChange: (p: MarketOverviewPeriod) => void;
  lastUpdated: string;
}) {
  return (
    <section>
      <div className="sticky top-0 z-[55] shrink-0 bg-black/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-4 py-4 md:flex-row md:items-end md:justify-between md:px-6 lg:px-8">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Market</span>
              <span className="rounded-lg bg-[#0a0a0a] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                snapshot
              </span>
            </div>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-white md:text-2xl">Обзор рынка</h1>
            <p className="mt-2 font-mono text-[11px] tabular-nums text-zinc-600">Обновлено: {lastUpdated} · mock feed</p>
          </div>
          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">Период</span>
              <div className="flex flex-wrap gap-1.5">
                {MARKET_OVERVIEW_PERIODS.map((p) => (
                  <PeriodButton key={p.id} tone="neutral" active={period === p.id} onClick={() => onPeriodChange(p.id)}>
                    {p.label}
                  </PeriodButton>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MarketOverviewTopCards period={period} />
      <MarketOverviewSummaryGrid period={period} />
    </section>
  );
}
