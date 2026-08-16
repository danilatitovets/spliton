"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "@/lib/lucide";

import { ActivityFiltersBar } from "@/components/dashboard/assets/activity-filters-bar";
import { activityRecords } from "@/components/dashboard/assets/activity-mock-data";
import { ActivityTableCard } from "@/components/dashboard/assets/activity-table-card";
import { ActivityTypeBreakdownCard } from "@/components/dashboard/assets/activity-type-breakdown-card";
import { AssetsBuyReleaseCta } from "@/components/dashboard/assets/positions-buy-release-cta";
import { AssetsEmptyIllustration } from "@/components/dashboard/assets/assets-empty-illustration";
import {
  assetsCardClass,
  assetsOutlineButtonClass,
} from "@/components/dashboard/assets/assets-ui";
import { useAssetsActivityPage } from "@/hooks/use-assets-activity-page";
import { useI18n } from "@/components/providers/i18n-provider";
import { ReadOnlySectionError } from "@/components/shared/data-states/read-only-section-error";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function ActivityPageContent() {
  const { t } = useI18n();
  const {
    live,
    filters,
    updateFilters,
    setPage,
    records,
    total,
    page,
    pageSize,
    hasMore,
    releaseOptions,
    loading,
    error,
    hasActiveFilters,
    reload,
  } = useAssetsActivityPage();

  const rows = live ? (records ?? []) : activityRecords;
  const isInitialLoad = live && loading && records === null;
  const isEmpty = !isInitialLoad && rows.length === 0;
  const tableState: "default" | "empty" | "loading" = isInitialLoad
    ? "loading"
    : isEmpty
      ? "empty"
      : "default";

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const demoBanner = useMemo(() => !live, [live]);

  if (live && error && records === null) {
    return (
      <ReadOnlySectionError
        sectionId="assets-activity"
        error={error}
        onRetry={() => void reload()}
        retryLabel={t("activity.retry")}
      />
    );
  }

  return (
    <div className="space-y-4 pb-2 sm:space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-[1.75rem]">
          {t("activity.widgets.historyTitle")}
        </h1>
      </header>

      {demoBanner ? (
        <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900" role="status">
          {t("assets.overview.demoBanner")}
        </p>
      ) : null}

      {live && error && records !== null ? (
        <ReadOnlySectionError
          sectionId="assets-activity-partial"
          error={error}
          onRetry={() => void reload()}
          retryLabel={t("activity.retry")}
          compact
        />
      ) : null}

      <ActivityFiltersBar
        activeTab={filters.tab}
        onTabChange={(tab) => updateFilters({ tab })}
        period={filters.period}
        onPeriodChange={(period) =>
          updateFilters({ period: period as typeof filters.period })
        }
        release={filters.releaseId}
        onReleaseChange={(releaseId) => updateFilters({ releaseId })}
        releaseOptions={releaseOptions}
        status={filters.status}
        onStatusChange={(status) => updateFilters({ status })}
        direction={filters.direction}
        onDirectionChange={(direction) =>
          updateFilters({ direction: direction as typeof filters.direction })
        }
        sort={filters.sort}
        onSortChange={(sort) => updateFilters({ sort: sort as typeof filters.sort })}
        query={filters.q}
        onQueryChange={(q) => updateFilters({ q })}
        disabled={isInitialLoad}
      />

      {tableState === "empty" ? (
        <section className={cn(assetsCardClass, "py-12 text-center sm:py-14")}>
          <AssetsEmptyIllustration situation="activityEmpty" size="lg" />
          <p className="mt-5 text-base font-semibold text-neutral-900">
            {hasActiveFilters && live ? t("activity.filteredEmptyTitle") : t("activity.emptyTitle")}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
            {hasActiveFilters && live ? t("activity.filteredEmptyBody") : t("activity.emptyBody")}
          </p>
          {!hasActiveFilters ? (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <SplitonCtaPill href={ROUTES.dashboardCatalog} tone="onLight">
                {t("activity.openCatalog")}
              </SplitonCtaPill>
              <SplitonCtaPill
                href={`${ROUTES.dashboardPayouts}/deposit`}
                tone="onLight"
                variant="ghost"
                withArrow={false}
              >
                {t("activity.depositUsdt")}
              </SplitonCtaPill>
            </div>
          ) : null}
        </section>
      ) : (
        <>
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(16rem,1fr)] lg:gap-5 lg:items-start">
            <ActivityTableCard rows={rows} state={tableState} compact hideHeader />
            <ActivityTypeBreakdownCard rows={rows} loading={isInitialLoad} />
          </section>

          {live && total > pageSize ? (
            <nav
              className="flex flex-wrap items-center justify-between gap-3 px-1"
              aria-label={t("activity.paginationLabel")}
            >
              <p className="text-xs text-neutral-500">
                {t("activity.paginationSummary")
                  .replace("{page}", String(page))
                  .replace("{totalPages}", String(totalPages))
                  .replace("{total}", String(total))}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage(page - 1)}
                  className={cn(assetsOutlineButtonClass, "h-9 disabled:cursor-not-allowed disabled:opacity-50")}
                >
                  <ChevronLeft className="size-3.5" />
                  {t("activity.paginationPrev")}
                </button>
                <button
                  type="button"
                  disabled={!hasMore || loading}
                  onClick={() => setPage(page + 1)}
                  className={cn(assetsOutlineButtonClass, "h-9 disabled:cursor-not-allowed disabled:opacity-50")}
                >
                  {t("activity.paginationNext")}
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </nav>
          ) : null}
        </>
      )}

      <div className="pt-2 sm:pt-3">
        <AssetsBuyReleaseCta ns="activity" />
      </div>
    </div>
  );
}
