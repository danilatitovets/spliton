"use client";

import Link from "next/link";

import { useI18n } from "@/components/providers/i18n-provider";
import { ROUTES } from "@/constants/routes";

const CTA_VIDEO = "/videos/positions-cta.mp4";

type AssetsBuyReleaseCtaProps = {
  /** i18n prefix without trailing dot — uses `{ns}.cta.title|body|buyRelease` */
  ns?: "positions" | "activity" | "history";
};

/** Bottom video CTA — buy a release (positions / activity / payouts history). */
export function AssetsBuyReleaseCta({ ns = "positions" }: AssetsBuyReleaseCtaProps) {
  const { t } = useI18n();
  const title = t(`${ns}.cta.title`);
  const body = t(`${ns}.cta.body`);
  const buy = t(`${ns}.cta.buyRelease`);

  return (
    <section
      aria-label={buy}
      className="relative isolate overflow-hidden rounded-[1.35rem] bg-black sm:rounded-[1.75rem]"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <video
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-70 motion-reduce:hidden"
          src={CTA_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/82 via-black/58 to-black/38 motion-reduce:bg-black" />
      </div>

      <div className="relative z-10 flex min-h-[200px] flex-col justify-center gap-6 px-5 py-9 sm:min-h-[260px] sm:flex-row sm:items-center sm:justify-between sm:px-9 sm:py-12 md:min-h-[300px]">
        <div className="min-w-0 max-w-xl">
          <h2 className="text-[24px] font-bold leading-tight tracking-tight text-white sm:text-[30px]">
            {title}
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-white/65 sm:text-[15px]">{body}</p>
        </div>
        <Link
          href={ROUTES.dashboardCatalog}
          className="inline-flex h-12 w-full shrink-0 items-center justify-center rounded-full bg-white px-8 text-[14px] font-semibold text-black transition hover:bg-zinc-100 active:scale-[0.98] sm:h-14 sm:w-auto sm:px-10 sm:text-[15px]"
        >
          {buy}
        </Link>
      </div>
    </section>
  );
}

/** @deprecated prefer AssetsBuyReleaseCta */
export function PositionsBuyReleaseCta() {
  return <AssetsBuyReleaseCta ns="positions" />;
}
