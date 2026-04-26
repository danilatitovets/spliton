import Link from "next/link";

import { catalogBuyUnitsPath } from "@/constants/routes";
import type { ReleaseMarketAnalyticsChartBlock } from "@/types/catalog/release-market-analytics";

import { ReleaseAnalyticsProChart } from "../ui/release-analytics-pro-chart";

export function ReleaseAnalyticsChartsSection({
  charts,
  releaseId,
}: {
  charts: ReleaseMarketAnalyticsChartBlock[];
  releaseId: string;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">Графики</h2>
          <p className="mt-1 text-sm font-semibold text-white">Динамика и объёмы</p>
        </div>
        <Link
          href={catalogBuyUnitsPath(releaseId)}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-[#B7F500] px-4 text-[12px] font-semibold text-black transition hover:bg-[#c9ff52] sm:h-10 sm:px-5 sm:text-[13px]"
        >
          Купить UNT
        </Link>
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {charts.map((c) => (
          <div
            key={c.id}
            className="flex min-h-[248px] flex-col rounded-xl bg-[#111111] px-3 pb-2 pt-3 transition-colors hover:bg-white/[0.03]"
          >
            <div className="min-w-0">
              <h3 className="text-[13px] font-semibold text-white">{c.title}</h3>
              <p className="mt-1 text-[11px] leading-snug text-zinc-600">{c.caption}</p>
            </div>
            <div className="mt-3 min-h-0 flex-1">
              <ReleaseAnalyticsProChart values={c.series} accent={c.accent} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}