import { secondaryMarketHref } from "@/constants/dashboard/secondary-market";
import { analyticsReleasePersonalLedgerPath } from "@/constants/routes";
import { getSecondaryMarketStackHrefForAnalyticsCatalogId } from "@/mocks/dashboard/secondary-market-listings.mock";
import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";

import { ReleaseDetailAbout } from "./release-detail-about";
import { ReleaseDetailFaq } from "./release-detail-faq";
import { ReleaseDetailHero } from "./release-detail-hero";
import { ReleaseDetailHow } from "./release-detail-how";
import { ReleaseDetailPayoutHistory } from "./release-detail-payout-history";
import { ReleaseDetailPerformanceChart } from "./release-detail-performance-chart";
import { ReleaseDetailSecondaryOrderPage } from "./release-detail-secondary-order-page";
import { ReleaseDetailSecondary } from "./release-detail-secondary";
import { ReleaseDetailSidebar } from "./release-detail-sidebar";
import { ReleaseDetailStatsRow } from "./release-detail-stats-row";
import { ReleaseDetailTerms } from "./release-detail-terms";

export function ReleaseDetailScreen({
  data,
  source,
  showPersonalLedger = false,
}: {
  data: ReleaseDetailPageData;
  source?: string;
  /** `?view=ledger` — заявки, позиция и персональная история; не карточка актива. */
  showPersonalLedger?: boolean;
}) {
  if (showPersonalLedger) {
    return <ReleaseDetailSecondaryOrderPage data={data} contextFrom={source} />;
  }

  const secondaryStackHref =
    source === "secondary" ? getSecondaryMarketStackHrefForAnalyticsCatalogId(data.row.id) : undefined;
  const secondaryBuyHref =
    source === "secondary" ? (secondaryStackHref ?? secondaryMarketHref("market")) : undefined;
  const secondaryBuyLabel =
    source === "secondary" ? (secondaryStackHref ? "К стакану" : "На рынок") : undefined;

  const personalLedgerHref = analyticsReleasePersonalLedgerPath(data.row.id, source ? { from: source } : undefined);

  return (
    <div className="bg-black text-white">
      <div className="mx-auto w-full max-w-[1320px] px-4 pb-16 pt-6 md:px-6 lg:px-8 lg:pb-24 lg:pt-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(360px,100%)] lg:items-start">
          <div className="min-w-0">
            <ReleaseDetailHero data={data} source={source} />
          </div>
          <div>
            <ReleaseDetailSidebar data={data} personalLedgerHref={personalLedgerHref} />
          </div>
        </div>

        <div className="mt-10">
          <ReleaseDetailPerformanceChart
            title={data.performance.title}
            subtitle={data.performance.subtitle}
            seriesByPeriod={data.performance.seriesByPeriod}
            miniStats={data.performance.miniStats}
            releaseId={data.row.id}
            buyHref={secondaryBuyHref}
            buyLabel={secondaryBuyLabel}
          />
        </div>

        <div className="mt-6">
          <ReleaseDetailStatsRow data={data} />
        </div>

        <ReleaseDetailAbout data={data} />
        <ReleaseDetailHow data={data} />
        <ReleaseDetailTerms data={data} />
        <ReleaseDetailPayoutHistory data={data} />
        <ReleaseDetailSecondary data={data} />
        <ReleaseDetailFaq data={data} />
      </div>
    </div>
  );
}
