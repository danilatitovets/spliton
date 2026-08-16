"use client";

import Link from "next/link";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useI18n } from "@/components/providers/i18n-provider";
import { ReleaseNotFoundGlassPanel } from "@/components/shared/release-not-found-glass-panel";
import { secondaryMarketHref } from "@/constants/dashboard/secondary-market";
import { ROUTES } from "@/constants/routes";

export type NotFoundVariant =
  | "default"
  | "analyticsRelease"
  | "catalogRelease"
  | "secondaryListing";

type LocalizedNotFoundScreenProps = {
  variant?: NotFoundVariant;
  showHeader?: boolean;
};

export function LocalizedNotFoundScreen({
  variant = "default",
  showHeader = false,
}: LocalizedNotFoundScreenProps) {
  const { t } = useI18n();

  if (variant === "analyticsRelease" || variant === "catalogRelease") {
    const panel = (
      <ReleaseNotFoundGlassPanel
        title={variant === "catalogRelease" ? t("notFound.catalogRelease.title") : t("analytics.detail.notFound")}
        description={
          variant === "catalogRelease"
            ? t("notFound.catalogRelease.description")
            : t("notFound.analyticsRelease.description")
        }
        primaryHref={variant === "catalogRelease" ? ROUTES.catalogMarketOverview : ROUTES.analyticsReleases}
        primaryLabel={
          variant === "catalogRelease" ? t("notFound.catalogRelease.cta") : t("notFound.analyticsRelease.cta")
        }
        secondaryHref={ROUTES.dashboardCatalog}
        secondaryLabel={t("notFound.goCatalog")}
      />
    );

    if (!showHeader) return panel;

    return (
      <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-black text-white">
        <div className="sticky top-0 z-120 shrink-0 bg-black">
          <DashboardHeader sticky />
        </div>
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain" data-mobile-scroll-root>
          {panel}
        </div>
      </div>
    );
  }

  const title =
    variant === "secondaryListing" ? t("notFound.secondaryListing.title") : t("notFound.title");

  const description =
    variant === "secondaryListing"
      ? t("notFound.secondaryListing.description")
      : t("notFound.description");

  const primaryHref =
    variant === "secondaryListing" ? secondaryMarketHref("market") : ROUTES.dashboard;

  const primaryLabel =
    variant === "secondaryListing" ? t("notFound.secondaryListing.cta") : t("notFound.goHome");

  const shellClass =
    variant === "default"
      ? "flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-12 text-center"
      : "mx-auto flex w-full max-w-lg flex-col items-center justify-center px-4 py-8 text-center";

  const content = (
    <div className={shellClass}>
      {variant === "secondaryListing" ? (
        <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
          {t("notFound.secondaryListing.eyebrow")}
        </p>
      ) : null}
      <h1
        className={
          variant === "secondaryListing"
            ? "mt-3 text-xl font-semibold tracking-tight text-white"
            : "text-xl font-semibold text-neutral-900"
        }
      >
        {title}
      </h1>
      <p
        className={
          variant === "default"
            ? "max-w-md text-sm text-neutral-600"
            : "max-w-md text-sm leading-relaxed text-zinc-500 md:text-[15px]"
        }
      >
        {description}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={primaryHref}
          className={
            variant === "secondaryListing"
              ? "mx-auto mt-8 inline-flex h-10 items-center justify-center rounded-full bg-white px-6 text-xs font-semibold text-black hover:opacity-90"
              : "text-sm font-medium text-neutral-900 underline-offset-4 hover:underline"
          }
        >
          {primaryLabel}
        </Link>
        {variant === "default" ? (
          <Link
            href={ROUTES.dashboardCatalog}
            className="text-sm font-medium text-neutral-600 underline-offset-4 hover:underline"
          >
            {t("notFound.goCatalog")}
          </Link>
        ) : null}
      </div>
    </div>
  );

  if (!showHeader) {
    return content;
  }

  const isDark = variant === "secondaryListing";

  return (
    <div
      className={
        isDark
          ? "flex h-dvh min-h-0 flex-col overflow-hidden bg-black text-white"
          : "flex min-h-dvh flex-col"
      }
    >
      {showHeader ? (
        <div className={isDark ? "sticky top-0 z-120 shrink-0 bg-black" : undefined}>
          <DashboardHeader sticky={isDark} />
        </div>
      ) : null}
      {variant === "secondaryListing" ? (
        <main className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-x-hidden overflow-y-auto overscroll-y-contain">
          {content}
        </main>
      ) : (
        content
      )}
    </div>
  );
}
