import type { MarketRowTrend } from "@/types/market-overview";

import { ExchangeNeonSparkline } from "@/components/shared/charts/exchange-neon-sparkline";

/** Sparkline обзора рынка — тот же визуальный язык, что и график «Доходность». */
export function MarketMiniSparkline({
  values,
  trend,
  width = 120,
  height = 36,
  className,
  fitContainer,
}: {
  values: number[];
  trend: MarketRowTrend;
  width?: number;
  height?: number;
  className?: string;
  fitContainer?: boolean;
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
    />
  );
}
