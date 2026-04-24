"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import type { ReleaseMarketAnalyticsChartBlock } from "@/types/catalog/release-market-analytics";

type Accent = ReleaseMarketAnalyticsChartBlock["accent"];

const ACCENT: Record<Accent, { stroke: string; soft: string; dot: string; matrix: string }> = {
  lime: {
    stroke: "#B7F500",
    soft: "rgba(183,245,0,0.14)",
    dot: "#B7F500",
    matrix: "0 0 0 0 0.72 0 0 0 0 0.96 0 0 0 0 0 0 0 0 0.55 0",
  },
  sky: {
    stroke: "#38bdf8",
    soft: "rgba(56,189,248,0.12)",
    dot: "#7dd3fc",
    matrix: "0 0 0 0 0.2 0 0 0 0 0.75 0 0 0 0 0.95 0 0 0 0.5 0",
  },
  fuchsia: {
    stroke: "#e879f9",
    soft: "rgba(232,121,249,0.12)",
    dot: "#f0abfc",
    matrix: "0 0 0 0 0.95 0 0 0 0 0.35 0 0 0 0 0.85 0 0 0 0.48 0",
  },
  zinc: {
    stroke: "#a1a1aa",
    soft: "rgba(161,161,170,0.12)",
    dot: "#d4d4d8",
    matrix: "0 0 0 0 0.75 0 0 0 0 0.75 0 0 0 0 0.78 0 0 0 0.45 0",
  },
};

function formatTick(v: number): string {
  if (Math.abs(v) >= 1000) return v.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
  if (Math.abs(v) < 10 && v % 1 !== 0) return v.toFixed(2).replace(".", ",");
  return v.toFixed(1).replace(".", ",");
}

function buildGeometry(
  values: number[],
  chartX: number,
  chartY: number,
  chartW: number,
  chartH: number,
) {
  const n = values.length;
  if (n === 0) {
    return { pointCoords: [] as { x: number; y: number; value: number; i: number }[], line: "", vmin: 0, vmax: 1 };
  }
  const vmin = Math.min(...values);
  const vmax = Math.max(...values);
  const vspan = Math.max(vmax - vmin, 1e-9);
  const denom = Math.max(n - 1, 1);
  const pointCoords = values.map((v, i) => ({
    x: chartX + (i / denom) * chartW,
    y: chartY + (1 - (v - vmin) / vspan) * chartH,
    value: v,
    i,
  }));
  const line = pointCoords.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  return { pointCoords, line, vmin, vmax };
}

export function ReleaseAnalyticsProChart({
  values,
  accent,
  className,
}: {
  values: number[];
  accent: Accent;
  className?: string;
}) {
  const uid = React.useId().replace(/:/g, "");
  const glowId = `ra-glow-${uid}`;
  const clipId = `ra-clip-${uid}`;
  const pal = ACCENT[accent];

  const [w, setW] = React.useState(0);
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setW(Math.floor(entries[0]?.contentRect.width ?? 0));
    });
    ro.observe(el);
    setW(Math.floor(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);

  const svgW = Math.max(w || 360, 280);
  const svgH = 168;
  const chartX = 44;
  const chartY = 20;
  const chartW = Math.max(svgW - chartX - 12, 80);
  const chartH = 112;
  const chartBottom = chartY + chartH;

  const { pointCoords, line, vmin, vmax } = React.useMemo(
    () => buildGeometry(values, chartX, chartY, chartW, chartH),
    [values, chartX, chartY, chartW, chartH],
  );

  const n = values.length;
  const idxDenom = Math.max(n - 1, 1);
  const lastIdx = Math.max(n - 1, 0);
  const activeIdx = hoverIdx ?? lastIdx;
  const activePoint = pointCoords[activeIdx] ?? pointCoords.at(-1);
  const delta = activeIdx > 0 ? values[activeIdx]! - values[activeIdx - 1]! : null;

  const yTicks =
    vmax === vmin
      ? [vmax + 1, vmax, vmax - 1]
      : ([vmax, vmin + (vmax - vmin) * 0.5, vmin] as const).map((t) => Math.round(t * 1000) / 1000);

  const onPointer = (e: React.PointerEvent<SVGSVGElement>) => {
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
    const t = (xSvg - chartX) / chartW;
    const idx = Math.round(t * idxDenom);
    setHoverIdx(Math.max(0, Math.min(lastIdx, idx)));
  };

  const hoverX = activePoint?.x ?? null;
  const hoverY = activePoint?.y ?? null;

  if (n === 0) {
    return <div className={cn("h-[168px] w-full rounded-lg bg-[#0a0a0a]/50", className)} aria-hidden />;
  }

  return (
    <div ref={wrapRef} className={cn("w-full min-w-0", className)}>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        preserveAspectRatio="xMidYMid meet"
        className="block h-[168px] w-full touch-none select-none"
        role="img"
        aria-hidden
        onPointerMove={onPointer}
        onPointerDown={onPointer}
        onPointerLeave={onPointer}
        onPointerCancel={onPointer}
      >
        <defs>
          <filter id={glowId} x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feColorMatrix in="blur" type="matrix" values={pal.matrix} result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id={clipId}>
            <rect x={chartX} y={chartY} width={chartW} height={chartH} />
          </clipPath>
        </defs>

        {yTicks.map((tick, i) => {
          const span = Math.max(yTicks.length - 1, 1);
          const y = chartY + (i / span) * chartH;
          return (
            <g key={`${tick}-${i}`}>
              <line
                x1={chartX}
                y1={y}
                x2={chartX + chartW}
                y2={y}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
              <text x={8} y={y + 3} fill="rgba(161,161,170,0.75)" fontSize="10" className="tabular-nums">
                {formatTick(tick)}
              </text>
            </g>
          );
        })}

        <g clipPath={`url(#${clipId})`}>
          <polyline
            points={line}
            fill="none"
            stroke={pal.soft}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={line}
            fill="none"
            stroke={pal.stroke}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${glowId})`}
          />
        </g>

        {hoverX != null && hoverY != null ? (
          <g>
            <line
              x1={hoverX}
              y1={chartY}
              x2={hoverX}
              y2={chartBottom}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            <circle cx={hoverX} cy={hoverY} r="4" fill={pal.dot} stroke="#0a0a0a" strokeWidth="2" />
          </g>
        ) : null}

        {activePoint ? (
          <g transform={`translate(${Math.min(activePoint.x + 8, chartX + chartW - 124)},${Math.max(activePoint.y - 44, chartY + 4)})`}>
            <rect width="118" height="40" rx="8" fill="#0a0a0a" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <text x="10" y="15" fill="rgba(161,161,170,0.88)" fontSize="9" fontWeight="600">
              #{activeIdx + 1}
            </text>
            {delta != null ? (
              <text x="108" y="15" fill="rgba(161,161,170,0.85)" fontSize="9" className="tabular-nums" textAnchor="end">
                Δ{delta >= 0 ? "+" : ""}
                {formatTick(delta)}
              </text>
            ) : null}
            <text x="10" y="31" fill="white" fontSize="12" fontWeight="700" className="tabular-nums">
              {formatTick(activePoint.value)}
            </text>
          </g>
        ) : null}
      </svg>
    </div>
  );
}
