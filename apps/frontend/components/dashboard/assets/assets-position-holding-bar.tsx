"use client";

import type { ReactNode } from "react";

import type { LinkedHoldingPreview } from "@/lib/assets/holdings";
import { useI18n } from "@/components/providers/i18n-provider";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { assetsSellUnitsPath, catalogBuyUnitsPath } from "@/constants/routes";
import { formatNumber } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

const POSITION_HOLDING_BG_VIDEO = "/videos/position-holding-bg.mp4";

const POSITION_STATUS_KEYS: Record<LinkedHoldingPreview["status"], string> = {
  Active: "positions.widgets.status.active",
  "Open round": "positions.widgets.status.openRound",
  Secondary: "positions.widgets.status.secondary",
  Closed: "positions.widgets.status.closed",
};

const STATUS_BADGE_CLASS: Record<LinkedHoldingPreview["status"], string> = {
  Active: "bg-[#B7F500]/15 text-[#B7F500]",
  "Open round": "bg-sky-400/15 text-sky-200",
  Secondary: "bg-white/10 text-white/75",
  Closed: "bg-white/8 text-white/45",
};

function MetricChip({
  children,
  emphasis = false,
}: {
  children: ReactNode;
  emphasis?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[12px] tabular-nums sm:text-[13px]",
        emphasis ? "bg-white/10 font-semibold text-white" : "bg-white/[0.06] font-medium text-white/70",
      )}
    >
      {children}
    </span>
  );
}

export function AssetsPositionHoldingBar({ holding }: { holding: LinkedHoldingPreview }) {
  const { t, locale } = useI18n();
  const canSell = holding.availableToSell !== false && holding.heldUnits > 0;
  const canBuy = holding.canBuyMore !== false;
  const available =
    typeof holding.availableUnits === "number" && Number.isFinite(holding.availableUnits)
      ? holding.availableUnits
      : holding.heldUnits;

  return (
    <section
      className="sticky top-[var(--dashboard-header-h,3rem)] z-[105] isolate overflow-hidden border-b border-white/[0.06] bg-black"
      aria-label={t("positions.detail.holdingEyebrow")}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-20 blur-[2px] motion-reduce:hidden"
          src={POSITION_HOLDING_BG_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        {/* Opaque scrub so page content cannot bleed under this second header */}
        <div className="absolute inset-0 bg-black/92 motion-reduce:bg-black" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:py-3.5 md:px-8 lg:px-10">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/45">
            {t("positions.detail.holdingEyebrow")}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <MetricChip emphasis>{formatNumber(holding.heldUnits, locale)} UNT</MetricChip>
            <MetricChip>{holding.share}</MetricChip>
            <MetricChip emphasis>{holding.value}</MetricChip>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
                STATUS_BADGE_CLASS[holding.status],
              )}
            >
              {t(POSITION_STATUS_KEYS[holding.status])}
            </span>
          </div>

          <p className="mt-2 text-[12px] text-white/45 sm:text-[13px]">
            {canSell
              ? t("positions.availableToSell").replace("{units}", formatNumber(available, locale))
              : t("positions.notAvailableToSell")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
          {canSell ? (
            <SplitonCtaPill
              href={assetsSellUnitsPath(holding.catalogReleaseId)}
              tone="onDark"
              variant="accent"
              className="h-10 min-w-[9.5rem] text-[12px] uppercase tracking-[0.04em]"
            >
              {t("positions.widgets.sellUnt")}
            </SplitonCtaPill>
          ) : (
            <span
              aria-disabled
              className="inline-flex h-10 cursor-not-allowed items-center rounded-full bg-[#B7F500]/25 px-6 text-[12px] font-[510] uppercase tracking-[0.04em] text-black/40"
            >
              {t("positions.widgets.sellUnt")}
            </span>
          )}

          {canBuy ? (
            <SplitonCtaPill
              href={catalogBuyUnitsPath(holding.catalogReleaseId)}
              tone="onDark"
              variant="ghost"
              withArrow={false}
              className="h-10 min-w-[9.5rem] text-[12px] uppercase tracking-[0.04em]"
            >
              {t("positions.widgets.modalBuyMore")}
            </SplitonCtaPill>
          ) : (
            <span
              aria-disabled
              className="inline-flex h-10 cursor-not-allowed items-center rounded-full bg-white/[0.06] px-6 text-[12px] font-[510] uppercase tracking-[0.04em] text-white/30"
            >
              {t("positions.widgets.modalBuyMore")}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
