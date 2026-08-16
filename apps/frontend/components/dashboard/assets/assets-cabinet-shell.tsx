"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AssetsSectionNav } from "@/components/dashboard/assets/assets-section-nav";
import { PayoutsSectionHeader } from "@/components/dashboard/assets/payouts-section-header";
import { DashboardCabinetHeaderStack } from "@/components/layout/dashboard-cabinet-header-stack";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const assetsContentClass =
  "mx-auto w-full max-w-[1200px] px-4 pb-5 pt-3 sm:px-6 sm:pt-4 lg:px-8 [--assets-sticky-offset:7rem]";

function resolveAssetsSubheader(pathname: string): ReactNode | undefined {
  const p = pathname.replace(/\/$/, "") || "/";

  if (p === ROUTES.dashboardPayouts || p.startsWith(`${ROUTES.dashboardPayouts}/`)) {
    return <PayoutsSectionHeader />;
  }

  if (
    p === ROUTES.dashboardOverview ||
    p.startsWith(`${ROUTES.dashboardOverview}/`) ||
    p === ROUTES.dashboardMetrics ||
    p.startsWith(`${ROUTES.dashboardMetrics}/`) ||
    p === ROUTES.dashboardActivity ||
    p.startsWith(`${ROUTES.dashboardActivity}/`) ||
    p === ROUTES.dashboardPositions ||
    p.startsWith(`${ROUTES.dashboardPositions}/`) ||
    p.startsWith(`${ROUTES.myAssetsSellUnits}/`)
  ) {
    return <AssetsSectionNav />;
  }

  return undefined;
}

/**
 * Persistent assets chrome: header mounts once so tab switches do not remount
 * megamenus / wallet / auth UI (that was making transitions feel multi-second).
 */
export function AssetsCabinetShell({
  children,
  contentClassName,
}: {
  children: ReactNode;
  contentClassName?: string;
}) {
  const pathname = usePathname() ?? "";
  const p = pathname.replace(/\/$/, "") || "/";
  const fullBleed =
    p === ROUTES.assetsUnt ||
    p.startsWith(`${ROUTES.assetsUnt}/`) ||
    (p.startsWith(`${ROUTES.dashboardPositions}/`) && p !== ROUTES.dashboardPositions);
  const subheader = fullBleed ? undefined : resolveAssetsSubheader(pathname);

  return (
    <div className="[--dashboard-header-h:3rem] sm:[--dashboard-header-h:3.5rem] xl:[--dashboard-header-h:4rem]">
      <DashboardCabinetHeaderStack subheader={subheader} />
      {fullBleed ? (
        children
      ) : (
        <div className={cn(assetsContentClass, contentClassName)}>{children}</div>
      )}
    </div>
  );
}