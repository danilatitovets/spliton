"use client";

import { Search } from "@/lib/lucide";
import { useEffect, useId, useState } from "react";

import { cn } from "@/lib/utils";

type AssetsSearchFieldProps = {
  value: string;
  onSubmit: (value: string) => void;
  placeholder: string;
  "aria-label": string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  size?: "md" | "lg";
  /** Dark exchange surfaces (secondary market). */
  tone?: "onLight" | "onDark";
};

/**
 * Local draft input + search button on the right.
 * Parent query updates only on Enter / lupa click — typing never disables the field mid-keystroke.
 */
export function AssetsSearchField({
  value,
  onSubmit,
  placeholder,
  "aria-label": ariaLabel,
  disabled,
  className,
  inputClassName,
  size = "lg",
  tone = "onLight",
}: AssetsSearchFieldProps) {
  const inputId = useId();
  const [draft, setDraft] = useState(value);
  const onDark = tone === "onDark";

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = () => {
    if (disabled) return;
    onSubmit(draft);
  };

  const tall = size === "lg";

  return (
    <form
      className={cn("relative flex items-center", className)}
      onSubmit={(e) => {
        e.preventDefault();
        commit();
      }}
    >
      <input
        id={inputId}
        type="search"
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete="off"
        enterKeyHint="search"
        className={cn(
          "w-full outline-none transition disabled:cursor-not-allowed disabled:opacity-50",
          onDark
            ? "rounded-full bg-white/[0.06] text-sm text-white ring-1 ring-white/[0.08] placeholder:text-zinc-600 focus:bg-white/[0.09] focus:ring-white/20"
            : "rounded-2xl bg-white/80 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white",
          tall ? "h-12 py-2 pl-4 pr-14" : "h-10 py-2 pl-3.5 pr-12",
          inputClassName,
        )}
      />
      <button
        type="submit"
        disabled={disabled}
        aria-label={ariaLabel}
        className={cn(
          "absolute right-1.5 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full transition active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50",
          onDark
            ? "bg-white text-black hover:bg-[#e8e8e8]"
            : "bg-black text-white hover:bg-neutral-800",
          tall ? "size-9" : "size-8",
        )}
      >
        <Search className={tall ? "size-4" : "size-3.5"} strokeWidth={2} aria-hidden />
      </button>
    </form>
  );
}