"use client";

import Link from "next/link";

import { OverviewHero } from "@/components/dashboard/assets/overview-hero";
import { PayoutsOverviewSummary } from "@/components/dashboard/assets/payouts-overview-summary";
import { PortfolioOverviewEmptyState } from "@/components/dashboard/assets/portfolio-overview-empty-state";
import { PortfolioOverviewSkeleton } from "@/components/dashboard/assets/portfolio-overview-skeleton";
import { RecentActivityCard } from "@/components/dashboard/assets/recent-activity-card";
import { TopPositionsCard } from "@/components/dashboard/assets/top-positions-card";
import { useI18n } from "@/components/providers/i18n-provider";
import { ReadOnlySectionError } from "@/components/shared/data-states/read-only-section-error";
import { ROUTES } from "@/constants/routes";
import {
  usePortfolioActivityLive,
  usePortfolioOverviewLive,
} from "@/hooks/use-portfolio-live";
import { parseOverviewTotalUsdt } from "@/lib/portfolio/portfolio-adapter";

export function AssetsOverviewContent() {
  const { t } = useI18n();
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

  // Soft revalidate: never blank the whole page when we already have overview.
  if (live && loading && !overview) {
    return <PortfolioOverviewSkeleton />;
  }

  if (live && error && !overview) {
    return (
      <ReadOnlySectionError
        sectionId="assets-overview"
        error={error}
        onRetry={reload}
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
      : undefined;

  return (
    <div className="space-y-4 sm:space-y-5">
      {!live ? (
        <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900" role="status">
          {t("assets.overview.demoBanner")}
        </p>
      ) : null}

      <OverviewHero
        live={live}
        totalValueUsdt={totalUsdt}
        totalValueUnavailable={live && overview == null}
        change30dPct={overview?.change30dPct ?? null}
        walletSummary={walletSummary}
        walletLoading={walletLoading}
      />

      <section className="space-y-2.5" aria-labelledby="overview-payouts-heading">
        <div className="flex items-center justify-between gap-3">
          <h2 id="overview-payouts-heading" className="truncate text-base font-semibold tracking-tight text-neutral-900">
            {t("meta.payouts.overviewTitle")}
          </h2>
          <Link
            href={ROUTES.dashboardPayouts}
            className="shrink-0 text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
          >
            {t("payouts.recent.viewAllShort")}
          </Link>
        </div>
        <PayoutsOverviewSummary embedded />
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,22rem)] lg:items-stretch lg:gap-4">
        {isEmptyPortfolio ? (
          <PortfolioOverviewEmptyState />
        ) : (
          <TopPositionsCard rows={topPositions ?? undefined} live={live} loading={loading} compact />
        )}

        <RecentActivityCard
          preview
          live={live}
          items={recentActivityItems}
          loading={activity.loading}
          error={activity.error}
          onRetry={activity.reload}
          variant="statement"
        />
      </div>
    </div>
  );
}
