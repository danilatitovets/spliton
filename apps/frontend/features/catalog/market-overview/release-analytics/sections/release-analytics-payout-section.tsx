import type { ReleaseMarketAnalyticsPayoutInsights } from "@/types/catalog/release-market-analytics";

const ITEMS: {
  key: keyof ReleaseMarketAnalyticsPayoutInsights;
  title: string;
  hint: string;
}[] = [
  {
    key: "lastPayout",
    title: "Последняя выплата",
    hint: "Сумма и дата последнего начисления",
  },
  {
    key: "avgPayoutPeriod",
    title: "Средняя за период",
    hint: "Типичный размер выплаты в текущем окне",
  },
  {
    key: "accrualFrequency",
    title: "Как часто начисляем",
    hint: "График по договору",
  },
  {
    key: "cumulativePayouts",
    title: "Совокупно выплачено",
    hint: "За всё время по данным релиза",
  },
  {
    key: "payoutStatus",
    title: "Статус выплат",
    hint: "Сводка по начислениям",
  },
];

export function ReleaseAnalyticsPayoutSection({ payout }: { payout: ReleaseMarketAnalyticsPayoutInsights }) {
  return (
    <section className="space-y-4">
      <div>
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">Выплаты</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">Сводка по начислениям</h2>
        <p className="mt-1.5 max-w-[62ch] text-[12px] leading-relaxed text-zinc-600">
          Ключевые цифры по выплатам инвесторам — для быстрой оценки динамики.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {ITEMS.map(({ key, title, hint }) => (
          <div
            key={key}
            className="flex min-h-[108px] flex-col rounded-xl bg-[#111111] px-3 py-3 transition-colors hover:bg-white/[0.03] sm:min-h-0"
          >
            <p className="text-[12px] font-semibold leading-snug text-zinc-200">{title}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-zinc-600">{hint}</p>
            <p className="mt-auto pt-3 font-mono text-[13px] font-semibold leading-snug text-white">{payout[key]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
