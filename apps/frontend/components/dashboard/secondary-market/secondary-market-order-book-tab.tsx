"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { secondaryMarketHref } from "@/constants/dashboard/secondary-market";
import { analyticsReleaseDetailPath, secondaryMarketBookPath } from "@/constants/routes";
import { getSecondaryMarketAnalyticsCatalogIdForReleaseSlug } from "@/mocks/dashboard/secondary-market-listings.mock";
import { cn } from "@/lib/utils";
import { ExchangeNeonSparkline } from "@/components/shared/charts/exchange-neon-sparkline";

import { SecondaryMarketBreadcrumbNav } from "./secondary-market-breadcrumb-nav";
import { SecondaryMarketOrderEntryPanel, type LimitSeed } from "./secondary-market-order-entry-panel";
import { SecondaryMarketOrderFeedbackModal, type OrderFeedback } from "./secondary-market-order-feedback-modal";
import { walkBuyAgainstAsks, walkSellAgainstBids } from "./secondary-market-book-math";

const FEE_RATE = 0.002;

type BookLevel = { price: number; units: number };
type BookTrade = { time: string; side: "buy" | "sell"; price: number; units: number };
type MyOrderStatus = "active" | "partial" | "filled" | "cancelled" | "expired" | "failed";
type MyOrder = {
  id: string;
  marketId: string;
  side: "buy" | "sell";
  mode: "limit" | "market";
  price: number;
  units: number;
  filled: number;
  status: MyOrderStatus;
  createdAt: string;
};
type MarketPosition = {
  unitsTotal: number;
  unitsAvailable: number;
  lockedUnits: number;
  usdtBalance: number;
  avgEntryPrice: number;
};

type BookMarket = {
  id: string;
  symbol: string;
  track: string;
  artist: string;
  releaseId: string;
  asks: BookLevel[];
  bids: BookLevel[];
  trades: BookTrade[];
  volume24hUsdt: number;
  volume24hUnits: number;
  rightsListed: number;
  priceSpark: number[];
  liquidity: "high" | "med" | "low";
  change24hPct: number;
  high24h: number;
  low24h: number;
  availableUsdt: number;
  availableUnits: number;
  genre: string;
};

const TICK_OPTIONS = [0.01, 0.05, 0.1] as const;

const BOOK_MARKETS: BookMarket[] = [
  {
    id: "mnr",
    symbol: "MNR",
    track: "Midnight Run",
    artist: "Nova Lane",
    releaseId: "midnight-run",
    asks: [
      { price: 18.58, units: 90 },
      { price: 18.55, units: 160 },
      { price: 18.52, units: 200 },
      { price: 18.5, units: 120 },
    ],
    bids: [
      { price: 18.48, units: 240 },
      { price: 18.44, units: 180 },
      { price: 18.4, units: 320 },
      { price: 18.35, units: 140 },
    ],
    trades: [
      { time: "12:08", side: "buy", price: 18.5, units: 24 },
      { time: "12:04", side: "sell", price: 18.52, units: 40 },
      { time: "11:59", side: "buy", price: 18.48, units: 16 },
      { time: "11:51", side: "buy", price: 18.47, units: 8 },
      { time: "11:44", side: "sell", price: 18.53, units: 32 },
    ],
    volume24hUsdt: 42180,
    volume24hUnits: 2280,
    rightsListed: 120,
    priceSpark: [0.42, 0.44, 0.43, 0.46, 0.48, 0.47, 0.49, 0.5, 0.51, 0.5],
    liquidity: "high",
    change24hPct: 1.35,
    high24h: 19.05,
    low24h: 17.92,
    availableUsdt: 5240.58,
    availableUnits: 340,
    genre: "Electronic",
  },
  {
    id: "sgn",
    symbol: "SGN",
    track: "Signal / Noise",
    artist: "Kairo",
    releaseId: "signal-noise",
    asks: [
      { price: 22.35, units: 55 },
      { price: 22.22, units: 70 },
      { price: 22.1, units: 44 },
    ],
    bids: [
      { price: 21.98, units: 60 },
      { price: 21.85, units: 95 },
      { price: 21.7, units: 40 },
    ],
    trades: [
      { time: "12:01", side: "buy", price: 22.1, units: 12 },
      { time: "11:48", side: "sell", price: 22.15, units: 20 },
    ],
    volume24hUsdt: 18840,
    volume24hUnits: 860,
    rightsListed: 40,
    priceSpark: [0.35, 0.38, 0.4, 0.42, 0.45, 0.48, 0.5, 0.52, 0.51, 0.53],
    liquidity: "high",
    change24hPct: -0.62,
    high24h: 22.48,
    low24h: 21.55,
    availableUsdt: 3120.0,
    availableUnits: 95,
    genre: "Hip-Hop",
  },
  {
    id: "vlt",
    symbol: "VLT",
    track: "Velvet Room",
    artist: "June & Co",
    releaseId: "velvet-room",
    asks: [{ price: 6.95, units: 25 }],
    bids: [{ price: 6.72, units: 18 }],
    trades: [],
    volume24hUsdt: 420,
    volume24hUnits: 62,
    rightsListed: 60,
    priceSpark: [0.55, 0.54, 0.53, 0.52, 0.52, 0.51, 0.5, 0.5, 0.49, 0.48],
    liquidity: "low",
    change24hPct: -2.1,
    high24h: 7.08,
    low24h: 6.65,
    availableUsdt: 890.12,
    availableUnits: 22,
    genre: "Pop",
  },
];

const MY_ORDERS_MOCK: MyOrder[] = [
  {
    id: "o-mnr-1",
    marketId: "mnr",
    side: "buy",
    mode: "limit",
    price: 18.48,
    units: 80,
    filled: 32,
    status: "partial",
    createdAt: "2026-04-21T10:00:00.000Z",
  },
  {
    id: "o-mnr-2",
    marketId: "mnr",
    side: "sell",
    mode: "limit",
    price: 18.62,
    units: 24,
    filled: 0,
    status: "active",
    createdAt: "2026-04-22T08:15:00.000Z",
  },
  {
    id: "o-mnr-3",
    marketId: "mnr",
    side: "buy",
    mode: "limit",
    price: 18.2,
    units: 40,
    filled: 40,
    status: "filled",
    createdAt: "2026-04-20T12:00:00.000Z",
  },
  {
    id: "o-mnr-4",
    marketId: "mnr",
    side: "buy",
    mode: "limit",
    price: 18.05,
    units: 12,
    filled: 0,
    status: "cancelled",
    createdAt: "2026-04-19T09:00:00.000Z",
  },
  {
    id: "o-sgn-1",
    marketId: "sgn",
    side: "sell",
    mode: "limit",
    price: 22.2,
    units: 15,
    filled: 4,
    status: "partial",
    createdAt: "2026-04-21T14:20:00.000Z",
  },
  {
    id: "o-vlt-1",
    marketId: "vlt",
    side: "buy",
    mode: "limit",
    price: 6.7,
    units: 40,
    filled: 0,
    status: "active",
    createdAt: "2026-04-22T06:00:00.000Z",
  },
];

const MY_POSITIONS_MOCK: Record<string, MarketPosition> = {
  mnr: { unitsTotal: 1842, unitsAvailable: 1794, lockedUnits: 48, usdtBalance: 5240.58, avgEntryPrice: 18.12 },
  sgn: { unitsTotal: 920, unitsAvailable: 905, lockedUnits: 11, usdtBalance: 3120, avgEntryPrice: 21.86 },
  vlt: { unitsTotal: 420, unitsAvailable: 380, lockedUnits: 40, usdtBalance: 890.12, avgEntryPrice: 6.73 },
};

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

function liquidityLabelRu(liquidity: BookMarket["liquidity"]) {
  switch (liquidity) {
    case "high":
      return "Высокая";
    case "med":
      return "Средняя";
    case "low":
      return "Низкая";
    default:
      return liquidity;
  }
}

function roundToTick(price: number, tick: number) {
  const k = Math.round(price / tick);
  const rounded = k * tick;
  const decimals = Math.max(0, `${tick}`.split(".")[1]?.length ?? 0);
  return Number(rounded.toFixed(decimals));
}

function aggregateLevels(levels: BookLevel[], tick: number, side: "ask" | "bid"): BookLevel[] {
  const map = new Map<number, number>();
  for (const l of levels) {
    const p = roundToTick(l.price, tick);
    map.set(p, (map.get(p) ?? 0) + l.units);
  }
  const arr = [...map.entries()].map(([price, units]) => ({ price, units }));
  if (side === "ask") return arr.sort((a, b) => a.price - b.price);
  return arr.sort((a, b) => b.price - a.price);
}

function OrderBookMiniSparkline({ values, positive }: { values: number[]; positive: boolean }) {
  if (values.length < 2) return null;
  return (
    <ExchangeNeonSparkline
      values={values}
      trend={positive ? "up" : "down"}
      width={100}
      height={28}
      detailSegments={4}
    />
  );
}

function CoverThumb({ symbol }: { symbol: string }) {
  const hue = symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="size-10 shrink-0 rounded-full sm:size-11"
      style={{
        background: `linear-gradient(145deg, hsl(${hue}, 42%, 28%) 0%, hsl(${(hue + 48) % 360}, 28%, 12%) 100%)`,
      }}
      aria-hidden
    />
  );
}

function maxUnits(levels: BookLevel[]) {
  return Math.max(1, ...levels.map((l) => l.units));
}

function OrderBookRow({
  price,
  units,
  cumulativeUsdt,
  depthMax,
  variant,
  onPick,
  compact,
}: {
  price: number;
  units: number;
  cumulativeUsdt: number;
  depthMax: number;
  variant: "ask" | "bid";
  onPick: () => void;
  compact?: boolean;
}) {
  const pct = Math.min(100, (units / depthMax) * 100);
  const isAsk = variant === "ask";
  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        "relative w-full cursor-pointer text-left font-mono tabular-nums transition-colors hover:bg-white/4",
        compact ? "text-[10px]" : "text-[11px] sm:text-[12px]",
      )}
    >
      <div
        className={cn(
          "absolute inset-y-0 opacity-[0.16]",
          isAsk ? "right-0 rounded-l-sm bg-fuchsia-400" : "right-0 rounded-l-sm bg-[#B7F500]",
        )}
        style={{ width: `${pct}%` }}
      />
      <div
        className={cn(
          "relative grid grid-cols-[1fr_56px_80px] items-center gap-1 px-2",
          compact ? "py-px" : "py-0.5 sm:py-1",
        )}
      >
        <span className={cn(isAsk ? "text-fuchsia-200" : "text-[#c8f06a]")}>{formatUsdt(price)}</span>
        <span className="text-center text-zinc-400">{units}</span>
        <span className="text-right text-zinc-600">{formatUsdt(cumulativeUsdt)}</span>
      </div>
    </button>
  );
}

type PositionAdj = Partial<MarketPosition>;

function orderStatusLabel(s: MyOrderStatus): string {
  switch (s) {
    case "active":
      return "Активна";
    case "partial":
      return "Частично";
    case "filled":
      return "Исполнена";
    case "cancelled":
      return "Отменена";
    case "expired":
      return "Истекла";
    case "failed":
      return "Ошибка";
    default:
      return s;
  }
}

function orderTypeLabel(mode: "limit" | "market"): string {
  return mode === "limit" ? "Лимит" : "Рынок";
}

function TradesPanel({ trades, workspace }: { trades: BookTrade[]; workspace?: boolean }) {
  if (trades.length === 0) {
    return <div className="flex flex-1 items-center justify-center py-16 font-mono text-xs text-zinc-600">Нет сделок</div>;
  }
  return (
    <ul
      className={cn(
        "flex-1 overflow-y-auto overscroll-contain py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        workspace ? "min-h-0" : "max-h-[min(52vh,440px)]",
      )}
    >
      {trades.map((t, i) => (
        <li
          key={`${t.time}-${i}`}
          className="grid grid-cols-[44px_72px_1fr_44px_88px] items-center gap-1 border-b border-white/4 px-2 py-1 font-mono text-[11px] tabular-nums sm:text-[12px]"
        >
          <span className="text-zinc-600">{t.time}</span>
          <span className={t.side === "buy" ? "text-[#B7F500]" : "text-fuchsia-300"}>
            {t.side === "buy" ? "Покупка" : "Продажа"}
          </span>
          <span className="text-right text-zinc-200">{formatUsdt(t.price)}</span>
          <span className="text-right text-zinc-500">{t.units}u</span>
          <span className="text-right text-zinc-400">{formatUsdt(t.price * t.units)}</span>
        </li>
      ))}
    </ul>
  );
}

export type SecondaryMarketOrderBookTabProps = {
  /** Полноэкранная страница терминала: ордер справа, форма слева. */
  layout?: "inline" | "workspace";
  /** Для `layout="workspace"` — id инструмента из URL. */
  initialMarketId?: string;
};

export function SecondaryMarketOrderBookTab(props?: SecondaryMarketOrderBookTabProps) {
  const { layout = "inline", initialMarketId } = props ?? {};
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromRoute =
    layout === "workspace" && initialMarketId && BOOK_MARKETS.some((x) => x.id === initialMarketId)
      ? initialMarketId
      : null;
  const marketFromUrl = fromRoute ?? searchParams.get("market");
  const marketId = BOOK_MARKETS.some((x) => x.id === marketFromUrl) ? marketFromUrl! : BOOK_MARKETS[0]!.id;
  const isWorkspace = layout === "workspace";

  const [tick, setTick] = React.useState<(typeof TICK_OPTIONS)[number]>(0.01);
  const [workspaceTab, setWorkspaceTab] = React.useState<"book" | "trades">("book");
  const [ticketRev, setTicketRev] = React.useState(0);
  const [limitSeed, setLimitSeed] = React.useState<LimitSeed | null>(null);
  const [myOrders, setMyOrders] = React.useState<MyOrder[]>(() => [...MY_ORDERS_MOCK]);
  /** После клика по уровню стакана на узком экране прячем стакан, пока не сменится инструмент или не нажмут «Показать». */
  const [bookHiddenForMarketId, setBookHiddenForMarketId] = React.useState<string | null>(null);
  const bookDockHidden = !isWorkspace && bookHiddenForMarketId === marketId;
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [orderFeedback, setOrderFeedback] = React.useState<OrderFeedback | null>(null);
  const [extraTradesByMarket, setExtraTradesByMarket] = React.useState<Record<string, BookTrade[]>>({});
  const [positionAdj, setPositionAdj] = React.useState<Record<string, PositionAdj>>({});
  const [orderFilter, setOrderFilter] = React.useState<"all" | "active" | "partial" | "filled" | "cancelled">("all");

  const navigateMarket = React.useCallback(
    (id: string) => {
      setLimitSeed(null);
      setBookHiddenForMarketId(null);
      setOrderFeedback(null);
      router.replace(secondaryMarketBookPath(id), { scroll: false });
    },
    [router],
  );

  React.useEffect(() => {
    setOrderFilter("all");
  }, [marketId]);

  const m = BOOK_MARKETS.find((x) => x.id === marketId) ?? BOOK_MARKETS[0]!;
  const myPosition: MarketPosition = {
    ...(MY_POSITIONS_MOCK[marketId] ?? MY_POSITIONS_MOCK.mnr),
    ...(positionAdj[marketId] ?? {}),
  };

  const marketOrdersAll = React.useMemo(() => myOrders.filter((o) => o.marketId === marketId), [myOrders, marketId]);
  const activeOrderCount = React.useMemo(
    () => marketOrdersAll.filter((o) => o.status === "active" || o.status === "partial").length,
    [marketOrdersAll],
  );
  const filteredMarketOrders = React.useMemo(() => {
    if (orderFilter === "all") return marketOrdersAll;
    return marketOrdersAll.filter((o) => o.status === orderFilter);
  }, [marketOrdersAll, orderFilter]);

  const lockedFromSellOrders = React.useMemo(
    () =>
      myOrders
        .filter((o) => o.marketId === marketId && (o.status === "active" || o.status === "partial") && o.side === "sell")
        .reduce((a, o) => a + Math.max(0, o.units - o.filled), 0),
    [myOrders, marketId],
  );
  const lockedUnitsForPanel = Math.max(myPosition.lockedUnits, lockedFromSellOrders);

  const displayTrades = React.useMemo(
    () => [...(extraTradesByMarket[marketId] ?? []), ...m.trades],
    [extraTradesByMarket, marketId, m.trades],
  );

  const asksAgg = React.useMemo(() => aggregateLevels(m.asks, tick, "ask"), [m.asks, tick]);
  const bidsAgg = React.useMemo(() => aggregateLevels(m.bids, tick, "bid"), [m.bids, tick]);
  const bestAsk = asksAgg[0]?.price ?? 0;
  const bestBid = bidsAgg[0]?.price ?? 0;
  const mid = bestAsk && bestBid ? (bestAsk + bestBid) / 2 : bestAsk || bestBid;
  const spread = bestAsk && bestBid ? bestAsk - bestBid : 0;
  const last = displayTrades[0]?.price ?? mid;

  const cancelOrder = (id: string) => {
    setMyOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "cancelled" as const } : o)));
    setOrderFeedback({
      tone: "info",
      title: "Заявка отменена",
      body: "Средства и units снова доступны согласно остатку позиции.",
    });
  };

  const handleOrderSubmit = React.useCallback(
    async (payload: { orderMode: "limit" | "market"; side: "buy" | "sell"; price: number; units: number }) => {
      setIsSubmitting(true);
      setOrderFeedback(null);
      await new Promise((r) => setTimeout(r, 420));

      const id = `o-${marketId}-${Date.now()}`;
      const now = new Date();
      const iso = now.toISOString();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const pushTrade = (t: BookTrade) => {
        setExtraTradesByMarket((prev) => ({
          ...prev,
          [marketId]: [t, ...(prev[marketId] ?? [])],
        }));
      };

      const mergePos = (fn: (cur: MarketPosition) => MarketPosition) => {
        setPositionAdj((prev) => {
          const cur: MarketPosition = {
            ...(MY_POSITIONS_MOCK[marketId] ?? MY_POSITIONS_MOCK.mnr),
            ...(prev[marketId] ?? {}),
          };
          return { ...prev, [marketId]: fn(cur) };
        });
      };

      if (payload.orderMode === "market") {
        const walk =
          payload.side === "buy" ? walkBuyAgainstAsks(m.asks, payload.units) : walkSellAgainstBids(m.bids, payload.units);
        const filled = walk.filledUnits;
        if (filled <= 0) {
          setOrderFeedback({
            tone: "warn",
            title: "Недостаточно ликвидности",
            body: "В стакане нет объёма для исполнения. Уменьшите количество или используйте лимитную заявку.",
          });
          setIsSubmitting(false);
          return;
        }
        const fee = walk.totalUsdt * FEE_RATE;
        const partial = walk.unfilledUnits > 0;
        pushTrade({ time: timeStr, side: payload.side, price: walk.avgPrice, units: filled });
        if (payload.side === "buy") {
          mergePos((cur) => {
            const newTotal = cur.unitsTotal + filled;
            const newAvg = newTotal > 0 ? (cur.unitsTotal * cur.avgEntryPrice + walk.totalUsdt) / newTotal : cur.avgEntryPrice;
            return {
              ...cur,
              usdtBalance: cur.usdtBalance - walk.totalUsdt - fee,
              unitsTotal: newTotal,
              unitsAvailable: cur.unitsAvailable + filled,
              avgEntryPrice: newAvg,
            };
          });
        } else {
          mergePos((cur) => ({
            ...cur,
            usdtBalance: cur.usdtBalance + (walk.totalUsdt - fee),
            unitsTotal: Math.max(0, cur.unitsTotal - filled),
            unitsAvailable: Math.max(0, cur.unitsAvailable - filled),
          }));
        }
        setMyOrders((prev) => [
          {
            id,
            marketId,
            side: payload.side,
            mode: "market",
            price: walk.avgPrice,
            units: payload.units,
            filled,
            status: partial ? "partial" : "filled",
            createdAt: iso,
          },
          ...prev,
        ]);
        setOrderFeedback(
          partial
            ? {
                tone: "warn",
                title: "Частичное исполнение",
                body: `Исполнено ${filled} u по ~${formatUsdt(walk.avgPrice)} · в стакане не хватило объёма на ${walk.unfilledUnits} u.`,
              }
            : {
                tone: "success",
                title: "Заявка исполнена",
                body:
                  payload.side === "buy"
                    ? `Покупка: ${filled} u, средняя ${formatUsdt(walk.avgPrice)}, списано ~${formatUsdt(walk.totalUsdt + fee)} USDT с комиссией.`
                    : `Продажа: ${filled} u, средняя ${formatUsdt(walk.avgPrice)}, к получению ~${formatUsdt(walk.totalUsdt - fee)} USDT после комиссии.`,
              },
        );
        setIsSubmitting(false);
        return;
      }

      /** Лимит: немедленное исполнение только если цена пересекает лучший уровень противоположной стороны. */
      let walkImmediate: ReturnType<typeof walkBuyAgainstAsks> | null = null;
      if (payload.side === "buy" && bestAsk > 0 && payload.price >= bestAsk) {
        walkImmediate = walkBuyAgainstAsks(m.asks, payload.units, payload.price);
      } else if (payload.side === "sell" && bestBid > 0 && payload.price <= bestBid) {
        walkImmediate = walkSellAgainstBids(m.bids, payload.units, payload.price);
      }

      if (walkImmediate && walkImmediate.filledUnits > 0) {
        const w = walkImmediate;
        const fee = w.totalUsdt * FEE_RATE;
        const partialRest = w.unfilledUnits > 0;
        pushTrade({ time: timeStr, side: payload.side, price: w.avgPrice, units: w.filledUnits });
        if (payload.side === "buy") {
          mergePos((cur) => {
            const newTotal = cur.unitsTotal + w.filledUnits;
            const newAvg = newTotal > 0 ? (cur.unitsTotal * cur.avgEntryPrice + w.totalUsdt) / newTotal : cur.avgEntryPrice;
            return {
              ...cur,
              usdtBalance: cur.usdtBalance - w.totalUsdt - fee,
              unitsTotal: newTotal,
              unitsAvailable: cur.unitsAvailable + w.filledUnits,
              avgEntryPrice: newAvg,
            };
          });
        } else {
          mergePos((cur) => ({
            ...cur,
            usdtBalance: cur.usdtBalance + (w.totalUsdt - fee),
            unitsTotal: Math.max(0, cur.unitsTotal - w.filledUnits),
            unitsAvailable: Math.max(0, cur.unitsAvailable - w.filledUnits),
          }));
        }
        setMyOrders((prev) => [
          {
            id,
            marketId,
            side: payload.side,
            mode: "limit",
            price: payload.price,
            units: payload.units,
            filled: w.filledUnits,
            status: partialRest ? "partial" : "filled",
            createdAt: iso,
          },
          ...prev,
        ]);
        setOrderFeedback(
          partialRest
            ? {
                tone: "warn",
                title: "Частичное исполнение",
                body: `Исполнено ${w.filledUnits} u · остаток ${w.unfilledUnits} u остаётся активной заявкой в стакане.`,
              }
            : {
                tone: "success",
                title: "Заявка исполнена",
                body: `Лимит пересёк рынок: ${w.filledUnits} u по средней ${formatUsdt(w.avgPrice)}.`,
              },
        );
        setIsSubmitting(false);
        return;
      }

      setMyOrders((prev) => [
        {
          id,
          marketId,
          side: payload.side,
          mode: "limit",
          price: payload.price,
          units: payload.units,
          filled: 0,
          status: "active",
          createdAt: iso,
        },
        ...prev,
      ]);
      setOrderFeedback({
        tone: "info",
        title: "Заявка размещена в стакане",
        body: "Ордер ждёт контрагента. Вы увидите его в блоке «Мои ордера по релизу».",
      });
      setIsSubmitting(false);
    },
    [bestAsk, bestBid, marketId, m.asks, m.bids, tick],
  );

  const sparkPositive = (m.priceSpark[m.priceSpark.length - 1] ?? 0) >= (m.priceSpark[0] ?? 0);
  const chPos = m.change24hPct >= 0;

  const askMax = maxUnits(asksAgg);
  const bidMax = maxUnits(bidsAgg);
  const depthMax = Math.max(askMax, bidMax);

  const asksAsc = [...asksAgg].sort((a, b) => a.price - b.price);
  const askWithCumAsc = asksAsc.reduce<Array<BookLevel & { cum: number }>>((acc, lvl) => {
    const prev = acc[acc.length - 1]?.cum ?? 0;
    acc.push({ ...lvl, cum: prev + lvl.price * lvl.units });
    return acc;
  }, []);
  const askRows = [...askWithCumAsc].reverse();

  const bidsDesc = [...bidsAgg].sort((a, b) => b.price - a.price);
  const bidRows = bidsDesc.reduce<Array<BookLevel & { cum: number }>>((acc, lvl) => {
    const prev = acc[acc.length - 1]?.cum ?? 0;
    acc.push({ ...lvl, cum: prev + lvl.price * lvl.units });
    return acc;
  }, []);

  const pickLevel = (p: number, variant: "ask" | "bid") => {
    setLimitSeed({ price: p, side: variant === "ask" ? "buy" : "sell" });
    setTicketRev((r) => r + 1);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1279px)").matches) {
      setBookHiddenForMarketId(marketId);
    }
  };

  const unrealizedPnL = myPosition.unitsAvailable > 0 ? (last - myPosition.avgEntryPrice) * myPosition.unitsAvailable : 0;

  return (
    <div className={cn(isWorkspace ? "flex w-full min-h-0 flex-col gap-3" : "space-y-3")}>
      {isWorkspace ? (
        <SecondaryMarketBreadcrumbNav
          items={[
            { label: "Вторичный рынок", href: secondaryMarketHref("market") },
            { label: "Рынок листингов", href: secondaryMarketHref("market") },
            { label: `Терминал · ${m.symbol}/USDT` },
          ]}
        />
      ) : null}

      {/* Переключение рынков — тот же приём, что и в форме ордера: rounded-full + ring */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Инструмент</p>
        <div
          className="flex w-full max-w-xl gap-0.5 rounded-full bg-black/55 p-0.5 font-mono text-[11px] ring-1 ring-white/8 sm:ml-auto sm:w-auto"
          role="tablist"
          aria-label="Смена инструмента"
        >
          {BOOK_MARKETS.map((x) => {
            const active = marketId === x.id;
            return (
              <button
                key={x.id}
                type="button"
                role="tab"
                aria-selected={active}
                title={`${x.track} · ${x.symbol}/USDT`}
                onClick={() => navigateMarket(x.id)}
                className={cn(
                  "min-w-0 flex-1 rounded-full px-3 py-1.5 font-semibold transition-colors sm:flex-none sm:px-4",
                  active ? "bg-white text-black" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
                )}
              >
                {x.symbol}
              </button>
            );
          })}
        </div>
      </div>
      <p className="truncate font-mono text-[10px] text-zinc-600">
        {m.track} · {m.symbol}/USDT
        <span className="text-zinc-700"> · </span>
        <span className={cn("tabular-nums", chPos ? "text-[#B7F500]" : "text-fuchsia-300")}>
          {chPos ? "+" : ""}
          {m.change24hPct.toLocaleString("ru-RU", { maximumFractionDigits: 2 })}% за 24ч
        </span>
      </p>

      {/* Сводка по инструменту */}
      <div className="border-b border-white/10 pb-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 gap-3">
            <CoverThumb symbol={m.symbol} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-end gap-x-2 gap-y-0">
                <h2 className="truncate text-sm font-semibold text-white sm:text-base">{m.track}</h2>
                <span className="font-mono text-[11px] text-zinc-500">{m.symbol}</span>
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                    m.liquidity === "high" && "bg-[#B7F500]/12 text-[#d4f570]",
                    m.liquidity === "med" && "bg-zinc-600/25 text-zinc-400",
                    m.liquidity === "low" && "bg-amber-500/15 text-amber-200/90",
                  )}
                >
                  {m.liquidity === "high" ? "Ликвидн." : m.liquidity === "med" ? "Средн." : "Низк."}
                </span>
              </div>
              <p className="truncate font-mono text-[10px] text-zinc-600">
                {m.artist}
                <span className="text-zinc-700"> · </span>
                <span className="text-zinc-500">{m.genre}</span>
              </p>
              <Link
                href={`${analyticsReleaseDetailPath(getSecondaryMarketAnalyticsCatalogIdForReleaseSlug(m.releaseId))}?from=secondary`}
                className="mt-1 inline-block font-mono text-[10px] text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
              >
                Релиз
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:justify-end">
            <div className="flex flex-col items-end gap-0.5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">Last</span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xl font-semibold tracking-tight text-white tabular-nums sm:text-2xl">
                  {formatUsdt(last)}
                </span>
                <span
                  className={cn(
                    "font-mono text-sm font-semibold tabular-nums",
                    chPos ? "text-[#B7F500]" : "text-fuchsia-300",
                  )}
                >
                  {chPos ? "+" : ""}
                  {m.change24hPct.toLocaleString("ru-RU", { maximumFractionDigits: 2 })}%
                </span>
              </div>
            </div>
            <OrderBookMiniSparkline values={m.priceSpark} positive={sparkPositive} />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Link
            href={secondaryMarketHref("analytics", { release: m.releaseId })}
            className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] text-zinc-400 transition hover:border-white/20 hover:text-zinc-200"
          >
            Аналитика рынка
          </Link>
          <Link
            href={`${analyticsReleaseDetailPath(getSecondaryMarketAnalyticsCatalogIdForReleaseSlug(m.releaseId))}?from=secondary`}
            className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] text-zinc-400 transition hover:border-white/20 hover:text-zinc-200"
          >
            Открыть релиз
          </Link>
          <Link
            href={secondaryMarketHref("orders")}
            className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] text-zinc-400 transition hover:border-white/20 hover:text-zinc-200"
          >
            Мои ордера
          </Link>
          <Link
            href={secondaryMarketHref("history")}
            className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] text-zinc-400 transition hover:border-white/20 hover:text-zinc-200"
          >
            История сделок
          </Link>
        </div>

        <div className="mt-3 rounded-xl bg-[#0f0f0f] p-3 ring-1 ring-white/7">
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 font-mono text-[10px] text-zinc-500 sm:grid-cols-4 lg:grid-cols-9 lg:gap-x-4">
            <div className="min-w-0">
              <p className="truncate uppercase tracking-wider">Max 24ч</p>
              <p className="mt-0.5 truncate text-xs font-semibold tabular-nums text-zinc-200">{formatUsdt(m.high24h)}</p>
            </div>
            <div className="min-w-0">
              <p className="truncate uppercase tracking-wider">Min 24ч</p>
              <p className="mt-0.5 truncate text-xs font-semibold tabular-nums text-zinc-200">{formatUsdt(m.low24h)}</p>
            </div>
            <div className="min-w-0">
              <p className="truncate uppercase tracking-wider">Bid</p>
              <p className="mt-0.5 truncate text-xs font-semibold tabular-nums text-[#B7F500]">{bestBid ? formatUsdt(bestBid) : "—"}</p>
            </div>
            <div className="min-w-0">
              <p className="truncate uppercase tracking-wider">Ask</p>
              <p className="mt-0.5 truncate text-xs font-semibold tabular-nums text-fuchsia-300">{bestAsk ? formatUsdt(bestAsk) : "—"}</p>
            </div>
            <div className="min-w-0">
              <p className="truncate uppercase tracking-wider">Спред</p>
              <p className="mt-0.5 truncate text-xs font-semibold tabular-nums text-zinc-300">{spread > 0 ? formatUsdt(spread) : "—"}</p>
            </div>
            <div className="min-w-0">
              <p className="truncate uppercase tracking-wider">Объём 24ч</p>
              <p className="mt-0.5 truncate text-xs font-semibold tabular-nums text-white">{formatUsdtCompact(m.volume24hUsdt)} USDT</p>
              <p className="truncate text-zinc-600">{m.volume24hUnits} u</p>
            </div>
            <div className="min-w-0">
              <p className="truncate uppercase tracking-wider">Лента</p>
              <p className="mt-0.5 text-xs font-semibold tabular-nums text-zinc-200">{displayTrades.length}</p>
            </div>
            <div className="min-w-0">
              <p className="truncate uppercase tracking-wider">Ликвидность</p>
              <p className="mt-0.5 truncate text-xs font-semibold text-zinc-200">{liquidityLabelRu(m.liquidity)}</p>
            </div>
            <div className="min-w-0">
              <p className="truncate uppercase tracking-wider">Листинги</p>
              <p className="mt-0.5 text-xs font-semibold tabular-nums text-zinc-200">{m.rightsListed}</p>
            </div>
          </div>
        </div>
      </div>

      {m.liquidity === "low" ? (
        <p className="font-mono text-[10px] text-amber-200/85">Низкая ликвидность · шире спред и реже исполнение.</p>
      ) : null}

      {bookDockHidden ? (
        <button
          type="button"
          onClick={() => setBookHiddenForMarketId(null)}
          className="xl:hidden w-full rounded-xl border border-white/15 bg-[#111111] py-2.5 font-mono text-[11px] font-semibold text-zinc-200 ring-1 ring-white/6 transition hover:border-white/25 hover:text-white"
        >
          Показать стакан и сделки
        </button>
      ) : null}

      <div className="flex min-h-0 flex-col gap-3">
        <div
          className={cn(
            "grid min-h-0 gap-3",
            isWorkspace
              ? "lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)] lg:items-stretch"
              : "xl:grid-cols-[minmax(0,1fr)_minmax(300px,360px)] xl:items-stretch",
          )}
        >
        <div className={cn("min-w-0", isWorkspace ? "lg:order-1" : "xl:order-2")}>
          <SecondaryMarketOrderEntryPanel
            key={`${marketId}-${tick}-${ticketRev}`}
            m={{ symbol: m.symbol, asks: m.asks, bids: m.bids }}
            tick={tick}
            bestAsk={bestAsk}
            bestBid={bestBid}
            limitSeed={limitSeed}
            unitsAvailable={myPosition.unitsAvailable}
            usdtBalance={myPosition.usdtBalance}
            lockedUnits={lockedUnitsForPanel}
            isSubmitting={isSubmitting}
            onSubmit={handleOrderSubmit}
          />
        </div>

        {/* Стакан / сделки рынка по релизу */}
        <div
          className={cn(
            "flex min-w-0 flex-col overflow-hidden rounded-xl bg-[#0a0a0a] ring-1 ring-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
            isWorkspace
              ? "min-h-[min(48vh,420px)] max-h-[min(72vh,720px)] lg:order-2"
              : "min-h-[min(56vh,480px)] xl:order-1",
            bookDockHidden && "max-xl:hidden",
          )}
        >
          {isWorkspace ? (
            <div className="flex shrink-0 items-center justify-between border-b border-white/8 bg-black/40 px-3 py-2">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Книга ордеров
              </p>
              <span className="font-mono text-[10px] tabular-nums text-zinc-500">
                {m.symbol}
                <span className="text-zinc-600">/USDT</span>
              </span>
            </div>
          ) : null}
          <div className="flex border-b border-white/10 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => setWorkspaceTab("book")}
              className={cn(
                "flex-1 py-2.5 font-medium transition-colors",
                workspaceTab === "book" ? "bg-white/8 text-white" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              Стакан
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceTab("trades")}
              className={cn(
                "flex-1 py-2.5 font-medium transition-colors",
                workspaceTab === "trades" ? "bg-white/8 text-white" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              Сделки
            </button>
          </div>

          {workspaceTab === "book" ? (
            <>
              <div className="flex items-center justify-between gap-2 border-b border-white/10 px-2 py-1.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Шаг цены</span>
                <div className="flex rounded-md bg-black/50 p-0.5 font-mono text-[10px]">
                  {TICK_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTick(t)}
                      className={cn(
                        "rounded px-2 py-1 font-medium",
                        tick === t ? "bg-white text-black" : "text-zinc-500 hover:text-zinc-300",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[1fr_56px_80px] border-b border-white/10 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-zinc-600 sm:text-[10px]">
                <span>Цена (USDT)</span>
                <span className="text-center">Units</span>
                <span className="text-right">Σ глубина</span>
              </div>

              {isWorkspace ? (
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
                  <div className="grid min-h-0 flex-[1.08] grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
                    <p className="shrink-0 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-fuchsia-400/90">
                      Продажа
                    </p>
                    <div className="flex min-h-0 flex-col justify-start overflow-y-auto">
                      {askRows.map((row) => (
                        <OrderBookRow
                          key={`ask-${row.price}-${tick}`}
                          price={row.price}
                          units={row.units}
                          cumulativeUsdt={row.cum}
                          depthMax={depthMax}
                          variant="ask"
                          compact
                          onPick={() => pickLevel(row.price, "ask")}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 border-y border-white/8 bg-black/55 px-2 py-2 text-center">
                    <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-600">Mid</p>
                    <p className="font-mono text-lg font-semibold tabular-nums tracking-tight text-white sm:text-xl">
                      {mid > 0 ? formatUsdt(mid) : "—"}
                    </p>
                    <p className="mt-0.5 font-mono text-[9px] tabular-nums text-zinc-600">
                      спред {spread > 0 ? formatUsdt(spread) : "—"}
                    </p>
                  </div>

                  <div className="grid min-h-0 flex-[1.08] grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
                    <p className="shrink-0 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#B7F500]/90">
                      Покупка
                    </p>
                    <div className="flex min-h-0 flex-col justify-start overflow-y-auto">
                      {bidRows.map((row) => (
                        <OrderBookRow
                          key={`bid-${row.price}-${tick}`}
                          price={row.price}
                          units={row.units}
                          cumulativeUsdt={row.cum}
                          depthMax={depthMax}
                          variant="bid"
                          compact
                          onPick={() => pickLevel(row.price, "bid")}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <p className="px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-fuchsia-400/90">Продажа</p>
                  {askRows.map((row) => (
                    <OrderBookRow
                      key={`ask-${row.price}-${tick}`}
                      price={row.price}
                      units={row.units}
                      cumulativeUsdt={row.cum}
                      depthMax={depthMax}
                      variant="ask"
                      onPick={() => pickLevel(row.price, "ask")}
                    />
                  ))}

                  <div className="border-y border-white/10 bg-black/50 px-2 py-3 text-center">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Mid</p>
                    <p className="font-mono text-xl font-semibold tracking-tight text-white sm:text-2xl">
                      {mid > 0 ? formatUsdt(mid) : "—"}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-zinc-600">спред {spread > 0 ? formatUsdt(spread) : "—"}</p>
                  </div>

                  <p className="px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#B7F500]/90">Покупка</p>
                  {bidRows.map((row) => (
                    <OrderBookRow
                      key={`bid-${row.price}-${tick}`}
                      price={row.price}
                      units={row.units}
                      cumulativeUsdt={row.cum}
                      depthMax={depthMax}
                      variant="bid"
                      onPick={() => pickLevel(row.price, "bid")}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className={cn(isWorkspace && "flex min-h-0 flex-1 flex-col")}>
              <div className="grid grid-cols-[44px_72px_1fr_44px_88px] border-b border-white/10 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-zinc-600 sm:text-[10px]">
                <span>Время</span>
                <span>Сторона</span>
                <span className="text-right">Цена</span>
                <span className="text-right">U</span>
                <span className="text-right">Сумма</span>
              </div>
              <TradesPanel trades={displayTrades} workspace={isWorkspace} />
            </div>
          )}
        </div>
        </div>

        <div className="grid min-h-0 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <div className="rounded-xl bg-[#0f0f0f] p-3 ring-1 ring-white/7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Мои ордера по релизу</p>
                <p className="mt-0.5 font-mono text-[10px] text-zinc-600">Заявки, которые вы выставили по этому инструменту</p>
              </div>
              <span className="font-mono text-[10px] text-zinc-500">
                Активных: <span className="text-zinc-300">{activeOrderCount}</span>
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {(
                [
                  ["all", "Все"],
                  ["active", "Активные"],
                  ["partial", "Частично"],
                  ["filled", "Исполненные"],
                  ["cancelled", "Отменённые"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setOrderFilter(id)}
                  className={cn(
                    "rounded-full px-2.5 py-1 font-mono text-[10px] transition",
                    orderFilter === id ? "bg-white text-black" : "bg-black/40 text-zinc-500 hover:text-zinc-300",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {marketOrdersAll.length === 0 ? (
              <p className="mt-3 font-mono text-[11px] text-zinc-600">По этому релизу ещё не было заявок.</p>
            ) : filteredMarketOrders.length === 0 ? (
              <p className="mt-3 font-mono text-[11px] text-zinc-600">Нет заявок в выбранном фильтре.</p>
            ) : (
              <div className="mt-2 overflow-x-auto [-webkit-overflow-scrolling:touch]">
                <table className="w-full min-w-[684px] table-fixed border-separate border-spacing-0 font-mono text-[11px] tabular-nums">
                  <colgroup>
                    <col style={{ width: 108 }} />
                    <col style={{ width: 52 }} />
                    <col style={{ width: 80 }} />
                    <col style={{ width: 56 }} />
                    <col style={{ width: 56 }} />
                    <col style={{ width: 56 }} />
                    <col style={{ width: 96 }} />
                    <col style={{ width: 104 }} />
                    <col style={{ width: 76 }} />
                  </colgroup>
                  <thead className="text-zinc-500">
                    <tr className="border-b border-white/8">
                      <th className="py-1.5 pl-0 pr-2 text-left align-bottom font-normal">Сторона</th>
                      <th className="px-1 py-1.5 text-left align-bottom font-normal">Тип</th>
                      <th className="px-1 py-1.5 text-right align-bottom font-normal">Цена</th>
                      <th className="px-1 py-1.5 text-right align-bottom font-normal">Units</th>
                      <th className="px-1 py-1.5 text-right align-bottom font-normal">Исполн.</th>
                      <th className="px-1 py-1.5 text-right align-bottom font-normal">Остаток</th>
                      <th className="px-1 py-1.5 text-left align-bottom font-normal">Статус</th>
                      <th className="px-1 py-1.5 text-right align-bottom font-normal">Создан</th>
                      <th className="py-1.5 pl-2 pr-0 text-right align-bottom font-normal">Действие</th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-300">
                    {filteredMarketOrders.map((o) => {
                      const remain = Math.max(0, o.units - o.filled);
                      const canCancel = o.status === "active" || o.status === "partial";
                      const createdShort = new Date(o.createdAt).toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      return (
                        <tr key={o.id} className="border-b border-white/5">
                          <td
                            className={cn(
                              "whitespace-nowrap py-1.5 pl-0 pr-2 align-middle",
                              o.side === "buy" ? "text-[#B7F500]" : "text-fuchsia-300",
                            )}
                          >
                            {o.side === "buy" ? "Покупка" : "Продажа"}
                          </td>
                          <td className="whitespace-nowrap px-1 py-1.5 align-middle text-zinc-500">{orderTypeLabel(o.mode)}</td>
                          <td className="whitespace-nowrap px-1 py-1.5 text-right align-middle text-zinc-200">
                            {o.mode === "market" ? (
                              <span title="Средняя при исполнении">{formatUsdt(o.price)}</span>
                            ) : (
                              formatUsdt(o.price)
                            )}
                          </td>
                          <td className="whitespace-nowrap px-1 py-1.5 text-right align-middle">{o.units}</td>
                          <td className="whitespace-nowrap px-1 py-1.5 text-right align-middle">{o.filled}</td>
                          <td className="whitespace-nowrap px-1 py-1.5 text-right align-middle">{remain}</td>
                          <td className="whitespace-nowrap px-1 py-1.5 align-middle text-zinc-400">{orderStatusLabel(o.status)}</td>
                          <td className="whitespace-nowrap px-1 py-1.5 text-right align-middle text-zinc-500">{createdShort}</td>
                          <td className="py-1.5 pl-2 pr-0 text-right align-middle">
                            {canCancel ? (
                              <button
                                type="button"
                                onClick={() => cancelOrder(o.id)}
                                className="inline-flex h-7 items-center justify-center rounded-md border border-white/12 px-2 font-mono text-[10px] text-zinc-200 transition hover:border-fuchsia-400/35 hover:text-fuchsia-100"
                              >
                                Отмена
                              </button>
                            ) : (
                              <span className="inline-block w-full text-right text-zinc-600">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-[#111111] p-3 ring-1 ring-white/6">
            <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Моя позиция</p>
            <p className="mt-0.5 font-mono text-[10px] text-zinc-600">Holdings по этому релизу (не стакан и не лот)</p>
            {myPosition.unitsTotal <= 0 && myPosition.unitsAvailable <= 0 ? (
              <p className="mt-3 font-mono text-[11px] text-zinc-600">Нет открытой позиции в units.</p>
            ) : (
              <dl className="mt-3 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between gap-2 border-b border-white/5 pb-1.5">
                  <dt className="text-zinc-500">Всего units</dt>
                  <dd className="tabular-nums text-zinc-200">{myPosition.unitsTotal}</dd>
                </div>
                <div className="flex justify-between gap-2 border-b border-white/5 pb-1.5">
                  <dt className="text-zinc-500">Свободно</dt>
                  <dd className="tabular-nums text-[#c8f06a]">{myPosition.unitsAvailable}</dd>
                </div>
                <div className="flex justify-between gap-2 border-b border-white/5 pb-1.5">
                  <dt className="text-zinc-500">Заблокировано</dt>
                  <dd className="tabular-nums text-amber-200/90">{lockedUnitsForPanel}</dd>
                </div>
                <div className="flex justify-between gap-2 border-b border-white/5 pb-1.5">
                  <dt className="text-zinc-500">Средняя входа</dt>
                  <dd className="tabular-nums text-zinc-200">{formatUsdt(myPosition.avgEntryPrice)}</dd>
                </div>
                <div className="flex justify-between gap-2 border-b border-white/5 pb-1.5">
                  <dt className="text-zinc-500">Mark / last</dt>
                  <dd className="tabular-nums text-white">{formatUsdt(last)}</dd>
                </div>
                <div className="flex justify-between gap-2 border-b border-white/5 pb-1.5">
                  <dt className="text-zinc-500">Оценка позиции</dt>
                  <dd className="tabular-nums text-zinc-200">{formatUsdt(myPosition.unitsAvailable * last)} USDT</dd>
                </div>
                <div className="flex justify-between gap-2 border-b border-white/5 pb-1.5">
                  <dt className="text-zinc-500">Доступно USDT</dt>
                  <dd className="tabular-nums text-zinc-200">{formatUsdt(myPosition.usdtBalance)}</dd>
                </div>
                <div className="flex justify-between gap-2 pt-0.5">
                  <dt className="text-zinc-500">Нереализ. PnL (оценка)</dt>
                  <dd
                    className={cn(
                      "tabular-nums font-semibold",
                      unrealizedPnL > 0 ? "text-[#B7F500]" : unrealizedPnL < 0 ? "text-fuchsia-300" : "text-zinc-400",
                    )}
                  >
                    {unrealizedPnL === 0 ? "—" : `${unrealizedPnL > 0 ? "+" : ""}${formatUsdt(unrealizedPnL)} USDT`}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </div>
      </div>

      <SecondaryMarketOrderFeedbackModal
        open={orderFeedback !== null}
        feedback={orderFeedback}
        onOpenChange={(next) => {
          if (!next) setOrderFeedback(null);
        }}
      />
    </div>
  );
}
