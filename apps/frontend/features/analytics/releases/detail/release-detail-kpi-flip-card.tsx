"use client";

import { cn } from "@/lib/utils";
import type { ReleaseDetailQuickStat } from "@/types/analytics/release-detail";

function looksLikeAccentValue(value: string): boolean {
  return /USDT|\$|€|%/i.test(value) || /\d/.test(value);
}

/**
 * OKX-style metric card: lime value → white title → muted body.
 * No flip / info icon — explanation lives in the body text.
 */
export function ReleaseDetailKpiFlipCard({
  stat,
  className,
}: {
  stat: ReleaseDetailQuickStat;
  className?: string;
}) {
  const body = (stat.info?.trim() || stat.sub?.trim() || "").trim();
  const accent = looksLikeAccentValue(stat.value);
  const showSubFooter = Boolean(stat.sub?.trim() && stat.info?.trim());

  return (
    <article
      className={cn(
        "flex h-full min-h-0 flex-col rounded-2xl bg-[#171717] px-4 py-4 sm:min-h-[176px] sm:px-6 sm:py-6",
        className,
      )}
    >
      <p
        className={cn(
          "font-mono text-[1.45rem] font-semibold leading-none tracking-tight tabular-nums sm:text-[1.85rem]",
          accent ? "text-[#B7F500]" : "text-white",
        )}
      >
        {stat.value}
      </p>
      <h3 className="mt-3 text-[15px] font-semibold tracking-tight text-white sm:text-base">
        {stat.label}
      </h3>
      {body ? (
        <p className="mt-2 flex-1 text-[13px] leading-relaxed tracking-normal text-white/45">
          {body}
        </p>
      ) : (
        <span className="flex-1" aria-hidden />
      )}
      {showSubFooter ? (
        <p className="mt-3 text-[12px] tracking-normal text-white/35">{stat.sub}</p>
      ) : null}
    </article>
  );
}
