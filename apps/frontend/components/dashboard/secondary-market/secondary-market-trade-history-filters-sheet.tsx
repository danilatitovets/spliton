"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, RotateCcw } from "@/lib/lucide";

import { useI18n } from "@/components/providers/i18n-provider";
import { SecondaryMarketResponsiveSheet } from "@/components/dashboard/secondary-market/secondary-market-responsive-sheet";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { smExchange } from "@/components/dashboard/secondary-market/secondary-market-exchange-styles";
import { tf } from "@/lib/i18n/financial-messages";
import { statusLabel } from "@/lib/i18n/status-labels";
import { cn } from "@/lib/utils";

export type TradeHistoryPeriod = "7d" | "30d" | "90d" | "all";
export type TradeHistorySettlementFilter = "all" | "settled" | "processing" | "failed";
export type TradeHistorySideFilter = "all" | "buy" | "sell";
export type TradeHistorySortKey = "time" | "gross" | "price";
export type TradeHistorySortDir = "asc" | "desc";

export type TradeHistoryFiltersState = {
  period: TradeHistoryPeriod;
  sideFilter: TradeHistorySideFilter;
  settlementFilter: TradeHistorySettlementFilter;
  genreFilter: "all" | "electronic" | "pop" | "hiphop" | "rock";
  query: string;
  sortKey: TradeHistorySortKey;
  sortDir: TradeHistorySortDir;
};

const GENRE_LABELS: Record<TradeHistoryFiltersState["genreFilter"], string> = {
  all: "",
  electronic: "Electronic",
  pop: "Pop",
  hiphop: "Hip-hop",
  rock: "Rock",
};

type SecondaryMarketTradeHistoryFiltersSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: TradeHistoryFiltersState;
  onChange: (patch: Partial<TradeHistoryFiltersState>) => void;
  onReset: () => void;
  resultCount: number;
  totalCount: number;
};

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        smExchange.chipBase,
        active ? smExchange.chipActive : smExchange.chipIdle,
      )}
    >
      {label}
    </button>
  );
}

export function SecondaryMarketTradeHistoryFiltersSheet({
  open,
  onOpenChange,
  filters,
  onChange,
  onReset,
  resultCount,
  totalCount,
}: SecondaryMarketTradeHistoryFiltersSheetProps) {
  const { t, locale } = useI18n();

  const periodOptions = React.useMemo(
    (): { id: TradeHistoryPeriod; label: string }[] => [
      { id: "7d", label: t("secondaryMarket.filters.period7dLong") },
      { id: "30d", label: t("secondaryMarket.filters.period30dLong") },
      { id: "90d", label: t("secondaryMarket.filters.period90dLong") },
      { id: "all", label: t("secondaryMarket.filters.periodAllTime") },
    ],
    [t],
  );

  const settlementOptions = React.useMemo(
    (): { id: TradeHistorySettlementFilter; label: string }[] => [
      { id: "all", label: t("secondaryMarket.filters.all") },
      { id: "settled", label: statusLabel("trade", "settled", locale) },
      { id: "processing", label: statusLabel("trade", "processing", locale) },
      { id: "failed", label: statusLabel("trade", "failed", locale) },
    ],
    [t, locale],
  );

  const genreOptions = React.useMemo(
    (): { id: TradeHistoryFiltersState["genreFilter"]; label: string }[] => [
      { id: "all", label: t("secondaryMarket.filters.allGenres") },
      { id: "electronic", label: GENRE_LABELS.electronic },
      { id: "pop", label: GENRE_LABELS.pop },
      { id: "hiphop", label: GENRE_LABELS.hiphop },
      { id: "rock", label: GENRE_LABELS.rock },
    ],
    [t],
  );

  const sortOptions = React.useMemo(
    (): { id: TradeHistorySortKey; label: string }[] => [
      { id: "time", label: t("secondaryMarket.filters.sortByTime") },
      { id: "gross", label: t("secondaryMarket.filters.sortByGross") },
      { id: "price", label: t("secondaryMarket.filters.sortByPrice") },
    ],
    [t],
  );

  return (
    <SecondaryMarketResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      side="right"
      headerVideo
      title={t("secondaryMarket.trade.filtersTitle")}
      description={tf(t("secondaryMarket.trade.shownOfTrades"), {
        shown: String(resultCount),
        total: String(totalCount),
      })}
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
            {tf(t("secondaryMarket.trade.showTradesCount"), { count: String(resultCount) })}
          </SplitonCtaPill>
        </div>
      }
    >
      <div className="space-y-6 pb-2">
        <section>
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-500">
            {t("secondaryMarket.filters.searchPlaceholder")}
          </p>
          <input
            type="search"
            value={filters.query}
            onChange={(e) => onChange({ query: e.target.value })}
            placeholder={t("secondaryMarket.filters.searchTrades")}
            className={cn(smExchange.input, "mt-2 rounded-full")}
          />
        </section>

        <section>
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-500">
            {t("secondaryMarket.filters.period")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {periodOptions.map((opt) => (
              <FilterChip
                key={opt.id}
                active={filters.period === opt.id}
                label={opt.label}
                onClick={() => onChange({ period: opt.id })}
              />
            ))}
          </div>
        </section>

        <section>
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-500">
            {t("secondaryMarket.filters.side")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <FilterChip
              active={filters.sideFilter === "all"}
              label={t("secondaryMarket.filters.all")}
              onClick={() => onChange({ sideFilter: "all" })}
            />
            <FilterChip
              active={filters.sideFilter === "buy"}
              label={t("secondaryMarket.side.buy")}
              onClick={() => onChange({ sideFilter: "buy" })}
            />
            <FilterChip
              active={filters.sideFilter === "sell"}
              label={t("secondaryMarket.side.sell")}
              onClick={() => onChange({ sideFilter: "sell" })}
            />
          </div>
        </section>

        <section>
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-500">
            {t("secondaryMarket.filters.settlement")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {settlementOptions.map((opt) => (
              <FilterChip
                key={opt.id}
                active={filters.settlementFilter === opt.id}
                label={opt.label}
                onClick={() => onChange({ settlementFilter: opt.id })}
              />
            ))}
          </div>
        </section>

        <section>
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-500">
            {t("secondaryMarket.filters.genre")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {genreOptions.map((opt) => (
              <FilterChip
                key={opt.id}
                active={filters.genreFilter === opt.id}
                label={opt.label}
                onClick={() => onChange({ genreFilter: opt.id })}
              />
            ))}
          </div>
        </section>

        <section>
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-500">
            {t("secondaryMarket.filters.sort")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sortOptions.map((opt) => (
              <FilterChip
                key={opt.id}
                active={filters.sortKey === opt.id}
                label={opt.label}
                onClick={() => onChange({ sortKey: opt.id })}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => onChange({ sortDir: filters.sortDir === "desc" ? "asc" : "desc" })}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3.5 py-2 text-[12px] font-medium text-zinc-400 transition hover:bg-white/[0.1] hover:text-zinc-200"
          >
            {filters.sortDir === "desc" ? (
              <>
                <ArrowDown className="size-3.5" aria-hidden />
                {t("secondaryMarket.filters.sortDescending")}
              </>
            ) : (
              <>
                <ArrowUp className="size-3.5" aria-hidden />
                {t("secondaryMarket.filters.sortAscending")}
              </>
            )}
          </button>
        </section>
      </div>
    </SecondaryMarketResponsiveSheet>
  );
}

export function countActiveTradeHistoryFilters(filters: TradeHistoryFiltersState): number {
  let n = 0;
  if (filters.period !== "30d") n += 1;
  if (filters.sideFilter !== "all") n += 1;
  if (filters.settlementFilter !== "all") n += 1;
  if (filters.genreFilter !== "all") n += 1;
  if (filters.query.trim()) n += 1;
  if (filters.sortKey !== "time" || filters.sortDir !== "desc") n += 1;
  return n;
}
