"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp } from "@/lib/lucide";

import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { useI18n } from "@/components/providers/i18n-provider";
import { assetsSellUnitsPath, catalogBuyUnitsPath, loginPathWithNext, ROUTES } from "@/constants/routes";
import { detailPageText } from "@/lib/i18n/analytics-detail-page-messages";
import { cn } from "@/lib/utils";
import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";

function parseUsdtNumber(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw
    .replace(/USDT/gi, "")
    .replace(/\/\s*u\.?/gi, "")
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

function formatUsdt(n: number, locale: string): string {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

const PCTS = [0, 25, 50, 75, 100] as const;

export function ReleaseDetailTradePanel({
  data,
  midPrice,
  className,
}: {
  data: ReleaseDetailPageData;
  midPrice: number;
  className?: string;
}) {
  const { locale, t } = useI18n();
  const [tab, setTab] = useState<"limit" | "market">("market");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [units, setUnits] = useState("1");
  const [pct, setPct] = useState(0);

  const unitPrice =
    parseUsdtNumber(data.summaryPanel.find((r) => r.kind === "min-entry")?.value) ??
    midPrice;

  const unitsNum = Number.parseFloat(units.replace(",", ".")) || 0;
  const usdtOut = unitsNum * unitPrice;

  const buyHref = data.pageState.primaryCta?.href ?? catalogBuyUnitsPath(data.row.id);
  const sellHref = assetsSellUnitsPath(data.row.id);
  const ctaHref = data.pageState.isGuest ? loginPathWithNext(buyHref) : side === "buy" ? buyHref : sellHref;
  const secondaryHref = data.secondary.marketHref || ROUTES.dashboardSecondaryMarket;

  const tabs = useMemo(
    () =>
      [
        { id: "market" as const, label: detailPageText(locale, "analytics.detail.exchange.tabMarket") },
        { id: "limit" as const, label: detailPageText(locale, "analytics.detail.exchange.tabLimit") },
      ] as const,
    [locale],
  );

  return (
    <section
      className={cn("flex h-full min-h-0 flex-col border-white/[0.06] bg-[#0b0e11]", className)}
      aria-label={detailPageText(locale, "analytics.detail.exchange.tradeTitle")}
    >
      <div className="flex border-b border-white/[0.06]">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "flex-1 px-3 py-2.5 text-[12px] font-semibold tracking-tight transition",
              tab === item.id
                ? "border-b-2 border-[#B7F500] text-white"
                : "text-white/40 hover:text-white/70",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex gap-1 p-3">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={cn(
            "flex-1 rounded-md py-2 text-[12px] font-semibold transition",
            side === "buy" ? "bg-[#20b26c] text-white" : "bg-white/[0.04] text-white/45 hover:text-white/70",
          )}
        >
          {detailPageText(locale, "analytics.detail.exchange.buy")}
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={cn(
            "flex-1 rounded-md py-2 text-[12px] font-semibold transition",
            side === "sell" ? "bg-[#ef4444] text-white" : "bg-white/[0.04] text-white/45 hover:text-white/70",
          )}
        >
          {detailPageText(locale, "analytics.detail.exchange.sell")}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-3 pb-3">
        {tab === "limit" ? (
          <div className="flex items-center justify-between gap-3 rounded-md bg-[#12151a] px-3 py-2.5">
            <span className="text-[11px] text-white/40">{detailPageText(locale, "analytics.detail.exchange.price")}</span>
            <span className="font-mono text-[13px] font-semibold tabular-nums text-white">
              {formatUsdt(unitPrice, locale)}
              <span className="ml-1 text-[10px] font-medium text-white/35">USDT</span>
            </span>
          </div>
        ) : null}

        <label className="flex items-center justify-between gap-3 rounded-md bg-[#12151a] px-3 py-2.5">
          <span className="text-[11px] text-white/40">UNT</span>
          <input
            inputMode="decimal"
            value={units}
            onChange={(e) => {
              setUnits(e.target.value.replace(/[^\d.,]/g, ""));
              setPct(0);
            }}
            className="w-full bg-transparent text-right font-mono text-[14px] font-semibold tabular-nums text-white outline-none"
            aria-label="UNT"
          />
        </label>

        <div className="px-1 pt-1">
          <div className="relative h-1 rounded-full bg-white/[0.08]">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[#B7F500]/70"
              style={{ width: `${pct}%` }}
            />
            <div className="absolute inset-0 flex justify-between">
              {PCTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPct(p);
                    const base = 100;
                    setUnits(String(Math.max(1, Math.round((base * p) / 100))));
                  }}
                  className={cn(
                    "relative -mt-1.5 size-3.5 rounded-full border border-[#0b0e11]",
                    pct >= p ? "bg-[#B7F500]" : "bg-white/25",
                  )}
                  aria-label={`${p}%`}
                />
              ))}
            </div>
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-white/30">
            {PCTS.map((p) => (
              <span key={p}>{p}%</span>
            ))}
          </div>
        </div>

        <div className="flex justify-center py-0.5">
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-white/[0.05] text-white/40">
            <ArrowDownUp className="size-3.5" strokeWidth={2} aria-hidden />
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-md bg-[#12151a] px-3 py-2.5">
          <span className="text-[11px] text-white/40">USDT</span>
          <span className="font-mono text-[14px] font-semibold tabular-nums text-white">
            {formatUsdt(usdtOut, locale)}
          </span>
        </div>

        <div className="mt-auto space-y-2 pt-2">
          <SplitonCtaPill href={ctaHref} tone="onDark" className="w-full">
            {data.pageState.isGuest
              ? detailPageText(locale, "analytics.detail.exchange.register")
              : side === "buy"
                ? t("analytics.detail.secondary.buyMore")
                : t("positions.widgets.sellUnt")}
          </SplitonCtaPill>
          <SplitonCtaPill
            href={secondaryHref}
            tone="onDark"
            variant="ghost"
            withArrow={false}
            className="w-full"
          >
            {detailPageText(locale, "analytics.detail.cta.openSecondary")}
          </SplitonCtaPill>
        </div>
      </div>
    </section>
  );
}
