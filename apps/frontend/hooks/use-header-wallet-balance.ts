"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { formatApiError } from "@/lib/i18n/format-api-error";
import { formatUsdtAmount } from "@/lib/i18n/formatters";
import { PROFILE_DEMO_BALANCE } from "@/lib/demo/cabinet-demo-preview";
import { useCabinetDemoPreview } from "@/hooks/use-cabinet-demo-preview";
import { getWalletDataSource } from "@/lib/public-env";
import { fetchWalletBalanceCached, invalidateWalletBalanceCache } from "@/lib/wallet-balance-cache";
import { fetchWalletBalance } from "@/services/wallet.service";

export function useHeaderWalletBalance() {
  const { authorizedFetch, isAuthenticated, user, isLoading, status } = useAuth();
  const { locale } = useI18n();
  const demoPreview = useCabinetDemoPreview();
  const uiPending = status === "initializing" || status === "refreshing" || (isLoading && !isAuthenticated);
  const live = getWalletDataSource() === "live" && isAuthenticated && !demoPreview;
  const [display, setDisplay] = useState<string | null>(demoPreview ? PROFILE_DEMO_BALANCE : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!live) {
      setDisplay(demoPreview ? PROFILE_DEMO_BALANCE : null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const s = await fetchWalletBalanceCached(() => fetchWalletBalance(authorizedFetch));
      setDisplay(formatUsdtAmount(Number(s.availableBalance), locale));
    } catch (e) {
      setDisplay(null);
      setError(formatApiError(e, locale));
    } finally {
      setLoading(false);
    }
  }, [authorizedFetch, demoPreview, live, locale]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!live) return;
    const refresh = () => {
      invalidateWalletBalanceCache();
      void load();
    };
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVis);
    const timer = window.setInterval(refresh, 15_000);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVis);
      window.clearInterval(timer);
    };
  }, [live, load]);

  return {
    live,
    isAuthenticated,
    isAuthPending: uiPending || status === "error",
    userEmail: user?.email ?? null,
    balanceLabel: loading ? "…" : display,
    balanceShort: loading ? "…" : display?.replace(/\sUSDT$/, "") ?? null,
    error,
    reload: load,
  };
}
