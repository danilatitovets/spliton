"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import type { DialogRoot } from "@base-ui/react/dialog";
import { X } from "@/lib/lucide";

import { useI18n } from "@/components/providers/i18n-provider";
import { LegalConsentModal } from "@/components/compliance/legal-consent-modal";
import { LegalConsentGateAlert } from "@/components/compliance/legal-consent-gate-alert";
import { EligibilityNotice } from "@/components/compliance/eligibility-notice";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { useLegalConsentGate } from "@/hooks/use-legal-consent-gate";
import { secondaryMarketBookHref } from "@/constants/dashboard/secondary-market";
import { ROUTES } from "@/constants/routes";
import { useApiErrorMessage } from "@/hooks/use-api-error-message";
import type { AdaptedListing } from "@/lib/secondary-market/secondary-market-adapter";
import {
  classifyLotPurchaseError,
  type LotPurchaseFailedKind,
} from "@/lib/secondary-market/classify-lot-purchase-error";
import { cn } from "@/lib/utils";
import {
  downloadTradeReceipt,
  fetchFeePreview,
  type BuyTradeResult,
  type FeePreviewDto,
} from "@/services/secondary-market.service";
import { saveBlob } from "@/services/documents.service";
import { fetchWalletSummary } from "@/services/wallet.service";

import {
  LotPurchaseActionsScreen,
  LotPurchaseConfirmScreen,
  LotPurchaseFailedScreen,
  LotPurchaseProcessingScreen,
  LotPurchaseSuccessScreen,
} from "./secondary-market-lot-purchase-flow-screens";
import {
  failedTitleKey,
  LOT_PURCHASE_DEPOSIT_PATH,
  type AuthorizedFetch,
  type LotPurchaseStep,
} from "./secondary-market-lot-purchase-flow-utils";

const LOT_ACTIONS_HEADER_VIDEO = "/videos/position-holding-bg.mp4";

export type SecondaryMarketLotPurchaseFlowDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: AdaptedListing | null;
  bookId: string | null;
  canBuy: boolean;
  authorizedFetch: AuthorizedFetch;
  onBuy: (listingId: string) => Promise<BuyTradeResult>;
  onReloadListings?: () => void | Promise<void>;
  /** Live secondary trade — enables SECONDARY_TRADE legal consent gate (same as order book). */
  consentEnabled?: boolean;
};

export function SecondaryMarketLotPurchaseFlowDialog({
  open,
  onOpenChange,
  listing,
  bookId,
  canBuy,
  authorizedFetch,
  onBuy,
  onReloadListings,
  consentEnabled = false,
}: SecondaryMarketLotPurchaseFlowDialogProps) {
  const router = useRouter();
  const { t } = useI18n();
  const consentGate = useLegalConsentGate("SECONDARY_TRADE", consentEnabled);
  const { messageWithMeta } = useApiErrorMessage();
  const closeRef = React.useRef<HTMLButtonElement>(null);

  const [step, setStep] = React.useState<LotPurchaseStep>("actions");
  const [feePreview, setFeePreview] = React.useState<FeePreviewDto | null>(null);
  const [feeLoading, setFeeLoading] = React.useState(false);
  const [feeError, setFeeError] = React.useState<string | null>(null);
  const [walletBalance, setWalletBalance] = React.useState<string | null>(null);
  const [walletLoading, setWalletLoading] = React.useState(false);
  const [walletError, setWalletError] = React.useState<string | null>(null);
  const [buyResult, setBuyResult] = React.useState<BuyTradeResult | null>(null);
  const [failedKind, setFailedKind] = React.useState<LotPurchaseFailedKind>("generic");
  const [receiptError, setReceiptError] = React.useState<string | null>(null);

  const resetFlow = React.useCallback(() => {
    setStep("actions");
    setFeePreview(null);
    setFeeLoading(false);
    setFeeError(null);
    setWalletBalance(null);
    setWalletLoading(false);
    setWalletError(null);
    setBuyResult(null);
    setFailedKind("generic");
    setReceiptError(null);
  }, []);

  const loadPreviewData = React.useCallback(async () => {
    if (!listing) return;
    setFeeLoading(true);
    setWalletLoading(true);
    setFeeError(null);
    setWalletError(null);

    await Promise.all([
      fetchFeePreview(authorizedFetch, { listingId: listing.id })
        .then(setFeePreview)
        .catch(() => {
          setFeePreview(null);
          setFeeError(t("secondaryMarket.lotPurchase.feePreviewError"));
        })
        .finally(() => setFeeLoading(false)),
      fetchWalletSummary(authorizedFetch)
        .then((summary) => setWalletBalance(summary.availableBalance))
        .catch(() => {
          setWalletBalance(null);
          setWalletError(t("secondaryMarket.lotPurchase.walletCheckError"));
        })
        .finally(() => setWalletLoading(false)),
    ]);
  }, [authorizedFetch, listing, t]);

  React.useEffect(() => {
    if (!open || !listing) return;
    resetFlow();
    void loadPreviewData();
  }, [open, listing, listing?.id, loadPreviewData, resetFlow]);

  const buyerTotal = feePreview ? Number(feePreview.buyerTotal) : Number(listing?.listingValueUsdt ?? 0);
  const walletAvailable = walletBalance != null ? Number(walletBalance) : null;
  const balanceAfter =
    walletAvailable != null && Number.isFinite(buyerTotal) ? walletAvailable - buyerTotal : null;

  const hasInsufficientFunds =
    walletAvailable != null &&
    Number.isFinite(buyerTotal) &&
    buyerTotal > 0 &&
    walletAvailable < buyerTotal;

  const previewBlocking = Boolean(feeError || walletError || feeLoading || walletLoading);
  const confirmDisabled =
    previewBlocking ||
    hasInsufficientFunds ||
    !feePreview ||
    walletAvailable == null ||
    consentGate.hasBlockingEligibility ||
    (consentEnabled && (consentGate.isChecking || consentGate.checkError));

  const handleOpenChange = (next: boolean, eventDetails?: DialogRoot.ChangeEventDetails) => {
    if (!next && step === "processing") {
      eventDetails?.preventUnmountOnClose?.();
      return;
    }
    if (!next) {
      resetFlow();
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    if (step === "processing") return;
    resetFlow();
    onOpenChange(false);
  };

  const handleConfirmPurchase = async () => {
    if (!listing || confirmDisabled) return;
    setStep("processing");
    try {
      const result = await onBuy(listing.id);
      setBuyResult(result);
      setStep("success");
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[lot-purchase]", err);
      }
      const meta = messageWithMeta(err);
      setFailedKind(classifyLotPurchaseError(meta.code));
      setStep("failed");
    }
  };

  const handleConfirmClick = () => {
    if (confirmDisabled) return;
    const run = () => void handleConfirmPurchase();
    if (!consentEnabled) {
      run();
      return;
    }
    consentGate.requestProceed(run);
  };

  const handleRefreshLot = async () => {
    await loadPreviewData();
    void onReloadListings?.();
    setStep("actions");
  };

  const handleRetry = () => {
    if (failedKind === "network") {
      void handleConfirmPurchase();
      return;
    }
    void handleRefreshLot();
  };

  const handleOpenOrderBook = () => {
    if (!bookId) return;
    handleClose();
    router.replace(secondaryMarketBookHref(bookId), { scroll: false });
  };

  if (!listing) return null;

  const stepTitle =
    step === "actions"
      ? t("secondaryMarket.lotPurchase.actionsTitle")
      : step === "confirm"
        ? t("secondaryMarket.lotPurchase.confirmTitle")
        : step === "processing"
          ? t("secondaryMarket.lotPurchase.processingTitle")
          : step === "success"
            ? t("secondaryMarket.lotPurchase.successTitle")
            : t(failedTitleKey(failedKind));

  return (
    <>
    <Dialog.Root open={open} onOpenChange={handleOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-127 bg-black/75 backdrop-blur-[3px]",
            "transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0",
          )}
        />
        <Dialog.Popup
          initialFocus={closeRef}
          className={cn(
            "fixed z-128 flex flex-col bg-[#0a0a0a] text-white",
            "shadow-[-24px_0_80px_rgba(0,0,0,0.55)]",
            "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "inset-y-0 right-0 max-h-dvh w-[min(100vw,420px)] rounded-none rounded-l-2xl",
            "data-starting-style:translate-x-full data-ending-style:translate-x-full",
          )}
        >
          <div className="relative isolate shrink-0 overflow-hidden border-b border-white/[0.06]">
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <video
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-55 blur-[10px] motion-reduce:hidden"
                src={LOT_ACTIONS_HEADER_VIDEO}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-[#0a0a0a]" />
            </div>
            <div className="relative z-10 flex items-start justify-between gap-3 px-5 pb-4 pt-5 md:px-6">
              <div className="min-w-0 pr-2">
                <Dialog.Title className="text-[17px] font-semibold tracking-tight text-white md:text-lg">
                  {stepTitle}
                </Dialog.Title>
                {step === "actions" || step === "confirm" ? (
                  <Dialog.Description className="mt-1 truncate text-[12px] text-white/55 md:text-[13px]">
                    {listing.track} · {listing.symbol}
                  </Dialog.Description>
                ) : null}
              </div>
              {step !== "processing" ? (
                <button
                  ref={closeRef}
                  type="button"
                  aria-label={t("secondaryMarket.aria.close")}
                  onClick={handleClose}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-black/35 text-zinc-300 backdrop-blur-sm transition hover:border-white/25 hover:bg-black/50 hover:text-white"
                >
                  <X className="size-4" strokeWidth={1.75} />
                </button>
              ) : (
                <span className="size-9 shrink-0" aria-hidden />
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 [scrollbar-width:none] [-ms-overflow-style:none] md:px-6 [&::-webkit-scrollbar]:hidden">
            {step === "actions" ? (
              <LotPurchaseActionsScreen
                t={t}
                listing={listing}
                feePreview={feePreview}
                feeLoading={feeLoading}
                feeError={feeError}
                walletBalance={walletBalance}
                walletLoading={walletLoading}
                walletError={walletError}
                canBuy={canBuy}
                previewBlocking={previewBlocking}
                bookId={bookId}
                onBuyClick={() => setStep("confirm")}
                onOpenOrderBook={handleOpenOrderBook}
                onClose={handleClose}
                hidePrimaryCta
              />
            ) : null}
            {step === "confirm" ? (
              <LotPurchaseConfirmScreen
                t={t}
                listing={listing}
                feePreview={feePreview}
                walletBalance={walletBalance}
                walletLoading={walletLoading}
                feeError={feeError}
                walletError={walletError}
                hasInsufficientFunds={hasInsufficientFunds}
                balanceAfter={balanceAfter}
                onClose={handleClose}
              />
            ) : null}
            {step === "processing" ? <LotPurchaseProcessingScreen t={t} /> : null}
            {step === "success" && buyResult ? (
              <LotPurchaseSuccessScreen t={t} buyResult={buyResult} receiptError={receiptError} />
            ) : null}
            {step === "failed" ? (
              <LotPurchaseFailedScreen
                t={t}
                failedKind={failedKind}
                listing={listing}
                feePreview={feePreview}
                walletBalance={walletBalance}
              />
            ) : null}
          </div>

          {step === "actions" ? (
            <div className="shrink-0 border-t border-white/[0.06] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6">
              {canBuy ? (
                <SplitonCtaPill
                  type="button"
                  tone="onDark"
                  disabled={previewBlocking || !feePreview}
                  onClick={() => setStep("confirm")}
                  className="h-11 w-full justify-between gap-3 pl-5 pr-1.5 text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {t("secondaryMarket.listings.buyLot")}
                </SplitonCtaPill>
              ) : (
                <p className="rounded-2xl bg-white/[0.04] px-4 py-3 text-[12px] leading-relaxed text-zinc-500 ring-1 ring-white/[0.06]" role="status">
                  {t("secondaryMarket.lotPurchase.cannotBuyNote")}
                </p>
              )}
            </div>
          ) : null}

          {step === "confirm" ? (
            <div className="shrink-0 border-t border-white/[0.06] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6">
              {consentEnabled ? <EligibilityNotice result={consentGate.eligibility} className="mb-3" /> : null}
              {consentEnabled ? <LegalConsentGateAlert gate={consentGate} variant="dark" className="mb-3" /> : null}
              <div className="flex gap-2">
                <button
                  type="button"
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-white/[0.08] px-4 text-[13px] font-medium text-zinc-200 transition hover:bg-white/[0.12]"
                  onClick={() => setStep("actions")}
                >
                  {t("secondaryMarket.lotPurchase.backToLot")}
                </button>
                <SplitonCtaPill
                  type="button"
                  tone="onDark"
                  disabled={confirmDisabled}
                  onClick={handleConfirmClick}
                  className="h-11 min-w-0 flex-[1.35] justify-between gap-2 pl-4 pr-1.5 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {t("secondaryMarket.lotPurchase.confirm")}
                </SplitonCtaPill>
              </div>
            </div>
          ) : null}

          {step === "success" && buyResult ? (
            <div className="shrink-0 border-t border-white/[0.06] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6">
              <div className="flex flex-col gap-2">
                <SplitonCtaPill
                  href={ROUTES.dashboardPositions}
                  tone="onDark"
                  className="h-11 w-full justify-between gap-3 pl-5 pr-1.5 text-[14px] font-semibold"
                >
                  {t("secondaryMarket.lotPurchase.openInPortfolio")}
                </SplitonCtaPill>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-white/[0.08] px-4 text-[12px] font-medium text-zinc-200 transition hover:bg-white/[0.12]"
                    onClick={handleClose}
                  >
                    {t("secondaryMarket.lotPurchase.backToMarket")}
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-white/12 px-4 text-[12px] font-medium text-zinc-300 transition hover:bg-white/[0.05]"
                    onClick={async () => {
                      setReceiptError(null);
                      try {
                        const file = await downloadTradeReceipt(authorizedFetch, buyResult.tradeId);
                        const binary = atob(file.contentBase64);
                        const bytes = new Uint8Array(binary.length);
                        for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
                        saveBlob(new Blob([bytes], { type: file.mimeType }), file.filename);
                      } catch {
                        setReceiptError(t("secondaryMarket.lotPurchase.receiptFailed"));
                      }
                    }}
                  >
                    {t("secondaryMarket.lotPurchase.downloadReceipt")}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {step === "failed" ? (
            <div className="shrink-0 border-t border-white/[0.06] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6">
              <div className="flex flex-col gap-2">
                {failedKind === "insufficient_funds" ? (
                  <SplitonCtaPill
                    href={LOT_PURCHASE_DEPOSIT_PATH}
                    tone="onDark"
                    className="h-11 w-full justify-between gap-3 pl-5 pr-1.5 text-[14px] font-semibold"
                  >
                    {t("secondaryMarket.lotPurchase.topUpWallet")}
                  </SplitonCtaPill>
                ) : null}
                {failedKind === "listing_unavailable" || failedKind === "price_changed" ? (
                  <SplitonCtaPill
                    type="button"
                    tone="onDark"
                    onClick={() => void handleRefreshLot()}
                    className="h-11 w-full justify-between gap-3 pl-5 pr-1.5 text-[14px] font-semibold"
                  >
                    {t("secondaryMarket.lotPurchase.refreshLot")}
                  </SplitonCtaPill>
                ) : null}
                {failedKind === "network" ? (
                  <SplitonCtaPill
                    type="button"
                    tone="onDark"
                    onClick={() => void handleRetry()}
                    className="h-11 w-full justify-between gap-3 pl-5 pr-1.5 text-[14px] font-semibold"
                  >
                    {t("secondaryMarket.lotPurchase.retry")}
                  </SplitonCtaPill>
                ) : null}
                <button
                  type="button"
                  className="inline-flex h-10 w-full items-center justify-center rounded-full bg-white/[0.08] px-5 text-[12px] font-medium text-zinc-200 transition hover:bg-white/[0.12]"
                  onClick={handleClose}
                >
                  {t("secondaryMarket.lotPurchase.backToMarket")}
                </button>
              </div>
            </div>
          ) : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
    {consentEnabled ? (
      <LegalConsentModal
        open={consentGate.consentOpen}
        title={t("secondaryMarket.orderBook.consentTitle")}
        description={t("secondaryMarket.orderBook.consentDescription")}
        items={consentGate.missingItems}
        source="SECONDARY_TRADE"
        authorizedFetch={authorizedFetch}
        onAccepted={consentGate.onConsentAccepted}
        onClose={() => consentGate.dismissConsent()}
      />
    ) : null}
    </>
  );
}
