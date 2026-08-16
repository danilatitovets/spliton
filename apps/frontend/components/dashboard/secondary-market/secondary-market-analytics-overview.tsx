"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "@/lib/lucide";

import { AnalyticsHeaderTip } from "@/features/analytics/releases/ui/analytics-header-tip";

import { useI18n } from "@/components/providers/i18n-provider";
import { ReleaseAnalyticsProChart } from "@/features/catalog/market-overview/release-analytics/ui/release-analytics-pro-chart";
import { ExchangeNeonSparkline } from "@/components/shared/charts/exchange-neon-sparkline";
import { secondaryMarketReleaseAnalyticsPath } from "@/constants/routes";
import {
  buildSecondaryMarketAnalyticsOverview,
  EMPTY_ANALYTICS_OVERVIEW,
  type AnalyticsOverviewAggregate,
  type AnalyticsOverviewInstrumentRow,
  type AnalyticsOverviewPeriod,
} from "@/mocks/dashboard/secondary-market-analytics-overview.mock";
import {
  fetchMarketOverviewCharts,
  fetchMarketOverviewList,
  fetchMarketOverviewStats,
  type MarketOverviewChartsApi,
  type MarketOverviewListItemApi,
  type MarketOverviewStatsApi,
} from "@/services/market-overview.service";
import { getWalletDataSource } from "@/services/wallet.service";
import { cn } from "@/lib/utils";
import { smExchange } from "@/components/dashboard/secondary-market/secondary-market-exchange-styles";

const ANALYTICS_HERO_ICON = "/images/secondary-market/analytics-hero.png";

type GenreFilter = "all" | "electronic" | "pop" | "hiphop" | "rock" | "liquid";
type SortId = "volume" | "change" | "spread" | "liquidity" | "name";
type ShareRow = { id: string; label: string; pct: number; count: number; tone?: string };

const PERIODS: AnalyticsOverviewPeriod[] = ["24h", "7d", "30d"];
const INSTRUMENTS_PAGE_SIZE = 20;

const GENRE_CHIPS: { id: GenreFilter; key?: string; label?: string }[] = [
  { id: "all", key: "secondaryMarket.filters.all" },
  { id: "electronic", label: "Electronic" },
  { id: "pop", label: "Pop" },
  { id: "hiphop", label: "Hip-Hop" },
  { id: "rock", label: "Rock" },
  { id: "liquid", key: "secondaryMarket.filters.liquid" },
];

const SORT_CHIPS: { id: SortId; key: string }[] = [
  { id: "volume", key: "secondaryMarket.analyticsOverview.sortVolume" },
  { id: "change", key: "secondaryMarket.analyticsOverview.sortChange" },
  { id: "spread", key: "secondaryMarket.analyticsOverview.sortSpread" },
  { id: "liquidity", key: "secondaryMarket.analyticsOverview.sortLiquidity" },
  { id: "name", key: "secondaryMarket.analyticsOverview.sortName" },
];

const GENRE_TONES = ["bg-white", "bg-white/70", "bg-white/45", "bg-white/25", "bg-zinc-500", "bg-zinc-600"];

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

function num(v: string | number | { toString?: () => string } | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number.parseFloat(String(typeof v === "object" && v.toString ? v.toString() : v));
  return Number.isFinite(n) ? n : 0;
}

function formatMessage(template: string, params: Record<string, string | number>): string {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function liquidityRank(l: "high" | "med" | "low") {
  return l === "high" ? 3 : l === "med" ? 2 : 1;
}

function liquidityLabel(l: "high" | "med" | "low", t: (key: string) => string) {
  if (l === "high") return t("secondaryMarket.kpi.liquidity.high");
  if (l === "med") return t("secondaryMarket.kpi.liquidity.med");
  return t("secondaryMarket.kpi.liquidity.low");
}

function liquidityTone(l: "high" | "med" | "low") {
  if (l === "high") return "bg-[#B7F500]";
  if (l === "med") return "bg-zinc-400";
  return "bg-fuchsia-400";
}

function genreDisplayLabel(raw: string): string {
  const s = raw.trim().toLowerCase();
  if (s.includes("hip")) return "Hip-Hop";
  if (s.includes("electronic") || s.includes("edm")) return "Electronic";
  if (s.includes("pop")) return "Pop";
  if (s.includes("rock")) return "Rock";
  if (s.includes("indie")) return "Indie";
  if (s.includes("lo-fi") || s === "lofi") return "Lo-Fi";
  if (!raw) return "Other";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function genreId(raw: string): string {
  const s = raw.trim().toLowerCase();
  if (s.includes("hip")) return "hiphop";
  if (s.includes("electronic") || s.includes("edm")) return "electronic";
  if (s.includes("pop")) return "pop";
  if (s.includes("rock")) return "rock";
  return s.replace(/\s+/g, "-").slice(0, 24) || "other";
}

function normalizeLiquidityId(label: string): "high" | "med" | "low" | null {
  const s = label.trim().toLowerCase();
  if (s === "high" || s === "deep" || s.includes("высок") || s.includes("deep")) return "high";
  if (s === "med" || s === "mid" || s.includes("средн") || s.includes("mid")) return "med";
  if (s === "low" || s === "thin" || s.includes("низк") || s.includes("thin")) return "low";
  return null;
}

function renormalizePct<T extends { pct: number }>(rows: T[]): T[] {
  if (rows.length === 0) return rows;
  const sum = rows.reduce((s, r) => s + r.pct, 0);
  if (sum === 100 || sum === 0) return rows;
  const scaled = rows.map((r) => ({ ...r, pct: Math.round((r.pct / sum) * 100) }));
  const drift = 100 - scaled.reduce((s, r) => s + r.pct, 0);
  if (drift !== 0 && scaled[0]) scaled[0] = { ...scaled[0], pct: scaled[0].pct + drift };
  return scaled;
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

function StackedShareBar({ rows }: { rows: ShareRow[] }) {
  const visible = rows.filter((r) => r.pct > 0);
  if (visible.length === 0) {
    return <div className="h-2.5 w-full rounded-full bg-white/[0.06]" aria-hidden />;
  }
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
      {visible.map((row) => (
        <div
          key={row.id}
          className={cn("h-full transition-[width] duration-500", row.tone ?? "bg-white/70")}
          style={{ width: `${Math.min(100, Math.max(row.pct, 1))}%` }}
          title={`${row.label} ${row.pct}%`}
        />
      ))}
    </div>
  );
}

function ShareLegend({ rows }: { rows: ShareRow[] }) {
  return (
    <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
      {rows.map((row) => (
        <li key={row.id} className="flex min-w-0 items-center gap-2 text-[12px]">
          <span className={cn("size-2 shrink-0 rounded-full", row.tone ?? "bg-white/70")} aria-hidden />
          <span className="truncate text-zinc-400">{row.label}</span>
          <span
            className={cn(
              "ml-auto font-mono tabular-nums",
              row.pct > 0 ? "text-zinc-200" : "text-zinc-600",
            )}
          >
            {row.pct}%
          </span>
        </li>
      ))}
    </ul>
  );
}

function MarketStructureCard({
  title,
  hint,
  genresLabel,
  liquidityLabel,
  emptyLabel,
  insight,
  genreRows,
  liquidityRows,
}: {
  title: string;
  hint: string;
  genresLabel: string;
  liquidityLabel: string;
  emptyLabel: string;
  insight: string;
  genreRows: ShareRow[];
  liquidityRows: ShareRow[];
}) {
  const hasData = genreRows.some((r) => r.pct > 0) || liquidityRows.some((r) => r.pct > 0);
  return (
    <article className="rounded-2xl bg-white/[0.05] px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-semibold tracking-tight text-white">{title}</h3>
        <span className="shrink-0 font-mono text-[11px] text-zinc-500">{hint}</span>
      </div>

      {!hasData ? (
        <p className="mt-8 text-center text-[13px] text-zinc-500">{emptyLabel}</p>
      ) : (
        <>
          <div className="mt-5">
            <p className="mb-2 text-[13px] font-medium text-zinc-300">{genresLabel}</p>
            <StackedShareBar rows={genreRows} />
            <ShareLegend rows={genreRows} />
          </div>

          <div className="mt-6 border-t border-white/[0.06] pt-5">
            <p className="mb-2 text-[13px] font-medium text-zinc-300">{liquidityLabel}</p>
            <StackedShareBar rows={liquidityRows} />
            <ShareLegend rows={liquidityRows} />
          </div>

          {insight ? (
            <p className="mt-5 border-t border-white/[0.06] pt-4 text-[13px] leading-relaxed text-zinc-300">
              {insight}
            </p>
          ) : null}
        </>
      )}
    </article>
  );
}

function LeadersCard({
  title,
  emptyLabel,
  rows,
}: {
  title: string;
  emptyLabel: string;
  rows: AnalyticsOverviewInstrumentRow[];
}) {
  return (
    <article className="rounded-2xl bg-white/[0.05] px-4 py-4 sm:px-5 sm:py-5">
      <h3 className="text-[15px] font-semibold tracking-tight text-white">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-8 text-center text-[13px] text-zinc-500">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 divide-y divide-white/[0.05]">
          {rows.slice(0, 5).map((row) => {
            const positive = row.changePct >= 0;
            return (
              <li key={row.id}>
                <Link
                  href={secondaryMarketReleaseAnalyticsPath(row.hrefId)}
                  scroll={false}
                  className="flex items-center gap-3 py-3 transition hover:bg-white/[0.02]"
                >
                  <CoverThumb symbol={row.symbol} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-white">{row.symbol}</p>
                    <p className="truncate text-[11px] text-zinc-500">{row.title}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-[13px] font-semibold tabular-nums text-white">
                      {formatUsdt(row.lastPrice)}
                    </p>
                    <p
                      className={cn(
                        "font-mono text-[11px] tabular-nums",
                        positive ? "text-[#B7F500]" : "text-fuchsia-400",
                      )}
                    >
                      {positive ? "+" : ""}
                      {row.changePct.toFixed(2)}%
                    </p>
                  </div>
                  {row.sparkline.length >= 2 ? (
                    <ExchangeNeonSparkline
                      values={row.sparkline}
                      trend={positive ? "up" : "down"}
                      width={56}
                      height={20}
                      detailSegments={3}
                      className="hidden sm:block"
                    />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}

function ChartCard({
  title,
  values,
  emptyLabel,
}: {
  title: string;
  values: number[];
  emptyLabel: string;
}) {
  return (
    <div className="flex min-h-[220px] flex-col rounded-2xl bg-white/[0.05] px-4 pb-2 pt-4">
      <h3 className="text-[14px] font-semibold tracking-tight text-white">{title}</h3>
      <div className="mt-3 min-h-0 flex-1">
        {values.length >= 2 ? (
          <ReleaseAnalyticsProChart values={values} accent="zinc" />
        ) : (
          <p className="mt-10 text-center text-[13px] text-zinc-500">{emptyLabel}</p>
        )}
      </div>
    </div>
  );
}

function mapLiveItem(row: MarketOverviewListItemApi): AnalyticsOverviewInstrumentRow {
  return {
    id: row.id,
    hrefId: row.slug || row.id,
    symbol: row.symbol,
    title: row.title,
    artist: row.artist,
    genre: row.genre,
    lastPrice: num(row.lastPriceUsdt),
    changePct: num(row.change7dPct || row.change24hPct),
    volumeUsdt: num(row.volume24hUsdt),
    trades: row.tradesCount ?? row.activeListings ?? 0,
    spreadPct: num(row.spreadPercent ?? row.spread),
    liquidity: row.liquidity,
    buySharePct: 50,
    sparkline: row.sparkline?.length ? row.sparkline : [row.lastPriceUsdt, row.lastPriceUsdt].map(num),
  };
}

function buildGenreShareFromStats(
  stats: MarketOverviewStatsApi | null,
  instruments: AnalyticsOverviewInstrumentRow[],
): AnalyticsOverviewAggregate["genreShare"] {
  const dist = stats?.distributions?.genres ?? [];
  if (dist.length > 0) {
    const totalVol = dist.reduce((s, g) => s + num(g.volumeUsdt), 0);
    const totalCount = dist.reduce((s, g) => s + (g.count || 0), 0);
    const useVol = totalVol > 0;
    const rows = dist
      .map((g) => {
        const weight = useVol ? num(g.volumeUsdt) : g.count || 0;
        const base = useVol ? totalVol : totalCount || 1;
        return {
          id: genreId(g.name),
          label: genreDisplayLabel(g.name),
          count: g.count || 0,
          pct: Math.round((weight / base) * 100),
        };
      })
      .filter((g) => g.count > 0 || g.pct > 0)
      .sort((a, b) => b.pct - a.pct || b.count - a.count);
    return renormalizePct(rows);
  }

  const weights = new Map<string, { label: string; count: number; volume: number }>();
  for (const i of instruments) {
    const id = genreId(i.genre || "other");
    const prev = weights.get(id) ?? { label: genreDisplayLabel(i.genre || "other"), count: 0, volume: 0 };
    weights.set(id, {
      label: prev.label,
      count: prev.count + 1,
      volume: prev.volume + i.volumeUsdt,
    });
  }
  const totalVol = [...weights.values()].reduce((s, g) => s + g.volume, 0);
  const useVol = totalVol > 0;
  const rows = [...weights.entries()]
    .map(([id, g]) => ({
      id,
      label: g.label,
      count: g.count,
      pct: Math.round(((useVol ? g.volume : g.count) / (useVol ? totalVol : instruments.length || 1)) * 100),
    }))
    .sort((a, b) => b.pct - a.pct);
  return renormalizePct(rows);
}

function buildLiquidityShareFromStats(
  stats: MarketOverviewStatsApi | null,
  instruments: AnalyticsOverviewInstrumentRow[],
): AnalyticsOverviewAggregate["liquidityShare"] {
  const dist = stats?.distributions?.liquidity ?? [];
  const counts = { high: 0, med: 0, low: 0 } as Record<"high" | "med" | "low", number>;

  if (dist.length > 0) {
    for (const row of dist) {
      const id = normalizeLiquidityId(row.label);
      if (id) counts[id] += row.count || 0;
    }
  } else {
    for (const i of instruments) counts[i.liquidity] += 1;
  }

  const total = counts.high + counts.med + counts.low;
  return renormalizePct(
    (["high", "med", "low"] as const).map((id) => ({
      id,
      count: counts[id],
      pct: total > 0 ? Math.round((counts[id] / total) * 100) : 0,
    })),
  );
}

function aggregateFromLive(
  stats: MarketOverviewStatsApi | null,
  charts: MarketOverviewChartsApi | null,
  items: MarketOverviewListItemApi[],
  period: AnalyticsOverviewPeriod,
): AnalyticsOverviewAggregate {
  const sm = stats?.secondaryMarket;
  const instruments = items.map(mapLiveItem);
  const fromListVolume = instruments.reduce((s, r) => s + r.volumeUsdt, 0);
  const fromListTrades = instruments.reduce((s, r) => s + r.trades, 0);
  const fromListSpread =
    instruments.length > 0
      ? instruments.reduce((s, r) => s + r.spreadPct, 0) / instruments.length
      : 0;

  const statsVolume =
    period === "24h"
      ? num(sm?.volume24hUsdt)
      : period === "7d"
        ? num(sm?.volume7dUsdt)
        : num(sm?.volume30dUsdt);
  const volumeUsdt = statsVolume > 0 ? statsVolume : fromListVolume;
  const trades = (sm?.tradesCount ?? 0) > 0 ? (sm?.tradesCount ?? 0) : fromListTrades;
  const avgSpreadPct =
    num(sm?.averageSpreadPct) > 0 ? num(sm?.averageSpreadPct) : fromListSpread;
  const activeListings =
    (sm?.activeListings ?? 0) > 0 ? (sm?.activeListings ?? 0) : instruments.length;

  const genreShare = buildGenreShareFromStats(stats, instruments);
  const liquidityShare = buildLiquidityShareFromStats(stats, instruments);
  const highLiquidityPct = liquidityShare.find((l) => l.id === "high")?.pct ?? 0;

  const buyPressurePct =
    instruments.length > 0
      ? Math.round(instruments.reduce((s, r) => s + r.buySharePct, 0) / instruments.length)
      : 50;

  const seriesValues = (key: keyof MarketOverviewChartsApi["series"]) =>
    (charts?.series[key] ?? []).map((p) => num(p.value)).filter((n) => Number.isFinite(n));

  const byId = new Map(instruments.map((i) => [i.id, i]));
  const top = stats?.topReleases?.byVolume ?? [];
  const leadersFromTop = top
    .map((row) => {
      const hit = byId.get(row.id) ?? instruments.find((i) => i.symbol === row.symbol);
      if (hit) return hit;
      return {
        id: row.id,
        hrefId: row.id,
        symbol: row.symbol,
        title: row.title,
        artist: row.artist,
        genre: "other",
        lastPrice: 0,
        changePct: 0,
        volumeUsdt: num(row.value),
        trades: 0,
        spreadPct: 0,
        liquidity: "med" as const,
        buySharePct: 50,
        sparkline: [],
      };
    })
    .filter(Boolean);
  const leaders =
    leadersFromTop.length > 0
      ? leadersFromTop
      : [...instruments].sort((a, b) => b.volumeUsdt - a.volumeUsdt).slice(0, 5);

  return {
    volumeUsdt,
    trades,
    avgSpreadPct,
    activeListings,
    highLiquidityPct,
    buyPressurePct,
    volumeTrend: seriesValues("secondaryVolume"),
    tradesTrend: seriesValues("tradesCount"),
    liquidityTrend: seriesValues("liquidity"),
    genreShare,
    liquidityShare,
    instruments,
    leaders,
  };
}

export function SecondaryMarketAnalyticsOverview() {
  const { t } = useI18n();
  const isLive = getWalletDataSource() === "live";
  const [period, setPeriod] = useState<AnalyticsOverviewPeriod>("7d");
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<GenreFilter>("all");
  const [sort, setSort] = useState<SortId>("volume");
  const [page, setPage] = useState(1);
  const [liveAgg, setLiveAgg] = useState<AnalyticsOverviewAggregate | null>(null);
  const [loading, setLoading] = useState(isLive);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLive) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void Promise.all([
      fetchMarketOverviewStats(period),
      fetchMarketOverviewCharts(period === "24h" ? "7d" : period),
      fetchMarketOverviewList({ sort: "activity", sortDir: "desc", pageSize: 100 }),
    ])
      .then(([stats, charts, list]) => {
        if (cancelled) return;
        setLiveAgg(aggregateFromLive(stats, charts, list.items, period));
      })
      .catch(() => {
        if (!cancelled) {
          setLiveAgg(null);
          setError(t("secondaryMarket.errors.loadFailed"));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isLive, period, t]);

  const demoAgg = useMemo(() => buildSecondaryMarketAnalyticsOverview(period), [period]);
  const agg = isLive ? liveAgg ?? EMPTY_ANALYTICS_OVERVIEW : demoAgg;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = agg.instruments.filter((row) => {
      if (genre === "liquid" && row.liquidity !== "high") return false;
      if (genre !== "all" && genre !== "liquid" && row.genre !== genre) return false;
      if (!q) return true;
      return (
        row.title.toLowerCase().includes(q) ||
        row.artist.toLowerCase().includes(q) ||
        row.symbol.toLowerCase().includes(q)
      );
    });
    rows = [...rows].sort((a, b) => {
      if (sort === "volume") return b.volumeUsdt - a.volumeUsdt;
      if (sort === "change") return b.changePct - a.changePct;
      if (sort === "spread") return a.spreadPct - b.spreadPct;
      if (sort === "liquidity") return liquidityRank(b.liquidity) - liquidityRank(a.liquidity);
      return a.title.localeCompare(b.title, "ru");
    });
    return rows;
  }, [agg.instruments, genre, query, sort]);

  useEffect(() => {
    setPage(1);
  }, [query, genre, sort, period]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / INSTRUMENTS_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const paged = useMemo(() => {
    const start = (safePage - 1) * INSTRUMENTS_PAGE_SIZE;
    return filtered.slice(start, start + INSTRUMENTS_PAGE_SIZE);
  }, [filtered, safePage]);

  const rangeFrom = total === 0 ? 0 : (safePage - 1) * INSTRUMENTS_PAGE_SIZE + 1;
  const rangeTo = Math.min(safePage * INSTRUMENTS_PAGE_SIZE, total);
  const showPagination = total > INSTRUMENTS_PAGE_SIZE;

  const genreRows: ShareRow[] = useMemo(
    () =>
      agg.genreShare.map((g, idx) => ({
        id: g.id,
        label: g.label,
        pct: g.pct,
        count: g.count,
        tone: GENRE_TONES[idx % GENRE_TONES.length],
      })),
    [agg.genreShare],
  );

  const liquidityRows: ShareRow[] = useMemo(
    () =>
      agg.liquidityShare.map((g) => ({
        id: g.id,
        label: liquidityLabel(g.id, t),
        pct: g.pct,
        count: g.count,
        tone: liquidityTone(g.id),
      })),
    [agg.liquidityShare, t],
  );

  const insight = useMemo(() => {
    const high = agg.highLiquidityPct;
    const topGenre = agg.genreShare[0];
    if (agg.genreShare.length === 0 && !agg.liquidityShare.some((l) => l.count > 0)) {
      return "";
    }
    if (high <= 20) return t("secondaryMarket.analyticsOverview.insightThin");
    if (high >= 55) return t("secondaryMarket.analyticsOverview.insightDeep");
    if (topGenre && topGenre.pct >= 55) {
      return formatMessage(t("secondaryMarket.analyticsOverview.insightGenreHeavy"), {
        genre: topGenre.label,
        pct: topGenre.pct,
      });
    }
    return t("secondaryMarket.analyticsOverview.insightBalanced");
  }, [agg.genreShare, agg.highLiquidityPct, agg.liquidityShare, t]);

  const leaders = agg.leaders?.length
    ? agg.leaders
    : [...agg.instruments].sort((a, b) => b.volumeUsdt - a.volumeUsdt).slice(0, 5);

  return (
    <div className="space-y-6 font-sans tabular-nums text-white antialiased md:space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 items-start gap-4 sm:gap-5">
          <div className="relative size-[4.75rem] shrink-0 sm:size-24">
            <Image
              src={ANALYTICS_HERO_ICON}
              alt=""
              fill
              sizes="96px"
              className="object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
              unoptimized
              aria-hidden
              priority
            />
          </div>
          <div className="min-w-0 pt-0.5">
            <h1 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
              {t("secondaryMarket.hero.analytics.title")}
            </h1>
            <p className="mt-2 max-w-[58ch] text-[14px] leading-relaxed text-zinc-400">
              {t("secondaryMarket.hero.analytics.lead")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 lg:pb-1" role="tablist" aria-label={t("secondaryMarket.filters.period")}>
          {PERIODS.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={period === id}
              onClick={() => setPeriod(id)}
              className={cn(
                smExchange.chipBase,
                period === id ? smExchange.chipActive : smExchange.chipIdle,
              )}
            >
              {id === "24h"
                ? t("secondaryMarket.trade.period24h")
                : id === "7d"
                  ? t("secondaryMarket.filters.period7dLong")
                  : t("secondaryMarket.filters.period30dLong")}
            </button>
          ))}
        </div>
      </header>

      {error ? (
        <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200" role="alert">
          {error}
        </p>
      ) : null}

      <section className="grid gap-2 lg:grid-cols-2">
        <LeadersCard
          title={t("secondaryMarket.analyticsOverview.leadersTitle")}
          emptyLabel={t("secondaryMarket.analyticsOverview.leadersEmpty")}
          rows={leaders}
        />
        <MarketStructureCard
          title={t("secondaryMarket.analyticsOverview.marketStructure")}
          hint={t("secondaryMarket.analyticsOverview.marketStructureHint")}
          genresLabel={t("secondaryMarket.analyticsOverview.genresLabel")}
          liquidityLabel={t("secondaryMarket.analyticsOverview.liquidityLabel")}
          emptyLabel={t("secondaryMarket.analyticsOverview.structureEmpty")}
          insight={insight}
          genreRows={genreRows}
          liquidityRows={liquidityRows}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-[16px] font-semibold tracking-tight text-white">
          {t("secondaryMarket.analyticsOverview.marketDynamicsHeadline")}
        </h2>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          <ChartCard
            title={t("secondaryMarket.analytics.volumeUsdt")}
            values={agg.volumeTrend}
            emptyLabel={t("secondaryMarket.analytics.noTrades")}
          />
          <ChartCard
            title={t("secondaryMarket.analyticsOverview.tradesSeries")}
            values={agg.tradesTrend}
            emptyLabel={t("secondaryMarket.analytics.noTrades")}
          />
          <div className="md:col-span-2 xl:col-span-1">
            <ChartCard
              title={t("secondaryMarket.analytics.liquidity")}
              values={agg.liquidityTrend}
              emptyLabel={t("secondaryMarket.analytics.noLiquidity")}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3.5">
        <h2 className="text-[16px] font-semibold tracking-tight text-white">
          {t("secondaryMarket.analyticsOverview.instrumentsHeadline")}
        </h2>

        <div className="space-y-2.5">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-600" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("secondaryMarket.analyticsOverview.searchPlaceholder")}
              className={smExchange.inputPill}
              aria-label={t("secondaryMarket.analyticsOverview.searchPlaceholder")}
            />
          </div>

          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {GENRE_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setGenre(chip.id)}
                  className={cn(
                    smExchange.chipBase,
                    genre === chip.id ? smExchange.chipActive : smExchange.chipIdle,
                  )}
                >
                  {chip.key ? t(chip.key) : chip.label}
                </button>
              ))}
            </div>
            <div className="flex min-w-0 gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {SORT_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setSort(chip.id)}
                  className={cn(
                    smExchange.chipBase,
                    sort === chip.id ? smExchange.chipActive : smExchange.chipIdle,
                  )}
                >
                  {t(chip.key)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white/[0.05] px-6 py-14 text-center">
            <p className="text-sm font-semibold text-white">{t("secondaryMarket.empty.noResults")}</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setGenre("all");
                setSort("volume");
                setPage(1);
              }}
              className="mt-4 text-[12px] text-zinc-400 underline-offset-2 hover:text-white hover:underline"
            >
              {t("secondaryMarket.filters.resetFilters")}
            </button>
          </div>
        ) : (
          <>
            <ul className="md:hidden">
              {paged.map((row) => {
                const positive = row.changePct >= 0;
                return (
                  <li key={row.id}>
                    <Link
                      href={secondaryMarketReleaseAnalyticsPath(row.hrefId)}
                      scroll={false}
                      className={cn(
                        "flex items-center gap-3 py-3.5 transition-colors active:bg-white/[0.03]",
                        smExchange.rowDivider,
                      )}
                    >
                      <CoverThumb symbol={row.symbol} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold leading-snug text-white">{row.title}</p>
                        <p className="truncate text-[12px] text-zinc-500">
                          {row.artist} / {row.symbol}
                        </p>
                        <p className="mt-1 font-mono text-[11px] text-zinc-500">
                          {formatUsdtCompact(row.volumeUsdt)} / {liquidityLabel(row.liquidity, t)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <p className="font-mono text-[14px] font-semibold tabular-nums text-white">
                          {formatUsdt(row.lastPrice)}
                        </p>
                        <p
                          className={cn(
                            "font-mono text-[11px] tabular-nums",
                            positive ? "text-[#B7F500]" : "text-fuchsia-400",
                          )}
                        >
                          {positive ? "+" : ""}
                          {row.changePct.toFixed(1)}%
                        </p>
                        {row.sparkline.length >= 2 ? (
                          <ExchangeNeonSparkline
                            values={row.sparkline}
                            trend={positive ? "up" : "down"}
                            width={56}
                            height={18}
                            detailSegments={3}
                          />
                        ) : null}
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-zinc-600" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="hidden overflow-x-auto rounded-2xl bg-white/[0.05] md:block">
            <table className="w-full min-w-0 border-collapse text-left text-[13px] lg:min-w-[760px]">
              <thead>
                <tr className="text-zinc-400">
                  <th className="px-3.5 py-3 text-[13px] font-medium">
                    {t("secondaryMarket.analyticsOverview.colInstrument")}
                  </th>
                  <th className="px-3 py-3 text-right text-[13px] font-medium">
                    {t("secondaryMarket.kpi.last")}
                  </th>
                  <th className="px-3 py-3 text-right text-[13px] font-medium">
                    {t("secondaryMarket.analyticsOverview.colChange")}
                  </th>
                  <th className="px-3 py-3 text-right text-[13px] font-medium">
                    {t("secondaryMarket.analytics.columnVolume")}
                  </th>
                  <th className="px-3 py-3 text-right text-[13px] font-medium">
                    {t("secondaryMarket.analytics.columnTrades")}
                  </th>
                  <th className="px-3 py-3 text-right text-[13px] font-medium">
                    {t("secondaryMarket.analytics.spreadPct")}
                  </th>
                  <th className="px-3 py-3 text-[13px] font-medium">
                    {t("secondaryMarket.analytics.liquidity")}
                  </th>
                  <th className="px-3 py-3 text-[13px] font-medium">
                    {t("secondaryMarket.analyticsOverview.colTrend")}
                  </th>
                  <th className="w-8 px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {paged.map((row) => {
                  const positive = row.changePct >= 0;
                  return (
                    <tr key={row.id} className="border-t border-white/[0.04] first:border-t-0 hover:bg-white/[0.02]">
                      <td className="px-3.5 py-3">
                        <Link
                          href={secondaryMarketReleaseAnalyticsPath(row.hrefId)}
                          scroll={false}
                          className="flex items-center gap-3"
                        >
                          <CoverThumb symbol={row.symbol} />
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold tracking-[-0.01em] text-white">{row.title}</p>
                            <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                              {row.artist} / {row.symbol}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-white">
                        {formatUsdt(row.lastPrice)}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-3 text-right font-mono tabular-nums",
                          positive ? "text-[#B7F500]" : "text-fuchsia-400",
                        )}
                      >
                        {positive ? "+" : ""}
                        {row.changePct.toFixed(1)}%
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-zinc-200">
                        {formatUsdtCompact(row.volumeUsdt)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-zinc-400">{row.trades}</td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-zinc-300">
                        {row.spreadPct.toFixed(2)}%
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-medium",
                            row.liquidity === "high" && "bg-white/[0.08] text-white",
                            row.liquidity === "med" && "bg-white/[0.06] text-zinc-300",
                            row.liquidity === "low" && "bg-amber-500/12 text-amber-200/90",
                          )}
                        >
                          {liquidityLabel(row.liquidity, t)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {row.sparkline.length >= 2 ? (
                          <ExchangeNeonSparkline
                            values={row.sparkline}
                            trend={positive ? "up" : "down"}
                            width={64}
                            height={20}
                            detailSegments={3}
                          />
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <Link
                          href={secondaryMarketReleaseAnalyticsPath(row.hrefId)}
                          scroll={false}
                          className="inline-flex size-8 items-center justify-center rounded-full text-zinc-600 transition hover:bg-white/[0.06] hover:text-white"
                          aria-label={row.title}
                        >
                          <ChevronRight className="size-4" aria-hidden />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

            {showPagination ? (
              <nav
                className="flex flex-wrap items-center justify-between gap-3 px-0.5"
                aria-label={t("secondaryMarket.market.paginationLabel")}
              >
                <div className="space-y-0.5">
                  <p className="font-mono text-[12px] text-zinc-400">
                    {formatMessage(t("secondaryMarket.market.paginationShowing"), {
                      from: rangeFrom,
                      to: rangeTo,
                      total,
                    })}
                  </p>
                  <p className="font-mono text-[11px] text-zinc-600">
                    {formatMessage(t("secondaryMarket.market.paginationPage"), {
                      page: safePage,
                      totalPages,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={cn(
                      smExchange.chipBase,
                      smExchange.chipIdle,
                      "inline-flex h-9 items-center gap-1.5 px-3.5 disabled:cursor-not-allowed disabled:opacity-40",
                    )}
                  >
                    <ChevronLeft className="size-3.5" strokeWidth={2} />
                    {t("secondaryMarket.market.paginationPrev")}
                  </button>
                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={cn(
                      smExchange.chipBase,
                      smExchange.chipIdle,
                      "inline-flex h-9 items-center gap-1.5 px-3.5 disabled:cursor-not-allowed disabled:opacity-40",
                    )}
                  >
                    {t("secondaryMarket.market.paginationNext")}
                    <ChevronRight className="size-3.5" strokeWidth={2} />
                  </button>
                </div>
              </nav>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
