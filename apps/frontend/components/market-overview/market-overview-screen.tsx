"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import { useMarketOverviewState } from "@/hooks/use-market-overview-state";
import { MARKET_OVERVIEW_ROWS } from "@/mocks/market-overview-rows";

import { MarketOverviewFiltersToolbar } from "./market-overview-filters-toolbar";
import { MarketOverviewInsights } from "./market-overview-insights";
import { MarketOverviewOverviewSection } from "./market-overview-overview-section";
import { MarketOverviewSecondary } from "./market-overview-secondary";
import { MarketOverviewSegments } from "./market-overview-segments";
import { MarketOverviewTable } from "./market-overview-table";

export function MarketOverviewScreen() {
  const searchParams = useSearchParams();
  const releaseFocusId = searchParams.get("release");

  const {
    period,
    setPeriod,
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
  } = useMarketOverviewState();

  const releaseResetDone = React.useRef<string | null>(null);

  React.useLayoutEffect(() => {
    if (!releaseFocusId) return;
    if (!MARKET_OVERVIEW_ROWS.some((r) => r.id === releaseFocusId)) return;
    if (filteredRows.some((r) => r.id === releaseFocusId)) return;
    if (releaseResetDone.current === releaseFocusId) return;
    releaseResetDone.current = releaseFocusId;
    resetFilters();
  }, [releaseFocusId, filteredRows, resetFilters]);

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

  return (
    <div className="h-full min-h-0 overflow-auto bg-black font-sans tabular-nums">
      <MarketOverviewOverviewSection
        period={period}
        onPeriodChange={setPeriod}
        lastUpdated={lastUpdated}
      />

      <MarketOverviewFiltersToolbar
        categoryTab={categoryTab}
        onCategoryTab={setCategoryTab}
        filters={filters}
        onFilterChange={setFilter}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 pb-4 pt-1 md:px-6 lg:px-8">
        <MarketOverviewTable rows={filteredRows} sort={sort} sortDir={sortDir} onSort={handleSort} />
      </div>
      <div className="space-y-6 py-8">
        <MarketOverviewSegments />
        <MarketOverviewSecondary />
        <MarketOverviewInsights />
      </div>
    </div>
  );
}
