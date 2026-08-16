"use client";

import * as React from "react";
import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import { CheckCircle2, X } from "@/lib/lucide";

import { secondaryMarketHref } from "@/constants/dashboard/secondary-market";
import {
  analyticsReleaseDetailPath,
  assetsPositionDetailPath,
  assetsSellUnitsPath,
  catalogBuyUnitsPath,
  ROUTES,
  secondaryMarketReleaseAnalyticsPath,
} from "@/constants/routes";
import type { ReleaseLedgerEventUi } from "@/lib/analytics/release-analytics-adapter";
import {
  analyticsReleaseStatusLabel,
  analyticsTermLabel,
} from "@/lib/i18n/analytics-messages";
import { useI18n } from "@/components/providers/i18n-provider";
import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";
import { cn } from "@/lib/utils";

import { DetailSection } from "./detail-section";
import { ReleaseDetailMarketingBlocks } from "./release-detail-marketing-blocks";
import { ReleaseDetailOkxRail } from "./release-detail-okx-rail";
import { ReleaseDetailPerformanceChart } from "./release-detail-performance-chart";
import { ReleaseDetailHero } from "./release-detail-hero";

function KVPairs({
  rows,
}: {
  rows: Array<{ label: string; value: React.ReactNode }>;
}) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/[0.06] sm:grid-cols-3">
      {rows.map((r) => (
        <div key={r.label} className="bg-[#171717] px-3.5 py-3">
          <p className="text-[11px] leading-none tracking-normal text-white/45">{r.label}</p>
          <p className="mt-1.5 font-mono text-[13px] font-semibold leading-snug tracking-normal tabular-nums text-white">
            {r.value}
          </p>
        </div>
      ))}
    </div>
  );
}

const textActionClass =
  "text-[12px] font-semibold uppercase tracking-[0.08em] text-white/80 transition-colors hover:text-white";

const textActionMutedClass =
  "text-[12px] font-semibold uppercase tracking-[0.08em] text-white/45 transition-colors hover:text-white/80";

type LedgerTone = ReleaseLedgerEventUi["tone"];

function ledgerToneDot(tone: LedgerTone) {
  const map: Record<LedgerTone, string> = {
    buy: "bg-blue-500",
    order: "bg-amber-400",
    fill: "bg-violet-400",
    cancel: "bg-white/30",
    payout: "bg-emerald-400",
    sell: "bg-red-500",
    other: "bg-white/25",
  };
  return map[tone] ?? map.other;
}

export function ReleaseDetailSecondaryOrderPage({
  data,
  contextFrom,
  ledgerEvents,
  isLive = false,
}: {
  data: ReleaseDetailPageData;
  contextFrom?: string;
  ledgerEvents?: ReleaseLedgerEventUi[];
  isLive?: boolean;
}) {
  const { locale, t } = useI18n();
  const { row, liveContext, myHistory, slug, performance } = data;
  const [cancelOpen, setCancelOpen] = React.useState(false);

  const stackHref =
    isLive && slug
      ? secondaryMarketHref("market", { release: slug })
      : secondaryMarketHref("market");

  const assetQuery = new URLSearchParams();
  if (contextFrom) assetQuery.set("from", contextFrom);
  const assetHref =
    assetQuery.size > 0
      ? `${analyticsReleaseDetailPath(row.id)}?${assetQuery.toString()}`
      : analyticsReleaseDetailPath(row.id);

  const fromPositions = contextFrom === "positions";
  const backHref = fromPositions
    ? assetsPositionDetailPath(row.id)
    : contextFrom === "secondary"
      ? ROUTES.dashboardSecondaryMarket
      : assetHref;
  const backLabel = fromPositions
    ? t("analytics.detail.hero.back.positions")
    : contextFrom === "secondary"
      ? t("analytics.detail.hero.back.secondary")
      : t("analytics.detail.hero.back.releaseCard");
  const heroSource = fromPositions
    ? "positions"
    : contextFrom === "secondary"
      ? "secondary"
      : contextFrom === "catalog"
        ? "catalog"
        : undefined;

  const tradingAnalyticsHref = isLive
    ? secondaryMarketHref("analytics", slug ? { release: slug } : undefined)
    : secondaryMarketReleaseAnalyticsPath(row.id);

  const user = liveContext?.user;
  const sm = liveContext?.secondarySummary;

  const positionRows = isLive
    ? user
      ? [
          { label: t("analytics.detail.secondary.position.totalUnits"), value: user.userUnits ?? "—" },
          { label: t("analytics.detail.secondary.position.availableUnits"), value: user.userAvailableUnits ?? "—" },
          { label: t("analytics.detail.secondary.position.lockedUnits"), value: user.userLockedUnits ?? "0" },
          {
            label: t("analytics.detail.secondary.position.avgEntry"),
            value: user.userAvgEntryPrice ? `${user.userAvgEntryPrice} USDT` : "—",
          },
          {
            label: t("analytics.detail.secondary.position.currentValue"),
            value: user.userCurrentValue ? `${user.userCurrentValue} USDT` : "—",
          },
          {
            label: t("analytics.detail.secondary.position.payoutsReceived"),
            value: user.userPayoutsReceived ? `${user.userPayoutsReceived} USDT` : "—",
          },
        ]
      : [{ label: t("analytics.detail.secondary.position.label"), value: t("analytics.detail.secondary.position.signIn") }]
    : [
        { label: t("analytics.detail.secondary.position.totalUnits"), value: "1 842" },
        { label: t("analytics.detail.secondary.position.availableUnits"), value: "1 794" },
        { label: t("analytics.detail.secondary.position.lockedUnits"), value: "48" },
        { label: t("analytics.detail.secondary.position.avgEntry"), value: "18,12 USDT" },
        { label: t("analytics.detail.secondary.position.guidancePrice"), value: "18,48 USDT" },
        { label: t("analytics.detail.secondary.position.payoutsReceived"), value: "126,40 USDT" },
      ];

  const latestOrder = isLive ? myHistory?.orders[0] : null;
  const orderRows = isLive
    ? latestOrder
      ? [
          { label: t("analytics.detail.secondary.order.type"), value: latestOrder.side },
          { label: t("analytics.detail.secondary.order.pricePerUnit"), value: latestOrder.price ?? "—" },
          { label: t("analytics.detail.secondary.order.units"), value: latestOrder.units },
          {
            label: t("analytics.detail.secondary.order.createdAt"),
            value: new Date(latestOrder.createdAt).toLocaleString(locale === "ru" ? "ru-RU" : locale === "pt" ? "pt-PT" : locale === "es" ? "es-ES" : "en-US"),
          },
          { label: t("analytics.detail.secondary.order.status"), value: latestOrder.status },
        ]
      : [{ label: t("analytics.detail.secondary.order.ordersLabel"), value: t("analytics.detail.secondary.order.none") }]
    : [
        { label: t("analytics.detail.secondary.order.type"), value: t("analytics.detail.secondary.order.demoBuy") },
        { label: t("analytics.detail.secondary.order.executionType"), value: t("analytics.detail.secondary.order.demoLimit") },
        { label: t("analytics.detail.secondary.order.pricePerUnit"), value: "18,48 USDT" },
        { label: t("analytics.detail.secondary.order.totalUnits"), value: "80" },
        { label: t("analytics.detail.secondary.order.filled"), value: "32" },
        { label: t("analytics.detail.secondary.order.remaining"), value: "48" },
        { label: t("analytics.detail.secondary.order.amount"), value: "1 478,40 USDT" },
        { label: t("analytics.detail.secondary.order.createdAt"), value: "21.04.2026 23:45" },
        { label: t("analytics.detail.secondary.order.status"), value: t("analytics.detail.secondary.order.demoPartial") },
      ];

  const marketRows = isLive && sm
    ? [
        { label: t("analytics.detail.secondary.market.bestBid"), value: sm.bestBid ? `${sm.bestBid} USDT` : "—" },
        { label: t("analytics.detail.secondary.market.bestAsk"), value: sm.bestAsk ? `${sm.bestAsk} USDT` : "—" },
        { label: t("analytics.detail.secondary.market.lastPrice"), value: sm.lastTradePrice ? `${sm.lastTradePrice} USDT` : "—" },
        { label: t("analytics.detail.secondary.market.spread"), value: sm.averageSpread ? `${sm.averageSpread} USDT` : "—" },
        { label: t("analytics.detail.secondary.market.volume24h"), value: sm.secondaryVolume24h || "—" },
        { label: t("analytics.detail.secondary.market.trades7d"), value: String(sm.trades7d) },
        { label: t("analytics.detail.secondary.market.liquidity"), value: sm.liquidityLabel || "—" },
        { label: t("analytics.detail.secondary.market.activeListings"), value: String(sm.activeListings) },
      ]
    : [
        { label: t("analytics.detail.secondary.market.bestBid"), value: "18,41 USDT" },
        { label: t("analytics.detail.secondary.market.bestAsk"), value: "18,55 USDT" },
        { label: t("analytics.detail.secondary.market.lastPrice"), value: "18,48 USDT" },
        { label: t("analytics.detail.secondary.market.spread"), value: "0,14 USDT" },
        { label: t("analytics.detail.secondary.market.volume24h"), value: "184 200 USDT" },
        { label: t("analytics.detail.secondary.market.tradeCount"), value: "126" },
        { label: t("analytics.detail.secondary.market.liquidity"), value: t("analytics.detail.secondary.market.liquidityMedium") },
        { label: t("analytics.detail.secondary.market.activeOrders"), value: "48" },
      ];

  const timeline =
    isLive && ledgerEvents?.length
      ? ledgerEvents
      : isLive
        ? [{ title: t("analytics.detail.secondary.timeline.emptyTitle"), date: "—", detail: t("analytics.detail.secondary.timeline.emptyDetail"), tone: "other" as const }]
        : ledgerEvents?.length
          ? ledgerEvents
          : [
              {
                title: t("analytics.detail.secondary.timeline.demo.buy"),
                date: "12.03.2026",
                detail: "320 UNT",
                tone: "buy" as const,
              },
              {
                title: t("analytics.detail.secondary.timeline.demo.order"),
                date: "21.04.2026",
                detail: t("analytics.detail.secondary.timeline.demo.orderDetail"),
                tone: "order" as const,
              },
              {
                title: t("analytics.detail.secondary.timeline.demo.payout"),
                date: "14.04.2026",
                detail: "+24.80 USDT",
                tone: "payout" as const,
              },
            ];

  return (
    <div className="bg-black text-white">
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-4 sm:px-6 sm:pt-5 lg:px-8 lg:pb-24">
        <div className="min-w-0">
          <ReleaseDetailHero
            data={data}
            source={heroSource}
            backHrefOverride={backHref}
            backLabelOverride={backLabel}
          />
        </div>

        <section className="mt-2 rounded-2xl bg-[#171717] px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-medium tracking-normal text-white/45">
                {t("analytics.detail.secondary.myPosition")}
              </p>
              <div className="mt-3">
                <KVPairs rows={positionRows} />
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 sm:pb-1">
              <Link href={assetsSellUnitsPath(row.id)} className={textActionClass}>
                {t("analytics.detail.secondary.newSellOrder")}
              </Link>
              <Link href={catalogBuyUnitsPath(row.id)} className={textActionClass}>
                {t("analytics.detail.secondary.buyMore")}
              </Link>
              <Link href={stackHref} className={textActionMutedClass}>
                {t("analytics.detail.secondary.goToBook")}
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-8 grid grid-cols-1 items-start gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
          <DetailSection
            className="mt-0 border-0 pt-0"
            title={performance.title}
            description={`${performance.subtitle}${t("analytics.detail.secondary.chartHint")}`}
          >
            <ReleaseDetailPerformanceChart
              title={performance.title}
              subtitle={performance.subtitle}
              seriesByPeriod={performance.seriesByPeriod}
              miniStats={performance.miniStats}
              releaseId={row.id}
              buyHref={stackHref}
              buyLabel={t("analytics.detail.screen.buyToBook")}
            />
          </DetailSection>
          <div className="min-w-0">
            <ReleaseDetailOkxRail data={data} className="h-fit" />
          </div>
        </div>

        <DetailSection
          className="border-white/[0.06]"
          title={t("analytics.detail.secondary.orderTitle")}
          description={t("analytics.detail.secondary.orderDescription")}
        >
          <KVPairs rows={orderRows} />
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <button type="button" onClick={() => setCancelOpen(true)} className={textActionMutedClass}>
              {t("analytics.detail.secondary.cancelOrder")}
            </button>
            <Link href={stackHref} className={textActionClass}>
              {t("analytics.detail.secondary.goToBook")}
            </Link>
            <Link href={catalogBuyUnitsPath(row.id)} className={textActionClass}>
              {t("analytics.detail.secondary.buyMore")}
            </Link>
            <Link href={assetsSellUnitsPath(row.id)} className={textActionClass}>
              {t("analytics.detail.secondary.newSellOrder")}
            </Link>
            <Link href={tradingAnalyticsHref} scroll={false} className={textActionMutedClass}>
              {t("analytics.detail.secondary.tradingAnalytics")}
            </Link>
          </div>
        </DetailSection>

        <DetailSection
          className="border-white/[0.06]"
          title={t("analytics.detail.secondary.marketTitle")}
          description={t("analytics.detail.secondary.marketDescription")}
        >
          <KVPairs rows={marketRows} />
        </DetailSection>

        <DetailSection
          className="border-white/[0.06]"
          title={t("analytics.detail.secondary.orderBookTitle")}
          description={
            isLive
              ? t("analytics.detail.secondary.orderBookDescriptionLive")
              : t("analytics.detail.secondary.orderBookDescriptionDemo")
          }
        >
          {isLive ? (
            <div className="rounded-2xl bg-[#171717] px-4 py-4">
              <p className="text-sm text-white/45">{t("analytics.detail.secondary.orderBookLiveHint")}</p>
              <Link href={stackHref} className={cn("mt-3 inline-flex", textActionClass)}>
                {t("analytics.detail.secondary.openFullBook")}
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-px overflow-hidden rounded-2xl bg-white/[0.06] lg:grid-cols-3">
                <div className="bg-[#171717] p-4">
                  <p className="text-[11px] tracking-normal text-white/45">{t("analytics.detail.secondary.bestBids")}</p>
                  <div className="mt-2 space-y-1.5 font-mono text-[12px]">
                    <div className="flex items-center justify-between text-blue-400">
                      <span>18,41</span>
                      <span className="text-white/50">120u</span>
                    </div>
                    <div className="flex items-center justify-between text-blue-400">
                      <span>18,38</span>
                      <span className="text-white/50">95u</span>
                    </div>
                    <div className="flex items-center justify-between text-blue-400">
                      <span>18,34</span>
                      <span className="text-white/50">82u</span>
                    </div>
                  </div>
                </div>
                <div className="bg-[#171717] p-4">
                  <p className="text-[11px] tracking-normal text-white/45">{t("analytics.detail.secondary.bestAsks")}</p>
                  <div className="mt-2 space-y-1.5 font-mono text-[12px]">
                    <div className="flex items-center justify-between text-red-400">
                      <span>18,55</span>
                      <span className="text-white/50">76u</span>
                    </div>
                    <div className="flex items-center justify-between text-red-400">
                      <span>18,58</span>
                      <span className="text-white/50">62u</span>
                    </div>
                    <div className="flex items-center justify-between text-red-400">
                      <span>18,63</span>
                      <span className="text-white/50">48u</span>
                    </div>
                  </div>
                </div>
                <div className="bg-[#171717] p-4">
                  <p className="text-[11px] tracking-normal text-white/45">{t("analytics.detail.secondary.recentTrades")}</p>
                  <div className="mt-2 space-y-1.5 font-mono text-[12px] text-white/80">
                    <div className="flex items-center justify-between">
                      <span>18,48</span>
                      <span className="text-white/45">24u</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>18,50</span>
                      <span className="text-white/45">12u</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>18,46</span>
                      <span className="text-white/45">8u</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Link href={stackHref} className={textActionClass}>
                  {t("analytics.detail.secondary.openFullBookTrade")}
                </Link>
              </div>
            </>
          )}
        </DetailSection>

        <DetailSection
          className="border-white/[0.06]"
          title={t("analytics.detail.secondary.contextTitle")}
          description={t("analytics.detail.secondary.contextDescriptionLive")}
        >
          {isLive && sm ? (
            <KVPairs
              rows={[
                {
                  label: t("analytics.detail.secondary.context.activity7d"),
                  value: t("analytics.detail.secondary.context.tradesCount").replace("{count}", String(sm.trades7d)),
                },
                {
                  label: t("analytics.detail.secondary.context.turnover24h"),
                  value: sm.secondaryVolume24h || "—",
                },
                {
                  label: t("analytics.detail.secondary.market.liquidity"),
                  value: sm.liquidityLabel || "—",
                },
              ]}
            />
          ) : (
            <>
              <KVPairs
                rows={[
                  {
                    label: t("analytics.detail.secondary.context.activity7d30d"),
                    value: t("analytics.detail.secondary.context.activityDemoValue"),
                  },
                  {
                    label: t("analytics.detail.secondary.context.trend"),
                    value: t("analytics.detail.secondary.context.trendModerateUp"),
                  },
                  {
                    label: t("analytics.detail.secondary.context.supplyDemand"),
                    value: t("analytics.detail.secondary.context.demandUp"),
                  },
                ]}
              />

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <section className="rounded-2xl bg-[#171717] px-4 py-4 sm:px-5">
                  <h3 className="text-[15px] font-semibold tracking-tight text-white">
                    {t("analytics.detail.secondary.payoutsTitle")}
                  </h3>
                  <p className="mt-1 text-[12px] text-white/40">
                    {isLive ? t("analytics.detail.secondary.payoutsHintLive") : t("analytics.detail.secondary.payoutsHintDemo")}
                  </p>
                  <div className="mt-3">
                    <KVPairs
                      rows={[
                        {
                          label: t("analytics.detail.secondary.payouts.window"),
                          value: data.quickStats.find((s) => s.label.includes("30D"))?.value ?? row.payouts,
                        },
                        {
                          label: t("analytics.detail.secondary.payouts.last"),
                          value:
                            data.payoutHistory[0]?.period
                              ? data.payoutHistory[0].period
                              : isLive
                                ? "—"
                                : "14.04.2026",
                        },
                        {
                          label: t("analytics.detail.secondary.payouts.total"),
                          value: data.quickStats.find((s) => s.label.includes("all-time"))?.value ?? row.payouts,
                        },
                        { label: t("analytics.detail.secondary.payouts.yield"), value: row.yieldPct },
                      ]}
                    />
                  </div>
                </section>
                <section className="rounded-2xl bg-[#171717] px-4 py-4 sm:px-5">
                  <h3 className="text-[15px] font-semibold tracking-tight text-white">
                    {t("analytics.detail.secondary.termsTitle")}
                  </h3>
                  <p className="mt-1 text-[12px] text-white/40">
                    {isLive ? t("analytics.detail.secondary.termsHintLive") : t("analytics.detail.secondary.termsHintDemo")}
                  </p>
                  <div className="mt-3">
                    <KVPairs
                      rows={[
                        ...data.terms.rows.slice(0, 6).map((termRow) => ({
                          label: analyticsTermLabel(termRow.key, locale),
                          value: termRow.val,
                        })),
                        {
                          label: t("analytics.detail.secondary.terms.totalUnitsEmission"),
                          value: data.terms.rows.find((termRow) => termRow.key.toLowerCase().includes("total_units"))?.val ?? "—",
                        },
                        {
                          label: t("analytics.detail.secondary.terms.availablePrimary"),
                          value: data.quickStats.find((s) => s.label === "Available units")?.value ?? row.units,
                        },
                        {
                          label: t("analytics.detail.secondary.terms.roundStatus"),
                          value: analyticsReleaseStatusLabel(row.status, locale, "round"),
                        },
                      ]}
                    />
                  </div>
                </section>
              </div>
            </>
          )}
        </DetailSection>

        <DetailSection
          className="border-white/[0.06]"
          title={t("analytics.detail.secondary.ledgerTitle")}
          description={t("analytics.detail.secondary.ledgerDescription")}
        >
          <ul className="divide-y divide-white/[0.06] rounded-2xl bg-[#171717] px-4 sm:px-5">
            {timeline.map((ev) => (
              <li
                key={"id" in ev && ev.id ? ev.id : ev.title}
                className="flex items-start justify-between gap-3 py-3.5 first:pt-3 last:pb-3"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={cn("mt-1.5 size-2 shrink-0 rounded-full", ledgerToneDot(ev.tone))}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold tracking-tight text-white">{ev.title}</p>
                    <p className="mt-0.5 text-xs tracking-normal text-white/40">
                      {ev.date}
                      {ev.detail ? ` · ${ev.detail}` : ""}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </DetailSection>

        <ReleaseDetailMarketingBlocks data={data} />
      </div>

      <Dialog.Root open={cancelOpen} onOpenChange={setCancelOpen} modal>
        <Dialog.Portal>
          <Dialog.Backdrop
            className={cn(
              "fixed inset-0 z-120 bg-black/70 backdrop-blur-[2px]",
              "transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
            )}
          />
          <Dialog.Popup
            className={cn(
              "fixed left-1/2 top-1/2 z-121 w-[min(100vw-1.5rem,420px)] -translate-x-1/2 -translate-y-1/2",
              "max-md:inset-x-0 max-md:bottom-0 max-md:left-0 max-md:top-auto max-md:w-full max-md:translate-x-0 max-md:translate-y-0",
              "rounded-[1.5rem] bg-[#171717] p-5 text-white shadow-[0_28px_90px_rgba(0,0,0,0.55)] max-md:rounded-b-none",
              "transition-[opacity,transform] duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
              "md:data-ending-style:scale-[0.98] md:data-starting-style:scale-[0.98]",
              "max-md:data-ending-style:translate-y-full max-md:data-starting-style:translate-y-full",
            )}
          >
            <Dialog.Close
              aria-label={t("analytics.detail.secondary.closeDialog")}
              className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-full bg-white/[0.06] text-white/55 transition hover:bg-white/[0.1] hover:text-white"
            >
              <X className="size-4" />
            </Dialog.Close>
            <div className="flex items-start gap-3 pr-8">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-white/70" />
              <div>
                <Dialog.Title className="text-base font-semibold tracking-tight text-white">
                  {t("analytics.detail.secondary.cancelDialogTitle")}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-[13px] text-white/45">
                  {t("analytics.detail.secondary.cancelDialogDescription")}
                </Dialog.Description>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-x-4">
              <Dialog.Close className={textActionMutedClass}>
                {t("analytics.detail.secondary.cancelDialogKeep")}
              </Dialog.Close>
              <Dialog.Close className={textActionClass}>
                {t("analytics.detail.secondary.cancelDialogConfirm")}
              </Dialog.Close>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
