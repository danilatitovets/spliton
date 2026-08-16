"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import { useMarketOverviewState } from "@/hooks/use-market-overview-state";
import { tf } from "@/lib/i18n/financial-messages";
import { MARKET_OVERVIEW_ROWS } from "@/mocks/market-overview-rows";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/i18n-provider";

import { MarketOverviewDepthDashboard } from "./market-overview-depth-dashboard";
import { MarketOverviewFiltersToolbar } from "./market-overview-filters-toolbar";
import { MarketOverviewOverviewSection } from "./market-overview-overview-section";
import { MarketOverviewTable } from "./market-overview-table";

function MarketOverviewTableSkeleton() {
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-lg bg-white/5" />
      ))}
    </div>
  );
}

function PaginationButton({
  disabled,
  onClick,
  label,
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-10 rounded-full px-4 text-[12px] font-semibold transition",
        disabled
          ? "cursor-not-allowed bg-white/5 text-zinc-600"
          : "bg-white/10 text-zinc-100 hover:bg-white/14",
      )}
    >
      {label}
    </button>
  );
}

export function MarketOverviewScreen() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const releaseFocusId = searchParams.get("release");

  const {
    period,
    setPeriod,
    search,
    setSearch,
    categoryTab,
    setCategoryTab,
    filters,
    setFilter,
    sort,
    sortDir,
    handleSort,
    filteredRows,
    lastUpdated,
    resetFilters,
    live,
    loading,
    loadError,
    stats,
    charts,
    page,
    setPage,
    totalCount,
    totalPages,
    reload,
  } = useMarketOverviewState();

  const releaseResetDone = React.useRef<string | null>(null);

  React.useLayoutEffect(() => {
    if (!releaseFocusId) return;
    const knownIds = live ? filteredRows.map((r) => r.id) : MARKET_OVERVIEW_ROWS.map((r) => r.id);
    if (!knownIds.includes(releaseFocusId) && !live) {
      if (!MARKET_OVERVIEW_ROWS.some((r) => r.id === releaseFocusId)) return;
    } else if (live && loading) {
      return;
    } else if (live && !filteredRows.some((r) => r.id === releaseFocusId) && filteredRows.length > 0) {
      return;
    }
    if (filteredRows.some((r) => r.id === releaseFocusId)) return;
    if (releaseResetDone.current === releaseFocusId) return;
    releaseResetDone.current = releaseFocusId;
    resetFilters();
  }, [releaseFocusId, filteredRows, resetFilters, live, loading]);

  React.useLayoutEffect(() => {
    if (!releaseFocusId) return;
    if (!filteredRows.some((r) => r.id === releaseFocusId)) return;
    const el = document.getElementById(`market-release-${releaseFocusId}`);
    if (!el) return;
    const raf = window.requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.setAttribute("data-release-focus", "1");
    });
    const t = window.setTimeout(() => {
      el.removeAttribute("data-release-focus");
    }, 2600);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(t);
      el.removeAttribute("data-release-focus");
    };
  }, [releaseFocusId, filteredRows]);

  const showSkeleton = live && loading && filteredRows.length === 0;

  return (
    <div className="h-full min-h-0 overflow-auto bg-black font-sans tabular-nums" data-mobile-scroll-root>
      <MarketOverviewFiltersToolbar
        categoryTab={categoryTab}
        onCategoryTab={setCategoryTab}
        filters={filters}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
        period={period}
        onPeriodChange={setPeriod}
      />

      <MarketOverviewOverviewSection
        period={period}
        lastUpdated={lastUpdated}
        live={live}
        stats={stats}
        charts={charts}
        loading={live && loading && !stats}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 pb-6 pt-4 md:px-6 lg:px-8">
        {!live ? (
          <p
            className="mb-4 rounded-xl ring-1 ring-amber-500/25 bg-amber-950/20 px-4 py-3 text-sm text-amber-100"
            role="status"
          >
            {t("marketOverview.demo.banner")}
          </p>
        ) : null}

        {loadError ? (
          <div className="mb-4 rounded-xl bg-rose-950/40 px-4 py-3 text-sm text-rose-100" role="alert">
            {loadError}
            <button type="button" className="ml-3 underline" onClick={() => void reload()}>
              {t("marketOverview.retry")}
            </button>
          </div>
        ) : null}

        {showSkeleton ? (
          <div className="py-8">
            <p className="mb-4 text-center text-sm text-zinc-500">{t("marketOverview.loading")}</p>
            <MarketOverviewTableSkeleton />
          </div>
        ) : (
          <>
            {live && filteredRows.length > 0 ? (
              <p className="mb-3 text-xs text-zinc-500">
                {tf(t("marketOverview.pagination.showing"), {
                  shown: String(filteredRows.length),
                  total: String(totalCount),
                })}
              </p>
            ) : null}
            <MarketOverviewTable rows={filteredRows} live={live} sort={sort} sortDir={sortDir} onSort={handleSort} />
            {live && totalPages > 1 ? (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <PaginationButton
                  disabled={page <= 1 || loading}
                  onClick={() => setPage(page - 1)}
                  label={t("marketOverview.pagination.back")}
                />
                <span className="px-3 text-sm text-zinc-400">
                  {tf(t("marketOverview.pagination.page"), {
                    page: String(page),
                    total: String(totalPages),
                  })}
                </span>
                <PaginationButton
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage(page + 1)}
                  label={t("marketOverview.pagination.next")}
                />
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className="border-t border-white/[0.06] py-8 md:py-10">
        <MarketOverviewDepthDashboard
          live={live}
          period={period}
          stats={stats}
          charts={charts}
          loading={live && loading && !stats}
        />
      </div>
    </div>
  );
}
