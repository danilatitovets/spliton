"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Info } from "@/lib/lucide";

import { cn } from "@/lib/utils";

type InfoHintProps = {
  text: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
  stopPropagation?: boolean;
  placement?: "bottom-start" | "bottom-end" | "top-end";
  /** Accessible name when `text` is not a plain string */
  label?: string;
};

function useFloatingPanelStyle(
  open: boolean,
  anchorRef: React.RefObject<HTMLElement | null>,
  placement: "bottom-start" | "bottom-end" | "top-end",
) {
  const [style, setStyle] = React.useState<React.CSSProperties>({ visibility: "hidden" });

  React.useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;

    const update = () => {
      const rect = anchorRef.current!.getBoundingClientRect();
      const gap = 8;
      const viewportPad = 12;

      if (placement === "top-end") {
        setStyle({
          position: "fixed",
          top: Math.max(viewportPad, rect.top - gap),
          left: Math.min(window.innerWidth - viewportPad, rect.right),
          transform: "translate(-100%, -100%)",
          visibility: "visible",
        });
        return;
      }

      if (placement === "bottom-end") {
        setStyle({
          position: "fixed",
          top: rect.bottom + gap,
          left: Math.min(window.innerWidth - viewportPad, rect.right),
          transform: "translateX(-100%)",
          visibility: "visible",
        });
        return;
      }

      setStyle({
        position: "fixed",
        top: rect.bottom + gap,
        left: Math.max(viewportPad, rect.left),
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
  }, [open, placement, anchorRef]);

  return style;
}

/** Compact “i” hint — opens on click (works on touch). Dark theme for market pages. */
export function InfoHint({
  text,
  className,
  size = "sm",
  stopPropagation = false,
  placement = "bottom-start",
  label,
}: InfoHintProps) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const panelStyle = useFloatingPanelStyle(open, anchorRef, placement);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const iconSize = size === "md" ? "size-4" : "size-3.5";
  const buttonSize = size === "md" ? "size-7" : "size-5";
  const ariaLabel = label ?? (typeof text === "string" ? text : "Подробнее");

  const panel =
    open && mounted
      ? createPortal(
          <div
            ref={panelRef}
            role="tooltip"
            style={panelStyle}
            className="z-[200] w-max max-w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl bg-[#141414] px-3.5 py-2.5 text-[12px] font-normal leading-relaxed text-zinc-300 ring-1 ring-white/[0.08]"
          >
            {text}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div ref={anchorRef} className={cn("relative inline-flex align-middle", className)}>
        <button
          type="button"
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full transition",
            buttonSize,
            open
              ? "bg-[#B7F500]/12 text-[#B7F500]"
              : "bg-white/[0.06] text-zinc-500 hover:bg-white/[0.1] hover:text-zinc-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B7F500]/35",
          )}
          aria-expanded={open}
          aria-label={ariaLabel}
          onClick={(event) => {
            if (stopPropagation) event.stopPropagation();
            event.preventDefault();
            setOpen((value) => !value);
          }}
        >
          <Info className={iconSize} strokeWidth={2} aria-hidden />
        </button>
      </div>
      {panel}
    </>
  );
}
