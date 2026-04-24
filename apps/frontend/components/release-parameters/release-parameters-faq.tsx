"use client";

import { Minus, Plus } from "lucide-react";

import { RELEASE_PARAMETERS_FAQ } from "@/constants/release-parameters/page";

export function ReleaseParametersFaq() {
  return (
    <section id="rp-faq" data-release-parameters-section className="scroll-mt-28">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Вопросы</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">FAQ</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-500 md:text-base">
        Коротко о units, investor_share, лимитах размещения и статусе — в терминах карточки каталога (revenue share).
      </p>

      <div className="mt-8 space-y-2">
        {RELEASE_PARAMETERS_FAQ.map((item) => (
          <details
            key={item.q}
            className="group overflow-hidden rounded-xl bg-[#111111] [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-white/[0.04] md:px-5 md:py-5">
              <span className="text-left text-[15px] font-medium leading-snug text-white md:text-base">{item.q}</span>
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a] text-white transition-colors group-open:bg-sky-500/14 group-open:text-sky-200"
                aria-hidden
              >
                <Plus className="size-4 group-open:hidden" strokeWidth={1.75} />
                <Minus className="hidden size-4 group-open:block" strokeWidth={1.75} />
              </span>
            </summary>
            <div className="bg-[#0a0a0a] px-4 pb-4 pt-0 text-sm leading-relaxed text-zinc-500 md:px-5 md:pb-5 md:text-[15px]">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
