import { cn } from "@/lib/utils";

/** Flat dark panel — footer / secondary-market language. */
export const profileCardClass = "rounded-[1.25rem] bg-[#111111] px-5 py-5 sm:px-6 sm:py-6";

export function profileSectionClass(extra?: string) {
  return cn(profileCardClass, extra);
}

/** Muted inset panel. */
export const profileMutedCardClass = "rounded-2xl bg-white/[0.04] px-4 py-4 sm:px-5 sm:py-4";

/** Nested panel (login methods, toggles). */
export const profilePanelClass = "rounded-2xl bg-white/[0.04]";

/** Rows inside a card. */
export const profileListClass = "divide-y divide-white/[0.06]";

export const profilePrimaryButtonClass =
  "inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-[13px] font-semibold text-black transition hover:bg-[#e8e8e8] active:scale-[0.98]";

export const profileSecondaryButtonClass =
  "inline-flex h-10 items-center justify-center rounded-full px-4 text-[13px] font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] transition hover:bg-white/[0.04] active:scale-[0.98]";

export const profileOutlineButtonClass =
  "inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-medium text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] transition hover:bg-white/[0.04]";

export const profileInputClass =
  "h-11 w-full rounded-2xl bg-white/[0.05] px-3 text-sm text-white outline-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] transition placeholder:text-zinc-500 focus:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)]";

/** Inputs inside bordered modal field lists — clearer edge, flat fill. */
export const profileModalInputClass =
  "h-11 w-full rounded-xl border border-white/[0.14] bg-black/35 px-3.5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-white/30 focus:bg-black/45";
