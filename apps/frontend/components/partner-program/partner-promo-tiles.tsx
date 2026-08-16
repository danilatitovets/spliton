"use client";

import Image from "next/image";
import Link from "next/link";

import { useI18n } from "@/components/providers/i18n-provider";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const TILES = [
  {
    id: "catalog",
    image: "/images/partner-programtab=about/2.jpg",
    titleKey: "partner.promo.catalog.title",
    subtitleKey: "partner.promo.catalog.subtitle",
    ctaKey: "partner.promo.catalog.cta",
    href: ROUTES.dashboardCatalog,
  },
  {
    id: "referral",
    image: "/images/partner-programtab=about/3.jpg",
    titleKey: "partner.promo.referral.title",
    subtitleKey: "partner.promo.referral.subtitle",
    ctaKey: "partner.promo.referral.cta",
    href: ROUTES.referralProgram,
  },
] as const;

export function PartnerPromoTiles({ className }: { className?: string }) {
  const { t } = useI18n();

  return (
    <section className={cn("grid gap-4 lg:grid-cols-2", className)} aria-label={t("partner.promo.aria")}>
      {TILES.map((tile) => (
        <article
          key={tile.id}
          className="relative isolate min-h-[220px] overflow-hidden rounded-2xl sm:min-h-[260px] sm:rounded-[1.35rem]"
        >
          <Image src={tile.image} alt="" fill className="object-cover object-center" sizes="(max-width: 1024px) 100vw, 50vw" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" aria-hidden />
          <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-end gap-4 p-5 sm:min-h-[260px] sm:p-7">
            <div className="max-w-md">
              <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{t(tile.titleKey)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{t(tile.subtitleKey)}</p>
            </div>
            <div>
              <Link
                href={tile.href}
                className={cn(
                  "inline-flex h-11 items-center justify-center rounded-full px-5 text-[13px] font-semibold text-white",
                  "bg-transparent shadow-[inset_0_0_0_1px_rgba(255,255,255,0.85)]",
                  "transition hover:bg-white/[0.08] active:scale-[0.98]",
                )}
              >
                {t(tile.ctaKey)}
              </Link>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}