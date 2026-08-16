"use client";

import { cn } from "@/lib/utils";

export type ExchangeBookLevel = {
  price: number;
  qty: number;
  total: number;
};

function formatPrice(n: number, locale: string) {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatQty(n: number, locale: string) {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : locale, {
    maximumFractionDigits: 2,
  }).format(n);
}

/** Synthetic depth around mid for exchange-style preview when live book is absent. */
export function buildSyntheticOrderBook(mid: number, levels = 8): {
  asks: ExchangeBookLevel[];
  bids: ExchangeBookLevel[];
} {
  const step = Math.max(mid * 0.0045, 0.08);
  const asks: ExchangeBookLevel[] = [];
  const bids: ExchangeBookLevel[] = [];
  let askTotal = 0;
  let bidTotal = 0;
  for (let i = levels; i >= 1; i--) {
    const qty = 12 + i * 7.4 + ((i * 13) % 9);
    askTotal += qty;
    asks.push({ price: mid + step * i, qty, total: askTotal });
  }
  for (let i = 1; i <= levels; i++) {
    const qty = 10 + i * 6.8 + ((i * 11) % 8);
    bidTotal += qty;
    bids.push({ price: mid - step * i, qty, total: bidTotal });
  }
  return { asks, bids };
}

export function ReleaseDetailOrderBook({
  midPrice,
  locale,
  labels,
  className,
}: {
  midPrice: number;
  locale: string;
  labels: {
    title: string;
    price: string;
    qty: string;
    total: string;
  };
  className?: string;
}) {
  const { asks, bids } = buildSyntheticOrderBook(midPrice);
  const maxTotal = Math.max(
    asks[0]?.total ?? 1,
    bids[bids.length - 1]?.total ?? 1,
    1,
  );

  return (
    <section
      className={cn(
        "flex h-full min-h-0 flex-col border-white/[0.06] bg-[#0b0e11]",
        className,
      )}
      aria-label={labels.title}
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <p className="text-[14px] font-semibold tracking-tight text-white">{labels.title}</p>
      </div>
      <div className="grid grid-cols-3 gap-1 px-4 py-2 text-[11px] font-medium text-white/40">
        <span>{labels.price}</span>
        <span className="text-right">{labels.qty}</span>
        <span className="text-right">{labels.total}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <ul className="space-y-px px-1">
          {asks.map((row) => (
            <li key={`a-${row.price}`} className="relative grid grid-cols-3 gap-1 px-3 py-1 text-[12px] tabular-nums sm:text-[13px]">
              <span
                className="pointer-events-none absolute inset-y-0 right-0 bg-[#ef4444]/[0.12]"
                style={{ width: `${(row.total / maxTotal) * 100}%` }}
                aria-hidden
              />
              <span className="relative z-[1] font-mono text-[#ef4444]">{formatPrice(row.price, locale)}</span>
              <span className="relative z-[1] text-right font-mono text-white/80">{formatQty(row.qty, locale)}</span>
              <span className="relative z-[1] text-right font-mono text-white/45">{formatQty(row.total, locale)}</span>
            </li>
          ))}
        </ul>

        <div className="my-1 border-y border-white/[0.06] px-4 py-3">
          <p
            className={cn(
              "font-mono text-[1.25rem] font-semibold tabular-nums sm:text-[1.4rem]",
              "text-[#B7F500]",
            )}
          >
            {formatPrice(midPrice, locale)}
            <span className="ml-1.5 text-[13px] font-medium text-white/40">USDT</span>
          </p>
        </div>

        <ul className="space-y-px px-1">
          {bids.map((row) => (
            <li key={`b-${row.price}`} className="relative grid grid-cols-3 gap-1 px-3 py-1 text-[12px] tabular-nums sm:text-[13px]">
              <span
                className="pointer-events-none absolute inset-y-0 right-0 bg-[#B7F500]/[0.12]"
                style={{ width: `${(row.total / maxTotal) * 100}%` }}
                aria-hidden
              />
              <span className="relative z-[1] font-mono text-[#B7F500]">{formatPrice(row.price, locale)}</span>
              <span className="relative z-[1] text-right font-mono text-white/80">{formatQty(row.qty, locale)}</span>
              <span className="relative z-[1] text-right font-mono text-white/45">{formatQty(row.total, locale)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
