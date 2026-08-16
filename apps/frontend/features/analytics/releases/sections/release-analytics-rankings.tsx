"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { analyticsReleaseDetailPath } from "@/constants/routes";
import { parseSignedPercentChange } from "@/lib/analytics/change-pct";
import { resolveCatalogCoverUrl } from "@/lib/catalog/catalog-demo-covers";
import { cn } from "@/lib/utils";
import type { ReleaseAnalyticsRow } from "@/types/analytics/releases";

function parseMoney(s: string) {
  return Number(s.replace(/[^\d]/g, "")) || 0;
}

function parseYield(s: string) {
  return Number(s.replace("%", "").replace(",", ".").replace("−", "-")) || 0;
}

type RankColumn = {
  id: string;
  title: string;
  iconSrc: string;
  rows: ReleaseAnalyticsRow[];
};

function buildColumns(rows: ReleaseAnalyticsRow[]): RankColumn[] {
  const popular = [...rows].sort((a, b) => parseMoney(b.payouts) - parseMoney(a.payouts)).slice(0, 7);
  const gainers = [...rows]
    .sort((a, b) => parseSignedPercentChange(b.changePct) - parseSignedPercentChange(a.changePct))
    .slice(0, 7);
  const losers = [...rows]
    .sort((a, b) => parseSignedPercentChange(a.changePct) - parseSignedPercentChange(b.changePct))
    .slice(0, 7);
  return [
    {
      id: "popular",
      title: "Популярные",
      iconSrc: "/images/analytics/rankings/popular.png",
      rows: popular,
    },
    {
      id: "gainers",
      title: "Лидеры роста",
      iconSrc: "/images/analytics/rankings/gainers.png",
      rows: gainers,
    },
    {
      id: "losers",
      title: "Лидеры падения",
      iconSrc: "/images/analytics/rankings/losers.png",
      rows: losers,
    },
  ];
}

function changeTone(changePct: string) {
  const n = parseSignedPercentChange(changePct);
  if (n > 0) return "text-[#00C087]";
  if (n < 0) return "text-[#FF4D4F]";
  return "text-zinc-500";
}

function RankRow({ row, rank }: { row: ReleaseAnalyticsRow; rank: number }) {
  const cover = resolveCatalogCoverUrl(undefined, row.id);
  return (
    <li>
      <Link
        href={analyticsReleaseDetailPath(row.id)}
        className="grid grid-cols-[18px_minmax(0,1fr)_auto_72px] items-center gap-2 rounded-lg px-1 py-2 transition hover:bg-white/[0.04]"
      >
        <span className="text-center text-[11px] tabular-nums text-zinc-600">{rank}</span>
        <div className="flex min-w-0 items-center gap-2">
          <div className="relative size-7 shrink-0 overflow-hidden rounded-full bg-zinc-800">
            <Image src={cover} alt="" fill sizes="28px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-white">
              {row.symbol}
              <span className="font-normal text-zinc-500"> / USDT</span>
            </p>
            <p className="truncate text-[11px] text-zinc-600">{row.payouts}</p>
          </div>
        </div>
        <div className="min-w-[72px] text-right">
          <p className="font-mono text-[13px] font-semibold tabular-nums text-white">{row.yieldPct}</p>
          <p className="font-mono text-[10px] tabular-nums text-zinc-600">{parseYield(row.yieldPct).toFixed(2)}</p>
        </div>
        <p className={cn("text-right font-mono text-[13px] font-semibold tabular-nums", changeTone(row.changePct))}>
          {row.changePct}
        </p>
      </Link>
    </li>
  );
}

export function ReleaseAnalyticsRankings({
  rows,
  onSeeAll,
}: {
  rows: ReleaseAnalyticsRow[];
  onSeeAll?: () => void;
}) {
  const columns = React.useMemo(() => buildColumns(rows), [rows]);
  if (!rows.length) return null;

  return (
    <section className="mt-2">
      <div className="grid gap-3 lg:grid-cols-3">
        {columns.map((col) => (
          <div key={col.id} className="min-w-0 rounded-xl bg-[#0d0d0d] px-3 py-3.5 ring-1 ring-white/[0.06] md:px-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="relative size-5 shrink-0 overflow-hidden rounded-full">
                  <Image src={col.iconSrc} alt="" fill sizes="20px" className="object-cover" />
                </div>
                <h3 className="truncate text-[13px] font-semibold text-zinc-200">{col.title}</h3>
              </div>
              <button
                type="button"
                onClick={onSeeAll}
                className="shrink-0 text-[11px] font-medium text-zinc-600 transition hover:text-zinc-300"
              >
                Еще ›
              </button>
            </div>
            <ul className="mt-2">
              {col.rows.map((row, i) => (
                <RankRow key={`${col.id}-${row.id}`} row={row} rank={i + 1} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}