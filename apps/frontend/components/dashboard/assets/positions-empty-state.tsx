"use client";

import { AssetsEmptyIllustration } from "@/components/dashboard/assets/assets-empty-illustration";
import { useI18n } from "@/components/providers/i18n-provider";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { ROUTES } from "@/constants/routes";

export function PositionsEmptyState() {
  const { t } = useI18n();

  return (
    <section className="py-12 text-center sm:py-14">
      <AssetsEmptyIllustration situation="portfolioEmpty" size="lg" />
      <p className="mt-5 text-xl font-semibold text-neutral-900">{t("positions.empty.inReleases")}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm text-neutral-500">{t("positions.empty.tableHint")}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <SplitonCtaPill href={`${ROUTES.dashboardPayouts}/deposit`} tone="onLight">
          {t("activity.depositUsdt")}
        </SplitonCtaPill>
        <SplitonCtaPill href={ROUTES.dashboardCatalog} tone="onLight" variant="ghost" withArrow={false}>
          {t("positions.openCatalog")}
        </SplitonCtaPill>
      </div>
    </section>
  );
}
