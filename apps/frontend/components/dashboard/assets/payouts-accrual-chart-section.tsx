"use client";

import { PayoutsAccrualChart } from "@/components/dashboard/assets/payouts-accrual-chart";
import { AssetsEmptyIllustration } from "@/components/dashboard/assets/assets-empty-illustration";
import { assetsMutedCardClass } from "@/components/dashboard/assets/assets-ui";
import { useI18n } from "@/components/providers/i18n-provider";
import { ReadOnlySectionError } from "@/components/shared/data-states/read-only-section-error";
import { useCabinetDemoPreview } from "@/hooks/use-cabinet-demo-preview";
import { usePortfolioPayoutsChart } from "@/hooks/use-portfolio-payouts-chart";
import { isFinancialMockFallbackAllowed } from "@/lib/live-data-policy";

export function PayoutsAccrualChartSection({
  hideDemoBanner = false,
}: {
  /** Parent page already shows a demo banner. */
  hideDemoBanner?: boolean;
} = {}) {
  const { t } = useI18n();
  const demoPreview = useCabinetDemoPreview();
  const mockAllowed = isFinancialMockFallbackAllowed() || demoPreview;
  const chart = usePortfolioPayoutsChart("30d");

  if (!mockAllowed && !chart.live) {
    return (
      <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
        {t("payouts.chart.loginRequired")}
      </p>
    );
  }

  if (mockAllowed && !chart.live) {
    return (
      <div className="space-y-3">
        {!hideDemoBanner ? (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
            {t("payouts.chart.demoBanner")}
          </p>
        ) : null}
        <section className={`${assetsMutedCardClass} py-10 text-center shadow-none ring-0 sm:py-12`}>
          <AssetsEmptyIllustration situation="chartEmpty" size="md" />
          <p className="mt-4 text-base font-semibold text-neutral-900">{t("payouts.chart.empty")}</p>
        </section>
      </div>
    );
  }

  if (chart.loading && chart.series.length === 0) {
    return (
      <section className={`${assetsMutedCardClass} py-10 text-center shadow-none ring-0 sm:py-12`} aria-busy="true">
        <AssetsEmptyIllustration situation="chartEmpty" size="md" />
        <p className="mt-4 text-base font-semibold text-neutral-900">{t("payouts.chart.empty")}</p>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-neutral-500">{t("payouts.emptyAfterFirstPeriod")}</p>
      </section>
    );
  }

  if (chart.error) {
    return (
      <ReadOnlySectionError
        sectionId="payouts-accrual-chart"
        error={chart.error}
        onRetry={() => void chart.reload()}
      />
    );
  }

  if (chart.empty || chart.series.length === 0) {
    return (
      <section className={`${assetsMutedCardClass} py-10 text-center shadow-none ring-0 sm:py-12`}>
        <AssetsEmptyIllustration situation="chartEmpty" size="md" />
        <p className="mt-4 text-base font-semibold text-neutral-900">{t("payouts.chart.empty")}</p>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-neutral-500">{t("payouts.emptyAfterFirstPeriod")}</p>
      </section>
    );
  }

  return (
    <PayoutsAccrualChart
      data={chart.series}
      range={chart.range}
      onRangeChange={chart.setRange}
      liveSeries
    />
  );
}
