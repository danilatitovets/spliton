"use client";

import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  XCircle,
} from "@/lib/lucide";

import { SplitonLoader } from "@/components/ui/spliton-loader";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { secondaryMarketHref } from "@/constants/dashboard/secondary-market";
import { analyticsReleaseDetailPath, secondaryMarketListingInfoPath } from "@/constants/routes";
import { tf } from "@/lib/i18n/financial-messages";
import type { AdaptedListing } from "@/lib/secondary-market/secondary-market-adapter";
import type { LotPurchaseFailedKind } from "@/lib/secondary-market/classify-lot-purchase-error";
import { formatUsdtRu } from "@/lib/wallet/format-money";
import type { BuyTradeResult, FeePreviewDto } from "@/services/secondary-market.service";

import { BreakdownRow } from "./secondary-market-lot-purchase-breakdown";
import {
  failedBodyKey,
  failedTitleKey,
  formatLotMessage,
  LOT_PURCHASE_DEPOSIT_PATH,
} from "./secondary-market-lot-purchase-flow-utils";

type TFn = (key: string) => string;

function LotNavLink({
  children,
  href,
  onClick,
  scroll,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  scroll?: boolean;
}) {
  const className =
    "group flex h-12 w-full items-center justify-between gap-3 px-4 text-left text-[13px] font-medium tracking-[-0.01em] text-white/85 transition hover:bg-white/[0.04] hover:text-white";

  if (href) {
    return (
      <Link href={href} scroll={scroll} className={className} onClick={onClick}>
        <span className="min-w-0 truncate">{children}</span>
        <ChevronRight
          className="size-4 shrink-0 text-zinc-600 transition group-hover:text-zinc-400"
          strokeWidth={1.75}
          aria-hidden
        />
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      <span className="min-w-0 truncate">{children}</span>
      <ChevronRight
        className="size-4 shrink-0 text-zinc-600 transition group-hover:text-zinc-400"
        strokeWidth={1.75}
        aria-hidden
      />
    </button>
  );
}

type ActionsScreenProps = {
  t: TFn;
  listing: AdaptedListing;
  feePreview: FeePreviewDto | null;
  feeLoading: boolean;
  feeError: string | null;
  walletBalance: string | null;
  walletLoading: boolean;
  walletError: string | null;
  canBuy: boolean;
  previewBlocking: boolean;
  bookId: string | null;
  onBuyClick: () => void;
  onOpenOrderBook: () => void;
  onClose: () => void;
  /** Primary CTA rendered in the sheet footer instead. */
  hidePrimaryCta?: boolean;
};

export function LotPurchaseActionsScreen({
  t,
  listing,
  feePreview,
  feeLoading,
  feeError,
  walletBalance,
  walletLoading,
  walletError,
  canBuy,
  previewBlocking,
  bookId,
  onBuyClick,
  onOpenOrderBook,
  onClose,
  hidePrimaryCta = false,
}: ActionsScreenProps) {
  const previewBusy = feeLoading || walletLoading;
  const priceLabel = formatUsdtRu(String(listing.pricePerUnit)).replace(/ USDT$/, "");

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl bg-white/[0.035] ring-1 ring-white/[0.08]">
        <div className="border-b border-white/[0.06] px-4 py-3.5">
          <p className="font-mono text-[12px] tabular-nums text-zinc-500">
            {tf(t("secondaryMarket.lotPurchase.summaryLine"), {
              units: String(listing.unitsAvailable),
              price: priceLabel,
            })}
          </p>
        </div>

        <dl className="space-y-0 px-4 py-2">
          <BreakdownRow
            label={t("secondaryMarket.lotPurchase.lotGross")}
            value={formatUsdtRu(feePreview?.grossAmount ?? String(listing.listingValueUsdt))}
          />
          {feePreview ? (
            <BreakdownRow
              label={formatLotMessage(t("secondaryMarket.lotPurchase.feeLine"), { pct: feePreview.feePct })}
              value={formatUsdtRu(feePreview.feeAmount)}
            />
          ) : null}
          <div className="border-t border-white/[0.06] pt-1">
            <BreakdownRow
              label={t("secondaryMarket.lotPurchase.buyerTotal")}
              value={formatUsdtRu(feePreview?.buyerTotal ?? String(listing.listingValueUsdt))}
              highlight
            />
          </div>
          {walletBalance != null ? (
            <BreakdownRow
              label={t("secondaryMarket.lotPurchase.walletAvailable")}
              value={formatUsdtRu(walletBalance)}
            />
          ) : null}
        </dl>

        <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex size-5 overflow-hidden rounded-full bg-[#26A17B]/20 ring-1 ring-[#26A17B]/30">
              <Image src="/images/currency/usdt.svg" alt="" width={20} height={20} className="object-contain p-0.5" />
            </span>
            <span className="text-[11px] font-medium text-zinc-500">USDT</span>
          </div>
          {previewBusy ? (
            <div className="flex items-center gap-2 text-white/35" aria-busy="true">
              <SplitonLoader size="xxs" variant="light" />
            </div>
          ) : null}
        </div>

        {feeError ? (
          <p className="mx-4 mb-3 rounded-xl bg-rose-500/10 px-3 py-2 text-[11px] leading-relaxed text-rose-200" role="alert">
            {feeError}
          </p>
        ) : null}
        {walletError ? (
          <p className="mx-4 mb-3 rounded-xl bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-100" role="alert">
            {walletError}
          </p>
        ) : null}
      </section>

      {!hidePrimaryCta ? (
        canBuy ? (
          <SplitonCtaPill
            type="button"
            tone="onDark"
            disabled={previewBlocking || !feePreview}
            onClick={onBuyClick}
            className="h-11 w-full justify-between gap-3 pl-5 pr-1.5 text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-45"
          >
            {t("secondaryMarket.listings.buyLot")}
          </SplitonCtaPill>
        ) : (
          <p className="rounded-2xl bg-white/[0.04] px-4 py-3 text-[12px] leading-relaxed text-zinc-500 ring-1 ring-white/[0.06]" role="status">
            {t("secondaryMarket.lotPurchase.cannotBuyNote")}
          </p>
        )
      ) : null}

      <nav className="overflow-hidden rounded-2xl ring-1 ring-white/[0.08]" aria-label={t("secondaryMarket.lotPurchase.actionsTitle")}>
        {bookId ? (
          <LotNavLink onClick={onOpenOrderBook}>{t("secondaryMarket.actions.openOrderBook")}</LotNavLink>
        ) : (
          <LotNavLink href={secondaryMarketHref("market")} onClick={onClose}>
            {t("secondaryMarket.trade.openMarket")}
          </LotNavLink>
        )}
        <div className="mx-4 h-px bg-white/[0.06]" aria-hidden />
        <LotNavLink
          href={`${analyticsReleaseDetailPath(listing.analyticsCatalogId)}?from=secondary`}
          scroll={false}
          onClick={onClose}
        >
          {t("secondaryMarket.actions.openRelease")}
        </LotNavLink>
        <div className="mx-4 h-px bg-white/[0.06]" aria-hidden />
        <LotNavLink href={secondaryMarketListingInfoPath(listing.id)} onClick={onClose}>
          {t("secondaryMarket.listingDetail.moreAboutLot")}
        </LotNavLink>
      </nav>
    </div>
  );
}

type ConfirmScreenProps = {
  t: TFn;
  listing: AdaptedListing;
  feePreview: FeePreviewDto | null;
  walletBalance: string | null;
  walletLoading: boolean;
  feeError: string | null;
  walletError: string | null;
  hasInsufficientFunds: boolean;
  balanceAfter: number | null;
  onClose: () => void;
};

export function LotPurchaseConfirmScreen({
  t,
  listing,
  feePreview,
  walletBalance,
  walletLoading,
  feeError,
  walletError,
  hasInsufficientFunds,
  balanceAfter,
  onClose,
}: ConfirmScreenProps) {
  const showInsufficientWarning = hasInsufficientFunds && walletBalance != null;

  return (
    <div className="space-y-4">
      <dl className="overflow-hidden rounded-2xl bg-white/[0.035] px-4 py-2 ring-1 ring-white/[0.08]">
        <BreakdownRow label={t("secondaryMarket.lotPurchase.summaryUnits")} value={listing.unitsAvailable} />
        <BreakdownRow
          label={t("secondaryMarket.listingDetail.pricePerUnit")}
          value={formatUsdtRu(String(listing.pricePerUnit))}
        />
        <BreakdownRow
          label={t("secondaryMarket.lotPurchase.lotGross")}
          value={formatUsdtRu(feePreview?.grossAmount ?? String(listing.listingValueUsdt))}
        />
        <BreakdownRow
          label={formatLotMessage(t("secondaryMarket.lotPurchase.feeLine"), { pct: feePreview?.feePct ?? "-" })}
          value={formatUsdtRu(feePreview?.feeAmount ?? "0")}
        />
        <div className="border-t border-white/[0.06] pt-1">
          <BreakdownRow
            label={t("secondaryMarket.lotPurchase.buyerTotal")}
            value={formatUsdtRu(feePreview?.buyerTotal ?? String(listing.listingValueUsdt))}
            highlight
          />
        </div>
        <BreakdownRow
          label={t("secondaryMarket.lotPurchase.walletAvailable")}
          value={
            walletLoading
              ? t("secondaryMarket.lotPurchase.walletLoading")
              : walletBalance != null
                ? formatUsdtRu(walletBalance)
                : "-"
          }
        />
        {balanceAfter != null && !hasInsufficientFunds ? (
          <BreakdownRow
            label={t("secondaryMarket.lotPurchase.balanceAfter")}
            value={formatUsdtRu(String(Math.max(0, balanceAfter)))}
          />
        ) : null}
      </dl>

      <p className="text-[11px] leading-relaxed text-zinc-500">
        {t("secondaryMarket.listings.confirmPurchaseNote")}
      </p>

      {feeError ? (
        <p className="rounded-xl bg-rose-500/10 px-3 py-2.5 text-[12px] text-rose-200" role="alert">
          {feeError}
        </p>
      ) : null}
      {walletError ? (
        <p className="rounded-xl bg-amber-500/10 px-3 py-2.5 text-[12px] text-amber-100" role="alert">
          {walletError}
        </p>
      ) : null}

      {showInsufficientWarning ? (
        <div className="rounded-xl bg-amber-500/12 px-4 py-3.5 ring-1 ring-amber-400/20" role="alert">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-300" aria-hidden />
            <div>
              <p className="text-[13px] font-semibold text-amber-50">
                {t("secondaryMarket.lotPurchase.insufficientFundsTitle")}
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-amber-100/90">
                {tf(t("secondaryMarket.lotPurchase.insufficientFundsBody"), {
                  total: formatUsdtRu(feePreview?.buyerTotal ?? String(listing.listingValueUsdt)),
                  balance: formatUsdtRu(walletBalance),
                })}
              </p>
              <Link
                href={LOT_PURCHASE_DEPOSIT_PATH}
                onClick={onClose}
                className="mt-3 inline-flex h-10 items-center justify-center rounded-full bg-amber-400 px-4 text-[12px] font-semibold text-black transition hover:bg-amber-300"
              >
                {t("secondaryMarket.lotPurchase.topUpWallet")}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function LotPurchaseProcessingScreen({ t }: { t: TFn }) {
  return (
    <div className="flex flex-col items-center px-2 py-10 text-center" role="status" aria-live="polite">
      <SplitonLoader size="xl" variant="light" labelKey="secondaryMarket.lotPurchase.processingTitle" />
      <p className="mt-6 text-base font-semibold text-white">{t("secondaryMarket.lotPurchase.processingTitle")}</p>
      <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-zinc-500">
        {t("secondaryMarket.lotPurchase.processingBody")}
      </p>
    </div>
  );
}

export function LotPurchaseSuccessScreen({
  t,
  buyResult,
  receiptError,
}: {
  t: TFn;
  buyResult: BuyTradeResult;
  receiptError: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-white" aria-hidden />
        <div>
          <p className="text-[15px] font-semibold text-white">{t("secondaryMarket.lotPurchase.successTitle")}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
            {t("secondaryMarket.lotPurchase.successBody")}
          </p>
        </div>
      </div>
      <dl className="overflow-hidden rounded-2xl bg-white/[0.035] px-4 py-2 font-mono text-[12px] ring-1 ring-white/[0.08]">
        <BreakdownRow label={t("secondaryMarket.lotPurchase.unitsBought")} value={buyResult.units} />
        <BreakdownRow label={t("secondaryMarket.lotPurchase.debited")} value={formatUsdtRu(buyResult.grossAmount)} />
        <BreakdownRow label={t("secondaryMarket.lotPurchase.feeCharged")} value={formatUsdtRu(buyResult.feeAmount)} />
        <BreakdownRow label={t("secondaryMarket.lotPurchase.tradeId")} value={buyResult.tradeId} />
      </dl>
      {receiptError ? (
        <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200" role="alert">
          {receiptError}
        </p>
      ) : null}
    </div>
  );
}

export function LotPurchaseFailedScreen({
  t,
  failedKind,
  listing,
  feePreview,
  walletBalance,
}: {
  t: TFn;
  failedKind: LotPurchaseFailedKind;
  listing: AdaptedListing;
  feePreview: FeePreviewDto | null;
  walletBalance: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <XCircle className="mt-0.5 size-6 shrink-0 text-rose-400" aria-hidden />
        <div>
          <p className="text-[15px] font-semibold text-white">{t(failedTitleKey(failedKind))}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
            {failedKind === "insufficient_funds" && walletBalance != null
              ? tf(t("secondaryMarket.lotPurchase.insufficientFundsBody"), {
                  total: formatUsdtRu(feePreview?.buyerTotal ?? String(listing.listingValueUsdt)),
                  balance: formatUsdtRu(walletBalance),
                })
              : t(failedBodyKey(failedKind))}
          </p>
        </div>
      </div>
    </div>
  );
}
