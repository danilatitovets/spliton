import { GUIDE_SELECTION_FACTORS } from "@/constants/guide/selection";

import { GuideSectionShell } from "../ui/guide-section-shell";

export function GuideEvaluationFactorsSection() {
  return (
    <GuideSectionShell
      id="factors"
      title="Пять факторов выбора релиза"
      subtitle="Один список: фактор, короткая суть и метрики строкой — без карточек в карточках."
    >
      <div className="mx-auto max-w-3xl rounded-xl bg-[#111111] px-4 py-4 md:px-6 md:py-5">
        {GUIDE_SELECTION_FACTORS.map((factor, fi) => (
          <div key={factor.title} className={fi > 0 ? "mt-6" : ""}>
            <h3 className="text-base font-semibold tracking-tight text-white md:text-lg">{factor.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{factor.desc}</p>
            <p className="mt-2 text-[12px] leading-relaxed text-zinc-600">
              <span className="text-zinc-500">{factor.note}</span>
              <span className="mx-2 text-zinc-700" aria-hidden>
                ·
              </span>
              <span className="font-mono text-[11px] text-zinc-600">{factor.watch}</span>
            </p>
          </div>
        ))}
      </div>
    </GuideSectionShell>
  );
}
