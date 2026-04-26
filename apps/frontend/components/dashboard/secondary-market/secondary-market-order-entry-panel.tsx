"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

import { walkBuyAgainstAsks, walkSellAgainstBids } from "./secondary-market-book-math";

const FEE_RATE = 0.002;

export type LimitSeed = { price: number; side: "buy" | "sell" };

export type BookMarketLite = {
  symbol: string;
  asks: { price: number; units: number }[];
  bids: { price: number; units: number }[];
};

function formatUsdt(n: number) {
  return n.toLocaleString("ru-RU", {
    minimumFractionDigits: n % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

function roundToTick(price: number, tick: number) {
  const k = Math.round(price / tick);
  const rounded = k * tick;
  const decimals = Math.max(0, `${tick}`.split(".")[1]?.length ?? 0);
  return Number(rounded.toFixed(decimals));
}

export type SecondaryMarketOrderEntryPanelProps = {
  m: BookMarketLite;
  tick: number;
  bestAsk: number;
  bestBid: number;
  limitSeed: LimitSeed | null;
  /** Свободные units для продажи (без учёта locked). */
  unitsAvailable: number;
  usdtBalance: number;
  lockedUnits: number;
  isSubmitting: boolean;
  onSubmit: (payload: {
    orderMode: "limit" | "market";
    side: "buy" | "sell";
    price: number;
    units: number;
  }) => Promise<void>;
};

export function SecondaryMarketOrderEntryPanel({
  m,
  tick,
  bestAsk,
  bestBid,
  limitSeed,
  unitsAvailable,
  usdtBalance,
  lockedUnits,
  isSubmitting,
  onSubmit,
}: SecondaryMarketOrderEntryPanelProps) {
  const [orderMode, setOrderMode] = React.useState<"limit" | "market">("limit");
  const [side, setSide] = React.useState<"buy" | "sell">(limitSeed?.side ?? "buy");
  const [price, setPrice] = React.useState(() =>
    limitSeed ? String(limitSeed.price) : bestAsk ? String(bestAsk) : "",
  );
  const [units, setUnits] = React.useState("");
  const [localError, setLocalError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!limitSeed) return;
    setSide(limitSeed.side);
    setPrice(String(limitSeed.price));
    setOrderMode("limit");
    setLocalError(null);
  }, [limitSeed]);

  const priceNum = parseFloat(price.replace(",", ".")) || 0;
  const unitsNum = parseFloat(units.replace(",", ".")) || 0;

  const marketBuyWalk = React.useMemo(
    () => (unitsNum > 0 ? walkBuyAgainstAsks(m.asks, unitsNum) : null),
    [m.asks, unitsNum],
  );
  const marketSellWalk = React.useMemo(
    () => (unitsNum > 0 ? walkSellAgainstBids(m.bids, unitsNum) : null),
    [m.bids, unitsNum],
  );

  const limitBuyCross = React.useMemo(() => {
    if (orderMode !== "limit" || side !== "buy" || !unitsNum || !priceNum || !bestAsk) return null;
    if (priceNum < bestAsk) return null;
    return walkBuyAgainstAsks(m.asks, unitsNum, priceNum);
  }, [orderMode, side, unitsNum, priceNum, bestAsk, m.asks]);

  const limitSellCross = React.useMemo(() => {
    if (orderMode !== "limit" || side !== "sell" || !unitsNum || !priceNum || !bestBid) return null;
    if (priceNum > bestBid) return null;
    return walkSellAgainstBids(m.bids, unitsNum, priceNum);
  }, [orderMode, side, unitsNum, priceNum, bestBid, m.bids]);

  const subtotalUsdt =
    orderMode === "market"
      ? side === "buy"
        ? (marketBuyWalk?.totalUsdt ?? 0)
        : (marketSellWalk?.totalUsdt ?? 0)
      : priceNum * unitsNum;

  const feeUsdt = subtotalUsdt * FEE_RATE;
  const buyDebit = subtotalUsdt + feeUsdt;
  const sellNet = Math.max(0, subtotalUsdt - feeUsdt);
  const avgExec =
    orderMode === "market"
      ? side === "buy"
        ? (marketBuyWalk?.avgPrice ?? 0)
        : (marketSellWalk?.avgPrice ?? 0)
      : priceNum;

  const bumpPrice = (dir: -1 | 1) => {
    const base = priceNum || (side === "buy" ? bestAsk : bestBid) || 0;
    if (!base) return;
    setPrice(String(roundToTick(base + dir * tick, tick)));
  };

  const bumpUnits = (dir: -1 | 1) => {
    const base = unitsNum || 0;
    const next = Math.max(0, base + dir);
    setUnits(next > 0 ? String(next) : "");
  };

  const applyPct = (pct: number) => {
    if (pct === 0) {
      setUnits("");
      return;
    }
    if (side === "buy") {
      const px =
        orderMode === "limit" && priceNum > 0 ? priceNum : bestAsk || marketBuyWalk?.avgPrice || 0;
      if (!px) return;
      const maxU = usdtBalance / px;
      setUnits(String(Math.max(1, Math.floor((maxU * pct) / 100))));
    } else {
      setUnits(String(Math.max(1, Math.floor((unitsAvailable * pct) / 100))));
    }
  };

  const validate = (): string | null => {
    if (!unitsNum || unitsNum <= 0) return "Укажите количество UNT.";
    if (orderMode === "limit" && (!priceNum || priceNum <= 0)) return "Укажите цену за UNT.";
    if (side === "buy") {
      if (unitsNum % 1 !== 0) return "Units должны быть целым числом.";
        if (buyDebit > usdtBalance + 1e-6)
        return `Недостаточно USDT. Нужно ~${formatUsdt(buyDebit)} USDT с комиссией, доступно ${formatUsdt(usdtBalance)}.`;
    } else {
      if (unitsNum > unitsAvailable + 1e-6)
        return `Недостаточно свободных units (доступно ${unitsAvailable}, в заявках ${lockedUnits}).`;
    }
    return null;
  };

  const submit = async () => {
    setLocalError(null);
    const err = validate();
    if (err) {
      setLocalError(err);
      return;
    }
    const px = orderMode === "limit" ? priceNum : side === "buy" ? marketBuyWalk?.avgPrice ?? bestAsk : marketSellWalk?.avgPrice ?? bestBid;
    try {
      await onSubmit({ orderMode, side, price: px || 0, units: unitsNum });
    } catch {
      setLocalError("Не удалось отправить заявку. Повторите.");
    }
  };

  const caption =
    orderMode === "limit"
      ? "Заявка будет размещена в стакане или исполнится сразу, если пересечёт рынок."
      : "Заявка исполнится по лучшим доступным ценам рынка (возможен проскальзывание).";

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-[#111111] p-3 ring-1 ring-white/6">
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Заявка</p>
        <span className="text-right font-mono text-[9px] leading-snug text-zinc-600">
          Limit — по вашей цене · Market — по лучшим уровням
        </span>
      </div>

      <div className="flex rounded-full bg-black/55 p-0.5 font-mono text-[10px]">
        <button
          type="button"
          onClick={() => {
            setOrderMode("limit");
            setLocalError(null);
            setPrice(side === "buy" ? (bestAsk ? String(bestAsk) : "") : bestBid ? String(bestBid) : "");
          }}
          className={cn(
            "flex-1 rounded-full py-1.5 font-semibold",
            orderMode === "limit" ? "bg-white text-black" : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          Лимит
        </button>
        <button
          type="button"
          onClick={() => {
            setOrderMode("market");
            setLocalError(null);
            setPrice("");
          }}
          className={cn(
            "flex-1 rounded-full py-1.5 font-semibold",
            orderMode === "market" ? "bg-white text-black" : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          Рынок
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-lg bg-black/45 p-0.5 font-mono text-[11px]">
        <button
          type="button"
          onClick={() => {
            setSide("buy");
            setLocalError(null);
            if (orderMode === "limit") setPrice(bestAsk ? String(bestAsk) : "");
          }}
          className={cn(
            "rounded-md py-2 font-bold transition-colors",
            side === "buy" ? "bg-[#B7F500]/22 text-[#d4f570]" : "text-zinc-500 hover:text-zinc-400",
          )}
        >
          Купить
        </button>
        <button
          type="button"
          onClick={() => {
            setSide("sell");
            setLocalError(null);
            if (orderMode === "limit") setPrice(bestBid ? String(bestBid) : "");
          }}
          className={cn(
            "rounded-md py-2 font-bold transition-colors",
            side === "sell" ? "bg-fuchsia-500/18 text-fuchsia-200" : "text-zinc-500 hover:text-zinc-400",
          )}
        >
          Продать
        </button>
      </div>

      <div className="flex items-center justify-between border-b border-white/10 pb-2 font-mono text-[10px]">
        <span className="text-zinc-600">{side === "buy" ? "Доступно USDT" : "Доступно UNT (free)"}</span>
        <span className="font-semibold text-zinc-200">
          {side === "buy" ? `${formatUsdt(usdtBalance)} USDT` : `${unitsAvailable} u`}
        </span>
      </div>
      {lockedUnits > 0 ? (
        <p className="font-mono text-[9px] text-zinc-600">В заявках заблокировано: {lockedUnits} u</p>
      ) : null}

      {orderMode === "limit" ? (
        <div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">Цена · USDT за 1 unit</span>
          <div className="mt-1 flex items-stretch gap-0.5">
            <button
              type="button"
              onClick={() => bumpPrice(-1)}
              className="flex w-9 shrink-0 items-center justify-center rounded-l-lg bg-black text-zinc-400 ring-1 ring-white/10 hover:bg-white/5 hover:text-white"
              aria-label="Минус шаг"
            >
              <Minus className="size-3.5" />
            </button>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="min-w-0 flex-1 bg-black px-2 py-2 text-center font-mono text-sm text-white ring-1 ring-white/10 outline-none focus:ring-[#B7F500]/35"
              inputMode="decimal"
            />
            <button
              type="button"
              onClick={() => bumpPrice(1)}
              className="flex w-9 shrink-0 items-center justify-center rounded-r-lg bg-black text-zinc-400 ring-1 ring-white/10 hover:bg-white/5 hover:text-white"
              aria-label="Плюс шаг"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-black/40 px-2 py-2 font-mono text-[10px] text-zinc-400">
          {side === "buy" ? (
            <>
              <p className="text-zinc-500">Оценка по ask (макет)</p>
              <p className="mt-1 text-zinc-200">
                Ср. цена: {marketBuyWalk && unitsNum ? formatUsdt(marketBuyWalk.avgPrice) : "—"} · исполнит до{" "}
                {marketBuyWalk?.filledUnits ?? 0} / {unitsNum || 0} u
              </p>
              <p className="mt-1 text-amber-200/85">Проскальзывание: до ~0,3% от лучшего ask (учебный текст).</p>
            </>
          ) : (
            <>
              <p className="text-zinc-500">Оценка по bid (макет)</p>
              <p className="mt-1 text-zinc-200">
                Ср. цена: {marketSellWalk && unitsNum ? formatUsdt(marketSellWalk.avgPrice) : "—"} · исполнит до{" "}
                {marketSellWalk?.filledUnits ?? 0} / {unitsNum || 0} u
              </p>
            </>
          )}
        </div>
      )}

      {orderMode === "limit" && side === "buy" && limitBuyCross && unitsNum ? (
        <p className="rounded-md bg-amber-500/10 px-2 py-1.5 font-mono text-[9px] text-amber-200/95">
          Лимит ≥ ask: сразу исполнится до {limitBuyCross.filledUnits} u по уровням ≤ {formatUsdt(priceNum)}, остаток
          уйдёт в стакан.
        </p>
      ) : null}
      {orderMode === "limit" && side === "sell" && limitSellCross && unitsNum ? (
        <p className="rounded-md bg-amber-500/10 px-2 py-1.5 font-mono text-[9px] text-amber-200/95">
          Лимит ≤ bid: сразу исполнится до {limitSellCross.filledUnits} u по уровням ≥ {formatUsdt(priceNum)}.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => {
            if (bestAsk) {
              setOrderMode("limit");
              setSide("buy");
              setPrice(String(bestAsk));
            }
          }}
          className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] text-zinc-400 transition hover:border-white/20 hover:text-zinc-200"
        >
          Best ask {bestAsk ? formatUsdt(bestAsk) : "—"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (bestBid) {
              setOrderMode("limit");
              setSide("sell");
              setPrice(String(bestBid));
            }
          }}
          className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] text-zinc-400 transition hover:border-white/20 hover:text-zinc-200"
        >
          Best bid {bestBid ? formatUsdt(bestBid) : "—"}
        </button>
      </div>

      <div>
        <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">Units</span>
        <div className="mt-1 flex items-stretch gap-0.5">
          <button
            type="button"
            onClick={() => bumpUnits(-1)}
            className="flex w-9 shrink-0 items-center justify-center rounded-l-lg bg-black text-zinc-400 ring-1 ring-white/10 hover:bg-white/5 hover:text-white"
            aria-label="Минус unit"
          >
            <Minus className="size-3.5" />
          </button>
          <input
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            className="min-w-0 flex-1 bg-black px-2 py-2 text-center font-mono text-sm text-white ring-1 ring-white/10 outline-none focus:ring-[#B7F500]/35"
            inputMode="decimal"
            placeholder="0"
          />
          <button
            type="button"
            onClick={() => bumpUnits(1)}
            className="flex w-9 shrink-0 items-center justify-center rounded-r-lg bg-black text-zinc-400 ring-1 ring-white/10 hover:bg-white/5 hover:text-white"
            aria-label="Плюс unit"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex overflow-hidden rounded-md font-mono text-[10px] ring-1 ring-white/10">
        {([0, 25, 50, 75, 100] as const).map((pct) => (
          <button
            key={pct}
            type="button"
            onClick={() => applyPct(pct)}
            className={cn(
              "flex-1 border-r border-black/40 py-1.5 font-medium last:border-r-0",
              side === "buy" ? "hover:bg-[#B7F500]/10" : "hover:bg-fuchsia-500/10",
              "text-zinc-500 hover:text-zinc-200",
            )}
          >
            {pct === 0 ? "0" : `${pct}%`}
          </button>
        ))}
      </div>

      <div className="space-y-1.5 rounded-lg bg-black/40 px-2.5 py-2 font-mono text-[10px]">
        <div className="flex items-center justify-between text-zinc-500">
          <span>{orderMode === "market" ? "Оценка оборота" : "Субтотал"}</span>
          <span className="text-zinc-200">{subtotalUsdt > 0 ? `${formatUsdt(subtotalUsdt)} USDT` : "—"}</span>
        </div>
        <div className="flex items-center justify-between text-zinc-500">
          <span>Комиссия ({(FEE_RATE * 100).toFixed(1)}%)</span>
          <span className="text-zinc-300">{subtotalUsdt > 0 ? `${formatUsdt(feeUsdt)} USDT` : "—"}</span>
        </div>
        {side === "buy" ? (
          <div className="flex items-center justify-between text-zinc-500">
            <span>К списанию (всего)</span>
            <span className="font-semibold text-white">{subtotalUsdt > 0 ? `${formatUsdt(buyDebit)} USDT` : "—"}</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-zinc-500">
              <span>К получению (брутто)</span>
              <span className="text-zinc-200">{subtotalUsdt > 0 ? `${formatUsdt(subtotalUsdt)} USDT` : "—"}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-500">
              <span>К получению (нетто)</span>
              <span className="font-semibold text-white">{subtotalUsdt > 0 ? `${formatUsdt(sellNet)} USDT` : "—"}</span>
            </div>
          </>
        )}
        {orderMode === "market" && unitsNum > 0 ? (
          <div className="flex items-center justify-between text-zinc-600">
            <span>Ср. цена (оценка)</span>
            <span>{avgExec > 0 ? `${formatUsdt(avgExec)} USDT` : "—"}</span>
          </div>
        ) : null}
      </div>

      {localError ? <p className="rounded-md bg-rose-500/12 px-2 py-1.5 font-mono text-[10px] text-rose-200">{localError}</p> : null}

      <button
        type="button"
        disabled={isSubmitting}
        onClick={() => void submit()}
        className={cn(
          "flex h-11 w-full items-center justify-center rounded-full font-mono text-xs font-bold transition-opacity",
          side === "buy" ? "bg-[#B7F500] text-black hover:opacity-95" : "bg-fuchsia-500 text-white hover:opacity-95",
          isSubmitting && "cursor-wait opacity-70",
        )}
      >
        {isSubmitting ? "Отправка…" : side === "buy" ? "Купить UNT" : "Продать UNT"}
      </button>
      <p className="text-center font-mono text-[9px] leading-relaxed text-zinc-600">{caption}</p>
    </div>
  );
}
