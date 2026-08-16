"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star } from "@/lib/lucide";

import { useI18n } from "@/components/providers/i18n-provider";
import { SortHeader } from "@/components/shared/exchange/sort-header";
import { analyticsReleaseDetailPath } from "@/constants/routes";
import { directionFromChangePct } from "@/lib/analytics/change-pct";
import { resolveCatalogCoverUrl } from "@/lib/catalog/catalog-demo-covers";
import { analyticsReleaseStatusLabel } from "@/lib/i18n/analytics-messages";
import { cn } from "@/lib/utils";
import type { ReleaseAnalyticsRow, ReleaseAnalyticsSortKey } from "@/types/analytics/releases";

import { AnalyticsHeaderTip } from "../ui/analytics-header-tip";
import { ReleasePayoutRangeBar } from "../ui/release-payout-range-bar";
import { ReleaseSparkline } from "../ui/release-sparkline";

export function ReleaseAnalyticsReleasesTable({
  rows,
  sort,
  sortDir,
  onSort,
  watch,
  onToggleWatch,
}: {
  rows: ReleaseAnalyticsRow[];
  sort: ReleaseAnalyticsSortKey;
  sortDir: "asc" | "desc";
  onSort: (k: ReleaseAnalyticsSortKey) => void;
  watch: Record<string, boolean>;
  onToggleWatch: (id: string) => void;
}) {
  const router = useRouter();
  const { t, locale } = useI18n();

  return (
    <div className="mt-2 overflow-hidden rounded-xl bg-[#0d0d0d]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left font-mono text-[13px] tabular-nums tracking-tight">
          <thead>
            <tr className="border-b border-white/[0.06] text-zinc-500">
              <th className="w-9 py-3 pr-1 pl-3" aria-label={t("analytics.releases.table.localMarkAria")} />
              <th className="py-3 pr-4 font-normal">
                <span className="text-[11px] font-medium">
                  <AnalyticsHeaderTip
                    label={t("analytics.releases.table.name")}
                    tip="Символ релиза и артист. Клик по строке открывает карточку."
                  />
                </span>
              </th>
              <th className="py-3 pr-3">
                <SortHeader
                  tone="neutral"
                  label={t("analytics.releases.table.yield")}
                  active={sort === "yield"}
                  dir={sort === "yield" ? sortDir : "desc"}
                  onClick={() => onSort("yield")}
                />
              </th>
              <th className="py-3 pr-3 text-right">
                <span className="text-[11px] font-medium">
                  <AnalyticsHeaderTip label="Δ 24ч" tip="Изменение за последние 24 часа относительно предыдущего закрытия." />
                </span>
              </th>
              <th className="py-3 pr-4">
                <span className="text-[11px] font-medium">
                  <AnalyticsHeaderTip
                    label={t("analytics.releases.table.dynamics")}
                    tip="Спарклайн доходности / цены за короткий горизонт."
                  />
                </span>
              </th>
              <th className="py-3 pr-4">
                <span className="text-[11px] font-medium">
                  <AnalyticsHeaderTip
                    label={t("analytics.releases.table.corridor")}
                    tip="Диапазон выплат: нижняя и верхняя оценка коридора."
                  />
                </span>
              </th>
              <th className="py-3 pr-3">
                <SortHeader
                  tone="neutral"
                  label={t("analytics.releases.table.payouts")}
                  active={sort === "payouts"}
                  dir={sort === "payouts" ? sortDir : "desc"}
                  onClick={() => onSort("payouts")}
                  align="right"
                />
              </th>
              <th className="py-3 pr-4">
                <SortHeader
                  tone="neutral"
                  label="Units"
                  active={sort === "units"}
                  dir={sort === "units" ? sortDir : "desc"}
                  onClick={() => onSort("units")}
                />
              </th>
              <th className="py-3 pr-3 font-normal">
                <span className="text-[11px] font-medium">
                  <AnalyticsHeaderTip label="Progress" tip="Прогресс первичного раунда, % от цели." />
                </span>
              </th>
              <th className="py-3 pr-3 font-normal">
                <span className="text-[11px] font-medium">
                  <AnalyticsHeaderTip label="Raised" tip="Привлечённый объём на первичке (USDT)." />
                </span>
              </th>
              <th className="py-3 pr-3 font-normal">
                <span className="text-[11px] font-medium">
                  <AnalyticsHeaderTip label="Holders" tip="Число уникальных держателей UNT." />
                </span>
              </th>
              <th className="py-3 pr-4 pl-0 font-normal">
                <span className="text-[11px] font-medium">{t("analytics.releases.table.status")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const watched = !!watch[r.id];
              const deltaDir = directionFromChangePct(r.changePct);
              const deltaClass =
                deltaDir === "up"
                  ? "text-[#00C087]"
                  : deltaDir === "down"
                    ? "text-[#FF4D4F]"
                    : "text-sky-400";
              const go = () => router.push(analyticsReleaseDetailPath(r.id));
              const cover = resolveCatalogCoverUrl(undefined, r.id);
              return (
                <tr
                  key={r.id}
                  tabIndex={0}
                  aria-label={t("analytics.releases.table.openReleaseAria").replace("{name}", r.release)}
                  className="cursor-pointer text-zinc-300 transition-colors hover:bg-white/[0.035]"
                  onClick={go}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      go();
                    }
                  }}
                >
                  <td className="py-2.5 pl-3 pr-1 align-middle">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatch(r.id);
                      }}
                      className="flex size-8 items-center justify-center text-zinc-600 transition-colors hover:text-zinc-300"
                      aria-label={
                        watched
                          ? t("analytics.releases.table.watchRemoveAria")
                          : t("analytics.releases.table.watchAddAria")
                      }
                      title={t("analytics.releases.table.watchTitle")}
                    >
                      <Star
                        className={cn(
                          "size-4",
                          watched ? "fill-amber-400/20 text-amber-300/90" : "fill-none",
                        )}
                        strokeWidth={1.5}
                      />
                    </button>
                  </td>
                  <td className="py-2.5 pr-4 align-middle">
                    <div className="flex items-center gap-2.5">
                      <div className="relative size-7 shrink-0 overflow-hidden rounded-full bg-zinc-800">
                        <Image src={cover} alt="" fill sizes="28px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                          <span className="font-semibold tracking-tight text-white">
                            {r.symbol}
                            <span className="font-normal text-zinc-500"> / USDT</span>
                          </span>
                          <span className="truncate font-sans text-[12px] text-zinc-500">{r.release}</span>
                        </div>
                        <div className="font-sans text-[11px] text-zinc-600">{r.artist}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 align-middle">
                    <span className="font-semibold text-zinc-100">{r.yieldPct}</span>
                  </td>
                  <td className="py-2.5 pr-3 text-right align-middle">
                    <span className={cn("text-[13px] font-semibold", deltaClass)}>{r.changePct}</span>
                  </td>
                  <td className="py-2.5 pr-4 align-middle">
                    <ReleaseSparkline values={r.sparkline} trend={r.trend} changePct={r.changePct} />
                  </td>
                  <td className="py-2.5 pr-4 align-middle">
                    <ReleasePayoutRangeBar {...r.payoutBand} />
                  </td>
                  <td className="py-2.5 pr-3 align-middle text-white">{r.payouts}</td>
                  <td className="py-2.5 pr-4 align-middle text-zinc-400">{r.units}</td>
                  <td className="py-2.5 pr-3 align-middle text-zinc-400">
                    {r.progressPercent != null ? `${Math.round(r.progressPercent)}%` : "—"}
                  </td>
                  <td className="py-2.5 pr-3 align-middle text-zinc-300">{r.raisedUsdt ?? "—"}</td>
                  <td className="py-2.5 pr-3 align-middle text-zinc-300">
                    {r.holdersCount != null ? r.holdersCount : "—"}
                  </td>
                  <td className="py-2.5 pr-4 align-middle font-sans text-[12px] text-zinc-500">
                    {analyticsReleaseStatusLabel(r.status, locale)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length === 0 ? (
        <div className="py-12 text-center font-sans text-[13px] text-zinc-500">{t("analytics.releases.table.empty")}</div>
      ) : null}
    </div>
  );
}