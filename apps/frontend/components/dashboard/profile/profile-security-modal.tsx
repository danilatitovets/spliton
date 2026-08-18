"use client";

import { useCallback, useRef, useState, type ReactNode, type TouchEvent } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "@/lib/lucide";

import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

import { ProfileOkxDetails } from "./profile-okx";
import { ProfileGlassIcon } from "./profile-shared";

type ProfileSecurityModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  headline?: string;
  hero?: string;
  detailsHref?: string;
  detailsLabel?: string;
  children?: ReactNode;
  footer?: ReactNode;
  widthClassName?: string;
  headerVideo?: boolean;
  headerVideoSrc?: string;
};

const DEFAULT_HEADER_VIDEO = "/videos/position-holding-bg.mp4";

const hideScrollbar =
  "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const SWIPE_DISMISS_PX = 88;

export function ProfileSecurityModal({
  open,
  onOpenChange,
  title,
  description,
  headline,
  hero,
  detailsHref,
  detailsLabel,
  children,
  footer,
  widthClassName = "md:w-[min(100vw-1.5rem,480px)]",
  headerVideo = false,
  headerVideoSrc = DEFAULT_HEADER_VIDEO,
}: ProfileSecurityModalProps) {
  const { t } = useI18n();
  const feature = Boolean(hero || headline);
  const touchStartY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  const resetDrag = useCallback(() => {
    touchStartY.current = null;
    setDragY(0);
    setDragging(false);
  }, []);

  const onTouchStart = useCallback((e: TouchEvent) => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) return;
    touchStartY.current = e.touches[0]?.clientY ?? null;
    setDragging(true);
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (touchStartY.current == null) return;
    const y = e.touches[0]?.clientY ?? touchStartY.current;
    const delta = Math.max(0, y - touchStartY.current);
    setDragY(delta);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (dragY >= SWIPE_DISMISS_PX) {
      onOpenChange(false);
    }
    resetDrag();
  }, [dragY, onOpenChange, resetDrag]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) resetDrag();
        onOpenChange(next);
      }}
      modal
    >
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-[200] bg-black/45",
            "transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
          )}
        />
        <Dialog.Popup
          className={cn(
            "fixed z-[201] flex flex-col overflow-hidden bg-[#0c0c0c] text-white outline-none",
            "shadow-[0_28px_90px_-28px_rgba(0,0,0,0.92)]",
            /* Mobile: bottom sheet */
            "inset-x-0 bottom-0 w-full max-h-[min(92dvh,740px)] rounded-t-[1.35rem]",
            "transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "max-md:data-starting-style:translate-y-full max-md:data-ending-style:translate-y-full",
            /* Desktop: centered card */
            "md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:max-h-[min(92dvh,740px)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[1.35rem]",
            "md:data-starting-style:scale-[0.98] md:data-starting-style:opacity-0",
            "md:data-ending-style:scale-[0.98] md:data-ending-style:opacity-0",
            widthClassName,
            hideScrollbar,
          )}
          style={
            dragY > 0
              ? { transform: `translateY(${dragY}px)`, transition: dragging ? "none" : undefined }
              : undefined
          }
        >
          <div
            className="flex shrink-0 touch-none flex-col items-center pt-2.5 md:hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={resetDrag}
          >
            <div className="h-1 w-10 rounded-full bg-white/25" aria-hidden />
          </div>

          <div
            className="relative isolate shrink-0 overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={resetDrag}
          >
            {headerVideo ? (
              <div className="pointer-events-none absolute inset-0" aria-hidden>
                <video
                  className="absolute inset-0 h-full w-full scale-105 object-cover opacity-55 motion-reduce:hidden"
                  src={headerVideoSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/60 to-[#0c0c0c]" />
              </div>
            ) : (
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_80%_at_12%_0%,rgba(255,255,255,0.06),transparent_55%)]"
                aria-hidden
              />
            )}
            <div
              className={cn(
                "relative z-10 px-6 pb-4 pt-4 sm:px-8 sm:pt-7",
                headerVideo &&
                  "flex min-h-[10rem] flex-col justify-end pb-5 pt-10 sm:min-h-[12rem] sm:pb-6 sm:pt-14",
              )}
            >
              <Dialog.Title className="pr-12 text-[18px] font-semibold tracking-tight text-white sm:text-[19px]">
                {title}
              </Dialog.Title>
              {headerVideo && description ? (
                <Dialog.Description className="mt-2 max-w-[42ch] text-[13px] leading-relaxed text-white/65">
                  {description}
                </Dialog.Description>
              ) : null}
              <Dialog.Close
                aria-label={t("profile.security.modal.closeAria")}
                className={cn(
                  "absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-full text-zinc-300 transition",
                  "bg-white/[0.08] hover:bg-white/[0.14] hover:text-white",
                )}
              >
                <X className="size-3.5" strokeWidth={2} aria-hidden />
              </Dialog.Close>
            </div>
          </div>

          <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-2 pt-5 sm:px-8", hideScrollbar)}>
            {feature ? (
              <div className="pb-2 text-center">
                {hero ? (
                  <div className="mb-6 flex justify-center">
                    <ProfileGlassIcon src={hero} size="xl" />
                  </div>
                ) : null}
                {headline ? (
                  <p className="text-[22px] font-semibold tracking-tight text-white sm:text-[24px]">{headline}</p>
                ) : null}
                {description && !headerVideo ? (
                  <Dialog.Description className="mx-auto mt-3 max-w-[40ch] text-[14px] leading-relaxed text-zinc-400">
                    {description}
                  </Dialog.Description>
                ) : null}
                {detailsHref && detailsLabel ? (
                  <div className="mt-3">
                    <ProfileOkxDetails href={detailsHref}>{detailsLabel}</ProfileOkxDetails>
                  </div>
                ) : null}
              </div>
            ) : description && !headerVideo ? (
              <Dialog.Description className="mb-4 text-[14px] leading-relaxed text-zinc-400">
                {description}
              </Dialog.Description>
            ) : null}
            {children}
          </div>

          {footer ? (
            <footer className="shrink-0 bg-[#0c0c0c] px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-8 sm:pb-7">
              {footer}
            </footer>
          ) : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ProfileSecurityModalFieldList({
  children,
  bare = false,
}: {
  children: ReactNode;
  bare?: boolean;
}) {
  return (
    <ul
      className={
        bare
          ? "mt-1 space-y-5"
          : "mt-1 space-y-0 overflow-hidden rounded-2xl bg-white/[0.03] px-4 py-1 sm:px-5"
      }
    >
      {children}
    </ul>
  );
}

export function ProfileSecurityModalField({
  label,
  htmlFor,
  children,
  bare = false,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  bare?: boolean;
}) {
  return (
    <li className={bare ? "py-0" : "border-b border-white/[0.08] py-3.5 last:border-b-0"}>
      <label
        htmlFor={htmlFor}
        className={cn(
          "mb-1.5 block text-[13px] font-medium",
          bare ? "text-white" : "text-[12px] uppercase tracking-[0.06em] text-zinc-400",
        )}
      >
        {label}
      </label>
      {children}
    </li>
  );
}

export function ProfileSecurityModalHints({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-1.5 rounded-2xl bg-white/[0.03] px-4 py-3.5 text-[13px] leading-relaxed text-zinc-400">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-zinc-500" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ProfileSecurityModalSupportNote({
  iconSrc,
  title,
  body,
}: {
  iconSrc: string;
  title: string;
  body: string;
}) {
  return (
    <div className="mt-4 flex items-start gap-3 rounded-2xl bg-black/35 px-3.5 py-3.5 sm:px-4">
      <ProfileGlassIcon src={iconSrc} size="sm" />
      <div className="min-w-0 pt-0.5">
        <p className="text-[13px] font-medium text-white">{title}</p>
        <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">{body}</p>
      </div>
    </div>
  );
}
