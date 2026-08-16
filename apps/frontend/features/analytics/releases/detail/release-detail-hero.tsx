"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "@/lib/lucide";

import { useI18n } from "@/components/providers/i18n-provider";
import { ROUTES } from "@/constants/routes";
import { detailPageText } from "@/lib/i18n/analytics-detail-page-messages";
import {
  analyticsHeroBackLabel,
} from "@/lib/i18n/analytics-messages";
import { cn } from "@/lib/utils";
import type { ReleaseRowGenre } from "@/types/analytics/releases";
import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";

import { ReleaseDetailBreadcrumb } from "./release-detail-breadcrumb";
import { ReleaseDetailCover } from "./release-detail-cover";
import { ReleaseDetailHeroCta, ReleaseDetailLifecycleBadge } from "./release-detail-hero-cta";

function genreLabelKey(genre: ReleaseRowGenre): Parameters<typeof detailPageText>[1] {
  if (genre === "hiphop") return "analytics.detail.genre.hiphop";
  if (genre === "pop") return "analytics.detail.genre.pop";
  return "analytics.detail.genre.electronic";
}

export function ReleaseDetailHero({
  data,
  source,
  backHrefOverride,
  backLabelOverride,
}: {
  data: ReleaseDetailPageData;
  source?: string;
  backHrefOverride?: string;
  backLabelOverride?: string;
}) {
  const { locale } = useI18n();
  const { row } = data;
  const backHrefDefault =
    source === "catalog"
      ? ROUTES.dashboardCatalog
      : source === "secondary"
        ? ROUTES.dashboardSecondaryMarket
        : source === "positions"
          ? ROUTES.dashboardPositions
          : ROUTES.analyticsReleases;
  const backHref = backHrefOverride ?? backHrefDefault;
  const backLabel =
    backLabelOverride ??
    analyticsHeroBackLabel(source, locale);
  const artist = row.artist?.trim();

  return (
    <header className="pb-4 sm:pb-10">
      <Link
        href={backHref}
        className={cn(
          "inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2.5",
          "text-[11px] font-medium text-zinc-400 transition-colors hover:border-white/15 hover:bg-white/[0.07] hover:text-zinc-200",
          "sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-[12px]",
        )}
      >
        <ChevronLeft className="size-4 shrink-0 sm:hidden" strokeWidth={2} aria-hidden />
        <span className="min-w-0 truncate">{backLabel}</span>
        <ChevronRight className="hidden size-3.5 shrink-0 sm:block" strokeWidth={1.8} aria-hidden />
        <span className="shrink-0 font-mono text-[12px] font-semibold text-white sm:text-[13px]">{row.symbol}</span>
      </Link>

      <div className="mt-3 hidden sm:mt-5 sm:block">
        <ReleaseDetailBreadcrumb data={data} />
      </div>

      <div className="mt-3.5 min-w-0 sm:mt-8">
        <h1 className="break-words text-balance text-[1.75rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl sm:leading-[1.02] lg:text-6xl lg:leading-[1.01]">
          {row.release}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:mt-4 sm:gap-2">
          {artist ? (
            <span className="max-w-full truncate text-sm tracking-normal text-zinc-300 sm:text-[15px]">{artist}</span>
          ) : null}
          <span className="rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[11px] font-medium tracking-normal text-zinc-400 ring-1 ring-white/8 sm:text-[12px]">
            {row.symbol}
          </span>
          <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] font-medium tracking-normal text-zinc-400 ring-1 ring-white/8 sm:text-[12px]">
            {detailPageText(locale, genreLabelKey(row.genre))}
          </span>
          <ReleaseDetailLifecycleBadge data={data} />
        </div>

        <p className="mt-3 max-w-[62ch] text-[13px] leading-relaxed text-zinc-400 sm:mt-5 sm:text-[15px] sm:text-zinc-400">
          {data.heroBlurb}
        </p>

        <ReleaseDetailHeroCta data={data} />

        <ReleaseDetailCover cover={data.cover} releaseTitle={row.release} compact={!data.cover?.videoSrc && !data.cover?.posterSrc} />
      </div>
    </header>
  );
}
