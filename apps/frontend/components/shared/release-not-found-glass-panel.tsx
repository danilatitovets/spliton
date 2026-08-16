"use client";

import Image from "next/image";
import Link from "next/link";

import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { useI18n } from "@/components/providers/i18n-provider";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const RINGS_ICON = "/images/empty-states/release-not-found-icon.png";

type ReleaseNotFoundGlassPanelProps = {
  title?: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
};

/**
 * Centered empty state: metallic missing-link icon + title + white CTAs below.
 * (Component name kept for existing imports.)
 */
export function ReleaseNotFoundGlassPanel({
  title,
  description,
  primaryHref = ROUTES.dashboardCatalog,
  primaryLabel,
  secondaryHref = ROUTES.dashboard,
  secondaryLabel,
  className,
}: ReleaseNotFoundGlassPanelProps) {
  const { t } = useI18n();

  const heading = title ?? t("notFound.catalogRelease.title");
  const body = description ?? t("notFound.catalogRelease.description");
  const primary = primaryLabel ?? t("notFound.goCatalog");
  const secondary = secondaryLabel ?? t("notFound.goHome");

  return (
    <div
      className={cn(
        "flex min-h-[min(70vh,720px)] w-full flex-1 items-center justify-center bg-black px-4 py-12 sm:px-6",
        className,
      )}
    >
      <div className="flex w-full max-w-[380px] flex-col items-center text-center">
        <div className="relative mb-7 size-[148px] sm:mb-8 sm:size-[168px]">
          <Image
            src={RINGS_ICON}
            alt=""
            fill
            priority
            sizes="168px"
            className="object-contain"
          />
        </div>

        <h1 className="text-[1.65rem] font-semibold tracking-tight text-white sm:text-[1.85rem]">{heading}</h1>
        <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-zinc-500 sm:text-[14px]">{body}</p>

        <div className="mt-8 flex w-full flex-col gap-2.5 sm:mt-9">
          <SplitonCtaPill
            href={primaryHref}
            tone="onDark"
            variant="primary"
            className="h-12 w-full justify-between pl-5 pr-1.5 text-[14px]"
          >
            {primary}
          </SplitonCtaPill>
          <Link
            href={secondaryHref}
            className="mt-1 text-[13px] font-medium text-zinc-400 underline-offset-4 transition hover:text-white hover:underline"
          >
            {secondary}
          </Link>
        </div>
      </div>
    </div>
  );
}
