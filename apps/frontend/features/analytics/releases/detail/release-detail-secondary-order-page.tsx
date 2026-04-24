"use client";

import * as React from "react";
import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import { CheckCircle2, X } from "lucide-react";

import { secondaryMarketHref } from "@/constants/dashboard/secondary-market";
import {
  analyticsReleaseDetailPath,
  assetsSellUnitsPath,
  catalogBuyUnitsPath,
  secondaryMarketReleaseAnalyticsPath,
} from "@/constants/routes";
import {
  getSecondaryMarketListingByAnalyticsCatalogId,
  getSecondaryMarketStackHrefForAnalyticsCatalogId,
} from "@/mocks/dashboard/secondary-market-listings.mock";
import { MARKET_OVERVIEW_ROWS } from "@/mocks/market-overview-rows";
import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";
import { cn } from "@/lib/utils";

import { DetailSection } from "./detail-section";
import { ReleaseDetailPerformanceChart } from "./release-detail-performance-chart";
import { ReleaseDetailHero } from "./release-detail-hero";

function fmt(n: number, digits = 2) {
  return n.toLocaleString("ru-RU", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function KVPairs({
  rows,
}: {
  rows: Array<{ label: string; value: React.ReactNode }>;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {rows.map((r) => (
        <div key={r.label} className="rounded-xl bg-[#0a0a0a] px-3 py-2.5 ring-1 ring-white/6">
          <p className="text-[11px] leading-snug text-zinc-500">{r.label}</p>
          <p className="mt-1 font-mono text-[13px] font-semibold leading-snug text-zinc-100">{r.value}</p>
        </div>
      ))}
    </div>
  );
}

function payoutFrequencyRu(freq: "monthly" | "biweekly"): string {
  return freq === "monthly" ? "Ежемесячно" : "Раз в две недели";
}

function statusRu(status: string): string {
  if (status === "Active") return "Раунд активен";
  if (status === "Paused") return "Пауза выплат";
  if (status === "Closed") return "Раунд закрыт";
  return status;
}

/** Человекочитаемая подпись для строк из `terms.rows` мока карточки релиза. */
function termLabelRu(rawKey: string): string {
  const k = rawKey.toLowerCase();
  if (k.includes("investor")) return "Доля инвесторов (pool)";
  if (k.includes("artist_share")) return "Доля артиста";
  if (k.includes("distribution")) return "База распределения";
  if (k.includes("platform_fee")) return "Комиссия платформы";
  if (k.includes("raise_target")) return "Цель сбора";
  if (k.includes("hard_cap")) return "Верхний предел (cap)";
  if (k.includes("total_units")) return "Всего units";
  if (k.includes("текущий статус")) return "Статус раунда";
  return rawKey.replace(/\s*\(.*?\)\s*/g, "").trim();
}

const LEDGER_EVENTS: { title: string; date: string; detail: string; tone: "buy" | "order" | "fill" | "cancel" | "payout" }[] = [
  { title: "Покупка units", date: "12.03.2026", detail: "320 units", tone: "buy" },
  { title: "Выставление заявки", date: "21.04.2026", detail: "80 units · лимит", tone: "order" },
  { title: "Частичное исполнение", date: "21.04.2026", detail: "32 units", tone: "fill" },
  { title: "Отмена заявки", date: "—", detail: "Нет записей", tone: "cancel" },
  { title: "Получение выплат", date: "14.04.2026", detail: "+24,80 USDT", tone: "payout" },
];

function ledgerToneDot(tone: (typeof LEDGER_EVENTS)[number]["tone"]) {
  const map = {
    buy: "bg-[#B7F500]/90",
    order: "bg-sky-400/90",
    fill: "bg-amber-400/90",
    cancel: "bg-zinc-500",
    payout: "bg-emerald-400/90",
  } as const;
  return map[tone];
}

export function ReleaseDetailSecondaryOrderPage({
  data,
  contextFrom,
}: {
  data: ReleaseDetailPageData;
  /** Значение query `from` (например `secondary`) — сохраняется при возврате на общую карточку релиза. */
  contextFrom?: string;
}) {
  const { row, performance } = data;
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const stackHref = getSecondaryMarketStackHrefForAnalyticsCatalogId(row.id) ?? secondaryMarketHref("market");
  const assetQuery = new URLSearchParams();
  if (contextFrom) assetQuery.set("from", contextFrom);
  const assetHref =
    assetQuery.size > 0
      ? `${analyticsReleaseDetailPath(row.id)}?${assetQuery.toString()}`
      : analyticsReleaseDetailPath(row.id);
  const marketRow = MARKET_OVERVIEW_ROWS.find((r) => r.id === row.id);
  const smListing = getSecondaryMarketListingByAnalyticsCatalogId(row.id);
  const tradingAnalyticsHref = smListing
    ? secondaryMarketReleaseAnalyticsPath(smListing.releaseId)
    : secondaryMarketHref("analytics");
  const mockPosition = {
    totalUnits: 1842,
    availableUnits: 1794,
    lockedUnits: 48,
    avgEntry: 18.12,
    markPrice: 18.48,
    payoutsReceived: 126.4,
  };
  const mockOrder = {
    side: "Покупка",
    mode: "Лимит",
    price: 18.48,
    totalUnits: 80,
    filled: 32,
    remain: 48,
    amount: 1478.4,
    createdAt: "21.04.2026 23:45",
    status: "Частично",
  };

  const marketNow = {
    bestBid: 18.41,
    bestAsk: 18.55,
    lastPrice: 18.48,
    spread: 0.14,
    volume24h: 184200,
    deals: 126,
    liquidity: "Средняя",
    activeOrders: 48,
  };

  return (
    <div className="bg-black text-white">
      <div className="mx-auto w-full max-w-[1320px] px-4 pb-16 pt-6 md:px-6 lg:px-8 lg:pb-24 lg:pt-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(360px,100%)] lg:items-start">
          <div className="min-w-0">
            <ReleaseDetailHero
              data={data}
              source={contextFrom === "secondary" ? "secondary" : undefined}
              backHrefOverride={assetHref}
              backLabelOverride="Карточка релиза"
            />
          </div>
          <aside className="rounded-2xl bg-[#111111] px-4 py-4 ring-1 ring-white/8 md:px-5 md:py-5">
            <h3 className="text-[14px] font-semibold tracking-tight text-white">Моя позиция</h3>
            <div className="mt-3">
              <KVPairs
                rows={[
                  { label: "Всего units", value: mockPosition.totalUnits },
                  { label: "Доступно units", value: mockPosition.availableUnits },
                  { label: "Заблокировано в заявках", value: mockPosition.lockedUnits },
                  { label: "Средняя цена входа", value: `${fmt(mockPosition.avgEntry)} USDT` },
                  { label: "Текущая ориентирная цена", value: `${fmt(mockPosition.markPrice)} USDT` },
                  { label: "Получено выплат", value: `${fmt(mockPosition.payoutsReceived)} USDT` },
                ]}
              />
            </div>
          </aside>
        </div>

        <DetailSection
          className="mt-10"
          eyebrow="Chart"
          title={performance.title}
          description={`${performance.subtitle} Масштаб колесом с Ctrl, панорама перетаскиванием, сброс окна.`}
        >
          <ReleaseDetailPerformanceChart
            title={performance.title}
            subtitle={performance.subtitle}
            seriesByPeriod={performance.seriesByPeriod}
            miniStats={performance.miniStats}
            releaseId={row.id}
            buyHref={stackHref}
            buyLabel="К стакану"
          />
        </DetailSection>

        <DetailSection
          eyebrow="Order"
          title="Моя заявка"
          description="Детали ордера из secondary market и текущий прогресс исполнения по вашему релизу."
        >
          <KVPairs
            rows={[
              { label: "Тип заявки", value: mockOrder.side },
              { label: "Тип исполнения", value: mockOrder.mode },
              { label: "Цена за unit", value: `${fmt(mockOrder.price)} USDT` },
              { label: "Всего units", value: mockOrder.totalUnits },
              { label: "Исполнено", value: mockOrder.filled },
              { label: "Остаток", value: mockOrder.remain },
              { label: "Сумма", value: `${fmt(mockOrder.amount)} USDT` },
              { label: "Дата создания", value: mockOrder.createdAt },
              { label: "Статус заявки", value: mockOrder.status },
            ]}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCancelOpen(true)}
              className="inline-flex h-10 items-center rounded-xl border border-fuchsia-400/35 bg-fuchsia-500/12 px-4 text-[13px] font-semibold text-fuchsia-200 transition hover:bg-fuchsia-500/20"
            >
              Отменить заявку
            </button>
            <Link
              href={stackHref}
              className="inline-flex h-10 items-center rounded-xl bg-white px-4 text-[13px] font-semibold text-black transition hover:opacity-90"
            >
              Перейти в стакан
            </Link>
            <Link
              href={catalogBuyUnitsPath(row.id)}
              className="inline-flex h-10 items-center rounded-xl border border-white/15 px-4 text-[13px] font-semibold text-zinc-200 transition hover:border-white/25 hover:text-white"
            >
              Купить ещё
            </Link>
            <Link
              href={assetsSellUnitsPath(row.id)}
              className="inline-flex h-10 items-center rounded-xl border border-white/15 px-4 text-[13px] font-semibold text-zinc-200 transition hover:border-white/25 hover:text-white"
            >
              Новая заявка на продажу
            </Link>
            <Link
              href={tradingAnalyticsHref}
              scroll={false}
              className="inline-flex h-10 items-center rounded-xl border border-white/15 px-4 text-[13px] font-semibold text-zinc-200 transition hover:border-white/25 hover:text-white"
            >
              Торговая аналитика
            </Link>
          </div>
        </DetailSection>

        <DetailSection
          eyebrow="Market"
          title="Рынок сейчас"
          description="Актуальные параметры secondary market по этому релизу: цены, спред, ликвидность и активность."
        >
          <KVPairs
            rows={[
              { label: "Best bid", value: `${fmt(marketNow.bestBid)} USDT` },
              { label: "Best ask", value: `${fmt(marketNow.bestAsk)} USDT` },
              { label: "Last price", value: `${fmt(marketNow.lastPrice)} USDT` },
              { label: "Spread", value: `${fmt(marketNow.spread)} USDT` },
              { label: "Объём 24ч", value: `${Math.round(marketNow.volume24h).toLocaleString("ru-RU")} USDT` },
              { label: "Количество сделок", value: marketNow.deals },
              { label: "Ликвидность", value: marketNow.liquidity },
              { label: "Активные заявки", value: marketNow.activeOrders },
            ]}
          />
        </DetailSection>

        <DetailSection
          eyebrow="Order Book"
          title="Мини-стакан и последние сделки"
          description="Компактный торговый вид по релизу: лучшие уровни и последние исполнения в стиле secondary terminal."
        >
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="rounded-2xl bg-[#111111] p-3 ring-1 ring-white/8">
              <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Лучшие покупки (bid)</p>
              <div className="mt-2 space-y-1.5 font-mono text-[12px]">
                <div className="flex items-center justify-between text-[#B7F500]">
                  <span>18,41</span>
                  <span className="text-zinc-300">120u</span>
                </div>
                <div className="flex items-center justify-between text-[#B7F500]">
                  <span>18,38</span>
                  <span className="text-zinc-300">95u</span>
                </div>
                <div className="flex items-center justify-between text-[#B7F500]">
                  <span>18,34</span>
                  <span className="text-zinc-300">82u</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-[#111111] p-3 ring-1 ring-white/8">
              <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Лучшие продажи (ask)</p>
              <div className="mt-2 space-y-1.5 font-mono text-[12px]">
                <div className="flex items-center justify-between text-fuchsia-300">
                  <span>18,55</span>
                  <span className="text-zinc-300">76u</span>
                </div>
                <div className="flex items-center justify-between text-fuchsia-300">
                  <span>18,58</span>
                  <span className="text-zinc-300">62u</span>
                </div>
                <div className="flex items-center justify-between text-fuchsia-300">
                  <span>18,63</span>
                  <span className="text-zinc-300">48u</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-[#111111] p-3 ring-1 ring-white/8">
              <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Последние сделки</p>
              <div className="mt-2 space-y-1.5 font-mono text-[12px] text-zinc-200">
                <div className="flex items-center justify-between">
                  <span>18,48</span>
                  <span className="text-zinc-400">24u</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>18,50</span>
                  <span className="text-zinc-400">12u</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>18,46</span>
                  <span className="text-zinc-400">8u</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <Link
              href={stackHref}
              className="inline-flex h-9 items-center rounded-lg border border-white/15 px-3 text-[12px] font-semibold text-zinc-200 transition hover:border-white/25 hover:text-white"
            >
              Открыть полный стакан для торговли
            </Link>
          </div>
        </DetailSection>

        <DetailSection
          eyebrow="Secondary"
          title="Контекст рынка (mock)"
          description="Краткие ориентиры по активности secondary — не дублируют график выплат выше."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Активность 7d / 30d", value: "126 / 412 сделок" },
              { label: "Тренд", value: "Умеренно восходящий" },
              { label: "Спрос / предложение", value: "Спрос +12% к прошлой неделе" },
            ].map((c) => (
              <div key={c.label} className="rounded-xl bg-[#0a0a0a] px-3 py-3 ring-1 ring-white/6 sm:min-h-[88px]">
                <p className="text-[11px] leading-snug text-zinc-500">{c.label}</p>
                <p className="mt-2 font-mono text-[13px] font-semibold leading-snug text-zinc-100">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl bg-[#111111] px-4 py-4 ring-1 ring-white/8 md:px-5 md:py-5">
              <h3 className="text-[15px] font-semibold tracking-tight text-white">Выплаты и доходность</h3>
              <p className="mt-1 text-[11px] text-zinc-600">По данным карточки релиза и обзора рынка (макет).</p>
              <div className="mt-3">
                <KVPairs
                  rows={[
                    {
                      label: "Выплаты (окно, агрегат)",
                      value: row.payouts,
                    },
                    { label: "Последний payout", value: "14.04.2026 · 24,80 USDT" },
                    { label: "Начислено всего (макет)", value: "126,40 USDT" },
                    { label: "Текущая доходность", value: row.yieldPct },
                    {
                      label: "Частота выплат",
                      value: marketRow ? payoutFrequencyRu(marketRow.payoutFreq) : "Ежемесячно",
                    },
                  ]}
                />
              </div>
            </section>
            <section className="rounded-2xl bg-[#111111] px-4 py-4 ring-1 ring-white/8 md:px-5 md:py-5">
              <h3 className="text-[15px] font-semibold tracking-tight text-white">Параметры релиза</h3>
              <p className="mt-1 text-[11px] text-zinc-600">Доли и лимиты из условий сделки (mock).</p>
              <div className="mt-3">
                <KVPairs
                  rows={[
                    ...data.terms.rows.slice(0, 6).map((t) => ({
                      label: termLabelRu(t.key),
                      value: t.val,
                    })),
                    {
                      label: "Всего units (эмиссия)",
                      value: data.terms.rows.find((t) => t.key.toLowerCase().includes("total_units"))?.val ?? "—",
                    },
                    {
                      label: "Доступно units (каталог)",
                      value: marketRow
                        ? `${Math.round(marketRow.availableUnits).toLocaleString("ru-RU")} u.`
                        : row.units,
                    },
                    { label: "Статус раунда", value: statusRu(row.status) },
                  ]}
                />
              </div>
            </section>
          </div>
        </DetailSection>

        <DetailSection
          eyebrow="My Ledger"
          title="Моя история по релизу"
          description="Лента персональных действий по unit-позиции: вход, заявка, исполнение, выплаты."
        >
          <ul className="overflow-hidden rounded-2xl border border-white/8 bg-[#111111] ring-1 ring-white/6">
            {LEDGER_EVENTS.map((ev) => (
              <li
                key={ev.title}
                className="flex gap-4 border-b border-white/6 px-4 py-3.5 last:border-b-0 sm:px-5 sm:py-4"
              >
                <span
                  className={cn("mt-1.5 size-2 shrink-0 rounded-full", ledgerToneDot(ev.tone))}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold tracking-tight text-white">{ev.title}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-zinc-500">{ev.date}</p>
                  <p className="mt-1 font-mono text-[12px] text-zinc-300">{ev.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </DetailSection>
      </div>

      <Dialog.Root open={cancelOpen} onOpenChange={setCancelOpen} modal>
        <Dialog.Portal>
          <Dialog.Backdrop
            className={cn(
              "fixed inset-0 z-120 bg-black/70 backdrop-blur-[2px]",
              "transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
            )}
          />
          <Dialog.Popup
            className={cn(
              "fixed left-1/2 top-1/2 z-121 w-[min(100vw-1.5rem,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-zinc-950 p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)]",
              "transition-[opacity,transform] duration-200 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0",
            )}
          >
            <Dialog.Close
              aria-label="Закрыть"
              className="absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/10 hover:text-zinc-200"
            >
              <X className="size-4" />
            </Dialog.Close>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
              <div>
                <Dialog.Title className="text-base font-semibold tracking-tight text-white">Отменить заявку?</Dialog.Title>
                <Dialog.Description className="mt-1 text-[13px] text-zinc-400">
                  Неисполненный остаток вернётся в доступные units по релизу.
                </Dialog.Description>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Dialog.Close className="inline-flex h-9 items-center rounded-lg bg-white/6 px-3.5 text-[12px] font-medium text-zinc-200 transition hover:bg-white/10">
                Оставить
              </Dialog.Close>
              <Dialog.Close className="inline-flex h-9 items-center rounded-lg bg-fuchsia-500/18 px-3.5 text-[12px] font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/26">
                Отменить заявку
              </Dialog.Close>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
