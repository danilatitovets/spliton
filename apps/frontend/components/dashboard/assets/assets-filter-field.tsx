"use client";

import { ChevronDown } from "@/lib/lucide";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { assetsFilterSelectClass } from "@/components/dashboard/assets/assets-ui";
import { cn } from "@/lib/utils";

export function AssetsFilterField({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="mb-1.5 text-xs text-neutral-500">{label}</p>
      {children}
    </div>
  );
}

type FilterOption = { value: string; label: string };

type MenuPos = { top: number; left: number; width: number };

export function AssetsFilterSelect({
  value,
  options,
  onSelect,
  disabled,
  className,
}: {
  value: string;
  options: FilterOption[];
  onSelect: (value: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<MenuPos | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const items = useMemo(() => options, [options]);
  const currentLabel = items.find((o) => o.value === value)?.label ?? value;

  const updatePos = () => {
    const el = buttonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 160),
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePos();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => updatePos();
    const onResize = () => updatePos();
    const onPointer = (e: MouseEvent | PointerEvent) => {
      const t = e.target as Node;
      if (buttonRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        className={cn(assetsFilterSelectClass, className)}
      >
        <span className="min-w-0 flex-1 truncate text-left">{currentLabel}</span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-neutral-400 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open && pos
        ? createPortal(
            <div
              ref={menuRef}
              role="listbox"
              style={{ top: pos.top, left: pos.left, minWidth: pos.width }}
              className="fixed z-[80] max-h-56 overflow-auto rounded-xl bg-white py-1 shadow-[0_12px_40px_rgba(0,0,0,0.14)] ring-1 ring-neutral-200"
            >
              {items.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  role="option"
                  aria-selected={item.value === value}
                  onClick={() => {
                    onSelect(item.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center px-3 py-2.5 text-left text-sm transition",
                    item.value === value
                      ? "bg-neutral-100 font-medium text-neutral-900"
                      : "text-neutral-700 hover:bg-neutral-50",
                  )}
                >
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
