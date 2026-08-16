"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { detailPageText } from "@/lib/i18n/analytics-detail-page-messages";
import { filterMetricRows } from "@/lib/analytics/display-value";
import type { ReleaseDetailPageData, ReleaseDetailQuickStat } from "@/types/analytics/release-detail";

import { ReleaseDetailKpiFlipCard } from "./release-detail-kpi-flip-card";

export function ReleaseDetailStatsRow({
  data,
  stats,
}: {
  data: ReleaseDetailPageData;
  /** Если задано — показываем только эти метрики (например компактная сводка на странице лота). */
  stats?: ReleaseDetailQuickStat[];
}) {
  const { locale } = useI18n();
  const items = filterMetricRows(stats ?? data.quickStats);
  if (items.length === 0) return null;

  const title = detailPageText(locale, "analytics.detail.market.statsTitle").replace(
    "{release}",
    data.row.release,
  );

  return (
    <section className="space-y-4" aria-label={title}>
      <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h2>
      <div
        className={
          items.length <= 3
            ? "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
            : "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4"
        }
      >
        {items.map((s) => (
          <ReleaseDetailKpiFlipCard key={s.label} stat={s} />
        ))}
      </div>
    </section>
  );
}
