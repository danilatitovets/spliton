"use client";



import Link from "next/link";

import { ArrowDown, ArrowUp } from "lucide-react";



import { SecondaryMarketBreadcrumbNav } from "@/components/dashboard/secondary-market/secondary-market-breadcrumb-nav";
import {

  secondaryMarketBookHref,

  secondaryMarketBookIdForSymbol,

  secondaryMarketHref,

} from "@/constants/dashboard/secondary-market";

import { analyticsReleaseDetailPath, secondaryMarketReleaseAnalyticsPath } from "@/constants/routes";

import { DetailSection, DETAIL_SECTION_TITLE_COMPACT } from "@/features/analytics/releases/detail/detail-section";

import { ReleaseDetailStatsRow } from "@/features/analytics/releases/detail/release-detail-stats-row";

import {

  getSecondaryMarketListingTradesMock,

  type SecondaryMarketListingMock,

  type SecondaryMarketListingTradeMock,

} from "@/mocks/dashboard/secondary-market-listings.mock";

import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";

import { cn } from "@/lib/utils";



function formatUsdt(n: number) {

  return n.toLocaleString("ru-RU", {

    minimumFractionDigits: n % 1 ? 2 : 0,

    maximumFractionDigits: 2,

  });

}



/** Лента сверху вниз: новее → старее. Сравнение с предыдущей сделкой той же стороны. */

function tapeSameSideTrend(trades: SecondaryMarketListingTradeMock[], index: number): "up" | "down" | null {

  const t = trades[index];

  if (!t) return null;

  for (let j = index + 1; j < trades.length; j++) {

    const prev = trades[j];

    if (prev.side !== t.side) continue;

    if (t.price > prev.price) return "up";

    if (t.price < prev.price) return "down";

    return null;

  }

  return null;

}



const liquidityRu: Record<SecondaryMarketListingMock["liquidity"], string> = {

  high: "Высокая",

  med: "Средняя",

  low: "Низкая",

};



const LISTING_RELEASE_SUMMARY_STATS = 8;



export function SecondaryMarketListingInfoScreen({

  listing,

  releaseDetail,

}: {

  listing: SecondaryMarketListingMock;

  releaseDetail: ReleaseDetailPageData;

}) {

  const bookId = secondaryMarketBookIdForSymbol(listing.symbol);

  const pos = listing.change7dPct >= 0;

  const trades = getSecondaryMarketListingTradesMock(listing);

  const { row: catalogRow } = releaseDetail;

  const releaseAnalyticsHref = `${analyticsReleaseDetailPath(listing.analyticsCatalogId)}?from=secondary`;

  const releaseSummaryStats = releaseDetail.quickStats.slice(0, LISTING_RELEASE_SUMMARY_STATS);



  return (

    <div className="bg-black text-white">

      <div className="mx-auto w-full max-w-[1320px] px-4 pb-20 pt-6 md:px-6 lg:px-8 lg:pb-28 lg:pt-8">

        <SecondaryMarketBreadcrumbNav
          className="mt-1"
          items={[
            { label: "Вторичный рынок", href: secondaryMarketHref("market") },
            { label: "Рынок листингов", href: secondaryMarketHref("market") },
            { label: listing.track },
          ]}
        />



        <p className="mt-5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-600">

          Вторичный рынок · лот

        </p>

        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">{listing.track}</h1>

        <p className="mt-2 font-mono text-xs text-zinc-500">

          {listing.symbol} · предложение на вторичке, доступное к покупке

        </p>



        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_min(340px,100%)] lg:items-start">

          <div className="flex min-w-0 flex-col gap-8">

            <section aria-label="Параметры лота">

              <h2 className={DETAIL_SECTION_TITLE_COMPACT}>Параметры лота</h2>

              <p className="mt-2 max-w-[72ch] text-sm leading-relaxed text-zinc-500">

                Ниже — параметры доступного лота на вторичном рынке: цена за unit, объём к покупке и ориентир по

                ликвидности. Для выплат, доходности и performance самого релиза используйте{" "}

                <Link href={releaseAnalyticsHref} className="text-zinc-400 underline-offset-2 hover:text-white hover:underline">

                  аналитику связанного релиза

                </Link>

                .

              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">

                <div className="rounded-2xl bg-[#111111] p-4 ring-1 ring-white/10">

                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Цена за unit</p>

                  <p className="mt-1 font-mono text-xl font-semibold text-white">{formatUsdt(listing.pricePerUnit)} USDT</p>

                </div>

                <div className="rounded-2xl bg-[#111111] p-4 ring-1 ring-white/10">

                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Доступно к покупке</p>

                  <p className="mt-1 font-mono text-xl font-semibold text-white">

                    {listing.unitsAvailable}

                    <span className="ml-1.5 text-base font-medium text-zinc-500">units</span>

                  </p>

                </div>

                <div className="rounded-2xl bg-[#111111] p-4 ring-1 ring-white/10">

                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Номинал лота</p>

                  <p className="mt-1 font-mono text-xl font-semibold text-white">{formatUsdt(listing.listingValueUsdt)} USDT</p>

                </div>

                <div className="rounded-2xl bg-[#111111] p-4 ring-1 ring-white/10">

                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">7д %</p>

                  <p

                    className={cn(

                      "mt-1 font-mono text-xl font-semibold tabular-nums",

                      pos ? "text-[#B7F500]" : "text-fuchsia-300",

                    )}

                  >

                    {pos ? "+" : ""}

                    {listing.change7dPct.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%

                  </p>

                </div>

                <div className="rounded-2xl bg-[#111111] p-4 ring-1 ring-white/10">

                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Сделок / 7д</p>

                  <p className="mt-1 font-mono text-xl font-semibold text-white">{listing.deals7d}</p>

                </div>

                <div className="rounded-2xl bg-[#111111] p-4 ring-1 ring-white/10">

                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Ликвидность (макет)</p>

                  <p className="mt-1 text-sm font-semibold text-white">{liquidityRu[listing.liquidity]}</p>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">

                    <div

                      className={cn(

                        "h-full rounded-full",

                        listing.liquidity === "high" ? "w-[88%] bg-[#B7F500]/85" : "",

                        listing.liquidity === "med" ? "w-[55%] bg-[#B7F500]/55" : "",

                        listing.liquidity === "low" ? "w-[28%] bg-zinc-500" : "",

                      )}

                    />

                  </div>

                </div>

              </div>

            </section>



            <DetailSection

              className="!mt-0 border-t border-white/8 pt-8"

              eyebrow="Secondary"

              title="Последние сделки на вторичке"

              titleClassName={DETAIL_SECTION_TITLE_COMPACT}

              description="Последние рыночные сделки по релизу: сторона, цена за unit, объём и сумма в USDT (макет)."

            >

              <div className="overflow-x-auto rounded-xl bg-[#111111] ring-1 ring-white/6">

                <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">

                  <thead>

                    <tr className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">

                      <th className="px-4 py-3 font-medium">Время</th>

                      <th className="px-4 py-3 font-medium">Сторона</th>

                      <th className="px-4 py-3 text-right font-medium">Цена</th>

                      <th className="px-4 py-3 text-right font-medium">Units</th>

                      <th className="px-4 py-3 text-right font-medium">USDT</th>

                    </tr>

                  </thead>

                  <tbody className="font-mono text-zinc-300">

                    {trades.map((t, i) => {

                      const trend = tapeSameSideTrend(trades, i);

                      const trendTitle =

                        trend === "up"

                          ? t.side === "buy"

                            ? "Выше предыдущей покупки"

                            : "Выше предыдущей продажи"

                          : trend === "down"

                            ? t.side === "buy"

                              ? "Ниже предыдущей покупки"

                              : "Ниже предыдущей продажи"

                            : undefined;

                      return (

                        <tr key={`${t.time}-${i}`} className="border-t border-white/5 transition-colors hover:bg-white/3">

                          <td className="px-4 py-2.5 text-zinc-400">{t.time}</td>

                          <td className="px-4 py-2.5">

                            <span

                              className={cn(

                                "rounded-full px-2 py-0.5 text-[11px] font-semibold",

                                t.side === "buy" ? "bg-[#B7F500]/14 text-[#d4f570]" : "bg-fuchsia-500/12 text-fuchsia-200",

                              )}

                            >

                              {t.side === "buy" ? "Покупка" : "Продажа"}

                            </span>

                          </td>

                          <td className="px-4 py-2.5 text-right tabular-nums text-white">

                            <span className="inline-flex w-full items-center justify-end gap-1">

                              {trend === "up" ? (

                                <span className="inline-flex shrink-0" title={trendTitle}>

                                  <ArrowUp

                                    className={cn(

                                      "size-3.5",

                                      t.side === "buy" ? "text-[#B7F500]" : "text-fuchsia-300",

                                    )}

                                    strokeWidth={2.5}

                                    aria-hidden

                                  />

                                </span>

                              ) : null}

                              {trend === "down" ? (

                                <span className="inline-flex shrink-0" title={trendTitle}>

                                  <ArrowDown

                                    className={cn(

                                      "size-3.5",

                                      t.side === "buy" ? "text-fuchsia-300/90" : "text-zinc-500",

                                    )}

                                    strokeWidth={2.5}

                                    aria-hidden

                                  />

                                </span>

                              ) : null}

                              <span>{formatUsdt(t.price)}</span>

                            </span>

                          </td>

                          <td className="px-4 py-2.5 text-right tabular-nums">{t.units}</td>

                          <td className="px-4 py-2.5 text-right tabular-nums text-zinc-200">{formatUsdt(t.notionalUsdt)}</td>

                        </tr>

                      );

                    })}

                  </tbody>

                </table>

              </div>

            </DetailSection>



            <section className="border-t border-white/8 pt-8" aria-label="Сводка по связанному релизу">

              <h2 className={DETAIL_SECTION_TITLE_COMPACT}>Сводка по связанному релизу</h2>

              <p className="mt-2 max-w-[72ch] text-sm text-zinc-500">

                Краткий ориентир по активу (не по этому лоту). Полные выплаты, периоды и графики — в аналитике релиза.

              </p>

              <div className="mt-6">

                <ReleaseDetailStatsRow data={releaseDetail} stats={releaseSummaryStats} />

              </div>

            </section>



            <section className="border-t border-white/8 pt-8" aria-label="Рынок по релизу">

              <h2 className={DETAIL_SECTION_TITLE_COMPACT}>Рынок по релизу</h2>

              <p className="mt-2 max-w-[72ch] text-sm text-zinc-500">

                Рыночный контекст secondary по этому релизу; не параметры выбранного лота.

              </p>

              <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">

                {releaseDetail.secondary.rows.map((r) => (

                  <div

                    key={r.label}

                    className="flex items-center justify-between gap-3 rounded-xl bg-[#111111] px-4 py-3 ring-1 ring-white/6 transition-colors hover:bg-white/4"

                  >

                    <span className="text-[12px] text-zinc-500">{r.label}</span>

                    <span className="font-mono text-sm font-semibold tabular-nums text-white">{r.value}</span>

                  </div>

                ))}

              </div>

            </section>



            <section className="border-t border-white/8 pt-8" aria-label="Переход к аналитике релиза">

              <Link

                href={releaseAnalyticsHref}

                title="Выплаты, доходность и performance актива"

                className="inline-flex h-11 w-full max-w-md items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black transition hover:opacity-90 sm:w-auto"

              >

                Открыть аналитику релиза

              </Link>

              <p className="mt-3 max-w-[60ch] text-[12px] leading-relaxed text-zinc-600">

                Стакан и торговая аналитика — про сделки на вторичке; эта кнопка ведёт к карточке релиза как актива.

              </p>

            </section>

          </div>



          <aside className="lg:sticky lg:top-6">

            <div className="rounded-2xl bg-[#111111] p-5 ring-1 ring-white/10">

              <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Связанный релиз</p>

              <p className="mt-2 font-mono text-lg font-semibold text-white">{catalogRow.symbol}</p>

              <p className="mt-1 text-sm font-medium text-zinc-300">{catalogRow.release}</p>

              <p className="mt-1 font-mono text-xs text-zinc-600">{catalogRow.artist}</p>

              <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-6">

                {bookId ? (

                  <Link

                    href={secondaryMarketBookHref(bookId)}

                    title="Торговый экран: заявки на покупку и продажу units"

                    className="flex h-11 items-center justify-center rounded-full bg-white text-sm font-semibold text-black transition-opacity hover:opacity-90"

                  >

                    Открыть стакан

                  </Link>

                ) : (

                  <Link

                    href={secondaryMarketHref("market")}

                    title="Перейти к списку предложений на вторичке"

                    className="flex h-11 items-center justify-center rounded-full bg-white text-sm font-semibold text-black transition-opacity hover:opacity-90"

                  >

                    На вторичный рынок

                  </Link>

                )}

                <Link

                  href={secondaryMarketReleaseAnalyticsPath(listing.releaseId)}

                  scroll={false}

                  title="Ликвидность, объёмы и сделки secondary market по релизу"

                  className="flex h-11 items-center justify-center rounded-full border border-white/15 text-sm font-medium text-zinc-200 transition hover:border-white/25 hover:text-white"

                >

                  Торговая аналитика

                </Link>

                <Link

                  href={releaseAnalyticsHref}

                  title="Performance, выплаты и revenue share самого актива"

                  className="flex h-11 items-center justify-center rounded-full border border-white/15 text-sm font-medium text-zinc-200 transition hover:border-white/25 hover:text-white"

                >

                  Аналитика релиза

                </Link>

                <Link

                  href={secondaryMarketHref("market")}

                  className="flex h-11 items-center justify-center rounded-full border border-white/10 text-sm font-medium text-zinc-500 transition hover:border-white/20 hover:text-zinc-300"

                >

                  Обзор рынка

                </Link>

              </div>

            </div>

          </aside>

        </div>

      </div>

    </div>

  );

}

  