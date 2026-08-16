import { cn } from "@/lib/utils";

/** Белая плитка — без рамок и теней (OKX Assets). */
export const assetsCardClass = "rounded-2xl bg-white px-4 py-5 sm:px-6";

export const assetsMutedCardClass = "rounded-2xl bg-neutral-50 px-3.5 py-3.5 shadow-none sm:px-5 sm:py-5";

/** Dark OKX / bank-card tiles for metrics & portfolio black surfaces. */
export const assetsDarkCardClass =
  "rounded-[1.35rem] bg-[#111113] px-4 py-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] sm:rounded-[1.5rem] sm:px-5 sm:py-5";

export const assetsDarkPanelClass = "rounded-2xl bg-[#1c1c1e] shadow-none";

export const assetsDarkSegmentTrackClass = "flex rounded-xl bg-[#1c1c1e] p-1";

export const assetsDarkSegmentActiveClass = "rounded-lg bg-[#2c2c2e] font-medium text-white";

export const assetsDarkSegmentIdleClass = "rounded-lg text-white/45 hover:text-white/80";

/** Внутренние блоки графиков / KPI — плоские, без рамок. */
export const assetsPanelClass = "rounded-2xl bg-neutral-100/70 shadow-none";

export const assetsFilterSelectClass =
  "inline-flex h-10 w-full min-w-[8.5rem] items-center justify-between gap-2 rounded-lg bg-neutral-100 px-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200/70 disabled:cursor-not-allowed disabled:opacity-50";

export const assetsFilterInputClass =
  "h-10 w-full rounded-lg bg-neutral-100 px-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50";

/** Primary CTA on light surfaces — prefer `SplitonCtaPill` (arrow circle). */
export const assetsPrimaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-black px-6 text-[14px] font-[510] tracking-[-0.011em] text-white transition hover:bg-neutral-800 active:scale-[0.98]";

export const assetsSecondaryButtonClass =
  "inline-flex h-11 items-center justify-center rounded-full px-6 text-[14px] font-[510] tracking-[-0.011em] text-neutral-900 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)] transition hover:bg-black/[0.04] active:scale-[0.98]";

export const assetsOutlineButtonClass =
  "inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-medium text-neutral-900 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)] transition hover:bg-black/[0.04] active:scale-[0.98]";

/** Активный pill в тулбарах графиков. */
export const assetsSegmentActiveClass = "rounded-lg bg-neutral-100 font-medium text-neutral-900";

export const assetsSegmentIdleClass = "rounded-lg text-neutral-500 hover:text-neutral-800";

export function assetsSectionTitleClass(extra?: string) {
  return cn("text-base font-semibold tracking-tight text-neutral-900", extra);
}

export const assetsTableHeadClass =
  "px-4 py-3 text-xs font-normal text-neutral-500 first:pl-0 last:pr-0";

export const assetsTableCellClass =
  "border-t border-neutral-100 px-4 py-3.5 text-sm text-neutral-800 first:pl-0 last:pr-0";

/** Shared chart/empty slot — keeps paired metrics cards icons on one line. */
export const assetsChartSlotClass =
  "flex min-h-[200px] w-full flex-col items-center justify-start pt-1 sm:min-h-[280px] sm:pt-3";

/** Header band for metrics pair (desktop alignment only — no tall empty band on mobile). */
export const assetsMetricsPairHeaderClass = "sm:min-h-[10rem]";

/** Footer band matching cashflow strip under dynamics chart. */
export const assetsMetricsPairFooterClass = "mt-auto shrink-0 sm:min-h-[8.5rem]";

/** Flat black empty panel — no border, no shadow. */
export const assetsDarkEmptyPanelClass =
  "flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl bg-black px-5 py-10 text-center shadow-none ring-0 sm:min-h-[320px] sm:px-6 sm:py-12";
