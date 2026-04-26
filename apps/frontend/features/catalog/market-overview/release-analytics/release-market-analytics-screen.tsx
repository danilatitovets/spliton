import type { ReleaseMarketAnalyticsPageData } from "@/types/catalog/release-market-analytics";

import { ReleaseAnalyticsChartsSection } from "./sections/release-analytics-charts-section";
import { ReleaseAnalyticsHeroMetrics } from "./sections/release-analytics-hero-metrics";
import { ReleaseAnalyticsLiquiditySection } from "./sections/release-analytics-liquidity-section";
import { ReleaseAnalyticsParamsSection } from "./sections/release-analytics-params-section";
import { ReleaseAnalyticsPayoutSection } from "./sections/release-analytics-payout-section";
import { ReleaseAnalyticsPeriodTable } from "./sections/release-analytics-period-table";
import { ReleaseAnalyticsRiskSection } from "./sections/release-analytics-risk-section";
import { ReleaseAnalyticsStickyHeader } from "./sections/release-analytics-sticky-header";

export function ReleaseMarketAnalyticsScreen({ data }: { data: ReleaseMarketAnalyticsPageData }) {
  return (
    <div className="flex min-h-0 flex-col bg-black font-sans text-white antialiased">
      <ReleaseAnalyticsStickyHeader header={data.header} />
      <main className="min-h-0 flex-1">
        <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8">
          <div className="space-y-10 pb-20 pt-6 md:space-y-12 md:pt-8">
            <ReleaseAnalyticsHeroMetrics hero={data.hero} />
            <ReleaseAnalyticsChartsSection charts={data.charts} releaseId={data.header.catalogReleaseId} />
            <ReleaseAnalyticsPeriodTable rows={data.periodTable} />
            <ReleaseAnalyticsLiquiditySection liquidity={data.liquidity} releaseId={data.header.catalogReleaseId} />
            <ReleaseAnalyticsParamsSection params={data.params} />
            <ReleaseAnalyticsPayoutSection payout={data.payoutInsights} />
            <ReleaseAnalyticsRiskSection notes={data.riskNotes} />
          </div>
        </div>
      </main>
    </div>
  );
}
