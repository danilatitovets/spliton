"use client";

import Link from "next/link";
import { ArrowLeft } from "@/lib/lucide";

import { useI18n } from "@/components/providers/i18n-provider";
import { secondaryMarketHref } from "@/constants/dashboard/secondary-market";
import { cn } from "@/lib/utils";

function formatUsdt(n: number) {
  return n.toLocaleString("ru-RU", {
    minimumFractionDigits: n % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

function Stat({
  label,
  value,
  tone = "muted",
  empty,
}: {
  label: string;
  value: string | null;
  tone?: "muted" | "strong" | "soft";
  empty: string;
}) {
  const shown = value ?? empty;
  const isEmpty = value == null;
  return (
    <div className="shrink-0">
      <p className="text-[11px] font-medium text-zinc-500">{label}</p>
      <p
        className={cn(
          "mt-1 font-mono text-[13px] font-semibold tabular-nums",
          isEmpty && "font-sans text-[12px] font-medium text-zinc-500",
          !isEmpty && tone === "strong" && "text-white",
          !isEmpty && tone === "soft" && "text-zinc-300",
          !isEmpty && tone === "muted" && "text-zinc-200",
        )}
      >
        {shown}
      </p>
    </div>
  );
}

export function SecondaryMarketBookWorkspaceHeader({
  symbol,
  track,
  artist,
  last,
  change24hPct,
  high24h,
  low24h,
  volume24hUsdt,
  bid,
  ask,
  bookEmpty,
}: {
  symbol: string;
  track: string;
  artist: string;
  last: number;
  change24hPct: number;
  high24h: number;
  low24h: number;
  volume24hUsdt: number;
  bid: number;
  ask: number;
  bookEmpty?: boolean;
}) {
  const { t } = useI18n();
  const chPos = change24hPct >= 0;
  const emptyLabel = t("secondaryMarket.orderBook.valueUnavailable");

  return (
    <div className="sticky top-0 z-30 -mx-3 border-b border-white/8 bg-black px-3 pb-3.5 pt-2 md:-mx-5 md:px-5">
      <div className="flex items-start gap-3">
        <Link
          href={secondaryMarketHref("market")}
          className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-[#e8e8e8]"
          aria-label={t("secondaryMarket.orderBook.backToMarketAria")}
        >
          <ArrowLeft className="size-5" strokeWidth={2.25} aria-hidden />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[17px] font-semibold tracking-tight text-white sm:text-[18px]">
                {symbol}
                <span className="text-zinc-500">/USDT</span>
              </p>
              <p className="mt-0.5 truncate text-[12px] text-zinc-500">
                {track}
                {artist ? ` · ${artist}` : ""}
              </p>
            </div>
            <div className="shrink-0 text-right">
              {last > 0 ? (
                <>
                  <p className="font-mono text-[20px] font-semibold tabular-nums leading-none tracking-tight text-white">
                    {formatUsdt(last)}
                  </p>
                  <p
                    className={cn(
                      "mt-1 font-mono text-[12px] font-semibold tabular-nums",
                      chPos ? "text-white" : "text-zinc-400",
                    )}
                  >
                    {chPos ? "+" : ""}
                    {change24hPct.toLocaleString("ru-RU", { maximumFractionDigits: 2 })}%
                  </p>
                </>
              ) : (
                <p className="max-w-[9rem] text-right text-[12px] font-medium leading-snug text-zinc-500">
                  {t("secondaryMarket.orderBook.noLastPrice")}
                </p>
              )}
            </div>
          </div>

          <p className="mt-2 text-[12px] leading-relaxed text-zinc-400 sm:text-[13px]">
            {bookEmpty
              ? t("secondaryMarket.orderBook.workspaceGuideEmpty")
              : t("secondaryMarket.orderBook.workspaceGuide")}
          </p>
        </div>
      </div>

      <div className="mt-3.5 flex gap-5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Stat
          label={t("secondaryMarket.orderBook.max24h")}
          value={high24h > 0 ? formatUsdt(high24h) : null}
          empty={emptyLabel}
        />
        <Stat
          label={t("secondaryMarket.orderBook.min24h")}
          value={low24h > 0 ? formatUsdt(low24h) : null}
          empty={emptyLabel}
        />
        <Stat label="Bid" value={bid > 0 ? formatUsdt(bid) : null} empty={emptyLabel} tone="strong" />
        <Stat label="Ask" value={ask > 0 ? formatUsdt(ask) : null} empty={emptyLabel} tone="soft" />
        <Stat
          label={t("secondaryMarket.orderBook.volume24h")}
          value={`${formatUsdt(volume24hUsdt)} USDT`}
          empty={emptyLabel}
        />
      </div>
    </div>
  );
}
