"use client";

import * as React from "react";

import { useI18n } from "@/components/providers/i18n-provider";
import { MOCK_YIELD_SERIES } from "@/constants/analytics/releases";
import { buildDetailedSeries } from "@/lib/analytics/detailed-series";
import { buildLinePath, paddedChartDomain } from "@/lib/analytics/chart-path";
import { buildYieldChartSeries, yieldChartDomain } from "@/lib/analytics/yield-chart-series";
import { releaseAnalyticsPeriodLabel } from "@/lib/analytics/period-label";
import type { ReleaseAnalyticsYieldDynamicsPoint } from "@/services/release-analytics.service";
import { cn } from "@/lib/utils";
import type { ReleaseAnalyticsPeriod } from "@/types/analytics/releases";

import { AnalyticsChartEmpty } from "./analytics-chart-empty";

const LINE = "#6B7CFF";

function xAxisTicks(len: number, period: ReleaseAnalyticsPeriod, chartX: number, chartW: number) {
  if (len <= 1) return [{ idx: 0, label: "сейчас", x: chartX }];
  const raw = [0, Math.round((len - 1) * 0.25), Math.round((len - 1) * 0.5), Math.round((len - 1) * 0.75), len - 1];
  const idxs = [...new Set(raw)].sort((a, b) => a - b);
  const spanDays = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 140;
  return idxs.map((idx) => {
    const ratio = idx / (len - 1);
    const daysBack = Math.round((1 - ratio) * spanDays);
    const label =
      idx === len - 1 || daysBack <= 0
        ? "сейчас"
        : idx === 0
          ? `−${spanDays}д`
          : `−${Math.max(1, daysBack)}д`;
    const x = chartX + ratio * chartW;
    return { idx, label, x };
  });
}

function fmtYieldPct(n: number, fractionDigits = 1) {
  return `${n.toLocaleString("ru-RU", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}%`;
}

function fmtSignedPp(n: number, fractionDigits = 2) {
  const s = Math.abs(n).toLocaleString("ru-RU", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  if (n > 0) return `+${s}`;
  if (n < 0) return `−${s}`;
  return s;
}

/** Shape a volatile path around a center value (for flat live series). */
function synthesizeAround(center: number, period: ReleaseAnalyticsPeriod): number[] {
  const source =
    period === "7d"
      ? MOCK_YIELD_SERIES.slice(-8)
      : period === "30d"
        ? MOCK_YIELD_SERIES.slice(-18)
        : period === "90d"
          ? MOCK_YIELD_SERIES.slice(-30)
          : MOCK_YIELD_SERIES;
  const baseMean = source.reduce((a, b) => a + b, 0) / source.length;
  const shifted = source.map((v) => Number((center + (v - baseMean) * 0.85).toFixed(2)));
  const detailStep = period === "7d" ? 7 : period === "30d" ? 6 : period === "90d" ? 5 : 4;
  return buildDetailedSeries(shifted, detailStep);
}

export function YieldDynamicsChart({
  period,
  yieldDynamics,
  mockMode = false,
  onRetry,
}: {
  period: ReleaseAnalyticsPeriod;
  yieldDynamics?: ReleaseAnalyticsYieldDynamicsPoint[] | null;
  mockMode?: boolean;
  onRetry?: () => void;
}) {
  const { t } = useI18n();
  const uid = React.useId().replace(/:/g, "");
  const clipId = `yield-clip-${uid}`;
  const areaId = `yield-area-${uid}`;
  const lineRef = React.useRef<SVGPathElement>(null);
  const [drawn, setDrawn] = React.useState(false);

  const rawValues = React.useMemo(
    () =>
      (yieldDynamics ?? [])
        .map((p) => Number(p.averageYieldPct))
        .filter((v) => Number.isFinite(v)),
    [yieldDynamics],
  );

  const rawSpan = rawValues.length ? Math.max(...rawValues) - Math.min(...rawValues) : 0;
  const useSynthetic = mockMode || rawValues.length < 2 || rawSpan < 0.25;

  const activeSeries = React.useMemo(() => {
    if (useSynthetic) {
      const center =
        rawValues.length > 0
          ? rawValues.reduce((a, b) => a + b, 0) / rawValues.length
          : MOCK_YIELD_SERIES[MOCK_YIELD_SERIES.length - 1]!;
      return synthesizeAround(center, period);
    }
    return buildYieldChartSeries(rawValues, period);
  }, [useSynthetic, period, rawValues]);

  const statsSeries = activeSeries;

  const [containerWidth, setContainerWidth] = React.useState(0);
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setContainerWidth(Math.floor(w));
    });
    ro.observe(el);
    setContainerWidth(Math.floor(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);

  // OKX-style draw animation whenever series / period changes.
  React.useEffect(() => {
    setDrawn(false);
    const path = lineRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    path.style.transition = "none";
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    // Force reflow then animate.
    void path.getBoundingClientRect();
    path.style.transition = "stroke-dashoffset 1.15s cubic-bezier(0.22, 1, 0.36, 1)";
    path.style.strokeDashoffset = "0";
    const t = window.setTimeout(() => setDrawn(true), 1180);
    return () => window.clearTimeout(t);
  }, [activeSeries, period, containerWidth]);

  const svgW = Math.max(containerWidth || 720, 400);
  const svgH = 360;
  const chartX = 48;
  const chartY = 28;
  const chartW = Math.max(svgW - chartX - 12, 160);
  const chartH = 260;
  const chartBottom = chartY + chartH;
  const axisLabelY = chartBottom + 20;

  const domain = useSynthetic ? paddedChartDomain(activeSeries) : yieldChartDomain(statsSeries);
  const domainMin = domain.min;
  const domainMax = domain.max;
  const last = statsSeries[statsSeries.length - 1] ?? 0;
  const prev = statsSeries[statsSeries.length - 2] ?? last;
  const delta = last - prev;
  const avg = statsSeries.reduce((acc, n) => acc + n, 0) / Math.max(statsSeries.length, 1);
  const hi = Math.max(...statsSeries);
  const lo = Math.min(...statsSeries);
  const range = hi - lo;

  const linePts = buildLinePath(activeSeries, chartW, chartH, 0, 0, domain)
    .split(" ")
    .map((pt) => {
      const [x, y] = pt.split(",").map(Number);
      return `${(x + chartX).toFixed(2)},${(y + chartY).toFixed(2)}`;
    });
  const activeLine = linePts.join(" ");
  const pathD = linePts
    .map((pt, i) => `${i === 0 ? "M" : "L"}${pt}`)
    .join(" ");
  const areaD = `${pathD} L${chartX + chartW},${chartBottom} L${chartX},${chartBottom} Z`;

  const pointCoords = activeSeries.map((v, i) => {
    const span = domainMax - domainMin || 1;
    const x = chartX + (i / Math.max(activeSeries.length - 1, 1)) * chartW;
    const clamped = Math.max(domainMin, Math.min(domainMax, v));
    const y = chartY + (1 - (clamped - domainMin) / span) * chartH;
    return { x, y, value: v, i };
  });

  // Hollow dots like OKX — every Nth point so it stays readable.
  const markerStep = Math.max(1, Math.floor(pointCoords.length / 18));
  const markerPoints = pointCoords.filter((_, i) => i % markerStep === 0 || i === pointCoords.length - 1);

  const ySpan = domainMax - domainMin || 1;
  const yTickFormat = ySpan < 2 ? (v: number) => v.toFixed(2) : (v: number) => v.toFixed(1);
  const yTicks = [domainMax, domainMin + ySpan * 0.66, domainMin + ySpan * 0.33, domainMin];
  const xTicks = React.useMemo(
    () => xAxisTicks(activeSeries.length, period, chartX, chartW),
    [activeSeries.length, period, chartX, chartW],
  );

  const idxDenom = Math.max(activeSeries.length - 1, 1);
  const spanY = domainMax - domainMin || 1;

  const handleSvgPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.type === "pointerleave" || e.type === "pointercancel") {
      setHoverIdx(null);
      return;
    }
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const xSvg = ((e.clientX - rect.left) / rect.width) * svgW;
    if (xSvg < chartX || xSvg > chartX + chartW) {
      setHoverIdx(null);
      return;
    }
    const t = (xSvg - chartX) / chartW;
    const idx = Math.round(t * idxDenom);
    setHoverIdx(Math.max(0, Math.min(activeSeries.length - 1, idx)));
  };

  const hoverX = hoverIdx !== null ? chartX + (hoverIdx / idxDenom) * chartW : null;
  const hY =
    hoverIdx !== null
      ? chartY +
        (1 - (Math.max(domainMin, Math.min(domainMax, activeSeries[hoverIdx]!)) - domainMin) / spanY) * chartH
      : null;

  const activePoint =
    hoverIdx !== null ? pointCoords[hoverIdx] : pointCoords.length ? pointCoords[pointCoords.length - 1] : null;
  const activeIndex = hoverIdx ?? Math.max(activeSeries.length - 1, 0);
  const baselineValue = statsSeries[0] ?? 0;
  const headValue = hoverIdx !== null ? (activePoint?.value ?? last) : last;
  const windowDelta = headValue - baselineValue;
  const windowPctDen = Math.max(Math.abs(baselineValue), 1e-6);
  const windowPct = (windowDelta / windowPctDen) * 100;

  // Approximate date label for tooltip.
  const spanDays = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 140;
  const tipDaysBack = Math.round((1 - activeIndex / idxDenom) * spanDays);
  const tipDate = tipDaysBack <= 0 ? "сейчас" : `−${tipDaysBack}д`;

  if (activeSeries.length === 0) {
    return (
      <div className="w-full min-w-0 rounded-xl bg-[#0d0d0d]">
        <AnalyticsChartEmpty
          title={t("analytics.yieldChart.emptyTitle")}
          body={`${t("analytics.yieldChart.emptyBody")} · ${releaseAnalyticsPeriodLabel(period)}`}
          onRetry={onRetry}
          retryLabel={t("analytics.releases.charts.retry")}
        />
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="w-full min-w-0 rounded-2xl bg-black p-4 md:p-5">
      <div className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold tracking-tight text-white">Динамика доходности</h3>
            <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
              Релизы
            </span>
            {useSynthetic ? (
              <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
                демо-серия
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-block size-2 rounded-full" style={{ background: LINE }} aria-hidden />
            <span className="text-[12px] text-zinc-500">Средняя доходность</span>
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-[34px]">
            {fmtYieldPct(headValue, 2)}
          </div>
          <div
            className={cn(
              "mt-1 font-mono text-sm font-semibold tabular-nums",
              windowDelta > 0 ? "text-[#22C55E]" : windowDelta < 0 ? "text-[#EF4444]" : "text-zinc-400",
            )}
          >
            {fmtSignedPp(windowDelta, 2)} п.п.{" "}
            <span className="text-zinc-500">
              (
              {Math.abs(windowPct) < 1e-6
                ? "0,0%"
                : `${windowPct >= 0 ? "+" : "−"}${Math.abs(windowPct).toLocaleString("ru-RU", {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 1,
                  })}%`}
              )
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:pt-1">
          <div className="rounded-lg border border-white/10 bg-[#111] px-3 py-1.5 text-[12px] font-medium text-zinc-200">
            {releaseAnalyticsPeriodLabel(period)}
          </div>
        </div>
      </div>

      <div className="w-full min-w-0">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          preserveAspectRatio="xMidYMid meet"
          className="block h-[42vh] min-h-[260px] w-full max-h-[480px] touch-none select-none"
          role="img"
          aria-label={t("analytics.yieldChart.aria")}
          onPointerMove={handleSvgPointer}
          onPointerDown={handleSvgPointer}
          onPointerLeave={handleSvgPointer}
          onPointerCancel={handleSvgPointer}
        >
          <defs>
            <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={LINE} stopOpacity="0.22" />
              <stop offset="100%" stopColor={LINE} stopOpacity="0" />
            </linearGradient>
            <clipPath id={clipId}>
              <rect x={chartX} y={chartY} width={chartW} height={chartH} />
            </clipPath>
          </defs>

          {yTicks.map((tick, i) => {
            const y = chartY + (i / Math.max(yTicks.length - 1, 1)) * chartH;
            return (
              <g key={`${tick}-${i}`}>
                <line
                  x1={chartX}
                  y1={y}
                  x2={chartX + chartW}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />
                <text x={8} y={y + 3} fill="#6B7280" fontSize="10" className="tabular-nums">
                  {yTickFormat(tick)}
                </text>
              </g>
            );
          })}

          <g clipPath={`url(#${clipId})`}>
            <path
              d={areaD}
              fill={`url(#${areaId})`}
              className={cn("transition-opacity duration-700", drawn ? "opacity-100" : "opacity-0")}
            />
            <path
              ref={lineRef}
              d={pathD}
              fill="none"
              stroke={LINE}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {drawn
              ? markerPoints.map((p) => (
                  <circle
                    key={`m-${p.i}`}
                    cx={p.x}
                    cy={p.y}
                    r="3.2"
                    fill="#000"
                    stroke={LINE}
                    strokeWidth="1.5"
                    opacity={drawn ? 1 : 0}
                    style={{ transition: "opacity 0.35s ease" }}
                  />
                ))
              : null}
          </g>

          {hoverX !== null && hY !== null ? (
            <g>
              <line
                x1={hoverX}
                y1={chartY}
                x2={hoverX}
                y2={chartBottom}
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="1"
                strokeDasharray="3 4"
              />
              <circle cx={hoverX} cy={hY} r="4" fill="#000" stroke={LINE} strokeWidth="2" />
            </g>
          ) : null}

          {activePoint && hoverIdx !== null ? (
            <g
              transform={`translate(${Math.min(Math.max(activePoint.x + 12, chartX + 4), chartX + chartW - 168)},${Math.max(activePoint.y - 58, chartY + 4)})`}
            >
              <rect width="160" height="52" rx="6" fill="#111111" stroke="rgba(255,255,255,0.12)" />
              <text x="10" y="18" fill="#9CA3AF" fontSize="11">
                {tipDate}
              </text>
              <text x="10" y="38" fill="#fff" fontSize="12" fontWeight="600">
                Доходность: {activePoint.value.toFixed(2)}%
              </text>
            </g>
          ) : null}

          {xTicks.map(({ idx, label, x }) => (
            <g key={`${idx}-${label}`}>
              <text x={x} y={axisLabelY} fill="#6B7280" fontSize="10" textAnchor="middle" className="tabular-nums">
                {label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label={t("analytics.yieldChart.stat.last")} value={last.toFixed(2)} />
        <Stat
          label={t("analytics.yieldChart.stat.deltaStep")}
          value={`${delta >= 0 ? "+" : ""}${delta.toFixed(2)}`}
          valueClass={delta >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"}
        />
        <Stat label={t("analytics.yieldChart.stat.avg")} value={avg.toFixed(2)} />
        <Stat label={t("analytics.yieldChart.stat.max")} value={hi.toFixed(2)} />
        <Stat label={t("analytics.yieldChart.stat.min")} value={lo.toFixed(2)} />
        <Stat label={t("analytics.yieldChart.stat.range")} value={range.toFixed(2)} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="px-1 py-1">
      <div className="text-[10px] font-medium uppercase tracking-wide text-zinc-600">{label}</div>
      <div className={cn("mt-1 font-mono text-sm font-semibold tabular-nums text-white", valueClass)}>{value}</div>
    </div>
  );
}