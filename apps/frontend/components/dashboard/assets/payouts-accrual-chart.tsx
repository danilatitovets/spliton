"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import type { PayoutAccrualChartPoint, PayoutChartRangeId } from "@/components/dashboard/assets/payouts-mock-data";
import { getPayoutChartKpiSnapshot } from "@/components/dashboard/assets/payouts-mock-data";
import { assetsCardClass } from "@/components/dashboard/assets/assets-ui";
import { MetricsInfoTip } from "@/components/dashboard/assets/metrics-info-tip";
import { MetricsRangeMenu } from "@/components/dashboard/assets/metrics-range-menu";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

const VIEW_W = 960;
const VIEW_H = 320;
/** Запас слева/справа под подписи осей без обрезания и без «прыжков» при смене масштаба */
const PAD = { top: 22, right: 72, bottom: 56, left: 78 };

const strokeLine = "#111113";
const strokeLineSoft = "rgba(17,17,19,0.45)";
const fillBar = "rgba(220, 38, 38, 0.42)";
const fillBarHover = "rgba(220, 38, 38, 0.72)";

function niceStep(range: number, targetTicks: number) {
  const raw = range / Math.max(1, targetTicks);
  const pow10 = 10 ** Math.floor(Math.log10(raw));
  const err = raw / pow10;
  const nice = err <= 1 ? 1 : err <= 2 ? 2 : err <= 5 ? 5 : 10;
  return nice * pow10;
}

function buildTicks(min: number, max: number, count: number) {
  const step = niceStep(max - min || 1, count);
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step * 0.001; v += step) {
    ticks.push(Math.round(v * 100) / 100);
  }
  return { ticks, lo, hi: Math.max(hi, lo + step) };
}

function formatAxis(n: number) {
  if (Math.abs(n) >= 1000) {
    return `${(n / 1000).toFixed(2).replace(".", ",")}k`;
  }
  if (Math.abs(n) >= 100) return n.toFixed(0);
  return n % 1 === 0 ? `${n}` : n.toFixed(1).replace(".", ",");
}

const axisTextStyle = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontVariantNumeric: "tabular-nums" as const,
};

function fmtMoney(n: number) {
  return new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function fmtPct(n: number) {
  const s = n > 0 ? "+" : "";
  return `${s}${n.toFixed(2).replace(".", ",")} %`;
}

function xAt(i: number, n: number, innerW: number) {
  return PAD.left + (n <= 1 ? innerW / 2 : (innerW * i) / (n - 1));
}

function yAt(val: number, min: number, max: number, innerTop: number, innerBottom: number) {
  const span = max - min || 1;
  return innerBottom - ((val - min) / span) * (innerBottom - innerTop);
}

function linePathD(
  points: PayoutAccrualChartPoint[],
  innerW: number,
  innerTop: number,
  innerBottom: number,
  yMin: number,
  yMax: number,
) {
  const n = points.length;
  if (n === 0) return "";
  return points
    .map((p, i) => {
      const x = xAt(i, n, innerW);
      const y = yAt(p.cumulativeUSDT, yMin, yMax, innerTop, innerBottom);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join("");
}

function areaPathD(
  points: PayoutAccrualChartPoint[],
  innerW: number,
  innerTop: number,
  innerBottom: number,
  yMin: number,
  yMax: number,
) {
  const n = points.length;
  if (n === 0) return "";
  const line = linePathD(points, innerW, innerTop, innerBottom, yMin, yMax);
  const x0 = xAt(0, n, innerW);
  const x1 = xAt(n - 1, n, innerW);
  return `${line} L${x1.toFixed(1)},${innerBottom.toFixed(1)} L${x0.toFixed(1)},${innerBottom.toFixed(1)} Z`;
}

type PayoutsAccrualChartProps = {
  /** Статичная серия (live API или сторибук); без неё — только в mock-режиме. */
  data?: PayoutAccrualChartPoint[];
  /** Управляемый интервал (live API). */
  range?: PayoutChartRangeId;
  onRangeChange?: (range: PayoutChartRangeId) => void;
  /** Live-ряд: включает переключение интервала при переданном `data`. */
  liveSeries?: boolean;
};

export function PayoutsAccrualChart({
  data: staticData,
  range: controlledRange,
  onRangeChange,
  liveSeries = false,
}: PayoutsAccrualChartProps) {
  const { t } = useI18n();
  const [range, setRange] = useState<PayoutChartRangeId>("7d");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [tipPos, setTipPos] = useState<{ x: number; y: number; wrapWidth: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const seriesLocked = Boolean(staticData && staticData.length > 0);
  const activeRange = controlledRange ?? range;
  const setActiveRange = onRangeChange ?? setRange;
  const rangeInteractive = !seriesLocked || (liveSeries && Boolean(onRangeChange));

  const series = useMemo(
    () => (seriesLocked ? staticData! : []),
    [seriesLocked, staticData],
  );

  const kpi = useMemo(() => getPayoutChartKpiSnapshot(series), [series]);

  if (series.length === 0) {
    return (
      <section
        className={cn(assetsCardClass, "w-full min-w-0 space-y-3 px-5 py-10 text-center sm:py-12")}
        aria-label={t("payouts.chart.ariaLabel")}
      >
        <h2 className="text-base font-semibold tracking-tight text-neutral-900 sm:text-lg">
          {t("payouts.accrualTitle")}
        </h2>
        <p className="text-sm text-neutral-500">{t("payouts.chart.empty")}</p>
      </section>
    );
  }

  const innerW = VIEW_W - PAD.left - PAD.right;
  const innerH = VIEW_H - PAD.top - PAD.bottom;
  const maxBarH = innerH * 0.22;
  const barGap = 12;
  const yLineBottom = PAD.top + innerH - maxBarH - barGap;
  const yLineTop = PAD.top;

  const cumVals = series.map((d) => d.cumulativeUSDT);
  const perVals = series.map((d) => d.periodUSDT);
  const cumMin = Math.min(...cumVals);
  const cumMax = Math.max(...cumVals);
  const perMax = Math.max(...perVals, 1e-6);

  const cumTicks = buildTicks(Math.max(0, cumMin * 0.98), cumMax * 1.01, 6);
  const n = series.length;

  const pathLine = linePathD(series, innerW, yLineTop, yLineBottom, cumTicks.lo, cumTicks.hi);
  const pathArea = areaPathD(series, innerW, yLineTop, yLineBottom, cumTicks.lo, cumTicks.hi);

  const gridY = cumTicks.ticks.map((v) => ({
    v,
    y: yAt(v, cumTicks.lo, cumTicks.hi, yLineTop, yLineBottom),
  }));

  const labelStep = Math.max(1, Math.ceil(n / 16));
  const vGridEvery = Math.max(1, Math.ceil(n / 10));

  const barW = Math.max(1.2, (innerW / Math.max(1, n)) * 0.55);
  const yBarBase = PAD.top + innerH - 2;

  const pickIndex = useCallback(
    (clientX: number) => {
      const el = wrapRef.current;
      if (!el || n < 1) return null;
      const r = el.getBoundingClientRect();
      const svgX = ((clientX - r.left) / r.width) * VIEW_W;
      const t = (svgX - PAD.left) / innerW;
      if (Number.isNaN(t)) return null;
      const idx = Math.round(Math.min(1, Math.max(0, t)) * (n <= 1 ? 0 : n - 1));
      return idx;
    },
    [innerW, n],
  );

  const onMove = (clientX: number, clientY: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const idx = pickIndex(clientX);
    if (idx === null) return;
    setHoverIdx(idx);
    const r = el.getBoundingClientRect();
    setTipPos({ x: clientX - r.left, y: clientY - r.top, wrapWidth: r.width });
  };

  const hoverPoint = hoverIdx !== null ? series[hoverIdx] : null;
  const hx = hoverIdx !== null ? xAt(hoverIdx, n, innerW) : 0;
  const hy = hoverIdx !== null ? yAt(series[hoverIdx]!.cumulativeUSDT, cumTicks.lo, cumTicks.hi, yLineTop, yLineBottom) : 0;

  return (
    <section
      className={cn(assetsCardClass, "w-full min-w-0 space-y-5 sm:space-y-6")}
      aria-label={t("payouts.chart.ariaLabel")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-semibold tracking-tight text-neutral-900 sm:text-lg">
              {t("payouts.accrualTitle")}
            </h2>
            <MetricsInfoTip label={t("assets.metrics.infoLabel")} tone="onLight">
              {t("payouts.chart.hint")}
            </MetricsInfoTip>
          </div>
        </div>
        {rangeInteractive ? (
          <MetricsRangeMenu
            value={(activeRange === "24h" ? "7d" : activeRange === "30d" ? "30d" : activeRange === "1y" ? "1y" : "7d") as "7d" | "30d" | "90d" | "1y"}
            onChange={(id) => setActiveRange((id === "90d" ? "30d" : id) as PayoutChartRangeId)}
            options={[
              { id: "7d", label: t("chart.range7d") },
              { id: "30d", label: t("chart.range30d") },
              { id: "1y", label: t("chart.range1y") },
            ]}
            ariaLabel={t("payouts.chart.intervalAria")}
          />
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
        <div className="rounded-2xl bg-neutral-50 px-4 py-3.5">
          <p className="text-xs text-neutral-500">{t("assets.overview.accruals")}</p>
          <p className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-neutral-900 sm:text-2xl">
            {fmtMoney(kpi.cumulativeNow)}
            <span className="ml-1.5 text-sm font-medium text-neutral-400">USDT</span>
          </p>
          <p className={cn("mt-1 font-mono text-xs tabular-nums", kpi.cumulativeDeltaPct >= 0 ? "text-neutral-900" : "text-neutral-500")}>
            {fmtPct(kpi.cumulativeDeltaPct)}
          </p>
        </div>
        <div className="rounded-2xl bg-neutral-50 px-4 py-3.5">
          <p className="text-xs text-neutral-500">{t("payouts.history.stat.net")}</p>
          <p className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-neutral-900 sm:text-2xl">
            {fmtMoney(kpi.periodVolume)}
            <span className="ml-1.5 text-sm font-medium text-neutral-400">USDT</span>
          </p>
          <p className={cn("mt-1 font-mono text-xs tabular-nums", kpi.periodDeltaPct >= 0 ? "text-neutral-900" : "text-neutral-500")}>
            {fmtPct(kpi.periodDeltaPct)}
          </p>
        </div>
      </div>

      <div
        ref={wrapRef}
        className="relative min-w-0 w-full overflow-hidden"
        onMouseMove={(e) => onMove(e.clientX, e.clientY)}
        onMouseLeave={() => {
          setHoverIdx(null);
          setTipPos(null);
        }}
      >
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="block h-[280px] w-full max-w-none sm:h-[340px]"
          role="presentation"
        >
          <defs>
            <linearGradient id="payoutAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#111113" stopOpacity="0.22" />
              <stop offset="45%" stopColor="#111113" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <filter id="payoutLineGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {gridY.map(({ v, y }, i) => (
            <line
              key={`gh-${i}-${v}`}
              x1={PAD.left}
              x2={VIEW_W - PAD.right}
              y1={y}
              y2={y}
              stroke="#e5e5e5"
              strokeWidth={1}
              strokeDasharray="2 5"
            />
          ))}

          {Array.from({ length: n }, (_, i) => i)
            .filter((i) => i % vGridEvery === 0)
            .map((i) => {
              const x = xAt(i, n, innerW);
              return (
                <line
                  key={`gv-${i}`}
                  x1={x}
                  x2={x}
                  y1={yLineTop}
                  y2={yBarBase}
                  stroke="#f0f0f0"
                  strokeWidth={1}
                />
              );
            })}

          {series.map((p, i) => {
            const x = xAt(i, n, innerW);
            const h = (p.periodUSDT / perMax) * maxBarH;
            const isH = hoverIdx === i;
            return (
              <rect
                key={`bar-${p.label}-${i}`}
                x={x - barW / 2}
                y={yBarBase - h}
                width={barW}
                height={Math.max(0, h)}
                rx={2}
                fill={isH ? fillBarHover : fillBar}
                opacity={isH ? 1 : 0.85}
              />
            );
          })}

          <path d={pathArea} fill="url(#payoutAreaFill)" stroke="none" />
          <path
            d={pathLine}
            fill="none"
            stroke={strokeLine}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#payoutLineGlow)"
          />

          {series.map((p, i) => {
            if (i % labelStep !== 0 && i !== n - 1) return null;
            const plotLeft = PAD.left;
            const plotRight = PAD.left + innerW;
            const xCenter = xAt(i, n, innerW);
            const isFirst = i === 0;
            const isLast = i === n - 1;
            let anchor: "start" | "middle" | "end" = "middle";
            let xPos = xCenter;
            if (n <= 1) {
              anchor = "middle";
              xPos = plotLeft + innerW / 2;
            } else if (isFirst) {
              anchor = "start";
              xPos = plotLeft + 2;
            } else if (isLast) {
              anchor = "end";
              xPos = plotRight - 2;
            }
            return (
              <text
                key={`xl-${i}`}
                x={xPos}
                y={VIEW_H - 14}
                textAnchor={anchor}
                fill="#737373"
                fontSize={10}
                style={axisTextStyle}
              >
                {p.label}
              </text>
            );
          })}

          {cumTicks.ticks.map((v, i) => {
            const y = yAt(v, cumTicks.lo, cumTicks.hi, yLineTop, yLineBottom);
            return (
              <text
                key={`yl-${i}-${v}`}
                x={PAD.left - 8}
                y={y + 4}
                textAnchor="end"
                fill="#a3a3a3"
                fontSize={10}
                style={axisTextStyle}
              >
                {formatAxis(v)}
              </text>
            );
          })}

          <text
            x={PAD.left - 8}
            y={PAD.top - 2}
            textAnchor="end"
            fill="#a3a3a3"
            fontSize={9}
            style={axisTextStyle}
          >
            USDT
          </text>

          <text
            x={VIEW_W - 8}
            y={yBarBase - maxBarH - 2}
            textAnchor="end"
            fill="#737373"
            fontSize={9}
            style={axisTextStyle}
          >
            объём
          </text>

          {perVals.length > 0 && (
            <text
              x={VIEW_W - 8}
              y={yBarBase + 4}
              textAnchor="end"
              fill="#a3a3a3"
              fontSize={10}
              style={axisTextStyle}
            >
              {formatAxis(perMax)}
            </text>
          )}

          {hoverIdx !== null && n > 0 && (
            <g>
              <line
                x1={hx}
                x2={hx}
                y1={yLineTop}
                y2={yBarBase}
                stroke={strokeLineSoft}
                strokeWidth={1}
                strokeDasharray="4 4"
                opacity={0.95}
              />
              <circle cx={hx} cy={hy} r={5.5} fill="#ffffff" stroke="#DC2626" strokeWidth={2.5} />
            </g>
          )}
        </svg>

        {hoverPoint && tipPos && (
          <div
            className="pointer-events-none absolute z-10 min-w-[160px] max-w-[240px] rounded-xl bg-white px-3 py-2.5 text-xs text-neutral-900 ring-1 ring-neutral-200/80 backdrop-blur-sm"
            style={{
              left: Math.min(Math.max(8, tipPos.x + 12), Math.max(8, tipPos.wrapWidth - 200)),
              top: Math.max(8, tipPos.y - 8),
            }}
          >
            <p className="font-semibold text-neutral-900">{hoverPoint.label}</p>
            <p className="mt-1 text-neutral-500">
              Накопительно:{" "}
              <span className="font-mono font-medium tabular-nums text-neutral-900">{fmtMoney(hoverPoint.cumulativeUSDT)}</span>{" "}
              USDT
            </p>
            <p className="text-neutral-500">
              За шаг:{" "}
              <span className="font-mono font-medium tabular-nums text-neutral-900">{fmtMoney(hoverPoint.periodUSDT)}</span> USDT
            </p>
          </div>
        )}
      </div>

    </section>
  );
}
