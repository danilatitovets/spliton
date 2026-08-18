"use client";

import Image from "next/image";
import Link from "next/link";
import { Globe, Mail } from "@/lib/lucide";

import {
  landingDisplay,
  landingFog,
} from "@/components/dashboard/dashboard-landing-tokens";
import { LanguageSelector } from "@/components/i18n/language-selector";
import { FooterRegisterQr } from "@/components/layout/footer-register-qr";
import { useI18n } from "@/components/providers/i18n-provider";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { BRAND } from "@/constants/brand";
import { SUPPORT_HELPDESK_EMAIL } from "@/constants/support-center";
import { ROUTES } from "@/constants/routes";
import { useFooterLinkGroups } from "@/hooks/use-shell-i18n";
import { tf } from "@/lib/i18n/financial-messages";
import { cn } from "@/lib/utils";

type FooterHref = { label: string; href: string };

const footerGhostPill =
  "inline-flex h-11 items-center justify-center rounded-full px-6 text-[14px] font-[510] tracking-[-0.011em] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] transition hover:bg-white/[0.04] active:scale-[0.98]";

const footerGhostIcon =
  "flex size-11 items-center justify-center rounded-full text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] transition hover:bg-white/[0.04] active:scale-[0.98]";

const socials: { label: string; href: string; icon: "telegram" | "x" | "github" | "youtube" | "linkedin" | "mail" }[] = [
  { label: "Telegram", href: "#", icon: "telegram" },
  { label: "X", href: "#", icon: "x" },
  { label: "GitHub", href: "#", icon: "github" },
  { label: "YouTube", href: "#", icon: "youtube" },
  { label: "LinkedIn", href: "#", icon: "linkedin" },
  { label: "mail", href: `mailto:${SUPPORT_HELPDESK_EMAIL}`, icon: "mail" },
];

function SocialGlyph({ kind }: { kind: (typeof socials)[number]["icon"] }) {
  const common = "size-[18px]";
  if (kind === "github") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    );
  }
  if (kind === "youtube") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }
  if (kind === "linkedin") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    );
  }
  if (kind === "mail") return <Mail className={common} strokeWidth={1.6} aria-hidden />;
  if (kind === "telegram") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M21.946 2.316a.478.478 0 0 0-.5-.095L2.26 9.85a.476.476 0 0 0 .002.908l5.374 2.09 2.07 6.682a.478.478 0 0 0 .756.228l3.017-2.465 4.678 3.44a.477.477 0 0 0 .73-.52l-2.03-13.857ZM17.1 7.45 7.62 12.721l-.197-3.84 9.677-1.43Z" />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FooterLinkColumn({
  title,
  links,
  compact,
}: {
  title: string;
  links: readonly FooterHref[];
  compact?: boolean;
}) {
  return (
    <div className="min-w-0">
      <h3
        className={cn(
          landingDisplay,
          "mb-3 text-white normal-case sm:mb-5",
          compact ? "text-[13px]" : "text-[14px]",
        )}
      >
        {title}
      </h3>
      <ul className={cn("text-[14px] leading-snug", compact ? "space-y-2.5" : "space-y-3.5")}>
        {links.map((l) => (
          <li key={`${l.href}-${l.label}`}>
            <Link href={l.href} className="text-zinc-500 transition-colors hover:text-zinc-100 text-balance">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter({
  className,
  variant = "default",
}: {
  className?: string;
  /** Компактнее на mobile — для лендинга кабинета. */
  variant?: "default" | "compact";
}) {
  const { t } = useI18n();
  const groups = useFooterLinkGroups();
  const year = new Date().getFullYear();
  const compact = variant === "compact";

  return (
    <footer
      data-footer-variant={compact ? "compact" : "default"}
      className={cn(
        "relative z-10 mt-auto overflow-visible bg-black font-sans text-zinc-500 [overflow-anchor:none]",
        compact ? "border-t-0" : "border-t border-white/8",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10",
          compact ? "pb-4 pt-10 sm:pb-8 sm:pt-20 lg:pb-10 lg:pt-24" : "pb-6 pt-16 sm:pb-8 sm:pt-20 lg:pb-10 lg:pt-24",
        )}
      >
        <div className={cn(compact ? "hidden pb-0 sm:block sm:pb-12 md:pb-16" : "pb-12 md:pb-16")}>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <p
              className={cn(
                landingDisplay,
                "max-w-2xl text-2xl leading-[1.15] md:text-3xl lg:text-[2.05rem]",
              )}
            >
              {t("footer.promo.title")}{" "}
              <Link
                href={ROUTES.news}
                className="text-[#8a8f98] underline decoration-[#3fe280]/40 underline-offset-[6px] transition hover:text-[#d0d6e0] hover:decoration-[#3fe280]/65"
              >
                {t("footer.promo.titleLink")}
              </Link>
              .
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <SplitonCtaPill href={ROUTES.news} tone="onDark" variant="ghost" withArrow={false}>
                {t("footer.promo.ctaNews")}
              </SplitonCtaPill>
              <SplitonCtaPill href={ROUTES.dashboard} tone="onDark">
                {t("footer.promo.ctaDashboard")}
              </SplitonCtaPill>
            </div>
          </div>
        </div>

        <div className={cn("grid lg:grid-cols-12 lg:gap-12 xl:gap-16", compact ? "mt-8 gap-8 sm:mt-14 lg:mt-20" : "mt-14 gap-14 lg:mt-20")}>
          <div className="flex flex-col gap-6 overflow-visible sm:gap-8 lg:col-span-3">
            <div>
              <Link href={ROUTES.home} className="inline-flex w-fit items-center">
                <Image
                  src="/images/LOGO/black-logo-nofon.png"
                  alt={BRAND.name}
                  width={480}
                  height={115}
                  className={cn(
                    "h-16 w-auto object-contain sm:h-[4.5rem] sm:max-w-[420px] md:h-24 md:max-w-[480px]",
                    compact ? "max-w-[300px]" : "max-w-[360px]",
                  )}
                />
              </Link>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-500 sm:mt-4 md:text-[15px]">
                {t("footer.tagline")}
              </p>
            </div>
            <p className="text-[11px] text-zinc-600">
              {tf(t("footer.copyright"), { year: String(year) })}
            </p>
            <div className="inline-flex w-fit items-center gap-2 rounded-lg px-1 py-1">
              <Globe className="size-3.5 text-zinc-500" strokeWidth={1.75} aria-hidden />
              <LanguageSelector
                variant="dark"
                menuAlign="start"
                buttonClassName="h-8 gap-1.5 px-1 py-0 text-xs text-zinc-300"
              />
              <span className="hidden text-xs text-zinc-500 sm:inline">{t("footer.localeSuffix")}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:col-span-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
            <FooterLinkColumn compact={compact} title={groups.sections.assets} links={groups.assets} />
            <FooterLinkColumn compact={compact} title={groups.sections.market} links={groups.market} />
            <FooterLinkColumn compact={compact} title={groups.sections.learn} links={groups.learn} />
            <FooterLinkColumn compact={compact} title={groups.sections.services} links={groups.services} />
            <FooterLinkColumn compact={compact} title={groups.sections.account} links={groups.account} />
            <FooterLinkColumn compact={compact} title={groups.sections.legal} links={groups.legal} />
          </div>

          <div className={cn("lg:col-span-3", compact && "hidden sm:block")}>
            <FooterRegisterQr />
          </div>
        </div>

        <div
          className={cn("relative", compact ? "mt-10 sm:mt-14 md:mt-20" : "mt-16 md:mt-24")}
          style={{ fontSize: "clamp(4.5rem, 22vw, 14rem)" }}
        >
          <div className="pointer-events-none select-none text-center leading-[0.82]">
            <p
              className="bg-clip-text font-bold tracking-[-0.05em] text-transparent"
              style={{
                backgroundImage: "url('/images/landing/footer-spliton-texture-fill-bw.png')",
                backgroundSize: "125% auto",
                backgroundPosition: "50% 40%",
                backgroundRepeat: "no-repeat",
              }}
              aria-hidden
            >
              {BRAND.name}
            </p>
          </div>

          <div className="relative mt-10 overflow-hidden rounded-[12px] bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] md:mt-12">
            <div className="relative grid grid-cols-1 divide-y divide-white/[0.12] md:grid-cols-3 md:divide-x md:divide-y-0">
              <div className="flex flex-col justify-center px-5 py-8 sm:px-8 sm:py-10">
                <p className={cn(landingDisplay, "text-[14px] text-white")}>{t("footer.community.eyebrow")}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {socials.map((s) => (
                    <Link
                      key={s.icon}
                      href={s.href}
                      aria-label={s.icon === "mail" ? t("footer.social.mail") : s.label}
                      className={footerGhostIcon}
                    >
                      <SocialGlyph kind={s.icon} />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex items-center px-5 py-8 sm:px-8 sm:py-10">
                <p
                  className={cn(
                    landingFog,
                    "mx-auto max-w-md text-center text-[14px] leading-relaxed tracking-[-0.011em] md:mx-0 md:text-left",
                  )}
                >
                  {t("footer.community.tagline")}
                </p>
              </div>

              <div className="flex items-center justify-center px-5 py-8 sm:px-8 sm:py-10 md:justify-end">
                <Link href={ROUTES.systemStatus} className={cn(footerGhostPill, "gap-2 px-5")}>
                  <span className="relative flex size-2 shrink-0">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/35 opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-white" />
                  </span>
                  {t("footer.community.statusLink")}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "flex flex-col items-start justify-between gap-3 pt-6 text-[12px] text-zinc-600 sm:flex-row sm:items-center sm:pt-8",
            compact && "mt-6 sm:mt-10",
          )}
        >
          <p>
            <span className="font-medium text-zinc-400">{BRAND.name}</span> · {year} · {t("footer.rights")}
          </p>
          <p className="text-[11px] text-zinc-600">{t("footer.platformLabel")}</p>
        </div>
      </div>
    </footer>
  );
}
