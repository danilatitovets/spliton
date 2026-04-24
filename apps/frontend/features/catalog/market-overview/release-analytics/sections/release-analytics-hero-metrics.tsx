import type { ReleaseMarketAnalyticsHero } from "@/types/catalog/release-market-analytics";

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-[#111111] px-3 py-3 transition-colors hover:bg-white/[0.03]">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">{label}</p>
      <p className="mt-2 font-mono text-[15px] font-semibold tabular-nums tracking-tight text-white">{value}</p>
      {sub ? <p className="mt-1 text-[11px] leading-snug text-zinc-500">{sub}</p> : null}
    </div>
  );
}

export function ReleaseAnalyticsHeroMetrics({ hero }: { hero: ReleaseMarketAnalyticsHero }) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">Key metrics</h2>
          <p className="mt-1 text-sm font-semibold text-white">Сводка по релизу</p>
        </div>
        <span className="rounded-md bg-[#0a0a0a] px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-zinc-600 ring-1 ring-white/8">
          mock
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 xl:grid-cols-7">
        <Stat label="Доходность" value={hero.yieldPct} />
        <Stat label="Total payouts" value={hero.totalPayouts} />
        <Stat label="Active holders" value={hero.activeHolders} />
        <Stat label="Available units" value={hero.availableUnits} />
        <Stat label="Ликвидность" value={hero.liquidityLabel} sub="стакан" />
        <Stat label="Secondary" value={hero.secondaryStatus} sub="активность" />
        <div className="col-span-2 rounded-xl bg-[#111111] px-3 py-3 transition-colors hover:bg-white/[0.03] lg:col-span-2 xl:col-span-1">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">Тренд / фаза</p>
          <p className="mt-2 text-[12px] font-medium text-zinc-200">
            7D: <span className="font-mono text-[#B7F500]/90">{hero.trend7d}</span>
          </p>
          <p className="mt-1 text-[12px] font-medium text-zinc-200">
            30D: <span className="font-mono text-zinc-400">{hero.trend30d}</span>
          </p>
          <p className="mt-3 text-[11px] leading-snug text-zinc-500">Фаза: {hero.phase}</p>
        </div>
      </div>
    </section>
  );
}
