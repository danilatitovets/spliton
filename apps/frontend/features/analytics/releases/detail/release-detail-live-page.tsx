"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { ReleaseNotFoundGlassPanel } from "@/components/shared/release-not-found-glass-panel";
import { ReleaseDetailScreen } from "@/features/analytics/releases/detail/release-detail-screen";
import { ROUTES } from "@/constants/routes";
import { useApiErrorMessage } from "@/hooks/use-api-error-message";
import { useCabinetDemoPreview } from "@/hooks/use-cabinet-demo-preview";
import {
  adaptMyHistoryLedgerEvents,
  buildReleaseDetailPageDataFromFullApi,
} from "@/lib/analytics/release-analytics-adapter";
import { getReleaseDetailPageData } from "@/lib/analytics/release-detail";
import {
  chartPointsToValues,
  fetchMarketLiquidityChart,
  fetchMarketVolumeChart,
} from "@/services/market-charts.service";
import {
  fetchReleaseFullDetail,
  fetchReleaseMyHistory,
  fetchReleasePriceChart,
  isLiveReleaseAnalyticsEnabled,
} from "@/services/release-analytics.service";
import type { ReleaseLedgerEventUi } from "@/lib/analytics/release-analytics-adapter";
import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";

const RELEASE_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Props = {
  releaseId: string;
  source?: string;
  showPersonalLedger?: boolean;
};

function loadMockRelease(releaseId: string): ReleaseDetailPageData | null {
  return getReleaseDetailPageData(releaseId) ?? null;
}

/** Market charts DTO: UUID goes in releaseId, otherwise use slug. */
function chartIdentity(releaseKey: string): { releaseId?: string; slug?: string } {
  if (RELEASE_UUID_RE.test(releaseKey)) return { releaseId: releaseKey };
  return { slug: releaseKey };
}

export function ReleaseDetailLivePage({
  releaseId,
  source,
  showPersonalLedger,
}: Props) {
  const { authorizedFetch, isAuthenticated } = useAuth();
  const { locale, t } = useI18n();
  const { messageFor } = useApiErrorMessage();
  const demoPreview = useCabinetDemoPreview();
  // Backend resolves by id OR slug; do not gate live path on UUID-only.
  const canUseLiveApi =
    isLiveReleaseAnalyticsEnabled() && !demoPreview && releaseId.trim().length > 0;

  const [data, setData] = useState<ReleaseDetailPageData | null>(() =>
    canUseLiveApi ? null : loadMockRelease(releaseId),
  );
  const [ledgerEvents, setLedgerEvents] = useState<ReleaseLedgerEventUi[] | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(canUseLiveApi);
  const [chartLoading, setChartLoading] = useState(canUseLiveApi);

  useEffect(() => {
    if (!canUseLiveApi) {
      setData(loadMockRelease(releaseId));
      setLedgerEvents(undefined);
      setError(null);
      setLoading(false);
      setChartLoading(false);
      return;
    }

    let cancelled = false;
    const requestId = releaseId;
    const chartsKey = chartIdentity(requestId);
    setData((prev) =>
      prev?.row?.id === requestId || prev?.slug === requestId ? prev : null,
    );
    setLoading(true);
    setChartLoading(true);
    setError(null);
    const fetcher = isAuthenticated ? authorizedFetch : undefined;

    void fetchReleaseFullDetail(requestId, fetcher, locale)
      .then(async (detail) => {
        if (cancelled) return;
        setData(buildReleaseDetailPageDataFromFullApi(detail, null, undefined, locale));
        setLoading(false);

        const resolvedId = detail.identity?.id ?? requestId;
        const resolvedCharts = chartIdentity(resolvedId);

        const [chart, volume, liquidity, history] = await Promise.all([
          fetchReleasePriceChart(resolvedId, "30d", fetcher).catch(() => null),
          fetchMarketVolumeChart(resolvedCharts, "30d", fetcher).catch(() => null),
          fetchMarketLiquidityChart(resolvedCharts, "30d", fetcher).catch(() => null),
          showPersonalLedger && isAuthenticated
            ? fetchReleaseMyHistory(resolvedId, authorizedFetch).catch(() => null)
            : Promise.resolve(null),
        ]);
        if (cancelled) return;

        setData(
          buildReleaseDetailPageDataFromFullApi(
            detail,
            chart,
            {
              volumeUsdt: volume ? chartPointsToValues(volume) : undefined,
              volumeUnits: volume?.points.map((p) => p.values?.volumeUnits ?? 0),
              liquidityVolume24h: liquidity?.points.map(
                (p) => p.values?.volume24h ?? p.value,
              ),
              liquidityScore: liquidity?.points.map((p) => p.value),
            },
            locale,
          ),
        );
        if (history) {
          setData((prev) => (prev ? { ...prev, myHistory: history } : prev));
          setLedgerEvents(adaptMyHistoryLedgerEvents(history));
        } else {
          setLedgerEvents(undefined);
        }
        setChartLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        // Live mode must not silently fall back to mock financial data.
        setError(messageFor(e));
        setData(null);
        setLedgerEvents(undefined);
        setLoading(false);
        setChartLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    authorizedFetch,
    canUseLiveApi,
    isAuthenticated,
    locale,
    messageFor,
    releaseId,
    showPersonalLedger,
  ]);

  if (!canUseLiveApi && !data) {
    return (
      <ReleaseNotFoundGlassPanel
        title={t("analytics.detail.notFound")}
        description={t("notFound.analyticsRelease.description")}
        primaryHref={ROUTES.analyticsReleases}
        primaryLabel={t("notFound.analyticsRelease.cta")}
        secondaryHref={ROUTES.dashboardCatalog}
        secondaryLabel={t("notFound.goCatalog")}
      />
    );
  }

  if (canUseLiveApi && loading && !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-black px-6 text-white">
        <p className="text-sm text-zinc-400">{t("analytics.detail.loading")}</p>
      </div>
    );
  }

  if (canUseLiveApi && error) {
    return (
      <ReleaseNotFoundGlassPanel
        title={t("analytics.detail.notFound")}
        description={error}
        primaryHref={ROUTES.analyticsReleases}
        primaryLabel={t("notFound.analyticsRelease.cta")}
        secondaryHref={ROUTES.dashboardCatalog}
        secondaryLabel={t("notFound.goCatalog")}
      />
    );
  }

  if (!data) {
    return (
      <ReleaseNotFoundGlassPanel
        title={t("analytics.detail.notFound")}
        description={t("notFound.analyticsRelease.description")}
        primaryHref={ROUTES.analyticsReleases}
        primaryLabel={t("notFound.analyticsRelease.cta")}
        secondaryHref={ROUTES.dashboardCatalog}
        secondaryLabel={t("notFound.goCatalog")}
      />
    );
  }

  return (
    <ReleaseDetailScreen
      data={data}
      source={source}
      showPersonalLedger={showPersonalLedger}
      ledgerEvents={ledgerEvents}
      isLive={canUseLiveApi}
      chartLoading={chartLoading}
    />
  );
}
