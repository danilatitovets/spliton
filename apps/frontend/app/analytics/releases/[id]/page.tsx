import type { Metadata } from "next";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ReleaseDetailLivePage } from "@/features/analytics/releases/detail/release-detail-live-page";
import { getReleaseDetailPageData } from "@/lib/analytics/release-detail";
import {
  analyticsReleasePageMetaAsync,
  analyticsReleasePageMetaTfAsync,
} from "@/lib/i18n/page-metadata";
import { resolveCatalogReleaseForPage } from "@/services/catalog.service";

type PageProps = { params: Promise<{ id: string }> };
type PageSearchParams = Promise<{ from?: string | string[]; view?: string | string[] }>;

/**
 * Metadata must stay cheap — never call /releases/:id/detail here.
 * That endpoint is heavy; catalog detail is cached (~200ms warm).
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const mock = getReleaseDetailPageData(id);
  if (mock) {
    return analyticsReleasePageMetaTfAsync(
      "meta.analyticsRelease.titleWithSymbol",
      "meta.analyticsRelease.descriptionWithRelease",
      { symbol: mock.row.symbol, title: mock.row.release },
    );
  }

  try {
    const catalog = await resolveCatalogReleaseForPage(id);
    if (catalog) {
      return analyticsReleasePageMetaTfAsync(
        "meta.analyticsRelease.titleWithSymbol",
        "meta.analyticsRelease.descriptionWithRelease",
        { symbol: catalog.symbol, title: catalog.title },
      );
    }
  } catch {
    // fall through
  }

  return analyticsReleasePageMetaAsync(
    "meta.analyticsRelease.title",
    "meta.analyticsRelease.description",
  );
}

export default async function AnalyticsReleaseDetailPage({
  params,
  searchParams,
}: PageProps & { searchParams: PageSearchParams }) {
  const { id } = await params;
  const { from, view } = await searchParams;
  const source = Array.isArray(from) ? from[0] : from;
  const viewParam = Array.isArray(view) ? view[0] : view;
  const showPersonalLedger = viewParam === "ledger";
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden">
      <div className="sticky top-0 z-120 shrink-0 bg-black">
        <DashboardHeader />
      </div>
      <div className="flex h-0 min-h-0 flex-1 flex-col overflow-auto" data-mobile-scroll-root>
        <ReleaseDetailLivePage
          releaseId={id}
          source={source}
          showPersonalLedger={showPersonalLedger}
        />
      </div>
    </div>
  );
}
