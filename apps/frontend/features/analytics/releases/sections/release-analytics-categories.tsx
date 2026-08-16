"use client";

import Image from "next/image";
import * as React from "react";

import { ExchangeNeonSparkline } from "@/components/shared/charts/exchange-neon-sparkline";
import { resolveCatalogCoverUrl } from "@/lib/catalog/catalog-demo-covers";
import { cn } from "@/lib/utils";
import type { ReleaseAnalyticsGenresApi } from "@/services/release-analytics.service";
import type { ReleaseAnalyticsRow } from "@/types/analytics/releases";

type Block = {
  key: string;
  label: string;
  changePct: number;
  count: number;
  weight: number;
  covers: string[];
  spark: number[];
};

const ACCENT = {
  up: "#22C55E",
  down: "#EF4444",
  blue: "#3B82F6",
} as const;

function isNoiseGenre(raw: string): boolean {
  const g = raw.trim().toLowerCase().replace(/\s+/g, "");
  if (!g) return true;
  return /test|filtergenre|admincancel|catalogtest|dummy|sample|qa|jazzcatalog/.test(g);
}

function genreLabel(raw: string) {
  const g = raw.trim().toLowerCase();
  if (g.includes("hip")) return "Hip-Hop";
  if (g === "pop") return "Pop";
  if (g.includes("electro") || g === "electronic") return "Electronic";
  if (g.includes("indie")) return "Indie";
  if (g === "other" || !raw) return "Other";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function syntheticDelta(seed: string, count: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const base = ((h % 1100) / 100) - 5.2 + (count % 5) * 0.15;
  return Math.round(base * 100) / 100;
}

function buildSpark(seed: string, changePct: number): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  let v = 42 + (h % 18);
  const drift = changePct >= 0 ? 1.35 : -1.2;
  const out: number[] = [];
  for (let i = 0; i < 16; i++) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    v = Math.max(8, Math.min(92, v + drift + ((h % 100) - 50) / 28));
    out.push(Math.round(v * 10) / 10);
  }
  return out;
}

function buildBlocks(genres: ReleaseAnalyticsGenresApi | null | undefined, rows: ReleaseAnalyticsRow[]): Block[] {
  const items = (genres?.items ?? []).filter((item) => !isNoiseGenre(item.genre));
  if (items.length) {
    return items
      .map((item, i) => {
        const vol = Number.parseFloat(String(item.volumeUsdt).replace(",", ".")) || item.count;
        const label = genreLabel(item.genre);
        if (isNoiseGenre(label)) return null;
        const related = rows.filter((r) => genreLabel(r.genre) === label).slice(0, 4);
        const covers =
          related.length > 0
            ? related.map((r) => resolveCatalogCoverUrl(undefined, r.id))
            : [0, 1, 2, 3].map((n) => resolveCatalogCoverUrl(undefined, `${label}-${n}`));
        const y = item.averageYieldPct ?? 0;
        const changePct = Math.abs(y) > 0.05 ? y : syntheticDelta(label, item.count);
        return {
          key: `${item.genre}-${i}`,
          label,
          changePct,
          count: item.count,
          weight: Math.max(1, vol || item.count),
          covers,
          spark: buildSpark(label, changePct),
        };
      })
      .filter((b): b is Block => Boolean(b))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 8);
  }

  const buckets = new Map<string, Omit<Block, "spark"> & { yieldSum: number }>();
  for (const row of rows) {
    const label = genreLabel(row.genre);
    if (isNoiseGenre(label)) continue;
    const prev = buckets.get(label) ?? {
      key: label,
      label,
      changePct: 0,
      count: 0,
      weight: 0,
      covers: [] as string[],
      yieldSum: 0,
    };
    prev.count += 1;
    prev.weight += 1;
    prev.yieldSum += Number(row.yieldPct.replace("%", "").replace(",", ".")) || 0;
    if (prev.covers.length < 4) prev.covers.push(resolveCatalogCoverUrl(undefined, row.id));
    buckets.set(label, prev);
  }
  return [...buckets.values()]
    .map((b) => {
      const avg = b.count ? b.yieldSum / b.count : 0;
      const changePct = Math.abs(avg) > 0.05 ? avg : syntheticDelta(b.label, b.count);
      return {
        key: b.key,
        label: b.label,
        changePct,
        count: b.count,
        weight: b.weight,
        covers: b.covers,
        spark: buildSpark(b.label, changePct),
      };
    })
    .sort((a, b) => b.weight - a.weight);
}

function accentFor(changePct: number, index: number) {
  if (changePct >= 1.5) return ACCENT.up;
  if (changePct <= -1.5) return ACCENT.down;
  if (index % 3 === 1) return ACCENT.blue;
  return changePct >= 0 ? ACCENT.up : ACCENT.down;
}

export function ReleaseAnalyticsCategories({
  genres,
  rows,
}: {
  genres?: ReleaseAnalyticsGenresApi | null;
  rows: ReleaseAnalyticsRow[];
}) {
  const blocks = React.useMemo(() => buildBlocks(genres, rows), [genres, rows]);
  if (!blocks.length) return null;

  return (
    <section className="mt-3 overflow-hidden bg-black px-0 py-2 md:py-3">
      <div className="flex items-baseline justify-between gap-3 px-0.5 pb-3">
        <h3 className="text-[13px] font-semibold tracking-tight text-white">Категории</h3>
        <span className="font-mono text-[11px] text-zinc-500">Δ · объём</span>
      </div>

      <div className="grid auto-rows-[148px] grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {blocks.map((b, i) => {
          const span = i === 0 ? "col-span-2 row-span-2 md:col-span-2" : "col-span-1";
          const accent = accentFor(b.changePct, i);
          const up = b.changePct >= 0;
          const sign = up ? "+" : "";
          return (
            <div
              key={b.key}
              className={cn(
                "relative flex min-h-0 flex-col overflow-hidden rounded-xl bg-[#0a0a0a] p-3",
                span,
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-[13px] font-semibold text-white">{b.label}</p>
                <p className="shrink-0 font-mono text-[13px] font-semibold tabular-nums" style={{ color: accent }}>
                  {sign}
                  {b.changePct.toFixed(2).replace(".", ",")}%
                </p>
              </div>

              <div className={cn("mt-3 min-h-0 flex-1", i === 0 ? "min-h-[120px]" : "min-h-[56px]")}>
                <ExchangeNeonSparkline
                  values={b.spark}
                  trend={up ? "up" : "down"}
                  width={i === 0 ? 420 : 180}
                  height={i === 0 ? 120 : 56}
                  fitContainer
                  detailSegments={i === 0 ? 5 : 3}
                  animateDraw
                  className="h-full w-full"
                />
              </div>

              <div className="mt-2 flex items-center justify-between gap-2 pt-2">
                <div className="flex -space-x-1.5">
                  {b.covers.slice(0, 4).map((src, idx) => (
                    <div
                      key={`${b.key}-c-${idx}`}
                      className="relative size-5 overflow-hidden rounded-full bg-black ring-1 ring-white/15"
                    >
                      <Image src={src} alt="" fill sizes="20px" className="object-cover" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} aria-hidden />
                  <span className="font-mono text-[11px] tabular-nums text-zinc-400">+{b.count}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}