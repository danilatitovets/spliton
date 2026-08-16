"use client";

import Image from "next/image";
import Link from "next/link";

import { useI18n } from "@/components/providers/i18n-provider";
import { ROUTES } from "@/constants/routes";

const HEADER_VIDEO = "/videos/position-holding-bg.mp4";
const STATUS_HERO_ICON = "/images/services-menu/status.webp";

export function SystemStatusPageHero() {
  const { t } = useI18n();

  return (
    <section className="relative isolate mx-auto mb-6 w-full max-w-[1320px] overflow-hidden rounded-2xl px-4 sm:mb-8 sm:rounded-[1.35rem] sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-[1.35rem]">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <video
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-[12px] motion-reduce:hidden"
            src={HEADER_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/75 to-black" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4 px-5 py-9 text-center sm:gap-5 sm:px-8 sm:py-12">
          <div className="relative size-[4.75rem] shrink-0 sm:size-24">
            <Image
              src={STATUS_HERO_ICON}
              alt=""
              fill
              sizes="96px"
              className="object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
              unoptimized
              aria-hidden
              priority
            />
          </div>
          <div className="max-w-3xl space-y-3">
            <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
              {t("systemStatus.hero.title")}
            </h1>
            <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-white/65 sm:text-base">
              {t("systemStatus.hero.subtitle")}
            </p>
            <p>
              <Link
                href={ROUTES.support}
                className="text-sm font-medium text-white/80 underline-offset-4 transition hover:text-white hover:underline"
              >
                {t("systemStatus.help.cta")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
