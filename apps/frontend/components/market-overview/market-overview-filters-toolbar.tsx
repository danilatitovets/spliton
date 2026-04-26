"use client";

import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import type {
  MarketOverviewFilters as MarketOverviewFilterState,
} from "@/hooks/use-market-overview-state";
import type { MarketOverviewCategory } from "@/types/market-overview";

import { MarketOverviewFilters } from "./market-overview-filters";
import { MarketOverviewTabs } from "./market-overview-tabs";

export function MarketOverviewFiltersToolbar({
  categoryTab,
  onCategoryTab,
  filters,
  onFilterChange,
}: {
  categoryTab: MarketOverviewCategory;
  onCategoryTab: (v: MarketOverviewCategory) => void;
  filters: MarketOverviewFilterState;
  onFilterChange: (id: keyof MarketOverviewFilterState, value: string) => void;
}) {
  return (
    <div className="sticky top-0 z-60 shrink-0 border-b border-white/8 bg-black/90 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-[1400px] space-y-2.5 px-4 py-3 md:space-y-3 md:px-6 md:py-3.5 lg:px-8">
        <MarketOverviewTabs value={categoryTab} onChange={onCategoryTab} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <MarketOverviewFilters filters={filters} onChange={onFilterChange} />
          </div>
          <Link
            href={ROUTES.dashboardCatalog}
            title="Открыть каталог релизов: выбор актива и покупка UNT"
            className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-white px-5 py-2.5 text-[13px] font-semibold text-black transition-opacity hover:opacity-90 sm:w-auto"
          >
            Купить релиз
          </Link>
        </div>
      </div>
    </div>
  );
}
