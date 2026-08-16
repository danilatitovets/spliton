"use client";

import { InfoHint } from "@/components/shared/ui/info-hint";
import { useI18n } from "@/components/providers/i18n-provider";
import { tf } from "@/lib/i18n/financial-messages";
import { formatUsdtCompact } from "@/lib/market-overview/format";
import type { MarketOverviewDepthApi, MarketOverviewStatsApi } from "@/services/market-overview.service";
import type { MarketOverviewPeriod } from "@/types/market-overview";

function fmtUsdt(value: string | number | null | undefined): string {
  if (value == null || value === "") return "$0";
  const n = Number.parseFloat(String(value));
  if (!Number.isFinite(n) || n <= 0) return "$0";
  return `$${formatUsdtCompact(n)}`;
}

function fmtCount(value: number | null | undefined): string {
  if (value == null || value <= 0) return "0";
  return String(value);
}

function periodVolume(
  period: MarketOverviewPeriod,
  stats: MarketOverviewStatsApi | null | undefined,
): string | number | null | undefined {
  const sm = stats?.secondaryMarket;
  if (period === "24h") return sm?.volume24hUsdt ?? stats?.totals?.totalVolume24hUsdt;
  if (period === "7d") return sm?.volume7dUsdt;
  if (period === "30d") return sm?.volume30dUsdt;
  return sm?.volumeUsdt;
}

function periodTrades(
  period: MarketOverviewPeriod,
  stats: MarketOverviewStatsApi | null | undefined,
  depth: MarketOverviewDepthApi | null | undefined,
): number | null {
  if (period === "24h") return depth?.tradesCount24h ?? stats?.secondaryMarket?.tradesCount ?? null;
  if (period === "7d") return depth?.tradesCount7d ?? null;
  return depth?.tradesCount7d ?? stats?.secondaryMarket?.tradesCount ?? null;
}

export function MarketOverviewKpiSection({
  live,
  period = "7d",
  stats,
  depth,
  loading,
  error,
}: {
  live?: boolean;
  period?: MarketOverviewPeriod;
  stats?: MarketOverviewStatsApi | null;
  depth?: MarketOverviewDepthApi | null;
  loading?: boolean;
  error?: boolean;
}) {
  const { t } = useI18n();
  if (!live) return null;

  if (loading && !stats) {
    return (
      <div className="mx-auto mt-3 flex w-full max-w-[1400px] gap-2.5 overflow-x-auto px-4 pb-1 md:px-6 lg:px-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[76px] min-w-[148px] shrink-0 animate-pulse rounded-xl bg-[#141414]" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-3 w-full max-w-[1400px] px-4 md:px-6 lg:px-8">
        <p className="rounded-xl bg-rose-950/40 px-4 py-3 text-sm text-rose-100 ring-1 ring-rose-500/30">
          {t("marketOverview.kpi.unavailable")}
        </p>
      </div>
    );
  }

  const sm = stats?.secondaryMarket;
  const periodLabel = t(`marketOverview.period.${period}`);

  const cards = [
    {
      label: `${t("marketOverview.kpi.volume")} · ${periodLabel}`,
      value: fmtUsdt(periodVolume(period, stats)),
      delta: tf(t("marketOverview.kpi.periodDelta7d"), { value: fmtUsdt(sm?.volume7dUsdt) }),
      positive: true as boolean | null,
      hint: t("marketOverview.info.volume"),
    },
    {
      label: t("marketOverview.kpi.activeListings"),
      value: fmtCount(sm?.activeListings ?? depth?.activeListings),
      delta: t("marketOverview.kpi.onSecondary"),
      positive: null as boolean | null,
      hint: t("marketOverview.info.listings"),
    },
    {
      label: `${t("marketOverview.kpi.trades")} · ${periodLabel}`,
      value: fmtCount(periodTrades(period, stats, depth)),
      delta: period === "24h"
        ? tf(t("marketOverview.kpi.periodDelta7d"), { value: fmtCount(depth?.tradesCount7d) })
        : undefined,
      positive: null as boolean | null,
      hint: t("marketOverview.info.trades"),
    },
  ];

  return (
    <div className="mx-auto mt-3 w-full max-w-[1400px] px-4 md:px-6 lg:px-8">
      <div className="flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {cards.map((c) => (
          <div key={c.label} className="min-w-[148px] shrink-0 rounded-xl bg-[#141414] px-3.5 py-3">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] text-zinc-500">{c.label}</p>
              <InfoHint text={c.hint} size="sm" />
            </div>
            <p className="mt-1 font-mono text-[15px] font-semibold tabular-nums text-white">{c.value}</p>
            {c.delta && c.delta !== "0" && c.delta !== "$0" ? (
              <p
                className={
                  c.positive === true
                    ? "mt-0.5 font-mono text-[11px] tabular-nums text-[#B7F500]"
                    : "mt-0.5 text-[11px] text-zinc-600"
                }
              >
                {c.delta}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
