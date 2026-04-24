"use client";

import * as React from "react";

import { RELEASE_ANALYTICS_ROWS_MOCK } from "@/mocks/analytics/releases.mock";
import type {
  ReleaseAnalyticsChipPreset,
  ReleaseAnalyticsPeriod,
  ReleaseAnalyticsRow,
  ReleaseAnalyticsSectionTab,
  ReleaseAnalyticsSortKey,
  ReleaseRowGenre,
  ReleaseRowStatus,
} from "@/types/analytics/releases";

function parseMoney(s: string) {
  return Number(s.replace(/[^\d]/g, "")) || 0;
}

function parsePct(s: string) {
  return Number(s.replace("%", "")) || 0;
}

function parseUnits(s: string) {
  return Number(s.replace(/\s/g, "").replace(",", ".")) || 0;
}

export function useReleaseAnalyticsState() {
  const [period, setPeriod] = React.useState<ReleaseAnalyticsPeriod>("30d");
  const [query, setQuery] = React.useState("");
  const [statusTab, setStatusTab] = React.useState<"all" | ReleaseRowStatus>("all");
  const [sort, setSort] = React.useState<ReleaseAnalyticsSortKey>("yield");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [genre, setGenre] = React.useState<"all" | ReleaseRowGenre>("all");
  const [chipPreset, setChipPreset] = React.useState<ReleaseAnalyticsChipPreset>("all");
  const [sectionTab, setSectionTab] = React.useState<ReleaseAnalyticsSectionTab>("analytics");
  const [watch, setWatch] = React.useState<Record<string, boolean>>({});

  const stats = React.useMemo(() => {
    const m =
      period === "7d" ? 0.22 : period === "30d" ? 1 : period === "90d" ? 2.85 : 1;
    return {
      avgYield: `${(11.2 * m).toFixed(1)}%`,
      active: period === "all" ? "128" : period === "7d" ? "42" : period === "30d" ? "61" : "74",
      payouts:
        period === "all"
          ? "42.6M USDT"
          : period === "7d"
            ? "1.1M USDT"
            : period === "30d"
              ? "6.8M USDT"
              : "18.4M USDT",
      payoutLag: period === "7d" ? "11 дн." : period === "30d" ? "14 дн." : period === "90d" ? "16 дн." : "15 дн.",
    };
  }, [period]);

  const handleSort = React.useCallback(
    (key: ReleaseAnalyticsSortKey) => {
      if (sort === key) {
        setSortDir((d) => (d === "desc" ? "asc" : "desc"));
      } else {
        setSort(key);
        setSortDir("desc");
      }
    },
    [sort],
  );

  const filteredRows = React.useMemo(() => {
    let rows: ReleaseAnalyticsRow[] = [...RELEASE_ANALYTICS_ROWS_MOCK];
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.symbol.toLowerCase().includes(q) ||
          r.release.toLowerCase().includes(q) ||
          r.artist.toLowerCase().includes(q),
      );
    }
    if (statusTab !== "all") {
      rows = rows.filter((r) => r.status === statusTab);
    }
    if (genre !== "all") {
      rows = rows.filter((r) => r.genre === genre);
    }
    if (chipPreset === "top") {
      rows = rows.filter((r) => (Number(r.yieldPct.replace("%", "")) || 0) >= 12);
    } else if (chipPreset === "stable") {
      rows = rows.filter((r) => r.trend === "flat");
    } else if (chipPreset === "growth") {
      rows = rows.filter((r) => r.trend === "up");
    }
    const mul = sortDir === "desc" ? -1 : 1;
    rows.sort((a, b) => {
      if (sort === "yield") return (parsePct(b.yieldPct) - parsePct(a.yieldPct)) * mul;
      if (sort === "payouts") return (parseMoney(b.payouts) - parseMoney(a.payouts)) * mul;
      return (parseUnits(b.units) - parseUnits(a.units)) * mul;
    });
    return rows;
  }, [chipPreset, genre, query, sort, sortDir, statusTab]);

  return {
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
  };
}
