"use client";

import { cn } from "@/lib/utils";

export type MetricsGptToggleOption<T extends string> = {
  id: T;
  label: string;
};

type MetricsGptToggleProps<T extends string> = {
  value: T;
  onChange: (id: T) => void;
  options: Array<MetricsGptToggleOption<T>>;
  ariaLabel: string;
  className?: string;
  size?: "sm" | "md";
};

/** GPT-style segmented toggle — dark track, selected pill; scrolls on narrow screens. */
export function MetricsGptToggle<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
  size = "md",
}: MetricsGptToggleProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex max-w-full items-center overflow-x-auto rounded-full bg-[#212121] p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.id)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full font-medium transition",
              size === "sm" ? "px-2.5 py-1.5 text-[11px]" : "px-3.5 py-2 text-[12px]",
              selected
                ? "bg-[#2f2f2f] text-white shadow-[0_1px_2px_rgba(0,0,0,0.35)] ring-1 ring-white/10"
                : "text-white/45 hover:text-white/80",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
