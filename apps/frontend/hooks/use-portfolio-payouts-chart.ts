"use client";

import { useCallback, useEffect, useState } from "react";

import type { PayoutAccrualChartPoint } from "@/components/dashboard/assets/payouts-mock-data";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { getClientCache, setClientCache } from "@/lib/client-data-cache";
import {
  adaptPayoutChartPoints,
  mapPayoutChartRangeToApi,
  payoutChartKpiFromSeries,
  type PayoutChartRangeId,
} from "@/lib/portfolio/payouts-chart-adapter";
import { useCabinetDemoPreview } from "@/hooks/use-cabinet-demo-preview";
import { isLivePortfolioEnabled } from "@/lib/public-env";
import { portfolioErrorMessage, fetchPortfolioPayoutsChart } from "@/services/portfolio.service";

type ChartCache = {
  series: PayoutAccrualChartPoint[];
  empty: boolean;
  totalPaid: string | null;
};

function cacheKey(userId: string, range: PayoutChartRangeId, locale: string) {
  return `assets:payouts:chart:${userId}:${range}:${locale}`;
}

export function usePortfolioPayoutsChart(initialRange: PayoutChartRangeId = "30d") {
  const { authorizedFetch, isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { locale } = useI18n();
  const demoPreview = useCabinetDemoPreview();
  const live = isLivePortfolioEnabled() && isAuthenticated && !demoPreview;
  const userScope = user?.id ?? "anon";
  const [range, setRange] = useState<PayoutChartRangeId>(initialRange);
  const [series, setSeries] = useState<PayoutAccrualChartPoint[]>(() => {
    const hit = getClientCache<ChartCache>(cacheKey(userScope, initialRange, locale));
    return hit?.series ?? [];
  });
  const [loading, setLoading] = useState(() => {
    if (!live) return false;
    return !getClientCache(cacheKey(userScope, initialRange, locale));
  });
  const [error, setError] = useState<string | null>(null);
  const [empty, setEmpty] = useState(() => {
    const hit = getClientCache<ChartCache>(cacheKey(userScope, initialRange, locale));
    return hit?.empty ?? false;
  });
  const [totalPaid, setTotalPaid] = useState<string | null>(() => {
    const hit = getClientCache<ChartCache>(cacheKey(userScope, initialRange, locale));
    return hit?.totalPaid ?? null;
  });

  const load = useCallback(async () => {
    if (!live) return;
    const key = cacheKey(userScope, range, locale);
    const cached = getClientCache<ChartCache>(key);
    if (cached) {
      setSeries(cached.series);
      setEmpty(cached.empty);
      setTotalPaid(cached.totalPaid);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await fetchPortfolioPayoutsChart(
        authorizedFetch,
        mapPayoutChartRangeToApi(range),
      );
      const adapted = adaptPayoutChartPoints(data.points, locale);
      const paid = typeof data.summary.totalPaid === "string" ? data.summary.totalPaid : null;
      setSeries(adapted);
      setEmpty(adapted.length === 0);
      setTotalPaid(paid);
      setClientCache(key, { series: adapted, empty: adapted.length === 0, totalPaid: paid } satisfies ChartCache);
    } catch (e) {
      setError(portfolioErrorMessage(e));
      if (!cached) {
        setSeries([]);
        setEmpty(true);
      }
    } finally {
      setLoading(false);
    }
  }, [authorizedFetch, live, locale, range, userScope]);

  useEffect(() => {
    if (authLoading) return;
    if (!live) {
      setLoading(false);
      return;
    }
    void load();
  }, [authLoading, live, load]);

  const kpi = payoutChartKpiFromSeries(series);

  return {
    live,
    range,
    setRange,
    series,
    kpi,
    totalPaid,
    loading,
    error,
    empty,
    reload: load,
  };
}
