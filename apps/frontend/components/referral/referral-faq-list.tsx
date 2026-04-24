"use client";

import { ChevronDown } from "lucide-react";
import { useCallback, useId, useState } from "react";

import type { ReferralFaqItem } from "@/components/referral/referral-mock-data";
import { cn } from "@/lib/utils";

type ReferralFaqListProps = {
  items: ReferralFaqItem[];
  defaultOpenId?: string | null;
};

export function ReferralFaqList({ items, defaultOpenId = null }: ReferralFaqListProps) {
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(defaultOpenId);

  const toggle = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <ul className="mt-4 divide-y divide-white/[0.08] border-t border-white/[0.08]" role="list">
      {items.map((item) => {
        const open = openId === item.id;
        const panelId = `${baseId}-${item.id}-panel`;
        const btnId = `${baseId}-${item.id}-btn`;
        return (
          <li key={item.id} className="py-0">
            <button
              id={btnId}
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => toggle(item.id)}
              className="flex w-full items-start justify-between gap-3 py-4 text-left transition hover:bg-white/[0.03]"
            >
              <span className="text-sm font-semibold leading-snug text-neutral-100">{item.question}</span>
              <ChevronDown
                className={cn("mt-0.5 size-4 shrink-0 text-neutral-500 transition-transform", open && "rotate-180")}
                aria-hidden
              />
            </button>
            <div id={panelId} role="region" aria-labelledby={btnId} hidden={!open}>
              <p className="pb-4 pr-8 text-sm leading-relaxed text-neutral-400">{item.answer}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
