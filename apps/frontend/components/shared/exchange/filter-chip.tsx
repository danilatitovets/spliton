"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export function FilterChip({
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
        "h-7 rounded-lg px-2.5 font-mono text-[11px] font-medium transition-colors",
        active
          ? tone === "neutral"
            ? "bg-white/8 text-zinc-100 ring-1 ring-white/12"
            : "bg-[#B7F500]/14 text-[#d4f570]"
          : "text-zinc-500 hover:bg-white/6 hover:text-zinc-300",
      )}
    >
      {children}
    </button>
  );
}
