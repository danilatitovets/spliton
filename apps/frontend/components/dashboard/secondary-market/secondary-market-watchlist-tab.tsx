"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Star, X } from "lucide-react";

import { secondaryMarketBookHref, secondaryMarketHref } from "@/constants/dashboard/secondary-market";
import { analyticsReleaseDetailPath, secondaryMarketReleaseAnalyticsPath } from "@/constants/routes";
import { getSecondaryMarketAnalyticsCatalogIdForReleaseSlug } from "@/mocks/dashboard/secondary-market-listings.mock";
import { cn } from "@/lib/utils";
import { ExchangeNeonSparkline } from "@/components/shared/charts/exchange-neon-sparkline";

type Liquidity = "high" | "med" | "low";

type WatchlistItem = {
  id: string;
  /** Если null — отдельного стакана нет, ведём на таб «Рынок». */
  bookMarketId: string | null;
  symbol: string;
  track: string;
  artist: string;
  releaseId: string;
  pricePerUnit: number;
  change24hPct: number;
  listingsCount: number;
  unitsInBook: number;
  deals24h: number;
  liquidity: Liquidity;
  spark: number[];
};

const SEED: WatchlistItem[] = [
  {
    id: "w-mnr",
    bookMarketId: "mnr",
    symbol: "MNR",
    track: "Midnight Run",
    artist: "Nova Lane",
    releaseId: "midnight-run",
    pricePerUnit: 18.5,
    change24hPct: 1.2,
    listingsCount: 4,
    unitsInBook: 120,
    deals24h: 18,
    liquidity: "high",
    spark: [0.42, 0.44, 0.43, 0.46, 0.48, 0.47, 0.49, 0.5, 0.51, 0.5],
  },
  {
    id: "w-sgn",
    bookMarketId: "sgn",
    symbol: "SGN",
    track: "Signal / Noise",
    artist: "Kairo",
    releaseId: "signal-noise",
    pricePerUnit: 22.1,
    change24hPct: -0.4,
    listingsCount: 3,
    unitsInBook: 40,
    deals24h: 9,
    liquidity: "high",
    spark: [0.35, 0.38, 0.4, 0.42, 0.45, 0.48, 0.5, 0.52, 0.51, 0.53],
  },
  {
    id: "w-vlt",
    bookMarketId: "vlt",
    symbol: "VLT",
    track: "Velvet Room",
    artist: "June & Co",
    releaseId: "velvet-room",
    pricePerUnit: 6.85,
    change24hPct: -1.1,
    listingsCount: 1,
    unitsInBook: 43,
    deals24h: 0,
    liquidity: "low",
    spark: [0.55, 0.54, 0.53, 0.52, 0.52, 0.51, 0.5, 0.5, 0.49, 0.48],
  },
  {
    id: "w-gls",
    bookMarketId: null,
    symbol: "GLS",
    track: "Glassline",
    artist: "The Static",
    releaseId: "glassline",
    pricePerUnit: 9.05,
    change24hPct: 0.2,
    listingsCount: 2,
    unitsInBook: 80,
    deals24h: 3,
    liquidity: "med",
    spark: [0.5, 0.51, 0.5, 0.52, 0.51, 0.53, 0.52, 0.53, 0.52, 0.54],
  },
];

const FILTER_CHIPS = [
  { id: "all" as const, label: "Все" },
  { id: "liquid" as const, label: "Ликвидные" },
  { id: "active" as const, label: "Сделки 24ч" },
] as const;

const SORT_OPTIONS = [
  { id: "name" as const, label: "Название" },
  { id: "change" as const, label: "24ч %" },
  { id: "activity" as const, label: "Активность" },
] as const;

function formatUsdt(n: number) {
  return n.toLocaleString("ru-RU", {
    minimumFractionDigits: n % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

function WatchlistMiniSparkline({ values, positive }: { values: number[]; positive: boolean }) {
  if (values.length < 2) return null;
  return (
    <ExchangeNeonSparkline
      values={values}
      trend={positive ? "up" : "down"}
      width={72}
      height={22}
      detailSegments={4}
    />
  );
}

function CoverThumb({ symbol }: { symbol: string }) {
  const hue = symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="size-9 shrink-0 rounded-full"
      style={{
        background: `linear-gradient(145deg, hsl(${hue}, 42%, 28%) 0%, hsl(${(hue + 48) % 360}, 28%, 12%) 100%)`,
      }}
      aria-hidden
    />
  );
}

function liquidityLabel(l: Liquidity) {
  if (l === "high") return "Высок.";
  if (l === "med") return "Средн.";
  return "Низк.";
}

function bookHref(bookMarketId: string | null) {
  if (!bookMarketId) return secondaryMarketHref("market");
  return secondaryMarketBookHref(bookMarketId);
}

export function SecondaryMarketWatchlistTab() {
  const [items, setItems] = React.useState<WatchlistItem[]>(SEED);
  const [filter, setFilter] = React.useState<(typeof FILTER_CHIPS)[number]["id"]>("all");
  const [sort, setSort] = React.useState<(typeof SORT_OPTIONS)[number]["id"]>("activity");
  const [query, setQuery] = React.useState("");

  const remove = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id));

  const filtered = React.useMemo(() => {
    let rows = [...items];
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.symbol.toLowerCase().includes(q) ||
          r.track.toLowerCase().includes(q) ||
          r.artist.toLowerCase().includes(q),
      );
    }
    if (filter === "liquid") rows = rows.filter((r) => r.liquidity === "high");
    if (filter === "active") rows = rows.filter((r) => r.deals24h > 0);
    rows.sort((a, b) => {
      if (sort === "name") return a.track.localeCompare(b.track, "ru");
      if (sort === "change") return b.change24hPct - a.change24hPct;
      return b.deals24h - a.deals24h;
    });
    return rows;
  }, [items, query, filter, sort]);

  const summary = React.useMemo(() => {
    const sumListings = items.reduce((a, x) => a + x.listingsCount, 0);
    const sumDeals = items.reduce((a, x) => a + x.deals24h, 0);
    const hi = items.filter((x) => x.liquidity === "high").length;
    return { n: items.length, sumListings, sumDeals, hi };
  }, [items]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-y-3 border-b border-white/10 pb-4 sm:grid-cols-4 sm:gap-x-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">В списке</p>
          <p className="mt-0.5 font-mono text-lg font-semibold text-white">{summary.n}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Листингов</p>
          <p className="mt-0.5 font-mono text-lg font-semibold text-zinc-200">{summary.sumListings}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Сделок 24ч</p>
          <p className="mt-0.5 font-mono text-lg font-semibold text-[#B7F500]/90">{summary.sumDeals}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Ликвидных</p>
          <p className="mt-0.5 font-mono text-lg font-semibold text-zinc-300">{summary.hi}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTER_CHIPS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilter(c.id)}
              className={cn(
                "rounded-full px-2.5 py-1 font-mono text-[11px] font-medium transition-colors",
                filter === c.id ? "bg-white text-black" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Сортировка</span>
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSort(s.id)}
              className={cn(
                "rounded-full px-2.5 py-1 font-mono text-[11px] font-medium",
                sort === s.id ? "bg-white text-black" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-600" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск"
          className="h-9 w-full rounded-lg bg-[#111111] py-2 pl-10 pr-3 font-mono text-sm text-white placeholder:text-zinc-600 outline-none ring-1 ring-white/10 focus:ring-[#B7F500]/35"
          aria-label="Поиск в избранном"
        />
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-[#111111] py-16 text-center ring-1 ring-white/[0.06]">
          <Star className="mx-auto size-8 text-zinc-700" strokeWidth={1.25} aria-hidden />
          <p className="mt-3 font-mono text-sm text-zinc-500">Список пуст</p>
          <Link
            href={secondaryMarketHref("market")}
            className="mt-4 inline-flex rounded-full bg-white px-4 py-2 font-mono text-xs font-semibold text-black hover:opacity-90"
          >
            К рынку
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-[#111111] py-14 text-center ring-1 ring-white/[0.06]">
          <p className="font-mono text-sm text-zinc-500">Нет совпадений</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
            className="mt-2 font-mono text-[11px] text-zinc-400 underline-offset-2 hover:text-white hover:underline"
          >
            Сбросить
          </button>
        </div>
      ) : (
        <div className="min-w-0 overflow-x-auto rounded-2xl bg-[#111111] ring-1 ring-white/[0.06]">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                <th className="w-10 px-2 py-2 font-normal" aria-label="Удалить" />
                <th className="min-w-[200px] px-2 py-2 font-normal">Трек</th>
                <th className="px-2 py-2 text-right font-normal">Цена / u</th>
                <th className="px-2 py-2 text-right font-normal">24ч</th>
                <th className="hidden px-2 py-2 text-right font-normal md:table-cell">Лоты</th>
                <th className="hidden px-2 py-2 text-right font-normal md:table-cell">U в стакане</th>
                <th className="hidden px-2 py-2 text-right font-normal lg:table-cell">Сделки 24ч</th>
                <th className="hidden px-2 py-2 font-normal lg:table-cell">Ликв.</th>
                <th className="hidden px-2 py-2 font-normal xl:table-cell">Динамика</th>
                <th className="px-2 py-2 text-right font-normal">Действия</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[12px] text-zinc-300">
              {filtered.map((row) => {
                const pos = row.change24hPct >= 0;
                return (
                  <tr key={row.id} className="border-b border-white/[0.05] transition-colors hover:bg-white/[0.02]">
                    <td className="px-2 py-2 align-middle">
                      <button
                        type="button"
                        onClick={() => remove(row.id)}
                        className="flex size-8 items-center justify-center rounded-md text-zinc-600 hover:bg-white/[0.06] hover:text-fuchsia-300"
                        aria-label="Убрать из избранного"
                      >
                        <X className="size-3.5" strokeWidth={2} />
                      </button>
                    </td>
                    <td className="px-2 py-2 align-middle">
                      <div className="flex items-center gap-2.5">
                        <CoverThumb symbol={row.symbol} />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-white">{row.track}</p>
                          <p className="truncate text-[11px] text-zinc-600">
                            {row.artist} · {row.symbol}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-right align-middle tabular-nums text-white">{formatUsdt(row.pricePerUnit)}</td>
                    <td
                      className={cn(
                        "px-2 py-2 text-right align-middle text-xs font-semibold tabular-nums",
                        pos ? "text-[#B7F500]" : "text-fuchsia-300",
                      )}
                    >
                      {pos ? "+" : ""}
                      {row.change24hPct.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%
                    </td>
                    <td className="hidden px-2 py-2 text-right align-middle tabular-nums md:table-cell">{row.listingsCount}</td>
                    <td className="hidden px-2 py-2 text-right align-middle tabular-nums md:table-cell">{row.unitsInBook}</td>
                    <td className="hidden px-2 py-2 text-right align-middle tabular-nums lg:table-cell">{row.deals24h}</td>
                    <td className="hidden px-2 py-2 align-middle lg:table-cell">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          row.liquidity === "high" && "bg-[#B7F500]/12 text-[#d4f570]",
                          row.liquidity === "med" && "bg-zinc-500/15 text-zinc-400",
                          row.liquidity === "low" && "bg-amber-500/12 text-amber-200/90",
                        )}
                      >
                        {liquidityLabel(row.liquidity)}
                      </span>
                    </td>
                    <td className="hidden px-2 py-2 align-middle xl:table-cell">
                      <WatchlistMiniSparkline values={row.spark} positive={pos} />
                    </td>
                    <td className="px-2 py-2 text-right align-middle">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <Link
                          href={bookHref(row.bookMarketId)}
                          className="inline-flex rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:border-white/25 hover:text-white"
                        >
                          {row.bookMarketId ? "Стакан" : "Рынок"}
                        </Link>
                        <Link
                          href={secondaryMarketReleaseAnalyticsPath(row.releaseId)}
                          scroll={false}
                          className="inline-flex rounded-full border border-white/12 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:border-white/22 hover:text-white"
                        >
                          Аналитика
                        </Link>
                        <Link
                          href={`${analyticsReleaseDetailPath(getSecondaryMarketAnalyticsCatalogIdForReleaseSlug(row.releaseId))}?from=catalog`}
                          className="inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-black hover:opacity-90"
                        >
                          Релиз
                        </Link>
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
  );
}
