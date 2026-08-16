"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { AssetsEmptyIllustration } from "@/components/dashboard/assets/assets-empty-illustration";
import { AssetsGptMenu } from "@/components/dashboard/assets/assets-gpt-menu";
import {
  assetsCardClass,
} from "@/components/dashboard/assets/assets-ui";
import { usePayoutsCompare, type PayoutCompareWindow } from "@/hooks/use-payouts-compare";
import { useI18n } from "@/components/providers/i18n-provider";
import { ReadOnlySectionError } from "@/components/shared/data-states/read-only-section-error";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { PAYOUTS_OVERVIEW_ICONS } from "@/constants/assets/payouts-overview-icons";
import { ROUTES } from "@/constants/routes";
import { formatDate, formatNumber } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

const WINDOWS: { id: PayoutCompareWindow; labelKey: string }[] = [
  { id: "7d", labelKey: "chart.range7d" },
  { id: "30d", labelKey: "chart.range30d" },
  { id: "90d", labelKey: "chart.range90d" },
];

function money(raw: string | number | null | undefined, locale: string) {
  const n = Number.parseFloat(String(raw ?? "0"));
  if (!Number.isFinite(n)) return formatNumber(0, locale as never);
  return formatNumber(Math.round(n * 100) / 100, locale as never);
}

function periodLabel(from: string, to: string, locale: string) {
  const opts = { day: "2-digit" as const, month: "2-digit" as const };
  return `${formatDate(new Date(from), locale as never, opts)} — ${formatDate(new Date(to), locale as never, opts)}`;
}

export function PayoutsComparisonPageContent() {
  const { t, locale } = useI18n();
  const [windowId, setWindowId] = useState<PayoutCompareWindow>("30d");
  const { live, demoPreview, data, loading, error, reload } = usePayoutsCompare(windowId);
  const useDemo = !live || demoPreview;

  const left = data?.left;
  const right = data?.right;

  const metrics = useMemo(() => {
    if (!left || !right) return null;
    const leftAcc = Number(left.accrualsUsdt) || 0;
    const rightAcc = Number(right.accrualsUsdt) || 0;
    const leftWd = Number(left.withdrawalsUsdt) || 0;
    const rightWd = Number(right.withdrawalsUsdt) || 0;
    const max = Math.max(leftAcc, rightAcc, 1);
    const heavier: "left" | "right" | "even" =
      Math.abs(rightAcc - leftAcc) < 0.05 * max ? "even" : rightAcc > leftAcc ? "right" : "left";
    return {
      netLeft: leftAcc - leftWd,
      netRight: rightAcc - rightWd,
      heavier,
      leftPeriod: periodLabel(left.from, left.to, locale),
      rightPeriod: periodLabel(right.from, right.to, locale),
      leftTitle: t(`assets.overview.pan.${left.titleKey}`),
      rightTitle: t(`assets.overview.pan.${right.titleKey}`),
    };
  }, [left, locale, right, t]);

  if (live && loading && !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-56 animate-pulse rounded-2xl bg-neutral-100" />
        <div className="h-56 animate-pulse rounded-2xl bg-neutral-100" />
      </div>
    );
  }

  if (live && error && !data) {
    return (
      <ReadOnlySectionError
        sectionId="payouts-compare"
        error={error}
        onRetry={() => void reload()}
      />
    );
  }

  const empty =
    !useDemo &&
    (!left ||
      !right ||
      data?.emptyReason === "INSUFFICIENT_DATA" ||
      (Number(left.accrualsUsdt) <= 0 &&
        Number(right.accrualsUsdt) <= 0 &&
        Number(left.withdrawalsUsdt) <= 0 &&
        Number(right.withdrawalsUsdt) <= 0));

  const windowOptions = WINDOWS.map((w) => ({ id: w.id, label: t(w.labelKey) }));

  return (
    <div className="space-y-4 pb-2 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-[1.75rem]">
          {t("meta.payouts.comparison.hero")}
        </h1>
        <AssetsGptMenu
          value={windowId}
          onChange={(id) => setWindowId(id as PayoutCompareWindow)}
          options={windowOptions}
          ariaLabel={t("payouts.balanceWindowAria")}
        />
      </div>

      {useDemo ? (
        <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900" role="status">
          {t("assets.overview.demoBanner")}
        </p>
      ) : null}

      {empty || !metrics || !left || !right ? (
        <section className={cn(assetsCardClass, "py-12 text-center sm:py-14")}>
          <AssetsEmptyIllustration situation="payoutsPending" size="lg" />
          <p className="mt-5 text-base font-semibold text-neutral-900">{t("payouts.compare.emptyTitle")}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">{t("payouts.compare.emptyBody")}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <SplitonCtaPill href={`${ROUTES.dashboardPayouts}/deposit`} tone="onLight" variant="accent">
              {t("payouts.nav.deposit")}
            </SplitonCtaPill>
            <SplitonCtaPill href={ROUTES.dashboardCatalog} tone="onLight" variant="ghost" withArrow={false}>
              {t("activity.openCatalog")}
            </SplitonCtaPill>
          </div>
        </section>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                key: "left",
                title: metrics.leftTitle,
                period: metrics.leftPeriod,
                accruals: left.accrualsUsdt,
                withdrawals: left.withdrawalsUsdt,
                net: metrics.netLeft,
                lead: metrics.heavier === "left",
                icon: PAYOUTS_OVERVIEW_ICONS.comparePrev,
              },
              {
                key: "right",
                title: metrics.rightTitle,
                period: metrics.rightPeriod,
                accruals: right.accrualsUsdt,
                withdrawals: right.withdrawalsUsdt,
                net: metrics.netRight,
                lead: metrics.heavier === "right",
                icon: PAYOUTS_OVERVIEW_ICONS.compareCurrent,
              },
            ].map((side) => (
              <article
                key={side.key}
                className={cn(
                  "relative isolate flex min-h-[280px] flex-col overflow-hidden rounded-[1.35rem] bg-black px-5 py-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] sm:min-h-[300px] sm:rounded-[1.75rem] sm:px-6 sm:py-6",
                  side.lead && "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.28)]",
                )}
              >
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage: `url('${PAYOUTS_OVERVIEW_ICONS.compareTexture}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: 0.88,
                  }}
                  aria-hidden
                />
                <div className="pointer-events-none absolute inset-0 bg-black/60" aria-hidden />

                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-white">{side.title}</p>
                    <p className="mt-1 font-mono text-[11px] text-white/80">{side.period}</p>
                  </div>
                  <Image
                    src={side.icon}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 shrink-0 rounded-full object-cover ring-1 ring-white/20"
                  />
                </div>

                <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-2 py-6 text-center">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white">
                    {t("assets.overview.netFlow")}
                  </p>
                  <p className="mt-3 font-mono text-[2.35rem] font-semibold leading-none tracking-tight text-white sm:text-[2.75rem]">
                    {side.net >= 0 ? "+" : "−"}
                    {money(Math.abs(side.net), locale)}
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">USDT</p>
                </div>

                <div className="relative z-10 mt-auto grid grid-cols-2 gap-3 border-t border-white/20 pt-4">
                  <div>
                    <p className="text-[11px] text-white">{t("assets.overview.accruals")}</p>
                    <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-white">
                      +{money(side.accruals, locale)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-white">{t("assets.overview.withdrawals")}</p>
                    <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-white">
                      −{money(side.withdrawals, locale)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {data?.deltaAccrualsPct != null ? (
            <div className="flex justify-center">
              <p className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-1.5 rounded-full bg-neutral-900 px-4 py-2 text-sm text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]">
                <span className="text-white/55">{t("assets.overview.deltaAccruals")}</span>
                <span className="font-mono font-semibold tabular-nums">
                  {data.deltaAccrualsPct >= 0 ? "+" : ""}
                  {data.deltaAccrualsPct.toFixed(2).replace(".", ",")}%
                </span>
                <span className="text-white/45">{t("payouts.deltaPrev")}</span>
              </p>
            </div>
          ) : null}

        </>
      )}
    </div>
  );
}
