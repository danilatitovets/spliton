"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { formatNumber, formatUsdtAmount } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

const PILL_STOPS = [
  "#3B82F6",
  "#4F6EF5",
  "#6366F1",
  "#7C5CF0",
  "#8B5CF6",
  "#A855F7",
  "#C026D3",
  "#DB2777",
  "#EC4899",
];

function parsePct(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  const n = Number.parseFloat(String(raw).replace("%", "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function OverviewStatsCard({
  live = false,
  totalUsdt,
  change30dPct,
  positionCount,
  activeReleases,
  expectedPayoutsUsdt,
  availableUsdt,
  lockedUsdt,
}: {
  live?: boolean;
  totalUsdt?: number;
  change30dPct?: string | null;
  positionCount?: number;
  activeReleases?: number;
  expectedPayoutsUsdt?: number;
  availableUsdt?: number;
  lockedUsdt?: number;
}) {
  const { t, locale } = useI18n();

  const value = live ? (totalUsdt ?? 0) : (totalUsdt ?? 6520);
  const positions = live ? (positionCount ?? 0) : (positionCount ?? 4);
  const releases = live ? (activeReleases ?? 0) : (activeReleases ?? 2);
  const payouts = live ? (expectedPayoutsUsdt ?? 0) : (expectedPayoutsUsdt ?? 286.4);
  const pct = parsePct(change30dPct);
  const denom = (availableUsdt ?? 0) + (lockedUsdt ?? 0);
  const fill = denom > 0 ? (availableUsdt ?? 0) / denom : live ? 0 : 0.72;
  const lit = Math.round(fill * PILL_STOPS.length);

  return (
    <section
      className="rounded-[1.35rem] bg-[#1C1C1C] p-5 sm:rounded-[1.5rem] sm:p-6"
      aria-label={t("assets.overview.chartsAria")}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold tracking-tight text-white sm:text-[17px]">
          {t("assets.overview.statsTitle")}
        </h2>
        <span className="inline-flex h-8 items-center rounded-lg bg-[#2B2B2B] px-3 text-[12px] font-medium text-zinc-300">
          {t("assets.overview.statsAllTime")}
        </span>
      </div>

      <p className="mt-5 font-mono text-[1.85rem] font-semibold tabular-nums tracking-tight text-white sm:text-[2.15rem]">
        {formatUsdtAmount(value, locale)}
      </p>
      <p
        className={cn(
          "mt-1.5 text-[13px] font-medium tabular-nums",
          pct != null && pct < 0 ? "text-rose-400" : "text-[#22C55E]",
        )}
      >
        {pct == null
          ? t("overview.pnlTodayZero")
          : `${pct > 0 ? "+" : ""}${formatNumber(pct, locale)}% ${t("assets.overview.statsSinceMonth")}`}
      </p>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#2B2B2B] px-4 py-4">
          <p className="text-[1.05rem] font-semibold text-white">
            {positions} {t("assets.overview.statsPositions")}
          </p>
          <p className="mt-1 text-[12px] text-zinc-500">
            {releases} {t("assets.overview.statsActiveReleases")}
          </p>
        </div>
        <div className="rounded-2xl bg-[#2B2B2B] px-4 py-4">
          <p className="text-[1.05rem] font-semibold tabular-nums text-white">
            {formatUsdtAmount(payouts, locale)}
          </p>
          <p className="mt-1 text-[12px] text-zinc-500">{t("assets.overview.statsExpectedPayouts")}</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex h-9 items-stretch gap-1" aria-hidden>
          {PILL_STOPS.map((color, i) => (
            <span
              key={color}
              className="min-w-0 flex-1 rounded-full"
              style={{ backgroundColor: i < Math.max(lit, live ? 0 : 1) ? color : "rgba(255,255,255,0.08)" }}
            />
          ))}
        </div>
        <p className="mt-2 text-[12px] text-zinc-500">{t("assets.overview.statsAvailability")}</p>
      </div>
    </section>
  );
}
