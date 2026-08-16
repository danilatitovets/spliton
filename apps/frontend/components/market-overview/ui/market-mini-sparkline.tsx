"use client";

import type { MarketRowTrend } from "@/types/market-overview";

import { ExchangeNeonSparkline } from "@/components/shared/charts/exchange-neon-sparkline";

/** OKX-like multi-color spark palette (not only green). */
export const MARKET_SPARK_COLORS = [
  "#fb7185",
  "#B7F500",
  "#34d399",
  "#38bdf8",
  "#c084fc",
  "#fbbf24",
  "#f472b6",
  "#818cf8",
] as const;

/** Sparkline обзора рынка — тот же визуальный язык, что и график «Доходность». */
export function MarketMiniSparkline({
  values,
  trend,
  width = 120,
  height = 36,
  className,
  fitContainer,
  color,
}: {
  values: number[];
  trend: MarketRowTrend;
  width?: number;
  height?: number;
  className?: string;
  fitContainer?: boolean;
  color?: string;
}) {
  return (
    <ExchangeNeonSparkline
      values={values}
      trend={trend}
      width={width}
      height={height}
      className={className}
      fitContainer={fitContainer}
      detailSegments={width < 100 ? 4 : 5}
      color={color}
    />
  );
}
