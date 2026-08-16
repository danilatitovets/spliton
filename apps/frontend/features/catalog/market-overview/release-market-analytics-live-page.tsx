"use client";

import { useEffect, useState } from "react";

import { useI18n } from "@/components/providers/i18n-provider";
import { ReleaseNotFoundGlassPanel } from "@/components/shared/release-not-found-glass-panel";
import { ReleaseMarketAnalyticsScreen } from "@/features/catalog/market-overview/release-analytics/release-market-analytics-screen";
import { ROUTES } from "@/constants/routes";
import { getCatalogReleaseMarketAnalyticsPageData } from "@/lib/catalog/release-market-analytics";
import { buildReleaseMarketAnalyticsFromOverviewDetail } from "@/lib/market-overview/market-overview-adapter";
import { fetchMarketOverviewDetail } from "@/services/market-overview.service";
import { getWalletDataSource } from "@/services/wallet.service";
import type { ReleaseMarketAnalyticsPageData } from "@/types/catalog/release-market-analytics";

export function ReleaseMarketAnalyticsLivePage({ releaseId }: { releaseId: string }) {
  const { t } = useI18n();
  const live = getWalletDataSource() === "live";
  const [data, setData] = useState<ReleaseMarketAnalyticsPageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!live) {
      setData(getCatalogReleaseMarketAnalyticsPageData(releaseId) ?? null);
      return;
    }
    void fetchMarketOverviewDetail(releaseId, { period: "30d" })
      .then((detail) => {
        setData(buildReleaseMarketAnalyticsFromOverviewDetail(detail));
        setError(null);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Не удалось загрузить аналитику");
        setData(null);
      });
  }, [live, releaseId]);

  if (!live && !data) {
    return (
      <ReleaseNotFoundGlassPanel
        title={t("catalog.releaseAnalytics.notFound")}
        description={t("notFound.catalogRelease.description")}
        primaryHref={ROUTES.catalogMarketOverview}
        primaryLabel={t("notFound.catalogRelease.cta")}
        secondaryHref={ROUTES.dashboardCatalog}
        secondaryLabel={t("notFound.goCatalog")}
      />
    );
  }

  if (live && error) {
    return (
      <ReleaseNotFoundGlassPanel
        title={t("catalog.releaseAnalytics.notFound")}
        description={error}
        primaryHref={ROUTES.catalogMarketOverview}
        primaryLabel={t("notFound.catalogRelease.cta")}
        secondaryHref={ROUTES.dashboardCatalog}
        secondaryLabel={t("notFound.goCatalog")}
      />
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-white">
        <p>{t("catalog.releaseAnalytics.loading")}</p>
      </div>
    );
  }

  return <ReleaseMarketAnalyticsScreen data={data} />;
}
