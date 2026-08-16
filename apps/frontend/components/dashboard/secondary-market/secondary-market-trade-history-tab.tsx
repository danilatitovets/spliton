"use client";

import * as React from "react";

import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { statusLabel } from "@/lib/i18n/status-labels";
import type { AppLocale } from "@/lib/i18n/types";
import { ROUTES } from "@/constants/routes";
import { getWalletDataSource } from "@/services/wallet.service";
import { useSecondaryMarketTrades } from "@/hooks/use-secondary-market-live";
import {
  SecondaryMarketAuthGate,
  SecondaryMarketErrorState,
  SecondaryMarketLoadingState,
} from "@/components/dashboard/secondary-market/secondary-market-fetch-states";
import {
  countActiveTradeHistoryFilters,
  SecondaryMarketTradeHistoryFiltersSheet,
  type TradeHistoryFiltersState,
} from "@/components/dashboard/secondary-market/secondary-market-trade-history-filters-sheet";
import { SecondaryMarketTradeDetailSheet } from "@/components/dashboard/secondary-market/secondary-market-trade-detail-sheet";
import { ArrowDown, ArrowUp, ChevronDown, Download, ExternalLink, LayoutPanelTop, MoreHorizontal, Search, SlidersHorizontal } from "@/lib/lucide";
import { SplitonLoader } from "@/components/ui/spliton-loader";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";

import {
  secondaryMarketBookHref,
  secondaryMarketBookIdForSymbol,
  secondaryMarketHref,
} from "@/constants/dashboard/secondary-market";
import {
  analyticsReleaseDetailPath,
  secondaryMarketReleaseAnalyticsPath,
} from "@/constants/routes";
import { getSecondaryMarketAnalyticsCatalogIdForReleaseSlug } from "@/mocks/dashboard/secondary-market-listings.mock";
import { cn } from "@/lib/utils";
import { smExchange } from "@/components/dashboard/secondary-market/secondary-market-exchange-styles";

import {
  smTableActionIconCircle,
  smTableActionIconCirclePressed,
  smTableActionMenuItemLink,
  smTableActionMenuItemMuted,
  smTableActionMenuItemSecondary,
  smTableActionMoreMenu,
  smTableActionReleasePill,
  smTableActionSecondaryPill,
} from "@/components/dashboard/secondary-market/secondary-market-table-action-styles";

const HISTORY_HERO_ICON = "/images/secondary-market/history-hero.png";
const HISTORY_HEADER_VIDEO = "/videos/position-holding-bg.mp4";

type TradeSide = "buy" | "sell";
type SettlementStatus = "settled" | "processing" | "failed";

export type SecondaryMarketUserTradeMock = {
  id: string;
  /** ISO 8601, время исполнения на бирже. */
  timestamp: string;
  releaseId: string;
  releaseSlug: string;
  title: string;
  artist: string;
  ticker: string;
  genre: "electronic" | "pop" | "hiphop" | "rock";
  side: TradeSide;
  units: number;
  /** Цена исполнения за unit, USDT. */
  price: number;
  /** Gross без комиссии. */
  grossAmount: number;
  feeAmount: number;
  /** Покупка: списано всего (gross+fee). Продажа: зачислено нетто (gross−fee). */
  netAmount: number;
  settlementStatus: SettlementStatus;
  linkedOrderId: string;
  linkedListingId: string;
};

/** Демо-история: только исполненные сделки пользователя (ledger). */
const MOCK_TRADES_SEED: SecondaryMarketUserTradeMock[] = [
  {
    id: "trd-a901",
    timestamp: "2026-04-21T14:32:00",
    releaseId: "midnight-run",
    releaseSlug: "midnight-run",
    title: "Midnight Run",
    artist: "Nova Lane",
    ticker: "MNR",
    genre: "electronic",
    side: "buy",
    units: 24,
    price: 18.5,
    grossAmount: 444,
    feeAmount: 0.67,
    netAmount: 444.67,
    settlementStatus: "settled",
    linkedOrderId: "ord-8f2a",
    linkedListingId: "lst-mnr",
  },
  {
    id: "trd-a8ff",
    timestamp: "2026-04-21T09:10:00",
    releaseId: "midnight-run",
    releaseSlug: "midnight-run",
    title: "Midnight Run",
    artist: "Nova Lane",
    ticker: "MNR",
    genre: "electronic",
    side: "sell",
    units: 40,
    price: 18.52,
    grossAmount: 740.8,
    feeAmount: 1.11,
    netAmount: 739.69,
    settlementStatus: "settled",
    linkedOrderId: "ord-7c11",
    linkedListingId: "lst-mnr",
  },
  {
    id: "trd-a712",
    timestamp: "2026-04-18T16:22:00",
    releaseId: "midnight-run",
    releaseSlug: "midnight-run",
    title: "Midnight Run",
    artist: "Nova Lane",
    ticker: "MNR",
    genre: "electronic",
    side: "buy",
    units: 12,
    price: 18.48,
    grossAmount: 221.76,
    feeAmount: 0.33,
    netAmount: 222.09,
    settlementStatus: "settled",
    linkedOrderId: "ord-6d90",
    linkedListingId: "lst-mnr",
  },
  {
    id: "trd-9c40",
    timestamp: "2026-04-17T09:15:00",
    releaseId: "signal-noise",
    releaseSlug: "signal-noise",
    title: "Signal / Noise",
    artist: "Kairo",
    ticker: "SGN",
    genre: "hiphop",
    side: "sell",
    units: 20,
    price: 22.15,
    grossAmount: 443,
    feeAmount: 0.66,
    netAmount: 442.34,
    settlementStatus: "processing",
    linkedOrderId: "ord-9c40",
    linkedListingId: "lst-sgn",
  },
  {
    id: "trd-8b21",
    timestamp: "2026-04-14T14:30:00",
    releaseId: "glassline",
    releaseSlug: "glassline",
    title: "Glassline",
    artist: "The Static",
    ticker: "GLS",
    genre: "rock",
    side: "buy",
    units: 25,
    price: 9.05,
    grossAmount: 226.25,
    feeAmount: 0.34,
    netAmount: 226.59,
    settlementStatus: "settled",
    linkedOrderId: "ord-8b21",
    linkedListingId: "lst-gls",
  },
  {
    id: "trd-7a03",
    timestamp: "2026-04-10T08:00:00",
    releaseId: "aurora-drift",
    releaseSlug: "aurora-drift",
    title: "Aurora Drift",
    artist: "Mira Sol",
    ticker: "AUR",
    genre: "pop",
    side: "buy",
    units: 10,
    price: 11.2,
    grossAmount: 112,
    feeAmount: 0.17,
    netAmount: 112.17,
    settlementStatus: "processing",
    linkedOrderId: "ord-7a03",
    linkedListingId: "lst-aur",
  },
  {
    id: "trd-6f88",
    timestamp: "2026-03-28T19:12:00",
    releaseId: "velvet-room",
    releaseSlug: "velvet-room",
    title: "Velvet Room",
    artist: "June & Co",
    ticker: "VLT",
    genre: "pop",
    side: "sell",
    units: 8,
    price: 6.9,
    grossAmount: 55.2,
    feeAmount: 0.08,
    netAmount: 55.12,
    settlementStatus: "settled",
    linkedOrderId: "ord-6f88",
    linkedListingId: "lst-vlt",
  },
  {
    id: "trd-5d12",
    timestamp: "2026-03-15T10:00:00",
    releaseId: "signal-noise",
    releaseSlug: "signal-noise",
    title: "Signal / Noise",
    artist: "Kairo",
    ticker: "SGN",
    genre: "hiphop",
    side: "buy",
    units: 6,
    price: 21.9,
    grossAmount: 131.4,
    feeAmount: 0.2,
    netAmount: 131.6,
    settlementStatus: "settled",
    linkedOrderId: "ord-5d12",
    linkedListingId: "lst-sgn",
  },
  {
    id: "trd-4e33",
    timestamp: "2026-03-02T11:20:00",
    releaseId: "glassline",
    releaseSlug: "glassline",
    title: "Glassline",
    artist: "The Static",
    ticker: "GLS",
    genre: "rock",
    side: "sell",
    units: 15,
    price: 9.12,
    grossAmount: 136.8,
    feeAmount: 0.21,
    netAmount: 136.59,
    settlementStatus: "settled",
    linkedOrderId: "ord-4e33",
    linkedListingId: "lst-gls",
  },
  {
    id: "trd-3c91",
    timestamp: "2026-02-18T16:45:00",
    releaseId: "midnight-run",
    releaseSlug: "midnight-run",
    title: "Midnight Run",
    artist: "Nova Lane",
    ticker: "MNR",
    genre: "electronic",
    side: "buy",
    units: 8,
    price: 18.2,
    grossAmount: 145.6,
    feeAmount: 0.22,
    netAmount: 145.82,
    settlementStatus: "failed",
    linkedOrderId: "ord-3c91",
    linkedListingId: "lst-mnr",
  },
  {
    id: "trd-2b07",
    timestamp: "2026-02-01T09:30:00",
    releaseId: "velvet-room",
    releaseSlug: "velvet-room",
    title: "Velvet Room",
    artist: "June & Co",
    ticker: "VLT",
    genre: "pop",
    side: "buy",
    units: 30,
    price: 6.85,
    grossAmount: 205.5,
    feeAmount: 0.31,
    netAmount: 205.81,
    settlementStatus: "settled",
    linkedOrderId: "ord-2b07",
    linkedListingId: "lst-vlt",
  },
  {
    id: "trd-1a55",
    timestamp: "2026-01-12T13:05:00",
    releaseId: "aurora-drift",
    releaseSlug: "aurora-drift",
    title: "Aurora Drift",
    artist: "Mira Sol",
    ticker: "AUR",
    genre: "pop",
    side: "sell",
    units: 12,
    price: 11.05,
    grossAmount: 132.6,
    feeAmount: 0.2,
    netAmount: 132.4,
    settlementStatus: "settled",
    linkedOrderId: "ord-1a55",
    linkedListingId: "lst-aur",
  },
];

const DEFAULT_FILTERS: TradeHistoryFiltersState = {
  period: "30d",
  sideFilter: "all",
  settlementFilter: "all",
  genreFilter: "all",
  query: "",
  sortKey: "time",
  sortDir: "desc",
};

type SortKey = TradeHistoryFiltersState["sortKey"];
type SortDir = TradeHistoryFiltersState["sortDir"];

function formatUsdt(n: number) {
  return n.toLocaleString("ru-RU", {
    minimumFractionDigits: n % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function periodCutoffMs(period: TradeHistoryFiltersState["period"]): number | null {
  if (period === "all") return null;
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  return Date.now() - days * 86400000;
}

function inPeriod(row: SecondaryMarketUserTradeMock, period: TradeHistoryFiltersState["period"]): boolean {
  const ms = periodCutoffMs(period);
  if (ms == null) return true;
  return new Date(row.timestamp).getTime() >= ms;
}

function CoverThumb({ ticker }: { ticker: string }) {
  const hue = ticker.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="size-9 shrink-0 rounded-full"
      style={{
        background: `linear-gradient(145deg, hsl(${hue}, 42%, 26%) 0%, hsl(${(hue + 48) % 360}, 28%, 10%) 100%)`,
      }}
      aria-hidden
    />
  );
}

function settlementLabel(s: SettlementStatus, locale: AppLocale): string {
  return statusLabel("trade", s, locale);
}

function formatMessage(template: string, params: Record<string, string | number>): string {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)),
    template,
  );
}

function tm(t: (key: string) => string, key: string, params?: Record<string, string | number>): string {
  const raw = t(key);
  return params ? formatMessage(raw, params) : raw;
}

function settlementTooltip(s: SettlementStatus, t: (key: string) => string): string {
  switch (s) {
    case "settled":
      return t("secondaryMarket.trade.settlementTooltip.settled");
    case "processing":
      return t("secondaryMarket.trade.settlementTooltip.processing");
    case "failed":
      return t("secondaryMarket.trade.settlementTooltip.failed");
    default:
      return "";
  }
}

function settlementPillClass(s: SettlementStatus) {
  switch (s) {
    case "settled":
      return "bg-[#B7F500]/15 text-[#B7F500]";
    case "processing":
      return "bg-amber-500/12 text-amber-200/95";
    case "failed":
      return "bg-fuchsia-500/15 text-fuchsia-300/90";
    default:
      return "bg-white/[0.04] text-zinc-500";
  }
}

function releaseAssetHref(releaseId: string) {
  const catalogId = getSecondaryMarketAnalyticsCatalogIdForReleaseSlug(releaseId);
  return `${analyticsReleaseDetailPath(catalogId)}?from=secondary`;
}

function tradeAnalyticsHref(releaseId: string) {
  return secondaryMarketReleaseAnalyticsPath(releaseId);
}

function stackHrefForTicker(ticker: string): string | null {
  const id = secondaryMarketBookIdForSymbol(ticker);
  return id ? secondaryMarketBookHref(id) : null;
}

const PERIOD_QUICK = [
  { id: "7d" as const, key: "secondaryMarket.filters.period7d" },
  { id: "30d" as const, key: "secondaryMarket.filters.period30d" },
  { id: "90d" as const, key: "secondaryMarket.filters.period90d" },
  { id: "all" as const, key: "secondaryMarket.filters.periodAll" },
] as const;

function buildCsv(rows: SecondaryMarketUserTradeMock[]): string {
  const header = [
    "timestamp",
    "id",
    "ticker",
    "title",
    "side",
    "units",
    "price",
    "gross_usdt",
    "fee_usdt",
    "net_usdt",
    "settlement",
    "order_id",
    "listing_id",
  ].join(",");
  const lines = rows.map((r) =>
    [
      r.timestamp,
      r.id,
      r.ticker,
      `"${r.title.replace(/"/g, '""')}"`,
      r.side,
      r.units,
      r.price,
      r.grossAmount,
      r.feeAmount,
      r.netAmount,
      r.settlementStatus,
      r.linkedOrderId,
      r.linkedListingId,
    ].join(","),
  );
  return [header, ...lines].join("\n");
}

function SortTh({
  label,
  active,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <th className={cn("px-3.5 py-3 font-normal", align === "right" && "text-right")}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide transition-colors",
          align === "right" && "ml-auto flex-row-reverse",
          active ? "text-white" : "text-zinc-500 hover:text-zinc-300",
        )}
      >
        {label}
        {active ? (
          dir === "desc" ? (
            <ArrowDown className="size-3 shrink-0 opacity-80" aria-hidden />
          ) : (
            <ArrowUp className="size-3 shrink-0 opacity-80" aria-hidden />
          )
        ) : (
          <ChevronDown className="size-3 shrink-0 opacity-40" aria-hidden />
        )}
      </button>
    </th>
  );
}

function TableSkeleton() {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl bg-white/[0.04]">
      <div className="border-b border-white/[0.05] px-3.5 py-3">
        <div className="h-3 w-40 animate-pulse rounded bg-white/[0.06]" />
      </div>
      <div className="space-y-3 divide-y divide-white/[0.04] p-3.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-3 pt-3 first:pt-0">
            <div className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-white/[0.06]" />
            <div className="h-9 flex-1 animate-pulse rounded-full bg-white/[0.05]" />
            <div className="h-9 w-20 shrink-0 animate-pulse rounded-full bg-white/[0.04]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SecondaryMarketTradeHistoryTab() {
  const isLive = getWalletDataSource() === "live";
  const { isAuthenticated, authorizedFetch } = useAuth();
  const { locale, t } = useI18n();
  const liveTrades = useSecondaryMarketTrades();
  const [mockTrades, setMockTrades] = React.useState<SecondaryMarketUserTradeMock[]>([]);
  const [mockLoading, setMockLoading] = React.useState(!isLive);
  const trades = isLive ? liveTrades.trades : mockTrades;
  const loading = isLive ? liveTrades.loading : mockLoading;
  const [filters, setFilters] = React.useState<TradeHistoryFiltersState>(DEFAULT_FILTERS);
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);
  const [selectedTrade, setSelectedTrade] = React.useState<SecondaryMarketUserTradeMock | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isLive) return;
    const t = window.setTimeout(() => {
      setMockTrades(MOCK_TRADES_SEED);
      setMockLoading(false);
    }, 520);
    return () => window.clearTimeout(t);
  }, [isLive]);

  React.useEffect(() => {
    if (!openMenuId) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [openMenuId]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedTrade(null);
        setOpenMenuId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const showToast = React.useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 4000);
  }, []);

  const filteredSorted = React.useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const rows = trades.filter((row) => {
      if (!inPeriod(row, filters.period)) return false;
      if (filters.sideFilter !== "all" && row.side !== filters.sideFilter) return false;
      if (filters.settlementFilter !== "all" && row.settlementStatus !== filters.settlementFilter) return false;
      if (filters.genreFilter !== "all" && row.genre !== filters.genreFilter) return false;
      if (!q) return true;
      return (
        row.id.toLowerCase().includes(q) ||
        row.ticker.toLowerCase().includes(q) ||
        row.title.toLowerCase().includes(q) ||
        row.artist.toLowerCase().includes(q) ||
        row.linkedOrderId.toLowerCase().includes(q)
      );
    });
    const dir = filters.sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      if (filters.sortKey === "time") {
        return dir * (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      }
      if (filters.sortKey === "gross") return dir * (a.grossAmount - b.grossAmount);
      return dir * (a.price - b.price);
    });
  }, [trades, filters]);

  const activeFilterCount = countActiveTradeHistoryFilters(filters);

  const patchFilters = React.useCallback((patch: Partial<TradeHistoryFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggleSort = (key: SortKey) => {
    setFilters((prev) => {
      if (prev.sortKey === key) {
        return { ...prev, sortDir: prev.sortDir === "desc" ? "asc" : "desc" };
      }
      return { ...prev, sortKey: key, sortDir: "desc" };
    });
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const exportCsv = () => {
    const blob = new Blob([buildCsv(filteredSorted)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Spliton-secondary-trades-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t("secondaryMarket.trade.toastCsvExported"));
  };

  const drawerTrade = React.useMemo(() => {
    if (!selectedTrade) return null;
    return trades.find((t) => t.id === selectedTrade.id) ?? selectedTrade;
  }, [trades, selectedTrade]);

  const marketHref = secondaryMarketHref("market");
  const catalogOverviewHref = ROUTES.catalogMarketOverview;

  if (isLive && !isAuthenticated) {
    return <SecondaryMarketAuthGate />;
  }
  if (isLive && liveTrades.loading && liveTrades.trades.length === 0) {
    return <SecondaryMarketLoadingState label={t("secondaryMarket.trade.loadingHistory")} />;
  }
  if (isLive && liveTrades.error) {
    return (
      <SecondaryMarketErrorState message={liveTrades.error} onRetry={() => void liveTrades.reload()} />
    );
  }

  return (
    <div className="relative space-y-6">
      <header className="relative isolate overflow-hidden rounded-2xl">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <video
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-[12px] motion-reduce:hidden"
            src={HISTORY_HEADER_VIDEO}
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
                src={HISTORY_HERO_ICON}
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
                {t("secondaryMarket.tabs.history")}
              </h1>
              <p className="mt-1.5 max-w-[62ch] text-[13px] leading-relaxed text-white/55">
                {t("secondaryMarket.trade.intro")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            disabled={loading || filteredSorted.length === 0}
            className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-full bg-white/[0.08] px-4 text-[13px] font-medium text-zinc-200 backdrop-blur-sm transition hover:bg-white/[0.12] hover:text-white disabled:pointer-events-none disabled:opacity-40"
          >
            <Download className="size-4 shrink-0 opacity-70" aria-hidden />
            CSV
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("secondaryMarket.aria.periodSummary")}>
          {PERIOD_QUICK.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => patchFilters({ period: opt.id })}
              className={cn(
                smExchange.chipBase,
                filters.period === opt.id ? smExchange.chipActive : smExchange.chipIdle,
              )}
            >
              {t(opt.key)}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(
            [
              { id: "all" as const, label: t("secondaryMarket.filters.all") },
              { id: "buy" as const, label: t("secondaryMarket.side.buy") },
              { id: "sell" as const, label: t("secondaryMarket.side.sell") },
            ] as const
          ).map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => patchFilters({ sideFilter: chip.id })}
              className={cn(
                smExchange.chipBase,
                filters.sideFilter === chip.id
                  ? chip.id === "buy"
                    ? "bg-[#B7F500] text-black"
                    : chip.id === "sell"
                      ? "bg-fuchsia-400 text-black"
                      : smExchange.chipActive
                  : smExchange.chipIdle,
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-600"
            aria-hidden
          />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => patchFilters({ query: e.target.value })}
            placeholder={t("secondaryMarket.filters.searchTrades")}
            className={smExchange.inputPill}
            aria-label={t("secondaryMarket.aria.searchTrades")}
          />
        </div>
        <button
          type="button"
          onClick={() => setIsFiltersOpen(true)}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-white/[0.06] px-4 text-[13px] font-medium text-zinc-200 transition hover:bg-white/[0.1]"
        >
          <SlidersHorizontal className="size-4 text-zinc-500" aria-hidden />
          {t("secondaryMarket.trade.filters")}
          {activeFilterCount > 0 ? (
            <span className="flex size-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </div>

      <SecondaryMarketTradeHistoryFiltersSheet
        open={isFiltersOpen}
        onOpenChange={setIsFiltersOpen}
        filters={filters}
        onChange={patchFilters}
        onReset={resetFilters}
        resultCount={filteredSorted.length}
        totalCount={trades.length}
      />

      {loading ? (
        <div className="flex items-center gap-2 text-[12px] text-zinc-500">
          <SplitonLoader size="xxs" variant="dark" className="shrink-0" />
          {t("secondaryMarket.trade.loadingJournal")}
        </div>
      ) : null}

      {loading ? (
        <TableSkeleton />
      ) : trades.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.04] px-6 py-16 text-center">
          <div className="relative mx-auto size-28">
            <Image
              src={HISTORY_HERO_ICON}
              alt=""
              fill
              sizes="112px"
              className="object-contain opacity-90"
              unoptimized
              aria-hidden
            />
          </div>
          <h2 className="mt-5 text-lg font-semibold tracking-tight text-white">{t("secondaryMarket.empty.noTrades")}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
            {t("secondaryMarket.empty.noTradesDesc")}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <SplitonCtaPill
              href={marketHref}
              tone="onDark"
              className="h-11 min-w-[200px] justify-between gap-3 pl-5 pr-1.5 text-[13px] font-semibold"
            >
              {t("secondaryMarket.trade.openMarket")}
            </SplitonCtaPill>
            <Link
              href={catalogOverviewHref}
              scroll={false}
              className="inline-flex h-11 min-w-[200px] items-center justify-center rounded-full bg-white/[0.06] px-5 text-[13px] font-medium text-zinc-200 transition hover:bg-white/[0.1]"
            >
              {t("secondaryMarket.trade.toMarketAnalytics")}
            </Link>
          </div>
        </div>
      ) : filteredSorted.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.04] px-6 py-16 text-center">
          <h2 className="text-lg font-semibold tracking-tight text-white">{t("secondaryMarket.empty.noResults")}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
            {t("secondaryMarket.trade.emptyFilterDesc")}
          </p>
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
          <div className="hidden md:block">
            <div className="max-h-[min(70vh,720px)] overflow-auto rounded-2xl bg-[#111111] ring-1 ring-white/[0.08]">
              <table className="w-full min-w-[1040px] border-collapse text-left">
                <thead className="sticky top-0 z-20 bg-[#111111]/90 backdrop-blur-md">
                  <tr className="text-zinc-500">
                    <SortTh label={t("secondaryMarket.sort.time")} active={filters.sortKey === "time"} dir={filters.sortDir} onClick={() => toggleSort("time")} />
                    <th className="px-3.5 py-3 font-normal">
                      <span className="text-[11px] uppercase tracking-wide">{t("secondaryMarket.trade.tradeId")}</span>
                    </th>
                    <th className="min-w-[200px] px-3.5 py-3 font-normal">
                      <span className="text-[11px] uppercase tracking-wide">{t("secondaryMarket.trade.columnListingRelease")}</span>
                    </th>
                    <th className="px-3.5 py-3 font-normal">
                      <span className="text-[11px] uppercase tracking-wide">{t("secondaryMarket.orders.columnSide")}</span>
                    </th>
                    <th className="px-3.5 py-3 text-right font-normal">
                      <span className="text-[11px] uppercase tracking-wide">{t("secondaryMarket.orders.columnUnits")}</span>
                    </th>
                    <SortTh
                      label={t("secondaryMarket.sort.price")}
                      align="right"
                      active={filters.sortKey === "price"}
                      dir={filters.sortDir}
                      onClick={() => toggleSort("price")}
                    />
                    <SortTh
                      label={t("secondaryMarket.orders.columnAmount")}
                      align="right"
                      active={filters.sortKey === "gross"}
                      dir={filters.sortDir}
                      onClick={() => toggleSort("gross")}
                    />
                    <th className="hidden px-3.5 py-3 text-right font-normal lg:table-cell">
                      <span className="text-[11px] uppercase tracking-wide">{t("secondaryMarket.trade.fee")}</span>
                    </th>
                    <th className="px-3.5 py-3 text-right font-normal">
                      <span className="block text-[11px] uppercase tracking-wide">{t("secondaryMarket.trade.total")}</span>
                      <span className="mt-0.5 block text-[10px] font-normal normal-case tracking-normal text-zinc-600">
                        {t("secondaryMarket.trade.totalSubheader")}
                      </span>
                    </th>
                    <th className="hidden px-3.5 py-3 font-normal xl:table-cell">
                      <span className="text-[11px] uppercase tracking-wide">{t("secondaryMarket.trade.columnSettlement")}</span>
                    </th>
                    <th className="px-3.5 py-3 text-right font-normal">
                      <span className="text-[11px] uppercase tracking-wide">{t("secondaryMarket.actions.actions")}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[13px] text-zinc-300">
                  {filteredSorted.map((row) => {
                    const stack = stackHrefForTicker(row.ticker);
                    return (
                      <tr
                        key={row.id}
                        tabIndex={0}
                        onClick={() => setSelectedTrade(row)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedTrade(row);
                          }
                        }}
                        className="cursor-pointer border-t border-white/[0.04] transition-colors hover:bg-white/[0.02] focus-visible:bg-white/[0.04] focus-visible:outline-none"
                      >
                        <td className="whitespace-nowrap px-3.5 py-3 align-middle font-mono text-[11px] text-zinc-500">
                          {formatDateTime(row.timestamp)}
                        </td>
                        <td className="px-3.5 py-3 align-middle font-mono text-[11px] text-zinc-600">{row.id}</td>
                        <td className="px-3.5 py-3 align-middle">
                          <div className="flex items-center gap-2.5">
                            <CoverThumb ticker={row.ticker} />
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-semibold tracking-[-0.01em] text-white">{row.title}</p>
                              <p className="truncate text-[11px] text-zinc-500">
                                {row.artist} · {row.ticker}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3.5 py-3 align-middle">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                              row.side === "buy"
                                ? "bg-[#B7F500]/15 text-[#B7F500]"
                                : "bg-fuchsia-400/15 text-fuchsia-400",
                            )}
                          >
                            {row.side === "buy" ? t("secondaryMarket.side.buy") : t("secondaryMarket.side.sell")}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-right align-middle font-mono tabular-nums">{row.units}</td>
                        <td className="px-3.5 py-3 text-right align-middle font-mono tabular-nums text-white">
                          {formatUsdt(row.price)}
                        </td>
                        <td className="px-3.5 py-3 text-right align-middle font-mono tabular-nums">{formatUsdt(row.grossAmount)}</td>
                        <td className="hidden px-3.5 py-3 text-right align-middle font-mono tabular-nums text-zinc-500 lg:table-cell">
                          {formatUsdt(row.feeAmount)}
                        </td>
                        <td className="px-3.5 py-3 text-right align-middle font-mono tabular-nums text-zinc-100">
                          {formatUsdt(row.netAmount)}
                        </td>
                        <td className="hidden px-3.5 py-3 align-middle xl:table-cell">
                          <span
                            title={settlementTooltip(row.settlementStatus, t)}
                            className={cn(
                              "inline-flex cursor-help rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                              settlementPillClass(row.settlementStatus),
                            )}
                          >
                            {settlementLabel(row.settlementStatus, locale)}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                          <div
                            className="relative flex flex-nowrap items-center justify-end gap-2.5"
                            ref={openMenuId === row.id ? menuRef : undefined}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedTrade(row)}
                              className={smTableActionIconCircle}
                              aria-label={t("secondaryMarket.actions.tradeDetails")}
                            >
                              <LayoutPanelTop className="size-[17px]" strokeWidth={1.75} aria-hidden />
                            </button>
                            <Link
                              href={releaseAssetHref(row.releaseId)}
                              scroll={false}
                              className={smTableActionReleasePill}
                            >
                              {t("secondaryMarket.actions.release")}
                              <ExternalLink className="size-3.5 opacity-55" aria-hidden />
                            </Link>
                            <div className="relative shrink-0">
                              <button
                                type="button"
                                aria-expanded={openMenuId === row.id}
                                aria-haspopup="menu"
                                aria-label={t("secondaryMarket.aria.moreActions")}
                                onClick={() => setOpenMenuId((id) => (id === row.id ? null : row.id))}
                                className={cn(
                                  smTableActionIconCircle,
                                  openMenuId === row.id && smTableActionIconCirclePressed,
                                )}
                              >
                                <MoreHorizontal className="size-[17px]" strokeWidth={1.75} aria-hidden />
                              </button>
                              {openMenuId === row.id ? (
                                <div role="menu" className={smTableActionMoreMenu}>
                                  <Link
                                    role="menuitem"
                                    href={releaseAssetHref(row.releaseId)}
                                    scroll={false}
                                    className={smTableActionMenuItemLink}
                                    onClick={() => setOpenMenuId(null)}
                                  >
                                    {t("secondaryMarket.actions.openRelease")}
                                  </Link>
                                  <Link
                                    role="menuitem"
                                    href={tradeAnalyticsHref(row.releaseId)}
                                    scroll={false}
                                    className={smTableActionMenuItemSecondary}
                                    onClick={() => setOpenMenuId(null)}
                                  >
                                    {t("secondaryMarket.actions.tradingAnalytics")}
                                  </Link>
                                  {stack ? (
                                    <Link
                                      role="menuitem"
                                      href={stack}
                                      scroll={false}
                                      className={smTableActionMenuItemLink}
                                      onClick={() => setOpenMenuId(null)}
                                    >
                                      {t("secondaryMarket.actions.orderBook")}
                                    </Link>
                                  ) : (
                                    <span className={smTableActionMenuItemMuted}>{t("secondaryMarket.actions.orderBookUnavailable")}</span>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:hidden">
            {filteredSorted.map((row) => {
              const stack = stackHrefForTicker(row.ticker);
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setSelectedTrade(row)}
                  className="w-full rounded-2xl bg-[#111111] p-4 text-left ring-1 ring-white/[0.08] transition hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 gap-3">
                      <CoverThumb ticker={row.ticker} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold tracking-[-0.01em] text-white">{row.title}</p>
                        <p className="truncate text-[11px] text-zinc-500">
                          {row.artist} · {row.ticker}
                        </p>
                        <p className="mt-2 font-mono text-[10px] text-zinc-600">{formatDateTime(row.timestamp)}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase",
                        row.side === "buy"
                          ? "bg-[#B7F500]/15 text-[#B7F500]"
                          : "bg-fuchsia-400/15 text-fuchsia-400",
                      )}
                    >
                      {row.side === "buy" ? t("secondaryMarket.side.buy") : t("secondaryMarket.side.sell")}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <p className="text-zinc-600">Gross</p>
                      <p className="mt-0.5 font-mono tabular-nums text-zinc-200">{formatUsdt(row.grossAmount)}</p>
                    </div>
                    <div>
                      <p className="text-zinc-600">{t("secondaryMarket.trade.total")}</p>
                      <p className="mt-0.5 font-mono tabular-nums text-white">{formatUsdt(row.netAmount)}</p>
                    </div>
                    <div>
                      <p className="text-zinc-600">{t("secondaryMarket.sort.price")}</p>
                      <p className="mt-0.5 font-mono tabular-nums text-zinc-300">{formatUsdt(row.price)}</p>
                    </div>
                    <div>
                      <p className="text-zinc-600">Units</p>
                      <p className="mt-0.5 font-mono tabular-nums text-zinc-300">{row.units}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span
                      title={settlementTooltip(row.settlementStatus, t)}
                      className={cn(
                        "inline-flex cursor-help rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                        settlementPillClass(row.settlementStatus),
                      )}
                    >
                      {settlementLabel(row.settlementStatus, locale)}
                    </span>
                    <div className="flex flex-wrap items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Link href={releaseAssetHref(row.releaseId)} scroll={false} className={smTableActionReleasePill}>
                        {t("secondaryMarket.actions.release")}
                        <ExternalLink className="size-3.5 opacity-55" aria-hidden />
                      </Link>
                      {stack ? (
                        <Link href={stack} scroll={false} className={smTableActionSecondaryPill}>
                          {t("secondaryMarket.actions.orderBook")}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      <SecondaryMarketTradeDetailSheet
        trade={drawerTrade}
        onOpenChange={(open) => {
          if (!open) setSelectedTrade(null);
        }}
        onToast={showToast}
      />

      {toastMessage ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-6 left-1/2 z-130 max-w-[min(100vw-2rem,28rem)] -translate-x-1/2 px-4"
        >
          <div className="rounded-2xl bg-zinc-950/95 px-4 py-3 text-[12px] text-zinc-100 shadow-lg">
            {toastMessage}
          </div>
        </div>
      ) : null}
    </div>
  );
}
