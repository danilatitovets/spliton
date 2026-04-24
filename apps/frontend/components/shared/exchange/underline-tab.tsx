"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export function UnderlineTab({
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
        "relative h-9 px-0.5 font-mono text-[12px] font-semibold tracking-wide transition-colors",
        active ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300",
      )}
    >
      {children}
      {active ? (
        <span
          className={cn(
            "absolute inset-x-0 bottom-0 h-0.5 rounded-full",
            tone === "neutral"
              ? "bg-zinc-200 shadow-[0_0_10px_rgba(255,255,255,0.12)]"
              : "bg-[#B7F500] shadow-[0_0_12px_rgba(183,245,0,0.4)]",
          )}
          aria-hidden
        />
      ) : null}
    </button>
  );
}
