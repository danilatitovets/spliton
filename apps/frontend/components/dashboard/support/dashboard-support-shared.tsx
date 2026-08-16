"use client";

import { supportTicketStatusLabel } from "@/lib/i18n/support-messages";
import type { AppLocale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<string, "amber" | "emerald" | "neutral" | "sky"> = {
  open: "amber",
  in_progress: "amber",
  waiting_user: "sky",
  escalated: "amber",
  closed: "neutral",
};

export const okxFieldClass =
  "h-11 w-full rounded-lg border-0 bg-[#F5F5F5] px-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:bg-white focus:shadow-[0_6px_28px_-12px_rgba(0,0,0,0.08)]";

export const okxTextareaClass =
  "min-h-28 w-full rounded-lg border-0 bg-[#F5F5F5] px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:bg-white focus:shadow-[0_6px_28px_-12px_rgba(0,0,0,0.08)]";

export function shortSupportTicketId(id: string) {
  return id.length > 8 ? `SP-${id.slice(0, 8).toUpperCase()}` : `SP-${id.toUpperCase()}`;
}

export function SupportTicketStatusBadge({
  status,
  locale,
  tone: surfaceTone = "light",
}: {
  status: string;
  locale: AppLocale;
  tone?: "light" | "dark";
}) {
  const tone = STATUS_TONE[status] ?? "neutral";
  const dark = surfaceTone === "dark";
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]",
        dark && tone === "amber" && "bg-amber-400/15 text-amber-200",
        dark && tone === "sky" && "bg-sky-400/15 text-sky-200",
        dark && tone === "emerald" && "bg-emerald-400/15 text-emerald-200",
        dark && tone === "neutral" && "bg-white/[0.08] text-zinc-300",
        !dark && tone === "amber" && "bg-amber-100 text-amber-900",
        !dark && tone === "sky" && "bg-sky-100 text-sky-900",
        !dark && tone === "emerald" && "bg-emerald-100 text-emerald-800",
        !dark && tone === "neutral" && "bg-neutral-100 text-neutral-700",
      )}
    >
      {supportTicketStatusLabel(status, locale)}
    </span>
  );
}
