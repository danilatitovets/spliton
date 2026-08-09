"use client";

import { AssetsEmptyIllustration } from "@/components/dashboard/assets/assets-empty-illustration";
import { assetsMutedCardClass } from "@/components/dashboard/assets/assets-ui";
import { useI18n } from "@/components/providers/i18n-provider";
import { usePayoutsOverview } from "@/hooks/use-payouts-overview";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { formatDate, formatUsdtAmount } from "@/lib/i18n/formatters";
import { tf } from "@/lib/i18n/financial-messages";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

function formatUsdt(value: string, locale: Parameters<typeof formatUsdtAmount>[1]) {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return `${formatUsdtAmount(n, locale)} USDT`;
}

function PayoutKpiGrid({
  cards,
}: {
  cards: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl bg-neutral-50 px-4 py-4 shadow-none ring-0 sm:px-5">
          <p className="text-xs text-neutral-500">{card.label}</p>
          <p className="mt-1.5 font-mono text-base font-semibold tracking-tight text-neutral-900 sm:text-lg">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function PayoutsOverviewSummary({
  embedded = false,
}: {
  /** Compact empty states + demo KPIs when live payouts are off. */
  embedded?: boolean;
} = {}) {
  const { t, locale } = useI18n();
  const { live, data, loading, error, reload } = usePayoutsOverview();

  if (!live) {
    if (!embedded) return null;
    return (
      <PayoutKpiGrid
        cards={[
          { label: t("payouts.kpi.totalAccrued"), value: formatUsdt("1482.60", locale) },
          { label: t("payouts.kpi.totalPaid"), value: formatUsdt("1196.20", locale) },
          { label: t("payouts.kpi.pending"), value: formatUsdt("120.00", locale) },
          { label: t("payouts.kpi.available"), value: formatUsdt("286.40", locale) },
          { label: t("payouts.kpi.locked"), value: formatUsdt("48.00", locale) },
        ]}
      />
    );
  }

  // Prefer instant empty shell over a multi-second pulse skeleton.
  if (loading && !data) {
    return (
      <section
        className={cn(
          assetsMutedCardClass,
          "text-center shadow-none ring-0",
          embedded ? "py-8 sm:py-9" : "py-10 sm:py-12",
        )}
        aria-busy="true"
      >
        <AssetsEmptyIllustration situation="payoutsPending" size={embedded ? "md" : "lg"} />
        <p className="mt-5 text-base font-semibold text-neutral-900">{t("payouts.emptyTitle")}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">{t("payouts.emptyAfterFirstPeriod")}</p>
      </section>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
        {error}
        <button type="button" className="ml-3 font-semibold underline" onClick={() => void reload()}>
          {t("actions.retry")}
        </button>
      </div>
    );
  }

  if (!data) return null;

  const cards = [
    { label: t("payouts.kpi.totalAccrued"), value: formatUsdt(data.totalAccruedUsdt, locale) },
    { label: t("payouts.kpi.totalPaid"), value: formatUsdt(data.totalPaidUsdt, locale) },
    { label: t("payouts.kpi.pending"), value: formatUsdt(data.pendingPayoutUsdt, locale) },
    { label: t("payouts.kpi.available"), value: formatUsdt(data.availableBalance, locale) },
    { label: t("payouts.kpi.locked"), value: formatUsdt(data.lockedBalance, locale) },
  ];

  const hasAnyData =
    Number(data.totalAccruedUsdt) > 0 ||
    Number(data.totalPaidUsdt) > 0 ||
    Number(data.availableBalance) > 0;

  if (!hasAnyData) {
    return (
      <section
        className={cn(
          assetsMutedCardClass,
          "text-center shadow-none ring-0",
          embedded ? "py-8 sm:py-9" : "py-10 sm:py-12",
        )}
      >
        <AssetsEmptyIllustration situation="payoutsPending" size={embedded ? "md" : "lg"} />
        <p className="mt-5 text-base font-semibold text-neutral-900">{t("payouts.emptyTitle")}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">{t("payouts.emptyAfterFirstPeriod")}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <SplitonCtaPill href={`${ROUTES.dashboardPayouts}/deposit`} tone="onLight">
            {t("activity.depositUsdt")}
          </SplitonCtaPill>
          <SplitonCtaPill href={ROUTES.dashboardCatalog} tone="onLight" variant="ghost" withArrow={false}>
            {t("activity.openCatalog")}
          </SplitonCtaPill>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <PayoutKpiGrid cards={cards} />

      {data.latestPayout ? (
        <p className="text-xs text-neutral-500">
          {tf(t("payouts.kpi.latestPayout"), {
            date: formatDate(new Date(data.latestPayout.paidAt), locale, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
            amount: formatUsdt(data.latestPayout.amountUsdt, locale),
            release: data.latestPayout.releaseTitle ?? "—",
          })}
        </p>
      ) : null}
    </div>
  );
}
