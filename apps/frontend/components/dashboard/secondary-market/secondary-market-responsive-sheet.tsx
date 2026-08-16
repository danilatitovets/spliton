"use client";

import type { ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "@/lib/lucide";

import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

const SHEET_HEADER_VIDEO = "/videos/position-holding-bg.mp4";

type SecondaryMarketResponsiveSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Desktop panel width, default 440px */
  widthClassName?: string;
  /** Desktop slide side. Mobile stays bottom sheet. */
  side?: "left" | "right";
  /** Soft blurred Spliton video under the header. */
  headerVideo?: boolean;
  /** Override header video source when headerVideo is true. */
  headerVideoSrc?: string;
};

export function SecondaryMarketResponsiveSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  widthClassName = "md:w-[min(100vw-1rem,440px)]",
  side = "right",
  headerVideo = false,
  headerVideoSrc = SHEET_HEADER_VIDEO,
}: SecondaryMarketResponsiveSheetProps) {
  const { t } = useI18n();
  const fromRight = side === "right";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-[127] bg-black/75 backdrop-blur-[3px]",
            "transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0",
          )}
        />
        <Dialog.Popup
          className={cn(
            "fixed z-[128] flex flex-col bg-[#0a0a0a] text-white",
            "shadow-[0_-24px_80px_rgba(0,0,0,0.55)]",
            "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-[24px]",
            "max-md:data-starting-style:translate-y-full max-md:data-ending-style:translate-y-full",
            "md:inset-y-0 md:max-h-dvh md:translate-y-0 md:rounded-none",
            fromRight
              ? "md:left-auto md:right-0 md:rounded-l-2xl md:shadow-[-24px_0_80px_rgba(0,0,0,0.55)] md:data-starting-style:translate-x-full md:data-ending-style:translate-x-full"
              : "md:left-0 md:right-auto md:rounded-r-2xl md:shadow-[24px_0_80px_rgba(0,0,0,0.55)] md:data-starting-style:-translate-x-full md:data-ending-style:-translate-x-full",
            widthClassName,
          )}
        >
          <div className="flex shrink-0 flex-col items-center pt-2.5 md:hidden">
            <div className="h-1 w-10 rounded-full bg-white/20" aria-hidden />
          </div>

          <div className="relative isolate shrink-0 overflow-hidden">
            {headerVideo ? (
              <div className="pointer-events-none absolute inset-0" aria-hidden>
                <video
                  className="absolute inset-0 h-full w-full scale-110 object-cover opacity-55 blur-[10px] motion-reduce:hidden"
                  src={headerVideoSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-[#0a0a0a]" />
              </div>
            ) : null}
            <div className="relative z-10 flex items-start justify-between gap-3 px-5 pb-4 pt-3 md:px-6 md:pt-5">
              <div className="min-w-0">
                <Dialog.Title className="text-[17px] font-semibold tracking-tight text-white md:text-lg">
                  {title}
                </Dialog.Title>
                {description ? (
                  <Dialog.Description
                    className={cn(
                      "mt-1 text-[12px] leading-relaxed md:text-[13px]",
                      headerVideo ? "text-white/55" : "text-zinc-500",
                    )}
                  >
                    {description}
                  </Dialog.Description>
                ) : null}
              </div>
              <Dialog.Close
                aria-label={t("secondaryMarket.aria.close")}
                className={cn(
                  "inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition hover:text-white",
                  headerVideo
                    ? "border border-white/15 bg-black/35 backdrop-blur-sm hover:border-white/25 hover:bg-black/50"
                    : "bg-white/[0.06] hover:bg-white/[0.1]",
                )}
              >
                <X className="size-4" strokeWidth={1.75} />
              </Dialog.Close>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 md:px-6">{children}</div>

          {footer ? (
            <div className="shrink-0 bg-[#0a0a0a] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6">
              {footer}
            </div>
          ) : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
