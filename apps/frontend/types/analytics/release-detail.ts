import type { ReleaseAnalyticsRow } from "@/types/analytics/releases";

export type ReleaseDetailChartPeriod = "7d" | "30d" | "90d" | "ytd" | "all";

export type ReleaseDetailSummaryRow = { label: string; value: string; hint?: string; href?: string };

export type ReleaseDetailQuickStat = {
  label: string;
  value: string;
  sub?: string;
  /** Короткая справка при наведении на «i». */
  info?: string;
};

export type ReleaseDetailPayoutRow = {
  period: string;
  gross: string;
  poolShare: string;
  distribution: string;
  perUnit: string;
  toHolders: string;
};

/** Видео-обложка в hero: при отсутствии src показывается макетный плейсхолдер. */
export type ReleaseDetailCover = {
  videoSrc?: string;
  posterSrc?: string;
  caption?: string;
};

export type ReleaseDetailPageData = {
  row: ReleaseAnalyticsRow;
  breadcrumbs: { label: string; href?: string }[];
  heroBlurb: string;
  cover?: ReleaseDetailCover;
  summaryPanel: ReleaseDetailSummaryRow[];
  performance: {
    title: string;
    subtitle: string;
    seriesByPeriod: Record<ReleaseDetailChartPeriod, number[]>;
    miniStats: { label: string; value: string }[];
  };
  quickStats: ReleaseDetailQuickStat[];
  about: { title: string; paragraphs: string[] };
  howItWorks: { title: string; blocks: { heading: string; body: string }[] };
  terms: { title: string; rows: { key: string; val: string; note?: string }[] };
  payoutHistory: ReleaseDetailPayoutRow[];
  secondary: { title: string; rows: { label: string; value: string }[] };
  faq: { q: string; a: string }[];
  related: { title: string; description: string; href: string }[];
};
