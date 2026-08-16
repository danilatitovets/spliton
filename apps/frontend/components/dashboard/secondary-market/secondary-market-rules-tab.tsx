"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus } from "@/lib/lucide";

import { ROUTES } from "@/constants/routes";
import { secondaryMarketHref } from "@/constants/dashboard/secondary-market";
import { useI18n } from "@/components/providers/i18n-provider";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";

const RULES_HERO_ICON = "/images/secondary-market/rules-hero.png";
const RULES_HEADER_VIDEO = "/videos/position-holding-bg.mp4";

const DETAIL_SECTIONS = [
  {
    id: "rules-fees",
    titleKey: "secondaryMarket.rules.section.fees.title",
    bullets: [
      "secondaryMarket.rules.section.fees.b1",
      "secondaryMarket.rules.section.fees.b2",
      "secondaryMarket.rules.section.fees.b3",
    ],
    defaultOpen: true,
  },
  {
    id: "rules-listing",
    titleKey: "secondaryMarket.rules.section.listing.title",
    bullets: [
      "secondaryMarket.rules.section.listing.b1",
      "secondaryMarket.rules.section.listing.b2",
      "secondaryMarket.rules.section.listing.b3",
    ],
  },
  {
    id: "rules-orders",
    titleKey: "secondaryMarket.rules.section.orders.title",
    bullets: [
      "secondaryMarket.rules.section.orders.b1",
      "secondaryMarket.rules.section.orders.b2",
      "secondaryMarket.rules.section.orders.b3",
    ],
  },
  {
    id: "rules-execution",
    titleKey: "secondaryMarket.rules.section.execution.title",
    bullets: [
      "secondaryMarket.rules.section.execution.b1",
      "secondaryMarket.rules.section.execution.b2",
      "secondaryMarket.rules.section.execution.b3",
    ],
  },
  {
    id: "rules-settlement",
    titleKey: "secondaryMarket.rules.section.settlement.title",
    bullets: [
      "secondaryMarket.rules.section.settlement.b1",
      "secondaryMarket.rules.section.settlement.b2",
      "secondaryMarket.rules.section.settlement.b3",
    ],
  },
  {
    id: "rules-cancel",
    titleKey: "secondaryMarket.rules.section.cancel.title",
    bullets: [
      "secondaryMarket.rules.section.cancel.b1",
      "secondaryMarket.rules.section.cancel.b2",
      "secondaryMarket.rules.section.cancel.b3",
    ],
  },
  {
    id: "rules-limits",
    titleKey: "secondaryMarket.rules.section.limits.title",
    bullets: [
      "secondaryMarket.rules.section.limits.b1",
      "secondaryMarket.rules.section.limits.b2",
      "secondaryMarket.rules.section.limits.b3",
    ],
  },
  {
    id: "rules-prohibited",
    titleKey: "secondaryMarket.rules.section.prohibited.title",
    bullets: [
      "secondaryMarket.rules.section.prohibited.b1",
      "secondaryMarket.rules.section.prohibited.b2",
      "secondaryMarket.rules.section.prohibited.b3",
    ],
  },
  {
    id: "rules-support",
    titleKey: "secondaryMarket.rules.section.support.title",
    bullets: [
      "secondaryMarket.rules.section.support.b1",
      "secondaryMarket.rules.section.support.b2",
    ],
  },
] as const;

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.05] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-zinc-300">{label}</p>
      <p className="mt-2.5 font-mono text-[22px] font-semibold tabular-nums tracking-tight text-white md:text-[24px]">
        {value}
      </p>
    </div>
  );
}

function RuleDetails({
  id,
  title,
  defaultOpen = false,
  children,
}: {
  id: string;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <details
      id={id}
      className="group border-b border-white/[0.05] last:border-b-0 [&_summary::-webkit-details-marker]:hidden"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 transition-colors hover:text-white">
        <span className="text-left text-[15px] font-semibold leading-snug tracking-tight text-white md:text-[16px]">
          {title}
        </span>
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-zinc-400 transition group-open:bg-white/[0.1] group-open:text-white"
          aria-hidden
        >
          <Plus className="size-3.5 group-open:hidden" strokeWidth={1.75} />
          <Minus className="hidden size-3.5 group-open:block" strokeWidth={1.75} />
        </span>
      </summary>
      <div className="space-y-2.5 pb-5 text-[14px] leading-relaxed text-zinc-200 md:text-[15px] md:leading-7">
        {children}
      </div>
    </details>
  );
}

export function SecondaryMarketRulesTab() {
  const { t } = useI18n();

  return (
    <div className="relative space-y-6 font-sans text-white antialiased md:space-y-8">
      <header className="relative isolate overflow-hidden rounded-2xl">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <video
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-[12px] motion-reduce:hidden"
            src={RULES_HEADER_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/72 to-black" />
        </div>
        <div className="relative z-10 flex flex-col gap-5 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-6">
          <div className="flex min-w-0 items-start gap-4">
            <div className="relative size-[4.5rem] shrink-0 sm:size-20">
              <Image
                src={RULES_HERO_ICON}
                alt=""
                fill
                sizes="80px"
                className="object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
                unoptimized
                aria-hidden
                priority
              />
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/45">
                Spliton · Secondary
              </p>
              <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-white md:text-2xl">
                {t("secondaryMarket.rules.heroTitle")}
              </h1>
              <p className="mt-1.5 max-w-[52ch] text-[13px] leading-relaxed text-white/55">
                {t("secondaryMarket.rules.heroLead")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <SplitonCtaPill
              href={secondaryMarketHref("market")}
              tone="onDark"
              className="h-10 text-[12px] font-semibold"
            >
              {t("secondaryMarket.actions.goToMarket")}
            </SplitonCtaPill>
            <SplitonCtaPill
              href={ROUTES.fees}
              tone="onDark"
              variant="ghost"
              withArrow={false}
              className="h-10 text-[12px] font-medium"
            >
              {t("secondaryMarket.rules.linkFees")}
            </SplitonCtaPill>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <MetricChip label={t("secondaryMarket.rules.takerLabel")} value="0,15%" />
        <MetricChip label={t("secondaryMarket.rules.makerLabel")} value="0,08%" />
        <MetricChip label={t("secondaryMarket.rules.minOrderLabel")} value="10 USDT" />
      </section>

      <section className="space-y-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-zinc-300">
          {t("secondaryMarket.rules.importantTitle")}
        </h2>
        <div className="grid gap-2 md:grid-cols-2">
          <p className="rounded-2xl bg-white/[0.05] px-4 py-4 text-[15px] leading-7 text-zinc-100">
            {t("secondaryMarket.rules.riskR01")}
          </p>
          <p className="rounded-2xl bg-white/[0.05] px-4 py-4 text-[15px] leading-7 text-zinc-100">
            {t("secondaryMarket.rules.riskR02")}
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-zinc-300">
          {t("secondaryMarket.rules.principlesTitle")}
        </h2>
        <div className="divide-y divide-white/[0.06] rounded-2xl bg-white/[0.05]">
          <div className="px-4 py-4 sm:px-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-zinc-300">
              {t("secondaryMarket.rules.matchingTitle")}
            </p>
            <p className="mt-1.5 text-[16px] font-semibold tracking-tight text-white">
              {t("secondaryMarket.rules.matchingCardTitle")}
            </p>
            <p className="mt-1.5 text-[15px] leading-7 text-zinc-100">
              {t("secondaryMarket.rules.matchingCardBody")}
            </p>
          </div>
          <div className="px-4 py-4 sm:px-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-zinc-300">
              {t("secondaryMarket.rules.settlementTitle")}
            </p>
            <p className="mt-1.5 text-[16px] font-semibold tracking-tight text-white">
              {t("secondaryMarket.rules.settlementCardTitle")}
            </p>
            <p className="mt-1.5 text-[15px] leading-7 text-zinc-100">
              {t("secondaryMarket.rules.settlementCardBody")}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-zinc-300">
            {t("secondaryMarket.rules.detailsTitle")}
          </h2>
          <p className="mt-1 text-[15px] font-medium text-zinc-100">{t("secondaryMarket.rules.detailsIntro")}</p>
        </div>
        <div className="rounded-2xl bg-white/[0.05] px-4 sm:px-5">
          {DETAIL_SECTIONS.map((section) => (
            <RuleDetails
              key={section.id}
              id={section.id}
              title={t(section.titleKey)}
              defaultOpen={"defaultOpen" in section ? Boolean(section.defaultOpen) : false}
            >
              {section.bullets.map((key) => (
                <div key={key} className="flex gap-3">
                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-white/75" aria-hidden />
                  <p>{t(key)}</p>
                </div>
              ))}
            </RuleDetails>
          ))}
        </div>
      </section>

      <section className="relative isolate overflow-hidden rounded-2xl">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-25 blur-[8px] motion-reduce:hidden"
            src={RULES_HEADER_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 bg-black/88" />
        </div>
        <div className="relative z-10 flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0 max-w-xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/45">
              {t("secondaryMarket.rules.ctaEyebrow")}
            </p>
            <p className="mt-1.5 text-[15px] font-semibold tracking-tight text-white md:text-base">
              {t("secondaryMarket.rules.ctaTitle")}
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-white/45">
              {t("secondaryMarket.rules.footerNote")}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <SplitonCtaPill href={ROUTES.terms} tone="onDark" className="h-10 text-[12px] font-semibold">
              {t("secondaryMarket.rules.linkTerms")}
            </SplitonCtaPill>
            <Link
              href={ROUTES.fees}
              className="inline-flex h-10 items-center justify-center rounded-full bg-white/[0.06] px-5 text-[12px] font-medium text-zinc-200 transition hover:bg-white/[0.1]"
            >
              {t("secondaryMarket.rules.linkFees")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
