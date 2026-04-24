import {
  getSecondaryMarketListingTradesMock,
  type SecondaryMarketListingMock,
} from "@/mocks/dashboard/secondary-market-listings.mock";

export type SecondaryMarketTradingAnalyticsMock = {
  listing: SecondaryMarketListingMock;
  bestBid: number;
  bestAsk: number;
  lastTradedPrice: number;
  spread: number;
  spreadPct: number;
  activeListings: number;
  volume24hUsdt: number;
  volume7dUsdt: number;
  volume30dUsdt: number;
  trades24h: number;
  trades7d: number;
  trades30d: number;
  priceTrend: number[];
  volumeTrend: number[];
  liquidity: SecondaryMarketListingMock["liquidity"];
  buySharePct: number;
  depthBidPct: number[];
  depthAskPct: number[];
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/** Детерминированные торговые метрики вторички по листингу (макет). */
export function buildSecondaryMarketTradingAnalytics(
  listing: SecondaryMarketListingMock,
): SecondaryMarketTradingAnalyticsMock {
  const seed = listing.releaseId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const tick = 0.01 + (seed % 5) * 0.01;
  const last = listing.pricePerUnit;
  const halfSpread = tick + (seed % 4) * 0.01;
  const bestBid = round2(last - halfSpread);
  const bestAsk = round2(last + halfSpread);
  const spread = round2(bestAsk - bestBid);
  const spreadPct = last > 0 ? round2((spread / last) * 100) : 0;

  const activeListings = 1 + (seed % 4) + (listing.liquidity === "high" ? 2 : listing.liquidity === "med" ? 1 : 0);
  const vol24 = Math.round(listing.listingValueUsdt * (0.55 + (seed % 12) / 40));
  const vol7 = Math.round(vol24 * (3.8 + (seed % 5) * 0.15) + listing.deals7d * last * 1.6);
  const vol30 = Math.round(vol7 * (3.2 + (seed % 4) * 0.08));

  const trades24h = Math.max(0, listing.deals7d > 5 ? 6 + (seed % 14) : seed % 6);
  const trades7d = listing.deals7d + (seed % 8);
  const trades30d = trades7d * (3 + (seed % 3));

  const base = last * (0.96 + (seed % 7) * 0.01);
  const priceTrend = Array.from({ length: 18 }, (_, i) => {
    const w = Math.sin((seed + i) * 0.55) * 0.018 * last;
    return round2(base + w + i * 0.0022 * last);
  });

  const volumeTrend = Array.from({ length: 12 }, (_, i) =>
    Math.round(vol24 * (0.35 + (i / 11) * 0.9) * (0.85 + ((seed + i * 3) % 9) / 40)),
  );

  const buySharePct = Math.min(78, 42 + (seed % 28) + (listing.liquidity === "high" ? 6 : 0));
  const depthBidPct = [88, 62, 44, 28, 16].map((x) => Math.round(x * (0.75 + (seed % 5) / 20)));
  const depthAskPct = [84, 58, 36, 22, 12].map((x) => Math.round(x * (0.72 + ((seed + 2) % 5) / 20)));

  return {
    listing,
    bestBid,
    bestAsk,
    lastTradedPrice: last,
    spread,
    spreadPct,
    activeListings,
    volume24hUsdt: vol24,
    volume7dUsdt: vol7,
    volume30dUsdt: vol30,
    trades24h,
    trades7d,
    trades30d,
    priceTrend,
    volumeTrend,
    liquidity: listing.liquidity,
    buySharePct,
    depthBidPct,
    depthAskPct,
  };
}

export function getSecondaryMarketTradesForAnalyticsListing(listing: SecondaryMarketListingMock) {
  return getSecondaryMarketListingTradesMock(listing).slice(0, 8);
}
