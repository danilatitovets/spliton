"use client";

import { InfoHint } from "@/components/shared/ui/info-hint";
import { useI18n } from "@/components/providers/i18n-provider";
import { tf } from "@/lib/i18n/financial-messages";
import type { MarketOverviewChartsApi, MarketOverviewStatsApi } from "@/services/market-overview.service";
import type { MarketOverviewPeriod } from "@/types/market-overview";

import { MarketOverviewTopCards } from "./market-overview-top-cards";

export function MarketOverviewOverviewSection({
  period,
  lastUpdated,
  live,
  stats,
  charts,
  loading,
}: {
  period: MarketOverviewPeriod;
  onPeriodChange?: (p: MarketOverviewPeriod) => void;
  lastUpdated: string;
  live?: boolean;
  stats?: MarketOverviewStatsApi | null;
  charts?: MarketOverviewChartsApi | null;
  loading?: boolean;
}) {
  const { t } = useI18n();

  return (
    <section className="border-b border-white/[0.06]">
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-5 pb-2 md:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[20px] font-semibold tracking-tight text-white sm:text-[26px]">
                {t("marketOverview.header.title")}
              </h1>
              <InfoHint text={t("marketOverview.info.page")} label={t("marketOverview.info.pageLabel")} />
            </div>
            <div className="mt-1.5 flex flex-col gap-1 text-[11px] text-zinc-500 sm:mt-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:text-[12px]">
              <span className="font-mono tabular-nums text-zinc-400">
                {tf(t("marketOverview.header.updated"), { date: lastUpdated })}
              </span>
              <span className="hidden text-zinc-700 sm:inline">/</span>
              <span>
                {live
                  ? t("marketOverview.header.liveDisclaimerPill")
                  : t("marketOverview.header.demoDisclaimerPill")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <MarketOverviewTopCards period={period} live={live} stats={stats} charts={charts} loading={loading} />
    </section>
  );
}
