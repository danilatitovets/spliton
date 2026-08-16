"use client";

import Image from "next/image";
import Link from "next/link";

import { useI18n } from "@/components/providers/i18n-provider";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { ROUTES } from "@/constants/routes";

const CALCULATOR_HERO_ICON = "/images/services-menu/calculator.png";
const TEXTURE = "/images/landing/footer-spliton-texture-fill-bw.png";

export function CalculatorPageHero() {
  const { t } = useI18n();

  return (
    <section
      className="relative isolate overflow-hidden rounded-[1.35rem] bg-black px-5 py-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] sm:rounded-[1.75rem] sm:px-7 sm:py-7"
      aria-labelledby="calculator-hero-title"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url('${TEXTURE}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.72,
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-black/50" aria-hidden />

      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="flex min-w-0 items-start gap-4">
          <div className="relative size-[4.25rem] shrink-0 sm:size-[4.75rem]">
            <Image
              src={CALCULATOR_HERO_ICON}
              alt=""
              fill
              sizes="76px"
              className="object-contain"
              unoptimized
              aria-hidden
              priority
            />
          </div>
          <div className="min-w-0 pt-1">
            <h1
              id="calculator-hero-title"
              className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
            >
              {t("calculator.hero.title")}
            </h1>
            <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-white/55">
              {t("calculator.hero.subtitle")}{" "}
              <Link
                href={ROUTES.assetsUnt}
                className="font-medium text-white underline decoration-white/25 underline-offset-4 transition hover:decoration-white/60"
              >
                {t("calculator.hero.untLink")}
              </Link>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <SplitonCtaPill
            href={ROUTES.dashboardCatalog}
            tone="onDark"
            variant="accent"
            className="h-10 min-w-0 px-4 text-[13px]"
          >
            {t("calculator.product.ctaCatalog")}
          </SplitonCtaPill>
          <SplitonCtaPill
            href={ROUTES.fees}
            tone="onDark"
            variant="ghost"
            withArrow={false}
            className="h-10 min-w-0 px-4 text-[13px]"
          >
            {t("calculator.product.ctaFees")}
          </SplitonCtaPill>
        </div>
      </div>
    </section>
  );
}
