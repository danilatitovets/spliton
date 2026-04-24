"use client";

import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import {
  GUIDE_FAQ_FILTERS,
  GUIDE_SELECTION_FAQ,
  type GuideFaqFilterId,
} from "@/constants/guide/selection";
import { cn } from "@/lib/utils";

export function GuideFaqSection() {
  const [filter, setFilter] = useState<GuideFaqFilterId>("all");

  const visible = useMemo(
    () => (filter === "all" ? GUIDE_SELECTION_FAQ : GUIDE_SELECTION_FAQ.filter((item) => item.category === filter)),
    [filter],
  );

  return (
    <section id="faq" data-guide-section className="scroll-mt-28">
      <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">FAQ</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500 md:text-base">
        Короткие ответы по выбору релиза и метрикам платформы. Фильтруйте по теме или откройте вопрос строкой ниже.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {GUIDE_FAQ_FILTERS.map((chip) => {
          const isActive = filter === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setFilter(chip.id)}
              className={cn(
                "rounded-lg px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wide transition-colors",
                isActive
                  ? "bg-[#B7F500]/14 text-[#d4f570]"
                  : "bg-[#161616] text-zinc-500 hover:bg-[#1a1a1a] hover:text-zinc-200",
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-2">
        {visible.length === 0 ? (
          <p className="rounded-xl bg-[#111111] py-10 text-center text-sm text-zinc-500">В этой категории пока нет вопросов.</p>
        ) : (
          visible.map((item) => (
            <details
              key={`${item.category}-${item.q}`}
              className="group overflow-hidden rounded-xl bg-[#111111] [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-white/[0.04] md:px-5 md:py-5">
                <span className="text-left text-[15px] font-medium leading-snug text-white md:text-base">{item.q}</span>
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a] text-white transition-colors group-open:bg-[#B7F500]/14 group-open:text-[#d4f570]"
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
          ))
        )}
      </div>
    </section>
  );
}
