"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getPayoutBalanceScaleMock } from "@/components/dashboard/assets/payouts-mock-data";
import { useAuth } from "@/components/providers/auth-provider";
import { useCabinetDemoPreview } from "@/hooks/use-cabinet-demo-preview";
import { isLivePayoutsEnabled } from "@/lib/public-env";
import {
  fetchPayoutsCompare,
  portfolioErrorMessage,
  type PortfolioPayoutsCompareApi,
} from "@/services/portfolio.service";

export type PayoutCompareWindow = "7d" | "30d" | "90d";

function parsePeriodBounds(period: string): { from: string; to: string } {
  const parts = period.split("—").map((s) => s.trim());
  const year = new Date().getFullYear();
  const toIso = (ddMm: string) => {
    const [dd, mm] = ddMm.split(".");
    if (!dd || !mm) return new Date().toISOString();
    return new Date(Date.UTC(year, Number(mm) - 1, Number(dd))).toISOString();
  };
  return {
    from: toIso(parts[0] ?? "01.01"),
    to: toIso(parts[1] ?? "01.01"),
  };
}

function buildDemoCompare(window: PayoutCompareWindow): PortfolioPayoutsCompareApi {
  const mock = getPayoutBalanceScaleMock(window);
  const leftBounds = parsePeriodBounds(mock.left.period);
  const rightBounds = parsePeriodBounds(mock.right.period);
  const leftAcc = mock.left.accrualsUSDT;
  const rightAcc = mock.right.accrualsUSDT;
  const delta =
    leftAcc > 0 ? Number((((rightAcc - leftAcc) / leftAcc) * 100).toFixed(2)) : null;
  return {
    window,
    asset: mock.asset,
    left: {
      titleKey: mock.left.titleKey,
      from: leftBounds.from,
      to: leftBounds.to,
      accrualsUsdt: String(mock.left.accrualsUSDT),
      withdrawalsUsdt: String(mock.left.withdrawalsUSDT),
    },
    right: {
      titleKey: mock.right.titleKey,
      from: rightBounds.from,
      to: rightBounds.to,
      accrualsUsdt: String(mock.right.accrualsUSDT),
      withdrawalsUsdt: String(mock.right.withdrawalsUSDT),
    },
    deltaAccrualsPct: delta,
    updatedAt: new Date().toISOString(),
  };
}

export function usePayoutsCompare(window: PayoutCompareWindow = "30d") {
  const { authorizedFetch, isAuthenticated } = useAuth();
  const demoPreview = useCabinetDemoPreview();
  const live = isLivePayoutsEnabled() && isAuthenticated && !demoPreview;

  const demoData = useMemo(
    () => (!live ? buildDemoCompare(window) : null),
    [live, window],
  );

  const [data, setData] = useState<PortfolioPayoutsCompareApi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!live) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPayoutsCompare(authorizedFetch, window);
      setData(res);
    } catch (e) {
      setData(null);
      setError(portfolioErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [authorizedFetch, live, window]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    live,
    demoPreview,
    data: live ? data : demoData,
    loading,
    error,
    reload: load,
  };
}
