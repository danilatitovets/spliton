"use client";

import { RotateCcw } from "@/lib/lucide";

import { useI18n } from "@/components/providers/i18n-provider";
import { SecondaryMarketResponsiveSheet } from "@/components/dashboard/secondary-market/secondary-market-responsive-sheet";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import {
  type MarketTabFiltersState,
} from "@/lib/secondary-market/market-tab-filters";
import { MARKET_LISTING_STATUS_FILTERS, MARKET_LISTING_SORT_KEYS } from "@/lib/secondary-market/market-listings-query";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: MarketTabFiltersState;
  onChange: (patch: Partial<MarketTabFiltersState>) => void;
  onReset: () => void;
  resultCount: number;
};

const chipBase =
  "shrink-0 rounded-full px-3.5 py-2 text-[12px] font-medium tracking-[-0.01em] transition-colors";
const chipActive = "bg-white text-black";
const chipIdle = "bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1] hover:text-zinc-200";
const fieldLabel = "mb-1.5 block text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-500";
const fieldInput =
  "h-11 w-full rounded-full bg-white/[0.06] px-4 font-mono text-[13px] tabular-nums text-white outline-none placeholder:text-zinc-600 transition focus:bg-white/[0.09]";

export function SecondaryMarketMarketFiltersSheet({
  open,
  onOpenChange,
  filters,
  onChange,
  onReset,
  resultCount,
}: Props) {
  const { t } = useI18n();

  return (
    <SecondaryMarketResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      side="right"
      headerVideo
      title={t("secondaryMarket.filters.sheetTitle")}
      description={
        <>
          {t("secondaryMarket.filters.sheetDesc")}{" "}
          <span className="font-mono text-white/70">{resultCount}</span>
        </>
      }
      footer={
        <div className="flex w-full items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-white/[0.06] px-4 text-[13px] font-medium text-zinc-300 transition hover:bg-white/[0.1] hover:text-white"
          >
            <RotateCcw className="size-3.5 opacity-70" aria-hidden />
            {t("secondaryMarket.filters.resetFilters")}
          </button>
          <SplitonCtaPill
            type="button"
            tone="onDark"
            onClick={() => onOpenChange(false)}
            className="h-11 min-w-0 flex-[1.2] justify-between gap-2 pl-4 pr-1.5 text-[13px] font-semibold"
          >
            {t("secondaryMarket.filters.apply")}
          </SplitonCtaPill>
        </div>
      }
    >
      <div className="space-y-6 pb-2">
        <section>
          <p className={fieldLabel}>{t("secondaryMarket.filters.status")}</p>
          <div className="flex flex-wrap gap-2">
            {MARKET_LISTING_STATUS_FILTERS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onChange({ status: id })}
                className={cn(chipBase, filters.status === id ? chipActive : chipIdle)}
              >
                {t(`secondaryMarket.filters.listingStatus.${id}`)}
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className={fieldLabel}>{t("secondaryMarket.filters.sort")}</p>
          <div className="flex flex-wrap gap-2">
            {MARKET_LISTING_SORT_KEYS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onChange({ sort: id })}
                className={cn(chipBase, filters.sort === id ? chipActive : chipIdle)}
              >
                {t(`secondaryMarket.filters.listingSort.${id}`)}
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-x-3 gap-y-4">
          <label className="block">
            <span className={fieldLabel}>{t("secondaryMarket.filters.priceMin")}</span>
            <input
              type="text"
              inputMode="decimal"
              value={filters.priceMin}
              onChange={(e) => onChange({ priceMin: e.target.value })}
              className={fieldInput}
            />
          </label>
          <label className="block">
            <span className={fieldLabel}>{t("secondaryMarket.filters.priceMax")}</span>
            <input
              type="text"
              inputMode="decimal"
              value={filters.priceMax}
              onChange={(e) => onChange({ priceMax: e.target.value })}
              className={fieldInput}
            />
          </label>
          <label className="block">
            <span className={fieldLabel}>{t("secondaryMarket.filters.yieldMin")}</span>
            <input
              type="text"
              inputMode="decimal"
              value={filters.yieldMin}
              onChange={(e) => onChange({ yieldMin: e.target.value })}
              className={fieldInput}
            />
          </label>
          <label className="block">
            <span className={fieldLabel}>{t("secondaryMarket.filters.yieldMax")}</span>
            <input
              type="text"
              inputMode="decimal"
              value={filters.yieldMax}
              onChange={(e) => onChange({ yieldMax: e.target.value })}
              className={fieldInput}
            />
          </label>
          <label className="block">
            <span className={fieldLabel}>{t("secondaryMarket.filters.unitsMin")}</span>
            <input
              type="text"
              inputMode="decimal"
              value={filters.unitsMin}
              onChange={(e) => onChange({ unitsMin: e.target.value })}
              className={fieldInput}
            />
          </label>
          <label className="block">
            <span className={fieldLabel}>{t("secondaryMarket.filters.unitsMax")}</span>
            <input
              type="text"
              inputMode="decimal"
              value={filters.unitsMax}
              onChange={(e) => onChange({ unitsMax: e.target.value })}
              className={fieldInput}
            />
          </label>
        </section>
      </div>
    </SecondaryMarketResponsiveSheet>
  );
}
