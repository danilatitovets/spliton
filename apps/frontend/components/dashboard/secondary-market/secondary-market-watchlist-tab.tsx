"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search, SlidersHorizontal } from "@/lib/lucide";

import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  SecondaryMarketAuthGate,
  SecondaryMarketErrorState,
  SecondaryMarketLoadingState,
} from "@/components/dashboard/secondary-market/secondary-market-fetch-states";
import { SecondaryMarketWatchlistAddSheet } from "@/components/dashboard/secondary-market/secondary-market-watchlist-add-sheet";
import { SecondaryMarketWatchlistDetailSheet } from "@/components/dashboard/secondary-market/secondary-market-watchlist-detail-sheet";
import { SplitonLoader } from "@/components/ui/spliton-loader";
import {
  countActiveWatchlistFilters,
  SecondaryMarketWatchlistFiltersSheet,
} from "@/components/dashboard/secondary-market/secondary-market-watchlist-filters-sheet";
import {
  DEFAULT_WATCHLIST_FILTERS,
  type WatchlistAddCandidate,
  type WatchlistFiltersState,
  type WatchlistItem,
} from "@/components/dashboard/secondary-market/secondary-market-watchlist.types";
import { ExchangeNeonSparkline } from "@/components/shared/charts/exchange-neon-sparkline";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { secondaryMarketBookHref, secondaryMarketHref } from "@/constants/dashboard/secondary-market";
import { analyticsReleaseDetailPath, secondaryMarketReleaseAnalyticsPath } from "@/constants/routes";
import {
  getSecondaryMarketAnalyticsCatalogIdForReleaseSlug,
  SECONDARY_MARKET_LISTINGS_MOCK,
} from "@/mocks/dashboard/secondary-market-listings.mock";
import { cn } from "@/lib/utils";
import {
  addWatchlistItem,
  fetchMarketListings,
  fetchWatchlist,
  marketErrorMessage,
  removeWatchlistItem,
  type WatchlistItemDto,
} from "@/services/secondary-market.service";
import { getWalletDataSource } from "@/services/wallet.service";

const WATCHLIST_HERO_ICON = "/images/secondary-market/watchlist-hero.png";
const WATCHLIST_HEADER_VIDEO = "/videos/position-holding-bg.mp4";

const SEED: WatchlistItem[] = [
  {
    id: "w-mnr",
    bookMarketId: "mnr",
    symbol: "MNR",
    track: "Midnight Run",
    artist: "Nova Lane",
    releaseId: "midnight-run",
    pricePerUnit: 18.5,
    change24hPct: 1.2,
    listingsCount: 4,
    unitsInBook: 120,
    deals24h: 18,
    liquidity: "high",
    spark: [0.42, 0.44, 0.43, 0.46, 0.48, 0.47, 0.49, 0.5, 0.51, 0.5],
  },
  {
    id: "w-sgn",
    bookMarketId: "sgn",
    symbol: "SGN",
    track: "Signal / Noise",
    artist: "Kairo",
    releaseId: "signal-noise",
    pricePerUnit: 22.1,
    change24hPct: -0.4,
    listingsCount: 3,
    unitsInBook: 40,
    deals24h: 9,
    liquidity: "high",
    spark: [0.35, 0.38, 0.4, 0.42, 0.45, 0.48, 0.5, 0.52, 0.51, 0.53],
  },
  {
    id: "w-vlt",
    bookMarketId: "vlt",
    symbol: "VLT",
    track: "Velvet Room",
    artist: "June & Co",
    releaseId: "velvet-room",
    pricePerUnit: 6.85,
    change24hPct: -1.1,
    listingsCount: 1,
    unitsInBook: 43,
    deals24h: 0,
    liquidity: "low",
    spark: [0.55, 0.54, 0.53, 0.52, 0.52, 0.51, 0.5, 0.5, 0.49, 0.48],
  },
  {
    id: "w-gls",
    bookMarketId: null,
    symbol: "GLS",
    track: "Glassline",
    artist: "The Static",
    releaseId: "glassline",
    pricePerUnit: 9.05,
    change24hPct: 0.2,
    listingsCount: 2,
    unitsInBook: 80,
    deals24h: 3,
    liquidity: "med",
    spark: [0.5, 0.51, 0.5, 0.52, 0.51, 0.53, 0.52, 0.53, 0.52, 0.54],
  },
];

const SEGMENT_QUICK = [
  { id: "all" as const, labelKey: "secondaryMarket.filters.all" },
  { id: "liquid" as const, labelKey: "secondaryMarket.filters.liquid" },
  { id: "active" as const, labelKey: "secondaryMarket.filters.active24h" },
] as const;

function formatMessage(template: string, params: Record<string, string | number>): string {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)),
    template,
  );
}

function formatUsdt(n: number) {
  return n.toLocaleString("ru-RU", {
    minimumFractionDigits: n % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

function CoverThumb({ symbol }: { symbol: string }) {
  const hue = symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="size-9 shrink-0 rounded-full"
      style={{
        background: `linear-gradient(145deg, hsl(${hue}, 42%, 28%) 0%, hsl(${(hue + 48) % 360}, 28%, 12%) 100%)`,
      }}
      aria-hidden
    />
  );
}

function liquidityLabel(l: WatchlistItem["liquidity"], t: (key: string) => string) {
  if (l === "high") return t("secondaryMarket.kpi.liquidity.highShort");
  if (l === "med") return t("secondaryMarket.kpi.liquidity.medShort");
  return t("secondaryMarket.kpi.liquidity.lowShort");
}

function bookHref(bookMarketId: string | null) {
  if (!bookMarketId) return secondaryMarketHref("market");
  return secondaryMarketBookHref(bookMarketId);
}

function mapWatchlistDto(dto: WatchlistItemDto): WatchlistItem {
  return {
    id: dto.id,
    bookMarketId: dto.bookMarketId,
    symbol: dto.symbol,
    track: dto.track,
    artist: dto.artist,
    releaseId: dto.releaseId,
    releaseUuid: dto.releaseUuid,
    pricePerUnit: dto.pricePerUnit,
    change24hPct: dto.change24hPct,
    listingsCount: dto.listingsCount,
    unitsInBook: dto.unitsInBook,
    deals24h: dto.deals24h,
    liquidity: dto.liquidity,
    spark: dto.spark,
  };
}

function applyWatchlistFilters(items: WatchlistItem[], filters: WatchlistFiltersState): WatchlistItem[] {
  const q = filters.query.trim().toLowerCase();
  let rows = items.filter((r) => {
    if (q) {
      const hit =
        r.symbol.toLowerCase().includes(q) ||
        r.track.toLowerCase().includes(q) ||
        r.artist.toLowerCase().includes(q);
      if (!hit) return false;
    }
    if (filters.segment === "liquid" && r.liquidity !== "high") return false;
    if (filters.segment === "active" && r.deals24h <= 0) return false;
    if (filters.liquidity !== "all" && r.liquidity !== filters.liquidity) return false;
    return true;
  });

  const dir = filters.sortDir === "asc" ? 1 : -1;
  rows = [...rows].sort((a, b) => {
    if (filters.sort === "name") return dir * a.track.localeCompare(b.track, "ru");
    if (filters.sort === "change") return dir * (a.change24hPct - b.change24hPct);
    if (filters.sort === "price") return dir * (a.pricePerUnit - b.pricePerUnit);
    return dir * (a.deals24h - b.deals24h);
  });
  return rows;
}

export function SecondaryMarketWatchlistTab() {
  const { t } = useI18n();
  const { authorizedFetch, isAuthenticated } = useAuth();
  const isLive = getWalletDataSource() === "live" && isAuthenticated;
  const [mockItems, setMockItems] = React.useState<WatchlistItem[]>(SEED);
  const [liveItems, setLiveItems] = React.useState<WatchlistItem[]>([]);
  const [loading, setLoading] = React.useState(isLive);
  const [error, setError] = React.useState<string | null>(null);
  const items = isLive ? liveItems : mockItems;

  const [filters, setFilters] = React.useState<WatchlistFiltersState>(DEFAULT_WATCHLIST_FILTERS);
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<WatchlistItem | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [liveAddCandidates, setLiveAddCandidates] = React.useState<WatchlistAddCandidate[]>([]);

  const loadLive = React.useCallback(async () => {
    if (!isLive) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWatchlist(authorizedFetch);
      setLiveItems(res.items.map(mapWatchlistDto));
    } catch (e) {
      setError(marketErrorMessage(e));
      setLiveItems([]);
    } finally {
      setLoading(false);
    }
  }, [authorizedFetch, isLive]);

  React.useEffect(() => {
    void loadLive();
  }, [loadLive]);

  React.useEffect(() => {
    if (!isLive || !isAddOpen) return;
    const watched = new Set(items.map((i) => i.releaseId));
    void fetchMarketListings(authorizedFetch, { page: 1, limit: 100, status: "purchasable" })
      .then((res) => {
        const seen = new Set<string>();
        const cands: WatchlistAddCandidate[] = [];
        for (const l of res.items) {
          if (seen.has(l.releaseId)) continue;
          if (watched.has(l.releaseSlug) || watched.has(l.releaseId)) continue;
          seen.add(l.releaseId);
          cands.push({
            releaseId: l.releaseSlug,
            releaseUuid: l.releaseId,
            symbol: l.symbol,
            track: l.title,
            artist: l.artist,
            pricePerUnit: Number(l.pricePerUnit),
            liquidity: l.liquidity,
          });
        }
        setLiveAddCandidates(cands);
      })
      .catch(() => setLiveAddCandidates([]));
  }, [authorizedFetch, isAddOpen, isLive, items]);

  const showToast = React.useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 1800);
  }, []);

  const remove = async (id: string) => {
    if (isLive) {
      const prev = liveItems;
      setLiveItems((items) => items.filter((x) => x.id !== id));
      try {
        await removeWatchlistItem(authorizedFetch, id);
        showToast(t("secondaryMarket.toast.removedFromWatchlist"));
      } catch (e) {
        setLiveItems(prev);
        setError(marketErrorMessage(e));
      }
      return;
    }
    setMockItems((prev) => prev.filter((x) => x.id !== id));
    showToast(t("secondaryMarket.toast.removedFromWatchlist"));
  };

  const addToWatchlist = async (releaseId: string, releaseUuid?: string) => {
    if (isLive) {
      await addWatchlistItem(authorizedFetch, releaseUuid ?? releaseId);
      await loadLive();
      showToast(t("secondaryMarket.toast.addedToWatchlist"));
      return;
    }
    const listing = SECONDARY_MARKET_LISTINGS_MOCK.find((l) => l.releaseId === releaseId);
    if (!listing) throw new Error(t("secondaryMarket.errors.releaseNotFound"));
    if (mockItems.some((i) => i.releaseId === releaseId)) {
      throw new Error(t("secondaryMarket.errors.alreadyInWatchlist"));
    }
    const bookId = listing.symbol.toLowerCase().slice(0, 3);
    const newItem: WatchlistItem = {
      id: `w-${Date.now().toString(36)}`,
      bookMarketId: ["mnr", "sgn", "vlt"].includes(bookId) ? bookId : null,
      symbol: listing.symbol,
      track: listing.track,
      artist: listing.artist,
      releaseId: listing.releaseId,
      pricePerUnit: listing.pricePerUnit,
      change24hPct: listing.change7dPct,
      listingsCount: 1,
      unitsInBook: listing.unitsAvailable,
      deals24h: listing.deals7d,
      liquidity: listing.liquidity,
      spark: listing.payoutSparkline,
    };
    setMockItems((prev) => [...prev, newItem]);
    showToast(t("secondaryMarket.toast.addedToWatchlist"));
  };

  const filtered = React.useMemo(() => applyWatchlistFilters(items, filters), [items, filters]);
  const activeFilterCount = countActiveWatchlistFilters(filters);

  const addCandidates = React.useMemo((): WatchlistAddCandidate[] => {
    if (isLive) return liveAddCandidates;
    const watched = new Set(items.map((i) => i.releaseId));
    return SECONDARY_MARKET_LISTINGS_MOCK.filter((l) => !watched.has(l.releaseId)).map((l) => ({
      releaseId: l.releaseId,
      symbol: l.symbol,
      track: l.track,
      artist: l.artist,
      pricePerUnit: l.pricePerUnit,
      liquidity: l.liquidity,
    }));
  }, [isLive, items, liveAddCandidates]);

  const summary = React.useMemo(() => {
    const sumListings = items.reduce((a, x) => a + x.listingsCount, 0);
    const sumDeals = items.reduce((a, x) => a + x.deals24h, 0);
    const hi = items.filter((x) => x.liquidity === "high").length;
    return { n: items.length, sumListings, sumDeals, hi };
  }, [items]);

  const patchFilters = React.useCallback((patch: Partial<WatchlistFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = () => setFilters(DEFAULT_WATCHLIST_FILTERS);

  if (isLive && !isAuthenticated) {
    return <SecondaryMarketAuthGate />;
  }
  if (isLive && loading && liveItems.length === 0) {
    return <SecondaryMarketLoadingState label={t("secondaryMarket.errors.loadingWatchlist")} />;
  }
  if (isLive && error && liveItems.length === 0) {
    return <SecondaryMarketErrorState message={error} onRetry={() => void loadLive()} />;
  }

  return (
    <div className="relative space-y-6">
      <header className="relative isolate overflow-hidden rounded-2xl">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <video
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-[12px] motion-reduce:hidden"
            src={WATCHLIST_HEADER_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/72 to-black" />
        </div>
        <div className="relative z-10 flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-6">
          <div className="flex min-w-0 items-start gap-4">
            <div className="relative size-[4.5rem] shrink-0 sm:size-20">
              <Image
                src={WATCHLIST_HERO_ICON}
                alt=""
                fill
                sizes="80px"
                className="object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
                unoptimized
                aria-hidden
                priority
              />
            </div>
            <div className="min-w-0 pt-0.5">
              <h1 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
                {t("secondaryMarket.tabs.watchlist")}
              </h1>
              <p className="mt-1.5 max-w-[62ch] text-[13px] leading-relaxed text-white/55">
                {t("secondaryMarket.watchlist.intro")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-white px-4 text-[13px] font-semibold text-black transition hover:bg-[#e8e8e8] active:scale-[0.98]"
          >
            <Plus className="size-4" strokeWidth={2.5} aria-hidden />
            {t("secondaryMarket.watchlist.add")}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-2xl bg-white/[0.04] p-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-500">{t("secondaryMarket.watchlist.inList")}</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-white">{summary.n}</p>
        </div>
        <div className="rounded-2xl bg-white/[0.04] p-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-500">{t("secondaryMarket.watchlist.listingsCount")}</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-zinc-200">{summary.sumListings}</p>
        </div>
        <div className="rounded-2xl bg-white/[0.04] p-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-500">{t("secondaryMarket.watchlist.deals24h")}</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-white/90">{summary.sumDeals}</p>
        </div>
        <div className="rounded-2xl bg-white/[0.04] p-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-500">{t("secondaryMarket.watchlist.liquidCount")}</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-zinc-300">{summary.hi}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {SEGMENT_QUICK.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => patchFilters({ segment: chip.id })}
            className={cn(
              "rounded-full px-3.5 py-2 text-[12px] font-medium tracking-[-0.01em] transition-colors",
              filters.segment === chip.id
                ? "bg-white text-black"
                : "bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1] hover:text-zinc-200",
            )}
          >
            {t(chip.labelKey)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-600" aria-hidden />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => patchFilters({ query: e.target.value })}
            placeholder={t("secondaryMarket.watchlist.searchPlaceholder")}
            className="h-11 w-full rounded-full bg-white/[0.06] py-2 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:bg-white/[0.09]"
            aria-label={t("secondaryMarket.aria.searchWatchlist")}
          />
        </div>
        <button
          type="button"
          onClick={() => setIsFiltersOpen(true)}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-white/[0.06] px-4 text-[13px] font-medium text-zinc-200 transition hover:bg-white/[0.1]"
        >
          <SlidersHorizontal className="size-4 text-zinc-500" aria-hidden />
          {t("secondaryMarket.aria.filters")}
          {activeFilterCount > 0 ? (
            <span className="flex size-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </div>

      <SecondaryMarketWatchlistFiltersSheet
        open={isFiltersOpen}
        onOpenChange={setIsFiltersOpen}
        filters={filters}
        onChange={patchFilters}
        onReset={resetFilters}
        resultCount={filtered.length}
        totalCount={items.length}
      />

      <SecondaryMarketWatchlistAddSheet
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        candidates={addCandidates}
        onAdd={addToWatchlist}
      />

      <SecondaryMarketWatchlistDetailSheet
        item={selectedItem}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null);
        }}
        onRemove={(id) => void remove(id)}
      />

      {loading ? (
        <div className="flex items-center gap-2 text-[12px] text-zinc-500">
          <SplitonLoader size="xxs" variant="dark" className="shrink-0" />
          {t("secondaryMarket.watchlist.updating")}
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.04] px-6 py-16 text-center">
          <div className="relative mx-auto size-28">
            <Image
              src={WATCHLIST_HERO_ICON}
              alt=""
              fill
              sizes="112px"
              className="object-contain opacity-90"
              unoptimized
              aria-hidden
            />
          </div>
          <h2 className="mt-5 text-lg font-semibold tracking-tight text-white">{t("secondaryMarket.empty.watchlistEmpty")}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
            {t("secondaryMarket.watchlist.emptyDesc")}
          </p>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[13px] font-semibold text-black transition hover:bg-[#e8e8e8]"
          >
            <Plus className="size-4" aria-hidden />
            {t("secondaryMarket.watchlist.addRelease")}
          </button>
          <Link
            href={secondaryMarketHref("market")}
            className="mt-3 block text-[12px] text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
          >
            {t("secondaryMarket.watchlist.orOpenMarket")}
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.04] px-6 py-14 text-center">
          <p className="text-sm font-semibold text-white">{t("secondaryMarket.empty.noResults")}</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 text-[12px] text-zinc-400 underline-offset-2 hover:text-white hover:underline"
          >
            {t("secondaryMarket.filters.resetFilters")}
          </button>
          <button
            type="button"
            onClick={() => setIsFiltersOpen(true)}
            className="mt-3 inline-flex h-10 items-center gap-2 rounded-full bg-white/[0.06] px-4 text-[12px] font-medium text-zinc-300 transition hover:bg-white/[0.1]"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            {t("secondaryMarket.filters.changeFilters")}
          </button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-white/[0.05] md:hidden">
            {filtered.map((row) => {
              const pos = row.change24hPct >= 0;
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setSelectedItem(row)}
                  className="flex w-full items-start gap-3 py-3.5 text-left transition hover:bg-white/[0.02]"
                >
                  <CoverThumb symbol={row.symbol} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold tracking-[-0.01em] text-white">{row.track}</p>
                        <p className="truncate text-[12px] text-zinc-500">
                          {row.symbol} · {formatUsdt(row.pricePerUnit)} USDT
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 font-mono text-[12px] font-semibold tabular-nums",
                          pos ? "text-emerald-300/90" : "text-rose-300/90",
                        )}
                      >
                        {pos ? "+" : ""}
                        {row.change24hPct.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-zinc-600">
                        {formatMessage(t("secondaryMarket.watchlist.deals24hShort"), {
                          count: row.deals24h,
                          liquidity: liquidityLabel(row.liquidity, t),
                        })}
                      </span>
                      {row.spark.length >= 2 ? (
                        <ExchangeNeonSparkline values={row.spark} trend={pos ? "up" : "down"} width={56} height={18} detailSegments={3} />
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="hidden min-w-0 overflow-x-auto rounded-2xl bg-white/[0.04] md:block">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="text-zinc-500">
                  <th className="min-w-[200px] px-3.5 py-3 font-normal">
                    <span className="text-[11px] uppercase tracking-wide">{t("secondaryMarket.watchlist.columnTrack")}</span>
                  </th>
                  <th className="px-3.5 py-3 text-right font-normal">
                    <span className="text-[11px] uppercase tracking-wide">{t("secondaryMarket.orders.columnPrice")}</span>
                  </th>
                  <th className="px-3.5 py-3 text-right font-normal">
                    <span className="text-[11px] uppercase tracking-wide">{t("secondaryMarket.watchlist.column24h")}</span>
                  </th>
                  <th className="hidden px-3.5 py-3 text-right font-normal lg:table-cell">
                    <span className="text-[11px] uppercase tracking-wide">{t("secondaryMarket.watchlist.deals24h")}</span>
                  </th>
                  <th className="hidden px-3.5 py-3 font-normal lg:table-cell">
                    <span className="text-[11px] uppercase tracking-wide">{t("secondaryMarket.listings.columnLiquidity")}</span>
                  </th>
                  <th className="hidden px-3.5 py-3 font-normal xl:table-cell">
                    <span className="text-[11px] uppercase tracking-wide">{t("secondaryMarket.watchlist.columnDynamics")}</span>
                  </th>
                  <th className="px-3.5 py-3 text-right font-normal">
                    <span className="text-[11px] uppercase tracking-wide">{t("secondaryMarket.listings.columnActions")}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-zinc-300">
                {filtered.map((row) => {
                  const pos = row.change24hPct >= 0;
                  return (
                    <tr
                      key={row.id}
                      tabIndex={0}
                      onClick={() => setSelectedItem(row)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedItem(row);
                        }
                      }}
                      className="cursor-pointer border-t border-white/[0.04] transition-colors hover:bg-white/[0.02] focus-visible:bg-white/[0.04] focus-visible:outline-none"
                    >
                      <td className="px-3.5 py-3 align-middle">
                        <div className="flex items-center gap-2.5">
                          <CoverThumb symbol={row.symbol} />
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold tracking-[-0.01em] text-white">{row.track}</p>
                            <p className="truncate text-[11px] text-zinc-500">
                              {row.artist} · {row.symbol}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3.5 py-3 text-right align-middle font-mono tabular-nums text-white">
                        {formatUsdt(row.pricePerUnit)}
                      </td>
                      <td
                        className={cn(
                          "px-3.5 py-3 text-right align-middle font-mono text-[12px] font-semibold tabular-nums",
                          pos ? "text-emerald-300/90" : "text-rose-300/90",
                        )}
                      >
                        {pos ? "+" : ""}
                        {row.change24hPct.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%
                      </td>
                      <td className="hidden px-3.5 py-3 text-right align-middle font-mono tabular-nums lg:table-cell">
                        {row.deals24h}
                      </td>
                      <td className="hidden px-3.5 py-3 align-middle lg:table-cell">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                            row.liquidity === "high" && "bg-white/[0.08] text-white",
                            row.liquidity === "med" && "bg-white/[0.06] text-zinc-300",
                            row.liquidity === "low" && "bg-amber-500/12 text-amber-200/90",
                          )}
                        >
                          {liquidityLabel(row.liquidity, t)}
                        </span>
                      </td>
                      <td className="hidden px-3.5 py-3 align-middle xl:table-cell">
                        {row.spark.length >= 2 ? (
                          <ExchangeNeonSparkline values={row.spark} trend={pos ? "up" : "down"} width={72} height={22} detailSegments={4} />
                        ) : null}
                      </td>
                      <td className="px-3.5 py-3 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <SplitonCtaPill
                            href={bookHref(row.bookMarketId)}
                            tone="onDark"
                            className="h-8 gap-1.5 pl-3 pr-1 text-[11px] font-medium tracking-[-0.01em] [&>span:last-child]:size-6 [&>span:last-child>svg]:size-3"
                          >
                            {row.bookMarketId ? t("secondaryMarket.actions.orderBook") : t("secondaryMarket.tabs.market")}
                          </SplitonCtaPill>
                          <Link
                            href={secondaryMarketReleaseAnalyticsPath(row.releaseId)}
                            scroll={false}
                            className="inline-flex h-8 items-center rounded-full bg-white/[0.06] px-2.5 text-[11px] font-medium text-zinc-300 transition hover:bg-white/[0.1] hover:text-white"
                          >
                            {t("secondaryMarket.watchlist.analytics")}
                          </Link>
                          <Link
                            href={`${analyticsReleaseDetailPath(getSecondaryMarketAnalyticsCatalogIdForReleaseSlug(row.releaseId))}?from=catalog`}
                            className="inline-flex h-8 items-center rounded-full bg-white px-2.5 text-[11px] font-semibold text-black transition hover:bg-[#e8e8e8]"
                          >
                            {t("secondaryMarket.actions.release")}
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {toastMessage ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-20 left-1/2 z-130 -translate-x-1/2 px-4 md:bottom-6"
        >
          <div className="rounded-2xl bg-zinc-950/95 px-4 py-3 text-[12px] font-medium text-zinc-100 shadow-lg">
            {toastMessage}
          </div>
        </div>
      ) : null}
    </div>
  );
}
