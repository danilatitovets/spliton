"use client";

import Link from "next/link";

import { useI18n } from "@/components/providers/i18n-provider";
import { ROUTES } from "@/constants/routes";

const HEADER_VIDEO = "/videos/position-holding-bg.mp4";

export function NewsPageHero() {
  const { t } = useI18n();

  return (
    <section className="relative isolate overflow-hidden rounded-2xl bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] sm:rounded-[1.35rem]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <video
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-[12px] motion-reduce:hidden"
          src={HEADER_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/78 to-black" />
      </div>

      <div className="relative z-10 px-5 py-9 text-center sm:px-8 sm:py-12 lg:py-14">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
          <Link href={ROUTES.support} className="transition hover:text-white/80">
            {t("news.breadcrumb")}
          </Link>
          <span className="mx-2 text-white/25">›</span>
          <span className="text-white/75">{t("news.breadcrumbBlog")}</span>
        </p>
        <h1 className="mt-4 text-[2.15rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
          {t("news.hero.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-white/60 sm:text-base">
          {t("news.hero.subtitle")}
        </p>
      </div>
    </section>
  );
}