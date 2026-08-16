"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { adaptPositionRow } from "@/lib/portfolio/portfolio-adapter";
import { getClientCache, setClientCache } from "@/lib/client-data-cache";
import { useCabinetDemoPreview } from "@/hooks/use-cabinet-demo-preview";
import { isLivePortfolioEnabled } from "@/lib/public-env";
import {
  fetchPortfolioPositions,
  portfolioErrorMessage,
  type PortfolioPositionApi,
} from "@/services/portfolio.service";

export const POSITIONS_STATUS_ALL = "__all__";
export const POSITIONS_GENRE_ALL = "__all__";

export type PositionsSort =
  | "value_desc"
  | "value_asc"
  | "units_desc"
  | "units_asc"
  | "newest"
  | "updated"
  | "payout_desc"
  | "liquidity_desc";

export type PositionsPageFilters = {
  q: string;
  status: string;
  genre: string;
  sort: PositionsSort;
  page: number;
  pageSize: number;
};

const DEFAULT_FILTERS: PositionsPageFilters = {
  q: "",
  status: POSITIONS_STATUS_ALL,
  genre: POSITIONS_GENRE_ALL,
  sort: "value_desc",
  page: 1,
  pageSize: 20,
};

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function buildApiQuery(filters: PositionsPageFilters, debouncedQ: string) {
  const q = debouncedQ.trim();
  return {
    q: q || undefined,
    status:
      filters.status !== POSITIONS_STATUS_ALL ? filters.status : undefined,
    genre: filters.genre !== POSITIONS_GENRE_ALL ? filters.genre : undefined,
    sort: filters.sort,
    page: filters.page,
    limit: filters.pageSize,
  };
}

export function useAssetsPositionsPage(initial: Partial<PositionsPageFilters> = {}) {
  const { authorizedFetch, isAuthenticated, user } = useAuth();
  const { locale } = useI18n();
  const demoPreview = useCabinetDemoPreview();
  const live = isLivePortfolioEnabled() && isAuthenticated && !demoPreview;

  const [filters, setFilters] = useState<PositionsPageFilters>({
    ...DEFAULT_FILTERS,
    ...initial,
  });
  const debouncedQ = useDebouncedValue(filters.q, 350);

  const apiQuery = useMemo(
    () => buildApiQuery(filters, debouncedQ),
    [filters, debouncedQ],
  );
  const positionsCacheKey = useMemo(
    () => `assets:positions:${user?.id ?? "anon"}:${JSON.stringify(apiQuery)}`,
    [apiQuery, user?.id],
  );

  const [rawItems, setRawItems] = useState<PortfolioPositionApi[] | null>(() =>
    live ? getClientCache<{ items: PortfolioPositionApi[]; total: number }>(positionsCacheKey)?.items ?? null : null,
  );
  const [total, setTotal] = useState(
    () =>
      (live
        ? getClientCache<{ items: PortfolioPositionApi[]; total: number }>(positionsCacheKey)?.total
        : 0) ?? 0,
  );
  const [loading, setLoading] = useState(
    () => live && !getClientCache(positionsCacheKey),
  );
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!live) return;
    const cached = getClientCache<{ items: PortfolioPositionApi[]; total: number }>(
      positionsCacheKey,
    );
    if (cached) {
      setRawItems(cached.items);
      setTotal(cached.total);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await fetchPortfolioPositions(authorizedFetch, apiQuery);
      setRawItems(res.items);
      setTotal(res.total);
      setClientCache(positionsCacheKey, { items: res.items, total: res.total });
    } catch (e) {
      setError(portfolioErrorMessage(e));
      if (!cached) {
        setRawItems(null);
        setTotal(0);
      }
    } finally {
      setLoading(false);
    }
  }, [authorizedFetch, apiQuery, live, positionsCacheKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = useMemo(
    () => (rawItems ? rawItems.map((row) => adaptPositionRow(row, locale)) : null),
    [locale, rawItems],
  );

  const genreOptions = useMemo(() => {
    const set = new Set<string>();
    for (const row of rawItems ?? []) {
      if (row.genre) set.add(row.genre);
    }
    return [...set].sort((a, b) => a.localeCompare(b, locale));
  }, [locale, rawItems]);

  const hasActiveFilters =
    filters.status !== POSITIONS_STATUS_ALL ||
    filters.genre !== POSITIONS_GENRE_ALL ||
    debouncedQ.trim().length > 0;

  const updateFilters = useCallback((patch: Partial<PositionsPageFilters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...patch };
      const resetsPage =
        patch.page === undefined &&
        (patch.q !== undefined ||
          patch.status !== undefined ||
          patch.genre !== undefined ||
          patch.sort !== undefined);
      if (resetsPage) next.page = 1;
      return next;
    });
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page: Math.max(1, page) }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
  }, []);

  return {
    live,
    filters,
    updateFilters,
    setPage,
    resetFilters,
    rows,
    rawItems,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    genreOptions,
    loading,
    error,
    hasActiveFilters,
    reload: load,
  };
}
