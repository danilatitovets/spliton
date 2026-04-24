import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { MARKET_INSIGHT_ITEMS } from "@/constants/market-overview/page";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const INSIGHT_HREF: Record<string, string> = {
  "ins-flow": ROUTES.dashboardCatalog,
  "ins-premium": ROUTES.analyticsReleases,
  "ins-spread": ROUTES.dashboardSecondaryMarket,
  "ins-liquidity": ROUTES.analyticsReleases,
};

function metricTone(metric: string) {
  const t = metric.trim();
  if (t.startsWith("−") || t.startsWith("-")) return "text-fuchsia-400/95";
  if (t.startsWith("+")) return "text-[#B7F500]";
  return "text-white";
}

export function MarketOverviewInsights() {
  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 pb-10 md:px-6 lg:px-8">
      <header className="mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Рынок</span>
          <span className="rounded-lg bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
            mock
          </span>
        </div>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white md:text-2xl">Наблюдения по каталогу</h2>
        <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-zinc-500">
          Четыре коротких вывода про поток сделок и стакан (не про сравнение gross yield по релизам — это в{" "}
          <Link
            href={ROUTES.analyticsReleases}
            className="text-zinc-400 underline decoration-white/15 underline-offset-2 transition-colors hover:text-zinc-200"
          >
            «Аналитике релизов»
          </Link>
          ), без персональных рекомендаций к сделкам.
        </p>
        <p className="mt-2 max-w-[68ch] font-mono text-[11px] leading-relaxed text-zinc-600">
          Окно и доли — условные индексы; не путать с фактическим gross yield и выплатами по конкретному релизу.
        </p>
      </header>

      <ul className="grid gap-2 sm:grid-cols-2 sm:gap-3" role="list">
        {MARKET_INSIGHT_ITEMS.map((item) => (
          <li key={item.id} className="flex min-h-0 min-w-0">
            <div className="flex h-full w-full flex-col rounded-xl bg-white/4 px-4 pb-4 pt-3 transition-colors hover:bg-white/7">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 flex-1 font-mono text-[10px] font-semibold uppercase leading-snug tracking-[0.2em] text-zinc-500">
                  {item.tag}
                </p>
                <Link
                  href={INSIGHT_HREF[item.id] ?? ROUTES.analyticsReleases}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-semibold text-black transition-opacity hover:opacity-90"
                >
                  Подробнее
                  <ChevronRight className="size-3 shrink-0" strokeWidth={2} aria-hidden />
                </Link>
              </div>

              <div className="mt-3">
                <p className={cn("font-mono text-2xl font-semibold tabular-nums tracking-tight", metricTone(item.metric))}>
                  {item.metric}
                </p>
                <p className="mt-1 font-mono text-[10px] font-medium uppercase leading-snug tracking-wide text-zinc-500">
                  {item.metricCaption}
                </p>
              </div>

              <p className="mt-3 text-[13px] leading-relaxed text-zinc-200">{item.body}</p>
              <p className="mt-2 border-t border-white/5 pt-3 text-[12px] leading-relaxed text-zinc-500">{item.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
