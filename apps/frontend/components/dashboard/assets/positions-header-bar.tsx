"use client";

import { useMemo } from "react";

import { AssetsGptMenu } from "@/components/dashboard/assets/assets-gpt-menu";
import { AssetsSearchField } from "@/components/dashboard/assets/assets-search-field";
import { MetricsGptToggle } from "@/components/dashboard/assets/metrics-gpt-toggle";
import { assetsMutedCardClass } from "@/components/dashboard/assets/assets-ui";
import { useI18n } from "@/components/providers/i18n-provider";
import { POSITIONS_GENRE_ALL, POSITIONS_STATUS_ALL } from "@/hooks/use-assets-positions-page";
import { cn } from "@/lib/utils";

const STATUS_VALUES = ["Active", "Open round", "Secondary", "Closed"] as const;

export function PositionsHeaderBar({
  query,
  onQuery,
  status,
  onStatus,
  genre,
  onGenre,
  genreOptions = [],
  sort,
  onSort,
  disabled,
}: {
  query: string;
  onQuery: (value: string) => void;
  status: string;
  onStatus: (value: string) => void;
  genre: string;
  onGenre: (value: string) => void;
  genreOptions?: string[];
  sort: string;
  onSort: (value: string) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();

  const statusTabs = useMemo(
    () => [
      { id: POSITIONS_STATUS_ALL, label: t("activity.tab.all") },
      ...STATUS_VALUES.map((v) => ({
        id: v,
        label: t(`positions.widgets.status.${v === "Open round" ? "openRound" : v.toLowerCase()}`),
      })),
    ],
    [t],
  );

  const genreFilterOptions = useMemo(
    () => [
      { id: POSITIONS_GENRE_ALL, label: t("positions.filterAllGenres") },
      ...genreOptions.map((g) => ({ id: g, label: g })),
    ],
    [genreOptions, t],
  );

  const sortOptions = useMemo(
    () => [
      { id: "value_desc", label: t("positions.sort.valueDesc") },
      { id: "value_asc", label: t("positions.sort.valueAsc") },
      { id: "units_desc", label: t("positions.sort.unitsDesc") },
      { id: "units_asc", label: t("positions.sort.unitsAsc") },
      { id: "newest", label: t("positions.sort.newest") },
      { id: "updated", label: t("positions.sort.updated") },
    ],
    [t],
  );

  return (
    <section className={cn(assetsMutedCardClass, "space-y-3 sm:space-y-4 sm:px-5 sm:py-4")}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <MetricsGptToggle
          value={status}
          onChange={onStatus}
          options={statusTabs}
          ariaLabel={t("positions.filtersLabel")}
          size="sm"
          className={cn(disabled && "pointer-events-none opacity-50")}
        />

        <div className="flex flex-wrap items-center gap-2">
          <AssetsGptMenu
            value={genre}
            onChange={onGenre}
            options={genreFilterOptions}
            ariaLabel={t("positions.filters.genreLabel")}
            disabled={disabled}
          />
          <AssetsGptMenu
            value={sort}
            onChange={onSort}
            options={sortOptions}
            ariaLabel={t("positions.filters.sortLabel")}
            disabled={disabled}
          />
        </div>
      </div>

      <AssetsSearchField
        value={query}
        onSubmit={onQuery}
        disabled={disabled}
        size="md"
        placeholder={t("positions.searchPlaceholder")}
        aria-label={t("positions.filters.searchLabel")}
        inputClassName="bg-white focus:bg-white"
      />
    </section>
  );
}
