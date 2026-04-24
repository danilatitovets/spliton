"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Filter, Search, Star } from "lucide-react";

import {
  secondaryMarketBookHref,
  secondaryMarketBookIdForSymbol,
  secondaryMarketHref,
} from "@/constants/dashboard/secondary-market";
import type { SecondaryMarketListingMock } from "@/mocks/dashboard/secondary-market-listings.mock";
import { SECONDARY_MARKET_LISTINGS_MOCK } from "@/mocks/dashboard/secondary-market-listings.mock";
import { cn } from "@/lib/utils";
import { ExchangeNeonSparkline } from "@/components/shared/charts/exchange-neon-sparkline";
import { SecondaryMarketListingActionsModal } from "./secondary-market-listing-actions-modal";

type Genre = "all" | SecondaryMarketListingMock["genre"] | "liquid";

const SEGMENT_CHIPS: { id: Genre | "liquid"; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "electronic", label: "Electronic" },
  { id: "pop", label: "Pop" },
  { id: "hiphop", label: "Hip-Hop" },
  { id: "rock", label: "Rock" },
  { id: "liquid", label: "Ликвидные" },
];

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

function MarketTabMiniSparkline({
  values,
  positive,
  className,
}: {
  values: number[];
  positive: boolean;
  className?: string;
}) {
  if (values.length < 2) return <span className="font-mono text-zinc-600">—</span>;
  return (
    <ExchangeNeonSparkline
      values={values}
      trend={positive ? "up" : "down"}
      width={72}
      height={22}
      className={className}
      detailSegments={4}
    />
  );
}

function PriceRangeBar({ low, high, current }: { low: number; high: number; current: number }) {
  const span = high - low || 1;
  const pct = Math.min(100, Math.max(0, ((current - low) / span) * 100));
  return (
    <div className="relative h-1 w-full min-w-[56px] max-w-[88px] rounded-full bg-zinc-800/80">
      <div
        className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
        style={{ left: `${pct}%` }}
      />
    </div>
  );
}

/** Доля доступных units в полоске (визуал «глубины» лота). */
function UnitsDepthBar({ available }: { available: number }) {
  const pct = Math.min(92, 18 + Math.sqrt(available) * 6);
  return (
    <div className="h-1 w-full min-w-[72px] max-w-[120px] overflow-hidden rounded-full bg-zinc-800/90">
      <div className="h-full rounded-full bg-[#B7F500]/75" style={{ width: `${pct}%` }} />
    </div>
  );
}

function CoverThumb({ symbol, size = "md" }: { symbol: string; size?: "sm" | "md" | "lg" }) {
  const hue = symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const sz = size === "lg" ? "size-14" : size === "sm" ? "size-8" : "size-10";
  return (
    <div
      className={cn("shrink-0 rounded-full", sz)}
      style={{
        background: `linear-gradient(145deg, hsl(${hue}, 42%, 28%) 0%, hsl(${(hue + 48) % 360}, 28%, 12%) 100%)`,
      }}
      aria-hidden
    />
  );
}

export function SecondaryMarketMarketTab() {
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = React.useState("");
  const [segment, setSegment] = React.useState<(typeof SEGMENT_CHIPS)[number]["id"]>("all");
  const [favorites, setFavorites] = React.useState<Set<string>>(() => new Set());

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return SECONDARY_MARKET_LISTINGS_MOCK.filter((row) => {
      if (segment === "liquid" && row.liquidity !== "high") return false;
      if (segment !== "all" && segment !== "liquid" && row.genre !== segment) return false;
      if (!q) return true;
      return (
        row.track.toLowerCase().includes(q) ||
        row.artist.toLowerCase().includes(q) ||
        row.symbol.toLowerCase().includes(q)
      );
    });
  }, [query, segment]);

  const featured = SECONDARY_MARKET_LISTINGS_MOCK.filter((l) => l.featured);
  const featuredDeals = featured.reduce((a, r) => a + r.deals7d, 0);

  return (
    <div className="space-y-6">
      {/* Плоская сводка — без карточек и пояснений */}
      <div className="grid grid-cols-2 gap-y-4 border-b border-white/10 pb-5 lg:grid-cols-4 lg:gap-x-8">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Объём · 24ч</p>
          <p className="mt-1 font-mono text-lg font-semibold tracking-tight text-white">184 200</p>
          <p className="font-mono text-[11px] text-zinc-600">USDT</p>
          <p className="mt-0.5 font-mono text-xs text-[#B7F500]">+3,2%</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Активные лоты</p>
          <p className="mt-1 font-mono text-lg font-semibold tracking-tight text-white">48</p>
          <p className="font-mono text-[11px] text-zinc-600">активных</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Выплаты · 30д</p>
          <div className="mt-2">
            <MarketTabMiniSparkline values={[0.4, 0.42, 0.41, 0.45, 0.44, 0.48, 0.52, 0.51, 0.55, 0.58]} positive />
          </div>
        </div>
        <div className="col-span-2 lg:col-span-1">
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Ликвидные лоты</p>
          <p className="mt-1 font-mono text-lg font-semibold tracking-tight text-white">64%</p>
          <p className="font-mono text-[11px] text-zinc-600">рынка</p>
        </div>
      </div>

      {/* Секция «в тренде» — плотные горизонтальные карточки */}
      <section>
        <div className="mb-3 flex w-full items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold tracking-tight text-white">В тренде</h2>
          <span className="flex items-center gap-0.5 font-mono text-[11px] text-zinc-500">
            {featuredDeals} сделок / 7д
            <ChevronRight className="size-3.5 text-zinc-600" aria-hidden />
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {featured.map((row) => {
            const pos = row.change7dPct >= 0;
            const bookId = secondaryMarketBookIdForSymbol(row.symbol);
            return (
              <div
                key={row.id}
                className="flex min-w-[min(100%,320px)] shrink-0 gap-4 rounded-2xl bg-[#111111] px-4 py-3.5 sm:min-w-[340px]"
              >
                <CoverThumb symbol={row.symbol} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs font-semibold text-white">{row.symbol}</p>
                      <p className="truncate text-sm font-medium leading-snug text-white">{row.track}</p>
                      <p className="truncate font-mono text-[11px] text-zinc-500">{row.artist}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={cn(
                          "font-mono text-xl font-semibold tabular-nums leading-none tracking-tight",
                          pos ? "text-[#B7F500]" : "text-fuchsia-300",
                        )}
                      >
                        {pos ? "+" : ""}
                        {row.change7dPct.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-zinc-600">7д</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
                    <div className="font-mono text-[11px] text-zinc-500">
                      <span className="text-zinc-400">{formatUsdtCompact(row.listingValueUsdt)} USDT</span>
                      <span className="mx-1.5 text-zinc-700">·</span>
                      <span>{row.deals7d} сделок</span>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                      <SecondaryMarketListingActionsModal
                        listingId={row.id}
                        analyticsCatalogId={row.analyticsCatalogId}
                        symbol={row.symbol}
                        track={row.track}
                        artist={row.artist}
                        bookId={bookId ?? null}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Панель поиска — одна линия */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-600"
            aria-hidden
          />
          <input
            ref={searchInputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск"
            className="h-9 w-full rounded-lg bg-[#111111] py-2 pl-10 pr-3 font-mono text-sm text-white placeholder:text-zinc-600 outline-none ring-1 ring-white/10 focus:ring-[#B7F500]/35"
            aria-label="Поиск"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => searchInputRef.current?.focus()}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#111111] text-zinc-400 ring-1 ring-white/10 hover:text-zinc-200"
            aria-label="Фокус на поиске"
          >
            <Filter className="size-4" />
          </button>
          <div className="flex min-w-0 flex-1 flex-wrap gap-1.5 sm:justify-end">
            {SEGMENT_CHIPS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setSegment(chip.id)}
                className={cn(
                  "rounded-full px-2.5 py-1 font-mono text-[11px] font-medium transition-colors",
                  segment === chip.id
                    ? "bg-white text-black"
                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Таблица — без обводки контейнера, только разделители строк */}
      <div className="min-w-0">
        {filtered.length === 0 ? (
          <div className="py-14 text-center">
            <p className="font-mono text-sm text-zinc-500">Нет совпадений</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSegment("all");
              }}
              className="mt-3 font-mono text-xs text-zinc-400 underline-offset-4 hover:text-white hover:underline"
            >
              Сбросить
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  <th className="w-10 pb-2 pr-1 font-normal" />
                  <th className="min-w-[180px] pb-2 font-normal">Лот</th>
                  <th className="hidden w-[76px] pb-2 font-normal lg:table-cell">30д</th>
                  <th className="hidden w-[72px] pb-2 font-normal lg:table-cell">7д</th>
                  <th className="hidden w-[80px] pb-2 text-right font-normal md:table-cell">Цена</th>
                  <th className="hidden w-[52px] pb-2 text-right font-normal md:table-cell">7д %</th>
                  <th className="hidden w-[88px] pb-2 text-right font-normal lg:table-cell">Лот</th>
                  <th className="hidden w-[44px] pb-2 text-right font-normal md:table-cell">U</th>
                  <th className="hidden w-[104px] pb-2 font-normal lg:table-cell xl:table-cell">Ликв.</th>
                  <th className="w-[104px] pb-2 text-right font-normal" />
                </tr>
              </thead>
              <tbody className="font-mono text-[13px] text-zinc-300">
                {filtered.map((row) => {
                  const pos = row.change7dPct >= 0;
                  const bookId = secondaryMarketBookIdForSymbol(row.symbol);
                  return (
                    <tr key={row.id} className="border-b border-white/5 transition-colors hover:bg-white/2">
                      <td className="py-2.5 pr-1 align-middle">
                        <button
                          type="button"
                          onClick={() => toggleFavorite(row.id)}
                          className="flex size-8 items-center justify-center text-zinc-600 hover:text-[#B7F500]"
                          aria-label={favorites.has(row.id) ? "Убрать из избранного" : "Избранное"}
                        >
                          <Star
                            className={cn("size-3.5", favorites.has(row.id) && "fill-[#B7F500]/20 text-[#B7F500]")}
                            strokeWidth={1.75}
                          />
                        </button>
                      </td>
                      <td className="py-2.5 align-middle">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <CoverThumb symbol={row.symbol} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">{row.track}</p>
                            <p className="truncate text-[11px] text-zinc-600">
                              {row.artist} · {row.symbol}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden py-2.5 align-middle lg:table-cell">
                        <MarketTabMiniSparkline values={row.payoutSparkline} positive={pos} />
                      </td>
                      <td className="hidden py-2.5 align-middle lg:table-cell">
                        <PriceRangeBar low={row.range7dLow} high={row.range7dHigh} current={row.pricePerUnit} />
                      </td>
                      <td className="hidden py-2.5 text-right align-middle tabular-nums text-white md:table-cell">
                        {formatUsdt(row.pricePerUnit)}
                      </td>
                      <td
                        className={cn(
                          "hidden py-2.5 text-right align-middle text-xs tabular-nums md:table-cell",
                          pos ? "text-[#B7F500]" : "text-fuchsia-300",
                        )}
                      >
                        {pos ? "+" : ""}
                        {row.change7dPct.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%
                      </td>
                      <td className="hidden py-2.5 text-right align-middle tabular-nums text-zinc-400 lg:table-cell">
                        {formatUsdtCompact(row.listingValueUsdt)}
                      </td>
                      <td className="hidden py-2.5 text-right align-middle tabular-nums text-zinc-400 md:table-cell">
                        {row.unitsAvailable}
                      </td>
                      <td className="hidden py-2.5 align-middle lg:table-cell xl:table-cell">
                        <UnitsDepthBar available={row.unitsAvailable} />
                      </td>
                      <td className="py-2.5 text-right align-middle">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <SecondaryMarketListingActionsModal
                            listingId={row.id}
                            analyticsCatalogId={row.analyticsCatalogId}
                            symbol={row.symbol}
                            track={row.track}
                            artist={row.artist}
                            bookId={bookId ?? null}
                            compactTrigger
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
