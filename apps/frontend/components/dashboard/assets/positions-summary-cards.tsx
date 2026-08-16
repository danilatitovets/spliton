"use client";

import { MetricsInfoTip } from "@/components/dashboard/assets/metrics-info-tip";
import { assetsMutedCardClass } from "@/components/dashboard/assets/assets-ui";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

export function PositionsSummaryCards({
  total,
  activeReleases,
  totalUnits,
  averageShare,
  loading,
}: {
  total: string;
  activeReleases: string;
  totalUnits: string;
  averageShare: string;
  loading?: boolean;
}) {
  const { t } = useI18n();
  const infoLabel = t("positions.widgets.infoLabel");

  if (loading) {
    return (
      <section aria-label={t("positions.widgets.summaryAria")} className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-neutral-50 sm:h-24" />
        ))}
      </section>
    );
  }

  const cards = [
    {
      label: t("positions.widgets.summaryTotal"),
      value: total,
      info: t("positions.widgets.summaryTotalInfo"),
    },
    {
      label: t("positions.widgets.summaryActiveReleases"),
      value: activeReleases,
      info: t("positions.widgets.summaryActiveReleasesInfo"),
    },
    {
      label: t("positions.widgets.summaryTotalUnits"),
      value: totalUnits,
      info: t("positions.widgets.summaryTotalUnitsInfo"),
      mono: true,
    },
    {
      label: t("positions.widgets.summaryAverageShare"),
      value: averageShare,
      info: t("positions.widgets.summaryAverageShareInfo"),
      mono: true,
    },
  ];

  return (
    <section aria-label={t("positions.widgets.summaryAria")} className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
      {cards.map((item) => (
        <article key={item.label} className={cn(assetsMutedCardClass, "px-3 py-3 sm:px-5 sm:py-4")}>
          <div className="flex min-w-0 items-center gap-1">
            <p className="min-w-0 truncate text-[11px] text-neutral-500 sm:text-sm">{item.label}</p>
            <MetricsInfoTip label={infoLabel}>{item.info}</MetricsInfoTip>
          </div>
          <p
            className={cn(
              "mt-1.5 truncate text-base font-semibold tracking-tight text-neutral-900 sm:mt-2 sm:text-[1.75rem]",
              item.mono && "font-mono tabular-nums",
            )}
          >
            {item.value}
          </p>
        </article>
      ))}
    </section>
  );
}
