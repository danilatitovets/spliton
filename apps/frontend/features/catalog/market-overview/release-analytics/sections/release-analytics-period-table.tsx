import type { ReleaseMarketAnalyticsPeriodRow } from "@/types/catalog/release-market-analytics";

export function ReleaseAnalyticsPeriodTable({ rows }: { rows: ReleaseMarketAnalyticsPeriodRow[] }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">Breakdown</h2>
        <p className="mt-1 text-sm font-semibold text-white">По периодам</p>
      </div>
      <div className="overflow-x-auto rounded-xl bg-[#111111]">
        <table className="w-full min-w-[880px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="text-zinc-500">
              <th className="px-3 py-2.5 font-normal">
                <span className="text-[11px] uppercase tracking-wide">Период</span>
              </th>
              <th className="px-3 py-2.5 font-normal">
                <span className="text-[11px] uppercase tracking-wide">Выплаты</span>
              </th>
              <th className="px-3 py-2.5 font-normal">
                <span className="text-[11px] uppercase tracking-wide">Доходность</span>
              </th>
              <th className="px-3 py-2.5 font-normal">
                <span className="text-[11px] uppercase tracking-wide">Объём торгов</span>
              </th>
              <th className="px-3 py-2.5 font-normal">
                <span className="text-[11px] uppercase tracking-wide">Сделки</span>
              </th>
              <th className="px-3 py-2.5 text-right font-normal">
                <span className="text-[11px] uppercase tracking-wide">Interest / trend</span>
              </th>
            </tr>
          </thead>
          <tbody className="text-zinc-300">
            {rows.map((r) => (
              <tr key={r.period} className="border-t border-white/[0.04] first:border-t-0 hover:bg-white/[0.02]">
                <td className="px-3 py-2.5 font-mono text-[12px] font-semibold text-white">{r.period}</td>
                <td className="px-3 py-2.5 font-mono tabular-nums text-zinc-200">{r.payouts}</td>
                <td className="px-3 py-2.5 font-mono tabular-nums text-[#B7F500]/90">{r.yield}</td>
                <td className="px-3 py-2.5 font-mono tabular-nums text-zinc-200">{r.tradeVolume}</td>
                <td className="px-3 py-2.5 font-mono tabular-nums text-zinc-400">{r.tradesCount}</td>
                <td className="px-3 py-2.5 text-right font-mono text-[12px] tabular-nums text-zinc-200">{r.interestChange}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
