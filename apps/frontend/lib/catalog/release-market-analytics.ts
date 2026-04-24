import { MARKET_OVERVIEW_ROWS } from "@/mocks/market-overview-rows";
import { buildReleaseMarketAnalyticsPageData } from "@/mocks/catalog/release-market-analytics.mock";
import type { ReleaseMarketAnalyticsPageData } from "@/types/catalog/release-market-analytics";
import type { MarketOverviewRow } from "@/types/market-overview";

export function getMarketOverviewRowByCatalogId(id: string): MarketOverviewRow | undefined {
  return MARKET_OVERVIEW_ROWS.find((r) => r.id === id);
}

export function getCatalogReleaseMarketAnalyticsPageData(id: string): ReleaseMarketAnalyticsPageData | undefined {
  const row = getMarketOverviewRowByCatalogId(id);
  if (!row) return undefined;
  return buildReleaseMarketAnalyticsPageData(row);
}
