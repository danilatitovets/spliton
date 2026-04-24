/**
 * Единый визуальный язык ряда действий в таблицах вторички:
 * «Мои ордера» и «История сделок».
 */
export const smTableActionIconCircle =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#151515] text-zinc-500 transition hover:bg-[#1a1a1a] hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B7F500]/35";

export const smTableActionIconCirclePressed =
  "bg-[#1f1f1f] text-zinc-200";

/** Белая pill «Релиз» + иконка внешней ссылки. */
export const smTableActionReleasePill =
  "inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-white px-3.5 font-sans text-[12px] font-semibold tracking-tight text-black transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B7F500]/40";

export const smTableActionMoreMenu =
  "absolute right-0 top-full z-30 mt-1.5 min-w-56 rounded-2xl bg-[#141414] py-1.5 text-left shadow-[0_20px_60px_rgba(0,0,0,0.65)]";

export const smTableActionMenuItem =
  "block w-full px-3.5 py-2 text-left font-mono text-[11px] text-zinc-200 hover:bg-white/5";

export const smTableActionMenuItemLink =
  "block w-full px-3.5 py-2 text-left font-mono text-[11px] text-zinc-200 hover:bg-white/5";

export const smTableActionMenuItemMuted =
  "block w-full px-3.5 py-2 text-left font-mono text-[10px] text-zinc-600";

export const smTableActionMenuItemDestructive =
  "block w-full px-3.5 py-2 text-left font-mono text-[11px] text-fuchsia-200/95 hover:bg-fuchsia-500/10";

export const smTableActionMenuItemAccent =
  "block w-full px-3.5 py-2 text-left font-mono text-[11px] text-[#d4f570] hover:bg-[#B7F500]/10";

export const smTableActionMenuItemSecondary =
  "block w-full px-3.5 py-2 text-left font-mono text-[11px] text-zinc-400 hover:bg-white/5 hover:text-zinc-200";

/** Вторичное действие в ряду / на карточке (напр. «Стакан»), та же высота h-9. */
export const smTableActionSecondaryPill =
  "inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-[#151515] px-3.5 font-mono text-[11px] font-medium text-zinc-400 transition hover:bg-[#1a1a1a] hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B7F500]/30";
