"use client";

import {
  assetsChartSlotClass,
  assetsMutedCardClass,
  assetsPanelClass,
} from "@/components/dashboard/assets/assets-ui";
import { MetricsInfoTip } from "@/components/dashboard/assets/metrics-info-tip";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/data-states/empty-state";
import { formatUsdtAmount } from "@/lib/i18n/formatters";
import { emptyAmountLabel } from "@/lib/analytics/display-value";
import type { PortfolioMetricsApi } from "@/services/portfolio.service";

function parseMoney(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

export function MetricsPerformanceCard({
  live = false,
  performance,
  loading = false,
}: {
  live?: boolean;
  performance?: PortfolioMetricsApi["performance"] | null;
  loading?: boolean;
}) {
  const { t, locale } = useI18n();
  const infoLabel = t("assets.metrics.infoLabel");

  if (!live) return null;

  const accrued = parseMoney(performance?.totalAccrued);
  const paid = parseMoney(performance?.realizedIncome);
  const pending = parseMoney(performance?.pendingPayouts);
  const hasData =
    (accrued != null && accrued > 0) ||
    (paid != null && paid > 0) ||
    (pending != null && pending > 0);

  const tiles = [
    {
      label: t("assets.metrics.kpiTotalAccrued"),
      value: accrued != null ? formatUsdtAmount(accrued, locale) : emptyAmountLabel(locale),
      info: t("assets.metrics.kpiTotalAccruedInfo"),
    },
    {
      label: t("assets.metrics.kpiTotalPaid"),
      value: paid != null ? formatUsdtAmount(paid, locale) : emptyAmountLabel(locale),
      info: t("assets.metrics.kpiTotalPaidInfo"),
    },
    {
      label: t("assets.metrics.kpiPendingPayouts"),
      value: pending != null ? formatUsdtAmount(pending, locale) : emptyAmountLabel(locale),
      info: t("assets.metrics.kpiPendingPayoutsInfo"),
    },
  ];

  return (
    <section className={cn(assetsMutedCardClass, "flex h-full flex-col gap-3")} aria-label={t("metrics.pnlAria")}>
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-base font-semibold tracking-tight text-neutral-900 sm:text-xl">
            {t("assets.metrics.accruedVsPaidTitle")}
          </h3>
          <MetricsInfoTip label={infoLabel}>{t("assets.metrics.accruedVsPaidInfo")}</MetricsInfoTip>
        </div>
        <p className="text-sm text-neutral-500">{t("assets.metrics.accruedVsPaidHint")}</p>
      </div>
      {loading && !performance ? (
        <div className={cn(assetsChartSlotClass)}>
          <div className="h-32 w-full animate-pulse rounded-2xl bg-neutral-100/80 sm:h-40" />
        </div>
      ) : !hasData ? (
        <div className={assetsChartSlotClass}>
          <EmptyState
            situation="payoutsPending"
            message={t("assets.metrics.payoutsAfterFirstPeriod")}
            className="py-0 sm:py-0"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
          {tiles.map((item) => (
            <article key={item.label} className={cn(assetsPanelClass, "px-3.5 py-3.5 sm:px-4 sm:py-4")}>
              <div className="flex items-center gap-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">{item.label}</p>
                <MetricsInfoTip label={infoLabel}>{item.info}</MetricsInfoTip>
              </div>
              <p className="mt-2 font-mono text-lg font-semibold tabular-nums text-neutral-900 sm:text-xl">{item.value}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
