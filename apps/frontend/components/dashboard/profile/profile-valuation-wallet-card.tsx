"use client";

import { useCallback, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";

import { useI18n } from "@/components/providers/i18n-provider";
import CursorWanderCard from "@/components/ui/cursor-wander-card";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { cn } from "@/lib/utils";

type ProfileValuationWalletCardProps = {
  holderName: string;
  holderEmail?: string | null;
  holderId?: string | null;
  balanceLabel: string;
  balanceValue: string;
  balanceHidden?: boolean;
  className?: string;
};

export function ProfileValuationWalletCard({
  holderName,
  holderEmail = null,
  holderId = null,
  balanceLabel,
  balanceValue,
  balanceHidden = false,
  className,
}: ProfileValuationWalletCardProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const displayValue = balanceHidden ? "••••••" : balanceValue;

  const handleShare = useCallback(async () => {
    const shareText = t("profile.overview.cardShareText")
      .replace("{balance}", displayValue)
      .replace("{name}", holderName);
    const shareData = {
      title: t("profile.overview.cardPreviewTitle"),
      text: shareText,
    };

    try {
      if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      /* cancelled */
    }

    await copyTextToClipboard(shareText);
  }, [displayValue, holderName, t]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "shrink-0 text-[13px] font-medium text-white/65 underline-offset-4 transition hover:text-white hover:underline",
          className,
        )}
      >
        {t("profile.overview.cardViewLink")}
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-[120] bg-black/84 backdrop-blur-md transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
          <Dialog.Popup
            className={cn(
              "fixed inset-0 z-[121] flex items-center justify-center overflow-y-auto border-0 bg-transparent p-4 shadow-none outline-none ring-0",
              "transition duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
            )}
          >
            <Dialog.Title className="sr-only">{t("profile.overview.cardPreviewTitle")}</Dialog.Title>
            <Dialog.Description className="sr-only">{t("profile.overview.cardPreviewDescription")}</Dialog.Description>

            <div className="my-auto flex w-full max-w-[580px] flex-col items-center py-2">
            <CursorWanderCard
              interactive
              showControls
              width="min(100%, 580px)"
              cardholderName={holderName}
              holderEmail={holderEmail}
              holderId={holderId}
              networkLabel="USDT"
              paymentLabel={balanceLabel}
              paymentValue={displayValue}
              tierLabel={t("profile.overview.cardTierLabel")}
              loyaltyLabel={t("profile.overview.cardLoyaltyLabel")}
              onClose={() => setOpen(false)}
              onShare={handleShare}
              flipBackLabel={t("profile.overview.cardFlipBack")}
              flipFrontLabel={t("profile.overview.cardFlipFront")}
              shareLabel={t("profile.overview.cardShare")}
              closeLabel={t("actions.dismiss")}
              copyIdLabel={t("profile.overview.copyId")}
              emailLabel={t("profile.overview.cardEmailLabel")}
              idLabel={t("profile.overview.identity.idPrefix")}
              className="max-w-none"
            />
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
