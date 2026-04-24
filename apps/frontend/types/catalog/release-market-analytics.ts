export type ReleaseMarketAnalyticsStatusKey = "active" | "payouts" | "closed" | "new";

export type ReleaseMarketAnalyticsHeader = {
  /** Id строки в mock каталога / обзора рынка — для ссылок (покупка units, и т.п.). */
  catalogReleaseId: string;
  releaseTitle: string;
  artist: string;
  symbol: string;
  internalId: string;
  statusKey: ReleaseMarketAnalyticsStatusKey;
  statusLabel: string;
  genre: string;
};

export type ReleaseMarketAnalyticsHero = {
  yieldPct: string;
  totalPayouts: string;
  activeHolders: string;
  availableUnits: string;
  liquidityLabel: string;
  secondaryStatus: string;
  trend7d: string;
  trend30d: string;
  phase: string;
};

export type ReleaseMarketAnalyticsChartBlock = {
  id: string;
  title: string;
  caption: string;
  series: number[];
  accent: "lime" | "sky" | "fuchsia" | "zinc";
};

export type ReleaseMarketAnalyticsPeriodRow = {
  period: string;
  payouts: string;
  yield: string;
  tradeVolume: string;
  tradesCount: string;
  interestChange: string;
};

/** Семантика для окраски значений (ликвидность / риск). */
export type ReleaseMarketLiquiditySignal = "positive" | "negative" | "neutral";

export type ReleaseMarketAnalyticsLiquidity = {
  hasSecondaryListings: boolean;
  avgUnitPrice: string;
  spread: string;
  priceRange: string;
  volume24h: string;
  volume7d: string;
  trades24h: string;
  trades7d: string;
  depthNote: string;
  /** Выводится из mock-логики (жанр, тренд, ликвидность строки). */
  signals: {
    listings: ReleaseMarketLiquiditySignal;
    spread: ReleaseMarketLiquiditySignal;
    depth: ReleaseMarketLiquiditySignal;
    /** Оборот/сделки vs тренд релиза */
    flow: ReleaseMarketLiquiditySignal;
    /** Положение средней к диапазону (mock) */
    avgPrice: ReleaseMarketLiquiditySignal;
  };
};

export type ReleaseMarketAnalyticsParamRow = {
  label: string;
  value: string;
};

export type ReleaseMarketAnalyticsPayoutInsights = {
  lastPayout: string;
  avgPayoutPeriod: string;
  accrualFrequency: string;
  cumulativePayouts: string;
  payoutStatus: string;
};

export type ReleaseMarketAnalyticsPageData = {
  header: ReleaseMarketAnalyticsHeader;
  hero: ReleaseMarketAnalyticsHero;
  charts: ReleaseMarketAnalyticsChartBlock[];
  periodTable: ReleaseMarketAnalyticsPeriodRow[];
  liquidity: ReleaseMarketAnalyticsLiquidity;
  params: ReleaseMarketAnalyticsParamRow[];
  payoutInsights: ReleaseMarketAnalyticsPayoutInsights;
  riskNotes: string[];
};
