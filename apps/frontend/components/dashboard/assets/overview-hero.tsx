import Link from "next/link";

import { OverviewEtfFlowsChart } from "@/components/dashboard/assets/overview-etf-flows-chart";
import { ROUTES, assetsSellUnitsPath } from "@/constants/routes";

export function OverviewHero() {
  return (
    <section
      className="grid gap-6 rounded-3xl bg-white px-5 py-6 sm:gap-8 sm:px-7 sm:py-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:items-start"
      aria-label="Сводка стоимости и состояния позиций"
    >
      <div className="flex min-w-0 flex-col gap-6">
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Portfolio · TVL</p>
          <p className="text-sm text-neutral-500">Общая стоимость позиций</p>
          <div className="flex flex-wrap items-end gap-2">
            <p className="font-mono text-4xl font-semibold tabular-nums tracking-tight text-neutral-900 sm:text-5xl">
              6 520
            </p>
            <span className="pb-1.5 text-sm font-medium text-neutral-400">USDT</span>
          </div>
          <p className="text-xs font-medium tabular-nums text-blue-700">Обновлено сегодня · +2,4% за 30 дней</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={ROUTES.dashboardCatalog}
            className="inline-flex h-10 items-center rounded-full bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
          >
            Открыть каталог
          </Link>
          <Link
            href={ROUTES.dashboardPositions}
            className="inline-flex h-10 items-center rounded-full border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
          >
            Мои позиции
          </Link>
          <Link
            href={assetsSellUnitsPath("1")}
            className="inline-flex h-10 items-center rounded-full border border-neutral-200/90 bg-neutral-50/80 px-4 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-100"
          >
            Продать units
          </Link>
          <Link
            href={ROUTES.dashboardSecondaryMarket}
            className="inline-flex h-10 items-center rounded-full border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
          >
            Secondary
          </Link>
        </div>

        <OverviewEtfFlowsChart />
      </div>

      <aside
        className="flex min-w-0 flex-col gap-5 rounded-2xl bg-neutral-50/90 p-5 ring-1 ring-neutral-100 sm:p-6 lg:self-start lg:sticky lg:top-[calc(52px+2.25rem+6px)] lg:z-40"
        aria-label="Состояние позиций"
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">Status</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">Состояние позиций</h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            Активные релизы; основная доля holdings в трёх крупных позициях.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-neutral-100">
          <div className="flex h-2 w-full">
            <span className="h-full w-[58%] bg-neutral-900" />
            <span className="h-full w-[24%] bg-blue-600" />
            <span className="h-full w-[18%] bg-neutral-300" />
          </div>
          <div className="grid grid-cols-3 gap-2 p-3 sm:p-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Top-1</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-neutral-900">58%</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Top-2</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-neutral-900">24%</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Top-3</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-neutral-900">18%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { k: "Релизы", v: "6" },
            { k: "Позиций", v: "9" },
            { k: "Units", v: "14 280" },
          ].map((cell) => (
            <div key={cell.k} className="rounded-xl bg-white/90 px-2.5 py-2.5 ring-1 ring-neutral-100 sm:px-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">{cell.k}</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-neutral-900 sm:text-base">{cell.v}</p>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}
