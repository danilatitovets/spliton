"use client";

import * as React from "react";

import { useI18n } from "@/components/providers/i18n-provider";
import { MarketOverviewProChart } from "@/components/market-overview/ui/market-overview-pro-chart";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import {
  MARKET_SECONDARY_SNAPSHOT,
  MARKET_TOP_CARD_METRICS,
} from "@/constants/market-overview/page";
import { ROUTES } from "@/constants/routes";
import { isNoiseCatalogGenre } from "@/lib/catalog/is-noise-catalog-item";
import { resolveChartSeries } from "@/lib/market-overview/chart-series";
import { formatUsdtCompact } from "@/lib/market-overview/format";
import { mapSecondaryLiveSnapshot } from "@/lib/market-overview/market-overview-live-mappers";
import { cn } from "@/lib/utils";
import type {
  MarketOverviewChartsApi,
  MarketOverviewStatsApi,
} from "@/services/market-overview.service";
import type { MarketOverviewPeriod } from "@/types/market-overview";

function seriesNums(points?: { value: string | number }[]) {
  return (points ?? []).map((p) => Number(p.value) || 0);
}

function seriesDeltaPct(points: number[]): string {
  if (points.length < 2) return "±0%";
  const first = points[0]!;
  const last = points[points.length - 1]!;
  if (first === 0) return last > 0 ? "+100%" : "±0%";
  const pct = ((last - first) / Math.abs(first)) * 100;
  if (Math.abs(pct) < 0.05) return "±0%";
  return `${pct > 0 ? "+" : ""}${pct.toFixed(1).replace(".", ",")}%`;
}

function periodVolumeRaw(stats: MarketOverviewStatsApi | null | undefined, period: MarketOverviewPeriod): number {
  if (!stats) return 0;
  const raw =
    period === "24h"
      ? stats.secondaryMarket?.volume24hUsdt ?? stats.totals?.totalVolume24hUsdt
      : period === "7d"
        ? stats.secondaryMarket?.volume7dUsdt ?? stats.totals?.totalVolume7dUsdt
        : period === "30d"
          ? stats.secondaryMarket?.volume30dUsdt ?? stats.totals?.totalVolume30dUsdt
          : stats.secondaryMarket?.volumeUsdt ?? stats.totals?.totalVolumeUsdt;
  return Number.parseFloat(String(raw ?? 0)) || 0;
}

function deepSharePct(stats: MarketOverviewStatsApi | null | undefined): number {
  if (!stats) return 0;
  const liq = stats.distributions?.liquidity ?? [];
  const high = liq.find((l) => {
    const n = l.label.trim().toLowerCase();
    return n === "высокая" || n === "high" || n === "deep";
  })?.count ?? 0;
  const total = liq.reduce((s, l) => s + l.count, 0);
  if (total === 0) return 0;
  return Math.round((high / total) * 100);
}

function CardShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-2xl bg-[#141414] p-4 sm:p-5",
        className,
      )}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function MarketOverviewDepthDashboard({
  live,
  period,
  stats,
  charts,
  loading,
}: {
  live?: boolean;
  period: MarketOverviewPeriod;
  stats?: MarketOverviewStatsApi | null;
  charts?: MarketOverviewChartsApi | null;
  loading?: boolean;
}) {
  const { locale, t } = useI18n();

  const demo = MARKET_TOP_CARD_METRICS[period];
  const useDemoSeries = !live || !charts;

  const volumeSeries = React.useMemo(() => {
    const fromApi = seriesNums(charts?.series?.volume);
    return resolveChartSeries(fromApi, Number(demo.activeCount) || 40, "wave");
  }, [charts, demo.activeCount]);

  const tradesSeries = React.useMemo(() => {
    const fromApi = seriesNums(charts?.series?.tradesCount);
    return resolveChartSeries(
      fromApi,
      stats?.totals?.tradesCount ?? stats?.secondaryMarket?.tradesCount ?? 24,
      "flat",
    );
  }, [charts, stats]);

  const liquiditySeries = React.useMemo(() => {
    if (useDemoSeries) return demo.deepCatalogBars;
    const fromApi = seriesNums(charts?.series?.liquidity);
    return resolveChartSeries(fromApi, deepSharePct(stats) || Number.parseFloat(demo.deepCatalogShare) || 66, "flat");
  }, [useDemoSeries, demo.deepCatalogBars, demo.deepCatalogShare, charts, stats]);

  const secondaryFlowSeries = React.useMemo(() => {
    if (useDemoSeries) return demo.secondaryBars;
    const fromApi = seriesNums(charts?.series?.secondaryVolume);
    const base =
      periodVolumeRaw(stats, period) / 10_000 ||
      Number.parseFloat(String(stats?.secondaryMarket?.volumeUsdt ?? 0)) / 10_000 ||
      12;
    return resolveChartSeries(fromApi.length ? fromApi : demo.secondaryBars, Math.max(base, 1), "pulse");
  }, [useDemoSeries, demo.secondaryBars, charts, stats, period]);

  const overlaySeries = React.useMemo(() => {
    const avgYield = seriesNums(charts?.series?.avgYield);
    if (avgYield.length >= 2) return resolveChartSeries(avgYield, 12, "wave");
    return resolveChartSeries(liquiditySeries, Number.parseFloat(demo.deepCatalogShare) || 66, "flat");
  }, [charts, liquiditySeries, demo.deepCatalogShare]);

  const genreHist = React.useMemo(() => {
    const genres = (stats?.distributions?.genres ?? []).filter((g) => !isNoiseCatalogGenre(g.name));
    if (genres.length) {
      return {
        values: genres.slice(0, 8).map((g) => g.count || Number(g.volumeUsdt) || 0),
        labels: genres.slice(0, 8).map((g) => g.name),
      };
    }
    return {
      values: [128, 142, 111, 96, 88, 74, 61, 55],
      labels: ["Pop", "Electronic", "Hip-Hop", "Lo-fi", "Indie", "R&B", "Rock", "Other"],
    };
  }, [stats]);

  const histNet = React.useMemo(() => {
    const med = [...genreHist.values].sort((a, b) => a - b)[Math.floor(genreHist.values.length / 2)] ?? 0;
    return genreHist.values.reduce((s, v) => s + (v >= med ? v : -v * 0.35), 0);
  }, [genreHist]);

  const volumeDisplay = live && stats
    ? `${formatUsdtCompact(periodVolumeRaw(stats, period))} USDT`
    : demo.secondaryVol;
  const volumeDelta = useDemoSeries ? demo.activeDelta : seriesDeltaPct(volumeSeries);
  const tradesCount =
    live && stats
      ? String(stats.totals?.tradesCount ?? stats.secondaryMarket?.tradesCount ?? 0)
      : String(Math.round(tradesSeries[tradesSeries.length - 1] ?? 0));

  const deepShareDisplay =
    live && stats ? `${deepSharePct(stats)}%` : demo.deepCatalogShare;

  const secondarySnap =
    live && stats
      ? mapSecondaryLiveSnapshot(stats, locale)
      : live
        ? {
            resaleVolume: t("marketOverview.secondary.insufficientData"),
            activeLots: t("marketOverview.secondary.noActiveOrders"),
            medianExitHours: "—",
            topDemand: "—",
          }
        : MARKET_SECONDARY_SNAPSHOT;

  return (
    <section className="mx-auto w-full max-w-[1400px] space-y-3 px-4 md:px-6 lg:px-8">
      {/* Row 1 */}
      <div className="grid gap-3 lg:grid-cols-3">
        <CardShell className="lg:col-span-2">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-[15px] font-semibold tracking-tight text-white">
                {t("marketOverview.depth.macroTitle")}
              </h3>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-zinc-400">
                <span>
                  {t("marketOverview.depth.macroVolume")}:{" "}
                  <span className="font-mono font-semibold text-white">{volumeDisplay}</span>{" "}
                  <span className={cn("font-mono", volumeDelta.startsWith("-") ? "text-[#fb7185]" : "text-[#B7F500]")}>
                    {volumeDelta}
                  </span>
                </span>
                <span>
                  {t("marketOverview.depth.macroTrades")}:{" "}
                  <span className="font-mono font-semibold text-white">{tradesCount}</span>
                </span>
              </div>
            </div>
            {loading ? <span className="text-[11px] text-zinc-600">{t("marketOverview.loading")}</span> : null}
          </div>
          <MarketOverviewProChart
            variant="macro"
            values={useDemoSeries ? demo.activeBars : volumeSeries}
            volumes={tradesSeries}
            height={220}
            stroke="#8b5cf6"
            volumeStroke="#fbbf24"
            formatValue={(n) => formatUsdtCompact(n)}
            formatVolume={(n) => String(Math.round(n))}
          />
        </CardShell>

        <CardShell>
          <h3 className="text-[15px] font-semibold tracking-tight text-white">
            {t("marketOverview.depth.liquidityTitle")}
          </h3>
          <p className="mt-3 font-mono text-3xl font-semibold tabular-nums text-[#fb7185]">{deepShareDisplay}</p>
          <p className="mt-1 text-[12px] text-zinc-500">{t("marketOverview.topCard.depth.subtitle")}</p>
          <div className="mt-3">
            <MarketOverviewProChart variant="line" values={liquiditySeries} height={160} stroke="#fb7185" />
          </div>
        </CardShell>
      </div>

      {/* Row 2 */}
      <div className="grid gap-3 lg:grid-cols-3">
        <CardShell className="lg:col-span-2">
          <h3 className="text-[15px] font-semibold tracking-tight text-white">
            {t("marketOverview.depth.flowsTitle")}
          </h3>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
            <div>
              <p className="text-[10px] tracking-wide text-zinc-600">{t("marketOverview.secondary.resaleVolume")}</p>
              <p className="mt-1 font-mono text-sm font-semibold text-white sm:text-base">{secondarySnap.resaleVolume}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-wide text-zinc-600">{t("marketOverview.secondary.activeLots")}</p>
              <p className="mt-1 font-mono text-sm font-semibold text-white sm:text-base">{secondarySnap.activeLots}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-wide text-zinc-600">{t("marketOverview.depth.macroTrades")}</p>
              <p className="mt-1 font-mono text-sm font-semibold text-white sm:text-base">
                {secondarySnap.medianExitHours}
              </p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-sm bg-[#B7F500]" aria-hidden />
              +
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-sm bg-[#fb7185]" aria-hidden />
              −
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-sm bg-[#f59e0b]" aria-hidden />
              {t("marketOverview.depth.flowsOverlay")}
            </span>
          </div>
          <div className="mt-2">
            <MarketOverviewProChart
              variant="flow"
              values={secondaryFlowSeries}
              overlay={overlaySeries}
              height={200}
              stroke="#B7F500"
              downStroke="#fb7185"
              overlayStroke="#f59e0b"
            />
          </div>
        </CardShell>

        <CardShell>
          <h3 className="text-[15px] font-semibold tracking-tight text-white">
            {t("marketOverview.depth.flowHistTitle")}
          </h3>
          <div className="mt-3">
            <MarketOverviewProChart
              variant="hist"
              values={genreHist.values}
              labels={genreHist.labels}
              height={180}
              stroke="#B7F500"
              downStroke="#fb7185"
            />
          </div>
          <p className="mt-2 font-mono text-[12px] text-zinc-400">
            Net{" "}
            <span className={cn("font-semibold", histNet >= 0 ? "text-[#B7F500]" : "text-[#fb7185]")}>
              {histNet >= 0 ? "+" : ""}
              {Math.round(histNet)}
            </span>
          </p>
        </CardShell>
      </div>

      {/* Secondary CTA — full video, no blur, no border */}
      <div className="relative isolate flex min-h-[9.5rem] flex-wrap items-end justify-between gap-4 overflow-hidden rounded-[1.35rem] px-5 py-6 sm:min-h-[11rem] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <video
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-55 motion-reduce:hidden"
            src="/videos/release-parameters-cta.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25 motion-reduce:bg-[#111111]" />
        </div>
        <div className="relative z-10 min-w-0">
          <p className="text-[1.35rem] font-semibold tracking-tight text-white sm:text-[1.6rem]">
            {t("marketOverview.secondary.title")}
          </p>
          <p className="mt-1.5 max-w-[42ch] text-[14px] leading-relaxed text-white/70">
            {t("marketOverview.secondary.subtitle")}
          </p>
        </div>
        <SplitonCtaPill href={ROUTES.dashboardSecondaryMarket} tone="onDark" className="relative z-10 shrink-0">
          {t("marketOverview.insights.more")}
        </SplitonCtaPill>
      </div>

    </section>
  );
}
