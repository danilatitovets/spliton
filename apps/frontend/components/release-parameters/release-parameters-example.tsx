import { RELEASE_PARAMETERS_EXAMPLE } from "@/constants/release-parameters/page";

import { ReleaseSectionShell } from "./ui/release-section-shell";

const METRIC_GROUPS: { label: string; rows: { k: string; v: string }[] }[] = [
  {
    label: "Статус и доходность",
    rows: [
      { k: "Статус", v: RELEASE_PARAMETERS_EXAMPLE.status },
      { k: "Expected yield", v: `${RELEASE_PARAMETERS_EXAMPLE.expectedYield} · ориентир` },
    ],
  },
  {
    label: "UNT и сбор",
    rows: [
      { k: "Total UNT", v: RELEASE_PARAMETERS_EXAMPLE.totalUnits },
      { k: "Sold UNT", v: RELEASE_PARAMETERS_EXAMPLE.soldUnits },
      { k: "Available UNT", v: RELEASE_PARAMETERS_EXAMPLE.availableUnits },
      { k: "Raise target", v: RELEASE_PARAMETERS_EXAMPLE.raiseTarget },
      { k: "Hard cap", v: RELEASE_PARAMETERS_EXAMPLE.hardCap },
    ],
  },
  {
    label: "Сделка и рынок",
    rows: [
      { k: "Investor share", v: RELEASE_PARAMETERS_EXAMPLE.investorShare },
      { k: "Payout", v: RELEASE_PARAMETERS_EXAMPLE.payout },
      { k: "Secondary", v: RELEASE_PARAMETERS_EXAMPLE.secondary },
    ],
  },
];

export function ReleaseParametersExample() {
  const ex = RELEASE_PARAMETERS_EXAMPLE;

  return (
    <ReleaseSectionShell
      id="rp-example"
      kicker="Разбор"
      title="Пример разбора релиза"
      subtitle="Условный, но согласованный срез карточки: как будто вы только что открыли релиз в каталоге и проговариваете цифры вслух перед входом."
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
        <div className="overflow-hidden rounded-2xl bg-[#111111]">
          <div className="bg-[#0a0a0a] px-5 py-5 md:px-6 md:py-6">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Карточка · как в каталоге
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-white md:text-xl">{ex.headline}</p>
            <p className="mt-1.5 text-sm text-zinc-500">{ex.deck}</p>
          </div>

          <div className="px-2 pb-2 pt-1 md:px-3">
            {METRIC_GROUPS.map((group) => (
              <div key={group.label} className="mt-3 first:mt-2">
                <p className="px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600 md:px-4">
                  {group.label}
                </p>
                <div className="rounded-xl bg-[#0a0a0a]/50">
                  {group.rows.map((row) => (
                    <div
                      key={row.k}
                      className="grid grid-cols-[minmax(0,42%)_minmax(0,1fr)] gap-x-4 gap-y-1 px-4 py-3.5 transition-colors hover:bg-white/4 md:px-5"
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{row.k}</div>
                      <div className="text-right text-sm font-medium tabular-nums text-zinc-100 md:text-left">
                        {row.v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-6 rounded-2xl bg-[#111111] p-5 md:p-6">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Как читать</p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300 md:text-base">{ex.readAs}</p>
          </div>

          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Разбор по полям
            </p>
            <ul className="mt-3 space-y-3.5">
              {ex.analystPoints.map((point, i) => (
                <li
                  key={i}
                  className="relative pl-4 text-sm leading-relaxed text-zinc-400 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-sky-500/80 before:content-['']"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-auto font-mono text-[11px] leading-relaxed text-zinc-600">{ex.closing}</p>
        </aside>
      </div>
    </ReleaseSectionShell>
  );
}
