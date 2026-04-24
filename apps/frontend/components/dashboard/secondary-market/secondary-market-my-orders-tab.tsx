"use client";

import * as React from "react";
import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import { ExternalLink, LayoutPanelTop, MoreHorizontal, Search, X } from "lucide-react";

import {
  secondaryMarketBookHref,
  secondaryMarketBookIdForSymbol,
  secondaryMarketHref,
} from "@/constants/dashboard/secondary-market";
import {
  analyticsReleaseDetailPath,
  secondaryMarketListingInfoPath,
  secondaryMarketReleaseAnalyticsPath,
} from "@/constants/routes";
import { getSecondaryMarketAnalyticsCatalogIdForReleaseSlug } from "@/mocks/dashboard/secondary-market-listings.mock";
import { cn } from "@/lib/utils";

import { OrderCancelConfirmModal } from "@/components/dashboard/secondary-market/secondary-market-order-cancel-confirm-modal";
import {
  smTableActionIconCircle,
  smTableActionIconCirclePressed,
  smTableActionMenuItem,
  smTableActionMenuItemAccent,
  smTableActionMenuItemDestructive,
  smTableActionMenuItemLink,
  smTableActionMenuItemMuted,
  smTableActionMenuItemSecondary,
  smTableActionMoreMenu,
  smTableActionReleasePill,
} from "@/components/dashboard/secondary-market/secondary-market-table-action-styles";

type OrderStatus = "active" | "partial" | "filled" | "cancelled" | "expired" | "rejected";
type OrderSide = "buy" | "sell";
type OrderMode = "limit" | "market";

type UserOrder = {
  id: string;
  listingId: string;
  symbol: string;
  track: string;
  artist: string;
  releaseId: string;
  side: OrderSide;
  mode: OrderMode;
  pricePerUnit: number | null;
  unitsTotal: number;
  unitsFilled: number;
  /** Номинал заявки в USDT (лимит: цена×объём; рынок — по факту исполнения в макете). */
  orderValueUsdt: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  /** Для статуса «Сбой»: краткое пояснение для оператора. */
  failureReason?: string;
};

const MOCK_ORDERS: UserOrder[] = [
  {
    id: "ord-8f2a",
    listingId: "lst-mnr",
    symbol: "MNR",
    track: "Midnight Run",
    artist: "Nova Lane",
    releaseId: "midnight-run",
    side: "buy",
    mode: "limit",
    pricePerUnit: 18.48,
    unitsTotal: 80,
    unitsFilled: 32,
    orderValueUsdt: 18.48 * 80,
    status: "partial",
    createdAt: "19.04.2026 11:42",
    updatedAt: "19.04.2026 12:08",
  },
  {
    id: "ord-7c11",
    listingId: "lst-sgn",
    symbol: "SGN",
    track: "Signal / Noise",
    artist: "Kairo",
    releaseId: "signal-noise",
    side: "sell",
    mode: "limit",
    pricePerUnit: 22.1,
    unitsTotal: 20,
    unitsFilled: 0,
    orderValueUsdt: 22.1 * 20,
    status: "active",
    createdAt: "19.04.2026 10:15",
    updatedAt: "19.04.2026 10:15",
  },
  {
    id: "ord-6d90",
    listingId: "lst-mnr",
    symbol: "MNR",
    track: "Midnight Run",
    artist: "Nova Lane",
    releaseId: "midnight-run",
    side: "buy",
    mode: "market",
    pricePerUnit: null,
    unitsTotal: 12,
    unitsFilled: 12,
    orderValueUsdt: 221.76,
    status: "filled",
    createdAt: "18.04.2026 16:22",
    updatedAt: "18.04.2026 16:22",
  },
  {
    id: "ord-5a33",
    listingId: "lst-gls",
    symbol: "GLS",
    track: "Glassline",
    artist: "The Static",
    releaseId: "glassline",
    side: "buy",
    mode: "limit",
    pricePerUnit: 9.0,
    unitsTotal: 100,
    unitsFilled: 0,
    orderValueUsdt: 9.0 * 100,
    status: "cancelled",
    createdAt: "18.04.2026 09:03",
    updatedAt: "18.04.2026 14:18",
  },
  {
    id: "ord-4b02",
    listingId: "lst-aur",
    symbol: "AUR",
    track: "Aurora Drift",
    artist: "Mira Sol",
    releaseId: "aurora-drift",
    side: "sell",
    mode: "limit",
    pricePerUnit: 11.3,
    unitsTotal: 45,
    unitsFilled: 0,
    orderValueUsdt: 11.3 * 45,
    status: "expired",
    createdAt: "17.04.2026 08:00",
    updatedAt: "19.04.2026 08:00",
  },
  {
    id: "ord-3e77",
    listingId: "lst-vlt",
    symbol: "VLT",
    track: "Velvet Room",
    artist: "June & Co",
    releaseId: "velvet-room",
    side: "buy",
    mode: "limit",
    pricePerUnit: 6.85,
    unitsTotal: 30,
    unitsFilled: 0,
    orderValueUsdt: 6.85 * 30,
    status: "rejected",
    createdAt: "16.04.2026 21:10",
    updatedAt: "16.04.2026 21:11",
    failureReason: "Сервис matching вернул ошибку settlement. Заявка не попала в стакан.",
  },
];

const STATUS_FILTER = [
  { id: "all" as const, label: "Все" },
  { id: "active" as const, label: "Активные" },
  { id: "partial" as const, label: "Частично" },
  { id: "filled" as const, label: "Исполнены" },
  { id: "cancelled" as const, label: "Отменены" },
  { id: "expired" as const, label: "Истекли" },
  { id: "failed" as const, label: "Сбой" },
] as const;

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
      className="size-8 shrink-0 rounded-full"
      style={{
        background: `linear-gradient(145deg, hsl(${hue}, 42%, 28%) 0%, hsl(${(hue + 48) % 360}, 28%, 12%) 100%)`,
      }}
      aria-hidden
    />
  );
}

function statusLabel(s: OrderStatus): string {
  switch (s) {
    case "active":
      return "Активен";
    case "partial":
      return "Частично";
    case "filled":
      return "Исполнен";
    case "cancelled":
      return "Отменён";
    case "expired":
      return "Истёк";
    case "rejected":
      return "Сбой";
    default:
      return s;
  }
}

function statusPillClass(s: OrderStatus) {
  switch (s) {
    case "active":
      return "bg-[#B7F500]/14 text-[#d4f570]";
    case "partial":
      return "bg-amber-500/15 text-amber-200/95";
    case "filled":
      return "bg-zinc-500/20 text-zinc-300";
    case "cancelled":
      return "bg-zinc-600/25 text-zinc-500";
    case "expired":
      return "bg-zinc-600/25 text-zinc-500";
    case "rejected":
      return "bg-fuchsia-500/15 text-fuchsia-200/90";
    default:
      return "bg-zinc-600/20 text-zinc-400";
  }
}

function countBy(orders: UserOrder[], pred: (o: UserOrder) => boolean): number {
  return orders.filter(pred).length;
}

function formatOrderUpdatedAt() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy} ${hh}:${mi}`;
}

/** Остаток в стакане: для завершённых без активного остатка — 0. */
function orderRemainingUnits(o: UserOrder): number {
  if (o.status === "filled" || o.status === "cancelled" || o.status === "expired" || o.status === "rejected") {
    return 0;
  }
  return Math.max(0, o.unitsTotal - o.unitsFilled);
}

function lockedHint(o: UserOrder): string {
  if (o.status === "filled" || o.status === "cancelled" || o.status === "expired" || o.status === "rejected") {
    return "—";
  }
  if (o.side === "buy") {
    const rem = orderRemainingUnits(o);
    const px = o.pricePerUnit;
    if (o.mode === "market" && px == null) {
      return `USDT ≈ ${formatUsdt(o.orderValueUsdt)} (рыночная заявка, макет)`;
    }
    if (px != null) {
      return `USDT ${formatUsdt(rem * px)} по остатку (${rem} u × ${formatUsdt(px)})`;
    }
    return `USDT по остатку`;
  }
  return `Units ${orderRemainingUnits(o)}`;
}

function returnOnCancelHint(o: UserOrder): string {
  if (o.side === "buy") {
    return "При отмене остатка неиспользованный USDT вернётся в доступный баланс.";
  }
  return "При отмене остатка непроданные units вернутся в доступный баланс.";
}

function executionSourceLabel(o: UserOrder): string {
  if (o.status === "filled" && o.mode === "market") return "Исполнение: market fill";
  if (o.status === "filled" && o.mode === "limit") return "Исполнение: полностью через стакан";
  if (o.status === "partial") return "Исполнение: частично через стакан";
  if (o.status === "active") return "Источник: ожидает в стакане";
  if (o.status === "cancelled") return o.unitsFilled > 0 ? "Итог: часть исполнена, остаток снят" : "Итог: заявка снята до исполнения";
  if (o.status === "expired") return "Итог: срок истёк, остаток снят автоматически";
  if (o.status === "rejected") return "Итог: заявка не принята системой";
  return "—";
}

function bookHrefForOrder(o: UserOrder): string | null {
  const id = secondaryMarketBookIdForSymbol(o.symbol);
  return id ? secondaryMarketBookHref(id) : null;
}

/** Карточка актива (выплаты, позиция) — «Релиз» как вторичная навигация. */
function releaseAssetHref(releaseId: string) {
  const catalogId = getSecondaryMarketAnalyticsCatalogIdForReleaseSlug(releaseId);
  return `${analyticsReleaseDetailPath(catalogId)}?from=secondary`;
}

/** Модалки вкладки: без ring-бордера, шире, только тень и графитовый фон. */
const ordersModalPopupClass =
  "rounded-2xl bg-[#101010] text-white shadow-[0_32px_120px_rgba(0,0,0,0.78)] transition-[opacity,transform] duration-200 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0";

export function SecondaryMarketMyOrdersTab() {
  const [orders, setOrders] = React.useState<UserOrder[]>(() => [...MOCK_ORDERS]);
  const [cancelTarget, setCancelTarget] = React.useState<UserOrder | null>(null);
  const [isBulkCancelOpen, setIsBulkCancelOpen] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<UserOrder | null>(null);
  const [orderActionMenuId, setOrderActionMenuId] = React.useState<string | null>(null);
  const orderMenuRef = React.useRef<HTMLDivElement | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const toastClearRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Заявка для повторного открытия деталей, если подтверждение отмены закрыли без подтверждения (переход из модалки деталей). */
  const pendingDetailRestoreOrderRef = React.useRef<UserOrder | null>(null);

  const clearToastSoon = React.useCallback((message: string) => {
    if (toastClearRef.current) clearTimeout(toastClearRef.current);
    setToastMessage(message);
    toastClearRef.current = setTimeout(() => {
      setToastMessage(null);
      toastClearRef.current = null;
    }, 4500);
  }, []);

  React.useEffect(
    () => () => {
      if (toastClearRef.current) clearTimeout(toastClearRef.current);
    },
    [],
  );

  React.useEffect(() => {
    if (!orderActionMenuId) return;
    const onDoc = (e: MouseEvent) => {
      if (orderMenuRef.current && !orderMenuRef.current.contains(e.target as Node)) {
        setOrderActionMenuId(null);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [orderActionMenuId]);

  const [statusFilter, setStatusFilter] = React.useState<(typeof STATUS_FILTER)[number]["id"]>("all");
  const [sideFilter, setSideFilter] = React.useState<"all" | OrderSide>("all");
  const [modeFilter, setModeFilter] = React.useState<"all" | OrderMode>("all");
  const [query, setQuery] = React.useState("");

  const summary = React.useMemo(() => {
    const o = orders;
    return {
      active: countBy(o, (x) => x.status === "active"),
      partial: countBy(o, (x) => x.status === "partial"),
      filled: countBy(o, (x) => x.status === "filled"),
      cancelled: countBy(o, (x) => x.status === "cancelled"),
      expired: countBy(o, (x) => x.status === "expired"),
      failed: countBy(o, (x) => x.status === "rejected"),
    };
  }, [orders]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((row) => {
      if (statusFilter === "active" && row.status !== "active") return false;
      if (statusFilter === "partial" && row.status !== "partial") return false;
      if (statusFilter === "filled" && row.status !== "filled") return false;
      if (statusFilter === "cancelled" && row.status !== "cancelled") return false;
      if (statusFilter === "expired" && row.status !== "expired") return false;
      if (statusFilter === "failed" && row.status !== "rejected") return false;
      if (sideFilter !== "all" && row.side !== sideFilter) return false;
      if (modeFilter !== "all" && row.mode !== modeFilter) return false;
      if (!q) return true;
      return (
        row.id.toLowerCase().includes(q) ||
        row.symbol.toLowerCase().includes(q) ||
        row.track.toLowerCase().includes(q) ||
        row.artist.toLowerCase().includes(q)
      );
    });
  }, [query, statusFilter, sideFilter, modeFilter, orders]);

  const cancellableCount = orders.filter((o) => o.status === "active" || o.status === "partial").length;

  const canCancel = (o: UserOrder) => o.status === "active" || o.status === "partial";

  const handleCancelConfirm = React.useCallback(async () => {
    pendingDetailRestoreOrderRef.current = null;
    await new Promise((r) => setTimeout(r, 480));
    const updatedAt = formatOrderUpdatedAt();
    const wasPartial = cancelTarget?.status === "partial";
    const id = cancelTarget?.id;
    if (!id) return;
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "cancelled" as const, updatedAt } : o)));
    clearToastSoon(wasPartial ? "Остаток заявки снят со стакана" : "Заявка отменена");
  }, [cancelTarget, clearToastSoon]);

  const handleBulkCancel = React.useCallback(async () => {
    await new Promise((r) => setTimeout(r, 420));
    const updatedAt = formatOrderUpdatedAt();
    setOrders((prev) =>
      prev.map((o) =>
        o.status === "active" || o.status === "partial" ? { ...o, status: "cancelled" as const, updatedAt } : o,
      ),
    );
    clearToastSoon("Активные заявки отменены");
    setIsBulkCancelOpen(false);
  }, [clearToastSoon]);

  const cancelModalVariant = cancelTarget?.status === "partial" ? "partial" : "active";
  const cancelModalSide = cancelTarget?.side ?? "buy";

  const marketHref = secondaryMarketHref("market");

  const detailOrder = React.useMemo(() => {
    if (!selectedOrder) return null;
    return orders.find((o) => o.id === selectedOrder.id) ?? selectedOrder;
  }, [orders, selectedOrder]);

  return (
    <div className="relative space-y-6">
      <p className="max-w-[62ch] font-mono text-[11px] leading-relaxed text-zinc-600">
        Личный операционный экран: только ваши заявки на вторичном рынке. Не история рынка и не лента сделок.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-[#111111] p-4 ring-1 ring-white/6">
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Активные</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-white">{summary.active}</p>
        </div>
        <div className="rounded-2xl bg-[#111111] p-4 ring-1 ring-white/6">
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Частично</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-amber-200/90">{summary.partial}</p>
        </div>
        <div className="rounded-2xl bg-[#111111] p-4 ring-1 ring-white/6">
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Исполнено</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-zinc-200">{summary.filled}</p>
        </div>
        <div className="rounded-2xl bg-[#111111] p-4 ring-1 ring-white/6">
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Отмена / истёк / сбой</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] tabular-nums text-zinc-400">
            <span>
              <span className="text-zinc-600">Отм.</span> {summary.cancelled}
            </span>
            <span>
              <span className="text-zinc-600">Ист.</span> {summary.expired}
            </span>
            <span>
              <span className="text-zinc-600">Сбой</span> {summary.failed}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {STATUS_FILTER.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setStatusFilter(chip.id)}
              className={cn(
                "rounded-full px-2.5 py-1 font-mono text-[11px] font-medium transition-colors",
                statusFilter === chip.id ? "bg-white text-black" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
        {cancellableCount > 0 ? (
          <button
            type="button"
            onClick={() => setIsBulkCancelOpen(true)}
            className="shrink-0 self-start rounded-full border border-white/12 bg-white/4 px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-wide text-zinc-300 transition hover:border-fuchsia-400/35 hover:text-fuchsia-200 lg:self-center"
          >
            Отменить все активные ({cancellableCount})
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-600" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Релиз, артист, тикер или id ордера"
            className="h-10 w-full rounded-xl bg-[#111111] py-2 pl-10 pr-3 font-mono text-sm text-white placeholder:text-zinc-600 outline-none ring-1 ring-white/10 focus:ring-[#B7F500]/35"
            aria-label="Поиск по заявкам"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-2">
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
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Тип</span>
            {(
              [
                { id: "all" as const, label: "Все" },
                { id: "limit" as const, label: "Лимит" },
                { id: "market" as const, label: "Рынок" },
              ] as const
            ).map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setModeFilter(chip.id)}
                className={cn(
                  "rounded-full px-2.5 py-1 font-mono text-[11px] font-medium",
                  modeFilter === chip.id ? "bg-white text-black" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl bg-[#111111] px-6 py-16 text-center ring-1 ring-white/6">
          <h2 className="text-lg font-semibold tracking-tight text-white">Заявок пока нет</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
            Когда вы выставите заявку на покупку или продажу на вторичном рынке, она появится здесь.
          </p>
          <Link
            href={marketHref}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-white px-5 font-mono text-[12px] font-semibold text-black transition hover:opacity-90"
          >
            Перейти к рынку
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-[#111111] px-6 py-16 text-center ring-1 ring-white/6">
          <h2 className="text-lg font-semibold tracking-tight text-white">Ничего не найдено</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
            Попробуйте изменить фильтры или очистить поиск.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatusFilter("all");
              setSideFilter("all");
              setModeFilter("all");
            }}
            className="mt-6 font-mono text-[12px] text-zinc-400 underline-offset-2 hover:text-white hover:underline"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="min-w-0 overflow-x-auto rounded-2xl bg-[#111111] ring-1 ring-white/6">
          <table className="w-full min-w-[1020px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                <th className="px-3 py-2.5 font-normal">ID</th>
                <th className="min-w-[200px] px-3 py-2.5 font-normal">Листинг / релиз</th>
                <th className="px-3 py-2.5 font-normal">Сторона</th>
                <th className="px-3 py-2.5 font-normal">Тип</th>
                <th className="px-3 py-2.5 text-right font-normal">Цена / u</th>
                <th className="px-3 py-2.5 text-right font-normal">Units</th>
                <th className="hidden px-3 py-2.5 text-right font-normal lg:table-cell">Исполн.</th>
                <th className="hidden px-3 py-2.5 text-right font-normal lg:table-cell">Остаток</th>
                <th className="px-3 py-2.5 text-right font-normal">Сумма</th>
                <th className="px-3 py-2.5 font-normal">Статус</th>
                <th className="hidden px-3 py-2.5 font-normal xl:table-cell">Создан</th>
                <th className="px-3 py-2.5 text-right font-normal">Действия</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[12px] text-zinc-300">
              {filtered.map((row) => {
                const remaining = orderRemainingUnits(row);
                const analyticsHref = secondaryMarketReleaseAnalyticsPath(row.releaseId);
                const listingHref = secondaryMarketListingInfoPath(row.listingId);
                const assetHref = releaseAssetHref(row.releaseId);
                const stackHref = bookHrefForOrder(row);
                const isTerminal =
                  row.status === "cancelled" || row.status === "expired" || row.status === "rejected";
                const showRepeat = isTerminal;

                return (
                  <tr
                    key={row.id}
                    tabIndex={0}
                    onClick={() => {
                      setOrderActionMenuId(null);
                      setSelectedOrder(row);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOrderActionMenuId(null);
                        setSelectedOrder(row);
                      }
                    }}
                    className="cursor-pointer border-b border-white/5 transition-colors hover:bg-white/3 focus-visible:bg-white/4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B7F500]/25"
                  >
                    <td className="px-3 py-2.5 align-middle text-[11px] text-zinc-500">{row.id}</td>
                    <td className="px-3 py-2.5 align-middle">
                      <div className="flex items-center gap-2">
                        <CoverThumb symbol={row.symbol} />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-white">{row.track}</p>
                          <p className="truncate text-[11px] text-zinc-600">
                            {row.artist} · {row.symbol}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 align-middle">
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          row.side === "buy" ? "text-[#B7F500]" : "text-fuchsia-300",
                        )}
                      >
                        {row.side === "buy" ? "Покупка" : "Продажа"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 align-middle text-zinc-400">{row.mode === "limit" ? "Лимит" : "Рынок"}</td>
                    <td className="px-3 py-2.5 text-right align-middle tabular-nums text-white">
                      {row.mode === "market" && row.pricePerUnit == null ? (
                        <span className="text-zinc-500">По рынку</span>
                      ) : row.pricePerUnit != null ? (
                        formatUsdt(row.pricePerUnit)
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right align-middle tabular-nums">{row.unitsTotal}</td>
                    <td className="hidden px-3 py-2.5 text-right align-middle tabular-nums text-zinc-400 lg:table-cell">
                      {row.unitsFilled}
                    </td>
                    <td className="hidden px-3 py-2.5 text-right align-middle tabular-nums text-zinc-500 lg:table-cell">
                      {remaining}
                    </td>
                    <td className="px-3 py-2.5 text-right align-middle tabular-nums text-zinc-200">
                      {row.orderValueUsdt > 0 ? `${formatUsdt(row.orderValueUsdt)} USDT` : "—"}
                    </td>
                    <td className="px-3 py-2.5 align-middle">
                      <span
                        title={
                          row.status === "rejected" && row.failureReason
                            ? row.failureReason
                            : row.side === "buy"
                              ? "Покупка: при выставлении блокируется USDT; частичное исполнение списывает пропорционально; отмена остатка возвращает USDT."
                              : "Продажа: блокируются units; частичное исполнение продаёт часть; отмена остатка возвращает units."
                        }
                        className={cn(
                          "inline-flex cursor-help rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide",
                          statusPillClass(row.status),
                        )}
                      >
                        {statusLabel(row.status)}
                      </span>
                    </td>
                    <td className="hidden px-3 py-2.5 align-middle text-[11px] text-zinc-600 xl:table-cell">
                      {row.createdAt}
                    </td>
                    <td className="px-3 py-2.5 text-right align-middle">
                      <div
                        className="relative flex flex-nowrap items-center justify-end gap-2.5"
                        ref={orderActionMenuId === row.id ? orderMenuRef : undefined}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className={smTableActionIconCircle}
                          aria-label="Подробнее о заявке"
                          onClick={() => {
                            setOrderActionMenuId(null);
                            setSelectedOrder(row);
                          }}
                        >
                          <LayoutPanelTop className="size-[17px]" strokeWidth={1.75} aria-hidden />
                        </button>
                        <Link href={assetHref} scroll={false} className={smTableActionReleasePill}>
                          Релиз
                          <ExternalLink className="size-3.5 opacity-55" aria-hidden />
                        </Link>
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            aria-expanded={orderActionMenuId === row.id}
                            aria-haspopup="menu"
                            aria-label="Ещё действия"
                            onClick={() => setOrderActionMenuId((id) => (id === row.id ? null : row.id))}
                            className={cn(
                              smTableActionIconCircle,
                              orderActionMenuId === row.id && smTableActionIconCirclePressed,
                            )}
                          >
                            <MoreHorizontal className="size-[17px]" strokeWidth={1.75} aria-hidden />
                          </button>
                          {orderActionMenuId === row.id ? (
                            <div role="menu" className={smTableActionMoreMenu}>
                              <button
                                type="button"
                                role="menuitem"
                                className={smTableActionMenuItem}
                                onClick={() => {
                                  setOrderActionMenuId(null);
                                  setSelectedOrder(row);
                                }}
                              >
                                Подробнее
                              </button>
                              {canCancel(row) ? (
                                <button
                                  type="button"
                                  role="menuitem"
                                  className={smTableActionMenuItemDestructive}
                                  onClick={() => {
                                    setOrderActionMenuId(null);
                                    setCancelTarget(row);
                                  }}
                                >
                                  {row.status === "partial" ? "Отменить остаток" : "Отменить"}
                                </button>
                              ) : null}
                              {stackHref ? (
                                <Link
                                  role="menuitem"
                                  href={stackHref}
                                  scroll={false}
                                  className={smTableActionMenuItemLink}
                                  onClick={() => setOrderActionMenuId(null)}
                                >
                                  Стакан
                                </Link>
                              ) : (
                                <span className={smTableActionMenuItemMuted}>Стакан недоступен</span>
                              )}
                              {showRepeat ? (
                                <Link
                                  role="menuitem"
                                  href={listingHref}
                                  scroll={false}
                                  className={smTableActionMenuItemAccent}
                                  onClick={() => setOrderActionMenuId(null)}
                                >
                                  Повторить заявку
                                </Link>
                              ) : null}
                              <Link
                                role="menuitem"
                                href={analyticsHref}
                                scroll={false}
                                className={smTableActionMenuItemSecondary}
                                onClick={() => setOrderActionMenuId(null)}
                              >
                                Торговая аналитика
                              </Link>
                              <Link
                                role="menuitem"
                                href={listingHref}
                                scroll={false}
                                className={smTableActionMenuItemSecondary}
                                onClick={() => setOrderActionMenuId(null)}
                              >
                                Инфо по листингу
                              </Link>
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
      )}

      <OrderCancelConfirmModal
        open={cancelTarget != null}
        onOpenChange={(next) => {
          if (!next) {
            const restore = pendingDetailRestoreOrderRef.current;
            pendingDetailRestoreOrderRef.current = null;
            setCancelTarget(null);
            if (restore) {
              setSelectedOrder(restore);
            }
          }
        }}
        variant={cancelModalVariant}
        side={cancelModalSide}
        onConfirm={handleCancelConfirm}
      />

      <Dialog.Root open={isBulkCancelOpen} onOpenChange={setIsBulkCancelOpen} modal>
        <Dialog.Portal>
          <Dialog.Backdrop
            className={cn(
              "fixed inset-0 z-120 bg-black/70 backdrop-blur-[2px]",
              "transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
            )}
          />
          <Dialog.Popup
            className={cn(
              "fixed left-1/2 top-1/2 z-121 w-[min(100vw-2rem,560px)] -translate-x-1/2 -translate-y-1/2 p-6",
              ordersModalPopupClass,
            )}
          >
            <Dialog.Close
              aria-label="Закрыть"
              className="absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/10 hover:text-zinc-200"
            >
              <X className="size-4" />
            </Dialog.Close>
            <Dialog.Title className="pr-10 text-base font-semibold tracking-tight text-white">
              Отменить все активные заявки?
            </Dialog.Title>
            <Dialog.Description className="mt-3 space-y-2 text-[13px] leading-relaxed text-zinc-400">
              <p>
                Будут сняты только активные и неисполненные остатки ({cancellableCount}{" "}
                {cancellableCount === 1 ? "заявка" : "заявок"}). Частично исполненные ордера: отменяется только
                остаток в стакане; уже исполненная часть не затрагивается.
              </p>
              <p className="text-zinc-500">Полностью исполненные заявки не изменяются.</p>
            </Dialog.Description>
            <div className="mt-5 rounded-xl bg-white/[0.04] px-4 py-3.5">
              <p className="font-mono text-[11px] text-zinc-500">К отмене остатков</p>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-white">{cancellableCount}</p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Dialog.Close className="h-10 rounded-full bg-white/10 px-5 font-mono text-[12px] font-medium text-zinc-200 transition hover:bg-white/14 hover:text-white">
                Не отменять
              </Dialog.Close>
              <button
                type="button"
                onClick={() => void handleBulkCancel()}
                className="h-10 rounded-full bg-white px-5 font-mono text-[12px] font-semibold text-black transition hover:opacity-90"
              >
                Подтвердить отмену
              </button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root
        open={detailOrder != null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOrder(null);
            setOrderActionMenuId(null);
          }
        }}
        modal
      >
        <Dialog.Portal>
          {detailOrder ? (
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
                  ordersModalPopupClass,
                )}
              >
                <div className="flex shrink-0 items-start justify-between gap-4 px-6 pb-4 pt-5">
                  <div className="min-w-0">
                    <Dialog.Title className="text-lg font-semibold tracking-tight text-white">
                      {detailOrder.track}
                    </Dialog.Title>
                    <Dialog.Description className="mt-1 text-sm text-zinc-500">
                      {detailOrder.artist} · {detailOrder.symbol}
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
                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Заявка</p>
                  <dl className="mt-3 space-y-0 font-mono text-[12px]">
                    <div className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
                      <dt className="text-zinc-600">ID</dt>
                      <dd className="tabular-nums text-zinc-200">{detailOrder.id}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
                      <dt className="text-zinc-600">Сторона</dt>
                      <dd className={detailOrder.side === "buy" ? "text-[#B7F500]" : "text-fuchsia-300"}>
                        {detailOrder.side === "buy" ? "Покупка" : "Продажа"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
                      <dt className="text-zinc-600">Тип</dt>
                      <dd className="text-zinc-300">{detailOrder.mode === "limit" ? "Лимит" : "Рынок"}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
                      <dt className="text-zinc-600">Цена / unit</dt>
                      <dd className="text-right tabular-nums text-zinc-200">
                        {detailOrder.mode === "market" && detailOrder.pricePerUnit == null ? (
                          <span className="text-zinc-500">По рынку</span>
                        ) : detailOrder.pricePerUnit != null ? (
                          formatUsdt(detailOrder.pricePerUnit)
                        ) : (
                          "—"
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
                      <dt className="text-zinc-600">Объём</dt>
                      <dd className="tabular-nums text-zinc-200">{detailOrder.unitsTotal}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
                      <dt className="text-zinc-600">Исполнено</dt>
                      <dd className="tabular-nums text-zinc-200">{detailOrder.unitsFilled}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
                      <dt className="text-zinc-600">Остаток</dt>
                      <dd className="tabular-nums text-zinc-200">{orderRemainingUnits(detailOrder)}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
                      <dt className="text-zinc-600">Сумма</dt>
                      <dd className="tabular-nums text-zinc-200">
                        {detailOrder.orderValueUsdt > 0 ? `${formatUsdt(detailOrder.orderValueUsdt)} USDT` : "—"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
                      <dt className="text-zinc-600">Создан</dt>
                      <dd className="text-right text-zinc-400">{detailOrder.createdAt}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
                      <dt className="text-zinc-600">Обновлён</dt>
                      <dd className="text-right text-zinc-400">{detailOrder.updatedAt}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 rounded-xl bg-white/[0.03] px-4 py-3">
                    <p className="text-[11px] leading-relaxed text-zinc-500">{executionSourceLabel(detailOrder)}</p>
                    {detailOrder.failureReason ? (
                      <p className="mt-2 text-[11px] leading-relaxed text-fuchsia-200/80">{detailOrder.failureReason}</p>
                    ) : null}
                  </div>
                  <div className="mt-2.5 rounded-xl bg-white/[0.03] px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Заблокировано сейчас</p>
                    <p className="mt-1 text-[12px] text-zinc-300">{lockedHint(detailOrder)}</p>
                    <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">{returnOnCancelHint(detailOrder)}</p>
                  </div>
                </div>

                <div className="shrink-0 space-y-3 bg-black/20 px-6 py-4">
                  <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
                    <Link
                      href={releaseAssetHref(detailOrder.releaseId)}
                      scroll={false}
                      className={cn(smTableActionReleasePill, "h-10 px-5")}
                    >
                      Релиз
                      <ExternalLink className="size-3.5 opacity-55" aria-hidden />
                    </Link>
                    {bookHrefForOrder(detailOrder) ? (
                      <Link
                        href={bookHrefForOrder(detailOrder)!}
                        scroll={false}
                        className="inline-flex h-10 items-center justify-center rounded-full bg-white/10 px-5 font-mono text-[12px] font-medium text-zinc-200 transition hover:bg-white/14"
                      >
                        Стакан
                      </Link>
                    ) : null}
                  </div>
                  {canCancel(detailOrder) ? (
                    <button
                      type="button"
                      onClick={() => {
                        pendingDetailRestoreOrderRef.current = detailOrder;
                        setCancelTarget(detailOrder);
                        setSelectedOrder(null);
                      }}
                      className="w-full rounded-full bg-fuchsia-500/20 py-2.5 font-mono text-[12px] font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/28"
                    >
                      {detailOrder.status === "partial" ? "Отменить остаток" : "Отменить заявку"}
                    </button>
                  ) : null}
                  {!bookHrefForOrder(detailOrder) ? (
                    <p className="text-center font-mono text-[10px] text-zinc-600">Стакан для этого тикера недоступен в макете</p>
                  ) : null}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <Link
                      href={secondaryMarketReleaseAnalyticsPath(detailOrder.releaseId)}
                      scroll={false}
                      className="font-mono text-[11px] text-zinc-500 underline-offset-4 transition hover:text-zinc-300 hover:underline"
                    >
                      Торговая аналитика вторички
                    </Link>
                    <Link
                      href={secondaryMarketListingInfoPath(detailOrder.listingId)}
                      scroll={false}
                      className="font-mono text-[11px] text-zinc-500 underline-offset-4 transition hover:text-zinc-300 hover:underline"
                    >
                      Информация по листингу
                    </Link>
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
          <div className="rounded-xl bg-zinc-950/95 px-4 py-3 font-mono text-[12px] leading-snug text-zinc-100 shadow-[0_16px_48px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
            {toastMessage}
          </div>
        </div>
      ) : null}
    </div>
  );
}
