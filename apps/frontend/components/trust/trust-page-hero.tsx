"use client";

import Image from "next/image";
import Link from "next/link";

import { useI18n } from "@/components/providers/i18n-provider";
import { ROUTES } from "@/constants/routes";

const TRUST_HERO_ICON = "/images/trust/hero.png";

export function TrustPageHero() {
  const { t } = useI18n();

  return (
    <section className="overflow-hidden rounded-[28px] bg-[#f7f7f8] ring-1 ring-black/[0.04]">
      <div className="flex flex-col items-center gap-5 px-6 py-10 text-center sm:gap-6 sm:px-10 sm:py-14 lg:py-16">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">
          {t("trust.hero.eyebrow")}
        </p>

        <div className="relative size-[5.5rem] shrink-0 sm:size-28">
          <Image
            src={TRUST_HERO_ICON}
            alt=""
            fill
            sizes="112px"
            className="object-contain"
            unoptimized
            aria-hidden
            priority
          />
        </div>

        <div className="max-w-2xl space-y-3">
          <h1 className="text-[2rem] font-semibold leading-[1.08] tracking-[-0.045em] text-neutral-950 sm:text-[2.75rem] lg:text-[3.25rem]">
            {t("trust.hero.title")}
          </h1>
          <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-neutral-500 sm:text-base">
            {t("trust.hero.subtitle")}
          </p>
        </div>

        <div className="mt-1 flex w-full max-w-sm flex-col gap-2.5 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
          <Link
            href={ROUTES.systemStatus}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800 sm:w-auto"
          >
            {t("trust.hero.systemStatus")}
          </Link>
          <Link
            href={ROUTES.support}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-neutral-900 ring-1 ring-black/[0.06] transition hover:bg-neutral-50 sm:w-auto"
          >
            {t("trust.hero.support")}
          </Link>
        </div>
      </div>
    </section>
  );
}
