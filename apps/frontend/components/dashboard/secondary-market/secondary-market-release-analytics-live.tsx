"use client";

import { BookOpen } from "@/lib/lucide";

import { SecondaryMarketBreadcrumbNav } from "@/components/dashboard/secondary-market/secondary-market-breadcrumb-nav";
import { ChartPeriodSelector } from "@/components/shared/charts/chart-period-selector";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { useI18n } from "@/components/providers/i18n-provider";
import { secondaryMarketBookHref, secondaryMarketHref } from "@/constants/dashboard/secondary-market";
import { ReleaseAnalyticsProChart } from "@/features/catalog/market-overview/release-analytics/ui/release-analytics-pro-chart";
import { useSecondaryMarketCharts } from "@/hooks/use-secondary-market-charts";

export function SecondaryMarketReleaseAnalyticsLive({
  releaseId,
  title,
  symbol,
}: {
  releaseId: string;
  title?: string;
  symbol?: string;
}) {
  const { t } = useI18n();
  const charts = useSecondaryMarketCharts(releaseId);

  return (
    <div className="space-y-8 font-sans tabular-nums text-white antialiased">
      <header className="pb-2">
        <SecondaryMarketBreadcrumbNav
          className="mb-4"
          items={[
            { label: t("meta.secondaryMarket.breadcrumb.secondaryMarket"), href: secondaryMarketHref("market") },
            {
              label: t("meta.secondaryMarket.breadcrumb.tradingAnalytics"),
              href: secondaryMarketHref("analytics"),
              scroll: false,
            },
            { label: symbol ?? releaseId.slice(0, 8) },
          ]}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
              {title ?? t("secondaryMarket.hero.analytics.title")}
            </h1>
            <p className="mt-1.5 text-[13px] text-zinc-500">
              {symbol
                ? `${symbol} · ${t("secondaryMarket.analytics.defaultSubtitle")}`
                : t("secondaryMarket.analytics.defaultSubtitle")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ChartPeriodSelector value={charts.period} onChange={charts.setPeriod} />
            {symbol ? (
              <SplitonCtaPill
                href={secondaryMarketBookHref(symbol)}
                tone="onDark"
                className="h-10 gap-2 pl-4 pr-1.5 text-[13px] font-semibold"
              >
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="size-3.5" strokeWidth={2} aria-hidden />
                  {t("secondaryMarket.analytics.openOrderBook")}
                </span>
              </SplitonCtaPill>
            ) : null}
          </div>
        </div>
      </header>

      {charts.loading ? (
        <p className="text-sm text-zinc-500">{t("secondaryMarket.analytics.loadingCharts")}</p>
      ) : charts.error ? (
        <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200" role="alert">
          {charts.error}
        </p>
      ) : (
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex min-h-[240px] flex-col rounded-2xl bg-white/[0.04] px-3.5 pb-2 pt-3.5">
            <h3 className="text-[13px] font-semibold text-white">{t("secondaryMarket.analytics.priceClose")}</h3>
            <div className="mt-3 min-h-0 flex-1">
              {charts.priceValues.length >= 2 ? (
                <ReleaseAnalyticsProChart values={charts.priceValues} accent="zinc" />
              ) : (
                <p className="mt-8 text-center text-xs text-zinc-500">{t("secondaryMarket.analytics.noPriceHistory")}</p>
              )}
            </div>
          </div>
          <div className="flex min-h-[240px] flex-col rounded-2xl bg-white/[0.04] px-3.5 pb-2 pt-3.5">
            <h3 className="text-[13px] font-semibold text-white">{t("secondaryMarket.analytics.volumeUsdt")}</h3>
            <div className="mt-3 min-h-0 flex-1">
              {charts.volumeValues.length >= 2 ? (
                <ReleaseAnalyticsProChart values={charts.volumeValues} accent="zinc" />
              ) : (
                <p className="mt-8 text-center text-xs text-zinc-500">{t("secondaryMarket.analytics.noTrades")}</p>
              )}
            </div>
          </div>
          <div className="flex min-h-[240px] flex-col rounded-2xl bg-white/[0.04] px-3.5 pb-2 pt-3.5 md:col-span-2 xl:col-span-1">
            <h3 className="text-[13px] font-semibold text-white">{t("secondaryMarket.analytics.liquidity")}</h3>
            <div className="mt-3 min-h-0 flex-1">
              {charts.liquidityValues.length >= 2 ? (
                <ReleaseAnalyticsProChart values={charts.liquidityValues} accent="zinc" />
              ) : (
                <p className="mt-8 text-center text-xs text-zinc-500">{t("secondaryMarket.analytics.noLiquidity")}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
