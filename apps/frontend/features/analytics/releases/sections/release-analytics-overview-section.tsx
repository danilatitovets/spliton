"use client";

import { PeriodButton } from "@/components/shared/exchange/period-button";
import { CatalogStatsSkeleton } from "@/features/catalog/ui/catalog-skeleton";
import { releaseAnalyticsPeriodLabel } from "@/lib/analytics/period-label";
import { cn } from "@/lib/utils";
import type { ReleaseAnalyticsOverviewApi } from "@/services/release-analytics.service";
import type { ReleaseAnalyticsPeriod } from "@/types/analytics/releases";

import { YieldDynamicsChart } from "../ui/yield-dynamics-chart";
import { AnalyticsHeaderTip } from "../ui/analytics-header-tip";

const NO_DATA_LABELS = new Set(["Недостаточно данных", "Нет данных", "No data", "Sin datos", "Sem dados"]);

export type ReleaseAnalyticsOverviewStats = {
  totalReleases: string;
  avgYield: string;
  active: string;
  payoutsReleases: string;
  primaryVolume: string;
  payouts: string;
  secondaryVolume: string;
  holders: string;
  listings: string;
  avgProgress: string;
  avgLiquidity: string;
  topVolume: string;
  topVolumeHref?: string;
  topPayouts: string;
  topPayoutsHref?: string;
  payoutLag: string;
};

type ViewTab = "overview" | "rankings" | "trading";

export function ReleaseAnalyticsOverviewSection({
  period,
  onPeriodChange,
  stats,
  overview,
  loading,
  overviewError,
  mockMode,
  onRetry,
  viewTab,
  onViewTab,
}: {
  period: ReleaseAnalyticsPeriod;
  onPeriodChange: (p: ReleaseAnalyticsPeriod) => void;
  stats: ReleaseAnalyticsOverviewStats;
  overview?: ReleaseAnalyticsOverviewApi | null;
  loading?: boolean;
  overviewError?: boolean;
  mockMode?: boolean;
  onRetry?: () => void;
  viewTab: ViewTab;
  onViewTab: (tab: ViewTab) => void;
}) {
  const kpiCards: { label: string; value: string; tip: string; href?: string }[] = [
    {
      label: "Всего релизов",
      value: stats.totalReleases,
      tip: "Число публичных релизов за выбранный период.",
    },
    {
      label: "Активные",
      value: stats.active,
      tip: "Релизы с открытым первичным или вторичным рынком.",
    },
    {
      label: "Ср. доходность",
      value: stats.avgYield,
      tip: "Средняя ожидаемая / фактическая доходность по выборке.",
    },
    {
      label: "Первичный объём",
      value: stats.primaryVolume,
      tip: "Сумма покупок на первичном рынке (USDT).",
    },
    {
      label: "Вторичный объём",
      value: stats.secondaryVolume,
      tip: "Оборот вторичных сделок за период (USDT).",
    },
    {
      label: "Выплаты",
      value: stats.payouts,
      tip: "Начисленные и выплаченные суммы держателям.",
    },
    {
      label: "Холдеры",
      value: stats.holders,
      tip: "Уникальные держатели UNT по активным релизам.",
    },
    {
      label: "Листинги",
      value: stats.listings,
      tip: "Активные заявки на вторичном рынке.",
    },
  ];

  const visibleKpiCards = kpiCards.filter((card) => !NO_DATA_LABELS.has(card.value));

  const tabs: { id: ViewTab; label: string }[] = [
    { id: "overview", label: "Обзор" },
    { id: "rankings", label: "Рейтинги" },
    { id: "trading", label: "Торговые данные" },
  ];

  return (
    <section>
      <div className="sticky top-0 z-[55] shrink-0 border-b border-white/[0.06] bg-black/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-4 py-3 md:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-white md:text-2xl">Аналитика релизов</h1>
              <div className="mt-2 flex flex-wrap items-center gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onViewTab(tab.id)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[12px] font-semibold transition",
                      viewTab === tab.id
                        ? "bg-zinc-200 text-black"
                        : "bg-transparent text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <div className="text-[12px] font-medium text-zinc-500">Период</div>
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
      </div>

      <div className="mx-auto w-full max-w-[1400px] px-4 py-4 md:px-6 lg:px-8">
        {overviewError ? (
          <p className="mb-4 rounded-xl bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
            Метрики временно недоступны
            {onRetry ? (
              <button type="button" className="ml-3 text-zinc-200 underline" onClick={onRetry}>
                Обновить
              </button>
            ) : null}
          </p>
        ) : null}

        {loading ? (
          <CatalogStatsSkeleton />
        ) : visibleKpiCards.length > 0 ? (
          <div className="flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {visibleKpiCards.map((card) => (
              <div key={card.label} className="min-w-[132px] shrink-0 rounded-xl bg-[#141414] px-3.5 py-3">
                <div className="text-[11px] text-zinc-500">
                  <AnalyticsHeaderTip label={card.label} tip={card.tip} />
                </div>
                {card.href ? (
                  <a
                    href={card.href}
                    className="mt-2 block truncate font-mono text-[20px] font-semibold tabular-nums tracking-tight text-white hover:underline"
                  >
                    {card.value}
                  </a>
                ) : (
                  <div className="mt-2 truncate font-mono text-[20px] font-semibold tabular-nums tracking-tight text-white">
                    {card.value}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null}

        {viewTab === "overview" || viewTab === "trading" ? (
          <div className="mt-5 w-full min-w-0">
            <YieldDynamicsChart
              period={period}
              yieldDynamics={overview?.yieldDynamics}
              mockMode={mockMode}
              onRetry={onRetry}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}