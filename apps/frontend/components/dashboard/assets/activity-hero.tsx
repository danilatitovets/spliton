"use client";

import { SplitonDarkSurface } from "@/components/dashboard/assets/spliton-dark-surface";
import { MetricsInfoTip } from "@/components/dashboard/assets/metrics-info-tip";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

type ActivityHeroProps = {
  live?: boolean;
  loading?: boolean;
  totalOps: string;
  deposits: string;
  latest: string;
};

/** Black Spliton bank-card hero for /assets/activity. */
export function ActivityHero({ live = false, loading, totalOps, deposits, latest }: ActivityHeroProps) {
  const { t } = useI18n();
  const infoLabel = t("activity.widgets.infoLabel");

  const cards = [
    {
      label: t("activity.widgets.summaryTotalOps"),
      value: loading ? "…" : totalOps,
      hint: t("activity.widgets.summaryTotalOpsHint"),
      info: t("activity.widgets.summaryTotalOpsHint"),
      mono: false,
    },
    {
      label: t("activity.widgets.summaryDeposits"),
      value: loading ? "…" : deposits,
      hint: "USDT",
      info: t("activity.widgets.summaryDepositsHint"),
      mono: true,
      tone: deposits.startsWith("+") ? "up" : "flat",
    },
    {
      label: t("activity.widgets.summaryLatest"),
      value: loading ? "…" : latest,
      hint: t("activity.widgets.summaryLatestHint"),
      info: t("activity.widgets.summaryLatestHint"),
      mono: false,
    },
  ] as const;

  return (
    <SplitonDarkSurface
      className="min-h-[13.5rem] sm:min-h-[14.5rem]"
      aria-label={t("activity.widgets.summaryAria")}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[13px] font-medium text-white/55">{t("meta.activity.title")}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
              {t("activity.title")}
            </h1>
            <MetricsInfoTip label={infoLabel} tone="onDark">
              {t("activity.widgets.heroInfo")}
            </MetricsInfoTip>
          </div>
          <p className="mt-1.5 max-w-xl text-sm text-white/40">{t("activity.widgets.historySubtitle")}</p>
        </div>
        {!live ? (
          <p className="rounded-full bg-[#2a2a2c] px-3 py-1 text-[11px] font-medium text-white/60">
            {t("assets.demoLabel")}
          </p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-3 sm:gap-3">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-[1.15rem] bg-[#1c1c1e]/92 px-4 py-3.5 backdrop-blur-[2px] sm:py-4"
          >
            <div className="flex items-center gap-1">
              <p className="text-xs text-white/45">{card.label}</p>
              <MetricsInfoTip label={infoLabel} tone="onDark">
                {card.info}
              </MetricsInfoTip>
            </div>
            <p
              className={cn(
                "mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl",
                card.mono && "font-mono tabular-nums",
                "tone" in card && card.tone === "up" ? "text-[#60a5fa]" : "text-white",
              )}
            >
              {card.value}
            </p>
            <p className="mt-1 text-xs text-white/35">{card.hint}</p>
          </article>
        ))}
      </div>
    </SplitonDarkSurface>
  );
}
