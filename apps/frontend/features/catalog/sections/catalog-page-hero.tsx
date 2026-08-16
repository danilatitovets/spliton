"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";

import { ExchangeNeonSparkline } from "@/components/shared/charts/exchange-neon-sparkline";
import { useI18n } from "@/components/providers/i18n-provider";
import { ROUTES } from "@/constants/routes";
import { buildCatalogHeroSparklines, type CatalogHeroSparkline } from "@/lib/catalog/catalog-hero-sparklines";
import { resolveCatalogCoverUrl } from "@/lib/catalog/catalog-demo-covers";
import { catalogReleasePrimaryHref } from "@/lib/catalog/catalog-release-nav";
import type { CatalogItem } from "@/lib/catalog-mock";
import { formatNumber } from "@/lib/i18n/formatters";
import type { AppLocale } from "@/lib/i18n/types";
import type { CatalogStats } from "@/types/catalog/page";
import { cn } from "@/lib/utils";

function formatStatNumber(value: number | string | undefined, locale: AppLocale): string {
  if (value == null) return "—";
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  if (!Number.isFinite(n)) return "—";
  return formatNumber(n, locale);
}

function formatVolume(value: number | string | undefined, locale: AppLocale): string {
  const raw = formatStatNumber(value, locale);
  if (raw === "—") return raw;
  return `$${raw}`;
}

function itemSymbol(item: CatalogItem): string {
  const slug = "slug" in item ? item.slug : undefined;
  if (slug) return slug.slice(0, 6).toUpperCase();
  const words = item.title.trim().split(/\s+/);
  if (words.length >= 2) return (words[0]!.slice(0, 2) + words[1]!.slice(0, 2)).toUpperCase();
  return item.title.slice(0, 4).toUpperCase();
}

function itemPrice(item: CatalogItem): string {
  return item.kind === "market" ? item.sharePrice : item.unitPriceUsdt;
}

function itemChange(item: CatalogItem): { text: string; positive: boolean | null } {
  if (item.kind === "market") {
    const t = item.sharePriceChange.trim();
    const pos = t.startsWith("+") || t.startsWith("＋");
    const neg = t.startsWith("-") || t.startsWith("−") || t.startsWith("–");
    return { text: item.sharePriceChange, positive: pos ? true : neg ? false : null };
  }
  return {
    text: item.forecastYield,
    positive: item.pct >= 50 ? true : item.pct < 40 ? false : null,
  };
}

type KpiCard = {
  label: string;
  value: string;
  caption?: string;
  captionPositive?: boolean | null;
  sparkline: CatalogHeroSparkline;
};

function PreviewStrip({
  title,
  items,
}: {
  title: string;
  items: CatalogItem[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="min-w-[240px] flex-1 rounded-xl bg-[#141414] px-4 py-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-medium text-zinc-300">{title}</p>
        <span className="text-[11px] text-zinc-600" aria-hidden>
          ›
        </span>
      </div>
      <ul className="mt-3 space-y-2.5">
        {items.slice(0, 3).map((item) => {
          const chg = itemChange(item);
          const cover = resolveCatalogCoverUrl(item.coverUrl, item.id);
          return (
            <li key={item.id}>
              <Link
                href={catalogReleasePrimaryHref(item)}
                className="flex items-center justify-between gap-3 transition hover:opacity-90"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className="relative size-6 shrink-0 overflow-hidden rounded-full bg-zinc-800">
                    <Image src={cover} alt="" fill sizes="24px" className="object-cover" />
                  </div>
                  <p className="truncate font-mono text-[12px] font-semibold text-white">{itemSymbol(item)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-[12px] tabular-nums text-white">{itemPrice(item)}</p>
                  <p
                    className={cn(
                      "font-mono text-[10px] tabular-nums",
                      chg.positive === true && "text-[#B7F500]",
                      chg.positive === false && "text-rose-300",
                      chg.positive === null && "text-zinc-500",
                    )}
                  >
                    {chg.text}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function CatalogPageHero({
  stats,
  statsUnavailable = false,
  previewItems = [],
}: {
  stats: CatalogStats | null;
  statsUnavailable?: boolean;
  previewItems?: CatalogItem[];
}) {
  const { t, locale } = useI18n();

  const sparklines = stats ? buildCatalogHeroSparklines(stats) : null;

  const cards: KpiCard[] =
    stats && sparklines
      ? [
          {
            label: t("catalog.hero.stats.releases"),
            value: formatStatNumber(stats.publicReleases, locale),
            sparkline: sparklines.releases,
          },
          {
            label: t("catalog.hero.stats.volume"),
            value: formatVolume(stats.totalVolume24hUsdt, locale),
            caption: stats.totalVolume7dUsdt
              ? t("catalog.hero.stats.volume7dCaption").replace(
                  "{volume}",
                  formatVolume(stats.totalVolume7dUsdt, locale),
                )
              : undefined,
            captionPositive: true,
            sparkline: sparklines.volume,
          },
          {
            label: t("catalog.hero.stats.listings"),
            value: formatStatNumber(stats.activeSecondaryListings, locale),
            caption: t("catalog.markets.onSecondary"),
            captionPositive: null,
            sparkline: sparklines.listings,
          },
        ]
      : [];

  const strips = useMemo(() => {
    const popular = [...previewItems]
      .sort((a, b) => {
        const la = a.liquidityScore ?? (a.kind === "funding" ? a.pct / 100 : 0);
        const lb = b.liquidityScore ?? (b.kind === "funding" ? b.pct / 100 : 0);
        return lb - la;
      })
      .slice(0, 3);
    const primary = previewItems.filter((i) => i.kind === "funding").slice(0, 3);
    const secondary = previewItems.filter((i) => i.kind === "market").slice(0, 3);
    const yieldLeaders = [...previewItems]
      .filter((i) => i.kind === "funding")
      .sort((a, b) => {
        const ya = Number.parseFloat(a.forecastYield.replace(",", ".").replace(/[^\d.]/g, "")) || 0;
        const yb = Number.parseFloat(b.forecastYield.replace(",", ".").replace(/[^\d.]/g, "")) || 0;
        return yb - ya;
      })
      .slice(0, 3);
    return { popular, primary, secondary, yieldLeaders };
  }, [previewItems]);

  return (
    <div className="border-b border-white/[0.06] bg-black px-4 pt-4 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-[1.35rem] font-semibold tracking-tight text-white">{t("catalog.markets.title")}</h1>
          <Link
            href={ROUTES.assetsUnt}
            className="shrink-0 text-[13px] font-medium text-zinc-500 transition hover:text-zinc-300"
          >
            {t("catalog.hero.cta.unt.title")}
          </Link>
        </div>

        {statsUnavailable ? (
          <p className="mt-3 text-sm text-zinc-500">{t("catalog.hero.statsUnavailable")}</p>
        ) : cards.length > 0 ? (
          <div className="mt-4 flex gap-2.5 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {cards.map((card) => (
              <div key={card.label} className="min-w-[168px] shrink-0 rounded-xl bg-[#141414] px-4 py-3.5">
                <p className="text-[11px] leading-snug text-zinc-500">{card.label}</p>
                <p className="mt-2 font-mono text-[22px] font-semibold leading-none tabular-nums tracking-tight text-white sm:text-2xl">
                  {card.value}
                </p>
                <div className="mt-3 h-9 w-full">
                  <ExchangeNeonSparkline
                    values={card.sparkline.values}
                    trend={card.sparkline.trend}
                    palette={card.sparkline.muted ? "muted" : "neon"}
                    width={140}
                    height={36}
                    fitContainer
                    detailSegments={card.sparkline.muted ? 1 : 3}
                    className="h-full w-full"
                  />
                </div>
                {card.caption ? (
                  <p
                    className={
                      card.captionPositive === true
                        ? "mt-1 font-mono text-[10px] tabular-nums text-[#B7F500]/90"
                        : "mt-1 text-[10px] text-zinc-600"
                    }
                  >
                    {card.caption}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex gap-2.5 overflow-x-auto pb-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[108px] min-w-[148px] animate-pulse rounded-xl bg-[#141414]" />
            ))}
          </div>
        )}

        {previewItems.length > 0 ? (
          <div className="flex gap-2.5 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <PreviewStrip title={t("catalog.markets.stripPopular")} items={strips.popular} />
            <PreviewStrip
              title={t("catalog.markets.stripNew")}
              items={strips.primary.length > 0 ? strips.primary : strips.popular}
            />
            <PreviewStrip
              title={t("catalog.markets.stripYield")}
              items={strips.yieldLeaders.length > 0 ? strips.yieldLeaders : strips.secondary}
            />
            {strips.secondary.length > 0 ? (
              <PreviewStrip title={t("catalog.markets.stripSecondary")} items={strips.secondary} />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
