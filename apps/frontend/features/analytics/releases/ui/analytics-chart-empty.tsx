"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

const SPLITON_EMPTY_ICON = "/images/empty-states/release-not-found-icon.png";

export function AnalyticsChartEmpty({
  title,
  body,
  onRetry,
  retryLabel,
  compact = false,
}: {
  title: string;
  body: string;
  onRetry?: () => void;
  retryLabel?: string;
  compact?: boolean;
  /** ignored — Spliton icon only, no OKX/glass plates */
  iconSrc?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "px-3 py-7" : "px-5 py-10",
      )}
    >
      <div className={cn("relative mx-auto", compact ? "size-16" : "size-20")}>
        <Image
          src={SPLITON_EMPTY_ICON}
          alt=""
          fill
          sizes={compact ? "64px" : "80px"}
          className="object-contain"
        />
      </div>
      <p className={cn("font-medium text-white", compact ? "mt-3 text-[13px]" : "mt-4 text-sm")}>{title}</p>
      <p className={cn("max-w-sm leading-relaxed text-zinc-500", compact ? "mt-1 text-[12px]" : "mt-1.5 text-[13px]")}>
        {body}
      </p>
      {onRetry && retryLabel ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 h-9 rounded-md border border-white/25 bg-black px-4 text-[13px] font-medium text-white transition hover:bg-white hover:text-black"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}