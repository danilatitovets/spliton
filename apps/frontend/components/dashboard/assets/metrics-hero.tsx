"use client";

import { SplitonDarkSurface } from "@/components/dashboard/assets/spliton-dark-surface";
import { MetricsInfoTip } from "@/components/dashboard/assets/metrics-info-tip";
import { useI18n } from "@/components/providers/i18n-provider";
import { formatUsdtAmount } from "@/lib/i18n/formatters";
import { emptyAmountLabel } from "@/lib/analytics/display-value";
import type { PortfolioMetricsOverviewApi } from "@/services/portfolio.service";
import type { WalletSummary } from "@/services/wallet.service";

function parseMoney(raw: string | undefined | null): number | null {
  if (raw == null) return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

function fmt(value: string | null | undefined, locale: Parameters<typeof formatUsdtAmount>[1], fallback = "0.00"): string {
  const n = parseMoney(value ?? undefined);
  if (n == null) return fallback;
  return formatUsdtAmount(n, locale);
}

type MetricsHeroProps = {
  live?: boolean;
  overview?: PortfolioMetricsOverviewApi | null;
  wallet?: WalletSummary | null;
  loading?: boolean;
};

/** Black Spliton watermark hero for /assets/metrics — KPI strip on bank-card surface. */
export function MetricsHero({ live = false, overview, wallet, loading }: MetricsHeroProps) {
  const { t, locale } = useI18n();
  const infoLabel = t("assets.metrics.infoLabel");

  const holdings = live
    ? fmt(overview?.portfolioValueUsdt, locale, emptyAmountLabel(locale))
    : formatUsdtAmount(6520, locale);
  const available = live
    ? fmt(wallet?.availableBalance, locale, emptyAmountLabel(locale))
    : formatUsdtAmount(286.4, locale);
  const changeHint = overview?.change30dPct ?? "0,00%";

  const cards = [
    {
      label: t("assets.metrics.statHoldingsValue"),
      value: loading && !overview ? "…" : holdings,
      hint: t("assets.metrics.kpiPortfolioValueHint"),
      info: t("assets.metrics.statHoldingsValueInfo"),
    },
    {
      label: t("assets.metrics.statTodayChange"),
      value: loading && !overview ? "…" : formatUsdtAmount(0, locale),
      hint: changeHint,
      info: t("assets.metrics.statTodayChangeInfo"),
    },
    {
      label: t("assets.overview.walletAvailable"),
      value: loading && !wallet && live ? "…" : available,
      hint: "USDT",
      info: t("assets.metrics.statAvailableInfo"),
    },
  ];

  return (
    <SplitonDarkSurface
      className="min-h-0"
      aria-label={t("assets.metrics.kpiAria")}
      backgroundVideo="/videos/position-holding-bg.mp4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-white/55 sm:text-[13px]">{t("meta.metrics.title")}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <h1 className="truncate text-xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
              {t("assets.metrics.statHoldingsValue")}
            </h1>
            <MetricsInfoTip label={infoLabel} tone="onDark">
              {t("assets.metrics.statHoldingsValueInfo")}
            </MetricsInfoTip>
          </div>
        </div>
        {!live ? (
          <p className="shrink-0 rounded-full bg-[#2a2a2c] px-2.5 py-1 text-[10px] font-medium text-white/60 sm:px-3 sm:text-[11px]">
            {t("assets.demoLabel")}
          </p>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-1.5 sm:mt-6 sm:gap-3">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-xl bg-[#1c1c1e]/92 px-2 py-2.5 backdrop-blur-[2px] sm:rounded-[1.15rem] sm:px-4 sm:py-4"
          >
            <div className="flex min-w-0 items-center gap-0.5 sm:gap-1">
              <p className="min-w-0 truncate text-[10px] text-white/45 sm:text-xs">{card.label}</p>
              <MetricsInfoTip label={infoLabel} tone="onDark">
                {card.info}
              </MetricsInfoTip>
            </div>
            <p className="mt-1 truncate font-mono text-[13px] font-semibold tabular-nums tracking-tight text-white sm:mt-1.5 sm:text-2xl">
              {card.value}
            </p>
            <p className="mt-0.5 truncate text-[10px] text-white/35 sm:mt-1 sm:text-xs">{card.hint}</p>
          </article>
        ))}
      </div>
    </SplitonDarkSurface>
  );
}
