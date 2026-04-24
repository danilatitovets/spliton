"use client";

import { useMemo, type ReactNode } from "react";

import { FeesFaqList } from "@/components/fees/fees-faq-list";
import {
  feeSectionBlocks,
  FEES_RATES,
  feesFaqItems,
  mainFeeRows,
} from "@/constants/fees-mock-data";
import { cn } from "@/lib/utils";

const usdt = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Те же акценты, что на странице калькулятора. */
function FeeDisplay({
  value,
  suffix,
  tone,
  size = "lg",
}: {
  value: string;
  suffix?: string;
  tone: "primary" | "units" | "fee" | "neutral";
  size?: "lg" | "xl";
}) {
  const sizeCls = size === "xl" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl";
  const toneCls =
    tone === "primary"
      ? "bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent"
      : tone === "units"
        ? "bg-gradient-to-br from-emerald-800 via-teal-700 to-cyan-700 bg-clip-text text-transparent"
        : tone === "fee"
          ? "text-neutral-600"
          : "text-neutral-900";

  return (
    <span
      className={cn(
        "font-mono font-semibold tabular-nums tracking-tight [font-feature-settings:'tnum','lnum']",
        sizeCls,
        toneCls,
      )}
    >
      {value}
      {suffix ? <span className="text-[0.65em] font-medium text-neutral-500">{suffix}</span> : null}
    </span>
  );
}

function SummaryTile({
  title,
  children,
  hint,
}: {
  title: string;
  children: ReactNode;
  hint: string;
}) {
  return (
    <article className="rounded-3xl bg-neutral-50/90 px-5 py-5 sm:px-6 sm:py-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">{title}</p>
      <div className="mt-2">{children}</div>
      <p className="mt-2 text-xs text-neutral-500">{hint}</p>
    </article>
  );
}

function ExampleCard({
  title,
  subtitle,
  rows,
  highlight,
}: {
  title: string;
  subtitle: string;
  rows: { label: string; value: string; dim?: boolean }[];
  highlight: { label: string; amount: string; tone?: "primary" | "units" };
}) {
  const tone = highlight.tone ?? "primary";
  return (
    <div className="flex flex-col rounded-3xl bg-white px-5 py-6 sm:px-6 sm:py-7">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">{subtitle}</p>
      <h3 className="mt-1 text-base font-semibold tracking-tight text-neutral-900">{title}</h3>
      <div className="mt-5 rounded-2xl bg-neutral-50 px-4 py-3 sm:px-5">
        <div className="space-y-0">
          {rows.map((r, i) => (
            <div key={r.label}>
              {i > 0 ? <div className="border-t border-neutral-100/90" /> : null}
              <div className="flex items-center justify-between gap-3 py-3">
                <span className={cn("text-sm", r.dim ? "text-neutral-500" : "text-neutral-600")}>{r.label}</span>
                <span className="font-mono text-xs font-medium tabular-nums text-neutral-900 sm:text-sm">{r.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-neutral-50 px-4 py-4 sm:px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">{highlight.label}</p>
        <div className="mt-1">
          <FeeDisplay value={highlight.amount} suffix=" USDT" tone={tone} size="lg" />
        </div>
      </div>
    </div>
  );
}

export function FeesPageContent() {
  const examples = useMemo(() => {
    const buyAmount = 1000;
    const buyFee = buyAmount * FEES_RATES.platformBuy;
    const buyNet = buyAmount - buyFee;

    const sellUnits = 50;
    const sellPrice = 14;
    const sellGross = sellUnits * sellPrice;
    const sellFee = sellGross * FEES_RATES.secondary;
    const sellNet = sellGross - sellFee;

    const wd = 500;
    const wdFee = Math.max(FEES_RATES.withdrawMin, wd * FEES_RATES.withdrawRate);
    const wdNet = wd - wdFee;

    return {
      buy: { buyAmount, buyFee, buyNet },
      sell: { sellGross, sellFee, sellNet, sellUnits, sellPrice },
      withdraw: { wd, wdFee, wdNet },
    };
  }, []);

  const pct = (n: number) =>
    `${(n * 100).toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} %`;

  return (
    <div className="space-y-8 sm:space-y-10">
      <section aria-labelledby="fees-summary-heading">
        <h2 id="fees-summary-heading" className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">
          Краткий обзор
        </h2>
        <p className="mt-1 text-sm text-neutral-500">Основные типы удержаний в кабинете RevShare.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryTile title="Platform fee" hint="Покупка units / rights">
            <FeeDisplay value={pct(FEES_RATES.platformBuy)} tone="primary" />
          </SummaryTile>
          <SummaryTile title="Secondary fee" hint="Исполнение на secondary">
            <FeeDisplay value={pct(FEES_RATES.secondary)} tone="units" />
          </SummaryTile>
          <SummaryTile title="Withdrawal fee" hint="Вывод на TRC20">
            <p className="font-mono text-lg font-semibold tabular-nums text-neutral-900 sm:text-xl">
              max({FEES_RATES.withdrawMin} USDT; {pct(FEES_RATES.withdrawRate)})
            </p>
          </SummaryTile>
          <SummaryTile title="Deposit fee" hint="Пополнение баланса">
            <FeeDisplay value={pct(FEES_RATES.deposit)} tone="neutral" />
          </SummaryTile>
        </div>
      </section>

      <section className="rounded-3xl bg-white px-5 py-7 sm:px-8 sm:py-9" aria-labelledby="fees-table-heading">
        <h2 id="fees-table-heading" className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">
          Таблица комиссий
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Операция, тип комиссии, размер, расчёт и примечание. Значения иллюстративны до финализации API.
        </p>
        <div className="mt-6 overflow-x-auto rounded-2xl bg-neutral-50">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-neutral-100/90 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                <th className="px-4 py-3 font-medium">Операция</th>
                <th className="px-4 py-3 font-medium">Тип комиссии</th>
                <th className="px-4 py-3 font-medium">Размер</th>
                <th className="min-w-[200px] px-4 py-3 font-medium">Как считается</th>
                <th className="min-w-[180px] px-4 py-3 font-medium">Примечание</th>
              </tr>
            </thead>
            <tbody>
              {mainFeeRows.map((row) => (
                <tr key={row.operation} className="border-t border-neutral-100/90 transition-colors hover:bg-white/80">
                  <td className="px-4 py-3.5 font-medium text-neutral-900">{row.operation}</td>
                  <td className="px-4 py-3.5 text-neutral-700">{row.feeType}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-neutral-800">{row.rateLabel}</td>
                  <td className="px-4 py-3.5 text-xs leading-relaxed text-neutral-600">{row.calculation}</td>
                  <td className="px-4 py-3.5 text-xs leading-relaxed text-neutral-500">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="fees-examples-heading">
        <h2 id="fees-examples-heading" className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">
          Примеры расчёта
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Сумма, комиссия и итог — в одном стиле с калькулятором в продукте.
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <ExampleCard
            subtitle="Первичный рынок"
            title={`Покупка на ${usdt.format(examples.buy.buyAmount)} USDT`}
            rows={[
              { label: "Сумма платежа", value: `${usdt.format(examples.buy.buyAmount)} USDT` },
              {
                label: `Platform fee (${pct(FEES_RATES.platformBuy)})`,
                value: `− ${usdt.format(examples.buy.buyFee)} USDT`,
              },
              { label: "К зачёту в units (net)", value: `${usdt.format(examples.buy.buyNet)} USDT`, dim: true },
            ]}
            highlight={{
              label: "Итого удержано комиссией",
              amount: usdt.format(examples.buy.buyFee),
              tone: "primary",
            }}
          />
          <ExampleCard
            subtitle="Secondary market"
            title={`Продажа ${examples.sell.sellUnits} units × ${usdt.format(examples.sell.sellPrice)} USDT`}
            rows={[
              { label: "Сумма сделки (gross)", value: `${usdt.format(examples.sell.sellGross)} USDT` },
              {
                label: `Secondary fee (${pct(FEES_RATES.secondary)})`,
                value: `− ${usdt.format(examples.sell.sellFee)} USDT`,
              },
            ]}
            highlight={{
              label: "К получению (net)",
              amount: usdt.format(examples.sell.sellNet),
              tone: "units",
            }}
          />
          <ExampleCard
            subtitle="Вывод"
            title={`Заявка на ${usdt.format(examples.withdraw.wd)} USDT`}
            rows={[
              { label: "Запрошено к выводу", value: `${usdt.format(examples.withdraw.wd)} USDT` },
              {
                label: "Withdrawal fee",
                value: `− ${usdt.format(examples.withdraw.wdFee)} USDT`,
              },
            ]}
            highlight={{
              label: "К получению на адрес TRC20",
              amount: usdt.format(examples.withdraw.wdNet),
              tone: "primary",
            }}
          />
        </div>
      </section>

      <section aria-labelledby="fees-sections-heading">
        <h2 id="fees-sections-heading" className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">
          По разделам продукта
        </h2>
        <p className="mt-1 text-sm text-neutral-500">Кошелёк, рынки и выводы.</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {feeSectionBlocks.map((block) => (
            <div key={block.id} className="rounded-3xl bg-white px-5 py-6 sm:px-6 sm:py-7">
              <h3 className="text-sm font-semibold text-neutral-900">{block.title}</h3>
              <p className="mt-1 text-xs text-neutral-500">{block.subtitle}</p>
              <ul className="mt-4 space-y-2 text-xs leading-relaxed text-neutral-600 sm:text-sm">
                {block.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-blue-600/70" aria-hidden />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl bg-neutral-50 px-5 py-4 text-xs leading-relaxed text-neutral-600">
          <span className="font-medium text-neutral-800">Premium.</span> Отдельные платные опции (приоритетная линия,
          расширенные лимиты) при появлении продукта будут описаны здесь отдельным блоком.
        </div>
      </section>

      <section className="rounded-3xl bg-neutral-50 px-5 py-6 sm:px-7" aria-labelledby="fees-notes-heading">
        <h2 id="fees-notes-heading" className="text-sm font-semibold text-neutral-900">
          Уточнения
        </h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-xs leading-relaxed text-neutral-600 sm:text-sm">
          <li>Тарифы и лимиты могут обновляться — актуальные значения в превью операции перед подтверждением.</li>
          <li>Итоговая комиссия и сумма к оплате / к получению видны в интерфейсе до финального шага.</li>
          <li>Комиссии сети TRC20 — на стороне сети и кошелька, отдельно от строк платформы.</li>
          <li>Детали зависят от ордера, релиза и верификации — смотрите подсказки в форме.</li>
        </ul>
      </section>

      <section className="rounded-3xl bg-white px-5 py-7 sm:px-8 sm:py-8">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">Частые вопросы</h2>
        <p className="mt-1 text-sm text-neutral-500">Типичные ситуации в кабинете.</p>
        <FeesFaqList items={feesFaqItems} defaultOpenId={feesFaqItems[0]?.id ?? null} />
      </section>
    </div>
  );
}
