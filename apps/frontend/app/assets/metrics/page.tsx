import type { Metadata } from "next";

import { MetricsAssetDynamicsChart, MetricsResultsChart } from "@/components/dashboard/assets/metrics-charts";
import { MetricsDailyBreakdownCard } from "@/components/dashboard/assets/metrics-daily-breakdown-card";
import { MetricsToolbar } from "@/components/dashboard/assets/metrics-toolbar";
import { OverviewSectionTabs } from "@/components/dashboard/assets/overview-section-tabs";
import { PayoutsSubpageHero } from "@/components/dashboard/assets/payouts-subpage-hero";

const topStats = [
  { label: "Изменение за сегодня", value: "$0", hint: "0,0%" },
  { label: "Изменение за месяц", value: "$0", hint: "0,0%" },
  { label: "Оценка holdings", value: "$0", hint: "текущий срез" },
];

const positionDistribution = [
  { label: "Electronic", value: "$0" },
  { label: "Pop", value: "$0" },
  { label: "Hip-Hop", value: "$0" },
];

function ProductPnlCard() {
  return (
    <section className="space-y-5 rounded-3xl bg-white px-5 py-6 sm:space-y-6 sm:px-7 sm:py-8" aria-label="PnL по продуктам">
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Metrics · Products</p>
        <h3 className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">PnL по продуктам</h3>
        <p className="text-sm text-neutral-500">PnL за последние 30 дн.</p>
      </div>
      <div className="divide-y divide-neutral-100 rounded-2xl bg-neutral-50/90 px-1 ring-1 ring-neutral-100">
        {positionDistribution.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm font-semibold text-neutral-800">
              {row.label === "Hip-Hop" ? "Фьючерсы" : row.label === "Pop" ? "Спот" : "≋"}
            </span>
            <span className="font-mono text-sm font-semibold tabular-nums text-neutral-900">{row.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function EmptyAnalyticsCard({
  title,
  withTabs = false,
}: {
  title: string;
  withTabs?: boolean;
}) {
  return (
    <section className="space-y-5 rounded-3xl bg-white px-5 py-6 sm:space-y-6 sm:px-7 sm:py-8" aria-label={title || "Аналитика"}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Metrics · Allocation</p>
          {title ? <h3 className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">{title}</h3> : null}
        </div>
        {withTabs ? (
          <div className="flex shrink-0 rounded-xl bg-neutral-100 p-1 text-[11px]">
            <span className="rounded-lg bg-white px-3 py-2 font-semibold text-neutral-900 ring-1 ring-neutral-200/80">Десятка лидеров роста</span>
            <span className="rounded-lg px-3 py-2 font-medium text-neutral-500">Десятка лидеров падения</span>
          </div>
        ) : null}
      </div>
      <div className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl bg-neutral-50/90 py-10 text-center ring-1 ring-neutral-100">
        <div className="mb-3 flex size-12 items-center justify-center rounded-full border border-neutral-200 bg-white text-lg font-semibold text-neutral-400">!</div>
        <p className="text-base font-medium text-neutral-800">Нет подходящей информации</p>
        <p className="mt-1 max-w-sm text-sm text-neutral-500">Когда появятся данные, здесь отобразятся графики и таблицы.</p>
      </div>
    </section>
  );
}

export const metadata: Metadata = {
  title: "Метрики",
  description: "Метрики структуры holdings и units по релизам.",
};

export default function AssetsMetricsPage() {
  return (
    <div className="space-y-10 pb-8 sm:space-y-12">
      <OverviewSectionTabs />

      <div className="space-y-8 sm:space-y-10">
        <PayoutsSubpageHero eyebrow="USDT · Holdings · Metrics" title="Метрики" />

        <MetricsToolbar />

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {topStats.map((item) => (
            <article
              key={item.label}
              className="rounded-3xl bg-neutral-50/90 px-5 py-5 ring-1 ring-neutral-100 sm:px-6 sm:py-6"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">{item.label}</p>
              <p className="mt-2 font-mono text-[2rem] font-semibold tabular-nums tracking-tight text-neutral-900 sm:text-[2.25rem]">{item.value}</p>
              <p className="mt-1 text-sm text-neutral-500">{item.hint}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <MetricsResultsChart />
          <MetricsAssetDynamicsChart />
        </section>

        <section className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <MetricsDailyBreakdownCard />
          <ProductPnlCard />
        </section>

        <section className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <EmptyAnalyticsCard title="Распределение активов" />
          <EmptyAnalyticsCard title="" withTabs />
        </section>
      </div>
    </div>
  );
}
