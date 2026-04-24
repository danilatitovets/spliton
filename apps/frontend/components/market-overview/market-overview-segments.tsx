import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { MARKET_SEGMENT_SNAPSHOT } from "@/constants/market-overview/page";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

function liquidityTextClass(liquidity: string) {
  const l = liquidity.trim();
  if (l === "Deep") return "font-mono text-[11px] font-semibold tabular-nums text-[#B7F500]";
  if (l === "Mid") return "font-mono text-[11px] font-semibold tabular-nums text-zinc-300";
  return "font-mono text-[11px] font-semibold tabular-nums text-fuchsia-400/90";
}

function stabilityTone(stability: string) {
  const t = stability.trim();
  if (t === "Высокая") return "text-emerald-300/95";
  if (t === "Средняя") return "text-zinc-200";
  if (t === "Переменная") return "text-amber-200/90";
  return "text-zinc-300";
}

function demandTone(demand: string) {
  const d = demand.trim();
  if (d === "Пик" || d === "Рост") return "text-[#c4f570]";
  if (d === "Ниша") return "text-rose-300/90";
  return "text-zinc-200";
}

export function MarketOverviewSegments() {
  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8">
      <div className="mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Сегменты</span>
          <span className="rounded-lg bg-[#0a0a0a] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
            mock · relative
          </span>
        </div>
        <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <h2 className="min-w-0 text-xl font-semibold tracking-tight text-white md:text-2xl">Снимок по жанрам</h2>
          <Link
            href={ROUTES.analyticsReleases}
            className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-[12px] font-medium text-black transition-opacity hover:opacity-90"
          >
            Открыть аналитику
            <ArrowUpRight className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
          </Link>
        </div>
        <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-zinc-500">
          Сравнение жанров по <span className="text-zinc-400">ликвидности</span>, <span className="text-zinc-400">спросу</span>{" "}
          и <span className="text-zinc-400">активности</span> (условные индексы, mock). Доходность и выплаты по релизам — в{" "}
          <Link
            href={ROUTES.analyticsReleases}
            className="font-medium text-[#c4f570] underline decoration-[#B7F500]/35 underline-offset-2 transition-colors hover:text-[#d4ff66] hover:decoration-[#B7F500]/55"
          >
            «Аналитике релизов»
          </Link>
          .
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl bg-[#111111]">
        <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-[13px]">
          <thead>
            <tr className="text-zinc-500">
              <th className="px-3 py-2.5 font-normal sm:px-4">
                <span className="text-[11px] uppercase tracking-wide">Жанр</span>
              </th>
              <th className="px-3 py-2.5 text-right font-normal sm:px-4" title="Доля релизов с ликвидностью Deep+">
                <span className="text-[11px] uppercase tracking-wide">Deep+</span>
              </th>
              <th className="px-3 py-2.5 font-normal sm:px-4" title="Стабильность выплат">
                <span className="text-[11px] uppercase tracking-wide">Стабильность</span>
              </th>
              <th className="px-3 py-2.5 text-right font-normal sm:px-4">
                <span className="text-[11px] uppercase tracking-wide">Активн.</span>
              </th>
              <th className="px-3 py-2.5 font-normal sm:px-4">
                <span className="text-[11px] uppercase tracking-wide">Спрос</span>
              </th>
              <th className="px-3 py-2.5 text-right font-normal sm:px-4">
                <span className="text-[11px] uppercase tracking-wide">Ликвидность</span>
              </th>
              <th className="px-3 py-2.5 text-right font-normal sm:px-4">
                <span className="text-[11px] uppercase tracking-wide">Действие</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {MARKET_SEGMENT_SNAPSHOT.map((s) => {
              const analyticsHref = `${ROUTES.analyticsReleases}?segment=${encodeURIComponent(s.id)}`;
              return (
                <tr
                  key={s.id}
                  className="text-zinc-300 transition-colors hover:bg-white/4"
                >
                  <td className="px-3 py-2 align-middle sm:px-4">
                    <div className="min-w-0">
                      <Link
                        href={analyticsHref}
                        className="text-[13px] font-semibold text-white transition-colors hover:text-[#c4f570]"
                      >
                        {s.label}
                      </Link>
                      <div className="mt-1 font-mono text-[10px] font-medium uppercase tracking-wide text-zinc-600">
                        {s.id.toUpperCase()}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-middle text-right sm:px-4">
                    <span className="font-mono text-[12px] font-semibold tabular-nums text-[#B7F500]">
                      {s.deepPlusShare}
                    </span>
                  </td>
                  <td className={cn("px-3 py-2 align-middle text-[12px] sm:px-4", stabilityTone(s.stability))}>
                    {s.stability}
                  </td>
                  <td className="px-3 py-2 align-middle text-right font-mono text-[12px] font-semibold tabular-nums text-zinc-200 sm:px-4">
                    {s.activity}
                  </td>
                  <td className={cn("px-3 py-2 align-middle text-[12px] font-medium sm:px-4", demandTone(s.demand))}>
                    {s.demand}
                  </td>
                  <td className="px-3 py-2 align-middle text-right sm:px-4">
                    <span className={liquidityTextClass(s.liquidity)}>{s.liquidity}</span>
                  </td>
                  <td className="px-3 py-2 align-middle text-right sm:px-4">
                    <Link
                      href={analyticsHref}
                      className="text-[12px] font-medium text-zinc-400 transition-colors hover:text-white hover:underline"
                    >
                      Аналитика
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
