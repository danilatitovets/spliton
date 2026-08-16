"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const PARTNER_PAGE_BG = "/images/partner-programtab=about/back.jpg";
const PARTNER_SURFACE_VIDEO = "/videos/position-holding-bg.mp4";

type PartnerSurfaceProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  accentTop?: boolean;
  /** Kept for callers; maps to video opacity. */
  imageOpacity?: string;
  overlayClassName?: string;
};

export function PartnerSurface({
  children,
  className,
  innerClassName,
  accentTop = false,
  imageOpacity = "opacity-55",
  overlayClassName = "bg-black/55",
}: PartnerSurfaceProps) {
  return (
    <div className={cn("relative isolate overflow-hidden rounded-3xl bg-black", className)}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <video
          className={cn(
            "absolute inset-0 h-full w-full scale-105 object-cover motion-reduce:hidden",
            imageOpacity,
          )}
          src={PARTNER_SURFACE_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        {/* Fallback still for reduced motion / no video */}
        <Image
          src={PARTNER_PAGE_BG}
          alt=""
          fill
          className={cn("object-cover object-center motion-reduce:opacity-50 hidden motion-reduce:block", imageOpacity)}
          sizes="(max-width: 1200px) 100vw, 1200px"
        />
        <div className={cn("absolute inset-0 motion-reduce:bg-black", overlayClassName)} />
        <div
          className="absolute inset-0 bg-[radial-gradient(110%_70%_at_14%_12%,rgba(255,255,255,0.12),transparent_58%)]"
          aria-hidden
        />
      </div>
      {accentTop ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-white/15" aria-hidden />
      ) : null}
      <div className={cn("relative z-10", innerClassName)}>{children}</div>
    </div>
  );
}
