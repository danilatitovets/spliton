import Link from "next/link";

import { MARKET_SECONDARY_SNAPSHOT } from "@/constants/market-overview/page";
import { ROUTES } from "@/constants/routes";

export function MarketOverviewSecondary() {
  const s = MARKET_SECONDARY_SNAPSHOT;
  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8">
      <Link
        href={ROUTES.dashboardSecondaryMarket}
        className="block rounded-xl bg-[#111111] px-4 py-4 transition-colors hover:bg-white/[0.04]"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Secondary market</h2>
            <p className="mt-1 text-sm font-semibold text-white">Снимок ликвидности перепродаж</p>
          </div>
          <span className="rounded-lg bg-[#0a0a0a] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
            USDT
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-600">Оборот перепродаж</p>
            <p className="mt-1 font-mono text-base font-semibold tabular-nums text-white">{s.resaleVolume}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-600">Активные лоты</p>
            <p className="mt-1 font-mono text-base font-semibold tabular-nums text-white">{s.activeLots}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-600">Медиана выхода</p>
            <p className="mt-1 font-mono text-base font-semibold tabular-nums text-zinc-200">{s.medianExitHours}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-600">Highest demand</p>
            <p className="mt-1 text-[13px] font-medium leading-snug text-zinc-300">{s.topDemand}</p>
          </div>
        </div>
      </Link>
    </section>
  );
}
