"use client";

import { useState } from "react";

import { formatUsdtFixedRu, formatUnitsCompact } from "@/lib/market-overview/format";
import {
  getPrimaryUnitPriceUsdt,
  parseRuMoneyInput,
  primaryOrderTotalUsdt,
  unitsFromUsdtBudget,
} from "@/lib/market-overview/pricing";
import { cn } from "@/lib/utils";
import type { MarketOverviewRow } from "@/types/market-overview";
import {
  BuyUnitsPaymentResultModal,
  type BuyUnitsPaymentReceipt,
} from "./buy-units-payment-result-modal";

/** Поля суммы / units — без рамки, только лёгкий фон и мягкий «край» при фокусе (как в референсе). */
const FIELD_BOX = cn(
  "rounded-2xl bg-[#f5f5f6] px-4 py-3.5 transition-[background-color,box-shadow]",
  "focus-within:bg-white focus-within:shadow-[0_6px_28px_-12px_rgba(0,0,0,0.08)]",
);

const PAY_INPUT_CLASS =
  "min-w-0 w-full max-w-[220px] border-0 bg-transparent p-0 text-[28px] font-semibold tabular-nums tracking-tight text-zinc-950 outline-none ring-0 md:max-w-[260px] md:text-[32px]";

export function CatalogBuyUnitsOrderPanel({ row }: { row: MarketOverviewRow }) {
  const maxUnits = Math.floor(row.availableUnits);
  const unitPrice = getPrimaryUnitPriceUsdt(row);
  const [qty, setQty] = useState(1);
  /** Пока не null — редактируется сумма USDT; иначе показываем расчёт от qty. */
  const [payBuf, setPayBuf] = useState<string | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [receipt, setReceipt] = useState<BuyUnitsPaymentReceipt | null>(null);

  if (maxUnits < 1) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] md:p-8">
        <p className="text-[15px] leading-relaxed text-zinc-600">
          По релизу «{row.title}» сейчас нет доступных units для первичной покупки в макете каталога (
          <span className="font-mono text-zinc-800">available_units = 0</span>). Прайс первичного раунда в данных релиза:{" "}
          <span className="font-mono font-medium text-zinc-900">{formatUsdtFixedRu(unitPrice)} USDT</span> за 1 unit.
        </p>
      </div>
    );
  }

  const clampedQty = Math.min(Math.max(1, qty), maxUnits);
  const totalUsdt = primaryOrderTotalUsdt(row, clampedQty);
  const payShown = payBuf !== null ? payBuf : formatUsdtFixedRu(totalUsdt);

  const handlePay = () => {
    const status: BuyUnitsPaymentReceipt["status"] = Math.random() < 0.75 ? "approved" : "declined";
    const txSuffix = Math.random().toString(36).slice(2, 8).toUpperCase();

    setReceipt({
      releaseTitle: row.title,
      artist: row.artist,
      symbol: row.symbol,
      releaseId: row.id,
      units: clampedQty,
      unitPriceUsdt: unitPrice,
      totalUsdt,
      paidAtIso: new Date().toISOString(),
      transactionId: `TX-${row.id}-${txSuffix}`,
      status,
    });
    setIsResultOpen(true);
  };

  return (
    <div className="rounded-3xl bg-white p-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] md:p-7">
      <div className={FIELD_BOX}>
        <p className="text-[12px] font-medium text-zinc-500">Вы заплатите</p>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            className={PAY_INPUT_CLASS}
            value={payShown}
            onFocus={() => setPayBuf(formatUsdtFixedRu(totalUsdt))}
            onChange={(e) => setPayBuf(e.target.value)}
            onBlur={() => {
              const parsed = parseRuMoneyInput(payBuf ?? "");
              if (parsed !== null) {
                setQty(unitsFromUsdtBudget(unitPrice, parsed, maxUnits));
              }
              setPayBuf(null);
            }}
            aria-label="Сумма в USDT"
          />
          <span className="shrink-0 rounded-xl bg-zinc-100/90 px-2.5 py-1.5 text-[12px] font-semibold text-zinc-800">
            USDT
          </span>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-zinc-500">
          Цена фиксирована для этого релиза: <span className="font-mono text-zinc-700">{formatUsdtFixedRu(unitPrice)} USDT</span>{" "}
          за 1 unit. Сумма автоматически пересчитывается по формуле{" "}
          <span className="font-mono text-zinc-700">units × price</span>.
        </p>
      </div>

      <div className="mt-4">
        <div className={FIELD_BOX}>
          <p className="text-[12px] font-medium text-zinc-500">Вы получите</p>
          <div className="mt-1 flex items-baseline justify-between gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={maxUnits}
              value={qty}
              onChange={(e) => {
                setPayBuf(null);
                const n = Number.parseInt(e.target.value, 10);
                if (Number.isNaN(n)) {
                  setQty(1);
                  return;
                }
                setQty(Math.min(Math.max(1, n), maxUnits));
              }}
              className="min-w-0 w-full max-w-[200px] border-0 bg-transparent p-0 text-[28px] font-semibold tabular-nums tracking-tight text-zinc-950 outline-none ring-0 [appearance:textfield] md:max-w-[240px] md:text-[32px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              aria-label="Количество units"
            />
            <span className="shrink-0 rounded-xl bg-zinc-100/90 px-2.5 py-1.5 text-[12px] font-semibold text-zinc-800">
              units
            </span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">
            Доступно к покупке: <span className="font-mono text-zinc-700">{formatUnitsCompact(maxUnits)}</span> units.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setPayBuf(null);
                setQty(Math.max(1, Math.floor(maxUnits * 0.25)));
              }}
              className="rounded-full border border-zinc-200 px-3 py-1 text-[11px] font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
              25%
            </button>
            <button
              type="button"
              onClick={() => {
                setPayBuf(null);
                setQty(Math.max(1, Math.floor(maxUnits * 0.5)));
              }}
              className="rounded-full border border-zinc-200 px-3 py-1 text-[11px] font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => {
                setPayBuf(null);
                setQty(maxUnits);
              }}
              className="rounded-full border border-zinc-200 px-3 py-1 text-[11px] font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
              Max
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handlePay}
        className="mt-5 h-12 w-full rounded-2xl bg-zinc-950 text-[14px] font-semibold text-white transition hover:bg-zinc-900"
      >
        Оплатить
      </button>

      <BuyUnitsPaymentResultModal open={isResultOpen} onOpenChange={setIsResultOpen} receipt={receipt} />
    </div>
  );
}
