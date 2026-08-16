"use client";

import Image from "next/image";

import { useI18n } from "@/components/providers/i18n-provider";

const FEES_GLOBE = "/images/fees/fees-network-globe.png?v=3";

export function FeesVisualBand() {
  const { t } = useI18n();

  return (
    <section className="grid items-start gap-10 border-t border-neutral-200/90 pt-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
      <div className="relative mx-auto aspect-square w-full max-w-[240px] sm:max-w-[280px] lg:mx-0 lg:max-w-[300px]">
        <Image
          src={FEES_GLOBE}
          alt=""
          fill
          sizes="(max-width: 1024px) 280px, 300px"
          className="object-contain"
          unoptimized
          aria-hidden
        />
      </div>

      <div className="max-w-xl space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
          {t("fees.visual.eyebrow")}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
          {t("fees.visual.title")}
        </h2>
        <p className="text-[15px] leading-relaxed text-neutral-500 sm:text-base">
          {t("fees.visual.subtitle")}
        </p>
        <ul className="mt-5 space-y-3 pt-1">
          {(["fees.visual.point1", "fees.visual.point2", "fees.visual.point3"] as const).map((key) => (
            <li key={key} className="flex gap-3 text-sm text-neutral-600">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-neutral-900" aria-hidden />
              <span className="leading-relaxed">{t(key)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
