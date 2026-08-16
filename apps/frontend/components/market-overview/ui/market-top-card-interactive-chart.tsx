"use client";

import * as React from "react";

import { InfoHint } from "@/components/shared/ui/info-hint";
import { useI18n } from "@/components/providers/i18n-provider";
import { buildDetailedSeries } from "@/lib/analytics/detailed-series";
import { buildLinePath } from "@/lib/analytics/chart-path";
import { cn } from "@/lib/utils";
import type { MarketRowTrend } from "@/types/market-overview";

export type MarketChartVariant = "macro" | "flow";

export type MarketChartTheme = "active" | "new" | "depth" | "secondary";

type ChartMode = "slim" | "compact" | "expanded";

type ThemeColors = {
  stroke: string;
  hi: string;
  vol: string;
  glowRgb: [number, number, number];
  glowCoreRgb: [number, number, number];
  useNeonGlow: boolean;
};

const TREND_STROKE: Record<MarketRowTrend, string> = {
  up: "#B7F500",
  down: "#fb7185",
  flat: "#38bdf8",
};

const TREND_HI: Record<MarketRowTrend, string> = {
  up: "#e8ff9a",
  down: "#fecdd3",
  flat: "#99f6ff",
};

const THEME: Record<Exclude<MarketChartTheme, "secondary">, ThemeColors> = {
  active: {
    stroke: "#B7F500",
    hi: "#e8ff9a",
    vol: "#fbbf24",
    glowRgb: [0.72, 0.98, 0.12],
    glowCoreRgb: [0.78, 1, 0.22],
    useNeonGlow: true,
  },
  new: {
    stroke: "#38bdf8",
    hi: "#bae6fd",
    vol: "#6366f1",
    glowRgb: [0.22, 0.74, 0.97],
    glowCoreRgb: [0.56, 0.9, 0.99],
    useNeonGlow: true,
  },
  depth: {
    stroke: "#c084fc",
    hi: "#e9d5ff",
    vol: "#f472b6",
    glowRgb: [0.75, 0.52, 0.99],
    glowCoreRgb: [0.91, 0.84, 1],
    useNeonGlow: true,
  },
};

const FLOW_UP = "#B7F500";
const FLOW_DOWN = "#fb7185";
const FLOW_OVERLAY = "#f59e0b";

type Layout = {
  svgH: number;
  chartX: number;
  chartY: number;
  lineH: number;
  volGap: number;
  volH: number;
  padR: number;
  padB: number;
  detailSeg: number;
  minSvgW: number;
};

const LAYOUT: Record<ChartMode, Layout> = {
  slim: {
    svgH: 78,
    chartX: 2,
    chartY: 4,
    lineH: 48,
    volGap: 4,
    volH: 18,
    padR: 2,
    padB: 0,
    detailSeg: 7,
    minSvgW: 100,
  },
  compact: {
    svgH: 118,
    chartX: 4,
    chartY: 6,
    lineH: 72,
    volGap: 6,
    volH: 28,
    padR: 4,
    padB: 0,
    detailSeg: 9,
    minSvgW: 160,
  },
  expanded: {
    svgH: 328,
    chartX: 52,
    chartY: 14,
    lineH: 200,
    volGap: 12,
    volH: 56,
    padR: 14,
    padB: 22,
    detailSeg: 12,
    minSvgW: 320,
  },
};

function formatChartValue(v: number): string {
  if (!Number.isFinite(v)) return "—";
  if (Math.abs(v) >= 1000) return v.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
  if (Math.abs(v) < 10 && v % 1 !== 0) return v.toFixed(2).replace(".", ",");
  return v.toFixed(1).replace(".", ",");
}

function offsetPolyline(points: string, ox: number, oy: number): string {
  return points
    .split(" ")
    .filter(Boolean)
    .map((pt) => {
      const [x, y] = pt.split(",").map(Number);
      return `${(x + ox).toFixed(2)},${(y + oy).toFixed(2)}`;
    })
    .join(" ");
}

function areaFromPolyline(points: string, baselineY: number): string {
  const pts = points.split(" ").filter(Boolean);
  if (!pts.length) return "";
  const first = pts[0]!.split(",").map(Number);
  const last = pts[pts.length - 1]!.split(",").map(Number);
  const path = pts.map((pt, i) => `${i === 0 ? "M" : "L"}${pt}`).join(" ");
  return `${path} L${last[0]!.toFixed(2)},${baselineY.toFixed(2)} L${first[0]!.toFixed(2)},${baselineY.toFixed(2)} Z`;
}

function resolveTheme(
  theme: MarketChartTheme | undefined,
  trend: MarketRowTrend,
): ThemeColors {
  if (theme && theme !== "secondary") return THEME[theme];
  if (theme === "secondary") {
    return {
      stroke: FLOW_UP,
      hi: "#e8ff9a",
      vol: FLOW_UP,
      glowRgb: [0.72, 0.98, 0.12],
      glowCoreRgb: [0.78, 1, 0.22],
      useNeonGlow: true,
    };
  }
  return {
    stroke: TREND_STROKE[trend],
    hi: TREND_HI[trend],
    vol: TREND_STROKE[trend],
    glowRgb:
      trend === "up"
        ? [0.72, 0.98, 0.12]
        : trend === "down"
          ? [0.98, 0.45, 0.52]
          : [0.22, 0.74, 0.97],
    glowCoreRgb:
      trend === "up"
        ? [0.78, 1, 0.22]
        : trend === "down"
          ? [1, 0.8, 0.83]
          : [0.56, 0.9, 0.99],
    useNeonGlow: trend === "up",
  };
}

function xAxisLabel(i: number, n: number): string {
  if (n <= 14) return String(i + 1);
  return `D${i + 1}`;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function glowMatrix(rgb: [number, number, number], a: number): string {
  const [r, g, b] = rgb;
  return `0 0 0 0 ${r}
          0 0 0 0 ${g}
          0 0 0 0 ${b}
          0 0 0 ${a} 0`;
}

/** OKX-style detailed charts for market overview top cards (macro line + flow bars). */
export function MarketTopCardInteractiveChart({
  values,
  trend,
  mode,
  variant = "macro",
  theme,
  className,
  volumes: volumesProp,
  overlay,
}: {
  values: number[];
  trend: MarketRowTrend;
  mode: ChartMode;
  variant?: MarketChartVariant;
  theme?: MarketChartTheme;
  className?: string;
  volumes?: number[];
  overlay?: number[];
}) {
  const { t: tr } = useI18n();
  const uid = React.useId().replace(/:/g, "");
  const glowNeonId = `mtc-neon-${uid}`;
  const glowId = `mtc-core-${uid}`;
  const softWideId = `mtc-sw-${uid}`;
  const softCoreId = `mtc-sc-${uid}`;
  const areaGradId = `mtc-area-${uid}`;
  const clipId = `mtc-clip-${uid}`;
  const volClipId = `mtc-vol-${uid}`;

  const lay = LAYOUT[mode];
  const colors = resolveTheme(theme, trend);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const linePathRef = React.useRef<SVGPolylineElement>(null);
  const areaPathRef = React.useRef<SVGPathElement>(null);
  const [containerW, setContainerW] = React.useState(0);
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [panY, setPanY] = React.useState(0);
  const [drawProgress, setDrawProgress] = React.useState(1);
  const dragRef = React.useRef<{ y: number; pan: number } | null>(null);

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setContainerW(Math.floor(w));
    });
    ro.observe(el);
    setContainerW(Math.floor(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    setZoom(1);
    setPanY(0);
    setHoverIdx(null);
  }, [values, mode, variant, theme]);

  // Draw-in animation on mount / values change
  React.useEffect(() => {
    if (prefersReducedMotion()) {
      setDrawProgress(1);
      return;
    }
    setDrawProgress(0);
    const duration = 900;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - (1 - t) ** 3;
      setDrawProgress(eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [values, mode, theme, variant]);

  // Apply stroke-dash draw on the main polyline after layout
  React.useEffect(() => {
    const poly = linePathRef.current;
    if (!poly) return;
    const len = poly.getTotalLength?.() ?? 0;
    if (!len || prefersReducedMotion()) {
      poly.style.strokeDasharray = "none";
      poly.style.strokeDashoffset = "0";
      return;
    }
    poly.style.strokeDasharray = `${len}`;
    poly.style.strokeDashoffset = `${len * (1 - drawProgress)}`;
  }, [drawProgress, values, mode, containerW, theme, variant]);

  const svgW = Math.max(containerW || lay.minSvgW, lay.minSvgW);
  const chartW = Math.max(svgW - lay.chartX - lay.padR, 80);
  const chartX = lay.chartX;
  const chartY = lay.chartY;
  const showVol = variant === "macro" || mode !== "expanded" || Boolean(volumesProp);
  const lineH =
    variant === "flow" && mode !== "expanded"
      ? lay.lineH + lay.volGap + lay.volH
      : lay.lineH;
  const volY = chartY + lay.lineH + lay.volGap;
  const volH = lay.volH;
  const svgH = lay.svgH;
  const plotBottom = chartY + lineH;
  const xAxisY =
    mode === "expanded"
      ? variant === "macro"
        ? volY + volH + 14
        : plotBottom + 16
      : 0;

  const series = React.useMemo(
    () => buildDetailedSeries(values.length >= 2 ? values : [values[0] ?? 0, values[0] ?? 0], lay.detailSeg),
    [values, lay.detailSeg],
  );

  const volumes = React.useMemo(() => {
    if (volumesProp && volumesProp.length > 0) {
      const densified = buildDetailedSeries(
        volumesProp.length >= 2 ? volumesProp : [volumesProp[0] ?? 0, volumesProp[0] ?? 0],
        lay.detailSeg,
      );
      return densified.map((v) => Math.abs(v));
    }
    const out: number[] = [0];
    for (let i = 1; i < series.length; i++) {
      out.push(Math.abs(series[i]! - series[i - 1]!));
    }
    if (out.length > 1) out[0] = out[1]!;
    return out;
  }, [series, volumesProp, lay.detailSeg]);

  const overlaySeries = React.useMemo(() => {
    if (!overlay || overlay.length < 1) return null;
    return buildDetailedSeries(
      overlay.length >= 2 ? overlay : [overlay[0]!, overlay[0]!],
      lay.detailSeg,
    );
  }, [overlay, lay.detailSeg]);

  const flowDeltas = React.useMemo(() => {
    const out: number[] = [0];
    for (let i = 1; i < series.length; i++) {
      out.push(series[i]! - series[i - 1]!);
    }
    if (out.length > 1) out[0] = out[1]!;
    return out;
  }, [series]);

  const domain = React.useMemo(() => {
    const max = Math.max(...series);
    const min = Math.min(...series);
    const baseSpan = Math.max(max - min, 1e-6);
    if (mode !== "expanded") {
      const pad = baseSpan * 0.08;
      return { min: min - pad, max: max + pad };
    }
    const center = (max + min) / 2 + panY;
    const zoomHalfSpan = baseSpan / 2 / zoom;
    return { min: center - zoomHalfSpan, max: center + zoomHalfSpan };
  }, [series, mode, zoom, panY]);

  const overlayDomain = React.useMemo(() => {
    if (!overlaySeries) return domain;
    const max = Math.max(...overlaySeries);
    const min = Math.min(...overlaySeries);
    const baseSpan = Math.max(max - min, 1e-6);
    const pad = baseSpan * 0.08;
    return { min: min - pad, max: max + pad };
  }, [overlaySeries, domain]);

  const volMax = React.useMemo(() => Math.max(...volumes, 1e-9), [volumes]);
  const flowMax = React.useMemo(
    () => Math.max(...flowDeltas.map((d) => Math.abs(d)), 1e-9),
    [flowDeltas],
  );

  const activeLine = offsetPolyline(
    buildLinePath(series, chartW, lineH, 0, 0, domain),
    chartX,
    chartY,
  );
  const areaPath = areaFromPolyline(activeLine, plotBottom);
  const overlayLine =
    overlaySeries && mode === "expanded" && variant === "flow"
      ? offsetPolyline(
          buildLinePath(overlaySeries, chartW, lineH, 0, 0, overlayDomain),
          chartX,
          chartY,
        )
      : null;

  const spanY = domain.max - domain.min || 1;
  const idxDenom = Math.max(series.length - 1, 1);
  const barSlot = chartW / Math.max(series.length, 1);
  const barW = Math.max(
    1.2,
    Math.min(barSlot * (mode === "expanded" ? 0.72 : 0.62), mode === "slim" ? 4 : mode === "expanded" ? 9 : 7),
  );

  const handleSvgPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.type === "pointerleave" || e.type === "pointercancel") {
      if (!dragRef.current) setHoverIdx(null);
      return;
    }
    if (dragRef.current && mode === "expanded") {
      const dy = e.clientY - dragRef.current.y;
      const baseSpan = Math.max(Math.max(...series) - Math.min(...series), 1e-6);
      const delta = (-dy / lineH) * (baseSpan / zoom);
      setPanY(dragRef.current.pan + delta);
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
    setHoverIdx(Math.max(0, Math.min(series.length - 1, idx)));
  };

  const hoverX = hoverIdx !== null ? chartX + (hoverIdx / idxDenom) * chartW : null;
  const hoverVal = hoverIdx !== null ? series[hoverIdx]! : null;
  const hoverVol = hoverIdx !== null ? volumes[hoverIdx]! : null;
  const hoverFlow = hoverIdx !== null ? flowDeltas[hoverIdx]! : null;
  const hY =
    hoverIdx !== null && variant === "macro"
      ? chartY +
        (1 - (Math.max(domain.min, Math.min(domain.max, series[hoverIdx]!)) - domain.min) / spanY) * lineH
      : null;

  const stroke = colors.stroke;
  const hi = colors.hi;
  const volColor = colors.vol;
  const k = Math.max(0.35, Math.min(1, lineH / 200));

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    if (mode !== "expanded") return;
    e.preventDefault();
    e.stopPropagation();
    const step = e.deltaY < 0 ? 0.14 : -0.14;
    setZoom((z) => Math.max(0.75, Math.min(4, Number((z + step).toFixed(2)))));
  };

  const yTickCount = mode === "expanded" ? 5 : 0;
  const yTicks =
    mode === "expanded"
      ? Array.from({ length: yTickCount }, (_, i) => {
          const t = i / (yTickCount - 1);
          return Math.round((domain.max - t * (domain.max - domain.min)) * 1000) / 1000;
        })
      : [];

  const xLabelCount = mode === "expanded" ? Math.min(6, Math.max(5, values.length)) : 0;
  const xLabels =
    mode === "expanded"
      ? Array.from({ length: xLabelCount }, (_, i) => {
          const t = xLabelCount === 1 ? 0 : i / (xLabelCount - 1);
          const srcIdx = Math.round(t * Math.max(values.length - 1, 0));
          return {
            x: chartX + t * chartW,
            label: xAxisLabel(srcIdx, values.length),
          };
        })
      : [];

  const gridOpacity = mode === "expanded" ? 0.1 : 0.045;
  const gridYs = [0, 0.25, 0.5, 0.75, 1].map((t) => chartY + t * lineH);

  const flowMidY = chartY + lineH / 2;
  const flowHalf = lineH / 2 - 2;

  const resetView = () => {
    setZoom(1);
    setPanY(0);
  };

  const tipPrimary =
    variant === "flow" && hoverFlow != null
      ? formatChartValue(hoverFlow)
      : hoverVal != null
        ? formatChartValue(hoverVal)
        : null;

  const tipLabel =
    hoverIdx !== null
      ? xAxisLabel(
          Math.round((hoverIdx / idxDenom) * Math.max(values.length - 1, 0)),
          values.length,
        )
      : null;

  const areaOpacity = 0.35 + drawProgress * 0.65;
  const [gr, gg, gb] = colors.glowRgb;
  const [cr, cg, cb] = colors.glowCoreRgb;

  return (
    <div
      ref={wrapRef}
      className={cn("relative w-full min-w-0", className)}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {mode === "expanded" ? (
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500">
            {tr("marketOverview.chart.zoomHint")}
            <InfoHint text={tr("marketOverview.info.chart")} label={tr("marketOverview.info.chartLabel")} size="sm" />
          </p>
          {(zoom !== 1 || panY !== 0) && (
            <button
              type="button"
              onClick={resetView}
              className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] font-medium text-zinc-400 hover:bg-white/[0.1] hover:text-zinc-200"
            >
              {tr("marketOverview.chart.resetZoom")}
            </button>
          )}
        </div>
      ) : null}

      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        preserveAspectRatio="xMidYMid meet"
        className={cn("block w-full touch-none select-none", mode === "expanded" && "cursor-crosshair")}
        role="img"
        aria-label={tr("marketOverview.topCard.chartAria")}
        onPointerMove={handleSvgPointer}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (mode === "expanded" && e.button === 0) {
            dragRef.current = { y: e.clientY, pan: panY };
            e.currentTarget.setPointerCapture(e.pointerId);
          }
          handleSvgPointer(e);
        }}
        onPointerUp={(e) => {
          dragRef.current = null;
          try {
            e.currentTarget.releasePointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
        }}
        onPointerLeave={handleSvgPointer}
        onPointerCancel={(e) => {
          dragRef.current = null;
          handleSvgPointer(e);
        }}
        onWheel={handleWheel}
      >
        <defs>
          {colors.useNeonGlow ? (
            <>
              <filter id={glowNeonId} x="-55%" y="-55%" width="210%" height="210%">
                <feGaussianBlur in="SourceGraphic" stdDeviation={Math.max(1.4, 6.5 * k * 0.42)} result="blurWide" />
                <feColorMatrix
                  in="blurWide"
                  type="matrix"
                  values={glowMatrix([gr, gg, gb], 0.72)}
                  result="glowWide"
                />
                <feGaussianBlur in="SourceGraphic" stdDeviation={Math.max(0.85, 2.2 * k * 0.45)} result="blurCore" />
                <feColorMatrix
                  in="blurCore"
                  type="matrix"
                  values={glowMatrix([cr, cg, cb], 0.9)}
                  result="glowCore"
                />
                <feMerge>
                  <feMergeNode in="glowWide" />
                  <feMergeNode in="glowCore" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id={glowId} x="-45%" y="-45%" width="190%" height="190%">
                <feGaussianBlur in="SourceGraphic" stdDeviation={Math.max(0.75, 3.2 * k * 0.45)} result="blur" />
                <feColorMatrix
                  in="blur"
                  type="matrix"
                  values={glowMatrix([cr, cg, cb], 0.72)}
                  result="glow"
                />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </>
          ) : (
            <>
              <filter id={softWideId} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation={Math.max(1.4, 4.8 * k * 0.5)} result="bw" />
                <feMerge>
                  <feMergeNode in="bw" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id={softCoreId} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur in="SourceGraphic" stdDeviation={Math.max(0.75, 2.4 * k * 0.5)} result="bc" />
                <feMerge>
                  <feMergeNode in="bc" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </>
          )}
          <linearGradient id={areaGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={mode === "expanded" ? 0.36 : 0.28} />
            <stop offset="55%" stopColor={stroke} stopOpacity="0.1" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
          <clipPath id={clipId}>
            <rect x={chartX} y={chartY} width={chartW} height={lineH} />
          </clipPath>
          <clipPath id={volClipId}>
            <rect x={chartX} y={volY} width={chartW} height={volH} />
          </clipPath>
        </defs>

        {/* grid */}
        {gridYs.map((y, i) => (
          <line
            key={`g-${i}`}
            x1={chartX}
            y1={y}
            x2={chartX + chartW}
            y2={y}
            stroke={`rgba(255,255,255,${gridOpacity})`}
            strokeWidth="1"
          />
        ))}

        {mode === "expanded"
          ? yTicks.map((tick, i) => {
              const y = chartY + (i / Math.max(yTicks.length - 1, 1)) * lineH;
              return (
                <g key={`yt-${i}`}>
                  <line
                    x1={chartX}
                    y1={y}
                    x2={chartX + chartW}
                    y2={y}
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="1"
                  />
                  <text
                    x={chartX - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    className="fill-zinc-500"
                    style={{ fontSize: 11, fontFamily: "ui-monospace, monospace" }}
                  >
                    {formatChartValue(tick)}
                  </text>
                </g>
              );
            })
          : null}

        {variant === "macro" ? (
          <>
            <g clipPath={`url(#${clipId})`}>
              <path
                ref={areaPathRef}
                d={areaPath}
                fill={`url(#${areaGradId})`}
                style={{ opacity: areaOpacity }}
              />
              <polyline
                points={activeLine}
                fill="none"
                stroke={stroke}
                strokeWidth={Math.max(2.6, 5.2 * k)}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.14"
              />
              <polyline
                points={activeLine}
                fill="none"
                stroke={stroke}
                strokeWidth={Math.max(3.6, 8 * k)}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.22"
                filter={colors.useNeonGlow ? `url(#${glowNeonId})` : `url(#${softWideId})`}
              />
              <polyline
                ref={linePathRef}
                points={activeLine}
                fill="none"
                stroke={stroke}
                strokeWidth={Math.max(1.6, mode === "expanded" ? 2.8 * k : 2.6 * k)}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={colors.useNeonGlow ? `url(#${glowId})` : `url(#${softCoreId})`}
              />
              <polyline
                points={activeLine}
                fill="none"
                stroke={hi}
                strokeWidth={Math.max(0.85, 1.15 * k)}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.35 + drawProgress * 0.3}
              />
            </g>

            <g clipPath={`url(#${volClipId})`} style={{ opacity: 0.4 + drawProgress * 0.6 }}>
                {volumes.map((v, i) => {
                  const x = chartX + (i / idxDenom) * chartW - barW / 2;
                  const h = Math.max(1.5, (v / volMax) * (volH - (mode === "expanded" ? 2 : 1)));
                  return (
                    <rect
                      key={`v-${i}`}
                      x={x}
                      y={volY + volH - h}
                      width={barW}
                      height={h}
                      rx={mode === "expanded" ? 1 : 0.5}
                      fill={volColor}
                      opacity={hoverIdx === i ? 0.7 : mode === "expanded" ? 0.38 : 0.22}
                    />
                  );
                })}
              </g>
          </>
        ) : (
          <g clipPath={`url(#${clipId})`} style={{ opacity: 0.45 + drawProgress * 0.55 }}>
            <line
              x1={chartX}
              y1={flowMidY}
              x2={chartX + chartW}
              y2={flowMidY}
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="1"
            />
            {flowDeltas.map((d, i) => {
              const x = chartX + (i / idxDenom) * chartW - barW / 2;
              const mag = (Math.abs(d) / flowMax) * flowHalf;
              const up = d >= 0;
              const y = up ? flowMidY - mag : flowMidY;
              return (
                <rect
                  key={`f-${i}`}
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(1, mag)}
                  rx={0.75}
                  fill={up ? FLOW_UP : FLOW_DOWN}
                  opacity={hoverIdx === i ? 0.95 : 0.72}
                />
              );
            })}
            {overlayLine ? (
              <polyline
                points={overlayLine}
                fill="none"
                stroke={FLOW_OVERLAY}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.85"
              />
            ) : null}
          </g>
        )}

        {mode === "expanded"
          ? xLabels.map((xl, i) => (
              <text
                key={`xl-${i}`}
                x={xl.x}
                y={xAxisY}
                textAnchor="middle"
                className="fill-zinc-600"
                style={{ fontSize: 10, fontFamily: "ui-monospace, monospace" }}
              >
                {xl.label}
              </text>
            ))
          : null}

        {hoverX !== null && tipPrimary != null ? (
          <g>
            <line
              x1={hoverX}
              y1={chartY}
              x2={hoverX}
              y2={variant === "macro" ? volY + volH : plotBottom}
              stroke="rgba(255,255,255,0.32)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            {variant === "macro" && hY !== null ? (
              <circle
                cx={hoverX}
                cy={hY}
                r={mode === "expanded" ? 5.5 : 4}
                fill={stroke}
                stroke="#0d0d0d"
                strokeWidth="2"
              />
            ) : null}
            {mode === "expanded" ? (
              <g>
                {(() => {
                  const tipW = 108;
                  const tipH = 52;
                  const tipX = Math.min(Math.max(hoverX - tipW / 2, chartX), chartX + chartW - tipW);
                  const tipY = Math.max(chartY + 4, (hY ?? flowMidY) - tipH - 10);
                  return (
                    <>
                      <rect
                        x={tipX}
                        y={tipY}
                        width={tipW}
                        height={tipH}
                        rx="10"
                        fill="#0a0a0a"
                        stroke="rgba(255,255,255,0.12)"
                      />
                      <text
                        x={tipX + 12}
                        y={tipY + 18}
                        className="fill-zinc-500"
                        style={{ fontSize: 10, fontFamily: "ui-monospace, monospace" }}
                      >
                        {tipLabel}
                      </text>
                      <text
                        x={tipX + 12}
                        y={tipY + 34}
                        className="fill-zinc-100"
                        style={{ fontSize: 13, fontFamily: "ui-monospace, monospace", fontWeight: 600 }}
                      >
                        {tipPrimary}
                      </text>
                      {hoverVol != null && variant === "macro" ? (
                        <text
                          x={tipX + 12}
                          y={tipY + 46}
                          className="fill-zinc-500"
                          style={{ fontSize: 10, fontFamily: "ui-monospace, monospace" }}
                        >
                          vol {formatChartValue(hoverVol)}
                        </text>
                      ) : null}
                    </>
                  );
                })()}
              </g>
            ) : mode !== "slim" ? (
              <g>
                <rect
                  x={Math.min(Math.max(hoverX - 36, chartX), chartX + chartW - 72)}
                  y={Math.max(chartY + 2, (hY ?? flowMidY) - 28)}
                  width="72"
                  height="22"
                  rx="11"
                  fill="#141414"
                  stroke="rgba(255,255,255,0.1)"
                />
                <text
                  x={Math.min(Math.max(hoverX, chartX + 36), chartX + chartW - 36)}
                  y={Math.max(chartY + 17, (hY ?? flowMidY) - 13)}
                  textAnchor="middle"
                  className="fill-zinc-100"
                  style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", fontWeight: 600 }}
                >
                  {tipPrimary}
                </text>
              </g>
            ) : null}
          </g>
        ) : variant === "macro" && drawProgress > 0.92 ? (
          <circle
            cx={Number(activeLine.split(" ").at(-1)?.split(",")[0] ?? chartX + chartW)}
            cy={Number(activeLine.split(" ").at(-1)?.split(",")[1] ?? plotBottom)}
            r={mode === "expanded" ? 4.5 : 3.5}
            fill={stroke}
            stroke="#0d0d0d"
            strokeWidth="2"
          />
        ) : null}
      </svg>
    </div>
  );
}
