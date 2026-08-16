"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { assetsDarkCardClass } from "@/components/dashboard/assets/assets-ui";
import { useI18n } from "@/components/providers/i18n-provider";
import { PAYOUTS_OVERVIEW_ICONS } from "@/constants/assets/payouts-overview-icons";
import { ROUTES } from "@/constants/routes";
import { formatUsdtAmount } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

type InsightTotals = {
  accrued: number;
  paid: number;
  pending: number;
  available: number;
};

function Gauge({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const angle = -90 + (clamped / 100) * 180;
  return (
    <div className="relative mx-auto h-[7.5rem] w-[11rem]">
      <svg viewBox="0 0 200 120" className="h-full w-full" aria-hidden>
        <path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          stroke="#2a2a2c"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#payoutGauge)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * 251} 251`}
        />
        <defs>
          <linearGradient id="payoutGauge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="45%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#B7F500" />
          </linearGradient>
        </defs>
        <g transform={`rotate(${angle} 100 100)`}>
          <line x1="100" y1="100" x2="100" y2="36" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="100" r="5" fill="#B7F500" />
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-x-0 bottom-1 text-center">
        <p className="font-mono text-2xl font-semibold tabular-nums text-white">{Math.round(clamped)}</p>
      </div>
    </div>
  );
}

export function PayoutsOverviewInsights({
  totals,
  hidden = false,
}: {
  totals: InsightTotals;
  hidden?: boolean;
}) {
  const { t, locale } = useI18n();
  const health = useMemo(() => {
    const flow = totals.accrued + totals.paid;
    if (flow <= 0) return 0;
    return Math.max(8, Math.min(96, Math.round((totals.available / Math.max(flow * 0.2, 1)) * 100)));
  }, [totals]);
  const longShare = Math.round((totals.accrued / Math.max(totals.accrued + totals.paid, 1)) * 100);
  const shortShare = 100 - longShare;

  return (
    <div className="grid gap-3 lg:grid-cols-3 lg:gap-4">
      <article className={cn(assetsDarkCardClass, "flex flex-col")}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Image src={PAYOUTS_OVERVIEW_ICONS.pulse} alt="" width={28} height={28} className="size-7 rounded-full" />
            <h3 className="text-sm font-semibold text-white">{t("payouts.kpi.available")}</h3>
          </div>
          <Link href={ROUTES.dashboardPayoutsComparison} className="text-[12px] font-medium text-[#B7F500] hover:underline">
            {t("payouts.nav.comparison")} ?
          </Link>
        </div>
        <div className="mt-3 flex flex-1 flex-col justify-center">
          <Gauge value={hidden ? 0 : health} />
          <div className="mt-2 flex items-center justify-between gap-2 text-[11px] font-medium">
            <span className="text-[#B7F500]">{longShare} {t("assets.overview.accruals")}</span>
            <span className="text-red-400">{shortShare} {t("assets.overview.withdrawals")}</span>
          </div>
          <div className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-[#2a2a2c]">
            <div className="h-full bg-[#B7F500]" style={{ width: `${longShare}%` }} />
            <div className="h-full bg-red-500/80" style={{ width: `${shortShare}%` }} />
          </div>
        </div>
      </article>

      <article className={cn(assetsDarkCardClass, "flex flex-col")}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Image src={PAYOUTS_OVERVIEW_ICONS.volume} alt="" width={28} height={28} className="size-7 rounded-full" />
            <h3 className="text-sm font-semibold text-white">{t("payouts.kpi.totalAccrued")}</h3>
          </div>
          <Link href={ROUTES.dashboardPayoutsHistory} className="text-[12px] font-medium text-[#B7F500] hover:underline">
            {t("payouts.nav.history")} ?
          </Link>
        </div>
        <div className="mt-5 flex flex-1 items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-[1.65rem]">
              {hidden ? "??????" : formatUsdtAmount(totals.accrued, locale as never)}
              <span className="ml-1.5 text-sm font-medium text-white/40">USDT</span>
            </p>
          </div>
        </div>
      </article>

      <article className={cn(assetsDarkCardClass, "flex flex-col")}>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-white">{t("payouts.schedule.title")}</h3>
          <Link href={ROUTES.dashboardCatalog} className="text-[12px] font-medium text-[#B7F500] hover:underline">
            {t("activity.openCatalog")} ?
          </Link>
        </div>
        <p className="mt-6 text-sm text-white/50">{t("payouts.chart.empty")}</p>
      </article>
    </div>
  );
}
