"use client";

import * as React from "react";

import { MARKET_OVERVIEW_ROWS } from "@/mocks/market-overview-rows";
import type {
  MarketOverviewCategory,
  MarketOverviewPeriod,
  MarketOverviewRow,
  MarketTableSortKey,
} from "@/types/market-overview";

export type MarketOverviewFilters = Record<
  "genre" | "status" | "payoutFreq" | "liquidity" | "yield" | "availability",
  string
>;

const defaultFilters: MarketOverviewFilters = {
  genre: "all",
  status: "all",
  payoutFreq: "all",
  liquidity: "all",
  yield: "all",
  availability: "all",
};

function segmentSlug(segment: string): string {
  const s = segment.toLowerCase();
  if (s.includes("hip")) return "hiphop";
  if (s.includes("lo-fi") || s === "lofi") return "lofi";
  if (s === "pop") return "pop";
  if (s.includes("electronic")) return "electronic";
  if (s.includes("indie")) return "indie";
  return "all";
}

function statusSlug(status: MarketOverviewRow["status"]): string {
  if (status === "Активен") return "active";
  if (status === "Новый") return "new";
  if (status === "Пауза") return "paused";
  if (status === "Закрыт") return "closed";
  return "all";
}

function liquiditySlug(label: MarketOverviewRow["liquidityLabel"]): string {
  return label.toLowerCase() as "deep" | "mid" | "thin";
}

function passesFilters(row: MarketOverviewRow, f: MarketOverviewFilters): boolean {
  if (f.genre !== "all" && segmentSlug(row.segment) !== f.genre) return false;
  if (f.status !== "all" && statusSlug(row.status) !== f.status) return false;
  if (f.payoutFreq !== "all" && row.payoutFreq !== f.payoutFreq) return false;
  if (f.liquidity !== "all" && liquiditySlug(row.liquidityLabel) !== f.liquidity) return false;
  if (f.yield === "high" && row.yieldPct < 12) return false;
  if (f.yield === "mid" && (row.yieldPct < 8 || row.yieldPct >= 12)) return false;
  if (f.yield === "low" && row.yieldPct >= 8) return false;
  if (f.availability === "tight" && !(row.availableUnits > 0 && row.availableUnits < 100_000)) return false;
  if (f.availability === "wide" && row.availableUnits <= 200_000) return false;
  return true;
}

function passesCategory(row: MarketOverviewRow, tab: MarketOverviewCategory): boolean {
  if (tab === "all") return true;
  return row.categories.includes(tab);
}

function sortRows(rows: MarketOverviewRow[], key: MarketTableSortKey, dir: "asc" | "desc"): MarketOverviewRow[] {
  const mul = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    if (key === "yield") return (a.yieldPct - b.yieldPct) * mul;
    if (key === "payouts") return (a.payoutsUsdt - b.payoutsUsdt) * mul;
    if (key === "activity") return (a.activityScore - b.activityScore) * mul;
    return (a.availableUnits - b.availableUnits) * mul;
  });
}

export function useMarketOverviewState() {
  const [period, setPeriod] = React.useState<MarketOverviewPeriod>("7d");
  const [categoryTab, setCategoryTab] = React.useState<MarketOverviewCategory>("all");
  const [filters, setFilters] = React.useState<MarketOverviewFilters>(defaultFilters);
  const [sort, setSort] = React.useState<MarketTableSortKey>("activity");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");

  const setFilter = React.useCallback((id: keyof MarketOverviewFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleSort = React.useCallback(
    (key: MarketTableSortKey) => {
      if (sort === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else {
        setSort(key);
        setSortDir("desc");
      }
    },
    [sort],
  );

  const resetFilters = React.useCallback(() => {
    setFilters(defaultFilters);
    setCategoryTab("all");
  }, []);

  const filteredRows = React.useMemo(() => {
    const base = MARKET_OVERVIEW_ROWS.filter((r) => passesCategory(r, categoryTab) && passesFilters(r, filters));
    return sortRows(base, sort, sortDir);
  }, [categoryTab, filters, sort, sortDir]);

  const lastUpdated = new Date().toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
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
  };
}
