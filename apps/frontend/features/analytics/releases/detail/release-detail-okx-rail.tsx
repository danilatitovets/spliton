"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowDownUp } from "@/lib/lucide";

import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { useI18n } from "@/components/providers/i18n-provider";
import { catalogBuyUnitsPath, assetsSellUnitsPath, ROUTES } from "@/constants/routes";
import { detailPageText } from "@/lib/i18n/analytics-detail-page-messages";
import { cn } from "@/lib/utils";
import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";

import { CabinetMobileQr, CABINET_MOBILE_URL } from "./cabinet-mobile-qr";

const PROMO_ART = "/images/analytics/spliton-release-rail-promo.png";

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

function StatLeaderRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-baseline gap-2 text-[12px] sm:text-[13px]">
      <span className="max-w-[48%] shrink truncate text-white/45">{label}</span>
      <span className="min-w-0 flex-1 border-b border-dotted border-white/15" aria-hidden />
      <span className="max-w-[48%] shrink-0 truncate text-right font-mono font-semibold tabular-nums text-white">
        {value}
      </span>
    </div>
  );
}

export type ReleaseDetailOkxRailVariant = "all" | "trade" | "promo";

export function ReleaseDetailOkxRail({
  data,
  className,
  variant = "all",
}: {
  data: ReleaseDetailPageData;
  className?: string;
  /** `trade` = цена + конвертер + CTA; `promo` = промо + QR; `all` = всё. */
  variant?: ReleaseDetailOkxRailVariant;
}) {
  const { locale, t } = useI18n();
  const [units, setUnits] = useState("1");

  const unitPrice =
    parseUsdtNumber(data.summaryPanel.find((r) => r.kind === "min-entry")?.value) ??
    parseUsdtNumber(data.secondary.rows.find((r) => /price|цена|ask|bid/i.test(r.label))?.value) ??
    parseUsdtNumber(data.performance.miniStats[0]?.value) ??
    18.48;

  const unitsNum = Number.parseFloat(units.replace(",", ".")) || 0;
  const usdtOut = unitsNum * unitPrice;

  const changeRaw = String(
    data.performance.miniStats.find((s) => /Δ|change|измен/i.test(s.label))?.value ??
      data.row.changePct,
  );
  const changeNegative = changeRaw.includes("-") || changeRaw.includes("−");

  const volumeStat =
    data.summaryPanel.find((r) => r.kind === "secondary")?.value ??
    data.secondary.rows.find((r) => /volume|объём|оборот/i.test(r.label))?.value ??
    "—";
  const yieldStat = data.row.yieldPct;
  const payoutStat =
    data.summaryPanel.find((r) => r.kind === "payouts")?.value ?? data.row.payouts ?? "—";

  const buyHref = data.pageState.primaryCta?.href ?? catalogBuyUnitsPath(data.row.id);
  const sellHref = assetsSellUnitsPath(data.row.id);
  const tradeHref = data.secondary.marketHref || ROUTES.dashboardSecondaryMarket;

  const stats = useMemo(
    () => [
      {
        label: detailPageText(locale, "analytics.detail.rail.unitPrice"),
        value: `${formatUsdt(unitPrice, locale)} USDT`,
      },
      {
        label: detailPageText(locale, "analytics.detail.rail.yield"),
        value: yieldStat,
      },
      {
        label: detailPageText(locale, "analytics.detail.rail.payouts"),
        value: payoutStat,
      },
      {
        label: detailPageText(locale, "analytics.detail.rail.volume"),
        value: volumeStat,
      },
      {
        label: detailPageText(locale, "analytics.detail.rail.change"),
        value: changeRaw,
      },
    ],
    [changeRaw, locale, payoutStat, unitPrice, volumeStat, yieldStat],
  );

  const promoTitle = detailPageText(locale, "analytics.detail.rail.promoGet").replace(
    "{release}",
    data.row.release,
  );

  const showTrade = variant === "all" || variant === "trade";
  const showPromo = variant === "all" || variant === "promo";

  return (
    <aside className={cn("flex h-fit w-full flex-col gap-2.5 sm:gap-3", className)}>
      {showTrade ? (
        <div className="flex flex-col gap-2.5 sm:gap-3">
          <section className="rounded-2xl bg-[#171717] px-4 py-4 sm:px-5">
            <p className="text-[11px] font-medium tracking-normal text-white/45">
              {detailPageText(locale, "analytics.detail.rail.marketTitle")}
            </p>
            <p className="mt-2 font-mono text-[1.65rem] font-semibold leading-none tracking-tight tabular-nums text-white">
              {formatUsdt(unitPrice, locale)}
              <span className="ml-1.5 text-[13px] font-medium text-white/45">USDT</span>
            </p>
            <p
              className={cn(
                "mt-2 text-[13px] font-medium",
                changeNegative ? "text-[#ff6b8a]" : "text-[#B7F500]",
              )}
            >
              {changeRaw}
            </p>

            <div className="mt-4 space-y-2.5">
              {stats.map((row) => (
                <StatLeaderRow key={row.label} label={row.label} value={row.value} />
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-[#171717] px-4 py-4 sm:px-5">
            <p className="text-[11px] font-medium tracking-normal text-white/45">
              {detailPageText(locale, "analytics.detail.rail.convertTitle")}
            </p>
            <div className="mt-3 space-y-2">
              <label className="flex items-center justify-between gap-3 rounded-full bg-black/40 px-3.5 py-2.5">
                <span className="text-[12px] font-semibold text-white/70">UNT</span>
                <input
                  inputMode="decimal"
                  value={units}
                  onChange={(e) => setUnits(e.target.value.replace(/[^\d.,]/g, ""))}
                  className="w-full bg-transparent text-right font-mono text-[15px] font-semibold tabular-nums text-white outline-none"
                  aria-label="UNT"
                />
              </label>
              <div className="flex justify-center">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-white/[0.06] text-white/50">
                  <ArrowDownUp className="size-3.5" strokeWidth={2} aria-hidden />
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-full bg-black/40 px-3.5 py-2.5">
                <span className="text-[12px] font-semibold text-white/70">USDT</span>
                <span className="font-mono text-[15px] font-semibold tabular-nums text-white">
                  {formatUsdt(usdtOut, locale)}
                </span>
              </div>
            </div>
          </section>

          <SplitonCtaPill href={buyHref} tone="onDark" className="w-full min-w-0">
            <span className="line-clamp-1">
              {detailPageText(locale, "analytics.detail.rail.buyCta").replace("{release}", data.row.release)}
            </span>
          </SplitonCtaPill>
          <SplitonCtaPill href={sellHref} tone="onDark" variant="ghost" withArrow={false} className="w-full">
            {t("positions.widgets.sellUnt")}
          </SplitonCtaPill>
        </div>
      ) : null}

      {showPromo ? (
        <div className="flex flex-col gap-2.5 sm:gap-3">
          <section className="overflow-hidden rounded-2xl bg-[#171717] p-4 sm:p-5">
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="relative mx-auto size-[64px] shrink-0 sm:mx-0 sm:size-[88px]">
                <Image src={PROMO_ART} alt="" fill sizes="88px" className="object-contain" />
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="text-[14px] font-semibold leading-snug tracking-tight text-white">{promoTitle}</p>
                <div className="mt-3">
                  <SplitonCtaPill href={tradeHref} tone="onDark" variant="accent" className="w-full min-w-0">
                    {detailPageText(locale, "analytics.detail.rail.tradeCta")}
                  </SplitonCtaPill>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-[#171717] px-4 py-4 sm:px-5">
            <p className="text-[14px] font-semibold tracking-tight text-white">
              {detailPageText(locale, "analytics.detail.rail.qrTitle")}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-white/55">
              {detailPageText(locale, "analytics.detail.rail.qrBody")}
            </p>
            <div className="mt-3 hidden sm:block">
              <CabinetMobileQr label={detailPageText(locale, "analytics.detail.rail.qrTitle")} />
            </div>
            <div className="mt-3 sm:hidden">
              <SplitonCtaPill href={CABINET_MOBILE_URL} tone="onDark" variant="ghost" className="w-full">
                {detailPageText(locale, "analytics.detail.rail.qrTitle")}
              </SplitonCtaPill>
            </div>
          </section>
        </div>
      ) : null}
    </aside>
  );
}
