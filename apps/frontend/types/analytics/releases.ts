export type ReleaseAnalyticsPeriod = "7d" | "30d" | "90d" | "all";

export type ReleaseRowStatus = "Active" | "Paused" | "Closed";

export type ReleaseRowTrend = "up" | "down" | "flat";

export type ReleaseRowGenre = "electronic" | "hiphop" | "pop";

export type ReleaseAnalyticsRow = {
  id: string;
  symbol: string;
  release: string;
  artist: string;
  genre: ReleaseRowGenre;
  yieldPct: string;
  changePct: string;
  payouts: string;
  units: string;
  status: ReleaseRowStatus;
  trend: ReleaseRowTrend;
  sparkline: number[];
  payoutBand: { lo: string; hi: string; t: number };
};

export type ReleaseAnalyticsSortKey = "yield" | "payouts" | "units";

export type ReleaseAnalyticsChipPreset = "all" | "top" | "stable" | "growth";

export type ReleaseAnalyticsSectionTab = "analytics" | "ratings";
