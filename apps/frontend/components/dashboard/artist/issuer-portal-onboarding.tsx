"use client";

import * as React from "react";
import Image from "next/image";

import { IssuerApplicationModal } from "@/components/dashboard/artist/issuer-application-modal";
import { useI18n } from "@/components/providers/i18n-provider";

const ISSUER_HERO_IMAGE = "/images/issuer/portal-hero-glass.png?v=1";

export function IssuerPortalOnboarding() {
  const { t } = useI18n();
  const [applyOpen, setApplyOpen] = React.useState(false);

  return (
    <>
      <section className="overflow-hidden rounded-[28px] bg-[#f7f7f8] ring-1 ring-black/[0.04]">
        <div className="flex flex-col items-center px-6 py-12 text-center sm:px-10 sm:py-16 lg:px-14 lg:py-20">
          <div className="relative mx-auto aspect-square w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[400px]">
            <Image
              src={ISSUER_HERO_IMAGE}
              alt=""
              fill
              sizes="(max-width: 640px) 280px, (max-width: 1024px) 340px, 400px"
              className="object-contain"
              priority
              unoptimized
              aria-hidden
            />
          </div>

          <h1 className="mt-8 max-w-2xl text-[2rem] font-semibold leading-[1.08] tracking-[-0.045em] text-neutral-950 sm:text-[2.75rem]">
            {t("artist.onboarding.hero.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-neutral-500">
            {t("artist.onboarding.hero.description")}
          </p>
          <button
            type="button"
            onClick={() => setApplyOpen(true)}
            className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-black px-7 text-[14px] font-semibold text-white transition hover:bg-[#1a1a1a] active:scale-[0.98]"
          >
            {t("artist.onboarding.hero.applyCta")}
          </button>
        </div>
      </section>

      <IssuerApplicationModal open={applyOpen} onOpenChange={setApplyOpen} />
    </>
  );
}
