"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { CheckCircle2, X } from "lucide-react";

import { formatUsdtFixedRu, formatUnitsCompact } from "@/lib/market-overview/format";
import { getPrimaryUnitPriceUsdt, roundUsdt2 } from "@/lib/market-overview/pricing";
import { cn } from "@/lib/utils";
import type { MarketOverviewRow } from "@/types/market-overview";

const FIELD_BOX = cn(
  "rounded-2xl bg-neutral-50 px-4 py-3.5 transition-[background-color,box-shadow]",
  "focus-within:bg-white focus-within:shadow-[0_6px_28px_-12px_rgba(0,0,0,0.08)]",
);

const BIG_INPUT =
  "min-w-0 w-full max-w-[220px] border-0 bg-transparent p-0 text-[26px] font-semibold tabular-nums tracking-tight text-neutral-950 outline-none ring-0 md:max-w-[260px] md:text-[30px]";

type Props = {
  row: MarketOverviewRow;
  heldUnits: number;
  /** Куда вести за «стакан» / торговлю: стакан инструмента или вкладка «Рынок». */
  secondaryTradeHref: string;
};

export function AssetsSellUnitsOrderPanel({ row, heldUnits, secondaryTradeHref }: Props) {
  const primaryRef = getPrimaryUnitPriceUsdt(row);
  const suggestedAsk = useMemo(() => roundUsdt2(primaryRef * 1.015), [primaryRef]);
  const [unitPrice, setUnitPrice] = useState(suggestedAsk);
  const [qty, setQty] = useState(() => Math.min(heldUnits, Math.max(1, Math.floor(heldUnits * 0.1) || 1)));

  const clampedQty = Math.min(Math.max(1, qty), heldUnits);
  const totalUsdt = roundUsdt2(unitPrice * clampedQty);
  /** Макет: комиссия платформы от номинала сделки. */
  const feeRateMock = 0.002;
  const feeUsdt = roundUsdt2(totalUsdt * feeRateMock);
  const netReceiveUsdt = roundUsdt2(Math.max(0, totalUsdt - feeUsdt));
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.12)] ring-1 ring-neutral-100 md:p-7">
      <div className="mb-5 rounded-2xl bg-neutral-50 px-3.5 py-3 ring-1 ring-neutral-100/80">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Ордер на продажу</p>
        <p className="mt-1 truncate text-[15px] font-semibold text-neutral-950">{row.title}</p>
        <p className="mt-0.5 truncate text-[12px] text-neutral-600">{row.artist}</p>
        <p className="mt-2 font-mono text-[13px] tabular-nums text-neutral-800">
          <span className="text-neutral-500">Символ</span> {row.symbol}
          <span className="mx-2 text-neutral-300" aria-hidden>
            ·
          </span>
          <span className="text-neutral-500">В кабинете</span> {formatUnitsCompact(heldUnits)} units
        </p>
        <p className="mt-1.5 text-[11px] leading-snug text-neutral-500">
          Ориентир по первичному прайсу релиза:{" "}
          <span className="font-mono text-neutral-700">{formatUsdtFixedRu(primaryRef)} USDT</span> / unit. Лимит на
          secondary вы задаёте сами (мок).
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setUnitPrice(suggestedAsk)}
          className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-neutral-800 transition hover:bg-neutral-50"
        >
          Подставить ориентир {formatUsdtFixedRu(suggestedAsk)} USDT/unit
        </button>
      </div>

      <div className={FIELD_BOX}>
        <p className="text-[12px] font-medium text-neutral-500">Цена (USDT за 1 unit, лимит)</p>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <input
            type="number"
            inputMode="decimal"
            min={0.01}
            step={0.01}
            value={unitPrice}
            onChange={(e) => {
              const n = Number.parseFloat(e.target.value);
              if (!Number.isFinite(n) || n <= 0) return;
              setUnitPrice(roundUsdt2(n));
            }}
            className={BIG_INPUT}
            aria-label="Цена в USDT за один unit"
          />
          <span className="shrink-0 rounded-xl bg-neutral-100/90 px-2.5 py-1.5 text-[12px] font-semibold text-neutral-800">
            USDT
          </span>
        </div>
      </div>

      <div className="my-4 flex justify-center" aria-hidden>
        <div className="h-px w-12 rounded-full bg-neutral-200" />
      </div>

      <div className={FIELD_BOX}>
        <p className="text-[12px] font-medium text-neutral-500">Количество (units к продаже)</p>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={heldUnits}
            value={qty}
            onChange={(e) => {
              const n = Number.parseInt(e.target.value, 10);
              if (Number.isNaN(n)) {
                setQty(1);
                return;
              }
              setQty(Math.min(Math.max(1, n), heldUnits));
            }}
            className={cn(
              BIG_INPUT,
              "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            )}
            aria-label="Количество units к продаже"
          />
          <span className="shrink-0 rounded-xl bg-neutral-100/90 px-2.5 py-1.5 text-[12px] font-semibold text-neutral-800">
            units
          </span>
        </div>
        <p className="mt-2 text-[11px] text-neutral-500">
          Максимум по позиции: <span className="font-mono text-neutral-700">{formatUnitsCompact(heldUnits)}</span>{" "}
          units.
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-neutral-200 bg-white px-4 py-4 ring-1 ring-neutral-100">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Сводка заявки</p>
        <dl className="mt-3 space-y-2.5 font-mono text-[13px] tabular-nums">
          <div className="flex items-baseline justify-between gap-3 border-b border-neutral-100 pb-2">
            <dt className="text-[12px] font-sans font-medium text-neutral-600">Цена</dt>
            <dd className="text-right text-neutral-950">{formatUsdtFixedRu(unitPrice)} USDT / unit</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-neutral-100 pb-2">
            <dt className="text-[12px] font-sans font-medium text-neutral-600">Количество</dt>
            <dd className="text-right text-neutral-950">{clampedQty.toLocaleString("ru-RU")} units</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-neutral-100 pb-2">
            <dt className="text-[12px] font-sans font-medium text-neutral-600">Итого</dt>
            <dd className="text-right font-semibold text-neutral-950">{formatUsdtFixedRu(totalUsdt)} USDT</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-neutral-100 pb-2">
            <dt className="min-w-0 text-[12px] font-sans font-medium text-neutral-600">
              Комиссия
              <span className="mt-0.5 block font-mono text-[10px] font-normal normal-case text-neutral-400">
                платформа, макет {(feeRateMock * 100).toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%
              </span>
            </dt>
            <dd className="text-right text-neutral-800">−{formatUsdtFixedRu(feeUsdt)} USDT</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 pt-0.5">
            <dt className="text-[12px] font-sans font-semibold text-neutral-800">К получению (нетто)</dt>
            <dd className="text-right text-lg font-semibold text-neutral-950">{formatUsdtFixedRu(netReceiveUsdt)} USDT</dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-3">
            <dt className="text-[12px] font-sans font-medium text-neutral-600">Статус заявки</dt>
            <dd>
              <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-700">
                Черновик (макет)
              </span>
            </dd>
          </div>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <dt className="text-[12px] font-sans font-medium text-neutral-600">Срок действия</dt>
            <dd className="max-w-[18ch] text-right text-[12px] font-normal leading-snug text-neutral-700">
              GTC — до отмены. Для лимитных заявок на вторичке в продукте можно включить срок (например, 30 дней).
            </dd>
          </div>
        </dl>
        <p className="mt-3 border-t border-neutral-100 pt-3 text-[11px] leading-snug text-neutral-500">
          Сеть и фактическое исполнение не моделируются. Нетто — после вычета комиссии макета; итог при частичном
          исполнении пересчитается.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setIsConfirmOpen(true)}
        className="mt-6 h-12 w-full rounded-2xl bg-neutral-900 text-[14px] font-semibold text-white transition hover:bg-neutral-800"
      >
        Выставить лимит · {row.symbol}
      </button>
      <p className="mt-2.5 text-center text-[11px] leading-snug text-neutral-500">
        Макет RevShare: заявки на вторичный рынок не отправляются. Для стакана и истории смотрите{" "}
        <Link
          href={secondaryTradeHref}
          className="font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-800"
        >
          вторичный рынок
        </Link>
        .
      </p>

      <Dialog.Root open={isConfirmOpen} onOpenChange={setIsConfirmOpen} modal>
        <Dialog.Portal>
          <Dialog.Backdrop
            className={cn(
              "fixed inset-0 z-120 bg-black/60 backdrop-blur-[2px]",
              "transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
            )}
          />
          <Dialog.Popup
            className={cn(
              "fixed left-1/2 top-1/2 z-121 w-[min(100vw-1.5rem,460px)] -translate-x-1/2 -translate-y-1/2",
              "rounded-2xl bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.3)] ring-1 ring-black/5 md:p-6",
              "transition-[opacity,transform] duration-200",
              "data-ending-style:scale-[0.98] data-ending-style:opacity-0",
              "data-starting-style:scale-[0.98] data-starting-style:opacity-0",
            )}
          >
            <Dialog.Close
              aria-label="Закрыть"
              className="absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
            >
              <X className="size-4" />
            </Dialog.Close>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
              <div className="min-w-0">
                <Dialog.Title className="text-[18px] font-semibold tracking-tight text-zinc-950">
                  Заявка на продажу создана
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-[13px] leading-relaxed text-zinc-600">
                  Лимитная заявка добавлена в mock-очередь. Откройте «Мои ордера» на вторичном рынке, чтобы посмотреть
                  статус и управление.
                </Dialog.Description>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-zinc-50 px-4 py-3.5">
              <dl className="space-y-2.5 font-mono text-[13px]">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="font-sans text-[12px] text-zinc-500">Релиз</dt>
                  <dd className="text-right text-zinc-900">{row.symbol}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="font-sans text-[12px] text-zinc-500">Количество</dt>
                  <dd className="text-right text-zinc-900">{clampedQty.toLocaleString("ru-RU")} units</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="font-sans text-[12px] text-zinc-500">Цена</dt>
                  <dd className="text-right text-zinc-900">{formatUsdtFixedRu(unitPrice)} USDT</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="font-sans text-[12px] font-semibold text-zinc-700">К получению (нетто)</dt>
                  <dd className="text-right font-semibold text-zinc-950">{formatUsdtFixedRu(netReceiveUsdt)} USDT</dd>
                </div>
              </dl>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Dialog.Close className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 px-4 text-[13px] font-semibold text-zinc-700 transition hover:bg-zinc-50">
                Ок
              </Dialog.Close>
              <Link
                href={secondaryTradeHref}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-[13px] font-semibold text-white transition hover:bg-zinc-800"
              >
                К моим ордерам
              </Link>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
