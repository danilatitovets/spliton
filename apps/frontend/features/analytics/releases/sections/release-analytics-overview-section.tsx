"use client";

import { AnalyticsStatCard } from "@/components/shared/analytics/analytics-stat-card";
import { PeriodButton } from "@/components/shared/exchange/period-button";
import { releaseAnalyticsPeriodLabel } from "@/lib/analytics/period-label";
import type { ReleaseAnalyticsPeriod } from "@/types/analytics/releases";

import { YieldDynamicsChart } from "../ui/yield-dynamics-chart";

type Stats = {
  avgYield: string;
  active: string;
  payouts: string;
  payoutLag: string;
};

export function ReleaseAnalyticsOverviewSection({
  period,
  onPeriodChange,
  stats,
}: {
  period: ReleaseAnalyticsPeriod;
  onPeriodChange: (p: ReleaseAnalyticsPeriod) => void;
  stats: Stats;
}) {
  return (
    <section>
      <div className="sticky top-0 z-[55] shrink-0 bg-black/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-4 py-4 md:flex-row md:items-end md:justify-between md:px-6 lg:px-8">
          <div className="min-w-0">
            
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-white md:text-2xl">Аналитика релизов</h1>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Период</div>
            <div className="flex flex-wrap gap-1.5">
              {(["7d", "30d", "90d", "all"] as const).map((p) => (
                <PeriodButton key={p} tone="neutral" active={period === p} onClick={() => onPeriodChange(p)}>
                  {releaseAnalyticsPeriodLabel(p)}
                </PeriodButton>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1400px] px-4 py-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <AnalyticsStatCard label="Средняя доходность" value={stats.avgYield} />
          <AnalyticsStatCard label="Активные релизы" value={stats.active} />
          <AnalyticsStatCard label="Объём выплат" value={stats.payouts} />
          <AnalyticsStatCard label="Средний срок выплат" value={stats.payoutLag} />
        </div>

        <div className="mt-5 w-full">
          <div className="flex items-start justify-between gap-3 px-0.5">
            <h2 className="font-mono text-sm font-semibold tracking-tight text-white">Динамика доходности</h2>
            <div className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              {releaseAnalyticsPeriodLabel(period)}
            </div>
          </div>
          <div className="mt-3 w-full min-w-0">
            <YieldDynamicsChart period={period} />
          </div>
        </div>
      </div>
    </section>
  );
}
