import { GuideSectionShell } from "../ui/guide-section-shell";

const STEPS = ["Raise target", "UNT distribution", "Investor share", "Platform fee", "Net payout"] as const;

const CONTEXT = [
  [
    "Прозрачность split",
    "Чем яснее распределение между участниками (holders UNT), артистом и платформой, тем проще моделировать payout.",
  ],
  [
    "Комиссии и удержания",
    "Platform fee и прочие удержания напрямую снижают investor-facing yield — учитывайте их до входа.",
  ],
  [
    "Фактическая динамика",
    "Структура задаёт рамки, но итоговый cashflow определяется реальным performance релиза.",
  ],
] as const;

export function GuideDealStructureSection() {
  const lastStep = STEPS.length - 1;

  return (
    <GuideSectionShell
      id="deal"
      title="Как устроена сделка"
      subtitle="Слева — порядок этапов сделки, справа — смысл для оценки входа. Без рамок: только фон и отступы, как в остальном гиде."
    >
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="rounded-xl bg-[#111111] p-4 md:p-5">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Этапы</div>
          <ol className="mt-4 space-y-0">
            {STEPS.map((label, i) => (
              <li key={label} className="flex gap-4">
                <div className="flex w-8 shrink-0 flex-col items-center">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 font-mono text-[11px] font-semibold tabular-nums text-zinc-200">
                    {i + 1}
                  </div>
                  {i < lastStep ? <div className="mt-2 w-px flex-1 min-h-6 bg-zinc-800" aria-hidden /> : null}
                </div>
                <div className={`min-w-0 flex-1 pt-0.5 ${i < lastStep ? "pb-4" : ""}`}>
                  <div className="text-sm font-semibold text-white">{label}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl bg-[#111111] px-4 py-4 md:px-5 md:py-5">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Контекст</div>
          <div className="mt-3 space-y-4">
            {CONTEXT.map(([title, body]) => (
              <div key={title}>
                <div className="text-sm font-semibold text-white">{title}</div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GuideSectionShell>
  );
}
