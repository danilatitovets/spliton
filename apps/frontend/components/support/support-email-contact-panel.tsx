"use client";

import Link from "next/link";
import { Mail, MessageSquarePlus } from "@/lib/lucide";

import { useI18n } from "@/components/providers/i18n-provider";
import { SUPPORT_HELPDESK_EMAIL } from "@/constants/support-center";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const HEADER_VIDEO = "/videos/position-holding-bg.mp4";

export type SupportEmailContactPanelProps = {
  className?: string;
};

/** Блок обращений: видео-хедер и два действия — без лишнего текста. */
export function SupportEmailContactPanel({ className }: SupportEmailContactPanelProps) {
  const { t } = useI18n();

  return (
    <section
      id="support-contact"
      className={cn("relative isolate overflow-hidden rounded-2xl", className)}
      aria-labelledby="support-contact-title"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <video
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-[12px] motion-reduce:hidden"
          src={HEADER_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/72 to-black" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 px-5 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-7">
        <div className="min-w-0">
          <h2
            id="support-contact-title"
            className="text-xl font-semibold tracking-tight text-white sm:text-2xl"
          >
            {t("support.contact.title")}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={`mailto:${SUPPORT_HELPDESK_EMAIL}?subject=${encodeURIComponent(t("support.contact.mailSubject"))}`}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-[13px] font-semibold text-black transition hover:bg-[#e8e8e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <Mail className="size-4" aria-hidden />
            {t("support.contact.writeEmailShort")}
          </a>
          <Link
            href={ROUTES.dashboardSupport}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-white/[0.08] px-5 text-[13px] font-medium text-white transition hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <MessageSquarePlus className="size-4" aria-hidden />
            {t("support.contact.createTicket")}
          </Link>
        </div>
      </div>
    </section>
  );
}
