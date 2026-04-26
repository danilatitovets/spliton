"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Image from "next/image";

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

/** Поля суммы / UNT — без рамки, только лёгкий фон и мягкий «край» при фокусе (как в референсе). */
const FIELD_BOX = cn(
  "rounded-2xl bg-[#f5f5f6] px-4 py-3.5 transition-[background-color,box-shadow]",
  "focus-within:bg-white focus-within:shadow-[0_6px_28px_-12px_rgba(0,0,0,0.08)]",
);

const PAY_INPUT_CLASS =
  "min-w-0 w-full max-w-[220px] border-0 bg-transparent p-0 text-[28px] font-semibold tabular-nums tracking-tight text-zinc-950 outline-none ring-0 md:max-w-[260px] md:text-[32px]";

/** Иконка USDT (Tether): #26A17B и белый знак как у официального логотипа. */
function UsdtMark() {
  return (
    <svg viewBox="0 0 28 28" className="size-7 shrink-0 overflow-hidden rounded-full" aria-hidden>
      <circle cx="14" cy="14" r="14" fill="#26A17B" />
      <path
        fill="#fff"
        d="M7.75 10.35h12.5v2.05H7.75v-2.05zm4.9 2.05h2.7v8.35h-2.7v-8.35z"
      />
    </svg>
  );
}

function UntMark() {
  return (
    <span className="relative flex size-7 shrink-0 overflow-hidden rounded-full bg-white">
      <Image src="/images/urrency/units.png" alt="" fill className="object-contain p-0.5" sizes="28px" />
    </span>
  );
}

function AssetSelectorPill({ icon, symbol }: { icon: ReactNode; symbol: string }) {
  return (
    <div
      className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#ebebeb] px-2.5 font-semibold text-zinc-950"
      role="presentation"
    >
      {icon}
      <span className="text-[13px] tracking-tight">{symbol}</span>
    </div>
  );
}

export function CatalogBuyUnitsOrderPanel({ row }: { row: MarketOverviewRow }) {
  const maxUnits = Math.floor(row.availableUnits);
  const unitPrice = getPrimaryUnitPriceUsdt(row);
  const [qty, setQty] = useState(1);
  /** Пока не null — редактируется сумма оплаты; иначе показываем расчёт от qty. */
  const [payBuf, setPayBuf] = useState<string | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [receipt, setReceipt] = useState<BuyUnitsPaymentReceipt | null>(null);

  if (maxUnits < 1) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] md:p-8">
        <p className="text-[15px] leading-relaxed text-zinc-600">
          По релизу «{row.title}» сейчас нет доступных UNT для первичной покупки в макете каталога (
          <span className="font-mono text-zinc-800">available_units = 0</span>). Прайс первичного раунда в данных релиза:{" "}
          <span className="font-mono font-medium text-zinc-900">{formatUsdtFixedRu(unitPrice)}</span> за 1 UNT.
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

  const minPay = formatUsdtFixedRu(unitPrice);
  const maxPay = formatUsdtFixedRu(unitPrice * maxUnits);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] md:p-7">
      <div className={FIELD_BOX}>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-zinc-500">Вы платите</p>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              className={cn(PAY_INPUT_CLASS, "mt-1 block w-full max-w-none")}
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
              aria-label="Сумма к оплате в USDT"
            />
          </div>
          <AssetSelectorPill icon={<UsdtMark />} symbol="USDT" />
        </div>
        <p className="mt-2 text-[11px] leading-snug text-zinc-400">
          {minPay} — {maxPay} USDT
        </p>
      </div>

      <p className="mt-3 text-center text-[11px] leading-snug text-zinc-500">
        Примерная цена: 1 UNT = {formatUsdtFixedRu(unitPrice)} USDT
      </p>

      <div className="mt-3">
        <div className={FIELD_BOX}>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-zinc-500">Вы получаете</p>
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
                className="mt-1 block min-w-0 w-full max-w-none border-0 bg-transparent p-0 text-[28px] font-semibold tabular-nums tracking-tight text-zinc-950 outline-none ring-0 [appearance:textfield] md:text-[32px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                aria-label="Количество UNT"
              />
            </div>
            <AssetSelectorPill icon={<UntMark />} symbol="UNT" />
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">
            Доступно к покупке: <span className="font-mono text-zinc-700">{formatUnitsCompact(maxUnits)}</span> UNT.
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
