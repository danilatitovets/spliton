"use client";

import Link from "next/link";

import { positionPreviews } from "@/components/dashboard/assets/assets-mock-data";
import { OverviewHero } from "@/components/dashboard/assets/overview-hero";
import { OverviewSecondaryCta } from "@/components/dashboard/assets/overview-secondary-cta";
import { OverviewStatsCard } from "@/components/dashboard/assets/overview-stats-card";
import { PortfolioOverviewSkeleton } from "@/components/dashboard/assets/portfolio-overview-skeleton";
import {
  ProfileOkxSection,
  profileOkxGhostClass,
} from "@/components/dashboard/profile/profile-okx";
import { useI18n } from "@/components/providers/i18n-provider";
import { ReadOnlySectionError } from "@/components/shared/data-states/read-only-section-error";
import { ProductDemoBanner } from "@/components/shared/product-demo-banner";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { ROUTES, assetsPositionDetailPath } from "@/constants/routes";
import { usePayoutsOverview } from "@/hooks/use-payouts-overview";
import {
  usePortfolioActivityLive,
  usePortfolioOverviewLive,
} from "@/hooks/use-portfolio-live";
import { formatUsdtAmount } from "@/lib/i18n/formatters";
import { parseOverviewTotalUsdt } from "@/lib/portfolio/portfolio-adapter";

function parseMoney(raw: string | undefined | null): number {
  if (raw == null) return 0;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

export function AssetsOverviewContent() {
  const { t, locale } = useI18n();
  const {
    live,
    overview,
    walletSummary,
    topPositions,
    loading,
    walletLoading,
    error,
    reload,
  } = usePortfolioOverviewLive();
  const activity = usePortfolioActivityLive();
  const payouts = usePayoutsOverview();

  if (live && loading && !overview) {
    return <PortfolioOverviewSkeleton />;
  }

  if (live && error && !overview) {
    return (
      <ReadOnlySectionError
        sectionId="assets-overview"
        error={error}
        onRetry={reload}
        variant="dark"
      />
    );
  }

  const totalUsdt = overview ? parseOverviewTotalUsdt(overview.totalValue) : undefined;
  const isEmptyPortfolio = live && overview != null && overview.positionCount === 0;
  const recentActivityItems =
    live && activity.records
      ? activity.records.slice(0, 4).map((row) => ({
          id: row.id,
          type: row.typeKey ? t(`activity.widgets.type.${row.typeKey}`) : (row.type ?? t("common.empty")),
          detail: row.detailsKey ? t(`activity.widgets.details.${row.detailsKey}`) : (row.details ?? ""),
          amount: row.amount,
          date: row.relativeKey
            ? t(`activity.widgets.relative.${row.relativeKey}`)
            : (row.relative ?? row.date),
        }))
      : [];

  const positionRows = live ? (topPositions ?? []) : positionPreviews.slice(0, 4);
  const payoutCards =
    payouts.live && payouts.data
      ? [
          { label: t("payouts.kpi.totalAccrued"), value: formatUsdtAmount(parseMoney(payouts.data.totalAccruedUsdt), locale) },
          { label: t("payouts.kpi.totalPaid"), value: formatUsdtAmount(parseMoney(payouts.data.totalPaidUsdt), locale) },
          { label: t("payouts.kpi.pending"), value: formatUsdtAmount(parseMoney(payouts.data.pendingPayoutUsdt), locale) },
          { label: t("payouts.kpi.available"), value: formatUsdtAmount(parseMoney(payouts.data.availableBalance), locale) },
          { label: t("payouts.kpi.locked"), value: formatUsdtAmount(parseMoney(payouts.data.lockedBalance), locale) },
        ]
      : payouts.live
        ? []
        : [
            { label: t("payouts.kpi.totalAccrued"), value: formatUsdtAmount(1482.6, locale) },
            { label: t("payouts.kpi.totalPaid"), value: formatUsdtAmount(1196.2, locale) },
            { label: t("payouts.kpi.pending"), value: formatUsdtAmount(120, locale) },
            { label: t("payouts.kpi.available"), value: formatUsdtAmount(286.4, locale) },
            { label: t("payouts.kpi.locked"), value: formatUsdtAmount(48, locale) },
          ];

  return (
    <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
      {!live ? (
        <ProductDemoBanner
          messageKey="assets.overview.demoBanner"
          className="rounded-2xl bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-200"
        />
      ) : null}

      <OverviewHero
        live={live}
        totalValueUsdt={totalUsdt}
        totalValueUnavailable={live && overview == null}
        change30dPct={overview?.change30dPct ?? null}
        walletSummary={walletSummary}
        walletLoading={walletLoading}
      />

      <OverviewStatsCard
        live={live}
        totalUsdt={totalUsdt}
        change30dPct={overview?.change30dPct ?? null}
        positionCount={overview?.positionCount}
        activeReleases={overview?.activeReleases}
        expectedPayoutsUsdt={parseMoney(overview?.expectedPayouts)}
        availableUsdt={parseMoney(walletSummary?.availableBalance)}
        lockedUsdt={parseMoney(walletSummary?.lockedBalance)}
      />

      <ProfileOkxSection
        title={t("meta.payouts.overviewTitle")}
        action={
          <Link href={ROUTES.dashboardPayouts} className={profileOkxGhostClass}>
            {t("payouts.recent.viewAllShort")}
          </Link>
        }
      >
        <div className="grid gap-2 px-4 py-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-5">
          {payoutCards.length === 0 ? (
            <p className="col-span-full py-4 text-center text-[13px] text-zinc-500">
              {payouts.loading ? t("assets.loadingOverview") : t("payouts.emptyTitle")}
            </p>
          ) : (
            payoutCards.map((card) => (
              <div key={card.label} className="rounded-2xl bg-white/[0.04] px-3.5 py-3">
                <p className="truncate text-[12px] text-zinc-500">{card.label}</p>
                <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-white">{card.value}</p>
              </div>
            ))
          )}
        </div>
      </ProfileOkxSection>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2 lg:items-start">
        {isEmptyPortfolio ? (
          <section className="rounded-[1.25rem] bg-[#111111] px-5 py-12 text-center sm:px-6 sm:py-14">
            <h2 className="text-[17px] font-semibold tracking-tight text-white">
              {t("assets.overview.portfolioEmptyTitle")}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-zinc-500">
              {t("assets.overview.portfolioEmptyBodyExtended")}
            </p>
            <div className="mx-auto mt-6 flex max-w-xs flex-col gap-2">
              <SplitonCtaPill href="/assets/payouts/deposit" tone="onDark" className="w-full">
                {t("overview.deposit")}
              </SplitonCtaPill>
              <SplitonCtaPill href={ROUTES.dashboardCatalog} tone="onDark" variant="ghost" withArrow={false}>
                {t("overview.openCatalog")}
              </SplitonCtaPill>
            </div>
          </section>
        ) : (
          <ProfileOkxSection
            title={t("overview.portfolioSection")}
            action={
              <Link href={ROUTES.dashboardPositions} className={profileOkxGhostClass}>
                {t("positions.preview.allLink")}
              </Link>
            }
          >
            {positionRows.length === 0 ? (
              <p className="px-5 py-8 text-center text-[13px] text-zinc-500 sm:px-6">
                {t("assets.overview.portfolioEmptyBody")}
              </p>
            ) : (
              positionRows.map((row) => {
                const href = row.catalogReleaseId
                  ? assetsPositionDetailPath(row.catalogReleaseId)
                  : ROUTES.dashboardPositions;
                return (
                  <Link
                    key={row.id}
                    href={href}
                    className="flex items-center justify-between gap-3 px-5 py-[1.15rem] transition hover:bg-white/[0.03] sm:px-6"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-white">{row.release}</p>
                      <p className="mt-1 truncate text-[13px] text-zinc-500">
                        {row.artist} / {row.units} UNT
                      </p>
                    </div>
                    <p className="shrink-0 font-mono text-[15px] font-semibold tabular-nums text-white">{row.value}</p>
                  </Link>
                );
              })
            )}
          </ProfileOkxSection>
        )}

        <ProfileOkxSection
          title={t("overview.statementTitle")}
          action={
            <Link href={ROUTES.dashboardActivity} className={profileOkxGhostClass}>
              {t("activity.recent.viewAll")}
            </Link>
          }
        >
          {live && activity.loading && recentActivityItems.length === 0 ? (
            <div className="space-y-2 px-5 py-4 sm:px-6" aria-hidden>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-white/[0.06]" />
              ))}
            </div>
          ) : live && activity.error && recentActivityItems.length === 0 ? (
            <div className="px-5 py-4 sm:px-6">
              <ReadOnlySectionError
                sectionId="recent-activity-card"
                error={activity.error}
                onRetry={activity.reload}
                compact
                variant="dark"
              />
            </div>
          ) : recentActivityItems.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-zinc-500 sm:px-6">
              {live ? t("assets.overview.activityHistoryHint") : t("activity.recent.empty")}
            </p>
          ) : (
            recentActivityItems.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 px-5 py-[1.05rem] sm:px-6">
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-white">{item.type}</p>
                  <p className="mt-1 truncate text-[13px] text-zinc-500">{item.detail}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-[14px] font-medium tabular-nums text-white">{item.amount}</p>
                  <p className="mt-1 text-[12px] text-zinc-500">{item.date}</p>
                </div>
              </div>
            ))
          )}
        </ProfileOkxSection>
      </div>

      <OverviewSecondaryCta />
    </div>
  );
}
