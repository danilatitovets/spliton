"use client";

import Image from "next/image";

import { useI18n } from "@/components/providers/i18n-provider";
import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";
import { detailPageText } from "@/lib/i18n/analytics-detail-page-messages";

const RINGS_ART = "/images/analytics/release-detail-trust-rings.png";

export function ReleaseDetailHow({ data }: { data: ReleaseDetailPageData }) {
  const { locale } = useI18n();
  const { blocks } = data.howItWorks;

  const title = detailPageText(locale, "analytics.detail.trust.growTitle").replace(
    "{release}",
    data.row.release,
  );

  const pillars =
    blocks.length > 0
      ? blocks.map((b) => ({
          heading: b.heading,
          body: b.body ?? b.rows?.map((r) => `${r.label}: ${r.value}`).join(" · ") ?? "",
        }))
      : [
          {
            heading: detailPageText(locale, "analytics.detail.trust.pillar1Title"),
            body: detailPageText(locale, "analytics.detail.trust.pillar1Body"),
          },
          {
            heading: detailPageText(locale, "analytics.detail.trust.pillar2Title"),
            body: detailPageText(locale, "analytics.detail.trust.pillar2Body"),
          },
          {
            heading: detailPageText(locale, "analytics.detail.trust.pillar3Title"),
            body: detailPageText(locale, "analytics.detail.trust.pillar3Body"),
          },
        ];

  if (pillars.every((p) => !p.heading && !p.body)) {
    return null;
  }

  return (
    <section className="mt-14 w-full space-y-8 md:mt-20 md:space-y-10" aria-label={title}>
      <h2 className="mx-auto max-w-[28ch] text-balance text-center text-[1.65rem] font-semibold leading-[1.15] tracking-tight text-white sm:text-3xl lg:text-[2.1rem]">
        {title}
      </h2>

      <div className="relative mx-auto aspect-square w-full max-w-[280px] sm:max-w-[320px]">
        <Image
          src={RINGS_ART}
          alt=""
          fill
          sizes="(max-width:640px) 280px, 320px"
          className="object-contain"
        />
      </div>

      <div className="grid w-full gap-x-8 gap-y-10 sm:grid-cols-2 lg:gap-x-12 lg:gap-y-12">
        {pillars.map((pillar) => (
          <article key={pillar.heading} className="min-w-0">
            <h3 className="text-[15px] font-semibold tracking-tight text-white sm:text-base">
              {pillar.heading}
            </h3>
            {pillar.body ? (
              <p className="mt-2 text-[13px] leading-relaxed tracking-normal text-white/45">
                {pillar.body}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
