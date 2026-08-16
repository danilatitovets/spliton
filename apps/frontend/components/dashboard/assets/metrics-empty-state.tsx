"use client";

import { AssetsEmptyIllustration } from "@/components/dashboard/assets/assets-empty-illustration";
import { assetsMutedCardClass } from "@/components/dashboard/assets/assets-ui";
import { useI18n } from "@/components/providers/i18n-provider";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function MetricsEmptyState() {
  const { t } = useI18n();

  return (
    <section className={cn(assetsMutedCardClass, "py-12 text-center sm:py-14")}>
      <AssetsEmptyIllustration situation="portfolioEmpty" size="lg" />
      <h2 className="mt-5 text-xl font-semibold tracking-tight text-neutral-900">{t("assets.metrics.emptyTitle")}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-500">{t("assets.metrics.emptyBody")}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <SplitonCtaPill href="/assets/payouts/deposit" tone="onLight">
          {t("overview.deposit")}
        </SplitonCtaPill>
        <SplitonCtaPill href={ROUTES.dashboardCatalog} tone="onLight" variant="ghost" withArrow={false}>
          {t("overview.openCatalog")}
        </SplitonCtaPill>
      </div>
    </section>
  );
}
