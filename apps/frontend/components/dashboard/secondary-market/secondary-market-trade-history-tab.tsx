"use client";

import * as React from "react";
import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Download,
  ExternalLink,
  Loader2,
  LayoutPanelTop,
  MoreHorizontal,
  Search,
  X,
} from "lucide-react";

import {
  secondaryMarketBookHref,
  secondaryMarketBookIdForSymbol,
  secondaryMarketHref,
} from "@/constants/dashboard/secondary-market";
import {
  analyticsReleaseDetailPath,
  ROUTES,
  secondaryMarketReleaseAnalyticsPath,
} from "@/constants/routes";
import { getSecondaryMarketAnalyticsCatalogIdForReleaseSlug } from "@/mocks/dashboard/secondary-market-listings.mock";
import { cn } from "@/lib/utils";

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

const PERIOD_OPTIONS = [
  { id: "7d" as const, label: "7д" },
  { id: "30d" as const, label: "30д" },
  { id: "90d" as const, label: "90д" },
  { id: "all" as const, label: "Все" },
] as const;

const SETTLEMENT_FILTER = [
  { id: "all" as const, label: "Все" },
  { id: "settled" as const, label: "Зачислено" },
  { id: "processing" as const, label: "В обработке" },
  { id: "failed" as const, label: "Ошибка" },
] as const;

type SortKey = "time" | "gross" | "price";
type SortDir = "asc" | "desc";

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

function periodCutoffMs(period: (typeof PERIOD_OPTIONS)[number]["id"]): number | null {
  if (period === "all") return null;
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  return Date.now() - days * 86400000;
}

function inPeriod(row: SecondaryMarketUserTradeMock, period: (typeof PERIOD_OPTIONS)[number]["id"]): boolean {
  const ms = periodCutoffMs(period);
  if (ms == null) return true;
  return new Date(row.timestamp).getTime() >= ms;
}

function CoverThumb({ ticker }: { ticker: string }) {
  const hue = ticker.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="size-9 shrink-0 rounded-xl ring-1 ring-white/10"
      style={{
        background: `linear-gradient(145deg, hsl(${hue}, 42%, 26%) 0%, hsl(${(hue + 48) % 360}, 28%, 10%) 100%)`,
      }}
      aria-hidden
    />
  );
}

function settlementLabel(s: SettlementStatus): string {
  switch (s) {
    case "settled":
      return "Зачислено";
    case "processing":
      return "В обработке";
    case "failed":
      return "Сбой";
    default:
      return s;
  }
}

function settlementTooltip(s: SettlementStatus): string {
  switch (s) {
    case "settled":
      return "Клиринг завершён: USDT или units отражены на балансе.";
    case "processing":
      return "Сделка исполнена на рынке; внутреннее зачисление ещё не финализировано.";
    case "failed":
      return "Исключение при settlement: требуется проверка операций (макет).";
    default:
      return "";
  }
}

function settlementPillClass(s: SettlementStatus) {
  switch (s) {
    case "settled":
      return "bg-[#B7F500]/12 text-[#d4f570] ring-1 ring-[#B7F500]/22";
    case "processing":
      return "bg-amber-500/12 text-amber-200/95 ring-1 ring-amber-400/20";
    case "failed":
      return "bg-fuchsia-500/12 text-fuchsia-200/90 ring-1 ring-fuchsia-400/22";
    default:
      return "bg-zinc-600/20 text-zinc-400";
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

/** Как у модалки деталей заявок: по центру, без ring, только тень. */
const tradeHistoryDetailModalPopupClass =
  "rounded-2xl bg-[#101010] text-white shadow-[0_32px_120px_rgba(0,0,0,0.78)] transition-[opacity,transform] duration-200 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0";

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
    <th className={cn("px-3 py-2.5 font-normal", align === "right" && "text-right")}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider transition-colors",
          align === "right" && "ml-auto flex-row-reverse",
          active ? "text-[#d4f570]" : "text-zinc-600 hover:text-zinc-400",
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
    <div className="min-w-0 overflow-hidden rounded-2xl bg-[#111111] ring-1 ring-white/6">
      <div className="border-b border-white/8 px-3 py-2.5">
        <div className="h-3 w-40 animate-pulse rounded bg-zinc-800" />
      </div>
      <div className="divide-y divide-white/5 p-3 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="h-9 w-24 shrink-0 animate-pulse rounded-lg bg-zinc-800" />
            <div className="h-9 flex-1 animate-pulse rounded-lg bg-zinc-800/80" />
            <div className="h-9 w-20 shrink-0 animate-pulse rounded-lg bg-zinc-800/60" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SecondaryMarketTradeHistoryTab() {
  const [trades, setTrades] = React.useState<SecondaryMarketUserTradeMock[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [period, setPeriod] = React.useState<(typeof PERIOD_OPTIONS)[number]["id"]>("30d");
  const [sideFilter, setSideFilter] = React.useState<"all" | TradeSide>("all");
  const [settlementFilter, setSettlementFilter] = React.useState<(typeof SETTLEMENT_FILTER)[number]["id"]>("all");
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("time");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");
  const [selectedTrade, setSelectedTrade] = React.useState<SecondaryMarketUserTradeMock | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setTrades(MOCK_TRADES_SEED);
      setLoading(false);
    }, 520);
    return () => window.clearTimeout(t);
  }, []);

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

  const summaryRows = React.useMemo(
    () => trades.filter((t) => inPeriod(t, period)),
    [trades, period],
  );

  const summary = React.useMemo(() => {
    let turnover = 0;
    let fees = 0;
    let buys = 0;
    let sells = 0;
    for (const t of summaryRows) {
      turnover += t.grossAmount;
      fees += t.feeAmount;
      if (t.side === "buy") buys += 1;
      else sells += 1;
    }
    return { count: summaryRows.length, turnover, fees, buys, sells };
  }, [summaryRows]);

  const filteredSorted = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = trades.filter((row) => {
      if (!inPeriod(row, period)) return false;
      if (sideFilter !== "all" && row.side !== sideFilter) return false;
      if (settlementFilter !== "all" && row.settlementStatus !== settlementFilter) return false;
      if (!q) return true;
      return (
        row.id.toLowerCase().includes(q) ||
        row.ticker.toLowerCase().includes(q) ||
        row.title.toLowerCase().includes(q) ||
        row.artist.toLowerCase().includes(q) ||
        row.linkedOrderId.toLowerCase().includes(q)
      );
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      if (sortKey === "time") {
        return dir * (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      }
      if (sortKey === "gross") return dir * (a.grossAmount - b.grossAmount);
      return dir * (a.price - b.price);
    });
  }, [trades, period, sideFilter, settlementFilter, query, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "desc" ? "asc" : "desc"));
        return prev;
      }
      setSortDir(key === "time" ? "desc" : "desc");
      return key;
    });
  };

  const resetFilters = () => {
    setPeriod("30d");
    setSideFilter("all");
    setSettlementFilter("all");
    setQuery("");
    setSortKey("time");
    setSortDir("desc");
  };

  const exportCsv = () => {
    const blob = new Blob([buildCsv(filteredSorted)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revshare-secondary-trades-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV сформирован (демо, без отправки на сервер)");
  };

  const drawerTrade = React.useMemo(() => {
    if (!selectedTrade) return null;
    return trades.find((t) => t.id === selectedTrade.id) ?? selectedTrade;
  }, [trades, selectedTrade]);

  const marketHref = secondaryMarketHref("market");
  const catalogOverviewHref = ROUTES.catalogMarketOverview;

  return (
    <div className="relative space-y-6">
      <p className="max-w-[62ch] font-mono text-[11px] leading-relaxed text-zinc-600">
        Журнал факта исполнения: только состоявшиеся сделки. Активные заявки, стакан и формы торговли — на других
        экранах.
      </p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl bg-[#111111] p-4 ring-1 ring-white/6">
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Сделок</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-white">{summary.count}</p>
          <p className="mt-1 font-mono text-[10px] text-zinc-600">за выбранный период</p>
        </div>
        <div className="rounded-2xl bg-[#111111] p-4 ring-1 ring-white/6">
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Оборот</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-white">{formatUsdt(summary.turnover)}</p>
          <p className="mt-1 font-mono text-[10px] text-zinc-600">USDT gross</p>
        </div>
        <div className="rounded-2xl bg-[#111111] p-4 ring-1 ring-white/6">
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Комиссии</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-zinc-300">{formatUsdt(summary.fees)}</p>
          <p className="mt-1 font-mono text-[10px] text-zinc-600">USDT всего</p>
        </div>
        <div className="rounded-2xl bg-[#111111] p-4 ring-1 ring-white/6">
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Покупка / продажа</p>
          <div className="mt-1 flex items-baseline gap-4 font-mono text-2xl font-semibold tabular-nums">
            <span className="text-[#B7F500]">{summary.buys}</span>
            <span className="text-fuchsia-300/95">{summary.sells}</span>
          </div>
          <p className="mt-1 font-mono text-[10px] text-zinc-600">кол-во сделок</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Период для сводки и таблицы">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setPeriod(opt.id)}
              className={cn(
                "rounded-full px-2.5 py-1 font-mono text-[11px] font-medium transition-colors",
                period === opt.id ? "bg-[#B7F500] text-black" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-[#111111] p-4 ring-1 ring-white/6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-600" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Релиз, артист, тикер, id сделки или ордера"
              className="h-10 w-full rounded-xl bg-black/50 py-2 pl-10 pr-3 font-mono text-sm text-white placeholder:text-zinc-600 outline-none ring-1 ring-white/10 focus:ring-[#B7F500]/35"
              aria-label="Поиск по журналу сделок"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={exportCsv}
              disabled={loading || filteredSorted.length === 0}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/12 bg-white/5 px-3 font-mono text-[11px] font-medium text-zinc-200 transition hover:border-[#B7F500]/35 hover:text-white disabled:pointer-events-none disabled:opacity-40"
            >
              <Download className="size-4 shrink-0 text-zinc-500" aria-hidden />
              Экспорт CSV
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="h-10 rounded-xl px-3 font-mono text-[11px] text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
            >
              Сбросить
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 border-t border-white/8 pt-4 sm:flex-row sm:flex-wrap sm:gap-x-10">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Сторона</span>
            {(
              [
                { id: "all" as const, label: "Все" },
                { id: "buy" as const, label: "Покупка" },
                { id: "sell" as const, label: "Продажа" },
              ] as const
            ).map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setSideFilter(chip.id)}
                className={cn(
                  "rounded-full px-2.5 py-1 font-mono text-[11px] font-medium",
                  sideFilter === chip.id ? "bg-white text-black" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Клиринг</span>
            {SETTLEMENT_FILTER.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setSettlementFilter(chip.id)}
                className={cn(
                  "rounded-full px-2.5 py-1 font-mono text-[11px] font-medium",
                  settlementFilter === chip.id
                    ? "bg-white text-black"
                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Период</span>
            {PERIOD_OPTIONS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setPeriod(chip.id)}
                className={cn(
                  "rounded-full px-2.5 py-1 font-mono text-[11px] font-medium",
                  period === chip.id ? "bg-white text-black" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
          <Loader2 className="size-4 animate-spin text-[#B7F500]" aria-hidden />
          Загрузка журнала…
        </div>
      ) : null}

      {loading ? (
        <TableSkeleton />
      ) : trades.length === 0 ? (
        <div className="rounded-2xl bg-[#111111] px-6 py-16 text-center ring-1 ring-white/6">
          <h2 className="text-lg font-semibold tracking-tight text-white">Сделок пока нет</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
            Когда вы купите или продадите units на вторичном рынке, исполненные сделки появятся здесь.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={marketHref}
              scroll={false}
              className="inline-flex h-10 min-w-[200px] items-center justify-center rounded-full bg-[#B7F500] px-5 font-mono text-[12px] font-semibold text-black hover:opacity-90"
            >
              Открыть рынок
            </Link>
            <Link
              href={catalogOverviewHref}
              scroll={false}
              className="inline-flex h-10 min-w-[200px] items-center justify-center rounded-full border border-white/15 bg-transparent px-5 font-mono text-[12px] font-medium text-zinc-200 hover:border-white/25 hover:text-white"
            >
              К аналитике рынка
            </Link>
          </div>
        </div>
      ) : filteredSorted.length === 0 ? (
        <div className="rounded-2xl bg-[#111111] px-6 py-16 text-center ring-1 ring-white/6">
          <h2 className="text-lg font-semibold tracking-tight text-white">Ничего не найдено</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
            По текущим фильтрам сделок нет. Измените период, клиринг или поиск.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-6 font-mono text-[12px] text-zinc-400 underline-offset-2 hover:text-white hover:underline"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <div className="max-h-[min(70vh,720px)] overflow-auto rounded-2xl bg-[#111111] ring-1 ring-white/6">
              <table className="w-full min-w-[1040px] border-collapse text-left">
                <thead className="sticky top-0 z-20 bg-[#111111] shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.06)]">
                  <tr className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                    <SortTh label="Время" active={sortKey === "time"} dir={sortDir} onClick={() => toggleSort("time")} />
                    <th className="px-3 py-2.5 font-normal">ID сделки</th>
                    <th className="min-w-[200px] px-3 py-2.5 font-normal">Листинг / релиз</th>
                    <th className="px-3 py-2.5 font-normal">Сторона</th>
                    <th className="px-3 py-2.5 text-right font-normal">Units</th>
                    <SortTh
                      label="Цена / u"
                      align="right"
                      active={sortKey === "price"}
                      dir={sortDir}
                      onClick={() => toggleSort("price")}
                    />
                    <SortTh
                      label="Сумма"
                      align="right"
                      active={sortKey === "gross"}
                      dir={sortDir}
                      onClick={() => toggleSort("gross")}
                    />
                    <th className="hidden px-3 py-2.5 text-right font-normal lg:table-cell">Комиссия</th>
                    <th className="px-3 py-2.5 text-right font-normal">
                      <span className="block">Итого</span>
                      <span className="mt-0.5 block text-[9px] font-normal normal-case tracking-normal text-zinc-600">
                        покупка: списано · продажа: нетто
                      </span>
                    </th>
                    <th className="hidden px-3 py-2.5 font-normal xl:table-cell">Клиринг</th>
                    <th className="px-3 py-2.5 text-right font-normal">Действия</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-[12px] text-zinc-300">
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
                        className="cursor-pointer border-b border-white/5 transition-colors hover:bg-white/4 focus-visible:bg-white/6 focus-visible:outline-none"
                      >
                        <td className="whitespace-nowrap px-3 py-2.5 align-middle text-[11px] text-zinc-500">
                          {formatDateTime(row.timestamp)}
                        </td>
                        <td className="px-3 py-2.5 align-middle text-[11px] text-zinc-600">{row.id}</td>
                        <td className="px-3 py-2.5 align-middle">
                          <div className="flex items-center gap-2.5">
                            <CoverThumb ticker={row.ticker} />
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-medium text-white">{row.title}</p>
                              <p className="truncate text-[11px] text-zinc-600">
                                {row.artist} · {row.ticker}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 align-middle">
                          <span
                            className={cn(
                              "text-xs font-semibold",
                              row.side === "buy" ? "text-[#B7F500]" : "text-fuchsia-300/95",
                            )}
                          >
                            {row.side === "buy" ? "Покупка" : "Продажа"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right align-middle tabular-nums">{row.units}</td>
                        <td className="px-3 py-2.5 text-right align-middle tabular-nums text-white">
                          {formatUsdt(row.price)}
                        </td>
                        <td className="px-3 py-2.5 text-right align-middle tabular-nums">{formatUsdt(row.grossAmount)}</td>
                        <td className="hidden px-3 py-2.5 text-right align-middle tabular-nums text-zinc-500 lg:table-cell">
                          {formatUsdt(row.feeAmount)}
                        </td>
                        <td className="px-3 py-2.5 text-right align-middle tabular-nums text-zinc-100">
                          {formatUsdt(row.netAmount)}
                        </td>
                        <td className="hidden px-3 py-2.5 align-middle xl:table-cell">
                          <span
                            title={settlementTooltip(row.settlementStatus)}
                            className={cn(
                              "inline-flex cursor-help rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide",
                              settlementPillClass(row.settlementStatus),
                            )}
                          >
                            {settlementLabel(row.settlementStatus)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                          <div
                            className="relative flex flex-nowrap items-center justify-end gap-2.5"
                            ref={openMenuId === row.id ? menuRef : undefined}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedTrade(row)}
                              className={smTableActionIconCircle}
                              aria-label="Детали сделки"
                            >
                              <LayoutPanelTop className="size-[17px]" strokeWidth={1.75} aria-hidden />
                            </button>
                            <Link
                              href={releaseAssetHref(row.releaseId)}
                              scroll={false}
                              className={smTableActionReleasePill}
                            >
                              Релиз
                              <ExternalLink className="size-3.5 opacity-55" aria-hidden />
                            </Link>
                            <div className="relative shrink-0">
                              <button
                                type="button"
                                aria-expanded={openMenuId === row.id}
                                aria-haspopup="menu"
                                aria-label="Ещё действия"
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
                                    Открыть релиз
                                  </Link>
                                  <Link
                                    role="menuitem"
                                    href={tradeAnalyticsHref(row.releaseId)}
                                    scroll={false}
                                    className={smTableActionMenuItemSecondary}
                                    onClick={() => setOpenMenuId(null)}
                                  >
                                    Торговая аналитика
                                  </Link>
                                  {stack ? (
                                    <Link
                                      role="menuitem"
                                      href={stack}
                                      scroll={false}
                                      className={smTableActionMenuItemLink}
                                      onClick={() => setOpenMenuId(null)}
                                    >
                                      Стакан
                                    </Link>
                                  ) : (
                                    <span className={smTableActionMenuItemMuted}>Стакан недоступен</span>
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

          <div className="flex flex-col gap-3 md:hidden">
            {filteredSorted.map((row) => {
              const stack = stackHrefForTicker(row.ticker);
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setSelectedTrade(row)}
                  className="w-full rounded-2xl border border-white/8 bg-[#111111] p-4 text-left ring-1 ring-white/5 transition hover:border-white/12 hover:bg-white/3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 gap-3">
                      <CoverThumb ticker={row.ticker} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{row.title}</p>
                        <p className="truncate font-mono text-[11px] text-zinc-600">
                          {row.artist} · {row.ticker}
                        </p>
                        <p className="mt-2 font-mono text-[10px] text-zinc-600">{formatDateTime(row.timestamp)}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase",
                        row.side === "buy" ? "bg-[#B7F500]/14 text-[#d4f570]" : "bg-fuchsia-500/14 text-fuchsia-200/90",
                      )}
                    >
                      {row.side === "buy" ? "Buy" : "Sell"}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 font-mono text-[11px]">
                    <div>
                      <p className="text-zinc-600">Gross</p>
                      <p className="mt-0.5 tabular-nums text-zinc-200">{formatUsdt(row.grossAmount)}</p>
                    </div>
                    <div>
                      <p className="text-zinc-600">Итого</p>
                      <p className="mt-0.5 tabular-nums text-white">{formatUsdt(row.netAmount)}</p>
                    </div>
                    <div>
                      <p className="text-zinc-600">Цена / u</p>
                      <p className="mt-0.5 tabular-nums text-zinc-300">{formatUsdt(row.price)}</p>
                    </div>
                    <div>
                      <p className="text-zinc-600">Units</p>
                      <p className="mt-0.5 tabular-nums text-zinc-300">{row.units}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span
                      title={settlementTooltip(row.settlementStatus)}
                      className={cn(
                        "inline-flex cursor-help rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase",
                        settlementPillClass(row.settlementStatus),
                      )}
                    >
                      {settlementLabel(row.settlementStatus)}
                    </span>
                    <div className="flex flex-wrap items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Link href={releaseAssetHref(row.releaseId)} scroll={false} className={smTableActionReleasePill}>
                        Релиз
                        <ExternalLink className="size-3.5 opacity-55" aria-hidden />
                      </Link>
                      {stack ? (
                        <Link href={stack} scroll={false} className={smTableActionSecondaryPill}>
                          Стакан
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

      <Dialog.Root
        open={drawerTrade != null}
        onOpenChange={(open) => {
          if (!open) setSelectedTrade(null);
        }}
        modal
      >
        <Dialog.Portal>
          {drawerTrade ? (
            <>
              <Dialog.Backdrop
                className={cn(
                  "fixed inset-0 z-[125] bg-black/70 backdrop-blur-[3px]",
                  "transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
                )}
              />
              <Dialog.Popup
                className={cn(
                  "fixed left-1/2 top-1/2 z-[126] flex w-[min(100vw-2rem,720px)] max-h-[min(92vh,900px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto overscroll-contain",
                  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0",
                  tradeHistoryDetailModalPopupClass,
                )}
              >
                <div className="flex shrink-0 items-start justify-between gap-4 px-6 pb-4 pt-5">
                  <div className="min-w-0">
                    <Dialog.Title className="text-lg font-semibold tracking-tight text-white">
                      {drawerTrade.title}
                    </Dialog.Title>
                    <Dialog.Description className="mt-1 text-sm text-zinc-500">
                      {drawerTrade.artist} · {drawerTrade.ticker} · {drawerTrade.genre}
                    </Dialog.Description>
                  </div>
                  <Dialog.Close
                    aria-label="Закрыть"
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/10 hover:text-white"
                  >
                    <X className="size-4" />
                  </Dialog.Close>
                </div>

                <div className="px-6 pb-4">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Сделка</p>
                  <dl className="mt-3 space-y-0 font-mono text-[12px]">
                    <div className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
                      <dt className="text-zinc-600">ID сделки</dt>
                      <dd className="text-right tabular-nums text-zinc-200">{drawerTrade.id}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
                      <dt className="text-zinc-600">Время</dt>
                      <dd className="text-right text-zinc-400">{formatDateTime(drawerTrade.timestamp)}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
                      <dt className="text-zinc-600">Сторона</dt>
                      <dd className={drawerTrade.side === "buy" ? "text-[#B7F500]" : "text-fuchsia-300"}>
                        {drawerTrade.side === "buy" ? "Покупка" : "Продажа"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
                      <dt className="text-zinc-600">Цена</dt>
                      <dd className="tabular-nums text-white">{formatUsdt(drawerTrade.price)} USDT</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
                      <dt className="text-zinc-600">Units</dt>
                      <dd className="tabular-nums text-zinc-200">{drawerTrade.units}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
                      <dt className="text-zinc-600">Gross</dt>
                      <dd className="tabular-nums text-zinc-200">{formatUsdt(drawerTrade.grossAmount)} USDT</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
                      <dt className="text-zinc-600">Комиссия</dt>
                      <dd className="tabular-nums text-zinc-500">{formatUsdt(drawerTrade.feeAmount)} USDT</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
                      <dt className="text-zinc-600">Net</dt>
                      <dd className="tabular-nums text-white">{formatUsdt(drawerTrade.netAmount)} USDT</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
                      <dt className="text-zinc-600">Клиринг</dt>
                      <dd>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            settlementPillClass(drawerTrade.settlementStatus),
                          )}
                        >
                          {settlementLabel(drawerTrade.settlementStatus)}
                        </span>
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
                      <dt className="text-zinc-600">Ордер</dt>
                      <dd className="text-right text-zinc-500">{drawerTrade.linkedOrderId}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
                      <dt className="text-zinc-600">Листинг</dt>
                      <dd className="text-right text-zinc-500">{drawerTrade.linkedListingId}</dd>
                    </div>
                  </dl>
                  <p className="mt-4 rounded-xl bg-white/[0.03] p-3 text-[12px] leading-relaxed text-zinc-500">
                    {drawerTrade.side === "buy"
                      ? "После успешного клиринга units зачисляются в вашу позицию по релизу."
                      : "После успешного клиринга USDT зачисляются на ваш баланс."}
                  </p>
                </div>

                <div className="shrink-0 space-y-2 border-t border-white/10 bg-black/20 px-6 py-4">
                  <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
                    <Link
                      href={releaseAssetHref(drawerTrade.releaseId)}
                      scroll={false}
                      className={cn(smTableActionReleasePill, "h-10 px-5")}
                    >
                      Релиз
                      <ExternalLink className="size-3.5 opacity-55" aria-hidden />
                    </Link>
                    <Link
                      href={tradeAnalyticsHref(drawerTrade.releaseId)}
                      scroll={false}
                      className="inline-flex h-10 items-center justify-center rounded-full bg-white/10 px-5 font-mono text-[12px] font-medium text-zinc-200 transition hover:bg-white/14"
                    >
                      Торговая аналитика
                    </Link>
                    {stackHrefForTicker(drawerTrade.ticker) ? (
                      <Link
                        href={stackHrefForTicker(drawerTrade.ticker)!}
                        scroll={false}
                        className={cn(smTableActionSecondaryPill, "h-10")}
                      >
                        Стакан
                      </Link>
                    ) : null}
                  </div>
                </div>
              </Dialog.Popup>
            </>
          ) : null}
        </Dialog.Portal>
      </Dialog.Root>

      {toastMessage ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-6 left-1/2 z-130 max-w-[min(100vw-2rem,28rem)] -translate-x-1/2 px-4"
        >
          <div className="rounded-xl bg-zinc-950/95 px-4 py-3 font-mono text-[12px] text-zinc-100 shadow-lg ring-1 ring-white/10">
            {toastMessage}
          </div>
        </div>
      ) : null}
    </div>
  );
}
