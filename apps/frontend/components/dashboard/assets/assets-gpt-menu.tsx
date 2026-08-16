"use client";

import { Check, ChevronDown } from "@/lib/lucide";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type AssetsGptMenuProps = {
  value: string;
  onChange: (id: string) => void;
  options: Array<{ id: string; label: string }>;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
};

/** GPT-style dark dropdown — reusable for filters (period, status, sort). */
export function AssetsGptMenu({
  value,
  onChange,
  options,
  ariaLabel,
  className,
  disabled,
}: AssetsGptMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const current = options.find((o) => o.id === value)?.label ?? value;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full bg-[#2a2a2c] px-3.5 text-[13px] font-medium text-white transition hover:bg-[#343438] disabled:cursor-not-allowed disabled:opacity-50",
          open && "bg-[#343438]",
        )}
      >
        {current}
        <ChevronDown className="size-3.5 opacity-70" strokeWidth={2.25} aria-hidden />
      </button>

      {open ? (
        <div
          id={menuId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute right-0 top-[calc(100%+0.4rem)] z-40 max-h-72 min-w-[10rem] overflow-y-auto rounded-2xl bg-[#2f2f2f] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.55)] ring-1 ring-white/10"
        >
          {options.map((option) => {
            const selected = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition",
                  selected ? "bg-white/[0.08] text-white" : "text-white/70 hover:bg-white/[0.06] hover:text-white",
                )}
              >
                {option.label}
                {selected ? <Check className="size-3.5 text-white" strokeWidth={2.4} aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
