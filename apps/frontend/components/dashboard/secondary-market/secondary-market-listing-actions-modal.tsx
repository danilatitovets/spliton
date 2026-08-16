"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { cn } from "@/lib/utils";

type SecondaryMarketListingActionsTriggerProps = {
  compactTrigger?: boolean;
  disabled?: boolean;
  onOpen: () => void;
};

/** Opens the unified lot purchase flow at the actions step (parent owns the dialog). */
export function SecondaryMarketListingActionsTrigger({
  compactTrigger = false,
  disabled = false,
  onOpen,
}: SecondaryMarketListingActionsTriggerProps) {
  const { t } = useI18n();

  return (
    <SplitonCtaPill
      type="button"
      tone="onDark"
      disabled={disabled}
      onClick={onOpen}
      className={cn(
        "shrink-0 whitespace-nowrap",
        compactTrigger
          ? "h-8 gap-1.5 pl-3 pr-1 text-[11px] font-medium tracking-[-0.01em] [&>span:last-child]:size-6 [&>span:last-child>svg]:size-3"
          : "h-9 gap-2 pl-3.5 pr-1 text-[12px] font-medium tracking-[-0.01em] [&>span:last-child]:size-7 [&>span:last-child>svg]:size-3.5",
        disabled && "cursor-not-allowed opacity-40 hover:bg-white",
      )}
    >
      {disabled ? t("secondaryMarket.listings.unavailable") : t("secondaryMarket.actions.actions")}
    </SplitonCtaPill>
  );
}

/** @deprecated Use SecondaryMarketListingActionsTrigger + SecondaryMarketLotPurchaseFlowDialog */
export const SecondaryMarketListingActionsModal = SecondaryMarketListingActionsTrigger;
