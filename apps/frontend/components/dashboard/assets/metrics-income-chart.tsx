"use client";

import { useMemo } from "react";

import { MetricsDetailChart, type MetricsPoint } from "@/components/dashboard/assets/metrics-charts";
import { MetricsInfoTip } from "@/components/dashboard/assets/metrics-info-tip";
import { assetsMutedCardClass } from "@/components/dashboard/assets/assets-ui";
import { useI18n } from "@/components/providers/i18n-provider";
import { EmptyState } from "@/components/shared/data-states/empty-state";
import { formatDate } from "@/lib/i18n/formatters";

export function MetricsIncomeChart({
  live = false,
  rows,
  loading = false,
}: {
  live?: boolean;
  rows?: { period: string; amount: string }[];
  loading?: boolean;
}) {
  const { t, locale } = useI18n();

  const series: MetricsPoint[] = useMemo(() => {
    if (!rows?.length) return [];
    return rows.map((row) => ({
      label: formatDate(`${row.period}-01`, locale, { month: "short", year: "2-digit" }),
      primary: Number.parseFloat(row.amount) || 0,
    }));
  }, [locale, rows]);

  if (!live) return null;

  return (
    <section className={assetsMutedCardClass} aria-label={t("assets.metrics.incomeChartAria")}>
      <div className="flex items-center gap-1.5">
        <h3 className="text-base font-semibold text-neutral-900">{t("assets.metrics.incomeChartTitle")}</h3>
        <MetricsInfoTip label={t("assets.metrics.infoLabel")}>{t("assets.metrics.incomeChartInfo")}</MetricsInfoTip>
      </div>
      <p className="mt-1 text-sm text-neutral-500">{t("assets.metrics.incomeChartHint")}</p>
      {loading && series.length === 0 ? (
        <div className="mt-4 h-56 animate-pulse rounded-2xl bg-neutral-50" />
      ) : series.length === 0 ? (
        <EmptyState
          situation="chartEmpty"
          title={t("assets.metrics.incomeChartTitle")}
          message={t("assets.metrics.payoutsAfterFirstPeriod")}
        />
      ) : (
        <div className="mt-3">
          <MetricsDetailChart series={series} showSecondary={false} valueIsPercent={false} tone="light" variant="bars" />
        </div>
      )}
    </section>
  );
}
