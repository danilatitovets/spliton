"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/lib/lucide";
import { useMemo } from "react";

import { useI18n } from "@/components/providers/i18n-provider";
import { TrustCabinetVerifyScene } from "@/components/trust/trust-cabinet-verify-scene";
import { TrustOperationFlowScene } from "@/components/trust/trust-operation-flow-scene";
import { TrustUpdatesScene } from "@/components/trust/trust-updates-scene";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const SURFACE = "rounded-[28px] bg-[#f7f7f8] ring-1 ring-black/[0.03]";
const CARD = "rounded-2xl bg-white ring-1 ring-black/[0.04]";
const TRUST_ICON_BASE = "/images/trust";

type TrustMetric = {
  step: string;
  label: string;
  value: string;
  href?: string;
  hrefLabel?: string;
};

type TrustSectionLink = { label: string; href: string };

type TrustSection = {
  imageSrc: string;
  title: string;
  body: string;
  href?: string;
  hrefLabel?: string;
  links?: TrustSectionLink[];
};

type TrustControl = { title: string; text: string };

function SectionHeading({ id, title, subtitle }: { id?: string; title: string; subtitle?: string }) {
  return (
    <div>
      <h2
        id={id}
        className="text-[1.5rem] font-semibold tracking-[-0.03em] text-neutral-950 sm:text-[1.75rem]"
      >
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-neutral-500">{subtitle}</p>
      ) : null}
    </div>
  );
}

function SectionButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 w-full items-center justify-center rounded-full bg-neutral-950 px-4 text-xs font-semibold text-white transition hover:bg-neutral-800 sm:h-9 sm:w-auto"
    >
      {children}
    </Link>
  );
}

function SectionRow({ imageSrc, title, body, href, hrefLabel, links }: TrustSection) {
  const { t } = useI18n();

  return (
    <article className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
      <div className="relative mx-auto size-24 shrink-0 sm:mx-0 sm:size-28">
        <Image src={imageSrc} alt="" fill className="object-contain" sizes="112px" unoptimized />
      </div>
      <div className="min-w-0 flex-1 text-center sm:text-left">
        <h3 className="text-base font-semibold tracking-[-0.02em] text-neutral-950 sm:text-lg">{title}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">{body}</p>
        {links?.length ? (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start">
            {links.map((link) => (
              <SectionButton key={link.href} href={link.href}>
                {link.label}
              </SectionButton>
            ))}
          </div>
        ) : href ? (
          <div className="mt-4 flex w-full justify-center sm:w-auto sm:justify-start">
            <SectionButton href={href}>
              <span className="inline-flex items-center gap-1.5">
                {hrefLabel ?? t("trust.link.more")}
                <ArrowRight className="size-3.5" aria-hidden />
              </span>
            </SectionButton>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function TrustCenterContent() {
  const { t } = useI18n();

  const trustMetrics = useMemo<TrustMetric[]>(
    () => [
      {
        step: "01",
        label: t("trust.metrics.m1.label"),
        value: t("trust.metrics.m1.value"),
      },
      {
        step: "02",
        label: t("trust.metrics.m2.label"),
        value: t("trust.metrics.m2.value"),
      },
      {
        step: "03",
        label: t("trust.metrics.m3.label"),
        value: t("trust.metrics.m3.value"),
      },
      {
        step: "04",
        label: t("trust.metrics.m4.label"),
        value: t("trust.metrics.m4.value"),
        href: ROUTES.systemStatus,
        hrefLabel: t("trust.metrics.m4.hrefLabel"),
      },
    ],
    [t],
  );

  const sections = useMemo<TrustSection[]>(
    () => [
      {
        imageSrc: `${TRUST_ICON_BASE}/how-it-works.png`,
        title: t("trust.section.howItWorks.title"),
        body: t("trust.section.howItWorks.body"),
      },
      {
        imageSrc: `${TRUST_ICON_BASE}/ledger.png`,
        title: t("trust.section.ledger.title"),
        body: t("trust.section.ledger.body"),
      },
      {
        imageSrc: `${TRUST_ICON_BASE}/system-status.png`,
        title: t("trust.section.systemStatus.title"),
        body: t("trust.section.systemStatus.body"),
        href: ROUTES.systemStatus,
        hrefLabel: t("trust.section.systemStatus.hrefLabel"),
      },
      {
        imageSrc: `${TRUST_ICON_BASE}/support.png`,
        title: t("trust.section.support.title"),
        body: t("trust.section.support.body"),
        links: [
          { label: t("trust.link.support"), href: ROUTES.support },
          { label: t("trust.link.disputes"), href: ROUTES.dashboardDisputes },
        ],
      },
      {
        imageSrc: `${TRUST_ICON_BASE}/risks.png`,
        title: t("trust.section.risks.title"),
        body: t("trust.section.risks.body"),
      },
      {
        imageSrc: `${TRUST_ICON_BASE}/fees.png`,
        title: t("trust.section.fees.title"),
        body: t("trust.section.fees.body"),
        links: [
          { label: t("trust.link.fees"), href: ROUTES.fees },
          { label: t("trust.link.statements"), href: ROUTES.dashboardStatements },
          { label: t("trust.link.documents"), href: ROUTES.dashboardDocuments },
        ],
      },
    ],
    [t],
  );

  const controls = useMemo<TrustControl[]>(
    () => [
      { title: t("trust.controls.withdrawLimits.title"), text: t("trust.controls.withdrawLimits.text") },
      { title: t("trust.controls.operationReview.title"), text: t("trust.controls.operationReview.text") },
      { title: t("trust.controls.auditLog.title"), text: t("trust.controls.auditLog.text") },
      { title: t("trust.controls.kyc.title"), text: t("trust.controls.kyc.text") },
    ],
    [t],
  );

  return (
    <div className="space-y-10 pb-4 sm:space-y-12 sm:pb-6">
      <section aria-label={t("trust.metrics.aria")}>
        <SectionHeading title={t("trust.metrics.heading.title")} subtitle={t("trust.metrics.heading.subtitle")} />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {trustMetrics.map((metric) => (
            <article key={metric.step} className={cn(CARD, "flex flex-col px-5 py-5 sm:px-5 sm:py-6")}>
              <div className="relative size-14 sm:size-16" aria-hidden>
                <Image
                  src={`/images/partner/partner-step-${metric.step}.png?v=1`}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain"
                  unoptimized
                />
              </div>
              <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400">
                {metric.label}
              </p>
              <p className="mt-1.5 text-[15px] font-semibold tracking-[-0.015em] text-neutral-950">{metric.value}</p>
              {metric.href ? (
                <Link
                  href={metric.href}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-600"
                >
                  {metric.hrefLabel ?? t("trust.link.more")}
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className={cn(SURFACE, "px-5 py-7 sm:px-8 sm:py-9")} aria-labelledby="trust-pillars-heading">
        <SectionHeading
          id="trust-pillars-heading"
          title={t("trust.pillars.title")}
          subtitle={t("trust.pillars.subtitle")}
        />
        <div className="mt-6 divide-y divide-black/[0.06] sm:mt-8">
          {sections.map((section) => (
            <div key={section.title} className="py-6 first:pt-0 last:pb-0 sm:py-8">
              <SectionRow {...section} />
            </div>
          ))}
        </div>
      </section>

      <TrustOperationFlowScene />

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        <section className={cn(SURFACE, "px-5 py-7 sm:px-8 sm:py-8")} aria-labelledby="trust-controls-heading">
          <SectionHeading
            id="trust-controls-heading"
            title={t("trust.controls.title")}
            subtitle={t("trust.controls.subtitle")}
          />
          <ul className="mt-6 space-y-5 sm:mt-8">
            {controls.map(({ title, text }) => (
              <li key={title}>
                <p className="text-sm font-semibold text-neutral-950">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-500">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={cn(SURFACE, "px-5 py-7 sm:px-8 sm:py-8")} aria-labelledby="trust-verify-heading">
          <SectionHeading
            id="trust-verify-heading"
            title={t("trust.verify.title")}
            subtitle={t("trust.verify.subtitle")}
          />
          <div className="mt-2 sm:mt-3">
            <TrustCabinetVerifyScene />
          </div>
        </section>
      </div>

      <TrustUpdatesScene />

      <p className="mx-auto max-w-2xl px-2 text-center text-[11px] leading-relaxed text-neutral-400 sm:px-0 sm:text-xs">
        {t("trust.disclaimer")}
      </p>
    </div>
  );
}
