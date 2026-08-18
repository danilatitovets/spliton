"use client";

import Link from "next/link";
import {
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

import { ArrowRight } from "@/lib/lucide";
import { cn } from "@/lib/utils";

/** Surface the pill sits on — inverts fill/arrow for contrast. */
export type SplitonCtaTone = "onDark" | "onLight";

type SplitonCtaPillProps = {
  children: ReactNode;
  tone?: SplitonCtaTone;
  /** `accent` = OKX lime pill + black arrow circle. */
  variant?: "primary" | "ghost" | "accent";
  /** Arrow circle — default on for primary/accent. */
  withArrow?: boolean;
  className?: string;
  href?: string;
} & Omit<ComponentPropsWithoutRef<"button">, "children" | "className">;

const primaryShell: Record<SplitonCtaTone, string> = {
  onDark:
    "bg-white text-black hover:bg-[#0a0a0a] focus-visible:bg-[#0a0a0a]",
  onLight:
    "bg-[#0a0a0a] text-white hover:bg-white focus-visible:bg-white",
};

const accentShell =
  "bg-[#B7F500] text-black hover:bg-[#0a0a0a] focus-visible:bg-[#0a0a0a]";

const arrowFill: Record<SplitonCtaTone, string> = {
  onDark: "bg-black text-white",
  onLight: "bg-white text-black",
};

const accentArrow = "bg-black text-[#B7F500]";

const ghostFill: Record<SplitonCtaTone, string> = {
  onDark: "bg-white/[0.06] text-white hover:bg-white/[0.1]",
  onLight: "bg-black/[0.04] text-neutral-900 hover:bg-black/[0.07]",
};

const base =
  "group relative isolate inline-flex h-11 items-center overflow-hidden rounded-full text-[14px] font-[510] tracking-[-0.011em] outline-none transition-[background-color,color,transform] duration-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/25";

const labelEase = "transform 0.5s cubic-bezier(0.215, 0.61, 0.355, 1)";

/**
 * High-contrast Spliton CTA (footer "В кабинет" look).
 * Hover fill is a single background-color on the pill shell — no overlay layers,
 * so rounded caps never show white fringes.
 */
export function SplitonCtaPill({
  children,
  tone = "onLight",
  variant = "primary",
  withArrow,
  className,
  href,
  type = "button",
  ...buttonProps
}: SplitonCtaPillProps) {
  const showArrow = withArrow ?? (variant === "primary" || variant === "accent");
  const padding = showArrow ? "pl-6 pr-1.5" : "px-6";
  const animated = variant !== "ghost";

  const restText =
    variant === "ghost"
      ? undefined
      : variant === "accent"
        ? "text-black"
        : tone === "onDark"
          ? "text-black"
          : "text-white";

  const hoverText =
    variant === "ghost"
      ? undefined
      : variant === "accent" || tone === "onDark"
        ? "text-white"
        : "text-black";

  const arrow =
    variant === "accent"
      ? accentArrow
      : variant === "primary"
        ? tone === "onDark"
          ? arrowFill.onDark
          : arrowFill.onLight
        : "";

  const hoverArrow =
    variant === "ghost"
      ? undefined
      : variant === "accent" || tone === "onDark"
        ? "group-hover:bg-white group-hover:text-black group-focus-visible:bg-white group-focus-visible:text-black"
        : "group-hover:bg-black group-hover:text-white group-focus-visible:bg-black group-focus-visible:text-white";

  const shellFill =
    variant === "accent"
      ? accentShell
      : variant === "primary"
        ? primaryShell[tone]
        : ghostFill[tone];

  const classes = cn(
    base,
    showArrow ? "justify-between gap-3" : "justify-center",
    padding,
    shellFill,
    animated &&
      "hover:[--cta-label-y:-160%] focus-visible:[--cta-label-y:-160%] hover:[--cta-label-hover-y:0%] focus-visible:[--cta-label-hover-y:0%]",
    className,
  );

  const label = (
    <span className={cn("relative z-[1] grid min-w-0 overflow-hidden", !animated && "relative z-10")}>
      <span
        className={cn(
          "col-start-1 row-start-1 truncate will-change-transform motion-reduce:transition-none",
          restText,
        )}
        style={
          animated
            ? {
                transform: "translateY(var(--cta-label-y, 0%))",
                transition: labelEase,
              }
            : undefined
        }
      >
        {children}
      </span>
      {animated && hoverText ? (
        <span
          aria-hidden
          className={cn(
            "col-start-1 row-start-1 truncate will-change-transform motion-reduce:transition-none",
            hoverText,
          )}
          style={{
            transform: "translateY(var(--cta-label-hover-y, 160%))",
            transition: labelEase,
          }}
        >
          {children}
        </span>
      ) : null}
    </span>
  );

  const content = (
    <>
      {label}
      {showArrow ? (
        <span
          className={cn(
            "relative z-[1] inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-500",
            arrow,
            hoverArrow,
          )}
        >
          <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
