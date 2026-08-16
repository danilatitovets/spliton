"use client";

import { MoreHorizontal } from "@/lib/lucide";
import { useEffect, useId, useRef, useState } from "react";

import { useI18n } from "@/components/providers/i18n-provider";
import { formatUsdtAmount } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";
import type { WalletSummary } from "@/services/wallet.service";

function parseMoney(raw: string | undefined | null): number | null {
  if (raw == null) return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

/** Demo breakdown when live wallet is not loaded — matches overview hero mock total. */
const DEMO_WALLET = {
  availableBalance: "286.40",
  lockedBalance: "48.00",
  earnedTotal: "1482.60",
  withdrawnTotal: "1196.20",
} as const;

function formatWalletMetric(
  raw: string | undefined | null,
  locale: Parameters<typeof formatUsdtAmount>[1],
  hidden: boolean,
): string {
  if (hidden) return "••••";
  const n = parseMoney(raw);
  if (n == null) return "0.00";
  return formatUsdtAmount(n, locale);
}

export function WalletBalanceBreakdownPopover({
  walletSummary,
  hidden = false,
  className,
  tone = "onLight",
}: {
  walletSummary?: WalletSummary | null;
  hidden?: boolean;
  className?: string;
  tone?: "onLight" | "onDark";
}) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const onDark = tone === "onDark";

  const source = walletSummary ?? DEMO_WALLET;

  const rows = [
    {
      label: t("assets.overview.walletAvailable"),
      value: formatWalletMetric(source.availableBalance, locale, hidden),
    },
    {
      label: t("assets.overview.walletLocked"),
      value: formatWalletMetric(source.lockedBalance, locale, hidden),
    },
    {
      label: t("assets.overview.walletEarned"),
      value: formatWalletMetric(source.earnedTotal, locale, hidden),
    },
    {
      label: t("assets.overview.walletWithdrawn"),
      value: formatWalletMetric(source.withdrawnTotal, locale, hidden),
    },
  ];

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        aria-label={t("assets.overview.walletBreakdownOpen")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center justify-center rounded-full transition",
          onDark
            ? "size-9 bg-[#2a2a2c] text-white hover:bg-[#343438]"
            : "size-8 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700",
          open && (onDark ? "bg-[#343438]" : "bg-neutral-100 text-neutral-800"),
        )}
      >
        <MoreHorizontal
          className={cn(onDark ? "size-[1.15rem]" : "size-4")}
          strokeWidth={onDark ? 2.25 : 1.75}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className={cn(
            "absolute right-0 top-[calc(100%+0.45rem)] z-40 w-[min(calc(100vw-2rem),16.5rem)] overflow-hidden rounded-2xl p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.28)]",
            onDark
              ? "bg-[#2f2f2f] shadow-[0_16px_48px_rgba(0,0,0,0.55)] ring-1 ring-white/10"
              : "bg-white ring-1 ring-black/5",
          )}
        >
          <ul className="space-y-0.5">
            {rows.map((row) => (
              <li
                key={row.label}
                role="menuitem"
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5",
                  onDark ? "hover:bg-white/[0.06]" : "hover:bg-neutral-50",
                )}
              >
                <span className={cn("text-[13px]", onDark ? "text-white/55" : "text-neutral-500")}>
                  {row.label}
                </span>
                <span
                  className={cn(
                    "font-mono text-[13px] font-semibold tabular-nums tracking-tight",
                    onDark ? "text-white" : "text-neutral-900",
                  )}
                >
                  {row.value}
                  <span className={cn("ml-1 font-sans text-[11px] font-medium", onDark ? "text-white/40" : "text-neutral-400")}>
                    USDT
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
