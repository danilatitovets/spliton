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
    <section id="faq" data-guide-section className="scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-tight text-white md:text-2xl">FAQ</h2>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-zinc-500 md:text-sm">
        Короткие ответы по выбору релиза и метрикам платформы. Фильтруйте по теме или откройте вопрос строкой ниже.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
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

      <div className="mt-4 space-y-2">
        {visible.length === 0 ? (
          <p className="rounded-xl bg-[#111111] py-6 text-center text-sm text-zinc-500">В этой категории пока нет вопросов.</p>
        ) : (
          visible.map((item) => (
            <details
              key={`${item.category}-${item.q}`}
              className="group overflow-hidden rounded-xl bg-[#111111] [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 transition-colors hover:bg-white/4 md:px-4 md:py-3.5">
                <span className="text-left text-[15px] font-medium leading-snug text-white md:text-base">{item.q}</span>
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a] text-white transition-colors group-open:bg-[#B7F500]/14 group-open:text-[#d4f570]"
                  aria-hidden
                >
                  <Plus className="size-4 group-open:hidden" strokeWidth={1.75} />
                  <Minus className="hidden size-4 group-open:block" strokeWidth={1.75} />
                </span>
              </summary>
              <div className="bg-[#0a0a0a] px-3 pb-3 pt-0 text-sm leading-relaxed text-zinc-500 md:px-4 md:pb-4 md:text-[15px]">
                {item.a}
              </div>
            </details>
          ))
        )}
      </div>
    </section>
  );
}
