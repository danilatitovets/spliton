import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

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

const primaryFill: Record<SplitonCtaTone, string> = {
  onDark: "bg-white text-black hover:bg-[#e8e8e8]",
  onLight: "bg-black text-white hover:bg-neutral-800",
};

const arrowFill: Record<SplitonCtaTone, string> = {
  onDark: "bg-black text-white",
  onLight: "bg-white text-black",
};

const accentFill = "bg-[#B7F500] text-black hover:bg-[#c6ff33]";
const accentArrow = "bg-black text-[#B7F500]";

const ghostFill: Record<SplitonCtaTone, string> = {
  onDark: "bg-white/[0.06] text-white hover:bg-white/[0.1]",
  onLight: "bg-black/[0.04] text-neutral-900 hover:bg-black/[0.07]",
}

const base =
  "inline-flex h-11 items-center rounded-full text-[14px] font-[510] tracking-[-0.011em] transition active:scale-[0.98]";

/**
 * High-contrast Spliton CTA (footer "В кабинет" look).
 * Dark pages: white pill + black arrow circle.
 * Light pages: black pill + white arrow circle.
 * Full-width primary: label left, arrow circle flush right.
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
  const fill =
    variant === "accent"
      ? accentFill
      : variant === "primary"
        ? primaryFill[tone]
        : ghostFill[tone];
  const arrow = variant === "accent" ? accentArrow : arrowFill[tone];
  const classes = cn(
    base,
    showArrow ? "justify-between gap-3" : "justify-center",
    padding,
    fill,
    className,
  );

  const content = (
    <>
      <span className={cn(showArrow && "min-w-0")}>{children}</span>
      {showArrow ? (
        <span
          className={cn(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-full",
            arrow,
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