"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { tf } from "@/lib/i18n/financial-messages";
import { formatUsdtFixedRu } from "@/lib/market-overview/format";
import { fetchCatalogStats } from "@/services/catalog.service";
import { fetchMarketOverviewList } from "@/services/market-overview.service";
import { fetchPortfolioOverview } from "@/services/portfolio.service";
import { fetchWalletSummary, getWalletDataSource } from "@/services/wallet.service";

export type DashboardStatTrend = "up" | "down" | "flat";

export type DashboardLandingStat = {
  id: string;
  label: string;
  value: string;
  hint: string;
  trend: DashboardStatTrend;
  /** Real delta only — omit fake recycled counters */
  change?: string;
  href?: string;
  hrefLabel?: string;
};

function parsePct(raw: string | null | undefined): number | null {
  if (raw == null || raw === "") return null;
  const n = Number.parseFloat(raw.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function formatPctChange(raw: string | null | undefined): { trend: DashboardStatTrend; change?: string } {
  const n = parsePct(raw);
  if (n == null) return { trend: "flat" };
  if (n === 0) return { trend: "flat", change: "0%" };
  const trend: DashboardStatTrend = n > 0 ? "up" : "down";
  const sign = n > 0 ? "+" : "−";
  const abs = Math.abs(n).toLocaleString("ru-RU", { maximumFractionDigits: 1 });
  return { trend, change: `${sign}${abs}%` };
}

function formatUsdtRu(value: string | number): string {
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  if (!Number.isFinite(n)) return "—";
  return `${formatUsdtFixedRu(n)} USDT`;
}

function formatCount(n: number): string {
  return n.toLocaleString("ru-RU");
}

function pluralProjects(n: number, t: (key: string) => string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return tf(t("dashboard.stats.projects.one"), { n: String(n) });
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return tf(t("dashboard.stats.projects.few"), { n: String(n) });
  }
  return tf(t("dashboard.stats.projects.many"), { n: String(n) });
}

export function useDashboardLandingStats(withdrawHref?: string, withdrawHrefLabel?: string) {
  const { t } = useI18n();
  const live = getWalletDataSource() === "live";
  const { authorizedFetch, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardLandingStat[]>([]);
  const [loading, setLoading] = useState(live);
  const [fetchError, setFetchError] = useState<unknown>(null);
  const [reloadTick, setReloadTick] = useState(0);

  const withdrawLinkLabel = withdrawHrefLabel ?? t("dashboard.stats.withdrawLink");

  const demoStats = useMemo<DashboardLandingStat[]>(
    () => [
      {
        id: "volume",
        label: t("dashboard.stats.demo.avgDeal.label"),
        value: "1 240,58 USDT",
        hint: t("dashboard.stats.demo.avgDeal.hint"),
        trend: "up",
        change: "+3,2%",
      },
      {
        id: "listings",
        label: t("dashboard.stats.demo.investorPayouts.label"),
        value: "156,42 USDT / 30д",
        hint: t("dashboard.stats.demo.investorPayouts.hint"),
        trend: "up",
        change: "+12,4%",
      },
      {
        id: "releases",
        label: t("dashboard.stats.demo.releases.label"),
        value: pluralProjects(7, t),
        hint: t("dashboard.stats.demo.releases.hint"),
        trend: "up",
        change: "+1",
      },
      {
        id: "rounds",
        label: t("dashboard.stats.demo.withdrawable.label"),
        value: "73,19 USDT",
        hint: t("dashboard.stats.demo.withdrawable.hint"),
        trend: "down",
        change: "−4,8%",
      },
    ],
    [t],
  );

  const reload = useCallback(() => {
    if (!live) return;
    setReloadTick((n) => n + 1);
  }, [live]);

  useEffect(() => {
    if (!live) {
      setStats(demoStats);
      setFetchError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    void (async () => {
      try {
        const [overview, catalogStats, wallet, portfolio] = await Promise.all([
          fetchMarketOverviewList({ sort: "activity", sortDir: "desc" }),
          fetchCatalogStats(),
          isAuthenticated ? fetchWalletSummary(authorizedFetch).catch(() => null) : Promise.resolve(null),
          isAuthenticated ? fetchPortfolioOverview(authorizedFetch).catch(() => null) : Promise.resolve(null),
        ]);

        if (cancelled) return;

        const avgChange =
          overview.items.length > 0
            ? overview.items.reduce((acc, item) => acc + (Number.parseFloat(item.change24hPct) || 0), 0) /
              overview.items.length
            : null;
        const volumeTrend = formatPctChange(avgChange == null ? null : String(avgChange));
        const portfolioTrend = formatPctChange(portfolio?.change30dPct ?? null);

        const next: DashboardLandingStat[] = [
          {
            id: "volume",
            label: t("dashboard.stats.live.secondaryVolume.label"),
            value: formatUsdtRu(overview.aggregate.totalVolume24hUsdt),
            hint: t("dashboard.stats.live.secondaryVolume.hint"),
            trend: volumeTrend.trend,
            change: volumeTrend.change,
          },
          isAuthenticated && portfolio
            ? {
                id: "income",
                label: t("dashboard.stats.live.periodIncome.label"),
                value: `${formatUsdtFixedRu(Number.parseFloat(portfolio.realizedIncome) || 0)} USDT`,
                hint: t("dashboard.stats.live.periodIncome.hint"),
                trend: portfolioTrend.trend,
                change: portfolioTrend.change,
              }
            : {
                id: "listings",
                label: t("dashboard.stats.live.activeListings.label"),
                value: formatCount(catalogStats.activeSecondaryListings),
                hint: t("dashboard.stats.live.activeListings.hint"),
                trend: "flat",
              },
          {
            id: "releases",
            label: t("dashboard.stats.live.releases.label"),
            value: pluralProjects(catalogStats.publicReleases, t),
            hint: t("dashboard.stats.live.releases.hint"),
            trend: "flat",
          },
          isAuthenticated && wallet
            ? {
                id: "withdrawable",
                label: t("dashboard.stats.live.withdrawable.label"),
                value: formatUsdtRu(wallet.availableBalance),
                hint: t("dashboard.stats.live.withdrawable.hint"),
                trend: portfolioTrend.trend,
                change: portfolioTrend.change,
                href: withdrawHref,
                hrefLabel: withdrawLinkLabel,
              }
            : {
                id: "rounds",
                label: t("dashboard.stats.live.rounds.label"),
                value: formatCount(catalogStats.livePrimaryRounds),
                hint: t("dashboard.stats.live.rounds.hint"),
                trend: "flat",
              },
        ];

        setStats(next);
      } catch (err) {
        if (!cancelled) {
          setStats([]);
          setFetchError(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, demoStats, isAuthenticated, live, t, withdrawHref, withdrawLinkLabel, reloadTick]);

  return { stats, loading, live, fetchError, reload };
}