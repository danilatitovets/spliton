"use client";

import * as React from "react";
import Link from "next/link";
import { Search, SlidersHorizontal } from "@/lib/lucide";

import { MetricsGptToggle } from "@/components/dashboard/assets/metrics-gpt-toggle";
import { SecondaryMarketResponsiveSheet } from "@/components/dashboard/secondary-market/secondary-market-responsive-sheet";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  MARKET_CATEGORY_TABS,
  MARKET_FILTER_GROUPS,
  MARKET_OVERVIEW_PERIODS,
  type MarketFilterId,
} from "@/constants/market-overview/page";
import { ROUTES } from "@/constants/routes";
import type { MarketOverviewFilters as MarketOverviewFilterState } from "@/hooks/use-market-overview-state";
import { cn } from "@/lib/utils";
import type { MarketOverviewCategory, MarketOverviewPeriod } from "@/types/market-overview";

const FILTER_HEADER_VIDEO = "/videos/position-holding-bg.mp4";

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold tracking-tight transition",
        active
          ? "bg-white text-black"
          : "bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1] hover:text-zinc-200",
      )}
    >
      {children}
    </button>
  );
}

function filterOptionLabel(t: (key: string) => string, groupId: MarketFilterId, value: string): string {
  if (value === "all") return t("marketOverview.filter.all");
  if (value === "any") return t("marketOverview.filter.payout.any");
  const key = `marketOverview.filter.${groupId}.${value}`;
  const translated = t(key);
  return translated !== key ? translated : value;
}

function countActiveFilters(filters: MarketOverviewFilterState): number {
  return MARKET_FILTER_GROUPS.reduce((n, g) => {
    const v = filters[g.id];
    return n + (v && v !== "all" && v !== "any" ? 1 : 0);
  }, 0);
}

export function MarketOverviewFiltersToolbar({
  categoryTab,
  onCategoryTab,
  filters,
  onFilterChange,
  search,
  onSearchChange,
  period,
  onPeriodChange,
}: {
  categoryTab: MarketOverviewCategory;
  onCategoryTab: (v: MarketOverviewCategory) => void;
  filters: MarketOverviewFilterState;
  onFilterChange: (id: keyof MarketOverviewFilterState, value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  period: MarketOverviewPeriod;
  onPeriodChange: (p: MarketOverviewPeriod) => void;
}) {
  const { t } = useI18n();
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const activeCount = countActiveFilters(filters);

  return (
    <>
      <section
        className="sticky top-0 z-[60] isolate shrink-0 overflow-hidden border-b border-white/[0.06] bg-black"
        aria-label={t("marketOverview.toolbar.searchSr")}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <video
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-[10px] motion-reduce:hidden"
            src={FILTER_HEADER_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 bg-black/88 motion-reduce:bg-black" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1400px] space-y-3 px-4 py-3.5 md:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2.5 sm:gap-4">
              <div className="flex min-h-9 items-center gap-5">
                <Link
                  href={ROUTES.dashboardCatalog}
                  className="inline-flex shrink-0 items-center border-b-2 border-transparent pb-1.5 text-[15px] font-medium text-zinc-500 transition hover:text-zinc-300"
                >
                  {t("catalog.markets.tabCatalog")}
                </Link>
                <Link
                  href={ROUTES.catalogMarketOverview}
                  className="inline-flex shrink-0 items-center border-b-2 border-white pb-1.5 text-[15px] font-semibold text-white"
                >
                  {t("catalog.markets.tabOverview")}
                </Link>
              </div>
              <MetricsGptToggle
                size="sm"
                ariaLabel={t("marketOverview.toolbar.periodSr")}
                value={period}
                onChange={onPeriodChange}
                options={MARKET_OVERVIEW_PERIODS.map((p) => ({
                  id: p.id,
                  label: t(`marketOverview.period.${p.id}`),
                }))}
              />
            </div>

            <div className="flex w-full items-center gap-2 lg:w-auto lg:max-w-md">
              <div className="relative min-w-0 flex-1 lg:w-[280px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={t("marketOverview.toolbar.searchPlaceholder")}
                  className="h-9 w-full rounded-full border-0 bg-white/[0.06] py-2 pl-9 pr-3 text-[12px] text-zinc-100 outline-none ring-1 ring-white/[0.08] placeholder:text-zinc-600 focus:bg-white/[0.09] focus:ring-white/20"
                />
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full px-3.5 text-[12px] font-semibold transition",
                  activeCount > 0
                    ? "bg-white text-black"
                    : "bg-white/[0.06] text-zinc-300 ring-1 ring-white/[0.08] hover:bg-white/[0.1] hover:text-white",
                )}
              >
                <SlidersHorizontal className="size-3.5" strokeWidth={1.75} aria-hidden />
                {t("catalog.filters.mobileButton")}
                {activeCount > 0 ? (
                  <span className="rounded-full bg-black/15 px-1.5 py-0.5 font-mono text-[11px] tabular-nums">
                    {activeCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {MARKET_CATEGORY_TABS.map((tab) => (
              <Pill
                key={tab.id}
                active={categoryTab === tab.id}
                onClick={() => onCategoryTab(tab.id)}
              >
                {t(`marketOverview.tab.${tab.id}`)}
              </Pill>
            ))}
          </div>
        </div>
      </section>

      <SecondaryMarketResponsiveSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        headerVideo
        headerVideoSrc={FILTER_HEADER_VIDEO}
        title={t("catalog.filters.title")}
        description={t("marketOverview.info.page")}
        footer={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                for (const g of MARKET_FILTER_GROUPS) onFilterChange(g.id, "all");
              }}
              className="h-11 flex-1 rounded-full bg-white/[0.06] text-[13px] font-semibold text-zinc-200 transition hover:bg-white/[0.1]"
            >
              {t("catalog.filters.reset")}
            </button>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="h-11 flex-1 rounded-full bg-white text-[13px] font-semibold text-black transition hover:bg-zinc-100"
            >
              {t("catalog.filters.apply")}
            </button>
          </div>
        }
      >
        <div className="space-y-5 px-1 pb-2">
          {MARKET_FILTER_GROUPS.map((group) => (
            <div key={group.id}>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                {t(`marketOverview.filter.${group.id}`)}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.options.map((opt) => {
                  const active = filters[group.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onFilterChange(group.id, opt.value)}
                      className={cn(
                        "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition",
                        active
                          ? "bg-white text-black"
                          : "bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1] hover:text-zinc-200",
                      )}
                    >
                      {filterOptionLabel(t, group.id, opt.value)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </SecondaryMarketResponsiveSheet>
    </>
  );
}
