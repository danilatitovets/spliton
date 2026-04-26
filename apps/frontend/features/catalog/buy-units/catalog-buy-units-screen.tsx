import Link from "next/link";
import { FileText } from "lucide-react";

import { ROUTES, catalogMarketOverviewReleaseAnalyticsPath } from "@/constants/routes";
import { formatUnitsCompact, formatUsdtFixedRu } from "@/lib/market-overview/format";
import { getPrimaryUnitPriceUsdt } from "@/lib/market-overview/pricing";
import type { MarketOverviewRow } from "@/types/market-overview";

import { CatalogBuyUnitsOrderPanel } from "./catalog-buy-units-order-panel";

export function CatalogBuyUnitsScreen({ row }: { row: MarketOverviewRow }) {
  const unitPrice = getPrimaryUnitPriceUsdt(row);
  const maxUnits = Math.max(0, Math.floor(row.availableUnits));
  const minOrderUsdt = unitPrice;
  const maxOrderUsdt = unitPrice * maxUnits;

  return (
    <div className="min-h-0 bg-white text-zinc-950 antialiased">
      <div className="sticky top-0 z-50 bg-white/95 py-3.5 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.06)] backdrop-blur-md supports-backdrop-filter:bg-white/88 md:py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
          <span className="text-[14px] font-semibold tracking-tight text-zinc-900">Покупка UNT</span>
          <Link
            href={ROUTES.dashboardActivity}
            className="inline-flex items-center gap-2 text-[13px] font-medium text-zinc-700 transition-colors hover:text-zinc-950"
          >
            <FileText className="size-4 shrink-0 text-zinc-500" strokeWidth={1.75} aria-hidden />
            История ордеров
          </Link>
        </div>
      </div>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
          <nav className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-medium text-zinc-500">
            <Link href={ROUTES.catalogMarketOverview} className="transition-colors hover:text-zinc-900">
              Обзор рынка
            </Link>
            <span className="text-zinc-300" aria-hidden>
              /
            </span>
            <Link
              href={catalogMarketOverviewReleaseAnalyticsPath(row.id)}
              className="transition-colors hover:text-zinc-900"
            >
              Аналитика релиза
            </Link>
          </nav>

          <h1 className="text-[1.9rem] font-bold leading-[1.1] tracking-tight text-zinc-950 md:text-[2.3rem]">
            Купить UNT
          </h1>
          <p className="mt-2 text-[15px] text-zinc-600 md:text-[16px]">
            «{row.title}» · {row.artist}
          </p>
          <p className="mt-3 text-[14px] md:text-[15px]">
            <Link
              href={ROUTES.assetsUnt}
              className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition-colors hover:text-zinc-700 hover:decoration-zinc-500"
            >
              Что такое UNT?
            </Link>
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.25fr)] md:items-start">
            <aside className="rounded-3xl bg-zinc-100/70 p-5 md:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">О UNT релиза</p>
              <h2 className="mt-2 text-[22px] font-bold tracking-tight text-zinc-950">{row.symbol}</h2>

              <dl className="mt-5 space-y-4 text-[13px]">
                <div>
                  <dt className="text-zinc-500">Цена за 1 UNT</dt>
                  <dd className="mt-0.5 font-mono text-[16px] font-semibold text-zinc-900">
                    {formatUsdtFixedRu(unitPrice)}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Доступно UNT</dt>
                  <dd className="mt-0.5 font-mono text-[16px] font-semibold text-zinc-900">
                    {formatUnitsCompact(row.availableUnits)}
                  </dd>
                </div>
              </dl>

              <div className="mt-7 rounded-2xl bg-white/85 px-4 py-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Условия покупки</p>
                <dl className="mt-3 space-y-2.5 text-[13px]">
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-zinc-500">В продаже сейчас</dt>
                    <dd className="font-mono font-semibold text-zinc-900">{formatUnitsCompact(maxUnits)} UNT</dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-zinc-500">Максимум в 1 покупке</dt>
                    <dd className="font-mono font-semibold text-zinc-900">{formatUnitsCompact(maxUnits)} UNT</dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-zinc-500">Минимум</dt>
                    <dd className="font-mono font-semibold text-zinc-900">1 UNT</dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-zinc-500">Сумма покупки</dt>
                    <dd className="text-right font-mono font-semibold text-zinc-900">
                      {formatUsdtFixedRu(minOrderUsdt)} — {formatUsdtFixedRu(maxOrderUsdt)}
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>

            <div>
              <CatalogBuyUnitsOrderPanel row={row} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
