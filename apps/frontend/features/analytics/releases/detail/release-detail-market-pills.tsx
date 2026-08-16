"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "@/lib/lucide";

import { useI18n } from "@/components/providers/i18n-provider";
import { ROUTES, catalogBuyUnitsPath } from "@/constants/routes";
import { detailPageText } from "@/lib/i18n/analytics-detail-page-messages";
import { cn } from "@/lib/utils";
import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";

const ICON_USDT = "/images/analytics/release-detail-icon-usdt.png";
const ICON_UNT = "/images/analytics/release-detail-icon-unt.png";

function parseSignedPct(raw: string | undefined): { text: string; positive: boolean } | null {
  if (!raw) return null;
  const m = String(raw).replace(/\s/g, "").match(/([+−-]?\d+[.,]?\d*)\s*%/);
  if (!m) return null;
  const n = Number.parseFloat(m[1].replace(",", ".").replace("−", "-"));
  if (!Number.isFinite(n)) return null;
  const text = `${n > 0 ? "+" : ""}${n.toFixed(2).replace(".", ",")}%`;
  return { text, positive: n >= 0 };
}

function looksLikePctOnly(value: string): boolean {
  return /^\s*[+−-]?\d+[.,]?\d*\s*%\s*$/.test(value);
}

function resolveUnitPrice(data: ReleaseDetailPageData): string {
  const candidates = [
    data.summaryPanel.find((r) => r.kind === "min-entry")?.value,
    data.performance.miniStats.find((s) => /price|цена|usdt|unt/i.test(s.label) && !/Δ|change|измен|%/i.test(s.label))
      ?.value,
    data.quickStats.find((s) => /средн|avg|price|цена/i.test(s.label))?.value,
    data.row.payouts?.includes("USDT") ? undefined : undefined,
  ].filter(Boolean) as string[];

  for (const c of candidates) {
    if (!looksLikePctOnly(c)) return c;
  }

  const series = data.performance.seriesByPeriod["30d"];
  const last = series?.at(-1);
  if (last != null && Number.isFinite(last)) {
    return `${last.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} USDT`;
  }
  return "—";
}

function OkxPill({
  href,
  iconSrc,
  title,
  value,
  delta,
}: {
  href: string;
  iconSrc: string;
  title: string;
  value: string;
  delta?: { text: string; positive: boolean } | null;
}) {
  const showDelta =
    Boolean(delta) &&
    !looksLikePctOnly(value) &&
    delta!.text.replace(/\s/g, "") !== value.replace(/\s/g, "");

  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-2.5 rounded-full bg-[#171717] py-2 pl-2 pr-3.5 transition hover:bg-[#1f1f1f]"
    >
      <span className="relative size-8 shrink-0 overflow-hidden rounded-full bg-black/40">
        <Image src={iconSrc} alt="" fill sizes="32px" className="object-cover" />
      </span>
      <span className="whitespace-nowrap text-[13px] font-semibold tracking-tight text-white">{title}</span>
      <span className="whitespace-nowrap font-mono text-[13px] font-semibold tabular-nums text-white">{value}</span>
      {showDelta ? (
        <span
          className={cn(
            "whitespace-nowrap text-[12px] font-semibold tabular-nums",
            delta!.positive ? "text-[#B7F500]" : "text-[#ff6b8a]",
          )}
        >
          {delta!.text}
        </span>
      ) : null}
    </Link>
  );
}

function PillRow({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black to-transparent sm:hidden"
        aria-hidden
      />
    </div>
  );
}

export function ReleaseDetailMarketPills({ data }: { data: ReleaseDetailPageData }) {
  const { locale } = useI18n();
  const release = data.row.release;
  const buyHref = data.pageState.primaryCta?.href ?? catalogBuyUnitsPath(data.row.id);
  const secondaryHref = data.secondary.marketHref || ROUTES.dashboardSecondaryMarket;

  const unitPrice = resolveUnitPrice(data);
  const change = parseSignedPct(
    data.performance.miniStats.find((s) => /Δ|change|измен/i.test(s.label))?.value ??
      data.row.changePct,
  );
  const yieldValue = data.row.yieldPct;
  const payouts = data.row.payouts;

  const pairTitle = detailPageText(locale, "analytics.detail.more.pair").replace(
    "{release}",
    release,
  );
  const rateTitle = detailPageText(locale, "analytics.detail.more.ratesTitle").replace(
    "{release}",
    release,
  );

  const rates = [
    {
      iconSrc: ICON_UNT,
      title: detailPageText(locale, "analytics.detail.more.rateUntUsdt"),
      value: unitPrice.includes("USDT") ? unitPrice : `${unitPrice} USDT`,
      href: buyHref,
    },
    {
      iconSrc: ICON_USDT,
      title: detailPageText(locale, "analytics.detail.more.rateYield"),
      value: yieldValue,
      href: ROUTES.dashboardPayouts,
    },
    {
      iconSrc: ICON_USDT,
      title: detailPageText(locale, "analytics.detail.more.ratePayouts"),
      value: payouts,
      href: ROUTES.dashboardPayoutsHistory,
    },
  ];

  const secondaryValue =
    data.summaryPanel.find((r) => r.kind === "secondary")?.value ??
    data.quickStats.find((s) => /secondary|объём|volume/i.test(s.label))?.value ??
    "—";

  const recs = [
    {
      iconSrc: ICON_UNT,
      title: release,
      value: unitPrice.includes("USDT") ? unitPrice : unitPrice,
      delta: change,
      href: buyHref,
    },
    {
      iconSrc: ICON_USDT,
      title: "USDT",
      value: "1,00",
      delta: { text: "+0,01%", positive: true } as const,
      href: ROUTES.dashboardPayouts,
    },
    {
      iconSrc: ICON_UNT,
      title: detailPageText(locale, "analytics.detail.more.recSecondary"),
      value: secondaryValue,
      delta: looksLikePctOnly(secondaryValue) ? null : change,
      href: secondaryHref,
    },
  ];

  return (
    <section className="space-y-7" aria-label={detailPageText(locale, "analytics.detail.more.title")}>
      <div className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          {detailPageText(locale, "analytics.detail.more.title")}
        </h2>
        <PillRow>
          <OkxPill href={buyHref} iconSrc={ICON_UNT} title={pairTitle} value={unitPrice} delta={change} />
        </PillRow>

        <div className="space-y-2.5">
          <h3 className="text-[15px] font-semibold tracking-tight text-white">{rateTitle}</h3>
          <PillRow>
            {rates.map((r) => (
              <OkxPill key={r.title} href={r.href} iconSrc={r.iconSrc} title={r.title} value={r.value} />
            ))}
            <Link
              href={ROUTES.dashboardSecondaryMarket}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#171717] px-3.5 py-2 text-[13px] font-medium text-white/70 transition hover:bg-[#1f1f1f] hover:text-white"
            >
              {detailPageText(locale, "analytics.detail.more.viewAll")}
              <ChevronRight className="size-3.5 opacity-70" strokeWidth={2} aria-hidden />
            </Link>
          </PillRow>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          {detailPageText(locale, "analytics.detail.more.recsTitle")}
        </h2>
        <PillRow>
          {recs.map((r) => (
            <OkxPill
              key={r.title}
              href={r.href}
              iconSrc={r.iconSrc}
              title={r.title}
              value={r.value}
              delta={r.delta}
            />
          ))}
        </PillRow>
      </div>
    </section>
  );
}
