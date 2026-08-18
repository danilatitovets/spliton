"use client";

import { cn } from "@/lib/utils";

export type ProfileUnderlineTabItem<T extends string = string> = {
  id: T;
  label: string;
};

export function ProfileUnderlineTabs<T extends string>({
  value,
  onChange,
  items,
  ariaLabel,
}: {
  value: T;
  onChange: (id: T) => void;
  items: readonly ProfileUnderlineTabItem<T>[];
  ariaLabel?: string;
}) {
  return (
    <div
      className="-mx-1 flex gap-x-5 overflow-x-auto border-b border-white/[0.08] px-1 pb-px [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const selected = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.id)}
            className={cn(
              "relative shrink-0 snap-start pb-3 text-[14px] transition after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-transparent",
              selected
                ? "font-semibold text-white after:bg-white"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
