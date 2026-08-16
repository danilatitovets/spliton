"use client";

import Image from "next/image";
import Link from "next/link";

import { useI18n } from "@/components/providers/i18n-provider";
import { ROUTES } from "@/constants/routes";

const FEES_HERO_ICON = "/images/fees/fees-hero-percent.png?v=2";

export function FeesPageHero() {
  const { t } = useI18n();

  return (
    <section className="grid items-end gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10">
      <div className="max-w-2xl space-y-4">
        <p className="text-[12px] text-neutral-500">
          <Link href={ROUTES.support} className="transition hover:text-neutral-800">
            {t("fees.breadcrumb.learnMore")}
          </Link>
          <span className="mx-2 text-neutral-300">/</span>
          <span className="text-neutral-800">{t("fees.breadcrumb.current")}</span>
        </p>

        <h1 className="text-[2.35rem] font-semibold leading-[1.08] tracking-tight text-neutral-900 sm:text-5xl">
          {t("fees.hero.title")}
        </h1>
        <p className="max-w-[40rem] text-[15px] leading-relaxed text-neutral-500 sm:text-base">
          {t("fees.hero.subtitle")}
        </p>
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-[220px] sm:max-w-[260px] lg:ml-auto lg:mr-0 lg:max-w-[300px]">
        <Image
          src={FEES_HERO_ICON}
          alt=""
          fill
          sizes="(max-width: 1024px) 260px, 300px"
          className="object-contain"
          unoptimized
          priority
          aria-hidden
        />
      </div>
    </section>
  );
}
