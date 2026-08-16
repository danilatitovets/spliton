"use client";

import * as React from "react";

import Link from "next/link";

import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { ROUTES } from "@/constants/routes";
import { getWalletDataSource } from "@/services/wallet.service";
import { useSecondaryMarketCatalog } from "@/hooks/use-secondary-market-live";
import {
  SecondaryMarketAuthGate,
  SecondaryMarketEmptyState,
  SecondaryMarketErrorState,
  SecondaryMarketLoadingState,
} from "@/components/dashboard/secondary-market/secondary-market-fetch-states";
import type { AdaptedListing } from "@/lib/secondary-market/secondary-market-adapter";
import {
  listingEffectiveCanBuy,
  listingEffectiveStatus,
  sortSecondaryMarketListings,
} from "@/lib/secondary-market/listing-availability.util";
import { listingStatusLabel } from "@/lib/wallet/status-labels";
import {
  fetchMarketOverviewCharts,
  fetchMarketOverviewStats,
  type MarketOverviewChartsApi,
  type MarketOverviewStatsApi,
} from "@/services/market-overview.service";
import { SecondaryMarketLotPurchaseFlowDialog } from "./secondary-market-lot-purchase-flow-dialog";
import { ChevronLeft, ChevronRight, Filter, Search, Star } from "@/lib/lucide";
import { PAYOUTS_OVERVIEW_ICONS } from "@/constants/assets/payouts-overview-icons";

import {
  secondaryMarketBookHref,
  secondaryMarketBookIdForSymbol,
  secondaryMarketHref,
} from "@/constants/dashboard/secondary-market";
import type { SecondaryMarketListingMock } from "@/mocks/dashboard/secondary-market-listings.mock";
import { SECONDARY_MARKET_LISTINGS_MOCK } from "@/mocks/dashboard/secondary-market-listings.mock";
import { mapSecondaryMarketKpi } from "@/lib/secondary-market/secondary-market-kpi";
import { cn } from "@/lib/utils";
import { ExchangeNeonSparkline } from "@/components/shared/charts/exchange-neon-sparkline";
import { SecondaryMarketListingActionsTrigger } from "./secondary-market-listing-actions-modal";
import { SecondaryMarketMarketFiltersSheet } from "./secondary-market-market-filters-sheet";
import { smExchange } from "./secondary-market-exchange-styles";
import {
  countActiveMarketTabFilters,
  DEFAULT_MARKET_TAB_FILTERS,
  MARKET_TAB_PAGE_SIZE,
  marketTabFiltersToApiQuery,
  type MarketTabFiltersState,
  type MarketTabSegment,
} from "@/lib/secondary-market/market-tab-filters";

type Genre = "all" | SecondaryMarketListingMock["genre"] | "liquid";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

const SEGMENT_CHIPS: { id: MarketTabSegment; key?: string; label?: string }[] = [
  { id: "all", key: "secondaryMarket.filters.all" },
  { id: "electronic", label: "Electronic" },
  { id: "pop", label: "Pop" },
  { id: "hiphop", label: "Hip-Hop" },
  { id: "rock", label: "Rock" },
  { id: "liquid", key: "secondaryMarket.filters.liquid" },
];

function formatUsdt(n: number) {
  return n.toLocaleString("ru-RU", {
    minimumFractionDigits: n % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

function formatUsdtCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString("ru-RU", { maximumFractionDigits: 2 })}M`;
  if (n >= 10_000) return `${(n / 1000).toLocaleString("ru-RU", { maximumFractionDigits: 1 })}K`;
  return formatUsdt(n);
}

function MarketTabMiniSparkline({
  values,
  positive,
  className,
}: {
  values: number[];
  positive: boolean;
  className?: string;
}) {
  if (values.length < 2) return <span className="font-mono text-zinc-600">—</span>;

  const first = values[0]!;
  const last = values[values.length - 1]!;
  const delta = last - first;
  const seriesTrend = Math.abs(delta) < 1e-6 ? "flat" : delta > 0 ? "up" : "down";
  // Prefer series slope; fall back to 7d % only when flat.
  const resolved = seriesTrend === "flat" ? (positive ? "up" : "down") : seriesTrend;
  const palette = seriesTrend === "flat" ? "muted" : "neon";

  return (
    <ExchangeNeonSparkline
      values={values}
      trend={resolved}
      width={84}
      height={28}
      className={className}
      detailSegments={3}
      palette={palette}
    />
  );
}

function PriceRangeBar({ low, high, current }: { low: number; high: number; current: number }) {
  const span = high - low || 1;
  const pct = Math.min(100, Math.max(0, ((current - low) / span) * 100));
  return (
    <div className="flex w-full min-w-[64px] max-w-[96px] flex-col gap-1" title={`${low} – ${high}`}>
      <div className="relative h-[3px] w-full rounded-full bg-white/[0.08]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-white/25"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
        <span
          className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_2px_rgba(0,0,0,0.55)]"
          style={{ left: `${pct}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

/** Доля доступных units — простой число + сегменты глубины. */
function UnitsDepthBar({ available }: { available: number }) {
  const segments = 5;
  const filled = Math.min(segments, Math.max(1, Math.ceil(Math.sqrt(Math.max(available, 0)) / 2.2)));
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-7 shrink-0 text-right font-mono text-[12px] tabular-nums leading-none text-zinc-300">
        {available}
      </span>
      <div className="flex items-center gap-0.5" aria-hidden>
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 w-2.5 rounded-full",
              i < filled ? "bg-white/75" : "bg-white/[0.1]",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function MarketKpiCard({
  label,
  children,
  texturePosition = "48% 42%",
}: {
  label: string;
  children: React.ReactNode;
  texturePosition?: string;
}) {
  return (
    <article className="relative isolate overflow-hidden rounded-[1.15rem] bg-black px-4 py-4 ring-1 ring-white/[0.08] sm:rounded-[1.35rem] sm:px-5 sm:py-5">
      <div
        className="pointer-events-none absolute -inset-[10%] scale-[1.06]"
        style={{
          backgroundImage: `url('${PAYOUTS_OVERVIEW_ICONS.compareTexture}')`,
          backgroundSize: "cover",
          backgroundPosition: texturePosition,
          opacity: 0.9,
          filter: "blur(1.25px)",
          WebkitMaskImage:
            "radial-gradient(ellipse 92% 88% at 50% 50%, #000 42%, transparent 78%)",
          maskImage: "radial-gradient(ellipse 92% 88% at 50% 50%, #000 42%, transparent 78%)",
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-black/55" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 shadow-[inset_0_0_28px_10px_rgba(0,0,0,0.72)]"
        aria-hidden
      />
      <div className="relative z-10">
        <p className="text-[12px] font-medium text-white">{label}</p>
        <div className="mt-2 text-white">{children}</div>
      </div>
    </article>
  );
}

function CoverThumb({ symbol, size = "md" }: { symbol: string; size?: "sm" | "md" | "lg" }) {
  const hue = symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const sz = size === "lg" ? "size-14" : size === "sm" ? "size-9" : "size-10";
  return (
    <div
      className={cn("shrink-0 rounded-full", sz)}
      style={{
        background: `linear-gradient(145deg, hsl(${hue}, 42%, 28%) 0%, hsl(${(hue + 48) % 360}, 28%, 12%) 100%)`,
      }}
      aria-hidden
    />
  );
}

function formatMessage(template: string, params: Record<string, string | number>): string {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)),
    template,
  );
}

function ListingStatusPill({
  listing,
  t,
}: {
  listing: SecondaryMarketListingMock;
  t: (key: string) => string;
}) {
  const status = listingEffectiveStatus(listing);
  const label = listingStatusLabel(status, t);
  const purchasable = listingEffectiveCanBuy(listing);
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide",
        purchasable ? "bg-white/10 text-white" : "bg-zinc-800 text-zinc-500",
      )}
    >
      {label}
    </span>
  );
}

function MarketInstrumentRow({
  row,
  isFavorite,
  onToggleFavorite,
  bookHref,
  onBuy,
  t,
}: {
  row: SecondaryMarketListingMock;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  bookHref: string;
  onBuy?: () => void;
  t: (key: string) => string;
}) {
  const pos = row.change7dPct >= 0;
  const canBuy = listingEffectiveCanBuy(row);

  return (
    <div className={cn("flex items-center gap-2.5 py-3.5", smExchange.rowDivider)}>
      <button
        type="button"
        onClick={onToggleFavorite}
        className="flex size-8 shrink-0 items-center justify-center text-zinc-600"
        aria-label={isFavorite ? t("secondaryMarket.aria.removeFavorite") : t("secondaryMarket.aria.addFavorite")}
      >
        <Star
          className={cn("size-4", isFavorite && "fill-white text-white")}
          strokeWidth={1.75}
        />
      </button>

      <Link href={bookHref} className="flex min-w-0 flex-1 items-center gap-2.5 active:opacity-80">
        <CoverThumb symbol={row.symbol} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-snug text-white">{row.track}</p>
          <p className="truncate text-[12px] text-zinc-500">
            {row.artist} · {row.symbol}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <ListingStatusPill listing={row} t={t} />
            {row.payoutSparkline.length >= 2 ? (
              <span className="hidden sm:inline-flex">
                <MarketTabMiniSparkline values={row.payoutSparkline} positive={pos} />
              </span>
            ) : null}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-[14px] font-semibold tabular-nums text-white">
            {formatUsdt(row.pricePerUnit)}
          </p>
          <p
            className={cn(
              "font-mono text-[11px] tabular-nums",
              pos ? "text-white" : "text-zinc-400",
            )}
          >
            {pos ? "+" : ""}
            {row.change7dPct.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%
          </p>
        </div>
      </Link>

      {onBuy ? (
        <button
          type="button"
          disabled={!canBuy}
          onClick={onBuy}
          className={cn(
            "ml-0.5 shrink-0 rounded-full px-3 py-1.5 font-mono text-[11px] font-semibold transition",
            canBuy
              ? "bg-white text-black active:scale-[0.98]"
              : "cursor-not-allowed bg-white/[0.06] text-zinc-600",
          )}
        >
          {t("secondaryMarket.listings.buyLot")}
        </button>
      ) : null}
    </div>
  );
}

export function SecondaryMarketMarketTab() {
  const isLive = getWalletDataSource() === "live";
  const { isAuthenticated, authorizedFetch } = useAuth();
  const { t } = useI18n();
  const [filters, setFilters] = React.useState<MarketTabFiltersState>(DEFAULT_MARKET_TAB_FILTERS);
  const [page, setPage] = React.useState(1);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const debouncedSearch = useDebouncedValue(filters.search, 320);
  const apiQuery = React.useMemo(
    () => marketTabFiltersToApiQuery(filters, debouncedSearch, page, MARKET_TAB_PAGE_SIZE),
    [filters, debouncedSearch, page],
  );
  const catalog = useSecondaryMarketCatalog(apiQuery);
  const [purchaseListing, setPurchaseListing] = React.useState<AdaptedListing | null>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [favorites, setFavorites] = React.useState<Set<string>>(() => new Set());
  const [marketStats, setMarketStats] = React.useState<MarketOverviewStatsApi | null>(null);
  const [marketCharts, setMarketCharts] = React.useState<MarketOverviewChartsApi | null>(null);
  const [marketKpiLoading, setMarketKpiLoading] = React.useState(isLive);
  const [marketKpiError, setMarketKpiError] = React.useState<string | null>(null);

  const resetFilters = React.useCallback(() => {
    setPage(1);
    setFilters(DEFAULT_MARKET_TAB_FILTERS);
  }, []);

  const patchFilters = React.useCallback((patch: Partial<MarketTabFiltersState>) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  React.useEffect(() => {
    if (!isLive) {
      setMarketStats(null);
      setMarketCharts(null);
      setMarketKpiLoading(false);
      setMarketKpiError(null);
      return;
    }
    let cancelled = false;
    setMarketKpiLoading(true);
    setMarketKpiError(null);
    void Promise.all([fetchMarketOverviewStats("7d"), fetchMarketOverviewCharts("30d")])
      .then(([stats, charts]) => {
        if (cancelled) return;
        setMarketStats(stats);
        setMarketCharts(charts);
      })
      .catch(() => {
        if (!cancelled) {
          setMarketStats(null);
          setMarketCharts(null);
          setMarketKpiError(t("secondaryMarket.errors.marketSummaryFailed"));
        }
      })
      .finally(() => {
        if (!cancelled) setMarketKpiLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isLive]);

  const listingsSource = isLive ? catalog.listings : SECONDARY_MARKET_LISTINGS_MOCK;
  const activeFilterCount = countActiveMarketTabFilters(filters);
  const hasActiveFilters =
    activeFilterCount > 0 || debouncedSearch.trim().length > 0 || filters.segment !== "all";

  const filteredAll = React.useMemo(() => {
    if (isLive) return listingsSource;
    const q = filters.search.trim().toLowerCase();
    const segment = filters.segment;
    const priceMin = Number(filters.priceMin.replace(",", "."));
    const priceMax = Number(filters.priceMax.replace(",", "."));
    const unitsMin = Number(filters.unitsMin.replace(",", "."));
    const unitsMax = Number(filters.unitsMax.replace(",", "."));
    let base = listingsSource.filter((row) => {
      if (segment === "liquid" && row.liquidity !== "high") return false;
      if (segment !== "all" && segment !== "liquid" && row.genre !== segment) return false;
      if (filters.priceMin.trim() && Number.isFinite(priceMin) && row.pricePerUnit < priceMin) return false;
      if (filters.priceMax.trim() && Number.isFinite(priceMax) && row.pricePerUnit > priceMax) return false;
      if (filters.unitsMin.trim() && Number.isFinite(unitsMin) && row.unitsAvailable < unitsMin) return false;
      if (filters.unitsMax.trim() && Number.isFinite(unitsMax) && row.unitsAvailable > unitsMax) return false;
      if (!q) return true;
      return (
        row.track.toLowerCase().includes(q) ||
        row.artist.toLowerCase().includes(q) ||
        row.symbol.toLowerCase().includes(q)
      );
    });
    if (filters.status === "purchasable") {
      base = base.filter((row) => listingEffectiveCanBuy(row));
    } else if (filters.status !== "all") {
      base = base.filter((row) => listingEffectiveStatus(row) === filters.status);
    }
    return sortSecondaryMarketListings(
      base,
      filters.sort === "newest"
        ? "availability"
        : filters.sort === "price_asc" ||
            filters.sort === "price_desc" ||
            filters.sort === "change_desc" ||
            filters.sort === "units_desc" ||
            filters.sort === "availability"
          ? filters.sort
          : "availability",
    );
  }, [filters, isLive, listingsSource]);

  const pageSize = isLive ? catalog.pageSize || MARKET_TAB_PAGE_SIZE : MARKET_TAB_PAGE_SIZE;
  const total = isLive ? catalog.total : filteredAll.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  React.useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const filtered = React.useMemo(() => {
    if (isLive) return filteredAll;
    const start = (safePage - 1) * pageSize;
    return filteredAll.slice(start, start + pageSize);
  }, [filteredAll, isLive, pageSize, safePage]);

  const featured = filteredAll.filter((l) => l.featured);
  const featuredDeals = featured.reduce((a, r) => a + r.deals7d, 0);
  const rangeFrom = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeTo = Math.min(safePage * pageSize, total);
  const showPagination = total > pageSize;

  if (isLive && !isAuthenticated) {
    return <SecondaryMarketAuthGate />;
  }
  if (isLive && catalog.loading && catalog.listings.length === 0) {
    return <SecondaryMarketLoadingState label={t("secondaryMarket.errors.loadingListings")} />;
  }
  if (isLive && catalog.error) {
    return <SecondaryMarketErrorState message={catalog.error} onRetry={() => void catalog.reload()} />;
  }

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const kpi = mapSecondaryMarketKpi({
    isLive,
    loading: marketKpiLoading,
    stats: marketStats,
    charts: marketCharts,
    listingsSource,
  });
  const volume24hDisplay = kpi.volume24h;
  const activeLotsDisplay = kpi.activeLots;
  const liquidPctDisplay = kpi.liquidPct;
  const sparklineValues = kpi.sparklineValues;
  const sparklinePositive = kpi.sparklinePositive;

  return (
    <div className="space-y-4 md:space-y-6">
      {kpi.showDemoLabel ? (
        <p className="rounded-xl bg-amber-50/10 px-3.5 py-2.5 text-sm text-amber-100/90 ring-1 ring-amber-200/15" role="status">
          {t("secondaryMarket.kpi.demoLabel")}
        </p>
      ) : null}
      {isLive && marketKpiError ? (
        <p className="rounded-xl bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-200" role="alert">
          {marketKpiError}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MarketKpiCard label={t("secondaryMarket.kpi.volume24h")} texturePosition="20% 35%">
          <p className="font-mono text-xl font-semibold tabular-nums tracking-tight sm:text-2xl">
            {volume24hDisplay}
            <span className="ml-1.5 text-sm font-medium text-white/80">{t("secondaryMarket.kpi.usdt")}</span>
          </p>
        </MarketKpiCard>

        <MarketKpiCard label={t("secondaryMarket.kpi.activeLots")} texturePosition="70% 40%">
          <p className="font-mono text-xl font-semibold tabular-nums tracking-tight sm:text-2xl">
            {activeLotsDisplay}
          </p>
        </MarketKpiCard>

        <MarketKpiCard label={t("secondaryMarket.kpi.turnover30d")} texturePosition="45% 60%">
          <div className="flex items-end justify-between gap-3">
            <p className="font-mono text-xl font-semibold tabular-nums tracking-tight sm:text-2xl">
              {sparklineValues.length >= 2
                ? sparklineValues[sparklineValues.length - 1]!.toLocaleString("ru-RU", {
                    maximumFractionDigits: 0,
                  })
                : "—"}
            </p>
            {sparklineValues.length >= 2 ? (
              <MarketTabMiniSparkline
                values={sparklineValues}
                positive={sparklinePositive}
                className="mb-1 shrink-0"
              />
            ) : null}
          </div>
        </MarketKpiCard>

        <MarketKpiCard label={t("secondaryMarket.kpi.liquidLots")} texturePosition="80% 25%">
          <p className="font-mono text-xl font-semibold tabular-nums tracking-tight sm:text-2xl">
            {liquidPctDisplay}
          </p>
        </MarketKpiCard>
      </div>

      {/* Тренды — только tablet+ */}
      <section className="hidden sm:block">
        <div className="mb-3 flex w-full items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold tracking-tight text-white">{t("secondaryMarket.market.trending")}</h2>
          <span className="flex items-center gap-0.5 font-mono text-[11px] text-zinc-500">
            {formatMessage(t("secondaryMarket.market.deals7d"), { count: featuredDeals })}
            <ChevronRight className="size-3.5 text-zinc-600" aria-hidden />
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {featured.map((row) => {
            const pos = row.change7dPct >= 0;
            const bookId = secondaryMarketBookIdForSymbol(row.symbol) ?? row.releaseId;
            return (
              <div
                key={row.id}
                className="flex min-w-[min(100%,320px)] shrink-0 gap-4 rounded-2xl bg-[#111111] px-4 py-3.5 sm:min-w-[340px]"
              >
                <CoverThumb symbol={row.symbol} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs font-semibold text-white">{row.symbol}</p>
                      <p className="truncate text-sm font-medium leading-snug text-white">{row.track}</p>
                      <p className="truncate font-mono text-[11px] text-zinc-500">{row.artist}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={cn(
                          "font-mono text-xl font-semibold tabular-nums leading-none tracking-tight",
                          pos ? "text-white" : "text-zinc-400",
                        )}
                      >
                        {pos ? "+" : ""}
                        {row.change7dPct.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-zinc-600">{t("secondaryMarket.market.column7d")}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
                    <div className="font-mono text-[11px] text-zinc-500">
                      <span className="text-zinc-400">{formatUsdtCompact(row.listingValueUsdt)} USDT</span>
                      <span className="mx-1.5 text-zinc-700">·</span>
                      <span>{formatMessage(t("secondaryMarket.market.dealsCount"), { count: row.deals7d })}</span>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                      <SecondaryMarketListingActionsTrigger
                        compactTrigger
                        disabled={!listingEffectiveCanBuy(row)}
                        onOpen={() => setPurchaseListing(row as AdaptedListing)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Поиск и фильтры — OKX pill bar */}
      <div className="space-y-2.5">
        <div className="relative min-w-0">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-600"
            aria-hidden
          />
          <input
            ref={searchInputRef}
            type="search"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            placeholder={t("secondaryMarket.filters.searchPlaceholder")}
            className={smExchange.inputPill}
            aria-label={t("secondaryMarket.filters.searchPlaceholder")}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="secondary-market-filters-open"
            onClick={() => setFiltersOpen(true)}
            className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#161616] text-zinc-400 ring-1 ring-white/8"
            aria-label={t("secondaryMarket.aria.filters")}
          >
            <Filter className="size-4" />
            {activeFilterCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-white font-mono text-[9px] font-bold text-black">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
          <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SEGMENT_CHIPS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => patchFilters({ segment: chip.id })}
                className={cn(
                  smExchange.chipBase,
                  filters.segment === chip.id ? smExchange.chipActive : smExchange.chipIdle,
                )}
              >
                {chip.key ? t(chip.key) : chip.label}
              </button>
            ))}
          </div>
        </div>
        {hasActiveFilters ? (
          <div className="flex flex-wrap items-center gap-2">
            {debouncedSearch.trim() ? (
              <span className="rounded-full bg-white/6 px-2.5 py-1 font-mono text-[10px] text-zinc-400">
                {debouncedSearch.trim()}
              </span>
            ) : null}
            {filters.status !== DEFAULT_MARKET_TAB_FILTERS.status ? (
              <span className="rounded-full bg-white/6 px-2.5 py-1 font-mono text-[10px] text-zinc-400">
                {t(`secondaryMarket.filters.listingStatus.${filters.status}`)}
              </span>
            ) : null}
            <button
              type="button"
              onClick={resetFilters}
              className="font-mono text-[10px] text-zinc-500 underline-offset-2 hover:text-white hover:underline"
            >
              {t("secondaryMarket.filters.resetFilters")}
            </button>
          </div>
        ) : null}
      </div>

      <SecondaryMarketMarketFiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onChange={patchFilters}
        onReset={resetFilters}
        resultCount={total}
      />

      {/* Список инструментов — mobile OKX rows */}
      <div className="md:hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            {hasActiveFilters ? (
              <>
                <p className="font-mono text-sm font-medium text-zinc-400">
                  {t("secondaryMarket.listings.emptyFilterTitle")}
                </p>
                <p className="mt-2 font-mono text-xs text-zinc-600">
                  {t("secondaryMarket.listings.emptyFilterDesc")}
                </p>
              </>
            ) : isLive && listingsSource.length === 0 ? (
              <SecondaryMarketEmptyState
                title={t("secondaryMarket.listings.emptyActiveTitle")}
                description={t("secondaryMarket.market.emptyActiveDesc")}
              />
            ) : (
              <p className="font-mono text-sm text-zinc-500">{t("secondaryMarket.listings.noMatches")}</p>
            )}
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 font-mono text-xs text-zinc-400 underline-offset-4 hover:text-white hover:underline"
              >
                {t("secondaryMarket.filters.resetFilters")}
              </button>
            ) : null}
          </div>
        ) : (
          filtered.map((row) => {
            const bookId = secondaryMarketBookIdForSymbol(row.symbol) ?? row.releaseId;
            return (
              <MarketInstrumentRow
                key={row.id}
                row={row}
                isFavorite={favorites.has(row.id)}
                onToggleFavorite={() => toggleFavorite(row.id)}
                bookHref={secondaryMarketBookHref(bookId)}
                onBuy={
                  listingEffectiveCanBuy(row)
                    ? () => setPurchaseListing(row as AdaptedListing)
                    : undefined
                }
                t={t}
              />
            );
          })
        )}
      </div>

      {/* Таблица — desktop / tablet */}
      <div className="hidden min-w-0 md:block">
        {filtered.length === 0 ? (
          <div className="py-14 text-center">
            {hasActiveFilters ? (
              <>
                <p className="font-mono text-sm font-medium text-zinc-400">
                  {t("secondaryMarket.listings.emptyFilterTitle")}
                </p>
                <p className="mt-2 font-mono text-xs text-zinc-600">
                  {t("secondaryMarket.listings.emptyFilterDesc")}
                </p>
              </>
            ) : isLive && listingsSource.length === 0 ? (
              <SecondaryMarketEmptyState
                title={t("secondaryMarket.listings.emptyActiveTitle")}
                description={t("secondaryMarket.market.emptyActiveDesc")}
              />
            ) : (
              <p className="font-mono text-sm text-zinc-500">{t("secondaryMarket.listings.noMatches")}</p>
            )}
            <button
              type="button"
              onClick={resetFilters}
              className="mt-3 font-mono text-xs text-zinc-400 underline-offset-4 hover:text-white hover:underline"
            >
              {t("secondaryMarket.filters.resetFilters")}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-0 border-collapse text-left lg:min-w-[920px]">
              <thead>
                <tr className="border-b border-white/10 font-mono text-[12px] text-zinc-500">
                  <th className="w-10 pb-3 pr-1 font-normal" />
                  <th className="min-w-[200px] pb-3 pr-3 text-left font-medium text-zinc-400">
                    {t("secondaryMarket.listings.columnLot")}
                  </th>
                  <th className="hidden w-[84px] pb-3 pr-3 text-left font-medium text-zinc-400 lg:table-cell">
                    {t("secondaryMarket.market.column30d")}
                  </th>
                  <th className="hidden w-[80px] pb-3 pr-3 text-left font-medium text-zinc-400 lg:table-cell">
                    {t("secondaryMarket.market.column7d")}
                  </th>
                  <th className="hidden w-[88px] pb-3 pr-3 text-right font-medium text-zinc-400 md:table-cell">
                    {t("secondaryMarket.listings.columnPrice")}
                  </th>
                  <th className="hidden w-[68px] pb-3 pr-3 text-right font-medium text-zinc-400 md:table-cell">
                    {t("secondaryMarket.market.column7dPct")}
                  </th>
                  <th className="hidden w-[80px] pb-3 pr-3 text-right font-medium text-zinc-400 lg:table-cell">
                    {t("secondaryMarket.market.columnLotSize")}
                  </th>
                  <th className="hidden w-[128px] pb-3 pr-3 text-left font-medium text-zinc-400 lg:table-cell">
                    {t("secondaryMarket.listings.columnLiquidity")}
                  </th>
                  <th className="w-[140px] pb-3 text-right font-medium text-zinc-400">
                    {t("secondaryMarket.listings.columnActions")}
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono text-[13px] leading-none text-zinc-300">
                {filtered.map((row) => {
                  const pos = row.change7dPct >= 0;
                  return (
                    <tr key={row.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                      <td className="py-3 pr-1 align-middle">
                        <button
                          type="button"
                          onClick={() => toggleFavorite(row.id)}
                          className="flex size-8 items-center justify-center text-zinc-600 hover:text-white"
                          aria-label={
                            favorites.has(row.id)
                              ? t("secondaryMarket.aria.removeFavorite")
                              : t("secondaryMarket.aria.addFavorite")
                          }
                        >
                          <Star
                            className={cn("size-3.5", favorites.has(row.id) && "fill-white text-white")}
                            strokeWidth={1.75}
                          />
                        </button>
                      </td>
                      <td className="py-3 pr-3 align-middle">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <CoverThumb symbol={row.symbol} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium leading-snug tracking-[-0.01em] text-white">
                              {row.track}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] leading-snug text-zinc-600">
                              {row.artist} · {row.symbol}
                            </p>
                            <div className="mt-1">
                              <ListingStatusPill listing={row} t={t} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden py-3 pr-3 align-middle lg:table-cell">
                        <MarketTabMiniSparkline values={row.payoutSparkline} positive={pos} />
                      </td>
                      <td className="hidden py-3 pr-3 align-middle lg:table-cell">
                        <PriceRangeBar low={row.range7dLow} high={row.range7dHigh} current={row.pricePerUnit} />
                      </td>
                      <td className="hidden py-3 pr-3 text-right align-middle text-[13px] font-semibold tabular-nums tracking-tight text-white md:table-cell">
                        {formatUsdt(row.pricePerUnit)}
                      </td>
                      <td
                        className={cn(
                          "hidden py-3 pr-3 text-right align-middle text-[12px] tabular-nums md:table-cell",
                          pos ? "text-white" : "text-zinc-400",
                        )}
                      >
                        {pos ? "+" : ""}
                        {row.change7dPct.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%
                      </td>
                      <td className="hidden py-3 pr-3 text-right align-middle text-[12px] tabular-nums text-zinc-400 lg:table-cell">
                        {formatUsdtCompact(row.listingValueUsdt)}
                      </td>
                      <td className="hidden py-3 pr-3 align-middle lg:table-cell">
                        <UnitsDepthBar available={row.unitsAvailable} />
                      </td>
                      <td className="py-3 text-right align-middle">
                        <div className="flex justify-end">
                          <SecondaryMarketListingActionsTrigger
                            compactTrigger
                            disabled={!listingEffectiveCanBuy(row)}
                            onOpen={() => setPurchaseListing(row as AdaptedListing)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showPagination ? (
        <nav
          className="flex flex-wrap items-center justify-between gap-3 px-0.5"
          aria-label={t("secondaryMarket.market.paginationLabel")}
        >
          <div className="space-y-0.5">
            <p className="font-mono text-[12px] text-zinc-400">
              {formatMessage(t("secondaryMarket.market.paginationShowing"), {
                from: rangeFrom,
                to: rangeTo,
                total,
              })}
            </p>
            <p className="font-mono text-[11px] text-zinc-600">
              {formatMessage(t("secondaryMarket.market.paginationPage"), {
                page: safePage,
                totalPages,
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1 || (isLive && catalog.loading)}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={cn(
                smExchange.chipBase,
                smExchange.chipIdle,
                "inline-flex h-9 items-center gap-1.5 px-3.5 disabled:cursor-not-allowed disabled:opacity-40",
              )}
            >
              <ChevronLeft className="size-3.5" strokeWidth={2} />
              {t("secondaryMarket.market.paginationPrev")}
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages || (isLive && catalog.loading)}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={cn(
                smExchange.chipBase,
                smExchange.chipIdle,
                "inline-flex h-9 items-center gap-1.5 px-3.5 disabled:cursor-not-allowed disabled:opacity-40",
              )}
            >
              {t("secondaryMarket.market.paginationNext")}
              <ChevronRight className="size-3.5" strokeWidth={2} />
            </button>
          </div>
        </nav>
      ) : null}

      <SecondaryMarketLotPurchaseFlowDialog
        open={purchaseListing !== null}
        onOpenChange={(next) => {
          if (!next) setPurchaseListing(null);
        }}
        listing={purchaseListing}
        bookId={
          purchaseListing
            ? secondaryMarketBookIdForSymbol(purchaseListing.symbol) ?? purchaseListing.releaseId
            : null
        }
        canBuy={Boolean(isLive && purchaseListing?.canBuy)}
        authorizedFetch={authorizedFetch}
        onBuy={catalog.buy}
        onReloadListings={() => void catalog.reload()}
        consentEnabled={Boolean(isLive && isAuthenticated)}
      />
    </div>
  );
}
