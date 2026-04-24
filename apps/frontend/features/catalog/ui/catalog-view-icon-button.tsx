"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function CatalogViewIconButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors",
        "hover:bg-white/5 hover:text-zinc-200",
        active && "bg-sky-500/12 text-sky-100 ring-1 ring-inset ring-sky-400/22",
      )}
    >
      <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
    </button>
  );
}
