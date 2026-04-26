export type ReleaseMarketAnalyticsStatusKey = "active" | "payouts" | "closed" | "new";

export type ReleaseMarketAnalyticsHeader = {
  /** Id строки в mock каталога / обзора рынка — для ссылок (покупка UNT, и т.п.). */
  catalogReleaseId: string;
  releaseTitle: string;
  artist: string;
  symbol: string;
  internalId: string;
  statusKey: ReleaseMarketAnalyticsStatusKey;
  statusLabel: string;
  genre: string;
};

/** Окраска строки «vs прошлый период» в hero-сетке. */
export type ReleaseMarketHeroVsTone = "positive" | "negative" | "neutral" | "warning";

export type ReleaseMarketHeroMetric = {
  value: string;
  /** Короткое сравнение с прошлым периодом (уже со знаком / формулировкой). */
  vsPrevious?: string;
  vsTone?: ReleaseMarketHeroVsTone;
};

export type ReleaseMarketAnalyticsHero = {
  yieldPct: ReleaseMarketHeroMetric;
  totalPayouts: ReleaseMarketHeroMetric;
  activeHolders: ReleaseMarketHeroMetric;
  availableUnits: ReleaseMarketHeroMetric;
  liquidity: ReleaseMarketHeroMetric;
  secondary: ReleaseMarketHeroMetric;
  trend7d: ReleaseMarketHeroMetric;
  trend30d: ReleaseMarketHeroMetric;
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

/** Карточка метрики в блоке ликвидности: значение, подсказка, сравнение с прошлым окном. */
export type ReleaseMarketLiquidityCard = {
  value: string;
  hint: string;
  vsPrevious?: string;
  vsTone?: ReleaseMarketHeroVsTone;
};

export type ReleaseMarketLiquidityListings = {
  hasActive: boolean;
  summary: string;
  vsPrevious?: string;
  vsTone?: ReleaseMarketHeroVsTone;
};

export type ReleaseMarketLiquidityDepth = {
  title: string;
  body: string;
  foot: string;
  vsPrevious?: string;
  vsTone?: ReleaseMarketHeroVsTone;
};

export type ReleaseMarketAnalyticsLiquidity = {
  listings: ReleaseMarketLiquidityListings;
  avgUnitPrice: ReleaseMarketLiquidityCard;
  spread: ReleaseMarketLiquidityCard;
  priceRange: ReleaseMarketLiquidityCard;
  volume24h: ReleaseMarketLiquidityCard;
  volume7d: ReleaseMarketLiquidityCard;
  trades24h: ReleaseMarketLiquidityCard;
  trades7d: ReleaseMarketLiquidityCard;
  depth: ReleaseMarketLiquidityDepth;
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
