"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { adaptPositionRow, adaptStructureItems } from "@/lib/portfolio/portfolio-adapter";
import { getClientCache, setClientCache } from "@/lib/client-data-cache";
import { useCabinetDemoPreview } from "@/hooks/use-cabinet-demo-preview";
import { isLivePortfolioEnabled } from "@/lib/public-env";
import {
  fetchPortfolioMetrics,
  fetchPortfolioPositions,
  portfolioErrorMessage,
  type PortfolioMetricsApi,
  type PortfolioPositionApi,
} from "@/services/portfolio.service";
import {
  fetchWalletSummary,
  walletErrorMessage,
  type WalletSummary,
} from "@/services/wallet.service";

export type MetricsPositionsQuery = {
  q?: string;
  genre?: string;
  status?: string;
  sort?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export function usePortfolioMetricsPage(positionsQuery: MetricsPositionsQuery = {}) {
  const { authorizedFetch, isAuthenticated, user } = useAuth();
  const { locale } = useI18n();
  const demoPreview = useCabinetDemoPreview();
  const live = isLivePortfolioEnabled() && isAuthenticated && !demoPreview;
  const userScope = user?.id ?? "anon";
  const metricsKey = `assets:metrics:${userScope}`;
  const walletKey = `assets:wallet-summary:${userScope}`;
  const cachedMetrics = live ? getClientCache<PortfolioMetricsApi>(metricsKey) : null;
  const cachedWallet = live ? getClientCache<WalletSummary>(walletKey) : null;

  const [metrics, setMetrics] = useState<PortfolioMetricsApi | null>(cachedMetrics);
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(cachedWallet);
  const [positionsRaw, setPositionsRaw] = useState<PortfolioPositionApi[] | null>(null);
  const [positionsTotal, setPositionsTotal] = useState(0);
  const [loading, setLoading] = useState(() => live && !cachedMetrics);
  const [walletLoading, setWalletLoading] = useState(() => live && !cachedWallet);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [positionsError, setPositionsError] = useState<string | null>(null);

  const loadCore = useCallback(async () => {
    if (!live) return;
    const hadMetrics = Boolean(getClientCache(metricsKey));
    const hadWallet = Boolean(getClientCache(walletKey));
    if (!hadMetrics) setLoading(true);
    if (!hadWallet) setWalletLoading(true);
    setError(null);
    setWalletError(null);
    const [metricsResult, walletResult] = await Promise.allSettled([
      fetchPortfolioMetrics(authorizedFetch),
      fetchWalletSummary(authorizedFetch),
    ]);
    if (metricsResult.status === "fulfilled") {
      setMetrics(metricsResult.value);
      setClientCache(metricsKey, metricsResult.value);
    } else {
      setError(portfolioErrorMessage(metricsResult.reason));
      if (!hadMetrics) setMetrics(null);
    }
    if (walletResult.status === "fulfilled") {
      setWalletSummary(walletResult.value);
      setClientCache(walletKey, walletResult.value);
    } else {
      setWalletError(walletErrorMessage(walletResult.reason));
      if (!hadWallet) setWalletSummary(null);
    }
    setLoading(false);
    setWalletLoading(false);
  }, [authorizedFetch, live]);

  const loadPositions = useCallback(async () => {
    if (!live) return;
    setPositionsLoading(true);
    setPositionsError(null);
    try {
      const res = await fetchPortfolioPositions(authorizedFetch, {
        page: positionsQuery.page ?? 1,
        limit: positionsQuery.limit ?? 20,
        sort: positionsQuery.sort ?? "value",
        sortDir: positionsQuery.sortDir ?? "desc",
        q: positionsQuery.q,
        genre: positionsQuery.genre,
        status: positionsQuery.status,
      });
      setPositionsRaw(res.items);
      setPositionsTotal(res.total);
    } catch (e) {
      setPositionsError(portfolioErrorMessage(e));
      setPositionsRaw(null);
      setPositionsTotal(0);
    } finally {
      setPositionsLoading(false);
    }
  }, [
    authorizedFetch,
    live,
    positionsQuery.genre,
    positionsQuery.limit,
    positionsQuery.page,
    positionsQuery.q,
    positionsQuery.sort,
    positionsQuery.sortDir,
    positionsQuery.status,
  ]);

  useEffect(() => {
    void loadCore();
  }, [loadCore]);

  useEffect(() => {
    void loadPositions();
  }, [loadPositions]);

  const genreAllocation = metrics ? adaptStructureItems(metrics.genreAllocation) : null;
  const statusAllocation = metrics ? adaptStructureItems(metrics.statusAllocation) : null;
  const positionRows = useMemo(
    () => (positionsRaw ? positionsRaw.map((row) => adaptPositionRow(row, locale)) : null),
    [locale, positionsRaw],
  );

  const reload = useCallback(async () => {
    await Promise.all([loadCore(), loadPositions()]);
  }, [loadCore, loadPositions]);

  return {
    live,
    metrics,
    walletSummary,
    genreAllocation,
    statusAllocation,
    positionRows,
    positionsRaw,
    positionsTotal,
    loading,
    walletLoading,
    positionsLoading,
    error,
    walletError,
    positionsError,
    reload,
  };
}
