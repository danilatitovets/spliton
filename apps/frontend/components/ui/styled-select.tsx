"use client";

import { Check, ChevronDown } from "@/lib/lucide";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

export type StyledSelectOption = {
  value: string;
  label: string;
};

type MenuPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: "below" | "above";
};

type StyledSelectProps = {
  value: string;
  options: readonly StyledSelectOption[];
  onChange: (value: string) => void;
  id?: string;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  menuClassName?: string;
  /** Минимальная ширина выпадающего списка (может быть шире триггера). */
  menuMinWidth?: number;
  /** Максимальная ширина выпадающего списка. По умолчанию — ширина триггера. */
  menuMaxWidth?: number;
  placeholder?: string;
  size?: "sm" | "md";
  variant?: "default" | "soft" | "okx";
  tone?: "light" | "dark";
  /** Тон меню. Светлое меню — белая панель как у ChatGPT. */
  menuTone?: "light" | "dark";
  fullWidth?: boolean;
  align?: "start" | "end";
  borderless?: boolean;
  "aria-label"?: string;
};

function menuSurfaceClass(menuTone: "light" | "dark", variant: StyledSelectProps["variant"]) {
  if (menuTone === "dark") {
    return "rounded-2xl bg-[#2f2f2f] shadow-[0_16px_48px_rgba(0,0,0,0.45)] ring-1 ring-white/10";
  }
  if (variant === "okx") {
    return "rounded-xl bg-white shadow-[0_10px_32px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06]";
  }
  return "rounded-2xl bg-white shadow-[0_12px_40px_rgba(0,0,0,0.16)] ring-1 ring-black/[0.06]";
}

export function StyledSelect({
  value,
  options,
  onChange,
  id,
  icon,
  disabled = false,
  className,
  menuClassName,
  menuMinWidth,
  menuMaxWidth,
  placeholder,
  size = "md",
  variant = "default",
  tone = "light",
  menuTone,
  fullWidth = false,
  align = "start",
  borderless = false,
  "aria-label": ariaLabel,
}: StyledSelectProps) {
  const { t } = useI18n();
  const autoId = useId();
  const triggerId = id ?? autoId;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPosition | null>(null);
  const resolvedPlaceholder = placeholder ?? t("form.selectPlaceholder");
  const resolvedMenuTone = menuTone ?? tone;
  const lightMenu = resolvedMenuTone === "light";

  const items = useMemo(() => options, [options]);
  const currentLabel = items.find((o) => o.value === value)?.label ?? resolvedPlaceholder;

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateMenuPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const gap = 8;
    const viewportPadding = 12;
    const preferredMax = 320;
    const minVisible = 160;
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding - gap;
    const spaceAbove = rect.top - viewportPadding - gap;
    const openAbove = spaceBelow < minVisible && spaceAbove > spaceBelow;
    const maxHeight = Math.min(
      preferredMax,
      Math.max(132, openAbove ? spaceAbove : spaceBelow),
    );
    const viewportMax = window.innerWidth - viewportPadding * 2;
    const desired = Math.max(rect.width, menuMinWidth ?? rect.width);
    const menuWidth = Math.min(menuMaxWidth ?? desired, desired, viewportMax);
    let left = align === "end" ? rect.right - menuWidth : rect.left;
    left = Math.min(Math.max(viewportPadding, left), window.innerWidth - menuWidth - viewportPadding);

    setMenuPos({
      top: openAbove ? rect.top - gap : rect.bottom + gap,
      left,
      width: menuWidth,
      maxHeight,
      placement: openAbove ? "above" : "below",
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setMenuPos(null);
      return;
    }
    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, align, menuMinWidth, menuMaxWidth]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const menuStyle: CSSProperties | undefined = menuPos
    ? {
        position: "fixed",
        top: menuPos.top,
        left: menuPos.left,
        width: menuPos.width,
        minWidth: menuPos.width,
        zIndex: 240,
        transform: menuPos.placement === "above" ? "translateY(-100%)" : undefined,
      }
    : undefined;

  const menu = open && menuPos ? (
    <div
      ref={menuRef}
      role="listbox"
      aria-labelledby={triggerId}
      style={menuStyle}
      className={cn("overflow-hidden p-1.5", menuSurfaceClass(resolvedMenuTone, variant), menuClassName)}
    >
      <ul
        style={{ maxHeight: menuPos.maxHeight }}
        className={cn(
          "overflow-x-hidden overflow-y-auto overscroll-contain",
          !lightMenu && "admin-select-menu-scroll",
        )}
      >
        {items.map((item) => {
          const selected = item.value === value;
          return (
            <li key={item.value || "__empty"}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl px-3.5 text-left transition-colors",
                  "py-2.5 text-[15px] leading-snug",
                  selected
                    ? lightMenu
                      ? "bg-neutral-100 font-medium text-neutral-950"
                      : "bg-white/10 font-medium text-white"
                    : lightMenu
                      ? "text-neutral-800 hover:bg-neutral-100"
                      : "text-zinc-200 hover:bg-white/10",
                )}
              >
                <span className="min-w-0 truncate">{item.label}</span>
                <Check
                  className={cn(
                    "size-4 shrink-0",
                    selected ? (lightMenu ? "text-neutral-950" : "text-white") : "opacity-0",
                  )}
                  strokeWidth={2.4}
                  aria-hidden
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  ) : null;

  return (
    <div ref={rootRef} className={cn("relative overflow-visible", fullWidth && "w-full", className)}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center justify-between gap-2 whitespace-nowrap rounded-xl border font-medium transition",
          size === "sm" ? "h-8 px-2.5 text-xs" : "h-10 px-3.5 text-[13px]",
          fullWidth && "w-full",
          tone === "dark"
            ? cn(
                borderless
                  ? "border-0 bg-black/40 text-white hover:bg-black/50"
                  : "border-white/10 bg-zinc-800 text-white hover:bg-zinc-700/90",
                open &&
                  (borderless
                    ? "bg-black/55 ring-0"
                    : "border-white/20 bg-zinc-800 ring-2 ring-white/10"),
              )
            : variant === "okx"
              ? cn(
                  "rounded-lg border-0 bg-[#F5F5F5] font-normal text-black hover:bg-[#EBEBEB]",
                  open && "bg-white shadow-[0_6px_28px_-12px_rgba(0,0,0,0.08)]",
                )
              : cn(
                  variant === "soft"
                    ? "border-0 bg-neutral-50 text-neutral-900 hover:bg-neutral-100"
                    : "border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-neutral-100",
                  open &&
                    (variant === "soft"
                      ? "bg-white ring-2 ring-black/5"
                      : "border-neutral-300 bg-white"),
                ),
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {icon}
          <span className="truncate">{currentLabel}</span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            tone === "dark"
              ? "text-white/45"
              : variant === "okx"
                ? "text-[#848E9C]"
                : "text-neutral-400",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {mounted && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}

export function StyledSelectField({
  label,
  className,
  variant = "default",
  ...props
}: { label: string; className?: string } & StyledSelectProps) {
  return (
    <label
      className={cn(
        "flex flex-col gap-1.5",
        variant === "okx" ? "text-xs font-medium text-neutral-700" : "text-xs text-neutral-500",
        className,
      )}
    >
      <span>{label}</span>
      <StyledSelect {...props} variant={variant} fullWidth={props.fullWidth ?? true} />
    </label>
  );
}
