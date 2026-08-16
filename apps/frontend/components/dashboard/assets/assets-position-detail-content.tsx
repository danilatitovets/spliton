"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AssetsPositionHoldingBar } from "@/components/dashboard/assets/assets-position-holding-bar";
import { positionPreviews } from "@/components/dashboard/assets/assets-mock-data";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { ReleaseDetailLivePage } from "@/features/analytics/releases/detail/release-detail-live-page";
import { ROUTES } from "@/constants/routes";
import { useCabinetDemoPreview } from "@/hooks/use-cabinet-demo-preview";
import { getHoldingPreviewForCatalogReleaseId, type LinkedHoldingPreview } from "@/lib/assets/holdings";
import { getReleaseDetailPageData } from "@/lib/analytics/release-detail";
import { adaptPositionRow } from "@/lib/portfolio/portfolio-adapter";
import { isLivePortfolioEnabled, isLiveReleaseAnalyticsEnabled } from "@/lib/public-env";
import {
  fetchPortfolioPositions,
  portfolioErrorMessage,
} from "@/services/portfolio.service";

function mockHoldingForId(id: string): LinkedHoldingPreview | undefined {
  return (
    getHoldingPreviewForCatalogReleaseId(id) ??
    (() => {
      const row = positionPreviews.find((p) => p.id === id || p.catalogReleaseId === id);
      if (!row?.catalogReleaseId || typeof row.heldUnits !== "number") return undefined;
      return { ...row, catalogReleaseId: row.catalogReleaseId, heldUnits: row.heldUnits };
    })()
  );
}

function matchesPositionKey(
  row: { id: string; releaseId: string; slug: string },
  id: string,
): boolean {
  return row.releaseId === id || row.slug === id || row.id === id;
}

export function AssetsPositionDetailContent({ id }: { id: string }) {
  const { t, locale } = useI18n();
  const { authorizedFetch, isAuthenticated } = useAuth();
  const demoPreview = useCabinetDemoPreview();
  const livePortfolio = isLivePortfolioEnabled() && isAuthenticated && !demoPreview;
  const liveAnalytics = isLiveReleaseAnalyticsEnabled() && !demoPreview;

  const [liveHolding, setLiveHolding] = useState<LinkedHoldingPreview | null>(null);
  const [liveReleaseKey, setLiveReleaseKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(livePortfolio);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!livePortfolio) {
      setLiveHolding(null);
      setLiveReleaseKey(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void fetchPortfolioPositions(authorizedFetch, { limit: 100 })
      .then((res) => {
        if (cancelled) return;
        const match = res.items.find((row) => matchesPositionKey(row, id));
        if (!match) {
          setLiveHolding(null);
          setLiveReleaseKey(id);
          return;
        }
        const adapted = adaptPositionRow(match, locale);
        const held = adapted.heldUnits;
        if (typeof held !== "number" || !Number.isFinite(held)) {
          setLiveHolding(null);
          setLiveReleaseKey(match.releaseId);
          return;
        }
        setLiveHolding({
          ...adapted,
          catalogReleaseId: match.releaseId,
          heldUnits: held,
        });
        setLiveReleaseKey(match.releaseId);
      })
      .catch((e) => {
        if (cancelled) return;
        setLiveHolding(null);
        setLiveReleaseKey(null);
        setError(portfolioErrorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, id, livePortfolio, locale]);

  const mockHolding = useMemo(() => (livePortfolio ? undefined : mockHoldingForId(id)), [id, livePortfolio]);
  const holding = livePortfolio ? liveHolding ?? undefined : mockHolding;
  const releaseId = liveReleaseKey ?? holding?.catalogReleaseId ?? id;
  const hasMockRelease = Boolean(getReleaseDetailPageData(releaseId));
  const canShowLiveRelease = liveAnalytics && Boolean(releaseId);

  if (livePortfolio && loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-black px-6 text-white">
        <p className="text-sm text-white/50">{t("positions.loading")}</p>
      </div>
    );
  }

  if (livePortfolio && error && !holding) {
    return (
      <div className="bg-black px-4 py-16 text-center text-white">
        <p className="text-lg font-semibold">{t("positions.errorUnavailable")}</p>
        <p className="mt-2 text-sm text-white/50">{error}</p>
        <Link
          href={ROUTES.dashboardPositions}
          className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black"
        >
          {t("positions.detail.backToList")}
        </Link>
      </div>
    );
  }

  if (!canShowLiveRelease && !hasMockRelease && !holding) {
    return (
      <div className="bg-black px-4 py-16 text-center text-white">
        <p className="text-lg font-semibold">{t("positions.detail.notFoundTitle")}</p>
        <p className="mt-2 text-sm text-white/50">{t("positions.detail.notFoundBody")}</p>
        <Link
          href={ROUTES.dashboardPositions}
          className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black"
        >
          {t("positions.detail.backToList")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-black text-white">
      {holding ? <AssetsPositionHoldingBar holding={holding} /> : null}
      <ReleaseDetailLivePage releaseId={releaseId} source="positions" showPersonalLedger />
    </div>
  );
}
