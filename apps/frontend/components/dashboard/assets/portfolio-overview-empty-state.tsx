"use client";

import { AssetsEmptyIllustration } from "@/components/dashboard/assets/assets-empty-illustration";
import { assetsMutedCardClass } from "@/components/dashboard/assets/assets-ui";
import { useI18n } from "@/components/providers/i18n-provider";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function PortfolioOverviewEmptyState() {
  const { t } = useI18n();

  return (
    <section className={cn(assetsMutedCardClass, "py-12 text-center sm:py-14")}>
      <div className="mx-auto flex max-w-sm flex-col items-center">
        <AssetsEmptyIllustration situation="portfolioEmpty" size="lg" />
        <h2 className="mt-5 text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">
          {t("assets.overview.portfolioEmptyTitle")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500">
          {t("assets.overview.portfolioEmptyBodyExtended")}
        </p>
        <SplitonCtaPill href="/assets/payouts/deposit" tone="onLight" className="mt-6 w-full max-w-xs">
          {t("overview.deposit")}
        </SplitonCtaPill>
        <SplitonCtaPill
          href={ROUTES.dashboardCatalog}
          tone="onLight"
          variant="ghost"
          withArrow={false}
          className="mt-3"
        >
          {t("overview.openCatalog")}
        </SplitonCtaPill>
      </div>
    </section>
  );
}
