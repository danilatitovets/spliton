"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "@/lib/lucide";

import { positionPreviews, type PositionPreviewItem } from "@/components/dashboard/assets/assets-mock-data";
import { AssetsEmptyIllustration } from "@/components/dashboard/assets/assets-empty-illustration";
import { assetsOutlineButtonClass } from "@/components/dashboard/assets/assets-ui";
import { PositionsHeaderBar } from "@/components/dashboard/assets/positions-header-bar";
import { PositionsSummaryCards } from "@/components/dashboard/assets/positions-summary-cards";
import { AssetsBuyReleaseCta } from "@/components/dashboard/assets/positions-buy-release-cta";
import { PositionsTableCard } from "@/components/dashboard/assets/positions-table-card";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { useAssetsPositionsPage } from "@/hooks/use-assets-positions-page";
import { useI18n } from "@/components/providers/i18n-provider";
import { ReadOnlySectionError } from "@/components/shared/data-states/read-only-section-error";
import { ProductDemoBanner } from "@/components/shared/product-demo-banner";
import { formatNumber } from "@/lib/i18n/formatters";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

function getOwnedUnits(row: PositionPreviewItem): number {
  if (typeof row.heldUnits === "number" && Number.isFinite(row.heldUnits)) return row.heldUnits;
  return Number(row.units.replace(/\s/g, "")) || 0;
}

function parseShare(share: string): number {
  const n = Number.parseFloat(share.replace("%", "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export function PositionsPageContent() {
  const { t, locale } = useI18n();
  const {
    live,
    filters,
    updateFilters,
    setPage,
    resetFilters,
    rows,
    total,
    page,
    pageSize,
    genreOptions,
    loading,
    error,
    hasActiveFilters,
    reload,
  } = useAssetsPositionsPage();

  const displayRows = live ? (rows ?? []) : positionPreviews;
  const isInitialLoad = live && loading && rows === null;
  const isEmpty = !isInitialLoad && displayRows.length === 0 && !hasActiveFilters;
  const isFilteredEmpty = !isInitialLoad && displayRows.length === 0 && hasActiveFilters;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const summary = useMemo(() => {
    const count = live ? total : displayRows.length;
    const activeReleases = new Set(
      displayRows.filter((r) => r.status === "Active" || r.status === "Open round").map((r) => r.release),
    ).size;
    const unitsSum = displayRows.reduce((acc, r) => acc + getOwnedUnits(r), 0);
    const avgShare =
      displayRows.length === 0
        ? 0
        : displayRows.reduce((acc, r) => acc + parseShare(r.share), 0) / displayRows.length;

    return {
      total: String(count),
      activeReleases: String(activeReleases),
      totalUnits: formatNumber(unitsSum, locale),
      averageShare: `${new Intl.NumberFormat(locale === "ru" ? "ru-RU" : locale, {
        maximumFractionDigits: 1,
      }).format(avgShare)}%`,
    };
  }, [displayRows, live, locale, total]);

  if (live && error && rows === null) {
    return (
      <ReadOnlySectionError
        sectionId="assets-positions"
        error={error}
        onRetry={() => void reload()}
        retryLabel={t("positions.retry")}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {!live ? <ProductDemoBanner messageKey="positions.demoBanner" /> : null}
      {live && error && rows !== null ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <PositionsHeaderBar
        query={filters.q}
        onQuery={(q) => updateFilters({ q })}
        status={filters.status}
        onStatus={(status) => updateFilters({ status })}
        genre={filters.genre}
        onGenre={(genre) => updateFilters({ genre })}
        genreOptions={genreOptions}
        sort={filters.sort}
        onSort={(sort) => updateFilters({ sort: sort as typeof filters.sort })}
        disabled={isInitialLoad}
      />

      {!isEmpty || isInitialLoad ? (
        <PositionsSummaryCards
          total={summary.total}
          activeReleases={summary.activeReleases}
          totalUnits={summary.totalUnits}
          averageShare={summary.averageShare}
          loading={isInitialLoad}
        />
      ) : null}

      {isInitialLoad ? null : isEmpty ? (
        <section className="rounded-2xl bg-neutral-50 py-12 text-center sm:py-14">
          <AssetsEmptyIllustration situation="portfolioEmpty" size="lg" />
          <p className="mt-5 text-base font-semibold text-neutral-900">{t("positions.emptyTitle")}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">{t("positions.emptyBody")}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <SplitonCtaPill href={`${ROUTES.dashboardPayouts}/deposit`} tone="onLight">
              {t("activity.depositUsdt")}
            </SplitonCtaPill>
            <SplitonCtaPill href={ROUTES.dashboardCatalog} tone="onLight" variant="ghost" withArrow={false}>
              {t("positions.openCatalog")}
            </SplitonCtaPill>
          </div>
        </section>
      ) : isFilteredEmpty ? (
        <section className="rounded-2xl bg-neutral-50 py-12 text-center sm:py-14">
          <AssetsEmptyIllustration situation="chartSparse" size="md" />
          <p className="mt-5 text-base font-semibold text-neutral-900">{t("positions.filteredEmptyTitle")}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">{t("positions.filteredEmptyBody")}</p>
          <button type="button" onClick={resetFilters} className={cn(assetsOutlineButtonClass, "mt-6")}>
            {t("positions.resetFilters")}
          </button>
        </section>
      ) : (
        <>
          <PositionsTableCard rows={displayRows} loading={false} live={live} compact />

          {live && total > pageSize ? (
            <nav
              className="flex flex-wrap items-center justify-between gap-3 px-1"
              aria-label={t("positions.paginationLabel")}
            >
              <p className="text-xs text-neutral-500">
                {t("positions.paginationSummary")
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
                  {t("positions.paginationPrev")}
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage(page + 1)}
                  className={cn(assetsOutlineButtonClass, "h-9 disabled:cursor-not-allowed disabled:opacity-50")}
                >
                  {t("positions.paginationNext")}
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </nav>
          ) : null}
        </>
      )}

      <div className="pt-2 sm:pt-3">
        <AssetsBuyReleaseCta ns="positions" />
      </div>
    </div>
  );
}
