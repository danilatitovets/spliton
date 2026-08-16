"use client";

import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  ChevronDown,
  Eye,
  EyeOff,
  LayoutGrid,
  type LucideIcon,
} from "@/lib/lucide";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useI18n } from "@/components/providers/i18n-provider";
import { BRAND } from "@/constants/brand";
import { ROUTES } from "@/constants/routes";
import { WalletBalanceBreakdownPopover } from "@/components/dashboard/assets/wallet-balance-breakdown-popover";
import { tf } from "@/lib/i18n/financial-messages";
import { formatNumber, formatUsdtAmount } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";
import type { WalletSummary } from "@/services/wallet.service";

type OverviewHeroProps = {
  live?: boolean;
  totalValueUsdt?: number;
  totalValueUnavailable?: boolean;
  change30dPct?: string | null;
  walletSummary?: WalletSummary | null;
  walletLoading?: boolean;
};

function parseMoney(raw: string | undefined | null): number | null {
  if (raw == null) return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

function computeCombinedTotal(portfolioUsdt: number | undefined, wallet: WalletSummary | null | undefined): number | undefined {
  const portfolio = portfolioUsdt ?? 0;
  const available = parseMoney(wallet?.availableBalance);
  const locked = parseMoney(wallet?.lockedBalance);
  const pending = parseMoney(wallet?.pendingBalance);
  const hasWallet = available != null && locked != null && pending != null;
  const walletTotal = hasWallet ? available + locked + pending : 0;

  if (portfolioUsdt == null && !hasWallet) return undefined;
  return portfolio + walletTotal;
}

export function OverviewHero({
  live = false,
  totalValueUsdt,
  totalValueUnavailable = false,
  change30dPct,
  walletSummary,
  walletLoading = false,
}: OverviewHeroProps) {
  const { t, locale } = useI18n();
  const [hidden, setHidden] = useState(false);

  const useMockDefaults = !live;
  const combinedTotal = useMemo(
    () => computeCombinedTotal(totalValueUsdt, walletSummary),
    [totalValueUsdt, walletSummary],
  );
  const resolvedTotal =
    combinedTotal != null ? combinedTotal : useMockDefaults ? 6520 : undefined;

  const pnlLine = change30dPct != null ? tf(t("overview.pnlTodayWithChange"), { pct: change30dPct }) : t("overview.pnlTodayZero");

  const actions: Array<{ href: string; label: string; shortLabel?: string; icon: LucideIcon }> = [
    { href: "/assets/payouts/deposit", label: t("overview.deposit"), icon: ArrowDownToLine },
    { href: "/assets/payouts/withdraw", label: t("overview.withdraw"), icon: ArrowUpFromLine },
    { href: ROUTES.dashboardSecondaryMarket, label: t("overview.transfer"), icon: ArrowLeftRight },
    {
      href: ROUTES.dashboardCatalog,
      label: t("overview.openCatalog"),
      shortLabel: t("overview.openCatalogShort"),
      icon: LayoutGrid,
    },
  ];

  return (
    <section
      className="relative isolate w-full overflow-hidden rounded-[1.35rem] bg-black px-4 pb-4 pt-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)] sm:rounded-[1.75rem] sm:px-7 sm:pb-6 sm:pt-6"
      aria-label={t("overview.summaryAria")}
    >
      {/* Bank-card brand mark — full word on mobile, not mid-letter clip */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden sm:justify-end"
        aria-hidden
      >
        <p
          className="select-none whitespace-nowrap bg-clip-text font-bold leading-[0.78] tracking-[-0.06em] text-transparent max-sm:translate-y-[-6%] sm:absolute sm:inset-y-0 sm:right-[-6%] sm:left-[20%] sm:flex sm:translate-y-0 sm:items-center sm:justify-end"
          style={{
            fontSize: "clamp(3.4rem, 19vw, 16rem)",
            backgroundImage: "url('/images/landing/footer-spliton-texture-fill-bw.png')",
            backgroundSize: "140% auto",
            backgroundPosition: "48% 42%",
            backgroundRepeat: "no-repeat",
            WebkitTextStroke: "0.5px rgba(255,255,255,0.08)",
          }}
        >
          {BRAND.name}
        </p>
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_12%_18%,rgba(0,0,0,0.62)_0%,rgba(0,0,0,0.22)_44%,rgba(0,0,0,0.58)_100%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-black via-black/75 to-transparent" aria-hidden />

      <div className="relative z-10 flex w-full flex-col">
        {/* Title left · eye + ··· grouped right (Wallet / GPT style) */}
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 flex-1 text-[12px] font-medium leading-snug tracking-[-0.01em] text-white/55 sm:text-sm">
            {t("overview.estimatedTotal")}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setHidden((v) => !v)}
              className="inline-flex size-9 items-center justify-center rounded-full bg-[#2a2a2c] text-white/85 transition hover:bg-[#343438] hover:text-white"
              aria-label={hidden ? t("overview.showBalance") : t("overview.hideBalance")}
            >
              {hidden ? <EyeOff className="size-4" strokeWidth={1.85} aria-hidden /> : <Eye className="size-4" strokeWidth={1.85} aria-hidden />}
            </button>
            <WalletBalanceBreakdownPopover walletSummary={walletSummary} hidden={hidden} tone="onDark" />
          </div>
        </div>

        <div className="mt-4 sm:mt-6">
          <div className="flex flex-wrap items-end gap-x-2 gap-y-0.5">
            {totalValueUnavailable || resolvedTotal == null || walletLoading ? (
              <p className="font-mono text-[2.35rem] font-semibold tabular-nums tracking-tight text-white/40 sm:text-[3.4rem]">
                {walletLoading ? "…" : t("assets.overview.insufficientData")}
              </p>
            ) : (
              <>
                <p className="font-mono text-[2.5rem] font-semibold tabular-nums tracking-tight text-white sm:text-[3.55rem] md:text-[3.75rem]">
                  {hidden ? "••••••" : formatNumber(Math.round(resolvedTotal * 100) / 100, locale)}
                </p>
                <button
                  type="button"
                  className="mb-1.5 inline-flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 text-sm font-semibold text-white/55 transition hover:bg-white/10 hover:text-white/85 sm:mb-2"
                  aria-label="USDT"
                >
                  USDT
                  <ChevronDown className="size-4" strokeWidth={2.25} aria-hidden />
                </button>
              </>
            )}
          </div>

          <p className={cn("mt-1 text-[13px] tabular-nums sm:mt-1.5 sm:text-sm", change30dPct != null && !hidden ? "text-white/70" : "text-white/45")}>
            {hidden ? "••••" : pnlLine}
          </p>

          {live && walletSummary?.availableBalance ? (
            <p className="mt-1 text-xs text-white/40">
              {t("assets.overview.walletAvailable")}:{" "}
              <span className="font-mono font-semibold tabular-nums text-white/75">
                {hidden ? "••••" : formatUsdtAmount(parseMoney(walletSummary.availableBalance) ?? 0, locale)}
              </span>
            </p>
          ) : null}
        </div>

        <div className="mt-5 grid w-full grid-cols-4 gap-1.5 sm:mt-8 sm:gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex min-w-0 flex-col items-center gap-1.5 rounded-[1rem] bg-[#1c1c1e] px-1 py-2.5 transition hover:bg-[#262628] active:scale-[0.98] sm:gap-2 sm:rounded-[1.25rem] sm:px-1.5 sm:py-3.5"
              >
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-[#2c2c2e] text-white transition group-hover:bg-[#353538] sm:size-11">
                  <Icon className="size-4 sm:size-5" strokeWidth={1.9} aria-hidden />
                </span>
                <span className="max-w-full text-center text-[9px] font-medium leading-tight tracking-[-0.01em] text-white/90 sm:text-[12px]">
                  <span className="sm:hidden">{action.shortLabel ?? action.label}</span>
                  <span className="hidden sm:inline">{action.label}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
