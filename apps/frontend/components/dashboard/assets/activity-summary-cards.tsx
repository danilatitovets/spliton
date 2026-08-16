"use client";

import { MetricsInfoTip } from "@/components/dashboard/assets/metrics-info-tip";
import { assetsMutedCardClass } from "@/components/dashboard/assets/assets-ui";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

export function ActivitySummaryCards({
  totalOps,
  deposits,
  latest,
  loading,
}: {
  totalOps: string;
  deposits: string;
  latest: string;
  loading?: boolean;
}) {
  const { t } = useI18n();
  const infoLabel = t("activity.widgets.infoLabel");

  if (loading) {
    return (
      <section aria-label={t("activity.widgets.summaryAria")} className="grid grid-cols-3 gap-2 sm:gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-neutral-50 sm:h-24" />
        ))}
      </section>
    );
  }

  const cards = [
    {
      label: t("activity.widgets.summaryTotalOps"),
      value: totalOps,
      info: t("activity.widgets.summaryTotalOpsHint"),
      mono: false,
    },
    {
      label: t("activity.widgets.summaryDeposits"),
      value: deposits,
      info: t("activity.widgets.summaryDepositsHint"),
      mono: true,
    },
    {
      label: t("activity.widgets.summaryLatest"),
      value: latest,
      info: t("activity.widgets.summaryLatestHint"),
      mono: false,
    },
  ];

  return (
    <section aria-label={t("activity.widgets.summaryAria")} className="grid grid-cols-3 gap-2 sm:gap-4">
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
              item.mono && item.value.startsWith("+") && "text-blue-600",
            )}
          >
            {item.value}
          </p>
        </article>
      ))}
    </section>
  );
}
