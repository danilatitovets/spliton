"use client";

import Image from "next/image";

import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { useI18n } from "@/components/providers/i18n-provider";
import { catalogBuyUnitsPath, loginPathWithNext } from "@/constants/routes";
import { detailPageText } from "@/lib/i18n/analytics-detail-page-messages";
import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";

const SPHERE_ART = "/images/analytics/release-detail-trust-sphere.png";

function TrustStatCard({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <article className={`rounded-2xl bg-[#171717] px-5 py-5 sm:px-6 sm:py-6 ${className ?? ""}`}>
      <p className="font-mono text-[1.55rem] font-semibold leading-none tracking-tight tabular-nums text-white sm:text-[1.85rem]">
        {value}
      </p>
      <p className="mt-2.5 text-[13px] leading-snug tracking-normal text-white/45">{label}</p>
    </article>
  );
}

export function ReleaseDetailAbout({ data }: { data: ReleaseDetailPageData }) {
  const { locale } = useI18n();
  const paragraphs = data.about.paragraphs;
  if (paragraphs.length === 0) return null;

  const release = data.row.release;
  const buyHref = data.pageState.primaryCta?.href ?? catalogBuyUnitsPath(data.row.id);
  const ctaHref = data.pageState.isGuest ? loginPathWithNext(buyHref) : buyHref;

  const volume =
    data.quickStats.find((s) => /secondary|объём|volume|оборот/i.test(s.label))?.value ??
    data.summaryPanel.find((r) => r.kind === "secondary")?.value ??
    data.row.payouts;
  const units =
    data.quickStats.find((s) => /units sold|продано|обращении/i.test(s.label))?.value ??
    data.row.units;
  const available =
    data.quickStats.find((s) => /available|доступ|остаток/i.test(s.label))?.value ??
    data.summaryPanel.find((r) => r.kind === "available")?.value ??
    "—";

  const title = detailPageText(locale, "analytics.detail.trust.title").replace("{release}", release);

  return (
    <section className="mt-12 md:mt-16" aria-label={title}>
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-10">
        <div className="relative mx-auto aspect-square w-full max-w-[420px]">
          <Image
            src={SPHERE_ART}
            alt=""
            fill
            sizes="(max-width:1024px) 90vw, 420px"
            className="object-contain"
            priority={false}
          />
        </div>

        <div className="min-w-0">
          <h2 className="text-balance text-[1.65rem] font-semibold leading-[1.15] tracking-tight text-white sm:text-3xl lg:text-[2.1rem]">
            {title}
          </h2>

          <div className="mt-6 grid gap-3">
            <TrustStatCard
              value={volume}
              label={detailPageText(locale, "analytics.detail.trust.stat.volume")}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <TrustStatCard
                value={units}
                label={detailPageText(locale, "analytics.detail.trust.stat.units")}
              />
              <TrustStatCard
                value={available}
                label={detailPageText(locale, "analytics.detail.trust.stat.available")}
              />
            </div>
          </div>

          <div className="mt-6">
            <SplitonCtaPill href={ctaHref} tone="onDark" className="min-w-[12rem]">
              {detailPageText(locale, "analytics.detail.trust.cta")}
            </SplitonCtaPill>
          </div>

          <p className="mt-6 max-w-[52ch] text-[13px] leading-relaxed tracking-normal text-white/40">
            {paragraphs[0]}
          </p>
        </div>
      </div>
    </section>
  );
}
