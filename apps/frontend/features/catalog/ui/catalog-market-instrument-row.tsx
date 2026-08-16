"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Star } from "@/lib/lucide";

import { ExchangeNeonSparkline, type ExchangeNeonTrend } from "@/components/shared/charts/exchange-neon-sparkline";
import { useI18n } from "@/components/providers/i18n-provider";
import { catalogBuyUnitsPathForRelease } from "@/constants/routes";
import { resolveCatalogCoverUrl } from "@/lib/catalog/catalog-demo-covers";
import { isCatalogPrimaryPurchasable } from "@/lib/catalog/catalog-purchase.util";
import { catalogReleaseDetailHref, catalogReleasePrimaryHref } from "@/lib/catalog/catalog-release-nav";
import type { CatalogItem } from "@/lib/catalog-mock";
import { cn } from "@/lib/utils";

/** Shared OKX-style markets grid — header + rows must use the exact same template. */
export const CATALOG_MARKETS_TABLE_GRID = cn(
  "grid items-center gap-x-4",
  "grid-cols-[minmax(0,1fr)_88px_72px]",
  "lg:grid-cols-[minmax(190px,1.35fr)_100px_84px_100px_136px_100px_148px]",
);

function itemSymbol(item: CatalogItem): string {
  const slug = "slug" in item ? item.slug : undefined;
  if (slug) return slug.slice(0, 8).toUpperCase();
  const words = item.title.trim().split(/\s+/);
  if (words.length >= 2) return (words[0]!.slice(0, 2) + words[1]!.slice(0, 2)).toUpperCase();
  return item.title.slice(0, 4).toUpperCase();
}

function parseDisplayNumber(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number.parseFloat(raw.replace(/\s/g, "").replace(",", ".").replace(/[^\d.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function parseChangePct(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "");
  if (!cleaned || /нет|n\/?a|—|–/i.test(cleaned)) return null;
  const m = cleaned.match(/([+\-−–＋]?)(\d+[.,]?\d*)/);
  if (!m) return null;
  const signChar = m[1] ?? "";
  const neg = signChar === "-" || signChar === "−" || signChar === "–";
  const n = Number.parseFloat((m[2] ?? "").replace(",", "."));
  if (!Number.isFinite(n)) return null;
  return neg ? -n : n;
}

function toneFromItem(item: CatalogItem): ExchangeNeonTrend {
  if (item.kind === "funding") {
    if (item.purchaseState === "sold_out" || item.purchaseState === "unavailable") return "down";
    if (item.pct >= 70) return "up";
    if (item.pct < 40) return "down";
    return "flat";
  }
  const pct = parseChangePct(item.sharePriceChange);
  if (pct == null) return "flat";
  if (pct > 0) return "up";
  if (pct < 0) return "down";
  return "flat";
}

function buildSparkValues(item: CatalogItem, trend: ExchangeNeonTrend): number[] {
  let seed = item.id.charCodeAt(0) * 31 + item.title.length * 17;
  let v = item.kind === "funding" ? Math.min(0.85, Math.max(0.15, item.pct / 100)) : 0.42;
  if (trend === "down") v = 0.68;
  if (trend === "up") v = 0.28;

  const out: number[] = [];
  for (let i = 0; i < 14; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const drift = trend === "up" ? 0.034 : trend === "down" ? -0.026 : 0.01;
    v = Math.max(0.1, Math.min(0.9, v + drift + ((seed % 100) - 50) / 750));
    out.push(Math.round(v * 1000) / 10);
  }
  return out;
}

function priceMeta(item: CatalogItem): {
  price: string;
  change: string;
  positive: boolean | null;
} {
  if (item.kind === "market") {
    const pct = parseChangePct(item.sharePriceChange);
    return {
      price: item.sharePrice,
      change: pct == null ? "—" : item.sharePriceChange.includes("%") ? item.sharePriceChange : `${item.sharePriceChange} %`,
      positive: pct == null ? null : pct > 0 ? true : pct < 0 ? false : null,
    };
  }
  const yieldPct = parseChangePct(item.forecastYield);
  if (yieldPct != null) {
    const formatted = item.forecastYield.includes("%") ? item.forecastYield : `${item.forecastYield}%`;
    return {
      price: item.unitPriceUsdt,
      change: formatted.startsWith("+") || formatted.startsWith("-") ? formatted : `+${formatted}`,
      positive: yieldPct >= 0,
    };
  }
  return {
    price: item.unitPriceUsdt,
    change: `${item.pct > 0 ? "+" : ""}${item.pct.toFixed(0)}%`,
    positive: item.pct >= 50 ? true : item.pct < 40 ? false : null,
  };
}

function rangePosition(item: CatalogItem): {
  lowLabel: string;
  highLabel: string;
  pos: number;
} | null {
  if (item.kind === "funding") {
    const pos = Math.min(1, Math.max(0, item.pct / 100));
    return { lowLabel: "0%", highLabel: "100%", pos };
  }
  const price = parseDisplayNumber(item.sharePrice);
  if (price == null || price <= 0) return null;
  const chg = parseChangePct(item.sharePriceChange) ?? 0;
  const amp = Math.max(Math.abs(chg) / 100, 0.02);
  const low = price * (1 - amp * 1.35);
  const high = price * (1 + amp * 1.15);
  const span = Math.max(high - low, 0.0001);
  const pos = Math.min(1, Math.max(0, (price - low) / span));
  return {
    lowLabel: low.toLocaleString("ru-RU", { maximumFractionDigits: 2 }),
    highLabel: high.toLocaleString("ru-RU", { maximumFractionDigits: 2 }),
    pos,
  };
}

function CoverThumb({ item, symbol }: { item: CatalogItem; symbol: string }) {
  const src = resolveCatalogCoverUrl(item.coverUrl, item.id);
  return (
    <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-zinc-900 sm:size-9">
      <Image src={src} alt="" fill sizes="36px" className="object-cover" />
      <span className="sr-only">{symbol}</span>
    </div>
  );
}

/** OKX-style 24h range: thin track + triangle marker + low/high. */
function RangeBar({ item }: { item: CatalogItem }) {
  const range = rangePosition(item);
  if (!range) {
    return <span className="font-mono text-[12px] text-zinc-600">—</span>;
  }
  return (
    <div className="w-full min-w-0 max-w-[140px]">
      <div className="relative h-3 w-full">
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/20" />
        <span
          className="absolute top-0 -translate-x-1/2 text-[9px] leading-none text-white"
          style={{ left: `${range.pos * 100}%` }}
          aria-hidden
        >
          ▼
        </span>
      </div>
      <div className="mt-0.5 flex items-center justify-between gap-2 font-mono text-[10px] tabular-nums text-zinc-500">
        <span className="truncate">{range.lowLabel}</span>
        <span className="truncate text-right">{range.highLabel}</span>
      </div>
    </div>
  );
}

function capLabel(item: CatalogItem): string {
  if (item.kind === "funding") {
    if (!item.raised || /нет|n\/?a/i.test(item.raised)) return "—";
    return item.goal ? `${item.raised}` : item.raised;
  }
  if (item.volume24hUsdt && !/нет|n\/?a/i.test(item.volume24hUsdt)) {
    return `$${item.volume24hUsdt}`;
  }
  return item.liquidityLabel && !/нет|n\/?a/i.test(item.liquidityLabel) ? item.liquidityLabel : "—";
}

function HeaderTip({ label, tip }: { label: string; tip?: string }) {
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const tipId = React.useId();

  const updateCoords = React.useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCoords({ top: r.bottom + 8, left: r.left + r.width / 2 });
  }, []);

  const show = React.useCallback(() => {
    updateCoords();
    setOpen(true);
  }, [updateCoords]);

  const hide = React.useCallback(() => setOpen(false), []);

  React.useEffect(() => {
    if (!open) return;
    updateCoords();
    const onScroll = () => updateCoords();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };
    const onDoc = (e: MouseEvent) => {
      if (!btnRef.current?.contains(e.target as Node)) hide();
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [open, hide, updateCoords]);

  if (!tip) return <span className="truncate">{label}</span>;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="inline-flex max-w-full items-center text-left outline-none"
        aria-expanded={open}
        aria-describedby={open ? tipId : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (open) hide();
          else show();
        }}
      >
        <span
          className={cn(
            "truncate border-b border-dotted border-zinc-600 transition",
            open && "border-zinc-300 text-zinc-200",
          )}
        >
          {label}
        </span>
      </button>
      {open && coords && typeof document !== "undefined"
        ? createPortal(
            <span
              id={tipId}
              role="tooltip"
              className={cn(
                "pointer-events-none fixed z-[300] w-max max-w-[240px] -translate-x-1/2",
                "rounded-md bg-[#2a2a2a] px-2.5 py-1.5 text-[11px] leading-snug text-zinc-100 shadow-[0_8px_24px_rgba(0,0,0,0.55)]",
                "after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2",
                "after:border-4 after:border-transparent after:border-b-[#2a2a2a]",
              )}
              style={{ top: coords.top, left: coords.left }}
            >
              {tip}
            </span>,
            document.body,
          )
        : null}
    </>
  );
}

export function CatalogMarketsTableHeader({ t }: { t: (key: string) => string }) {
  return (
    <div
      className={cn(
        CATALOG_MARKETS_TABLE_GRID,
        "border-b border-white/[0.06] px-1 py-2.5 text-[11px] font-medium text-zinc-500",
      )}
    >
      <span className="truncate">{t("catalog.markets.colName")}</span>
      <span className="truncate text-right">{t("catalog.markets.colPriceShort")}</span>
      <span className="truncate text-right">{t("catalog.markets.colChange")}</span>
      <span className="hidden truncate lg:inline-flex lg:justify-center">
        <HeaderTip label={t("catalog.markets.colTrend24h")} tip={t("catalog.markets.tipTrend24h")} />
      </span>
      <span className="hidden truncate lg:inline-flex">
        <HeaderTip label={t("catalog.markets.colRange24h")} tip={t("catalog.markets.tipRange24h")} />
      </span>
      <span className="hidden min-w-0 truncate text-right lg:block">{t("catalog.markets.colMarketCap")}</span>
      <span className="hidden min-w-0 truncate text-right lg:block">{t("catalog.markets.colAction")}</span>
    </div>
  );
}

export function CatalogMarketInstrumentRow({
  item,
  href,
  isFavorite = false,
  onToggleFavorite,
}: {
  item: CatalogItem;
  href: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const { t } = useI18n();
  const symbol = itemSymbol(item);
  const { price, change, positive } = priceMeta(item);
  const trend = toneFromItem(item);
  const sparkValues = React.useMemo(() => buildSparkValues(item, trend), [item, trend]);
  const [optimistic, setOptimistic] = React.useState<boolean | null>(null);
  const shownFavorite = optimistic ?? isFavorite;
  const detailHref = catalogReleaseDetailHref(item);
  const tradeHref =
    item.kind === "funding" && isCatalogPrimaryPurchasable(item.purchaseState)
      ? catalogBuyUnitsPathForRelease(item)
      : href;

  React.useEffect(() => {
    setOptimistic(null);
  }, [isFavorite]);

  return (
    <div
      className={cn(
        CATALOG_MARKETS_TABLE_GRID,
        "min-h-[64px] border-b border-white/[0.04] px-1 py-3 transition-colors hover:bg-white/[0.02]",
      )}
    >
      {/* Name */}
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOptimistic(!shownFavorite);
            onToggleFavorite?.();
          }}
          className="relative z-10 flex size-7 shrink-0 items-center justify-center text-zinc-600 transition hover:text-[#B7F500]"
          aria-label={shownFavorite ? t("catalog.favorite.remove") : t("catalog.favorite.add")}
          aria-pressed={shownFavorite}
        >
          <Star
            className={cn(
              "size-3.5 transition-colors",
              shownFavorite ? "fill-[#B7F500] text-[#B7F500]" : "fill-transparent",
            )}
            strokeWidth={1.75}
          />
        </button>
        <Link href={href} className="flex min-w-0 flex-1 items-center gap-2.5">
          <CoverThumb item={item} symbol={symbol} />
          <div className="min-w-0">
            <p className="truncate font-mono text-[14px] font-semibold leading-tight text-white">{symbol}</p>
            <p className="truncate text-[11px] leading-tight text-zinc-500">{item.title}</p>
          </div>
        </Link>
      </div>

      {/* Price */}
      <div className="min-w-0 text-right">
        <p className="truncate font-mono text-[13px] font-semibold tabular-nums text-white sm:text-[14px]">
          {price}
          <span className="ml-0.5 text-[11px] font-normal text-zinc-500">$</span>
        </p>
      </div>

      {/* Change */}
      <div className="min-w-0 text-right">
        <p
          className={cn(
            "truncate font-mono text-[12px] tabular-nums sm:text-[13px]",
            positive === true && "text-[#B7F500]",
            positive === false && "text-rose-300",
            positive === null && "text-zinc-500",
          )}
        >
          {change}
        </p>
      </div>

      {/* 24h sparkline */}
      <div className="hidden h-8 min-w-0 items-center justify-center overflow-hidden lg:flex">
        <ExchangeNeonSparkline
          values={sparkValues}
          trend={trend}
          width={96}
          height={32}
          fitContainer
          detailSegments={3}
          className="h-8 w-[96px]"
        />
      </div>

      {/* 24h range */}
      <div className="hidden min-w-0 lg:block">
        <RangeBar item={item} />
      </div>

      {/* Cap */}
      <div className="hidden min-w-0 overflow-hidden text-right lg:block">
        <p className="truncate font-mono text-[13px] tabular-nums text-white">{capLabel(item)}</p>
      </div>

      {/* Actions — OKX text links */}
      <div className="hidden min-w-0 items-center justify-end gap-1 overflow-hidden whitespace-nowrap lg:flex">
        <Link href={detailHref} className="shrink-0 text-[12px] font-medium text-zinc-300 transition hover:text-white">
          {t("catalog.markets.actionDetails")}
        </Link>
        <span className="shrink-0 text-zinc-700" aria-hidden>
          |
        </span>
        <Link href={tradeHref} className="shrink-0 text-[12px] font-medium text-zinc-300 transition hover:text-white">
          {t("catalog.markets.actionToTrade")}
        </Link>
      </div>
    </div>
  );
}

export function catalogItemHref(item: CatalogItem): string {
  return catalogReleasePrimaryHref(item);
}
