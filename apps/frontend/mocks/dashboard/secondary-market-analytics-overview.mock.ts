import {
  SECONDARY_MARKET_LISTINGS_MOCK,
  type SecondaryMarketListingMock,
} from "@/mocks/dashboard/secondary-market-listings.mock";
import { buildSecondaryMarketTradingAnalytics } from "@/mocks/dashboard/secondary-market-trading-analytics.mock";

export type AnalyticsOverviewPeriod = "24h" | "7d" | "30d";

export type AnalyticsOverviewInstrumentRow = {
  id: string;
  hrefId: string;
  symbol: string;
  title: string;
  artist: string;
  genre: string;
  lastPrice: number;
  changePct: number;
  volumeUsdt: number;
  trades: number;
  spreadPct: number;
  liquidity: "high" | "med" | "low";
  buySharePct: number;
  sparkline: number[];
};

export type AnalyticsOverviewAggregate = {
  volumeUsdt: number;
  trades: number;
  avgSpreadPct: number;
  activeListings: number;
  highLiquidityPct: number;
  buyPressurePct: number;
  volumeTrend: number[];
  tradesTrend: number[];
  liquidityTrend: number[];
  genreShare: Array<{ id: string; label: string; pct: number; count: number }>;
  liquidityShare: Array<{ id: "high" | "med" | "low"; pct: number; count: number }>;
  instruments: AnalyticsOverviewInstrumentRow[];
  /** Top instruments for OKX-style leaders card (optional; falls back to instruments). */
  leaders?: AnalyticsOverviewInstrumentRow[];
};

export const EMPTY_ANALYTICS_OVERVIEW: AnalyticsOverviewAggregate = {
  volumeUsdt: 0,
  trades: 0,
  avgSpreadPct: 0,
  activeListings: 0,
  highLiquidityPct: 0,
  buyPressurePct: 0,
  volumeTrend: [],
  tradesTrend: [],
  liquidityTrend: [],
  genreShare: [],
  liquidityShare: [
    { id: "high", pct: 0, count: 0 },
    { id: "med", pct: 0, count: 0 },
    { id: "low", pct: 0, count: 0 },
  ],
  instruments: [],
  leaders: [],
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function volumeForPeriod(listing: SecondaryMarketListingMock, a: ReturnType<typeof buildSecondaryMarketTradingAnalytics>, period: AnalyticsOverviewPeriod) {
  if (period === "24h") return a.volume24hUsdt;
  if (period === "7d") return a.volume7dUsdt;
  return a.volume30dUsdt;
}

function tradesForPeriod(a: ReturnType<typeof buildSecondaryMarketTradingAnalytics>, period: AnalyticsOverviewPeriod) {
  if (period === "24h") return a.trades24h;
  if (period === "7d") return a.trades7d;
  return a.trades30d;
}

/** Агрегаты торговой аналитики вторички по демо-листингам. */
export function buildSecondaryMarketAnalyticsOverview(
  period: AnalyticsOverviewPeriod = "7d",
  listings: SecondaryMarketListingMock[] = SECONDARY_MARKET_LISTINGS_MOCK,
): AnalyticsOverviewAggregate {
  const rows = listings.map((listing) => {
    const a = buildSecondaryMarketTradingAnalytics(listing);
    const volumeUsdt = volumeForPeriod(listing, a, period);
    const trades = tradesForPeriod(a, period);
    const changePct =
      period === "24h" ? round2(listing.change7dPct / 3.2) : listing.change7dPct;
    return {
      id: listing.id,
      hrefId: listing.releaseId,
      symbol: listing.symbol,
      title: listing.track,
      artist: listing.artist,
      genre: listing.genre,
      lastPrice: listing.pricePerUnit,
      changePct,
      volumeUsdt,
      trades,
      spreadPct: a.spreadPct,
      liquidity: listing.liquidity,
      buySharePct: a.buySharePct,
      sparkline: a.priceTrend.slice(-10),
      _a: a,
    };
  });

  const volumeUsdt = rows.reduce((s, r) => s + r.volumeUsdt, 0);
  const trades = rows.reduce((s, r) => s + r.trades, 0);
  const avgSpreadPct =
    rows.length > 0 ? round2(rows.reduce((s, r) => s + r.spreadPct, 0) / rows.length) : 0;
  const activeListings = listings.filter((l) => (l.status ?? "active") === "active" && l.unitsAvailable > 0).length;
  const highCount = listings.filter((l) => l.liquidity === "high").length;
  const highLiquidityPct = listings.length > 0 ? Math.round((highCount / listings.length) * 100) : 0;
  const buyPressurePct =
    rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.buySharePct, 0) / rows.length) : 50;

  const seed = period === "24h" ? 3 : period === "7d" ? 7 : 11;
  const volumeTrend = Array.from({ length: 12 }, (_, i) =>
    Math.round(volumeUsdt * (0.55 + (i / 11) * 0.55) * (0.82 + ((seed + i * 2) % 9) / 35)),
  );
  const tradesTrend = Array.from({ length: 12 }, (_, i) =>
    Math.max(1, Math.round(trades * (0.4 + (i / 11) * 0.7) * (0.75 + ((seed + i) % 8) / 28))),
  );
  const liquidityTrend = Array.from({ length: 12 }, (_, i) =>
    round2(42 + highLiquidityPct * 0.35 + Math.sin((seed + i) * 0.7) * 6),
  );

  const genreLabels: Record<string, string> = {
    electronic: "Electronic",
    pop: "Pop",
    hiphop: "Hip-Hop",
    rock: "Rock",
  };
  const genreWeights = new Map<string, { count: number; volume: number }>();
  for (const r of rows) {
    const prev = genreWeights.get(r.genre) ?? { count: 0, volume: 0 };
    genreWeights.set(r.genre, {
      count: prev.count + 1,
      volume: prev.volume + r.volumeUsdt,
    });
  }
  const genreVolumeTotal = [...genreWeights.values()].reduce((s, g) => s + g.volume, 0);
  const useGenreVolume = genreVolumeTotal > 0;
  const genreShare = [...genreWeights.entries()]
    .map(([id, g]) => ({
      id,
      label: genreLabels[id] ?? id,
      count: g.count,
      pct: Math.round(
        ((useGenreVolume ? g.volume : g.count) /
          (useGenreVolume ? genreVolumeTotal : listings.length || 1)) *
          100,
      ),
    }))
    .sort((a, b) => b.pct - a.pct || b.count - a.count);

  const liqCounts = { high: 0, med: 0, low: 0 } as Record<"high" | "med" | "low", number>;
  for (const l of listings) liqCounts[l.liquidity] += 1;
  const liquidityShare = (["high", "med", "low"] as const).map((id) => ({
    id,
    count: liqCounts[id],
    pct: listings.length > 0 ? Math.round((liqCounts[id] / listings.length) * 100) : 0,
  }));

  const instruments = rows.map(({ _a: _, ...rest }) => rest);
  const leaders = [...instruments].sort((a, b) => b.volumeUsdt - a.volumeUsdt).slice(0, 5);

  return {
    volumeUsdt,
    trades,
    avgSpreadPct,
    activeListings,
    highLiquidityPct,
    buyPressurePct,
    volumeTrend,
    tradesTrend,
    liquidityTrend,
    genreShare,
    liquidityShare,
    instruments,
    leaders,
  };
}
