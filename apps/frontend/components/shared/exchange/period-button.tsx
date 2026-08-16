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
        "rounded-full px-2.5 py-1 text-[12px] font-semibold transition-colors",
        active
          ? tone === "neutral"
            ? "bg-white/10 text-zinc-100"
            : "bg-[#B7F500]/14 text-[#d4f570]"
          : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200",
      )}
    >
      {children}
    </button>
  );
}
