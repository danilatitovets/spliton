"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export function PeriodButton({
  active,
  children,
  onClick,
  tone = "brand",
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  tone?: "brand" | "neutral";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide transition-colors",
        active
          ? tone === "neutral"
            ? "bg-white/8 text-zinc-100 ring-1 ring-white/12"
            : "bg-[#B7F500]/14 text-[#d4f570]"
          : "bg-[#111111] text-zinc-400 hover:bg-[#161616] hover:text-zinc-200",
      )}
    >
      {children}
    </button>
  );
}
