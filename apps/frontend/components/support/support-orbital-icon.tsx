"use client";

import { FolderOpen } from "@/lib/lucide";
import { cn } from "@/lib/utils";

type SupportOrbitalIconProps = {
  src?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "size-9",
  md: "size-10",
  lg: "size-12",
} as const;

/** Metallic orbital PNG (megamenu style) with Lucide fallback. */
export function SupportOrbitalIcon({ src, className, size = "md" }: SupportOrbitalIconProps) {
  if (src) {
    return (
      <span className={cn("relative shrink-0 overflow-visible bg-transparent", sizeClass[size], className)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- public orbital assets */}
        <img
          src={src}
          alt=""
          className="size-full object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-xl bg-white/[0.06] text-zinc-400",
        sizeClass[size],
        className,
      )}
    >
      <FolderOpen className="size-4" aria-hidden />
    </span>
  );
}
