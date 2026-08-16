"use client";

import { useMemo } from "react";

import { useI18n } from "@/components/providers/i18n-provider";
import { ProductDemoBanner } from "@/components/shared/product-demo-banner";
import { usePublicPlatformFees } from "@/hooks/use-public-platform-fees";
import { cn } from "@/lib/utils";

export function FeesLiveRatesBanner() {
  const { t } = useI18n();
  const { live, fees, loading, error } = usePublicPlatformFees();

  const text = useMemo(() => {
    if (!live) {
      return null;
    }
    if (loading) return t("fees.banner.loading");
    if (error) return error;
    if (!fees) return null;
    return t("fees.banner.liveSummary")
      .replace("{primary}", fees.primaryPurchaseFeePct)
      .replace("{secondary}", fees.secondaryMarketFeePct)
      .replace("{withdraw}", fees.withdrawalFeeFixedUsdt);
  }, [error, fees, live, loading, t]);

  if (!live) {
    return (
      <ProductDemoBanner
        messageKey="fees.banner.demo"
        className="border-b border-neutral-200/80 pb-4 text-sm leading-relaxed text-neutral-600"
      />
    );
  }

  // Avoid a second loading strip while the main fees panel is still loading.
  if (loading || !text) return null;

  return (
    <p
      className={cn(
        "border-b border-neutral-200/80 pb-4 text-sm leading-relaxed",
        error ? "text-rose-700" : "text-neutral-600",
      )}
    >
      {text}
      {fees?.disclaimer ? ` ${fees.disclaimer}` : null}
    </p>
  );
}
