"use client";

import NextImage from "next/image";
import Link from "next/link";

import {
  landingPageMax,
  landingSectionY,
} from "@/components/dashboard/dashboard-landing-tokens";
import { useI18n } from "@/components/providers/i18n-provider";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const ANNOUNCEMENTS = [
  {
    key: "insured",
    src: "/images/landing/announce-insured.png",
    href: ROUTES.trust,
  },
  {
    key: "alliance",
    src: "/images/landing/announce-seal.png",
    href: ROUTES.trust,
  },
  {
    key: "audit",
    src: "/images/landing/announce-soc2.png",
    href: ROUTES.trust,
  },
] as const;

export function DashboardLandingTrust({ className }: { className?: string }) {
  const { t } = useI18n();

  return (
    <section
      className={cn(landingSectionY, className)}
      aria-labelledby="dash-announcements-heading"
    >
      <div className={cn(landingPageMax, "px-4 sm:px-6 lg:px-8")}>
        <h2
          id="dash-announcements-heading"
          className="text-center text-[24px] font-medium tracking-[-0.012em] text-white sm:text-[36px] sm:leading-[1.11]"
        >
          {t("dashboard.announcements.title")}
        </h2>

        <div className="mt-10 grid gap-10 sm:mt-12 sm:grid-cols-3 sm:gap-8 lg:gap-10">
          {ANNOUNCEMENTS.map((item) => (
            <article key={item.key} className="flex flex-col">
              <Link href={item.href} className="group block">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[12px]">
                  <NextImage
                    src={item.src}
                    alt=""
                    fill
                    className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, 33vw"
                    unoptimized
                  />
                </div>
              </Link>

              <span className="mt-4 inline-flex w-fit rounded-full bg-white px-3 py-1 text-[12px] font-medium tracking-[-0.012em] text-black">
                {t(`dashboard.announcements.${item.key}.tag`)}
              </span>

              <h3 className="mt-3 text-[18px] font-medium leading-[1.35] tracking-[-0.012em] text-white sm:text-[20px] sm:leading-[1.4]">
                <Link href={item.href} className="transition hover:text-[#3fe280]">
                  {t(`dashboard.announcements.${item.key}.title`)}
                </Link>
              </h3>

              <p className="mt-2 text-[14px] leading-[1.43] tracking-[-0.012em] text-[#9b9b9b]">
                {t(`dashboard.announcements.${item.key}.text`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}