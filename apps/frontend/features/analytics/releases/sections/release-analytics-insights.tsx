"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { ExchangeNeonSparkline, type ExchangeNeonTrend } from "@/components/shared/charts/exchange-neon-sparkline";
import { AnalyticsHeaderTip } from "../ui/analytics-header-tip";
import { analyticsReleaseDetailPath } from "@/constants/routes";
import { directionFromChangePct, parseSignedPercentChange } from "@/lib/analytics/change-pct";
import { releaseAnalyticsPeriodLabel } from "@/lib/analytics/period-label";
import { resolveCatalogCoverUrl } from "@/lib/catalog/catalog-demo-covers";
import { cn } from "@/lib/utils";
import type { ReleaseAnalyticsPeriod, ReleaseAnalyticsRow } from "@/types/analytics/releases";

const shell = "rounded-xl bg-[#111111] p-4 md:p-5";
const UP = "#C1FF72";
const DOWN = "#FF4D8D";
const BLUE = "#6B7CFF";

function parseYield(y: string) {
  return Number(y.replace("%", "").replace(",", ".").replace("−", "-")) || 0;
}

function sparkVolatility(values: number[]) {
  if (values.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < values.length; i++) sum += Math.abs(values[i]! - values[i - 1]!);
  return sum / (values.length - 1);
}

/** Динамика доходности вокруг headline-значения (%). */
function buildYieldSparkline(values: number[], yieldPct: string): number[] {
  if (values.length < 2) return values;
  const target = parseYield(yieldPct);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const swing = Math.max(target * 0.07, 0.35);
  return values.map((v) => target + ((v - min) / span - 0.5) * swing * 2);
}

/** Сглаженная почти плоская линия — соответствует низкой волатильности. */
function buildStabilitySparkline(values: number[]): number[] {
  if (!values.length) return values;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const smoothed = values.map((_, index) => {
    const window = values.slice(Math.max(0, index - 2), index + 1);
    return window.reduce((sum, v) => sum + v, 0) / window.length;
  });
  return smoothed.map((v) => mean + (v - mean) * 0.18);
}

/** Кумулятивное Δ от первой точки — форма роста/падения по changePct. */
function buildGrowthSparkline(values: number[], changePct: string): number[] {
  if (values.length < 2) return values;
  const change = parseSignedPercentChange(changePct);
  const base = values[0] ?? 1;
  const path = values.map((v) => ((v - base) / Math.max(Math.abs(base), 1e-6)) * 100);
  if (Math.abs(change) < 1e-6) {
    // Flat Δ still needs shape — mild oscillation so the line draws, not a blank bar.
    const mid = path.reduce((s, v) => s + v, 0) / path.length;
    return path.map((v, i) => mid + Math.sin(i * 0.9) * 0.35 + (v - mid) * 0.15);
  }
  return path;
}

type InsightPicks = {
  yield: ReleaseAnalyticsRow;
  stable: ReleaseAnalyticsRow;
  growth: ReleaseAnalyticsRow;
};

function pickInsightRows(rows: ReleaseAnalyticsRow[]): InsightPicks | null {
  if (!rows.length) return null;

  const used = new Set<string>();
  const pickOne = (sorted: ReleaseAnalyticsRow[]): ReleaseAnalyticsRow => {
    const fresh = sorted.find((row) => !used.has(row.id));
    const pick = fresh ?? sorted[0]!;
    used.add(pick.id);
    return pick;
  };

  const byYield = [...rows].sort((a, b) => parseYield(b.yieldPct) - parseYield(a.yieldPct));
  const yieldRow = pickOne(byYield);

  const flatCandidates = rows
    .filter((row) => Math.abs(parseSignedPercentChange(row.changePct)) < 1e-6)
    .sort((a, b) => sparkVolatility(a.sparkline) - sparkVolatility(b.sparkline));
  const byStability = [...rows].sort((a, b) => sparkVolatility(a.sparkline) - sparkVolatility(b.sparkline));
  const stableRow = pickOne(flatCandidates.length ? flatCandidates : byStability);

  const upCandidates = rows
    .filter((row) => parseSignedPercentChange(row.changePct) > 0)
    .sort((a, b) => parseSignedPercentChange(b.changePct) - parseSignedPercentChange(a.changePct));
  const byGrowth = [...rows].sort(
    (a, b) => parseSignedPercentChange(b.changePct) - parseSignedPercentChange(a.changePct),
  );
  const growthRow = pickOne(upCandidates.length ? upCandidates : byGrowth);

  return { yield: yieldRow, stable: stableRow, growth: growthRow };
}

function rowTrend(row: ReleaseAnalyticsRow): ExchangeNeonTrend {
  if (row.trend === "up" || row.trend === "down" || row.trend === "flat") return row.trend;
  return directionFromChangePct(row.changePct);
}

function genreRu(g: ReleaseAnalyticsRow["genre"]) {
  if (g === "hiphop") return "Hip-hop";
  if (g === "pop") return "Pop";
  return "Electronic";
}

function statusRu(s: ReleaseAnalyticsRow["status"]) {
  if (s === "Active") return "Активен";
  if (s === "Paused") return "Пауза";
  return "Закрыт";
}

function deltaTone(n: number) {
  if (n > 0) return "text-[#C1FF72]";
  if (n < 0) return "text-[#FF4D8D]";
  return "text-zinc-500";
}

function formatVol(v: number) {
  if (v < 0.005) return "низкая";
  if (v < 0.05) return v.toFixed(3).replace(".", ",");
  return v.toFixed(2).replace(".", ",");
}

function InsightCard({
  accent,
  eyebrow,
  tip,
  row,
  heroLabel,
  heroValue,
  heroTone,
  metaLeft,
  metaRight,
  sparkValues,
  sparkTrend,
}: {
  accent: string;
  eyebrow: string;
  tip?: string;
  row: ReleaseAnalyticsRow;
  heroLabel: string;
  heroValue: string;
  heroTone?: string;
  metaLeft: string;
  metaRight: string;
  sparkValues: number[];
  sparkTrend: ExchangeNeonTrend;
}) {
  const cover = resolveCatalogCoverUrl(undefined, row.id);
  const d = parseSignedPercentChange(row.changePct);

  return (
    <Link
      href={analyticsReleaseDetailPath(row.id)}
      className={cn(shell, "group relative flex h-full min-h-[220px] flex-col transition-colors hover:bg-[#141414]")}
      title={`${row.release} — открыть`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="size-1.5 shrink-0 rounded-full"
            style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
            aria-hidden
          />
          <p className="truncate text-[13px] font-semibold tracking-tight text-white">
            <AnalyticsHeaderTip label={eyebrow} tip={tip} />
          </p>
        </div>
        <span className="shrink-0 font-mono text-[10px] tabular-nums text-zinc-600">
          {genreRu(row.genre)} · {statusRu(row.status)}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2.5">
        <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/10">
          <Image src={cover} alt="" fill sizes="36px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-mono text-[14px] font-semibold text-white">
            {row.symbol}
            <span className="font-normal text-zinc-500"> / USDT</span>
          </p>
          <p className="truncate text-[12px] text-zinc-500">
            {row.release}
            <span className="text-zinc-600"> · {row.artist}</span>
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">{heroLabel}</p>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <span
            className={cn(
              "font-mono text-[32px] font-semibold leading-none tracking-tight tabular-nums sm:text-[36px]",
              heroTone ?? "text-white",
            )}
          >
            {heroValue}
          </span>
          <span className={cn("font-mono text-[13px] font-semibold tabular-nums", deltaTone(d))}>{row.changePct}</span>
        </div>
      </div>

      <div className="mt-4 min-h-0 flex-1">
        <ExchangeNeonSparkline
          values={sparkValues}
          trend={sparkTrend}
          width={280}
          height={56}
          fitContainer
          detailSegments={6}
          animateDraw
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
        <span className="truncate text-[11px] text-zinc-500">{metaLeft}</span>
        <span className="shrink-0 font-mono text-[11px] font-semibold tabular-nums text-zinc-300">{metaRight}</span>
      </div>
    </Link>
  );
}

export function ReleaseAnalyticsInsights({
  period,
  rows,
  stats,
}: {
  period: ReleaseAnalyticsPeriod;
  rows: ReleaseAnalyticsRow[];
  stats: { avgYield: string; active: string; payouts: string; payoutLag: string };
}) {
  const periodLabel = releaseAnalyticsPeriodLabel(period);
  const picks = React.useMemo(() => pickInsightRows(rows), [rows]);
  const empty = !rows.length;

  return (
    <section className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
        <p className="text-[13px] font-semibold tracking-tight text-white">
          <AnalyticsHeaderTip
            label="Инсайты"
            tip="Автовыбор лидеров по доходности, стабильности линии и изменению Δ в текущей выборке."
          />
        </p>
        <span className="rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] font-medium tabular-nums text-zinc-500">
          {periodLabel} · {rows.length}
        </span>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {empty || !picks ? (
          <div className={cn("lg:col-span-3", shell)}>
            <p className="text-[13px] font-semibold text-white">Нет данных</p>
            <p className="mt-1.5 text-[12px] text-zinc-500">Ослабьте фильтры — и инсайты появятся снова.</p>
          </div>
        ) : (
          <>
            <InsightCard
              accent={UP}
              eyebrow="Лидер доходности"
              tip="Релиз с максимальной доходностью в текущей выборке."
              row={picks.yield}
              heroLabel="Доходность"
              heroValue={picks.yield.yieldPct}
              heroTone="text-[#C1FF72]"
              metaLeft={`Среднее: ${stats.avgYield}`}
              metaRight={picks.yield.payouts}
              sparkValues={buildYieldSparkline(picks.yield.sparkline, picks.yield.yieldPct)}
              sparkTrend={rowTrend(picks.yield)}
            />
            <InsightCard
              accent={BLUE}
              eyebrow="Стабильность"
              tip="Минимальная волатильность линии sparkline при спокойном Δ."
              row={picks.stable}
              heroLabel="Волатильность"
              heroValue={formatVol(sparkVolatility(picks.stable.sparkline))}
              heroTone="text-white"
              metaLeft={`Лаг выплат: ${stats.payoutLag || "—"}`}
              metaRight={picks.stable.yieldPct}
              sparkValues={buildStabilitySparkline(picks.stable.sparkline)}
              sparkTrend="flat"
            />
            <InsightCard
              accent={DOWN}
              eyebrow="Рост Δ"
              tip="Максимальное положительное изменение Δ за период."
              row={picks.growth}
              heroLabel="Изменение Δ"
              heroValue={picks.growth.changePct}
              heroTone={deltaTone(parseSignedPercentChange(picks.growth.changePct))}
              metaLeft={`Доходность ${picks.growth.yieldPct}`}
              metaRight={picks.growth.payouts}
              sparkValues={buildGrowthSparkline(picks.growth.sparkline, picks.growth.changePct)}
              sparkTrend={directionFromChangePct(picks.growth.changePct)}
            />
          </>
        )}
      </div>
    </section>
  );
}
