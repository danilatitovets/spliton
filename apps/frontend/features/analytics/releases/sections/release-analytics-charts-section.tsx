"use client";

import * as React from "react";
import Link from "next/link";

import { useI18n } from "@/components/providers/i18n-provider";
import { analyticsReleaseDetailPath } from "@/constants/routes";
import { catalogGenreLabelKey, normalizeCatalogGenreKey } from "@/lib/catalog/catalog-genre";
import { formatUnitsCompact, formatUsdtCompact } from "@/lib/market-overview/format";
import { cn } from "@/lib/utils";
import type {
  ReleaseAnalyticsCompareApi,
  ReleaseAnalyticsFunnelApi,
  ReleaseAnalyticsGenresApi,
  ReleaseAnalyticsTimeseriesApi,
} from "@/services/release-analytics.service";
import type { ReleaseAnalyticsPeriod } from "@/types/analytics/releases";

import { buildReleaseAnalyticsChartsMock } from "@/mocks/analytics/release-analytics-charts.mock";
import { AnalyticsHeaderTip } from "../ui/analytics-header-tip";

const shell = "rounded-xl bg-[#111111] p-4 md:p-5";
const sectionTitle = "text-[13px] font-semibold tracking-tight text-white";

const UP = "#C1FF72";
const DOWN = "#FF4D8D";
const BLUE = "#6B7CFF";

function parseUsdt(raw: string | number | null | undefined): number {
  if (raw == null) return 0;
  const n = typeof raw === "number" ? raw : Number.parseFloat(String(raw).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(raw: string | number): string {
  const n = parseUsdt(raw);
  if (n <= 0) return "0 USDT";
  return `${formatUsdtCompact(n)} USDT`;
}

function formatMoneyHero(n: number): { main: string; unit: string } {
  if (!Number.isFinite(n) || n <= 0) return { main: "0", unit: "USDT" };
  const compact = formatUsdtCompact(n);
  return { main: compact, unit: "USDT" };
}

function titleCaseGenre(raw: string): string {
  const s = raw.trim();
  if (!s) return "Other";
  if (s.toLowerCase() === "other") return "Other";
  return s
    .split(/[\s/_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function isNoiseGenre(raw: string): boolean {
  const g = raw.trim().toLowerCase().replace(/\s+/g, "");
  if (!g) return true;
  return /test|filtergenre|admincancel|catalogtest|dummy|sample|qa/.test(g);
}

function isNoiseRelease(title: string, symbol: string): boolean {
  const hay = `${title} ${symbol}`.toLowerCase();
  return /\b(e2e|test|admin|compliance|dummy|sample|qa|book track|trade depth|ph track)\b/.test(hay);
}

function seriesHasVolume(
  points: { volumeUsdt?: string; payoutsUsdt?: string }[] | null | undefined,
): boolean {
  if (!points?.length) return false;
  return points.some((p) => parseUsdt(p.volumeUsdt ?? p.payoutsUsdt) > 0);
}

function Panel({
  title,
  tip,
  badge,
  children,
  className,
}: {
  title: string;
  tip?: string;
  badge?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(shell, className)}>
      <div className="flex items-center justify-between gap-2">
        <p className={sectionTitle}>
          <AnalyticsHeaderTip label={title} tip={tip} />
        </p>
        {badge ? (
          <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-zinc-500">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function VolumeBars({
  title,
  tip,
  badge,
  points,
  accent = "mixed",
}: {
  title: string;
  tip?: string;
  badge?: string | null;
  points: { date: string; volumeUsdt: string; ordersCount?: number; tradesCount?: number }[];
  accent?: "lime" | "pink" | "mixed";
}) {
  const [ready, setReady] = React.useState(false);
  const [hover, setHover] = React.useState<number | null>(null);

  React.useEffect(() => {
    setReady(false);
    const t = window.setTimeout(() => setReady(true), 40);
    return () => window.clearTimeout(t);
  }, [points]);

  const slice = React.useMemo(() => {
    const src = points.length ? points : [];
    return src.slice(-32);
  }, [points]);

  const values = slice.map((p) => parseUsdt(p.volumeUsdt));
  const max = Math.max(...values, 1);
  const total = values.reduce((s, v) => s + v, 0);
  const first = values[0] ?? 0;
  const last = values[values.length - 1] ?? 0;
  const deltaPct = first > 0 ? ((last - first) / first) * 100 : 0;
  const hero = formatMoneyHero(total);
  const deltaUp = deltaPct >= 0;

  const chartW = 640;
  const chartH = 148;
  const gap = 3;
  const barW = slice.length > 0 ? (chartW - gap * (slice.length - 1)) / slice.length : 8;

  const accentDot = accent === "pink" ? DOWN : accent === "lime" ? UP : BLUE;

  return (
    <div className={shell}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className={sectionTitle}>
              <AnalyticsHeaderTip label={title} tip={tip} />
            </p>
            {badge ? (
              <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
                {badge}
              </span>
            ) : null}
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span
              className="mb-2 inline-block size-2 shrink-0 rounded-full"
              style={{ background: accentDot, boxShadow: `0 0 10px ${accentDot}` }}
              aria-hidden
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                <span className="font-mono text-[28px] font-semibold leading-none tracking-tight text-white sm:text-[32px]">
                  {hero.main}
                </span>
                <span className="font-mono text-[13px] font-medium text-zinc-500">{hero.unit}</span>
              </div>
              <div
                className={cn(
                  "mt-1.5 font-mono text-[13px] font-semibold tabular-nums",
                  deltaUp ? "text-[#C1FF72]" : "text-[#FF4D8D]",
                )}
              >
                {deltaUp ? "+" : ""}
                {deltaPct.toFixed(2).replace(".", ",")}%
                <span className="ml-1.5 font-sans text-[11px] font-normal text-zinc-600">за период</span>
              </div>
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] text-zinc-600">{slice.length} точек</p>
          {hover != null && slice[hover] ? (
            <p className="mt-1 font-mono text-[11px] tabular-nums text-zinc-300">
              {formatMoney(values[hover]!)}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 w-full">
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="block h-[148px] w-full"
          role="img"
          aria-label={title}
          onMouseLeave={() => setHover(null)}
        >
          {[0.25, 0.5, 0.75].map((t) => (
            <line
              key={t}
              x1={0}
              x2={chartW}
              y1={chartH * t}
              y2={chartH * t}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          ))}
          {slice.map((p, idx) => {
            const value = values[idx]!;
            const hRatio = Math.max(0.06, value / max);
            const fullH = hRatio * (chartH - 4);
            const h = ready ? fullH : 0;
            const x = idx * (barW + gap);
            const y = chartH - h;
            const up = accent === "lime" ? true : accent === "pink" ? false : idx % 3 !== 2;
            const blueBar = accent === "mixed" && idx % 3 === 1;
            const color = blueBar ? BLUE : up ? UP : DOWN;
            return (
              <rect
                key={`${p.date}-${idx}`}
                x={x}
                y={y}
                width={Math.max(barW, 2)}
                height={h}
                rx={2}
                fill={color}
                opacity={hover == null || hover === idx ? 0.92 : 0.35}
                style={{ transition: "height 0.7s cubic-bezier(0.22, 1, 0.36, 1), y 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.15s" }}
                onMouseEnter={() => setHover(idx)}
              >
                <title>{`${p.date}: ${formatMoney(value)}`}</title>
              </rect>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-b border-white/[0.06] py-2.5 last:border-0">
      <span className="text-[13px] text-zinc-400">{label}</span>
      <span className="font-mono text-[15px] font-semibold tabular-nums tracking-tight text-white">{value}</span>
    </li>
  );
}

const GENRE_COLORS = [UP, BLUE, DOWN, "#F59E0B", "#A78BFA", "#34D399", "#FB7185", "#38BDF8"] as const;

function GenresChart({
  rows,
  badge,
  title,
  tip,
}: {
  rows: { label: string; count: number; volume: number }[];
  badge?: string | null;
  title: string;
  tip?: string;
}) {
  const [ready, setReady] = React.useState(false);
  const [hover, setHover] = React.useState<number | null>(null);

  React.useEffect(() => {
    setReady(false);
    const t = window.setTimeout(() => setReady(true), 50);
    return () => window.clearTimeout(t);
  }, [rows]);

  const max = Math.max(...rows.map((r) => r.count), 1);
  const total = rows.reduce((s, r) => s + r.count, 0);
  const top = rows[0];

  const chartW = 560;
  const chartH = 168;
  const padX = 8;
  const padBottom = 28;
  const plotH = chartH - padBottom;
  const gap = 10;
  const barW = rows.length > 0 ? (chartW - padX * 2 - gap * (rows.length - 1)) / rows.length : 40;

  return (
    <div className={shell}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className={sectionTitle}>
              <AnalyticsHeaderTip label={title} tip={tip} />
            </p>
            {badge ? (
              <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
                {badge}
              </span>
            ) : null}
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span
              className="mb-2 inline-block size-2 shrink-0 rounded-full"
              style={{ background: UP, boxShadow: `0 0 10px ${UP}` }}
              aria-hidden
            />
            <div>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-mono text-[28px] font-semibold leading-none tracking-tight text-white sm:text-[32px]">
                  {total.toLocaleString("ru-RU")}
                </span>
                <span className="text-[12px] text-zinc-500">релизов</span>
              </div>
              {top ? (
                <p className="mt-1.5 text-[12px] text-zinc-500">
                  лидер: <span className="text-zinc-200">{top.label}</span>
                  <span className="ml-1.5 font-mono text-[#C1FF72]">
                    {((top.count / Math.max(total, 1)) * 100).toFixed(1).replace(".", ",")}%
                  </span>
                </p>
              ) : null}
            </div>
          </div>
        </div>
        {hover != null && rows[hover] ? (
          <div className="shrink-0 text-right">
            <p className="text-[12px] font-medium text-white">{rows[hover]!.label}</p>
            <p className="mt-0.5 font-mono text-[12px] tabular-nums text-zinc-400">
              {rows[hover]!.count.toLocaleString("ru-RU")}
              {rows[hover]!.volume > 0 ? ` · ${formatMoney(rows[hover]!.volume)}` : ""}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-4 w-full">
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="block h-[180px] w-full"
          role="img"
          aria-label={title}
          onMouseLeave={() => setHover(null)}
        >
          {[0.25, 0.5, 0.75].map((t) => (
            <line
              key={t}
              x1={padX}
              x2={chartW - padX}
              y1={plotH * t}
              y2={plotH * t}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          ))}
          {rows.map((g, idx) => {
            const fullH = Math.max(8, (g.count / max) * (plotH - 8));
            const x = padX + idx * (barW + gap);
            const y = plotH - fullH;
            const color = GENRE_COLORS[idx % GENRE_COLORS.length]!;
            const active = hover == null || hover === idx;
            const delay = `${Math.min(idx * 70, 420)}ms`;
            return (
              <g key={g.label} onMouseEnter={() => setHover(idx)} className="cursor-pointer">
                <rect
                  x={x}
                  y={y}
                  width={Math.max(barW, 6)}
                  height={fullH}
                  rx={3}
                  fill={color}
                  opacity={active ? 0.9 : 0.28}
                  style={{
                    transformOrigin: `${x + barW / 2}px ${plotH}px`,
                    transform: ready ? "scaleY(1)" : "scaleY(0)",
                    transition: `transform 0.85s cubic-bezier(0.22, 1, 0.36, 1) ${delay}, opacity 0.15s`,
                  }}
                />
                <text
                  x={x + barW / 2}
                  y={Math.max(12, y - 6)}
                  textAnchor="middle"
                  fill={active ? "#fff" : "#71717a"}
                  fontSize="11"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="600"
                  opacity={ready ? 1 : 0}
                  style={{ transition: `opacity 0.4s ease ${280 + idx * 70}ms` }}
                >
                  {g.count.toLocaleString("ru-RU")}
                </text>
                <text
                  x={x + barW / 2}
                  y={chartH - 8}
                  textAnchor="middle"
                  fill="#9CA3AF"
                  fontSize="10"
                >
                  {g.label.length > 10 ? `${g.label.slice(0, 9)}…` : g.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <ul className="mt-2 space-y-1.5 border-t border-white/[0.06] pt-3">
        {rows.slice(0, 5).map((g, idx) => {
          const share = (g.count / Math.max(total, 1)) * 100;
          const color = GENRE_COLORS[idx % GENRE_COLORS.length]!;
          return (
            <li key={`leg-${g.label}`} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="size-2 shrink-0 rounded-full" style={{ background: color }} aria-hidden />
                <span className="truncate text-[12px] text-zinc-300">{g.label}</span>
              </div>
              <span className="shrink-0 font-mono text-[12px] font-semibold tabular-nums text-white">
                {share.toFixed(1).replace(".", ",")}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ReleaseAnalyticsChartsSection({
  timeseries,
  compare,
  genres,
  funnel,
  loading,
  error,
  onRetry,
  demoFill = false,
  period = "30d",
}: {
  timeseries: ReleaseAnalyticsTimeseriesApi | null;
  compare: ReleaseAnalyticsCompareApi | null;
  genres: ReleaseAnalyticsGenresApi | null;
  funnel: ReleaseAnalyticsFunnelApi | null;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  demoFill?: boolean;
  period?: ReleaseAnalyticsPeriod;
}) {
  const { t } = useI18n();
  const demoBadge = demoFill ? "демо" : null;

  const demoCharts = React.useMemo(() => buildReleaseAnalyticsChartsMock(period), [period]);

  const genreRows = React.useMemo(() => {
    const map = new Map<string, { label: string; count: number; volume: number }>();
    for (const item of genres?.items ?? []) {
      const raw = item.genre?.trim() || "Other";
      if (isNoiseGenre(raw)) continue;
      const key = normalizeCatalogGenreKey(raw) || raw.toLowerCase();
      const labelKey = catalogGenreLabelKey(raw);
      const label = labelKey ? t(labelKey) : titleCaseGenre(raw);
      const volume = parseUsdt(item.volumeUsdt);
      const prev = map.get(key);
      if (prev) {
        prev.count += item.count;
        prev.volume += volume;
      } else {
        map.set(key, { label, count: item.count, volume });
      }
    }
    const live = [...map.values()].sort((a, b) => b.count - a.count || b.volume - a.volume).slice(0, 8);
    if (live.length) return live;
    return demoCharts.genres.items
      .filter((g) => !isNoiseGenre(g.genre))
      .map((g) => ({
        label: titleCaseGenre(g.genre),
        count: g.count,
        volume: parseUsdt(g.volumeUsdt),
      }))
      .slice(0, 8);
  }, [demoCharts.genres.items, genres?.items, t]);

  const compareRows = React.useMemo(() => {
    const items = [...(compare?.items ?? [])].filter((item) => !isNoiseRelease(item.title, item.symbol));
    items.sort((a, b) => {
      const av = parseUsdt(a.secondaryVolumeUsdt) || parseUsdt(a.raisedUsdt);
      const bv = parseUsdt(b.secondaryVolumeUsdt) || parseUsdt(b.raisedUsdt);
      return bv - av || b.holdersCount - a.holdersCount;
    });
    const sliced = items.slice(0, 8);
    return sliced.length ? sliced : demoCharts.compare.items.slice(0, 8);
  }, [compare?.items, demoCharts.compare.items]);


  // Always prefer real positive volume; otherwise force demo series (never blank panels).
  const primaryPoints = seriesHasVolume(timeseries?.primaryVolume)
    ? timeseries!.primaryVolume
    : demoCharts.timeseries.primaryVolume;
  const secondaryPoints = seriesHasVolume(timeseries?.secondaryVolume)
    ? timeseries!.secondaryVolume
    : demoCharts.timeseries.secondaryVolume;
  const payoutSource = seriesHasVolume(timeseries?.payouts)
    ? timeseries!.payouts
    : demoCharts.timeseries.payouts;
  const payoutPoints = payoutSource.map((p) => ({
    date: p.date,
    volumeUsdt: p.payoutsUsdt,
  }));
  const funnelSteps = funnel?.steps ?? demoCharts.funnel.steps;
  const usingVolumeDemo =
    !seriesHasVolume(timeseries?.primaryVolume) ||
    !seriesHasVolume(timeseries?.secondaryVolume) ||
    !seriesHasVolume(timeseries?.payouts);
  const volumeBadge = demoFill || usingVolumeDemo ? "демо" : null;

  if (loading) {
    return (
      <div className="mt-2 grid gap-3 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-52 animate-pulse rounded-xl bg-white/[0.04]" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("mt-2", shell)}>
        <p className="text-sm text-zinc-400">{t("analytics.releases.charts.metricsUnavailable")}</p>
        {onRetry ? (
          <button type="button" className="mt-3 text-sm text-white underline" onClick={onRetry}>
            {t("analytics.releases.charts.retry")}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-1 space-y-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <VolumeBars
          title={t("analytics.releases.charts.titlePrimary")}
          tip={t("analytics.releases.charts.hintPrimary")}
          badge={volumeBadge}
          points={primaryPoints}
          accent="mixed"
        />
        <VolumeBars
          title={t("analytics.releases.charts.titleSecondary")}
          tip={t("analytics.releases.charts.hintSecondary")}
          badge={volumeBadge}
          points={secondaryPoints}
          accent="mixed"
        />
        <VolumeBars
          title={t("analytics.releases.charts.titlePayouts")}
          tip={t("analytics.releases.charts.hintPayouts")}
          badge={volumeBadge}
          points={payoutPoints}
          accent="lime"
        />
        <Panel title={t("analytics.releases.charts.titleFunnel")} tip={t("analytics.releases.charts.emptyBody")} badge={demoBadge}>
          <ul>
            <MetricRow
              label={t("analytics.releases.charts.funnelReleases")}
              value={funnelSteps.createdReleases.toLocaleString("ru-RU")}
            />
            <MetricRow
              label={t("analytics.releases.charts.funnelActiveRounds")}
              value={funnelSteps.activeRounds.toLocaleString("ru-RU")}
            />
            <MetricRow
              label={t("analytics.releases.charts.funnelSold")}
              value={formatUnitsCompact(parseUsdt(funnelSteps.soldUnits))}
            />
            <MetricRow
              label={t("analytics.releases.charts.funnelHolders")}
              value={funnelSteps.holders.toLocaleString("ru-RU")}
            />
            <MetricRow
              label={t("analytics.releases.charts.funnelPayouts")}
              value={funnelSteps.payoutsReleases.toLocaleString("ru-RU")}
            />
            <MetricRow
              label={t("analytics.releases.charts.funnelListings")}
              value={funnelSteps.secondaryListings.toLocaleString("ru-RU")}
            />
            <MetricRow
              label={t("analytics.releases.charts.funnelTrades")}
              value={funnelSteps.secondaryTrades.toLocaleString("ru-RU")}
            />
          </ul>
        </Panel>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel title={t("analytics.releases.charts.titleCompare")} tip={t("analytics.releases.charts.compareEmpty")} badge={demoBadge}>
          <ul className="space-y-0.5">
            {compareRows.map((item) => {
              const secondary = parseUsdt(item.secondaryVolumeUsdt);
              const raised = parseUsdt(item.raisedUsdt);
              const metric = secondary > 0 ? formatMoney(secondary) : formatMoney(raised);
              return (
                <li key={item.id}>
                  <Link
                    href={analyticsReleaseDetailPath(item.id)}
                    className="flex items-center justify-between gap-3 rounded-lg px-1 py-2.5 transition hover:bg-white/[0.04]"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-mono text-[11px] font-semibold text-zinc-500">
                        {item.symbol || "—"}
                      </div>
                      <div className="mt-0.5 truncate text-[13px] text-zinc-100">{item.title}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-mono text-[12px] tabular-nums text-zinc-200">{metric}</div>
                      <div className="mt-0.5 font-mono text-[10px] tabular-nums text-zinc-600">
                        {item.holdersCount.toLocaleString("ru-RU")}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>

        <GenresChart
          title={t("analytics.releases.charts.titleGenres")}
          tip={t("analytics.releases.charts.genresEmpty")}
          badge={demoBadge}
          rows={genreRows}
        />
      </div>
    </div>
  );
}