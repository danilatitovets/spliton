"use client";

import { Info } from "@/lib/lucide";
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type MetricsInfoTipProps = {
  label: string;
  children: string;
  className?: string;
  tone?: "onLight" | "onDark";
};

/** Compact “i” tip — GPT popover via portal so overflow parents never clip it. */
export function MetricsInfoTip({
  label,
  children,
  className,
  tone = "onLight",
}: MetricsInfoTipProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({ visibility: "hidden" });
  const rootRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);
  const tipId = useId();
  const onDark = tone === "onDark";

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;

    const update = () => {
      const rect = rootRef.current!.getBoundingClientRect();
      const gap = 8;
      const pad = 12;
      const tipWidth = Math.min(16 * 16, window.innerWidth - pad * 2);
      let left = rect.left + rect.width / 2 - tipWidth / 2;
      left = Math.max(pad, Math.min(left, window.innerWidth - pad - tipWidth));

      const belowTop = rect.bottom + gap;
      const estimatedHeight = 96;
      const fitsBelow = belowTop + estimatedHeight <= window.innerHeight - pad;
      const top = fitsBelow
        ? belowTop
        : Math.max(pad, rect.top - gap - estimatedHeight);

      setStyle({
        position: "fixed",
        top,
        left,
        width: tipWidth,
        visibility: "visible",
      });
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const panel =
    open && mounted
      ? createPortal(
          <span
            ref={panelRef}
            id={tipId}
            role="tooltip"
            style={style}
            className="z-[200] rounded-2xl bg-[#2f2f2f] px-3.5 py-3 text-left text-[12px] leading-relaxed text-white/85 shadow-[0_16px_40px_rgba(0,0,0,0.28)] ring-1 ring-white/10"
          >
            {children}
          </span>,
          document.body,
        )
      : null;

  return (
    <>
      <span ref={rootRef} className={cn("relative inline-flex shrink-0", className)}>
        <button
          type="button"
          aria-label={label}
          aria-expanded={open}
          aria-controls={tipId}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "inline-flex size-5 items-center justify-center rounded-full transition",
            onDark
              ? "text-white/45 hover:bg-white/10 hover:text-white/80"
              : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700",
            open && (onDark ? "bg-white/10 text-white/90" : "bg-neutral-100 text-neutral-800"),
          )}
        >
          <Info className="size-3.5" strokeWidth={2} aria-hidden />
        </button>
      </span>
      {panel}
    </>
  );
}
