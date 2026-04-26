"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { SortHeader } from "@/components/shared/exchange/sort-header";
import {
  catalogBuyUnitsPath,
  catalogMarketOverviewReleaseAnalyticsPath,
  ROUTES,
} from "@/constants/routes";
import { formatUsdtCompact, formatUnitsCompact } from "@/lib/market-overview/format";
import { cn } from "@/lib/utils";
import type { MarketOverviewRow, MarketTableSortKey } from "@/types/market-overview";

import { MarketMiniSparkline } from "./ui/market-mini-sparkline";

export function MarketOverviewTable({
  rows,
  sort,
  sortDir,
  onSort,
}: {
  rows: MarketOverviewRow[];
  sort: MarketTableSortKey;
  sortDir: "asc" | "desc";
  onSort: (k: MarketTableSortKey) => void;
}) {
  const router = useRouter();

  return (
    <div>
      <div className="mt-5 overflow-x-auto rounded-xl bg-[#111111]">
        <table className="w-full min-w-[1180px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="text-zinc-500">
              <th className="px-3 py-2.5 font-normal">
                <span className="text-[11px] uppercase tracking-wide">Релиз</span>
              </th>
              <th className="px-3 py-2.5 font-normal">
                <span className="text-[11px] uppercase tracking-wide">Артист / сегмент</span>
              </th>
              <th className="px-3 py-2.5">
                <SortHeader
                  label="Доходн."
                  active={sort === "yield"}
                  dir={sort === "yield" ? sortDir : "desc"}
                  onClick={() => onSort("yield")}
                />
              </th>
              <th className="px-3 py-2.5">
                <SortHeader
                  label="Выплаты"
                  active={sort === "payouts"}
                  dir={sort === "payouts" ? sortDir : "desc"}
                  onClick={() => onSort("payouts")}
                  align="right"
                />
              </th>
              <th className="px-3 py-2.5">
                <SortHeader
                  label="Активн."
                  active={sort === "activity"}
                  dir={sort === "activity" ? sortDir : "desc"}
                  onClick={() => onSort("activity")}
                  align="right"
                />
              </th>
              <th className="px-3 py-2.5">
                <SortHeader
                  label="Avail. UNT"
                  active={sort === "units"}
                  dir={sort === "units" ? sortDir : "desc"}
                  onClick={() => onSort("units")}
                  align="right"
                />
              </th>
              <th className="px-3 py-2.5 font-normal">
                <span className="text-[11px] uppercase tracking-wide">Secondary</span>
              </th>
              <th className="px-3 py-2.5 font-normal">
                <span className="text-[11px] uppercase tracking-wide">Ликвидность</span>
              </th>
              <th className="px-3 py-2.5 font-normal">
                <span className="text-[11px] uppercase tracking-wide">Тренд</span>
              </th>
              <th className="px-3 py-2.5 text-right font-normal">
                <span className="text-[11px] uppercase tracking-wide">Действие</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const deltaClass =
                r.trend === "up" ? "text-[#B7F500]" : r.trend === "down" ? "text-fuchsia-400" : "text-zinc-500";
              return (
                <tr
                  key={r.id}
                  id={`market-release-${r.id}`}
                  role="link"
                  tabIndex={0}
                  className="cursor-pointer text-zinc-300 transition-colors hover:bg-white/[0.04] data-[release-focus=1]:bg-white/[0.07] data-[release-focus=1]:ring-2 data-[release-focus=1]:ring-inset data-[release-focus=1]:ring-[#B7F500]/35"
                  onClick={() => router.push(catalogMarketOverviewReleaseAnalyticsPath(r.id))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(catalogMarketOverviewReleaseAnalyticsPath(r.id));
                    }
                  }}
                >
                  <td className="px-3 py-2 align-middle">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a] text-[10px] font-semibold uppercase text-zinc-500">
                        {r.symbol.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-1.5">
                          <span className="font-mono text-[12px] font-semibold tabular-nums text-white">{r.symbol}</span>
                          <span className="truncate text-[12px] text-zinc-500">{r.title}</span>
                        </div>
                        <div className="mt-1">
                          <span className="rounded-md bg-[#0a0a0a] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                            {r.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <div className="text-white">{r.artist}</div>
                    <div className="text-[11px] text-zinc-600">{r.segment}</div>
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <span className="font-mono font-semibold tabular-nums text-[#B7F500]">
                      {r.yieldPct.toFixed(1).replace(".", ",")}%
                    </span>
                  </td>
                  <td className="px-3 py-2 align-middle text-right font-mono tabular-nums text-white">
                    {formatUsdtCompact(r.payoutsUsdt)} USDT
                  </td>
                  <td className="px-3 py-2 align-middle text-right font-mono tabular-nums text-zinc-200">
                    {r.activityScore}
                  </td>
                  <td className="px-3 py-2 align-middle text-right font-mono tabular-nums text-zinc-300">
                    {formatUnitsCompact(r.availableUnits)}
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <span className="rounded-md bg-[#0a0a0a] px-2 py-0.5 text-[11px] text-zinc-300">
                      {r.secondaryLabel}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <span className="font-mono text-[11px] tabular-nums text-zinc-400">{r.liquidityLabel}</span>
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <div className="flex items-center gap-2">
                      <MarketMiniSparkline
                        values={r.sparkline}
                        trend={r.trend}
                        width={96}
                        height={32}
                      />
                      <span className={cn("font-mono text-[11px] tabular-nums", deltaClass)}>
                        {r.trend === "up" ? "▲" : r.trend === "down" ? "▼" : "■"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-middle text-right">
                    <span className="inline-flex flex-wrap items-center justify-end gap-x-2 gap-y-1 text-[12px] font-medium">
                      <Link
                        href={catalogBuyUnitsPath(r.id)}
                        className="text-[#B7F500] hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Купить
                      </Link>
                      <span className="text-zinc-700" aria-hidden>
                        |
                      </span>
                      <Link
                        href={ROUTES.dashboardCatalog}
                        className="text-white hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        В каталог
                      </Link>
                      <span className="text-zinc-700" aria-hidden>
                        |
                      </span>
                      <Link
                        href={catalogMarketOverviewReleaseAnalyticsPath(r.id)}
                        className="text-zinc-400 hover:text-white hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Аналитика
                      </Link>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-zinc-500">Нет релизов в текущей сегментации и фильтрах</div>
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-zinc-600">
        <span>
          Статусы в строках: <span className="text-zinc-500">mock</span>
        </span>
        <span className="hidden sm:inline">·</span>
        <span>Payouts за окно периода (демо)</span>
      </div>
    </div>
  );
}
