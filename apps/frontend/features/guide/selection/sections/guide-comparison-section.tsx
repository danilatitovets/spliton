import { GuideSectionShell } from "../ui/guide-section-shell";

const COMPARISON_ROWS = [
  ["Expected yield", "12.4%", "9.1%", "15.8%"],
  ["Payout frequency", "ежемесячно", "ежемесячно", "квартально + bonus"],
  ["Investor share", "62%", "58%", "66%"],
  ["Demand / activity", "средний+", "стабильный", "высокий"],
  ["Liquidity potential", "средний", "низкий", "средний+"],
] as const;

export function GuideComparisonSection() {
  return (
    <GuideSectionShell
      id="compare"
      title="Как сравнивать релизы между собой"
      subtitle="Одинаковый каркас метрик для любого актива каталога — компактная таблица в стиле market screen."
    >
      <div className="overflow-hidden rounded-xl bg-[#111111]">
        <div className="bg-[#0a0a0a] px-4 py-3 md:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-[#161616] px-2.5 py-1 text-[11px] font-medium text-zinc-400">
              Market compare
            </span>
            <span className="rounded-lg bg-[#B7F500]/14 px-2.5 py-1 text-[11px] font-medium text-[#d4f570]">
              Единый шаблон оценки
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead>
              <tr className="bg-[#0a0a0a] text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                <th className="w-[28%] px-4 py-3 md:px-5">Метрика</th>
                <th className="w-[24%] px-4 py-3 md:px-5">Midnight Run</th>
                <th className="w-[24%] px-4 py-3 md:px-5">Glassline</th>
                <th className="w-[24%] px-4 py-3 md:px-5">Signal / Noise</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map(([metric, a, b, c], idx) => (
                <tr key={metric} className="text-zinc-300 transition-colors hover:bg-white/[0.04]">
                  <td className="px-4 py-3 text-zinc-500 md:px-5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#0a0a0a] text-[10px] text-zinc-500">
                        {idx + 1}
                      </span>
                      <span>{metric}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-200 md:px-5">{a}</td>
                  <td className="px-4 py-3 font-medium text-zinc-200 md:px-5">{b}</td>
                  <td className="px-4 py-3 font-medium text-[#B7F500] md:px-5">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </GuideSectionShell>
  );
}
