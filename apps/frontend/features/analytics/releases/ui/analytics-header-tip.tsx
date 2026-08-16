"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

/** OKX/catalog-style dotted label with portal tooltip (hover + click). */
export function AnalyticsHeaderTip({ label, tip }: { label: string; tip?: string }) {
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const tipId = React.useId();

  const updateCoords = React.useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCoords({ top: r.bottom + 8, left: r.left + r.width / 2 });
  }, []);

  const show = React.useCallback(() => {
    updateCoords();
    setOpen(true);
  }, [updateCoords]);

  const hide = React.useCallback(() => setOpen(false), []);

  React.useEffect(() => {
    if (!open) return;
    updateCoords();
    const onScroll = () => updateCoords();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };
    const onDoc = (e: MouseEvent) => {
      if (!btnRef.current?.contains(e.target as Node)) hide();
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [open, hide, updateCoords]);

  if (!tip) return <span className="truncate">{label}</span>;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="inline-flex max-w-full items-center text-left outline-none"
        aria-expanded={open}
        aria-describedby={open ? tipId : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (open) hide();
          else show();
        }}
      >
        <span
          className={cn(
            "truncate border-b border-dotted border-zinc-600 transition",
            open && "border-zinc-300 text-zinc-200",
          )}
        >
          {label}
        </span>
      </button>
      {open && coords && typeof document !== "undefined"
        ? createPortal(
            <span
              id={tipId}
              role="tooltip"
              className={cn(
                "pointer-events-none fixed z-[300] w-max max-w-[260px] -translate-x-1/2",
                "rounded-md bg-[#2a2a2a] px-2.5 py-1.5 text-[11px] leading-snug text-zinc-100 shadow-[0_8px_24px_rgba(0,0,0,0.55)]",
                "after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2",
                "after:border-4 after:border-transparent after:border-b-[#2a2a2a]",
              )}
              style={{ top: coords.top, left: coords.left }}
            >
              {tip}
            </span>,
            document.body,
          )
        : null}
    </>
  );
}