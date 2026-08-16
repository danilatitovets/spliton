"use client";

import { useMemo, useState } from "react";

import { AssetsGptMenu } from "@/components/dashboard/assets/assets-gpt-menu";
import { AssetsFilterSelect } from "@/components/dashboard/assets/assets-filter-field";
import { AssetsSearchField } from "@/components/dashboard/assets/assets-search-field";
import { MetricsGptToggle } from "@/components/dashboard/assets/metrics-gpt-toggle";
import { assetsMutedCardClass } from "@/components/dashboard/assets/assets-ui";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

export type ActivityFilterTab = "all" | "deposits" | "buys" | "sells" | "transfers" | "withdrawals";

export const ACTIVITY_PERIOD_7D = "7d";
export const ACTIVITY_PERIOD_30D = "30d";
export const ACTIVITY_PERIOD_90D = "90d";
export const ACTIVITY_PERIOD_180D = "180d";
export const ACTIVITY_PERIOD_1Y = "1y";
export const ACTIVITY_PERIOD_ALL = "all";
export const ACTIVITY_RELEASE_ALL = "__all__";
export const ACTIVITY_STATUS_ALL = "__all__";
export const ACTIVITY_DIRECTION_ALL = "all";

const STATUS_VALUES = ["Completed", "Pending", "Processing", "Cancelled"] as const;

export function ActivityFiltersBar({
  activeTab,
  onTabChange,
  period,
  onPeriodChange,
  release,
  onReleaseChange,
  releaseOptions = [],
  status,
  onStatusChange,
  direction,
  onDirectionChange,
  sort,
  onSortChange,
  query,
  onQueryChange,
  disabled,
}: {
  activeTab: ActivityFilterTab;
  onTabChange: (tab: ActivityFilterTab) => void;
  period: string;
  onPeriodChange: (value: string) => void;
  release: string;
  onReleaseChange: (value: string) => void;
  releaseOptions?: { id: string; title: string }[];
  status: string;
  onStatusChange: (value: string) => void;
  direction: string;
  onDirectionChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const [moreOpen, setMoreOpen] = useState(false);

  const tabs = useMemo(
    () =>
      (
        [
          { id: "all", labelKey: "activity.tab.all" },
          { id: "deposits", labelKey: "activity.tab.deposits" },
          { id: "buys", labelKey: "activity.tab.buys" },
          { id: "sells", labelKey: "activity.tab.sells" },
          { id: "transfers", labelKey: "activity.tab.transfers" },
          { id: "withdrawals", labelKey: "activity.tab.withdrawals" },
        ] as const
      ).map((tab) => ({ id: tab.id, label: t(tab.labelKey) })),
    [t],
  );

  const periodOptions = useMemo(
    () => [
      { id: ACTIVITY_PERIOD_7D, label: t("activity.period.7d") },
      { id: ACTIVITY_PERIOD_30D, label: t("activity.period.30d") },
      { id: ACTIVITY_PERIOD_90D, label: t("activity.period.90d") },
      { id: ACTIVITY_PERIOD_180D, label: t("activity.period.180d") },
      { id: ACTIVITY_PERIOD_1Y, label: t("activity.period.1y") },
      { id: ACTIVITY_PERIOD_ALL, label: t("activity.period.all") },
    ],
    [t],
  );

  const releaseFilterOptions = useMemo(
    () => [
      { value: ACTIVITY_RELEASE_ALL, label: t("activity.filterAllReleases") },
      ...releaseOptions.map((r) => ({ value: r.id, label: r.title })),
    ],
    [releaseOptions, t],
  );

  const statusOptions = useMemo(
    () => [
      { id: ACTIVITY_STATUS_ALL, label: t("activity.filterAllStatuses") },
      ...STATUS_VALUES.map((v) => ({
        id: v,
        label: t(`activity.widgets.status.${v.toLowerCase()}`),
      })),
    ],
    [t],
  );

  const directionOptions = useMemo(
    () => [
      { value: ACTIVITY_DIRECTION_ALL, label: t("activity.direction.all") },
      { value: "in", label: t("activity.direction.in") },
      { value: "out", label: t("activity.direction.out") },
    ],
    [t],
  );

  const sortOptions = useMemo(
    () => [
      { id: "newest", label: t("activity.sort.newest") },
      { id: "oldest", label: t("activity.sort.oldest") },
      { id: "amount_desc", label: t("activity.sort.amountDesc") },
      { id: "amount_asc", label: t("activity.sort.amountAsc") },
    ],
    [t],
  );

  const hasExtraFilters =
    release !== ACTIVITY_RELEASE_ALL ||
    direction !== ACTIVITY_DIRECTION_ALL ||
    query.trim().length > 0;

  return (
    <section className={cn(assetsMutedCardClass, "space-y-3 sm:space-y-4 sm:px-5 sm:py-4")}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <MetricsGptToggle
          value={activeTab}
          onChange={(id) => onTabChange(id as ActivityFilterTab)}
          options={tabs}
          ariaLabel={t("activity.filters.tabsAria")}
          size="sm"
          className={cn(disabled && "pointer-events-none opacity-50")}
        />

        <div className="flex flex-wrap items-center gap-2">
          <AssetsGptMenu
            value={period}
            onChange={onPeriodChange}
            options={periodOptions}
            ariaLabel={t("activity.filters.dateLabel")}
            disabled={disabled}
          />
          <AssetsGptMenu
            value={status}
            onChange={onStatusChange}
            options={statusOptions}
            ariaLabel={t("activity.filters.statusLabel")}
            disabled={disabled}
          />
          <AssetsGptMenu
            value={sort}
            onChange={onSortChange}
            options={sortOptions}
            ariaLabel={t("activity.filters.sortLabel")}
            disabled={disabled}
          />
          <button
            type="button"
            disabled={disabled}
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((v) => !v)}
            className={cn(
              "inline-flex h-9 items-center rounded-full px-3.5 text-[13px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
              moreOpen || hasExtraFilters
                ? "bg-[#212121] text-white ring-1 ring-white/10"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80",
            )}
          >
            {t("activity.filters.more")}
          </button>
        </div>
      </div>

      {moreOpen ? (
        <div className="grid gap-3 border-t border-neutral-200/80 pt-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
          <AssetsSearchField
            value={query}
            onSubmit={onQueryChange}
            disabled={disabled}
            placeholder={t("activity.searchPlaceholder")}
            aria-label={t("activity.filters.searchLabel")}
            size="md"
            inputClassName="bg-white focus:bg-white"
          />
          <AssetsFilterSelect
            value={release}
            options={releaseFilterOptions}
            onSelect={onReleaseChange}
            disabled={disabled}
            className="min-w-[10rem] bg-white hover:bg-white"
          />
          <AssetsFilterSelect
            value={direction}
            options={directionOptions}
            onSelect={onDirectionChange}
            disabled={disabled}
            className="min-w-[9rem] bg-white hover:bg-white"
          />
        </div>
      ) : null}
    </section>
  );
}
