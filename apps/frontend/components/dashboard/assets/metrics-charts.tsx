"use client";

import { Info } from "lucide-react";
import { useCallback, useId, useMemo, useRef, useState, type MouseEvent } from "react";

import { cn } from "@/lib/utils";

const VIEW_W = 960;
const VIEW_H = 300;
const PAD = { top: 26, right: 20, bottom: 46, left: 56 };

function hash01(seed: number, i: number) {
  const x = Math.sin(seed * 127.1 + i * 311.7) * 10000;
  return x - Math.floor(x);
}

export type MetricsPoint = { label: string; primary: number; secondary?: number };

function buildBalanceSeries(n: number, seed: number): MetricsPoint[] {
  const months = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
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

function buildPnlSeries(n: number, seed: number): MetricsPoint[] {
  const months = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
  let v = 0;
  const out: MetricsPoint[] = [];
  for (let i = 0; i < n; i++) {
    v += Math.sin(i / 1.8 + seed) * 0.012 + (hash01(seed, i) - 0.48) * 0.018;
    const mi = (i + seed * 2) % 12;
    const label = n > 20 ? (i % 2 === 0 ? months[mi]! : "") : months[mi]!;
    out.push({ label, primary: v });
  }
  return out;
}

function fmtAxis(n: number, pct: boolean) {
  if (pct) return `${(n * 100).toFixed(2).replace(".", ",")}%`;
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(2).replace(".", ",")}k`;
  return n.toFixed(3).replace(".", ",");
}

type RangeOpt = { id: string; label: string };

type DetailChartProps = {
  series: MetricsPoint[];
  /** вторая линия (например накопленные депозиты) */
  showSecondary?: boolean;
  valueIsPercent?: boolean;
  /** Подпись метрики в тултипе (по умолчанию «PnL» / «Значение») */
  tooltipPrimaryLabel?: string;
  /** Суффикс значения в тултипе (по умолчанию пусто для % и « USDT» иначе) */
  tooltipValueSuffix?: string;
  /** Кастомное отображение значения в тултипе вместо fmtAxis */
  tooltipFormatPrimary?: (n: number) => string;
};

export function MetricsDetailChart({
  series,
  showSecondary,
  valueIsPercent,
  tooltipPrimaryLabel,
  tooltipValueSuffix,
  tooltipFormatPrimary,
}: DetailChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const gid = useId().replace(/:/g, "");

  const innerW = VIEW_W - PAD.left - PAD.right;
  const innerH = VIEW_H - PAD.top - PAD.bottom;
  const n = series.length;
  const prim = series.map((p) => p.primary);
  const pMin = Math.min(...prim);
  const pMax = Math.max(...prim);
  const padY = (pMax - pMin) * 0.08 || (valueIsPercent ? 0.02 : 80);
  const lo = pMin - padY;
  const hi = pMax + padY;
  const span = Math.max(hi - lo, 1e-9);

  const sec = showSecondary ? series.map((p) => p.secondary ?? 0) : null;
  const sMin = sec ? Math.min(...sec) : 0;
  const sMax = sec ? Math.max(...sec) : 1;
  const sPad = (sMax - sMin) * 0.1 || 1;
  const slo = sMin - sPad;
  const shi = sMax + sPad;
  const sspan = Math.max(shi - slo, 1e-9);

  const xAt = useCallback((i: number) => PAD.left + (n <= 1 ? innerW / 2 : (innerW * i) / (n - 1)), [innerW, n]);
  const yP = useCallback((v: number) => PAD.top + innerH - ((v - lo) / span) * innerH, [innerH, lo, span]);
  const yS = useCallback((v: number) => PAD.top + innerH - ((v - slo) / sspan) * innerH, [innerH, slo, sspan]);

  const pickHover = useCallback(
    (clientX: number, clientY: number) => {
      const el = chartRef.current;
      if (!el || n < 1) return null;
      const r = el.getBoundingClientRect();
      const svgX = ((clientX - r.left) / r.width) * VIEW_W;
      const svgY = ((clientY - r.top) / r.height) * VIEW_H;
      if (svgX < PAD.left - 4 || svgX > VIEW_W - PAD.right + 4) return null;
      if (svgY < PAD.top - 2 || svgY > PAD.top + innerH + 2) return null;
      const t = (svgX - PAD.left) / innerW;
      if (Number.isNaN(t)) return null;
      return Math.round(Math.min(1, Math.max(0, t)) * (n <= 1 ? 0 : n - 1));
    },
    [innerH, innerW, n],
  );

  const onMove = (e: MouseEvent<HTMLDivElement>) => setHoverIdx(pickHover(e.clientX, e.clientY));
  const onLeave = () => setHoverIdx(null);

  const tipLabel = tooltipPrimaryLabel ?? (valueIsPercent ? "PnL" : "Значение");
  const tipSuffix = tooltipValueSuffix ?? (valueIsPercent ? "" : " USDT");

  const linePrimary = useMemo(() => {
    if (n === 0) return "";
    return series.map((p, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)},${yP(p.primary).toFixed(1)}`).join("");
  }, [series, n, xAt, yP]);

  const areaPrimary = useMemo(() => {
    if (!linePrimary || n === 0) return "";
    const x0 = xAt(0);
    const x1 = xAt(n - 1);
    const yb = PAD.top + innerH;
    return `${linePrimary} L${x1.toFixed(1)},${yb.toFixed(1)} L${x0.toFixed(1)},${yb.toFixed(1)} Z`;
  }, [linePrimary, n, xAt, innerH]);

  const lineSecondary = useMemo(() => {
    if (!showSecondary || !sec || n === 0) return "";
    return series.map((p, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)},${yS(p.secondary ?? 0).toFixed(1)}`).join("");
  }, [series, n, sec, showSecondary, xAt, yS]);

  const ticks = 6;

  return (
    <div
      ref={chartRef}
      className="relative min-w-0 cursor-crosshair overflow-hidden rounded-2xl bg-neutral-50/90 px-2 py-2 ring-1 ring-neutral-100 sm:px-3"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block h-[240px] w-full max-w-full sm:h-[280px]" preserveAspectRatio="xMidYMid meet" role="img">
        <defs>
          <linearGradient id={`${gid}-area`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
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
              <line x1={PAD.left} x2={VIEW_W - PAD.right} y1={y} y2={y} stroke="#e5e5e5" strokeDasharray="2 6" />
              <text x={PAD.left - 8} y={y + 3} textAnchor="end" fill="#a3a3a3" fontSize="10" style={{ fontFamily: "var(--font-app-mono), ui-monospace, monospace", fontVariantNumeric: "tabular-nums" }}>
                {fmtAxis(v, Boolean(valueIsPercent))}
              </text>
            </g>
          );
        })}

        {series.map((_, i) => {
          if (i % 2 !== 0 && i !== n - 1) return null;
          const x = xAt(i);
          return <line key={`v-${i}`} x1={x} x2={x} y1={PAD.top} y2={PAD.top + innerH} stroke="#f0f0f0" strokeWidth={1} />;
        })}

        <path d={areaPrimary} fill={`url(#${gid}-area)`} stroke="none" />
        {lineSecondary ? (
          <path d={lineSecondary} fill="none" stroke="#94a3b8" strokeWidth={1.35} strokeDasharray="4 4" strokeLinecap="round" />
        ) : null}
        <path
          d={linePrimary}
          fill="none"
          stroke="#1d4ed8"
          strokeWidth={2.35}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${gid}-glow)`}
        />

        {series.map((p, i) => {
          if (!p.label) return null;
          const x = xAt(i);
          const isFirst = i === 0;
          const isLast = i === n - 1;
          let anchor: "start" | "middle" | "end" = "middle";
          let xPos = x;
          if (n <= 1) {
            xPos = PAD.left + innerW / 2;
          } else if (isFirst) {
            anchor = "start";
            xPos = PAD.left + 2;
          } else if (isLast) {
            anchor = "end";
            xPos = PAD.left + innerW - 2;
          }
          return (
            <text key={`xl-${i}`} x={xPos} y={VIEW_H - 12} textAnchor={anchor} fill="#737373" fontSize="10" fontWeight={600}>
              {p.label}
            </text>
          );
        })}

        {showSecondary && sec
          ? Array.from({ length: 4 }, (_, i) => {
              const v = slo + (sspan * i) / 3;
              const y = yS(v);
              return (
                <text key={`sr-${i}`} x={VIEW_W - 8} y={y + 3} textAnchor="end" fill="#94a3b8" fontSize="9" style={{ fontFamily: "var(--font-app-mono), monospace" }}>
                  {fmtAxis(v, false)}
                </text>
              );
            })
          : null}

        {hoverIdx !== null && n > 0 && (
          <line x1={xAt(hoverIdx)} x2={xAt(hoverIdx)} y1={PAD.top} y2={PAD.top + innerH} stroke="#60a5fa" strokeWidth={1} strokeDasharray="4 4" opacity={0.9} />
        )}
      </svg>

      {hoverIdx !== null && series[hoverIdx] && (
        <div className="pointer-events-none absolute left-3 top-10 z-10 max-w-[220px] rounded-xl border border-neutral-200 bg-white/95 px-3 py-2 text-xs shadow-lg ring-1 ring-neutral-100">
          <p className="font-semibold text-neutral-900">{series[hoverIdx]!.label || `Точка ${hoverIdx + 1}`}</p>
          <p className="mt-1 font-mono text-neutral-800">
            {tipLabel}:{" "}
            {tooltipFormatPrimary != null
              ? tooltipFormatPrimary(series[hoverIdx]!.primary)
              : fmtAxis(series[hoverIdx]!.primary, Boolean(valueIsPercent))}
            {tipSuffix}
          </p>
          {showSecondary && series[hoverIdx]!.secondary != null ? (
            <p className="font-mono text-neutral-500">Ввод: {fmtAxis(series[hoverIdx]!.secondary!, false)} USDT</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

const RANGE_PRESETS: RangeOpt[] = [
  { id: "7d", label: "7 дн." },
  { id: "30d", label: "30 дн." },
  { id: "90d", label: "90 дн." },
  { id: "1y", label: "1 г." },
];

export function MetricsResultsChart() {
  const [range, setRange] = useState("30d");
  const [pnlMode, setPnlMode] = useState<"abs" | "pct">("abs");

  const series = useMemo(() => {
    const n = range === "7d" ? 12 : range === "30d" ? 22 : range === "90d" ? 18 : 26;
    const seed = range === "7d" ? 2 : range === "30d" ? 5 : range === "90d" ? 8 : 13;
    const raw = buildPnlSeries(n, seed);
    if (pnlMode === "pct") return raw;
    return raw.map((p, i) => ({ ...p, primary: p.primary * 4200 + i * 12 }));
  }, [range, pnlMode]);

  const headline =
    pnlMode === "pct"
      ? `${(series[series.length - 1]!.primary * 100).toFixed(2).replace(".", ",")}%`
      : `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(series[series.length - 1]!.primary * 1000))} USDT`;

  return (
    <section className="space-y-6 rounded-3xl bg-white px-5 py-6 sm:space-y-8 sm:px-7 sm:py-8" aria-label="Результаты PnL">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Metrics · PnL</p>
            <span className="text-neutral-400" title="Мок-ряд для интерфейса.">
              <Info className="size-3.5" strokeWidth={2} aria-hidden />
            </span>
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">Результаты</h3>
          <p className="text-sm text-neutral-500">Совокупный PnL за выбранный период</p>
          <p className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-neutral-900 sm:text-[2.25rem]">{headline}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-neutral-100 p-1" role="tablist" aria-label="Шкала PnL">
            {(
              [
                { id: "abs" as const, label: "PnL" },
                { id: "pct" as const, label: "PnL %" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={pnlMode === t.id}
                onClick={() => setPnlMode(t.id)}
                className={cn(
                  "rounded-lg px-3 py-2 text-[11px] font-semibold transition-colors",
                  pnlMode === t.id ? "bg-white text-neutral-900 ring-1 ring-neutral-200/80" : "text-neutral-500 hover:text-neutral-800",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex rounded-xl bg-neutral-100 p-1" role="tablist" aria-label="Интервал">
            {RANGE_PRESETS.map((r) => (
              <button
                key={r.id}
                type="button"
                role="tab"
                aria-selected={range === r.id}
                onClick={() => setRange(r.id)}
                className={cn(
                  "rounded-lg px-3 py-2 text-[11px] font-semibold transition-colors",
                  range === r.id ? "bg-white text-neutral-900 ring-1 ring-neutral-200/80" : "text-neutral-500 hover:text-neutral-800",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <MetricsDetailChart series={series} showSecondary={false} valueIsPercent={pnlMode === "pct"} />

      <div className="flex items-center justify-between border-t border-neutral-100 pt-4 text-[11px] text-neutral-500">
        <span>19.03.2026</span>
        <span>17.04.2026</span>
      </div>
    </section>
  );
}

export function MetricsAssetDynamicsChart() {
  const [range, setRange] = useState("30d");

  const series = useMemo(() => {
    const n = range === "7d" ? 14 : range === "30d" ? 24 : range === "90d" ? 20 : 28;
    const seed = 17;
    return buildBalanceSeries(n, seed);
  }, [range]);

  const tvl = Math.round(series[series.length - 1]!.primary);

  return (
    <section className="space-y-6 rounded-3xl bg-white px-5 py-6 sm:space-y-8 sm:px-7 sm:py-8" aria-label="Динамика активов">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Metrics · Balance</p>
            <span className="text-neutral-400" title="Мок: оценка баланса и накопленный ввод.">
              <Info className="size-3.5" strokeWidth={2} aria-hidden />
            </span>
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">Динамика активов</h3>
          <p className="text-sm text-neutral-500">Расчётный общий баланс holdings</p>
          <p className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-neutral-900 sm:text-[2.25rem]">
            {new Intl.NumberFormat("ru-RU").format(tvl)} <span className="text-base font-sans font-medium text-neutral-400">USDT</span>
          </p>
        </div>
        <div className="flex rounded-xl bg-neutral-100 p-1" role="tablist" aria-label="Интервал">
          {RANGE_PRESETS.map((r) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={range === r.id}
              onClick={() => setRange(r.id)}
              className={cn(
                "rounded-lg px-3 py-2 text-[11px] font-semibold transition-colors",
                range === r.id ? "bg-white text-neutral-900 ring-1 ring-neutral-200/80" : "text-neutral-500 hover:text-neutral-800",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <MetricsDetailChart series={series} showSecondary valueIsPercent={false} />

      <div className="grid gap-4 border-t border-neutral-100 pt-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-neutral-50/90 px-4 py-4 ring-1 ring-neutral-100">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">Депозиты (30 дн.)</p>
          <p className="mt-2 font-mono text-xl font-semibold tabular-nums text-neutral-900">+1 240,00 USDT</p>
        </div>
        <div className="rounded-2xl bg-neutral-50/90 px-4 py-4 ring-1 ring-neutral-100">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">Выводы (30 дн.)</p>
          <p className="mt-2 font-mono text-xl font-semibold tabular-nums text-neutral-900">−860,00 USDT</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-neutral-500">
        <span>19.03.2026</span>
        <span>17.04.2026</span>
      </div>
    </section>
  );
}
