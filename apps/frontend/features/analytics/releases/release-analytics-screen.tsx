"use client";

import * as React from "react";

import { useReleaseAnalyticsState } from "./hooks/use-release-analytics-state";
import { ReleaseAnalyticsFiltersToolbar } from "./sections/release-analytics-filters-toolbar";
import { ReleaseAnalyticsInsights } from "./sections/release-analytics-insights";
import { ReleaseAnalyticsOverviewSection } from "./sections/release-analytics-overview-section";
import { ReleaseAnalyticsReleasesTable } from "./sections/release-analytics-releases-table";

export function ReleaseAnalyticsScreen() {
  const {
    period,
    setPeriod,
    query,
    setQuery,
    statusTab,
    setStatusTab,
    sort,
    sortDir,
    handleSort,
    genre,
    setGenre,
    chipPreset,
    setChipPreset,
    sectionTab,
    setSectionTab,
    watch,
    setWatch,
    stats,
    filteredRows,
  } = useReleaseAnalyticsState();

  const toggleWatch = React.useCallback(
    (id: string) => {
      setWatch((w) => ({ ...w, [id]: !w[id] }));
    },
    [setWatch],
  );

  return (
    <div className="h-full min-h-0 overflow-auto bg-black font-sans tabular-nums">
      <ReleaseAnalyticsOverviewSection period={period} onPeriodChange={setPeriod} stats={stats} />

      <ReleaseAnalyticsFiltersToolbar
        sectionTab={sectionTab}
        onSectionTab={setSectionTab}
        statusTab={statusTab}
        onStatusTab={setStatusTab}
        chipPreset={chipPreset}
        onChipPreset={setChipPreset}
        query={query}
        onQuery={setQuery}
        genre={genre}
        onGenre={setGenre}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 pb-4 md:px-6 lg:px-8">
        <ReleaseAnalyticsReleasesTable
          rows={filteredRows}
          sort={sort}
          sortDir={sortDir}
          onSort={handleSort}
          watch={watch}
          onToggleWatch={toggleWatch}
        />
        <ReleaseAnalyticsInsights period={period} rows={filteredRows} stats={stats} />
        <div className="h-6 shrink-0" aria-hidden />
      </div>
    </div>
  );
}
