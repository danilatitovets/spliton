import { ShieldAlert } from "lucide-react";

import { GUIDE_SELECTION_RISKS } from "@/constants/guide/selection";

import { GuideSectionShell } from "../ui/guide-section-shell";

export function GuideRisksSection() {
  return (
    <GuideSectionShell
      id="risks"
      title="Какие риски учитывать"
      subtitle="Один risk disclosure-панель в духе DeFi: плотные строки, mono-индексы и спокойный янтарный акцент — без рамок и «защитных» карточек."
    >
      <div className="mx-auto max-w-3xl overflow-hidden rounded-xl bg-[#0a0a0a]">
        <div className="flex items-center justify-between gap-3 bg-zinc-950/50 px-4 py-2.5 md:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <ShieldAlert className="size-3.5 shrink-0 text-amber-500/75" strokeWidth={1.5} aria-hidden />
            <span className="truncate font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              RevShare · risk_registry
            </span>
          </div>
          <span className="shrink-0 font-mono text-[10px] font-medium uppercase tracking-widest text-amber-600/85">
            read_only
          </span>
        </div>

        <ul className="space-y-1 px-3 py-3 md:px-4 md:py-4">
          {GUIDE_SELECTION_RISKS.map((risk, idx) => (
            <li
              key={risk}
              className="flex gap-4 rounded-lg bg-black/30 px-3 py-3.5 transition-colors hover:bg-white/4 md:px-4 md:py-4"
            >
              <span className="w-10 shrink-0 pt-0.5 text-right font-mono text-[11px] font-semibold tabular-nums text-amber-600/80">
                R{String(idx + 1).padStart(2, "0")}
              </span>
              <p className="min-w-0 text-[13px] leading-relaxed text-zinc-300 md:text-sm">{risk}</p>
            </li>
          ))}
        </ul>

        <div className="bg-black/25 px-4 py-2.5 md:px-5">
          <p className="font-mono text-[10px] leading-relaxed text-zinc-600">
            // not financial advice · вероятности и исходы зависят от рынка, ликвидности и структуры релиза
          </p>
        </div>
      </div>
    </GuideSectionShell>
  );
}
