"use client";

import * as React from "react";

import { useI18n } from "@/components/providers/i18n-provider";
import { buildDetailedSeries } from "@/lib/analytics/detailed-series";
import { buildLinePath } from "@/lib/analytics/chart-path";
import { cn } from "@/lib/utils";

export type MarketOverviewProChartVariant = "macro" | "flow" | "line" | "hist";

export type MarketOverviewProChartProps = {
  values: number[];
  volumes?: number[];
  overlay?: number[];
  variant: MarketOverviewProChartVariant;
  height?: number;
  className?: string;
  formatValue?: (n: number) => string;
  formatVolume?: (n: number) => string;
  stroke?: string;
  /** Volume / underlay bars — should differ from stroke (OKX: purple line + gold bars). */
  volumeStroke?: string;
  downStroke?: string;
  overlayStroke?: string;
  labels?: string[];
};

const DETAIL_SEG = 8;
const GRID = "rgba(255,255,255,0.05)";
const UP = "#B7F500";
const DOWN = "#fb7185";
const OVERLAY = "#f59e0b";

function defaultFormat(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1000) return n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
  if (Math.abs(n) < 10 && n % 1 !== 0) return n.toFixed(2).replace(".", ",");
  return n.toFixed(1).replace(".", ",");
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

function densifyAligned(base: number[], targetLen: number): number[] {
  if (!base.length) return Array.from({ length: targetLen }, () => 0);
  if (base.length === 1) return Array.from({ length: targetLen }, () => base[0]!);
  if (base.length === targetLen) return [...base];
  const out: number[] = [];
  for (let i = 0; i < targetLen; i++) {
    const t = i / Math.max(targetLen - 1, 1);
    const src = t * (base.length - 1);
    const lo = Math.floor(src);
    const hi = Math.min(base.length - 1, lo + 1);
    const f = src - lo;
    out.push(base[lo]! * (1 - f) + base[hi]! * f);
  }
  return out;
}

export function MarketOverviewProChart({
  values,
  volumes,
  overlay,
  variant,
  height = 220,
  className,
  formatValue = defaultFormat,
  formatVolume = defaultFormat,
  stroke = UP,
  volumeStroke,
  downStroke = DOWN,
  overlayStroke = OVERLAY,
  labels,
}: MarketOverviewProChartProps) {
  const volFill = volumeStroke ?? "#fbbf24";
  const { t } = useI18n();
  const uid = React.useId().replace(/:/g, "");
  const glowId = `mop-glow-${uid}`;
  const glowWideId = `mop-glow-w-${uid}`;
  const areaGradId = `mop-area-${uid}`;
  const clipId = `mop-clip-${uid}`;
  const volClipId = `mop-vol-${uid}`;

  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = React.useState(0);
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setContainerW(Math.floor(entries[0]?.contentRect.width ?? 0));
    });
    ro.observe(el);
    setContainerW(Math.floor(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    setHoverIdx(null);
  }, [values, volumes, overlay, variant]);

  const series = React.useMemo(() => {
    const raw = values.length ? values : [0, 0];
    if (variant === "hist") return [...raw];
    return buildDetailedSeries(raw.length >= 2 ? raw : [raw[0] ?? 0, raw[0] ?? 0], DETAIL_SEG);
  }, [values, variant]);

  const volSeries = React.useMemo(() => {
    if (volumes?.length) return densifyAligned(volumes, series.length);
    if (variant !== "macro") return null;
    const out: number[] = [0];
    for (let i = 1; i < series.length; i++) out.push(Math.abs(series[i]! - series[i - 1]!));
    if (out.length > 1) out[0] = out[1]!;
    return out;
  }, [volumes, series, variant]);

  const overlaySeries = React.useMemo(() => {
    if (!overlay?.length) return null;
    return densifyAligned(overlay, series.length);
  }, [overlay, series.length]);

  const hasNeg = series.some((v) => v < 0);
  const flowDeltas = React.useMemo(() => {
    if (variant !== "flow") return null;
    if (hasNeg) return series;
    const out: number[] = [0];
    for (let i = 1; i < series.length; i++) out.push(series[i]! - series[i - 1]!);
    if (out.length > 1) out[0] = out[1]!;
    return out;
  }, [series, variant, hasNeg]);

  const showYAxis = variant === "macro" || variant === "line";
  const chartX = showYAxis ? 44 : 8;
  const padR = 10;
  const chartY = 14;
  const hasVolLane = variant === "macro" && volSeries != null;
  const volH = hasVolLane ? Math.max(28, Math.round(height * 0.18)) : 0;
  const volGap = hasVolLane ? 8 : 0;
  const lineH = Math.max(48, height - chartY - 10 - volH - volGap);
  const svgH = height;
  const svgW = Math.max(containerW || 280, 200);
  const chartW = Math.max(svgW - chartX - padR, 80);
  const plotBottom = chartY + lineH;
  const volY = plotBottom + volGap;

  const domain = React.useMemo(() => {
    const max = Math.max(...series);
    const min = Math.min(...series);
    const span = Math.max(max - min, 1e-6);
    const pad = span * 0.1;
    return { min: min - pad, max: max + pad };
  }, [series]);

  const overlayDomain = React.useMemo(() => {
    if (!overlaySeries?.length) return null;
    const max = Math.max(...overlaySeries);
    const min = Math.min(...overlaySeries);
    const span = Math.max(max - min, 1e-6);
    const pad = span * 0.12;
    return { min: min - pad, max: max + pad };
  }, [overlaySeries]);

  const volMax = React.useMemo(
    () => (volSeries ? Math.max(...volSeries, 1e-9) : 1),
    [volSeries],
  );
  const flowMax = React.useMemo(
    () => (flowDeltas ? Math.max(...flowDeltas.map((d) => Math.abs(d)), 1e-9) : 1),
    [flowDeltas],
  );
  const histMax = React.useMemo(() => Math.max(...series.map((v) => Math.abs(v)), 1e-9), [series]);
  const histMedian = React.useMemo(() => {
    const sorted = [...series].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid]! : ((sorted[mid - 1]! + sorted[mid]!) / 2);
  }, [series]);

  const activeLine = offsetPolyline(
    buildLinePath(series, chartW, lineH, 0, 0, domain),
    chartX,
    chartY,
  );
  const areaPath = areaFromPolyline(activeLine, plotBottom);

  const overlayLine =
    overlaySeries && overlayDomain
      ? offsetPolyline(buildLinePath(overlaySeries, chartW, lineH, 0, 0, overlayDomain), chartX, chartY)
      : null;

  const idxDenom = Math.max(series.length - 1, 1);
  const barSlot = chartW / Math.max(series.length, 1);
  const barW = Math.max(1.2, Math.min(barSlot * 0.62, variant === "hist" ? 14 : 7));
  const flowMidY = chartY + lineH / 2;
  const flowHalf = lineH / 2 - 2;
  const spanY = domain.max - domain.min || 1;

  const handlePointer = (e: React.PointerEvent<SVGSVGElement>) => {
    e.stopPropagation();
    if (e.type === "pointerleave" || e.type === "pointercancel") {
      setHoverIdx(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const xSvg = ((e.clientX - rect.left) / rect.width) * svgW;
    if (xSvg < chartX || xSvg > chartX + chartW) {
      setHoverIdx(null);
      return;
    }
    if (variant === "hist") {
      const idx = Math.floor(((xSvg - chartX) / chartW) * series.length);
      setHoverIdx(Math.max(0, Math.min(series.length - 1, idx)));
      return;
    }
    const t = (xSvg - chartX) / chartW;
    setHoverIdx(Math.max(0, Math.min(series.length - 1, Math.round(t * idxDenom))));
  };

  const hoverX =
    hoverIdx !== null
      ? variant === "hist"
        ? chartX + (hoverIdx + 0.5) * barSlot
        : chartX + (hoverIdx / idxDenom) * chartW
      : null;

  const hoverVal = hoverIdx !== null ? series[hoverIdx]! : null;
  const hoverVol = hoverIdx !== null && volSeries ? volSeries[hoverIdx]! : null;
  const hoverFlow = hoverIdx !== null && flowDeltas ? flowDeltas[hoverIdx]! : null;
  const hoverOverlay = hoverIdx !== null && overlaySeries ? overlaySeries[hoverIdx]! : null;
  const hY =
    hoverIdx !== null && (variant === "macro" || variant === "line")
      ? chartY +
        (1 - (Math.max(domain.min, Math.min(domain.max, series[hoverIdx]!)) - domain.min) / spanY) *
          lineH
      : null;

  const yTicks =
    showYAxis
      ? ([domain.max, (domain.max + domain.min) / 2, domain.min] as const).map(
          (v) => Math.round(v * 1000) / 1000,
        )
      : [];

  const tipLines: { label: string; value: string; color: string }[] = [];
  if (hoverIdx !== null) {
    if (variant === "flow" && hoverFlow != null) {
      tipLines.push({
        label: t("marketOverview.depth.hoverFlow"),
        value: formatValue(hoverFlow),
        color: hoverFlow >= 0 ? stroke : downStroke,
      });
      if (hoverOverlay != null) {
        tipLines.push({
          label: t("marketOverview.depth.flowsOverlay"),
          value: formatValue(hoverOverlay),
          color: overlayStroke,
        });
      }
    } else if (variant === "hist" && hoverVal != null) {
      tipLines.push({
        label: labels?.[hoverIdx] ?? t("marketOverview.depth.hoverValue"),
        value: formatValue(hoverVal),
        color: hoverVal >= histMedian ? stroke : downStroke,
      });
    } else if (hoverVal != null) {
      tipLines.push({
        label: t("marketOverview.depth.hoverValue"),
        value: formatValue(hoverVal),
        color: stroke,
      });
      if (variant === "macro" && hoverVol != null) {
        tipLines.push({
          label: t("marketOverview.depth.hoverVolume"),
          value: formatVolume(hoverVol),
          color: "rgba(255,255,255,0.7)",
        });
      }
    }
  }

  const tipH = 12 + tipLines.length * 16;
  const tipW = 148;

  if (!values.length && variant !== "hist") {
    return <div className={cn("w-full rounded-lg bg-[#0a0a0a]/50", className)} style={{ height }} aria-hidden />;
  }

  return (
    <div
      ref={wrapRef}
      className={cn("relative w-full min-w-0", className)}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        preserveAspectRatio="xMidYMid meet"
        className="block w-full touch-none select-none cursor-crosshair"
        style={{ height }}
        role="img"
        aria-hidden
        onPointerMove={handlePointer}
        onPointerDown={handlePointer}
        onPointerLeave={handlePointer}
        onPointerCancel={handlePointer}
      >
        <defs>
          <filter id={glowWideId} x="-55%" y="-55%" width="210%" height="210%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5.5" result="blurWide" />
            <feColorMatrix
              in="blurWide"
              type="matrix"
              values="0 0 0 0 0.72
                      0 0 0 0 0.98
                      0 0 0 0 0.12
                      0 0 0 0.65 0"
              result="glowWide"
            />
            <feMerge>
              <feMergeNode in="glowWide" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={glowId} x="-45%" y="-45%" width="190%" height="190%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.78
                      0 0 0 0 1
                      0 0 0 0 0.18
                      0 0 0 0.72 0"
              result="glow"
            />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id={areaGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
            <stop offset="55%" stopColor={stroke} stopOpacity="0.08" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
          <clipPath id={clipId}>
            <rect x={chartX} y={chartY} width={chartW} height={lineH} />
          </clipPath>
          <clipPath id={volClipId}>
            <rect x={chartX} y={volY} width={chartW} height={volH} />
          </clipPath>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line
            key={`g-${i}`}
            x1={chartX}
            y1={chartY + t * lineH}
            x2={chartX + chartW}
            y2={chartY + t * lineH}
            stroke={GRID}
            strokeWidth="1"
          />
        ))}

        {yTicks.map((tick, i) => {
          const y = chartY + (i / Math.max(yTicks.length - 1, 1)) * lineH;
          return (
            <text
              key={`yt-${i}`}
              x={chartX - 6}
              y={y + 3}
              textAnchor="end"
              fill="rgba(161,161,170,0.7)"
              style={{ fontSize: 10, fontFamily: "ui-monospace, monospace" }}
            >
              {formatValue(tick)}
            </text>
          );
        })}

        {(variant === "macro" || variant === "line") && (
          <g clipPath={`url(#${clipId})`}>
            <path d={areaPath} fill={`url(#${areaGradId})`} />
            <polyline
              points={activeLine}
              fill="none"
              stroke={stroke}
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.18"
              filter={`url(#${glowWideId})`}
            />
            <polyline
              points={activeLine}
              fill="none"
              stroke={stroke}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#${glowId})`}
            />
            <polyline
              points={activeLine}
              fill="none"
              stroke="#e8ff9a"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.5"
            />
          </g>
        )}

        {variant === "macro" && volSeries ? (
          <g clipPath={`url(#${volClipId})`}>
            {volSeries.map((v, i) => {
              const x = chartX + (i / idxDenom) * chartW - barW / 2;
              const h = Math.max(1, (v / volMax) * (volH - 1));
              return (
                <rect
                  key={`v-${i}`}
                  x={x}
                  y={volY + volH - h}
                  width={barW}
                  height={h}
                  rx={0.5}
                  fill={volFill}
                  opacity={hoverIdx === i ? 0.75 : 0.42}
                />
              );
            })}
          </g>
        ) : null}

        {variant === "flow" && flowDeltas ? (
          <g clipPath={`url(#${clipId})`}>
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
              return (
                <rect
                  key={`f-${i}`}
                  x={x}
                  y={up ? flowMidY - mag : flowMidY}
                  width={barW}
                  height={Math.max(1, mag)}
                  rx={0.75}
                  fill={up ? stroke : downStroke}
                  opacity={hoverIdx === i ? 0.95 : 0.72}
                />
              );
            })}
            {overlayLine ? (
              <polyline
                points={overlayLine}
                fill="none"
                stroke={overlayStroke}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.95"
              />
            ) : null}
          </g>
        ) : null}

        {variant === "hist" ? (
          <g clipPath={`url(#${clipId})`}>
            {series.map((v, i) => {
              const x = chartX + i * barSlot + (barSlot - barW) / 2;
              const h = Math.max(2, (Math.abs(v) / histMax) * (lineH - 4));
              const t = series.length <= 1 ? 0 : i / (series.length - 1);
              // OKX market-flow: green → pink gradient across bars
              const fill =
                t < 0.45 ? stroke : t > 0.55 ? downStroke : t < 0.5 ? stroke : downStroke;
              const midMix = t >= 0.45 && t <= 0.55;
              return (
                <rect
                  key={`h-${i}`}
                  x={x}
                  y={plotBottom - h}
                  width={barW}
                  height={h}
                  rx={1}
                  fill={midMix ? "#fbbf24" : fill}
                  opacity={hoverIdx === i ? 1 : hoverIdx === null ? 0.85 : 0.35}
                />
              );
            })}
          </g>
        ) : null}

        {hoverX !== null && tipLines.length ? (
          <g>
            <line
              x1={hoverX}
              y1={chartY}
              x2={hoverX}
              y2={hasVolLane ? volY + volH : plotBottom}
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            {hY !== null ? (
              <circle cx={hoverX} cy={hY} r={5} fill={stroke} stroke="#0d0d0d" strokeWidth="2" />
            ) : null}
            <g
              transform={`translate(${Math.min(Math.max(hoverX + 8, chartX), chartX + chartW - tipW)},${Math.max(
                chartY + 4,
                (hY ?? flowMidY) - tipH - 6,
              )})`}
            >
              <rect
                width={tipW}
                height={tipH}
                rx="8"
                fill="#0a0a0a"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
              {tipLines.map((line, i) => (
                <g key={`tip-${i}`}>
                  <text
                    x="10"
                    y={16 + i * 16}
                    fill="rgba(161,161,170,0.9)"
                    style={{ fontSize: 9, fontWeight: 600 }}
                  >
                    {line.label}
                  </text>
                  <text
                    x={tipW - 10}
                    y={16 + i * 16}
                    textAnchor="end"
                    fill={line.color}
                    style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", fontWeight: 700 }}
                  >
                    {line.value}
                  </text>
                </g>
              ))}
            </g>
          </g>
        ) : variant === "macro" || variant === "line" ? (
          <circle
            cx={Number(activeLine.split(" ").at(-1)?.split(",")[0] ?? chartX + chartW)}
            cy={Number(activeLine.split(" ").at(-1)?.split(",")[1] ?? plotBottom)}
            r={4}
            fill={stroke}
            stroke="#0d0d0d"
            strokeWidth="2"
          />
        ) : null}
      </svg>
    </div>
  );
}
