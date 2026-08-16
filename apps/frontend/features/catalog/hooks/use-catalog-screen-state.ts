"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useI18n } from "@/components/providers/i18n-provider";
import { useCatalogPriceLabel } from "@/hooks/use-catalog-i18n";
import { catalogItems } from "@/lib/catalog-mock";
import { localizeCatalogItem } from "@/lib/catalog/catalog-adapter";
import {
  buildCatalogUrlSearchParams,
  parseCatalogSearchParams,
  type CatalogListQueryParams,
} from "@/lib/catalog/catalog-api-query";
import { catalogMatchesFilters, sortCatalogItems } from "@/lib/catalog/catalog-filter";
import type { CatalogItem } from "@/lib/catalog-mock";
import {
  fetchCatalogFilters,
  fetchCatalogStats,
  isLiveCatalogEnabled,
  loadLiveCatalogItems,
} from "@/services/catalog.service";
import type {
  CatalogFundingPhase,
  CatalogGenreFilter,
  CatalogGridView,
  CatalogKindFilter,
  CatalogPagination,
  CatalogSortKey,
  CatalogStats,
} from "@/types/catalog/page";

import { getClientCache, setClientCache } from "@/lib/client-data-cache";
import { useCatalogFavorites } from "./use-catalog-favorites";

const LIVE_DEBOUNCE_MS = 320;
const DEFAULT_PAGE_SIZE = 24;

function applyClientPhaseFilter(items: CatalogItem[], phase: CatalogFundingPhase): CatalogItem[] {
  if (phase === "all") return items;
  if (phase === "open") return items.filter((it) => it.kind !== "funding" || it.status === "open");
  return items.filter((it) => it.kind !== "funding" || it.status === "payouts");
}

function applyClientKindFilter(items: CatalogItem[], kind: CatalogKindFilter): CatalogItem[] {
  if (kind === "funding") return items.filter((it) => it.kind === "funding");
  if (kind === "market") return items.filter((it) => it.kind === "market");
  return items;
}

export function useCatalogScreenState() {
  const { locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlState = useMemo(
    () => parseCatalogSearchParams(searchParams),
    [searchParams],
  );

  const favorites = useCatalogFavorites();
  const suppressCatalogReloadRef = useRef(false);

  const [catalogView, setCatalogView] = useState<CatalogGridView>("list");
  const [query, setQuery] = useState(urlState.search ?? "");
  const [kind, setKind] = useState<CatalogKindFilter>(urlState.kind ?? "all");
  const [phase, setPhase] = useState<CatalogFundingPhase>(urlState.phase ?? "all");
  const [genre, setGenre] = useState(urlState.genre ?? "");
  const [sort, setSort] = useState<CatalogSortKey>(urlState.sort ?? "catalog_order");
  const [minPrice, setMinPrice] = useState(urlState.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(urlState.maxPrice ?? "");
  const [minProgress, setMinProgress] = useState(urlState.minProgress ?? "");
  const [minYield, setMinYield] = useState(urlState.minYield ?? "");
  const [minLiquidity, setMinLiquidity] = useState(urlState.minLiquidity ?? "");
  const [favoritesOnly, setFavoritesOnlyState] = useState(Boolean(urlState.favoritesOnly));
  const [page, setPage] = useState(urlState.page ?? 1);

  const liveMode = isLiveCatalogEnabled();
  const [liveItems, setLiveItems] = useState<CatalogItem[] | null>(null);
  const [liveGenres, setLiveGenres] = useState<CatalogGenreFilter[] | null>(null);
  const [pagination, setPagination] = useState<CatalogPagination | null>(null);
  const [stats, setStats] = useState<CatalogStats | null>(null);
  const [statsUnavailable, setStatsUnavailable] = useState(false);
  const [filtersDegraded, setFiltersDegraded] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(liveMode);
  const [catalogError, setCatalogError] = useState<unknown>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const setFavoritesOnly = useCallback(
    (next: boolean) => {
      if (next && !favorites.isAuthenticated) {
        if (favorites.authLoading) return;
        favorites.requireAuth();
        return;
      }
      setFavoritesOnlyState(next);
      setPage(1);
    },
    [favorites],
  );

  // Drop favorites filter if user logs out while it is on.
  useEffect(() => {
    if (!favorites.isAuthenticated && favoritesOnly) {
      setFavoritesOnlyState(false);
    }
  }, [favorites.isAuthenticated, favoritesOnly]);

  const favoriteReleaseIdsKey = useMemo(() => {
    if (!favoritesOnly || !favorites.isAuthenticated) return "";
    return [...favorites.favoriteIdList].sort().join(",");
  }, [favoritesOnly, favorites.isAuthenticated, favorites.favoriteIdList]);

  const listQuery = useMemo((): CatalogListQueryParams => {
    const base: CatalogListQueryParams = {
      search: query,
      genre,
      kind,
      phase,
      sort,
      minPrice,
      maxPrice,
      minProgress,
      minYield,
      minLiquidity,
      favoritesOnly,
      page,
      pageSize: DEFAULT_PAGE_SIZE,
    };
    if (favoriteReleaseIdsKey) {
      base.releaseIds = favoriteReleaseIdsKey.split(",");
    }
    return base;
  }, [
    query,
    genre,
    kind,
    phase,
    sort,
    minPrice,
    maxPrice,
    minProgress,
    minYield,
    minLiquidity,
    favoritesOnly,
    favoriteReleaseIdsKey,
    page,
  ]);

  const syncUrl = useCallback(
    (next: CatalogListQueryParams) => {
      const sp = buildCatalogUrlSearchParams(next);
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  // Debounce URL sync so typing filters does not trigger RSC navigation storms.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      syncUrl(listQuery);
    }, 320);
    return () => window.clearTimeout(handle);
  }, [listQuery, syncUrl]);

  const loadLive = useCallback(async () => {
    if (!liveMode) return;

    // Favorites filter with empty watchlist → empty list (no round-trip).
    if (favoritesOnly && favorites.isAuthenticated && favorites.ready && favorites.favoriteIdList.length === 0) {
      setLiveItems([]);
      setPagination({
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
      });
      setCatalogLoading(false);
      setCatalogError(null);
      return;
    }

    // Wait for watchlist hydrate before requesting favorites-only page.
    if (favoritesOnly && favorites.isAuthenticated && !favorites.ready) {
      setCatalogLoading(true);
      return;
    }

    const cacheKey = `catalog:list:${locale}:${JSON.stringify(listQuery)}`;
    const cached = getClientCache<{ items: CatalogItem[]; pagination: CatalogPagination | null }>(
      cacheKey,
      60_000,
    );
    if (cached) {
      // Soft-nav: show stale list immediately — no full-page skeleton.
      setLiveItems(cached.items);
      setPagination(cached.pagination);
      setCatalogLoading(false);
    } else {
      setCatalogLoading(true);
    }
    setCatalogError(null);
    try {
      const { items, pagination: pg } = await loadLiveCatalogItems(listQuery, locale);
      setLiveItems(items);
      setPagination(pg);
      setClientCache(cacheKey, { items, pagination: pg });
    } catch (e) {
      setCatalogError(e);
      if (!cached) {
        setLiveItems([]);
        setPagination(null);
      }
    } finally {
      setCatalogLoading(false);
    }
  }, [
    liveMode,
    listQuery,
    locale,
    favoritesOnly,
    favorites.isAuthenticated,
    favorites.ready,
    favoriteReleaseIdsKey,
  ]);

  useEffect(() => {
    if (!liveMode) return;
    void fetchCatalogStats()
      .then((next) => {
        setStats(next);
        setStatsUnavailable(false);
      })
      .catch(() => {
        setStats(null);
        setStatsUnavailable(true);
      });
  }, [liveMode]);

  useEffect(() => {
    if (!liveMode) return;
    const mappedKind =
      kind === "funding" ? "funding" : kind === "market" ? "secondary" : "all";
    void fetchCatalogFilters(mappedKind)
      .then((f) => {
        setLiveGenres(f.genres ?? []);
        setFiltersDegraded(false);
      })
      .catch(() => {
        setLiveGenres(null);
        setFiltersDegraded(true);
      });
  }, [liveMode, kind]);

  useEffect(() => {
    if (!liveMode) {
      setLiveItems(null);
      setCatalogLoading(false);
      return;
    }
    if (suppressCatalogReloadRef.current) {
      suppressCatalogReloadRef.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      void loadLive();
    }, LIVE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [liveMode, loadLive]);

  const toggleFavorite = useCallback(
    async (releaseId: string) => {
      const wasFavorite = favorites.isFavorite(releaseId);
      if (wasFavorite && favoritesOnly) {
        suppressCatalogReloadRef.current = true;
        setLiveItems((prev) => (prev ? prev.filter((item) => item.id !== releaseId) : prev));
        setPagination((pg) =>
          pg
            ? {
                ...pg,
                total: Math.max(0, pg.total - 1),
                totalPages: Math.max(0, Math.ceil(Math.max(0, pg.total - 1) / pg.pageSize)),
              }
            : pg,
        );
      }
      return favorites.toggleFavorite(releaseId);
    },
    [favorites, favoritesOnly],
  );

  const localizedMockItems = useMemo(
    () => catalogItems.map((item) => localizeCatalogItem(item, locale)),
    [locale],
  );

  const sourceItems = liveMode ? (liveItems ?? []) : localizedMockItems;
  const catalogOrder = useMemo(
    () => new Map(sourceItems.map((it, i) => [it.id, i])),
    [sourceItems],
  );

  const genres = useMemo(() => {
    if (liveMode && liveGenres && !filtersDegraded) return liveGenres.map((g) => g.name);
    const g = new Set<string>();
    for (const it of sourceItems) g.add(it.genre);
    return Array.from(g).sort((a, b) => a.localeCompare(b, locale));
  }, [liveMode, liveGenres, filtersDegraded, sourceItems, locale]);

  const genreCounts = useMemo(() => {
    const map = new Map<string, number>();
    if (liveMode && liveGenres && !filtersDegraded) {
      for (const g of liveGenres) map.set(g.name, g.count);
    }
    return map;
  }, [liveMode, liveGenres, filtersDegraded]);

  const filtered = useMemo(() => {
    if (liveMode) return sourceItems;
    const base = sourceItems.filter((item) =>
      catalogMatchesFilters(item, {
        kind,
        phase,
        genre,
        query,
        minPrice,
        maxPrice,
        minProgress,
        minYield,
        minLiquidity,
        favoritesOnly,
        favoriteIds: favorites.favoriteIds,
      }),
    );
    let rows = applyClientKindFilter(base, kind);
    rows = applyClientPhaseFilter(rows, phase);
    return sortCatalogItems(rows, sort, catalogOrder);
  }, [
    liveMode,
    sourceItems,
    kind,
    phase,
    genre,
    query,
    sort,
    catalogOrder,
    minPrice,
    maxPrice,
    minProgress,
    minYield,
    minLiquidity,
    favoritesOnly,
    favorites.favoriteIds,
  ]);

  const matchingCount = liveMode ? (pagination?.total ?? filtered.length) : filtered.length;
  const catalogTotal = liveMode ? (stats?.publicReleases ?? matchingCount) : localizedMockItems.length;
  const resultCount = filtered.length;

  const resetFilters = () => {
    setQuery("");
    setKind("all");
    setPhase("all");
    setGenre("");
    setSort("catalog_order");
    setMinPrice("");
    setMaxPrice("");
    setMinProgress("");
    setMinYield("");
    setMinLiquidity("");
    setFavoritesOnlyState(false);
    setPage(1);
  };

  const priceLabel = useCatalogPriceLabel(kind);

  return {
    catalogView,
    setCatalogView,
    query,
    setQuery: (v: string) => {
      setQuery(v);
      setPage(1);
    },
    kind,
    setKind: (v: CatalogKindFilter) => {
      setKind(v);
      setPage(1);
    },
    phase,
    setPhase: (v: CatalogFundingPhase) => {
      setPhase(v);
      setPage(1);
    },
    genre,
    setGenre: (v: string) => {
      setGenre(v);
      setPage(1);
    },
    genres,
    genreCounts,
    sort,
    setSort,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    minProgress,
    setMinProgress,
    minYield,
    setMinYield,
    minLiquidity,
    setMinLiquidity,
    favoritesOnly,
    setFavoritesOnly,
    isFavorite: favorites.isFavorite,
    toggleFavorite,
    page,
    setPage,
    pagination,
    stats,
    statsUnavailable,
    filtersDegraded,
    filtered,
    matchingCount,
    catalogTotal,
    resultCount,
    resetFilters,
    catalogLoading,
    catalogError,
    liveMode,
    reloadCatalog: () => void loadLive(),
    mobileFiltersOpen,
    setMobileFiltersOpen,
    priceLabel,
  };
}
