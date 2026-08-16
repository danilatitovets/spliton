"use client";

import { useCallback, useId, useMemo, useRef, useState, type MouseEvent } from "react";

import { useI18n } from "@/components/providers/i18n-provider";
import { formatNumber, formatPercent, formatUsdtAmount, intlLocaleFor } from "@/lib/i18n/formatters";
import { widgetMonthLabels } from "@/lib/i18n/widget-month-labels";
import { tf } from "@/lib/i18n/widget-messages";
import {
  assetsChartSlotClass,
  assetsDarkCardClass,
  assetsDarkPanelClass,
  assetsMetricsPairFooterClass,
  assetsMetricsPairHeaderClass,
  assetsMutedCardClass,
  assetsPanelClass,
} from "@/components/dashboard/assets/assets-ui";
import { MetricsGptToggle } from "@/components/dashboard/assets/metrics-gpt-toggle";
import { MetricsInfoTip } from "@/components/dashboard/assets/metrics-info-tip";
import { MetricsRangeMenu, type MetricsRangeId } from "@/components/dashboard/assets/metrics-range-menu";
import { SectionUnavailableState } from "@/components/shared/data-states/section-unavailable-state";
import { useReadOnlySectionError } from "@/hooks/use-read-only-section-error";
import { EmptyState } from "@/components/shared/data-states/empty-state";
import { cn } from "@/lib/utils";

const VIEW_W = 960;
const VIEW_H = 300;
const PAD = { top: 26, right: 20, bottom: 46, left: 56 };

const RANGE_IDS: MetricsRangeId[] = ["7d", "30d", "90d", "1y"];
const RANGE_KEYS: Record<MetricsRangeId, string> = {
  "7d": "chart.range7d",
  "30d": "chart.range30d",
  "90d": "chart.range90d",
  "1y": "chart.range1y",
};

function hash01(seed: number, i: number) {
  const x = Math.sin(seed * 127.1 + i * 311.7) * 10000;
  return x - Math.floor(x);
}

export type MetricsPoint = { label: string; primary: number; secondary?: number };

function buildBalanceSeries(n: number, seed: number, months: string[]): MetricsPoint[] {
  let bal = 6200 + hash01(seed, 0) * 200;
  let dep = 0;
  const out: MetricsPoint[] = [];
  for (let i = 0; i < n; i++) {
    bal += Math.sin(i / 2.4 + seed) * 45 + (hash01(seed, i) - 0.4) * 38;
    dep += Math.max(0, hash01(seed, i + 17) * 22 - 4);
    const mi = (i + seed) % 12;
    const label = n > 18 ? (i % 2 === 0 ? months[mi]! : "") : months[mi]!;
    out.push({ label, primary: Math.max(4000, bal), secondary: dep });
  }
  return out;
}

/** Period deltas (±) so bar charts show clear red/blue states. */
function buildPnlSeries(n: number, seed: number, months: string[]): MetricsPoint[] {
  const out: MetricsPoint[] = [];
  for (let i = 0; i < n; i++) {
    const delta = Math.sin(i / 1.8 + seed) * 0.022 + (hash01(seed, i) - 0.48) * 0.028;
    const mi = (i + seed * 2) % 12;
    const label = n > 20 ? (i % 2 === 0 ? months[mi]! : "") : months[mi]!;
    out.push({ label, primary: delta });
  }
  return out;
}

function barFill(value: number, dark: boolean) {
  if (value >= 0) return dark ? "#60a5fa" : "#2563eb";
  return dark ? "#f87171" : "#dc2626";
}

function fmtAxis(n: number, pct: boolean, locale: string) {
  if (pct) {
    return `${new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n * 100)}%`;
  }
  if (Math.abs(n) >= 1000) {
    return `${new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n / 1000)}k`;
  }
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n);
}

type DetailChartProps = {
  series: MetricsPoint[];
  showSecondary?: boolean;
  valueIsPercent?: boolean;
  tooltipPrimaryLabel?: string;
  tooltipValueSuffix?: string;
  tooltipFormatPrimary?: (n: number) => string;
  /** Dark bank-card / OKX chart surface. */
  tone?: "light" | "dark";
  /** `bars` = signed columns (blue +, red −); `line` = area sparkline. */
  variant?: "line" | "bars";
};

export function MetricsDetailChart({
  series,
  showSecondary,
  valueIsPercent,
  tooltipPrimaryLabel,
  tooltipValueSuffix,
  tooltipFormatPrimary,
  tone = "light",
  variant = "line",
}: DetailChartProps) {
  const { t, locale } = useI18n();
  const intlTag = intlLocaleFor(locale);
  const chartRef = useRef<HTMLDivElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const gid = useId().replace(/:/g, "");
  const dark = tone === "dark";
  const bars = variant === "bars";

  const innerW = VIEW_W - PAD.left - PAD.right;
  const innerH = VIEW_H - PAD.top - PAD.bottom;
  const n = series.length;
  const prim = series.map((p) => p.primary);
  const pMin = Math.min(0, ...prim);
  const pMax = Math.max(0, ...prim);
  const padY = bars
    ? Math.max(Math.abs(pMax - pMin) * 0.12, valueIsPercent ? 0.01 : Math.abs(pMax) * 0.08 || 1)
    : (Math.max(...prim) - Math.min(...prim)) * 0.08 || (valueIsPercent ? 0.02 : 80);
  const rawMin = bars ? pMin : Math.min(...prim);
  const rawMax = bars ? pMax : Math.max(...prim);
  const lo = rawMin - padY;
  const hi = rawMax + padY;
  const span = Math.max(hi - lo, 1e-9);

  const sec = showSecondary && !bars ? series.map((p) => p.secondary ?? 0) : null;
  const sMin = sec ? Math.min(...sec) : 0;
  const sMax = sec ? Math.max(...sec) : 1;
  const sPad = (sMax - sMin) * 0.1 || 1;
  const slo = sMin - sPad;
  const shi = sMax + sPad;
  const sspan = Math.max(shi - slo, 1e-9);

  const band = n > 0 ? innerW / n : innerW;
  const barW = Math.max(4, Math.min(28, band * 0.62));

  const xAt = useCallback(
    (i: number) => {
      if (bars) return PAD.left + band * i + band / 2;
      return PAD.left + (n <= 1 ? innerW / 2 : (innerW * i) / (n - 1));
    },
    [bars, band, innerW, n],
  );
  const yP = useCallback((v: number) => PAD.top + innerH - ((v - lo) / span) * innerH, [innerH, lo, span]);
  const yS = useCallback((v: number) => PAD.top + innerH - ((v - slo) / sspan) * innerH, [innerH, slo, sspan]);
  const zeroY = yP(0);

  const pickHover = useCallback(
    (clientX: number, clientY: number) => {
      const el = chartRef.current;
      if (!el || n < 1) return null;
      const r = el.getBoundingClientRect();
      const svgX = ((clientX - r.left) / r.width) * VIEW_W;
      const svgY = ((clientY - r.top) / r.height) * VIEW_H;
      if (svgX < PAD.left - 4 || svgX > VIEW_W - PAD.right + 4) return null;
      if (svgY < PAD.top - 2 || svgY > PAD.top + innerH + 2) return null;
      if (bars) {
        const idx = Math.floor((svgX - PAD.left) / band);
        return Math.min(n - 1, Math.max(0, idx));
      }
      const tVal = (svgX - PAD.left) / innerW;
      if (Number.isNaN(tVal)) return null;
      return Math.round(Math.min(1, Math.max(0, tVal)) * (n <= 1 ? 0 : n - 1));
    },
    [bars, band, innerH, innerW, n],
  );

  const onMove = (e: MouseEvent<HTMLDivElement>) => setHoverIdx(pickHover(e.clientX, e.clientY));
  const onLeave = () => setHoverIdx(null);
  const onTouch = (clientX: number, clientY: number) => {
    const idx = pickHover(clientX, clientY);
    setHoverIdx(idx);
  };

  const tipLabel = tooltipPrimaryLabel ?? (valueIsPercent ? t("metrics.pnlAbs") : t("metrics.tooltipValue"));
  const tipSuffix = tooltipValueSuffix ?? (valueIsPercent ? "" : " USDT");

  const linePrimary = useMemo(() => {
    if (bars || n === 0) return "";
    return series.map((p, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)},${yP(p.primary).toFixed(1)}`).join("");
  }, [bars, series, n, xAt, yP]);

  const areaPrimary = useMemo(() => {
    if (!linePrimary || n === 0) return "";
    const x0 = xAt(0);
    const x1 = xAt(n - 1);
    const yb = PAD.top + innerH;
    return `${linePrimary} L${x1.toFixed(1)},${yb.toFixed(1)} L${x0.toFixed(1)},${yb.toFixed(1)} Z`;
  }, [linePrimary, n, xAt, innerH]);

  const lineSecondary = useMemo(() => {
    if (bars || !showSecondary || !sec || n === 0) return "";
    return series.map((p, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)},${yS(p.secondary ?? 0).toFixed(1)}`).join("");
  }, [bars, series, n, sec, showSecondary, xAt, yS]);

  const ticks = 6;
  const gridStroke = dark ? "#2a2a2c" : "#e5e5e5";
  const vGridStroke = dark ? "#1f1f21" : "#f0f0f0";
  const axisFill = dark ? "#737373" : "#a3a3a3";
  const labelFill = dark ? "#a3a3a3" : "#737373";
  const lineStroke = dark ? "#f5f5f5" : "#1d4ed8";
  const secStroke = dark ? "#737373" : "#94a3b8";
  const hoverStroke = dark ? "#a3a3a3" : "#60a5fa";
  const areaTop = dark ? "#ffffff" : "#3b82f6";
  const areaTopOpacity = dark ? "0.16" : "0.2";
  const areaBottom = dark ? "#000000" : "#ffffff";
  const zeroStroke = dark ? "#525252" : "#d4d4d4";

  return (
    <div
      ref={chartRef}
      className={cn(
        "relative min-w-0 touch-pan-y overflow-hidden rounded-2xl px-0.5 py-1 sm:cursor-crosshair sm:px-3 sm:py-2",
        dark ? "bg-transparent" : "bg-white/80",
      )}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        if (touch) onTouch(touch.clientX, touch.clientY);
      }}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        if (touch) onTouch(touch.clientX, touch.clientY);
      }}
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block h-[176px] w-full max-w-full sm:h-[260px]" preserveAspectRatio="xMidYMid meet" role="img">
        <defs>
          <linearGradient id={`${gid}-area`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={areaTop} stopOpacity={areaTopOpacity} />
            <stop offset="100%" stopColor={areaBottom} stopOpacity="0" />
          </linearGradient>
          <filter id={`${gid}-glow`} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.1" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {Array.from({ length: ticks }, (_, i) => {
          const v = lo + (span * i) / (ticks - 1);
          const y = yP(v);
          return (
            <g key={`h-${i}`}>
              <line x1={PAD.left} x2={VIEW_W - PAD.right} y1={y} y2={y} stroke={gridStroke} strokeDasharray="2 6" />
              <text x={PAD.left - 8} y={y + 3} textAnchor="end" fill={axisFill} fontSize="10" style={{ fontFamily: "var(--font-app-mono), ui-monospace, monospace", fontVariantNumeric: "tabular-nums" }}>
                {fmtAxis(v, Boolean(valueIsPercent), intlTag)}
              </text>
            </g>
          );
        })}

        {!bars
          ? series.map((_, i) => {
              if (i % 2 !== 0 && i !== n - 1) return null;
              const x = xAt(i);
              return <line key={`v-${i}`} x1={x} x2={x} y1={PAD.top} y2={PAD.top + innerH} stroke={vGridStroke} strokeWidth={1} />;
            })
          : null}

        {bars ? (
          <>
            <line x1={PAD.left} x2={VIEW_W - PAD.right} y1={zeroY} y2={zeroY} stroke={zeroStroke} strokeWidth={1.25} />
            {series.map((p, i) => {
              const x = xAt(i) - barW / 2;
              const yVal = yP(p.primary);
              const top = Math.min(yVal, zeroY);
              const height = Math.max(1.5, Math.abs(yVal - zeroY));
              const active = hoverIdx === i;
              return (
                <rect
                  key={`bar-${i}`}
                  x={x}
                  y={top}
                  width={barW}
                  height={height}
                  rx={Math.min(4, barW / 3)}
                  fill={barFill(p.primary, dark)}
                  opacity={hoverIdx == null || active ? 1 : 0.38}
                />
              );
            })}
          </>
        ) : (
          <>
            <path d={areaPrimary} fill={`url(#${gid}-area)`} stroke="none" />
            {lineSecondary ? (
              <path d={lineSecondary} fill="none" stroke={secStroke} strokeWidth={1.35} strokeDasharray="4 4" strokeLinecap="round" />
            ) : null}
            <path
              d={linePrimary}
              fill="none"
              stroke={lineStroke}
              strokeWidth={2.35}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={dark ? undefined : `url(#${gid}-glow)`}
            />
          </>
        )}

        {series.map((p, i) => {
          if (!p.label) return null;
          const x = xAt(i);
          const isFirst = i === 0;
          const isLast = i === n - 1;
          let anchor: "start" | "middle" | "end" = "middle";
          let xPos = x;
          if (n <= 1) {
            xPos = PAD.left + innerW / 2;
          } else if (isFirst && !bars) {
            anchor = "start";
            xPos = PAD.left + 2;
          } else if (isLast && !bars) {
            anchor = "end";
            xPos = PAD.left + innerW - 2;
          }
          return (
            <text key={`xl-${i}`} x={xPos} y={VIEW_H - 12} textAnchor={anchor} fill={labelFill} fontSize="10" fontWeight={600}>
              {p.label}
            </text>
          );
        })}

        {showSecondary && sec
          ? Array.from({ length: 4 }, (_, i) => {
              const v = slo + (sspan * i) / 3;
              const y = yS(v);
              return (
                <text key={`sr-${i}`} x={VIEW_W - 8} y={y + 3} textAnchor="end" fill={secStroke} fontSize="9" style={{ fontFamily: "var(--font-app-mono), monospace" }}>
                  {fmtAxis(v, false, intlTag)}
                </text>
              );
            })
          : null}

        {hoverIdx !== null && n > 0 && !bars ? (
          <line x1={xAt(hoverIdx)} x2={xAt(hoverIdx)} y1={PAD.top} y2={PAD.top + innerH} stroke={hoverStroke} strokeWidth={1} strokeDasharray="4 4" opacity={0.9} />
        ) : null}
      </svg>

      {hoverIdx !== null && series[hoverIdx] && (
        <div
          className={cn(
            "pointer-events-none absolute left-3 top-10 z-10 max-w-[220px] rounded-xl px-3 py-2 text-xs shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
            dark ? "bg-[#2f2f2f] ring-1 ring-white/10" : "bg-[#2f2f2f] ring-1 ring-white/10",
          )}
        >
          <p className="font-semibold text-white">
            {series[hoverIdx]!.label || tf(t("metrics.tooltipPoint"), { n: String(hoverIdx + 1) })}
          </p>
          <p className="mt-1 font-mono text-white/80">
            {tipLabel}:{" "}
            {tooltipFormatPrimary != null
              ? tooltipFormatPrimary(series[hoverIdx]!.primary)
              : fmtAxis(series[hoverIdx]!.primary, Boolean(valueIsPercent), intlTag)}
            {tipSuffix}
          </p>
          {showSecondary && series[hoverIdx]!.secondary != null ? (
            <p className="font-mono text-white/45">
              {t("metrics.inputLabel")} {fmtAxis(series[hoverIdx]!.secondary!, false, intlTag)} USDT
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function MetricsResultsChart() {
  const { t, locale } = useI18n();
  const months = useMemo(() => widgetMonthLabels(t), [t]);
  const [range, setRange] = useState<MetricsRangeId>("30d");
  const [pnlMode, setPnlMode] = useState<"abs" | "pct">("abs");

  const series = useMemo(() => {
    const n = range === "7d" ? 12 : range === "30d" ? 22 : range === "90d" ? 18 : 26;
    const seed = range === "7d" ? 2 : range === "30d" ? 5 : range === "90d" ? 8 : 13;
    const raw = buildPnlSeries(n, seed, months);
    if (pnlMode === "pct") return raw;
    return raw.map((p, i) => ({ ...p, primary: p.primary * 4200 + (hash01(seed, i) - 0.5) * 80 }));
  }, [range, pnlMode, months]);

  const cumulative = useMemo(() => series.reduce((sum, p) => sum + p.primary, 0), [series]);
  const headlineAbs = cumulative;
  const headlinePct = formatPercent(cumulative * 100, locale);

  const rangeOptions = RANGE_IDS.map((id) => ({ id, label: t(RANGE_KEYS[id]) }));

  return (
    <section className={cn(assetsMutedCardClass, "flex h-full flex-col space-y-4 sm:space-y-5")} aria-label={t("metrics.pnlAria")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-semibold tracking-tight text-neutral-900 sm:text-xl">{t("metrics.pnlTitle")}</h3>
            <MetricsInfoTip label={t("assets.metrics.infoLabel")}>{t("metrics.pnlInfo")}</MetricsInfoTip>
          </div>
          <p className="text-sm text-neutral-500">{t("metrics.pnlSubtitle")}</p>
          {pnlMode === "pct" ? (
            <p className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-neutral-900 sm:text-[2.25rem]">
              {headlinePct}
            </p>
          ) : (
            <p className="flex flex-wrap items-baseline gap-x-2 font-mono text-2xl font-semibold tabular-nums tracking-tight text-neutral-900 sm:text-[2.25rem]">
              <span className="whitespace-nowrap">
                {new Intl.NumberFormat(intlLocaleFor(locale), {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(headlineAbs)}
              </span>
              <span className="text-sm font-sans font-medium text-neutral-400 sm:text-lg">USDT</span>
            </p>
          )}
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <MetricsGptToggle
            value={pnlMode}
            onChange={setPnlMode}
            ariaLabel={t("metrics.pnlScaleAria")}
            size="sm"
            options={[
              { id: "abs", label: t("metrics.pnlAbs") },
              { id: "pct", label: t("metrics.pnlPct") },
            ]}
          />
          <div className="sm:hidden">
            <MetricsRangeMenu
              value={range}
              onChange={setRange}
              options={rangeOptions}
              ariaLabel={t("metrics.intervalAria")}
            />
          </div>
          <div className="hidden sm:block">
            <MetricsGptToggle
              value={range}
              onChange={setRange}
              options={rangeOptions}
              ariaLabel={t("metrics.intervalAria")}
              size="sm"
            />
          </div>
        </div>
      </div>

      <MetricsDetailChart
        series={series}
        showSecondary={false}
        valueIsPercent={pnlMode === "pct"}
        tone="light"
        variant="bars"
      />

      <div className="mt-auto flex items-center justify-between border-t border-neutral-300 pt-3 text-[11px] text-neutral-500 sm:pt-4">
        <span>19.03.2026</span>
        <span>17.04.2026</span>
      </div>
    </section>
  );
}

export function MetricsAssetDynamicsChart({
  liveSeries,
  liveLoading,
  liveEmpty,
  liveError,
  onRetry,
  isLiveMode = false,
  cashflowTotals,
  cashflowLoading,
  cashflowError,
  dataSourceLabel,
  compact = false,
  tone = "light",
}: {
  liveSeries?: MetricsPoint[] | null;
  liveLoading?: boolean;
  liveEmpty?: boolean;
  liveError?: string | null;
  onRetry?: () => void;
  isLiveMode?: boolean;
  cashflowTotals?: { deposits30d: number; withdrawals30d: number } | null;
  cashflowLoading?: boolean;
  cashflowError?: string | null;
  dataSourceLabel?: string;
  compact?: boolean;
  tone?: "light" | "dark";
} = {}) {
  const { t, locale } = useI18n();
  const months = useMemo(() => widgetMonthLabels(t), [t]);
  const [range, setRange] = useState<MetricsRangeId>("30d");
  const dark = tone === "dark";

  const mockSeries = useMemo(() => {
    const n = range === "7d" ? 14 : range === "30d" ? 24 : range === "90d" ? 20 : 28;
    const seed = 17;
    return buildBalanceSeries(n, seed, months);
  }, [range, months]);

  const useLive = isLiveMode && liveSeries != null && liveSeries.length > 0;
  const showMock = !isLiveMode;
  const balanceSeries = useLive ? liveSeries! : showMock ? mockSeries : [];
  const series = useMemo(() => {
    if (balanceSeries.length === 0) return [];
    return balanceSeries.map((p, i) => ({
      label: p.label,
      primary: i === 0 ? 0 : p.primary - balanceSeries[i - 1]!.primary,
      secondary: p.secondary,
    }));
  }, [balanceSeries]);

  const tvl = useLive
    ? Math.round(balanceSeries[balanceSeries.length - 1]?.primary ?? 0)
    : showMock
      ? Math.round(mockSeries[mockSeries.length - 1]?.primary ?? 0)
      : 0;

  useReadOnlySectionError("metrics-asset-dynamics-chart", liveError, onRetry);

  const rangeOptions = RANGE_IDS.map((id) => ({ id, label: t(RANGE_KEYS[id]) }));

  const chartBody = liveLoading ? (
    <p className={cn("text-center text-sm", dark ? "text-white/45" : "text-neutral-500")}>{t("assets.loadingChart")}</p>
  ) : liveError ? (
    <SectionUnavailableState onRetry={onRetry} />
  ) : isLiveMode && liveEmpty && !useLive ? (
    <EmptyState
      situation="chartEmpty"
      message={`${t("chart.noHistory")} ${t("chart.noHistoryHint")}`}
      className="py-0 sm:py-0"
    />
  ) : series.length > 0 ? (
    <MetricsDetailChart
      series={series}
      showSecondary={false}
      valueIsPercent={false}
      tone={tone}
      variant="bars"
      tooltipPrimaryLabel={t("metrics.pnlAbs")}
    />
  ) : (
    <EmptyState situation="chartEmpty" message={t("chart.noHistory")} className="py-0 sm:py-0" />
  );

  return (
    <section
      className={cn(
        dark ? assetsDarkCardClass : assetsMutedCardClass,
        "flex h-full flex-col",
        compact ? "gap-3" : "gap-5 sm:gap-6",
      )}
      aria-label={t("metrics.balanceAria")}
    >
      <div
        className={cn(
          "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
          compact && assetsMetricsPairHeaderClass,
        )}
      >
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-1.5">
            <h3
              className={cn(
                "font-semibold tracking-tight",
                dark ? "text-white" : "text-neutral-900",
                compact ? "text-base sm:text-lg" : "text-lg sm:text-xl",
              )}
            >
              {t("metrics.balanceTitle")}
            </h3>
            <MetricsInfoTip label={t("assets.metrics.infoLabel")} tone={dark ? "onDark" : "onLight"}>
              {t("metrics.balanceInfo")}
            </MetricsInfoTip>
          </div>
          {!compact ? (
            <p className={cn("text-sm", dark ? "text-white/45" : "text-neutral-500")}>
              {dataSourceLabel ??
                (useLive
                  ? t("metrics.balanceSubtitleLive")
                  : showMock
                    ? t("metrics.balanceSubtitleDemo")
                    : t("metrics.balanceSubtitleLive"))}
            </p>
          ) : (
            <p className={cn("text-sm", dark ? "text-white/45" : "text-neutral-500")}>{t("overview.estimatedBalanceLabel")}</p>
          )}
          <p
            className={cn(
              "font-mono text-2xl font-semibold tabular-nums tracking-tight sm:text-[2.25rem]",
              dark ? "text-white" : "text-neutral-900",
            )}
          >
            {tvl > 0 ? (
              <>
                {formatNumber(tvl, locale)}{" "}
                <span className={cn("text-base font-sans font-medium", dark ? "text-white/40" : "text-neutral-400")}>USDT</span>
              </>
            ) : (
              <span className={cn("text-base font-sans font-medium", dark ? "text-white/45" : "text-neutral-500")}>
                {t("common.emptyBalance")}
              </span>
            )}
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <div className="sm:hidden">
            <MetricsRangeMenu
              value={range}
              onChange={setRange}
              options={rangeOptions}
              ariaLabel={t("metrics.intervalAria")}
            />
          </div>
          <div className="hidden sm:block">
            <MetricsGptToggle
              value={range}
              onChange={setRange}
              options={rangeOptions}
              ariaLabel={t("metrics.intervalAria")}
              size="sm"
            />
          </div>
        </div>
      </div>

      <div className={cn(assetsChartSlotClass, compact && "flex-1")}>{chartBody}</div>

      <div
        className={cn(
          compact && assetsMetricsPairFooterClass,
          "space-y-3 border-t pt-4",
          dark ? "border-white/20" : "border-neutral-300",
        )}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={cn(dark ? assetsDarkPanelClass : assetsPanelClass, "px-4 py-4")}>
            <div className="flex items-center gap-1">
              <p className={cn("text-[10px] font-semibold uppercase tracking-[0.14em]", dark ? "text-white/40" : "text-neutral-400")}>
                {t("chart.deposits30d")}
              </p>
              <MetricsInfoTip label={t("assets.metrics.infoLabel")} tone={dark ? "onDark" : "onLight"}>
                {t("metrics.depositsInfo")}
              </MetricsInfoTip>
            </div>
            <p className={cn("mt-2 font-mono text-xl font-semibold tabular-nums", dark ? "text-white" : "text-neutral-900")}>
              {showMock ? (
                <>+1 240,00 USDT</>
              ) : cashflowLoading ? (
                "…"
              ) : cashflowError ? (
                t("common.emptyAmount")
              ) : cashflowTotals ? (
                <>+{formatUsdtAmount(cashflowTotals.deposits30d, locale).replace(" USDT", "")} USDT</>
              ) : (
                t("common.emptyAmount")
              )}
            </p>
            {showMock ? (
              <p className={cn("mt-1 text-[10px]", dark ? "text-white/35" : "text-neutral-400")}>{t("assets.demoLabel")}</p>
            ) : null}
            {!showMock && cashflowError ? (
              <p className={cn("mt-1 text-[10px]", dark ? "text-white/40" : "text-neutral-500")}>{t("chart.dataUnavailable")}</p>
            ) : null}
          </div>
          <div className={cn(dark ? assetsDarkPanelClass : assetsPanelClass, "px-4 py-4")}>
            <div className="flex items-center gap-1">
              <p className={cn("text-[10px] font-semibold uppercase tracking-[0.14em]", dark ? "text-white/40" : "text-neutral-400")}>
                {t("chart.withdrawals30d")}
              </p>
              <MetricsInfoTip label={t("assets.metrics.infoLabel")} tone={dark ? "onDark" : "onLight"}>
                {t("metrics.withdrawalsInfo")}
              </MetricsInfoTip>
            </div>
            <p className={cn("mt-2 font-mono text-xl font-semibold tabular-nums", dark ? "text-white" : "text-neutral-900")}>
              {showMock ? (
                <>−860,00 USDT</>
              ) : cashflowLoading ? (
                "…"
              ) : cashflowError ? (
                t("common.emptyAmount")
              ) : cashflowTotals ? (
                <>−{formatUsdtAmount(cashflowTotals.withdrawals30d, locale).replace(" USDT", "")} USDT</>
              ) : (
                t("common.emptyAmount")
              )}
            </p>
            {showMock ? (
              <p className={cn("mt-1 text-[10px]", dark ? "text-white/35" : "text-neutral-400")}>{t("assets.demoLabel")}</p>
            ) : null}
            {!showMock && cashflowError ? (
              <p className={cn("mt-1 text-[10px]", dark ? "text-white/40" : "text-neutral-500")}>{t("chart.dataUnavailable")}</p>
            ) : null}
          </div>
        </div>

        {showMock ? (
          <div className={cn("flex items-center justify-between text-[11px]", dark ? "text-white/40" : "text-neutral-500")}>
            <span>19.03.2026</span>
            <span>17.04.2026</span>
          </div>
        ) : cashflowTotals ? (
          <div className={cn("flex items-center justify-between text-[11px]", dark ? "text-white/40" : "text-neutral-500")}>
            <span>{t("chart.last30days")}</span>
            <span>{t("assets.metrics.walletActivity")}</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
