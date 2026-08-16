"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { useCabinetDemoPreview } from "@/hooks/use-cabinet-demo-preview";
import { getClientCache, setClientCache } from "@/lib/client-data-cache";
import { isLivePayoutsEnabled } from "@/lib/public-env";
import {
  fetchPayoutsOverview,
  portfolioErrorMessage,
  type PortfolioPayoutsOverviewApi,
} from "@/services/portfolio.service";

export function usePayoutsOverview() {
  const { authorizedFetch, isAuthenticated, isLoading: authLoading, user } = useAuth();
  const demoPreview = useCabinetDemoPreview();
  const live = isLivePayoutsEnabled() && isAuthenticated && !demoPreview;
  const CACHE_KEY = `assets:payouts:overview:${user?.id ?? "anon"}`;

  const [data, setData] = useState<PortfolioPayoutsOverviewApi | null>(() =>
    getClientCache<PortfolioPayoutsOverviewApi>(CACHE_KEY),
  );
  const [loading, setLoading] = useState(() => live && !getClientCache(CACHE_KEY));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!live) return;
    const cached = getClientCache<PortfolioPayoutsOverviewApi>(CACHE_KEY);
    if (cached) {
      setData(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await fetchPayoutsOverview(authorizedFetch);
      setData(res);
      setClientCache(CACHE_KEY, res);
    } catch (e) {
      if (!cached) setData(null);
      setError(portfolioErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [authorizedFetch, live, CACHE_KEY]);

  useEffect(() => {
    if (authLoading) return;
    if (!live) {
      setLoading(false);
      return;
    }
    void load();
  }, [authLoading, live, load]);

  return { live, demoPreview, data, loading, error, reload: load, authLoading };
}
