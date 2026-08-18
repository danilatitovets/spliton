"use client";

/**
 * Compact section pill bar. Hover fills a pill with a rising white circle
 * and swaps in black label/icon — same motion as the GSAP PillNav pattern,
 * implemented with CSS so we stay on Next.js without extra deps.
 */

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type PillNavItem = {
  label: string;
  href: string;
  icon?: ReactNode;
  active?: boolean;
  ariaLabel?: string;
};

export type PillNavProps = {
  items: PillNavItem[];
  className?: string;
  ariaLabel?: string;
  baseColor?: string;
  hoverFill?: string;
  hoverTextColor?: string;
  /** Hide labels below `md` — icon-only pills on mobile. */
  iconOnlyMobile?: boolean;
};

function layoutHoverCircle(circle: HTMLSpanElement, pill: HTMLElement) {
  const { width: w, height: h } = pill.getBoundingClientRect();
  if (w < 2 || h < 2) return;

  const R = (w * w) / 4 / (2 * h) + h / 2;
  const D = Math.ceil(2 * R) + 2;
  const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;

  circle.style.width = `${D}px`;
  circle.style.height = `${D}px`;
  circle.style.bottom = `-${delta}px`;
  circle.style.transformOrigin = `50% ${D - delta}px`;
}

function PillLink({
  item,
  hoverFill,
  hoverTextColor,
  iconOnlyMobile,
}: {
  item: PillNavItem;
  hoverFill: string;
  hoverTextColor: string;
  iconOnlyMobile?: boolean;
}) {
  const pillRef = useRef<HTMLAnchorElement>(null);
  const circleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const pill = pillRef.current;
    const circle = circleRef.current;
    if (!pill || !circle) return;

    const layout = () => layoutHoverCircle(circle, pill);
    layout();

    const observer = new ResizeObserver(layout);
    observer.observe(pill);
    void document.fonts?.ready.then(layout).catch(() => {});

    return () => observer.disconnect();
  }, [item.label]);

  const content = (
    <>
      {item.icon ? (
        <span
          className={cn(
            "inline-flex shrink-0 items-center justify-center",
            iconOnlyMobile
              ? "size-4 [&_svg]:size-4 md:size-3.5 md:[&_svg]:size-3.5"
              : "size-3.5 sm:size-4 [&_svg]:size-3.5 sm:[&_svg]:size-4",
          )}
        >
          {item.icon}
        </span>
      ) : null}
      <span className={cn("whitespace-nowrap", iconOnlyMobile && "hidden md:inline")}>{item.label}</span>
    </>
  );

  return (
    <Link
      ref={pillRef}
      href={item.href}
      aria-current={item.active ? "page" : undefined}
      aria-label={item.ariaLabel ?? item.label}
        className={cn(
          "group relative z-0 inline-flex shrink-0 items-center justify-center self-center overflow-hidden rounded-full",
          "no-underline outline-none hover:z-10 focus-visible:z-10",
          iconOnlyMobile ? "size-9 p-0 max-md:w-full max-md:min-w-0 md:h-8 md:w-auto md:px-3" : "h-7 px-2 sm:h-8 sm:px-2.5",
        iconOnlyMobile
          ? "max-md:overflow-visible md:hover:[--pill-circle-scale:1.2] md:focus-visible:[--pill-circle-scale:1.2] md:hover:[--pill-label-y:-160%] md:focus-visible:[--pill-label-y:-160%] md:hover:[--pill-label-hover-y:0%] md:focus-visible:[--pill-label-hover-y:0%]"
          : "hover:[--pill-circle-scale:1.2] focus-visible:[--pill-circle-scale:1.2] hover:[--pill-label-y:-160%] focus-visible:[--pill-label-y:-160%] hover:[--pill-label-hover-y:0%] focus-visible:[--pill-label-hover-y:0%]",
        item.active ? "bg-white/12 text-white" : "text-white/75",
      )}
    >
      <span
        ref={circleRef}
        aria-hidden
        className="pointer-events-none absolute left-1/2 z-[1] block h-24 w-24 rounded-full will-change-transform motion-reduce:transition-none"
        style={{
          background: hoverFill,
          transform: "translateX(-50%) scale(var(--pill-circle-scale, 0))",
          transition: "transform 0.5s cubic-bezier(0.215, 0.61, 0.355, 1)",
        }}
      />
      <span className="relative z-[2] grid overflow-hidden py-px text-[10px] font-semibold leading-tight tracking-tight sm:text-[11px]">
        <span
          className="col-start-1 row-start-1 inline-flex items-center gap-1.5 will-change-transform motion-reduce:transition-none"
          style={{
            transform: "translateY(var(--pill-label-y, 0%))",
            transition: "transform 0.5s cubic-bezier(0.215, 0.61, 0.355, 1)",
          }}
        >
          {content}
        </span>
        <span
          aria-hidden
          className="col-start-1 row-start-1 inline-flex items-center gap-1.5 will-change-transform motion-reduce:transition-none"
          style={{
            color: hoverTextColor,
            transform: "translateY(var(--pill-label-hover-y, 160%))",
            transition: "transform 0.5s cubic-bezier(0.215, 0.61, 0.355, 1)",
          }}
        >
          {content}
        </span>
      </span>
    </Link>
  );
}

export function PillNav({
  items,
  className = "",
  ariaLabel = "Section navigation",
  baseColor = "#1a1a1a",
  hoverFill = "#ffffff",
  hoverTextColor = "#0a0a0a",
  iconOnlyMobile = false,
}: PillNavProps) {
  return (
    <div className="w-full min-w-0 max-w-full md:w-auto">
      <div
        className={cn(
          "flex w-full max-w-full items-center rounded-[1.25rem] px-1 py-1",
          iconOnlyMobile
            ? "max-md:grid max-md:grid-cols-6 max-md:gap-0 max-md:overflow-visible max-md:px-0.5 md:flex md:flex-nowrap md:justify-start md:gap-1.5 md:overflow-visible"
            : "flex-wrap justify-start gap-0.5",
          "md:w-max md:flex-nowrap md:rounded-full md:px-2 md:py-1.5",
          className,
        )}
        style={{ background: baseColor }}
        role="navigation"
        aria-label={ariaLabel}
      >
        {items.map((item) => (
          <PillLink
            key={item.href}
            item={item}
            hoverFill={hoverFill}
            hoverTextColor={hoverTextColor}
            iconOnlyMobile={iconOnlyMobile}
          />
        ))}
      </div>
    </div>
  );
}

export default PillNav;
