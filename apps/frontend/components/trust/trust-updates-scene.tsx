"use client";

import Link from "next/link";

import { useI18n } from "@/components/providers/i18n-provider";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { ROUTES } from "@/constants/routes";

const CTA_VIDEO = "/videos/position-holding-bg.mp4";

/** Trust page CTA — video surface + open links (status / support / fees). */
export function TrustUpdatesScene() {
  const { t } = useI18n();

  return (
    <section
      aria-labelledby="trust-cta-heading"
      className="relative isolate overflow-hidden rounded-[28px] bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <video
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-55 motion-reduce:hidden"
          src={CTA_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/55 motion-reduce:bg-black" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-10">
        <div className="min-w-0 max-w-xl">
          <h2 id="trust-cta-heading" className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {t("trust.cta.title")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/55 sm:text-[15px]">{t("trust.cta.subtitle")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SplitonCtaPill href={ROUTES.systemStatus} tone="onDark" className="h-10 min-w-0 px-4 text-[13px]">
            {t("trust.cta.systemStatus")}
          </SplitonCtaPill>
          <SplitonCtaPill
            href={ROUTES.support}
            tone="onDark"
            variant="ghost"
            withArrow={false}
            className="h-10 min-w-0 px-4 text-[13px]"
          >
            {t("trust.cta.support")}
          </SplitonCtaPill>
          <Link
            href={ROUTES.fees}
            className="inline-flex h-10 items-center px-3 text-[13px] font-medium text-white/75 underline-offset-4 transition hover:text-white hover:underline"
          >
            {t("trust.cta.fees")}
          </Link>
        </div>
      </div>
    </section>
  );
}
