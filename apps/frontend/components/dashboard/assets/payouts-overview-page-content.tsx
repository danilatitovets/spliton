"use client";

import { Eye, EyeOff } from "@/lib/lucide";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AssetsEmptyIllustration } from "@/components/dashboard/assets/assets-empty-illustration";
import {
  assetsCardClass,
  assetsMutedCardClass,
} from "@/components/dashboard/assets/assets-ui";
import { PayoutsAccrualChartSection } from "@/components/dashboard/assets/payouts-accrual-chart-section";
import {
  payoutHistory,
  payoutSchedule,
} from "@/components/dashboard/assets/payouts-mock-data";
import { useI18n } from "@/components/providers/i18n-provider";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { payoutReleaseIcon } from "@/constants/assets/payouts-overview-icons";
import { ROUTES } from "@/constants/routes";
import { useCabinetDemoPreview } from "@/hooks/use-cabinet-demo-preview";
import { usePayoutsHistoryPage } from "@/hooks/use-payouts-history-page";
import { usePayoutsOverview } from "@/hooks/use-payouts-overview";
import { formatNumber, formatUsdtAmount } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

const CTA_VIDEO = "/videos/position-holding-bg.mp4";

const DEMO = {
  totalAccrued: "1482.60",
  totalPaid: "1196.20",
  pending: "120.00",
  available: "286.40",
  locked: "48.00",
};

function asUsdt(raw: string, locale: string) {
  const cleaned = String(raw).replace(/\s*USDT\s*$/i, "").trim();
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return cleaned;
  return `${formatUsdtAmount(n, locale as never)} USDT`;
}

const TEXTURE = "/images/landing/footer-spliton-texture-fill-bw.png";

function asAmount(raw: string, locale: string) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;
  return formatNumber(Math.round(n * 100) / 100, locale as never);
}

export function PayoutsOverviewPageContent() {
  const { t, locale } = useI18n();
  const demoPreview = useCabinetDemoPreview();
  const { live, data, loading, error, reload } = usePayoutsOverview();
  const history = usePayoutsHistoryPage({ pageSize: 5 });
  const [hidden, setHidden] = useState(false);

  const useDemo = !live || demoPreview;

  const totals = useMemo(() => {
    if (useDemo || !data) {
      return {
        available: DEMO.available,
        accrued: DEMO.totalAccrued,
        paid: DEMO.totalPaid,
        pending: DEMO.pending,
        locked: DEMO.locked,
      };
    }
    return {
      available: data.availableBalance,
      accrued: data.totalAccruedUsdt,
      paid: data.totalPaidUsdt,
      pending: data.pendingPayoutUsdt,
      locked: data.lockedBalance,
    };
  }, [data, useDemo]);

  const recentRows = useMemo(() => {
    if (useDemo || !history.live) return payoutHistory.slice(0, 4);
    return (history.rows ?? []).slice(0, 4);
  }, [history.live, history.rows, useDemo]);

  const scheduleRows = useMemo(() => {
    if (useDemo) return payoutSchedule.slice(0, 4);
    return [];
  }, [useDemo]);

  const availableN = Number(totals.available);
  const isLiveEmpty =
    live &&
    !demoPreview &&
    data != null &&
    Number(data.totalAccruedUsdt) === 0 &&
    Number(data.availableBalance) === 0 &&
    recentRows.length === 0;

  const kpiCards = [
    { label: t("payouts.kpi.totalAccrued"), value: asUsdt(totals.accrued, locale) },
    { label: t("payouts.kpi.totalPaid"), value: asUsdt(totals.paid, locale) },
    { label: t("payouts.kpi.pending"), value: asUsdt(totals.pending, locale) },
    { label: t("payouts.kpi.locked"), value: asUsdt(totals.locked, locale) },
  ];

  if (live && loading && !data && !demoPreview) {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
        <div className="h-56 animate-pulse rounded-2xl bg-neutral-100" />
        <div className="h-56 animate-pulse rounded-2xl bg-neutral-100" />
        <div className="h-72 animate-pulse rounded-2xl bg-neutral-100 lg:col-span-2" />
      </div>
    );
  }

  if (live && error && !data && !demoPreview) {
    return (
      <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
        {error}
        <button type="button" className="ml-3 font-semibold underline" onClick={() => void reload()}>
          {t("actions.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8 sm:space-y-5">
      {useDemo ? (
        <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900" role="status">
          {t("assets.overview.demoBanner")}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.9fr)] lg:items-stretch">
        <section
          className="relative isolate flex flex-col justify-between overflow-hidden rounded-[1.35rem] bg-black px-4 py-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] sm:rounded-[1.75rem] sm:px-6 sm:py-6"
          aria-label={t("payouts.kpi.available")}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `url('${TEXTURE}')`,
              backgroundSize: "140% auto",
              backgroundPosition: "48% 42%",
              backgroundRepeat: "no-repeat",
              opacity: 0.72,
            }}
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 bg-black/50" aria-hidden />

          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-medium text-white/55">{t("payouts.kpi.available")}</p>
              <button
                type="button"
                onClick={() => setHidden((v) => !v)}
                className="inline-flex size-7 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
                aria-label={hidden ? t("overview.showBalance") : t("overview.hideBalance")}
              >
                {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="mt-2 font-mono text-[2rem] font-semibold leading-none tracking-tight text-white sm:text-[2.5rem]">
              {hidden
                ? "••••••"
                : Number.isFinite(availableN)
                  ? asAmount(totals.available, locale)
                  : totals.available}
              <span className="ml-2 text-[1rem] font-medium text-white/45 sm:text-[1.15rem]">USDT</span>
            </p>
            <p className="mt-3 text-[13px] text-white/45">
              {t("payouts.kpi.totalAccrued")}:{" "}
              <span className="font-mono font-semibold text-white/85">
                {hidden ? "••••" : asUsdt(totals.accrued, locale)}
              </span>
            </p>
          </div>

          <div className="relative z-10 mt-6 flex flex-wrap gap-2">
            <SplitonCtaPill
              href={`${ROUTES.dashboardPayouts}/deposit`}
              tone="onDark"
              variant="accent"
              className="h-10 min-w-0 px-4 text-[13px]"
            >
              {t("payouts.nav.deposit")}
            </SplitonCtaPill>
            <SplitonCtaPill
              href={`${ROUTES.dashboardPayouts}/withdraw`}
              tone="onDark"
              variant="ghost"
              withArrow={false}
              className="h-10 min-w-0 px-4 text-[13px]"
            >
              {t("payouts.nav.withdraw")}
            </SplitonCtaPill>
            <SplitonCtaPill
              href={ROUTES.dashboardPayoutsHistory}
              tone="onDark"
              variant="ghost"
              withArrow={false}
              className="h-10 min-w-0 px-4 text-[13px]"
            >
              {t("payouts.nav.history")}
            </SplitonCtaPill>
            <SplitonCtaPill
              href={ROUTES.dashboardCatalog}
              tone="onDark"
              variant="ghost"
              withArrow={false}
              className="h-10 min-w-0 px-4 text-[13px]"
            >
              {t("activity.openCatalog")}
            </SplitonCtaPill>
          </div>
        </section>

        <section className={cn(assetsCardClass, "flex min-h-[240px] flex-col sm:py-6")}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-semibold tracking-tight text-neutral-900">
              {t("payouts.recent.title")}
            </h2>
            <Link
              href={ROUTES.dashboardPayoutsHistory}
              className="shrink-0 text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
            >
              {t("payouts.recent.viewAllShort")}
            </Link>
          </div>

          {recentRows.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-2 py-8 text-center">
              <AssetsEmptyIllustration situation="activityEmpty" size="sm" />
              <p className="mt-4 text-sm font-semibold text-neutral-900">{t("history.table.emptyTitle")}</p>
              <p className="mt-1 max-w-[28ch] text-[12px] text-neutral-500">{t("payouts.recent.empty")}</p>
            </div>
          ) : (
            <ul className="mt-4 flex-1 divide-y divide-neutral-100">
              {recentRows.map((row) => (
                <li key={row.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900">{row.release}</p>
                    <p className="truncate text-xs text-neutral-500">
                      {row.date} · {t(`payouts.history.type.${row.type}`)}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono font-medium tabular-nums text-neutral-900">
                    {hidden ? "••••" : row.amount}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <article key={card.label} className={cn(assetsMutedCardClass, "px-4 py-4")}>
            <p className="text-[12px] text-neutral-500">{card.label}</p>
            <p className="mt-2 font-mono text-lg font-semibold tabular-nums tracking-tight text-neutral-900 sm:text-xl">
              {hidden ? "••••••" : card.value}
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(260px,0.9fr)] lg:items-stretch">
        <section className="min-w-0">
          <PayoutsAccrualChartSection hideDemoBanner />
        </section>

        <section className={cn(assetsCardClass, "flex min-h-[240px] flex-col sm:py-6")}>
          <h2 className="text-[15px] font-semibold tracking-tight text-neutral-900">
            {t("payouts.schedule.title")}
          </h2>
          {scheduleRows.length === 0 && !useDemo ? (
            <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
              <AssetsEmptyIllustration situation="payoutsPending" size="sm" />
              <p className="mt-3 text-sm text-neutral-500">{t("payouts.emptyAfterFirstPeriod")}</p>
            </div>
          ) : (
            <ul className="mt-4 flex-1 space-y-3">
              {(scheduleRows.length > 0 ? scheduleRows : payoutSchedule.slice(0, 4)).map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Image
                      src={payoutReleaseIcon(row.release)}
                      alt=""
                      width={36}
                      height={36}
                      className="size-9 shrink-0 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-neutral-900">{row.release}</p>
                      <p className="truncate font-mono text-[11px] text-neutral-450 text-neutral-500">{row.nextAccrual}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-medium text-neutral-700">
                    {t(`payouts.schedule.status.${row.status}`)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>


      <article className="relative isolate overflow-hidden rounded-[1.35rem] bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] sm:rounded-[1.75rem]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <video
            className="absolute inset-0 h-full w-full scale-105 object-cover motion-reduce:hidden"
            src={CTA_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
          <div className="absolute inset-0 bg-black/55 motion-reduce:bg-black" />
        </div>

        <div className="relative z-10 flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-8">
          <div className="min-w-0 max-w-xl">
            <p className="text-base font-semibold text-white sm:text-lg">{t("payouts.nav.deposit")}</p>
            <p className="mt-1 text-sm text-white/55">{t("meta.payouts.comparison.description")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SplitonCtaPill
              href={`${ROUTES.dashboardPayouts}/deposit`}
              tone="onDark"
              variant="accent"
              className="h-10 min-w-0 px-4 text-[13px]"
            >
              {t("payouts.nav.deposit")}
            </SplitonCtaPill>
            <Link
              href={ROUTES.dashboardPayoutsHistory}
              className="inline-flex h-10 items-center rounded-full px-4 text-[13px] font-medium text-white/80 transition hover:bg-white/[0.08] hover:text-white"
            >
              {t("payouts.nav.history")} →
            </Link>
          </div>
        </div>
      </article>

      {isLiveEmpty ? (
        <section className={cn(assetsCardClass, "text-center sm:py-10")}>
          <AssetsEmptyIllustration situation="payoutsPending" size="md" />
          <h2 className="mt-5 text-lg font-semibold tracking-tight text-neutral-900">{t("payouts.emptyTitle")}</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-neutral-500">{t("payouts.emptyAfterFirstPeriod")}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            <SplitonCtaPill href={`${ROUTES.dashboardPayouts}/deposit`} tone="onLight" variant="accent">
              {t("payouts.nav.deposit")}
            </SplitonCtaPill>
            <SplitonCtaPill href={ROUTES.dashboardCatalog} tone="onLight" variant="ghost" withArrow={false}>
              {t("activity.openCatalog")}
            </SplitonCtaPill>
          </div>
        </section>
      ) : null}
    </div>
  );
}