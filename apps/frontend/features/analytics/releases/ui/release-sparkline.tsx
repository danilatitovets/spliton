"use client";

import { ExchangeNeonSparkline } from "@/components/shared/charts/exchange-neon-sparkline";
import { directionFromChangePct } from "@/lib/analytics/change-pct";
import type { ReleaseRowTrend } from "@/types/analytics/releases";

export function ReleaseSparkline({
  values,
  trend,
  changePct,
}: {
  values: number[];
  trend: ReleaseRowTrend;
  changePct?: string;
}) {
  const dir = changePct ? directionFromChangePct(changePct) : trend;
  return (
    <ExchangeNeonSparkline
      values={values}
      trend={dir}
      width={72}
      height={22}
      detailSegments={4}
    />
  );
}
