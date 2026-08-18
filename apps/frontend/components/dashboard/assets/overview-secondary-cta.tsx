"use client";

import Link from "next/link";

import { useI18n } from "@/components/providers/i18n-provider";
import { ROUTES } from "@/constants/routes";

const CTA_VIDEO = "/videos/assets-overview-secondary-cta.mp4";

export function OverviewSecondaryCta() {
  const { t } = useI18n();

  return (
    <article className="relative isolate min-h-[12.5rem] overflow-hidden rounded-[1.35rem] sm:min-h-[15rem] sm:rounded-[1.75rem]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <video
          className="absolute inset-0 h-full w-full scale-105 object-cover motion-reduce:hidden"
          src={CTA_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/55 to-white/10 motion-reduce:bg-white" />
      </div>

      <div className="relative z-10 flex h-full min-h-[12.5rem] flex-col items-start justify-end gap-4 px-5 py-6 sm:min-h-[15rem] sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-8">
        <h2 className="max-w-[16ch] text-[1.55rem] font-semibold leading-[1.15] tracking-tight text-black sm:text-[2rem]">
          {t("assets.overview.secondaryCtaTitle")}
        </h2>
        <Link
          href={ROUTES.dashboardSecondaryMarket}
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-[1.15rem] bg-[#1c1c1e] px-6 text-[14px] font-medium text-white transition hover:bg-[#262628] active:scale-[0.98]"
        >
          {t("assets.overview.secondaryCtaAction")}
        </Link>
      </div>
    </article>
  );
}
