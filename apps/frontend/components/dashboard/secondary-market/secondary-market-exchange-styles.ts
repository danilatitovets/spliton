/** Dark footer-style exchange tokens for secondary market. */
export const smExchange = {
  panel: "bg-black",
  input:
    "h-10 w-full rounded-2xl bg-white/[0.06] px-3 font-mono text-sm text-white placeholder:text-zinc-600 outline-none transition focus:bg-white/[0.09]",
  inputPill:
    "h-10 w-full rounded-full bg-white/[0.06] py-2 pl-10 pr-3 font-mono text-sm text-white placeholder:text-zinc-600 outline-none transition focus:bg-white/[0.09]",
  chipActive: "bg-white text-black",
  chipIdle: "bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1] hover:text-zinc-200",
  chipBase: "shrink-0 rounded-full px-3 py-1.5 font-mono text-[12px] font-medium transition-colors",
  buySideActive: "bg-white text-black",
  buySideIdle: "bg-white/[0.04] text-zinc-500",
  sellSideActive: "bg-zinc-800 text-white",
  sellSideIdle: "bg-white/[0.04] text-zinc-500",
  sideToggle: "grid grid-cols-2 gap-1 rounded-full bg-black p-0.5 font-mono text-[13px] font-semibold",
  submitBuy: "h-11 w-full rounded-full bg-white text-[13px] font-semibold text-black transition hover:bg-[#e8e8e8] active:scale-[0.98]",
  submitSell: "h-11 w-full rounded-full bg-zinc-800 text-[13px] font-semibold text-white transition hover:bg-zinc-700 active:scale-[0.98]",
  rowDivider: "border-b border-white/6",
  statLabel: "font-mono text-[10px] uppercase tracking-wider text-zinc-500",
  statValue: "mt-0.5 font-mono text-[17px] font-semibold tabular-nums text-white",
  accentPos: "text-white",
  accentNeg: "text-zinc-400",
  accentFill: "bg-white",
  accentSoft: "bg-white/10 text-white",
} as const;
