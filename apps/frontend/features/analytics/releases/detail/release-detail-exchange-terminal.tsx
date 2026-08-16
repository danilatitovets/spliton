"use client";

import { useMemo } from "react";

import { useI18n } from "@/components/providers/i18n-provider";
import { detailPageText } from "@/lib/i18n/analytics-detail-page-messages";
import { cn } from "@/lib/utils";
import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";

import { ReleaseDetailOrderBook } from "./release-detail-order-book";
import { ReleaseDetailPerformanceChart } from "./release-detail-performance-chart";
import { ReleaseDetailTradePanel } from "./release-detail-trade-panel";

function parseMid(data: ReleaseDetailPageData, seriesLast: number | null): number {
  const raw =
    data.summaryPanel.find((r) => r.kind === "min-entry")?.value ??
    data.performance.miniStats[0]?.value;
  if (raw) {
    const cleaned = raw
      .replace(/USDT/gi, "")
      .replace(/\/\s*u\.?/gi, "")
      .replace(/\s/g, "")
      .replace(",", ".")
      .replace(/[^\d.-]/g, "");
    const n = Number.parseFloat(cleaned);
    if (Number.isFinite(n) && n > 0) return n;
  }
  if (seriesLast != null && seriesLast > 0) return seriesLast;
  return 18.48;
}

function TickerStat({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" | "flat" }) {
  return (
    <div className="min-w-[5.5rem]">
      <p className="text-[10px] font-medium tracking-normal text-white/35">{label}</p>
      <p
        className={cn(
          "mt-0.5 font-mono text-[12px] font-semibold tabular-nums",
          tone === "up" && "text-[#20b26c]",
          tone === "down" && "text-[#ef4444]",
          (!tone || tone === "flat") && "text-white",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function ReleaseDetailExchangeTerminal({
  data,
  buyHref,
  buyLabel,
  chartLoading = false,
}: {
  data: ReleaseDetailPageData;
  buyHref?: string;
  buyLabel?: string;
  chartLoading?: boolean;
}) {
  const { locale } = useI18n();
  const series = data.performance.seriesByPeriod["30d"] ?? [];
  const last = series.length ? series[series.length - 1]! : null;
  const prev = series.length > 1 ? series[series.length - 2]! : last;
  const mid = parseMid(data, last);

  const changeAbs = last != null && prev != null ? last - prev : 0;
  const changePct = prev ? (changeAbs / prev) * 100 : 0;
  const high = series.length ? Math.max(...series) : mid;
  const low = series.length ? Math.min(...series) : mid;
  const volume =
    data.summaryPanel.find((r) => r.kind === "secondary")?.value ??
    data.quickStats.find((s) => /volume|объём|оборот/i.test(s.label))?.value ??
    "—";

  const pair = `${data.row.symbol || "UNT"}/USDT`;
  const changeTone = changePct > 0 ? "up" : changePct < 0 ? "down" : "flat";
  const changeText = `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`;

  const bookLabels = useMemo(
    () => ({
      title: detailPageText(locale, "analytics.detail.exchange.bookTitle"),
      price: detailPageText(locale, "analytics.detail.exchange.colPrice"),
      qty: detailPageText(locale, "analytics.detail.exchange.colQty"),
      total: detailPageText(locale, "analytics.detail.exchange.colTotal"),
    }),
    [locale],
  );

  return (
    <section
      className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0b0e11]"
      aria-label={detailPageText(locale, "analytics.detail.exchange.terminalAria")}
    >
      <div className="flex flex-wrap items-end gap-x-5 gap-y-3 border-b border-white/[0.06] px-3 py-2.5 sm:px-4">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold tracking-tight text-white sm:text-base">{pair}</p>
          <p
            className={cn(
              "mt-0.5 font-mono text-[1.35rem] font-semibold leading-none tabular-nums sm:text-[1.5rem]",
              changeTone === "up" && "text-[#20b26c]",
              changeTone === "down" && "text-[#ef4444]",
              changeTone === "flat" && "text-white",
            )}
          >
            {mid.toLocaleString(locale === "ru" ? "ru-RU" : locale, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <TickerStat
          label={detailPageText(locale, "analytics.detail.exchange.markPrice")}
          value={mid.toLocaleString(locale === "ru" ? "ru-RU" : locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        />
        <TickerStat
          label={detailPageText(locale, "analytics.detail.exchange.change24h")}
          value={changeText}
          tone={changeTone}
        />
        <TickerStat
          label={detailPageText(locale, "analytics.detail.exchange.high24h")}
          value={high.toLocaleString(locale === "ru" ? "ru-RU" : locale, {
            maximumFractionDigits: 2,
          })}
        />
        <TickerStat
          label={detailPageText(locale, "analytics.detail.exchange.low24h")}
          value={low.toLocaleString(locale === "ru" ? "ru-RU" : locale, {
            maximumFractionDigits: 2,
          })}
        />
        <TickerStat label={detailPageText(locale, "analytics.detail.exchange.volume")} value={volume} />
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(200px,240px)_minmax(220px,280px)]">
        <div className="min-w-0 border-b border-white/[0.06] lg:border-b-0 lg:border-r">
          <ReleaseDetailPerformanceChart
            title={data.performance.title}
            subtitle={data.performance.subtitle}
            seriesByPeriod={data.performance.seriesByPeriod}
            miniStats={data.performance.miniStats}
            releaseId={data.row.id}
            releaseSlug={data.slug}
            buyHref={buyHref}
            buyLabel={buyLabel}
            pageState={data.pageState}
            chartLoading={chartLoading}
            layout="exchange"
          />
        </div>
        <div className="min-h-[320px] border-b border-white/[0.06] lg:min-h-[520px] lg:border-b-0 lg:border-r">
          <ReleaseDetailOrderBook midPrice={mid} locale={locale} labels={bookLabels} className="h-full" />
        </div>
        <div className="min-h-[360px] lg:min-h-[520px]">
          <ReleaseDetailTradePanel data={data} midPrice={mid} className="h-full" />
        </div>
      </div>
    </section>
  );
}
