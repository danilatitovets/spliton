import Link from "next/link";
import { Play } from "lucide-react";

import { MediaPlaceholder } from "@/components/dashboard/dashboard-media-placeholder";
import { analyticsReleaseDetailPath, catalogBuyUnitsPath } from "@/constants/routes";
import { catalogAccent } from "@/features/catalog/catalog-accent";
import type { CatalogItem } from "@/lib/catalog-mock";
import { cn } from "@/lib/utils";

export type CatalogTrackCardVariant = "card" | "row";
export type CatalogTrackCardSize = "default" | "large";

const accentSoft = catalogAccent.textMuted;

function cardKindLabel(item: CatalogItem): string {
  if (item.kind === "funding") {
    return item.status === "open" ? "Раунд открыт" : "Выплаты";
  }
  return "Вторичный рынок";
}

/** Цвет дельты цены: + sky, − fuchsia — без «трейдингового» зелёного. */
function shareDeltaClass(change: string) {
  const t = change.trim();
  if (t.startsWith("+") || t.startsWith("＋")) return "text-sky-300 tabular-nums";
  if (t.startsWith("-") || t.startsWith("−") || t.startsWith("–")) return "text-fuchsia-300 tabular-nums";
  return "text-zinc-400 tabular-nums";
}

function toneFromChange(change?: string): "up" | "down" | "neutral" {
  const t = (change ?? "").trim();
  if (t.startsWith("+") || t.startsWith("＋")) return "up";
  if (t.startsWith("-") || t.startsWith("−") || t.startsWith("–")) return "down";
  return "neutral";
}

function toneFromFundingProgress(pct: number): "up" | "down" | "neutral" {
  if (pct >= 70) return "up";
  if (pct < 40) return "down";
  return "neutral";
}

function toneForItem(item: CatalogItem): "up" | "down" | "neutral" {
  if (item.kind === "market") return toneFromChange(item.sharePriceChange);
  return toneFromFundingProgress(item.pct);
}

function toneDotClass(tone: "up" | "down" | "neutral"): string {
  if (tone === "up") return "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.35)]";
  if (tone === "down") return "bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.35)]";
  return "bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.35)]";
}

function toneBarClass(tone: "up" | "down" | "neutral"): string {
  if (tone === "up") return "bg-emerald-400";
  if (tone === "down") return "bg-rose-400";
  return "bg-sky-400";
}

function toneValueClass(tone: "up" | "down" | "neutral"): string {
  if (tone === "up") return "text-emerald-300";
  if (tone === "down") return "text-rose-300";
  return "text-sky-300";
}

function CardKindStrip({ item }: { item: CatalogItem }) {
  const isLive = item.kind === "funding" && item.status === "open";
  const itemTone = toneForItem(item);
  return (
    <div className="flex items-center justify-between gap-2 bg-[#0a0a0a] px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            item.kind === "market"
              ? toneDotClass(itemTone)
              : isLive
                ? toneDotClass(itemTone)
                : "bg-zinc-600",
          )}
          aria-hidden
        />
        <span className="truncate font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
          {cardKindLabel(item)}
        </span>
      </div>
      {item.kind === "funding" ? (
        <span className="shrink-0 rounded-md bg-white/6 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
          {item.status === "open" ? "Round" : "Payout"}
        </span>
      ) : (
        <span className="shrink-0 rounded-md bg-fuchsia-500/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-fuchsia-200/80">
          UNT
        </span>
      )}
    </div>
  );
}

/** Плоская строка каталога: одна рамка, без «шапки в шапке». */
function RowKindLine({ item }: { item: CatalogItem }) {
  const isLive = item.kind === "funding" && item.status === "open";
  const itemTone = toneForItem(item);
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          item.kind === "market"
            ? toneDotClass(itemTone)
            : isLive
              ? toneDotClass(itemTone)
              : "bg-zinc-600",
        )}
        aria-hidden
      />
      <span className="text-zinc-500">{cardKindLabel(item)}</span>
      {item.kind === "funding" ? (
        <span className="rounded bg-white/6 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-zinc-500">
          {item.status === "open" ? "Round" : "Payout"}
        </span>
      ) : (
        <span className="rounded bg-fuchsia-500/12 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-fuchsia-200/85">
          UNT
        </span>
      )}
    </div>
  );
}

function RowThumb({ title, large }: { title: string; large: boolean }) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-xl bg-[#070707]",
        large ? "size-[96px] sm:size-[106px]" : "size-[80px] sm:size-[88px]",
      )}
    >
      <MediaPlaceholder label="Обложка" aspectClassName="absolute inset-0 h-full w-full min-h-0" />
      <PlayFab label={`Слушать ${title}`} small />
    </div>
  );
}

const cardShellBase =
  "group relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl bg-[#111111] font-mono text-[13px] tabular-nums tracking-tight shadow-[0_10px_30px_rgba(0,0,0,0.28)] transition-colors duration-200 hover:bg-[#171717]";

const rowShell =
  "group flex w-full gap-3 rounded-2xl bg-[#0a0a0a] p-3.5 font-mono text-[13px] tabular-nums tracking-tight shadow-[0_14px_34px_rgba(0,0,0,0.35)] transition-colors duration-200 hover:bg-[#101010] sm:gap-4 sm:p-4";

const btnGhost =
  "inline-flex h-9 shrink-0 items-center justify-center rounded-xl bg-[#131313] px-4 text-[12px] font-semibold text-zinc-200 transition-colors hover:bg-[#1b1b1b] hover:text-white sm:h-10";

const btnBuyUnits =
  "inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-emerald-500 sm:h-11";

const cardActionBtnSizeClass = "h-9 w-[122px] px-0 text-[12px]";
const rowActionBtnSizeClass = "h-10 w-[128px] px-0 text-[12px]";

const cardTitleRowClass = "flex min-h-[48px] items-center";
const cardMetaRowClass = "mt-5 space-y-2.5 text-[12px]";

function CatalogTrackSparkline({ tone }: { tone: "up" | "down" | "neutral" }) {
  const uid = `${tone}-mini`;
  const points =
    tone === "up"
      ? "2,26 12,24 22,25 32,20 42,18 54,19 66,14 78,12 90,10 102,8"
      : tone === "down"
        ? "2,8 12,9 22,10 32,13 42,14 54,16 66,18 78,20 90,23 102,25"
        : "2,18 12,16 22,17 32,15 42,16 54,14 66,16 78,15 90,16 102,15";
  const stroke =
    tone === "up" ? "#5eead4" : tone === "down" ? "#fb7185" : "#e4e4e7";
  const glowId = `catalog-spark-glow-${uid}`;
  return (
    <div className="h-12 w-full overflow-hidden">
      <svg viewBox="0 0 104 30" className="h-full w-full" aria-hidden>
        <defs>
          <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <polyline
          points={points}
          fill="none"
          stroke={stroke}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.14"
        />
        <polyline
          points={points}
          fill="none"
          stroke={stroke}
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${glowId})`}
        />
      </svg>
    </div>
  );
}

function PlayFab({ label, small, large }: { label: string; small?: boolean; large?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "absolute flex items-center justify-center rounded-full bg-black/82 text-white shadow-md backdrop-blur-sm transition",
        "hover:bg-black",
        small ? "bottom-1.5 left-1.5 size-6.5" : large ? "bottom-4 left-4 size-12" : "bottom-3 left-3 size-10",
      )}
      aria-label={label}
    >
      <Play className={cn("fill-current text-zinc-100", small ? "ml-0.5 size-3" : large ? "ml-1 size-5" : "ml-0.5 size-4")} />
    </button>
  );
}

export function CatalogTrackCard({
  item,
  variant = "card",
  size = "default",
}: {
  item: CatalogItem;
  variant?: CatalogTrackCardVariant;
  size?: CatalogTrackCardSize;
}) {
  const isRow = variant === "row";
  const L = size === "large";
  const tone = toneForItem(item);
  const shell = cn(cardShellBase, L && "rounded-2xl");
  const detailHref = `${analyticsReleaseDetailPath(item.id)}?from=catalog`;
  const buyHref = catalogBuyUnitsPath(item.id);

  if (item.kind === "funding") {
    if (isRow) {
      return (
        <article className={rowShell}>
          <RowThumb title={item.title} large={L} />
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-3.5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1">
                <RowKindLine item={item} />
                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">{item.genre}</p>
                <h3 className={cn("mt-1 truncate font-sans font-semibold tracking-tight text-white", L ? "text-lg" : "text-base")}>
                  {item.title}
                </h3>
                <p className={cn("truncate font-sans text-zinc-500", L ? "text-sm" : "text-xs")}>{item.artist}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2 self-start sm:mt-0">
                <Link href={buyHref} className={cn(btnBuyUnits, rowActionBtnSizeClass)}>
                  Купить UNT
                </Link>
                <Link href={detailHref} className={cn(btnGhost, rowActionBtnSizeClass)}>
                  Подробнее
                </Link>
              </div>
            </div>
            <div>
              <div className="overflow-hidden rounded-full bg-zinc-900 h-1.5">
                <div className={cn("h-full rounded-full", toneBarClass(tone))} style={{ width: `${item.pct}%` }} />
              </div>
              <p className={cn("mt-1.5 font-sans text-zinc-500", L ? "text-xs" : "text-[11px]")}>
                <span className="font-semibold tabular-nums text-zinc-200">{item.raised}</span>
                <span className="text-zinc-600"> / {item.goal}</span>
              </p>
            </div>
          </div>
        </article>
      );
    }

    return (
      <article className={cn(shell, "h-[382px] p-4 sm:p-5")}>
        <div className="mb-4 h-px w-full bg-white/8" aria-hidden />
        <div className={cardTitleRowClass}>
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-[#0a0a0a]">
              <MediaPlaceholder label="Аватар" aspectClassName="absolute inset-0 h-full w-full min-h-0" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-sans text-[22px] font-semibold leading-none tracking-tight text-white">{item.title}</p>
              <p className="mt-1 truncate text-xs text-zinc-500">{item.artist}</p>
            </div>
          </div>
        </div>

        <div className="mt-1 mb-2 h-px w-full bg-white/20" aria-hidden />
        <div className="mt-4 mb-4 flex h-9 w-full items-center justify-between gap-2">
            <Link href={buyHref} className={cn(btnBuyUnits, cardActionBtnSizeClass)}>
              Купить UNT
          </Link>
            <Link href={detailHref} className={cn(btnGhost, cardActionBtnSizeClass)}>
            Подробнее
          </Link>
        </div>

        <div className="mt-5">
          <div className="min-h-[98px]">
            <p className="truncate text-[11px] text-zinc-500">Доходность (ориентир)</p>
            <p className={cn("mt-0.5 text-[36px] font-semibold leading-none tabular-nums", toneValueClass(tone))}>
              {item.forecastYield}
            </p>
            <p className="mt-1 truncate text-xs text-zinc-500">Собрано {item.raised} / {item.goal}</p>
          </div>
          <div className="mt-2 flex justify-center">
            <div className="w-[136px]">
              <CatalogTrackSparkline tone={tone} />
            </div>
          </div>
        </div>

        <div className={cardMetaRowClass}>
          <div className="flex h-5 items-center justify-between text-zinc-500">
            <span>Цена за 1 UNT</span>
            <span className="inline-block min-w-[64px] text-right font-semibold tabular-nums text-zinc-300">—</span>
          </div>
          <div className="flex h-5 items-center justify-between text-zinc-500">
            <span>Копитрейдеров</span>
          <span className="inline-block min-w-[64px] text-right font-semibold tabular-nums text-zinc-300">{item.availablePct}</span>
          </div>
          <div className="flex h-5 items-center justify-between text-zinc-500">
            <span>Актив под управлением</span>
          <span className={cn("inline-block min-w-[64px] text-right font-semibold tabular-nums", accentSoft)}>{item.forecastYield}</span>
          </div>
          <div className="flex h-5 items-center justify-between text-zinc-500">
            <span>Ликвидность</span>
          <span className="inline-block min-w-[64px] text-right font-semibold tabular-nums text-zinc-200">{item.availablePct}</span>
          </div>
          <div className="overflow-hidden rounded-full bg-zinc-900 h-1.5">
            <div className={cn("h-full rounded-full", toneBarClass(tone))} style={{ width: `${item.pct}%` }} />
          </div>
        </div>
      </article>
    );
  }

  if (isRow) {
    return (
      <article className={rowShell}>
        <RowThumb title={item.title} large={L} />
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3.5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1">
              <RowKindLine item={item} />
              <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">{item.genre}</p>
              <h3 className={cn("mt-1 truncate font-sans font-semibold tracking-tight text-white", L ? "text-lg" : "text-base")}>
                {item.title}
              </h3>
              <p className={cn("truncate font-sans text-zinc-500", L ? "text-sm" : "text-xs")}>{item.artist}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2 self-start sm:mt-0">
              <Link href={buyHref} className={cn(btnBuyUnits, rowActionBtnSizeClass)}>
                Купить UNT
              </Link>
              <Link href={detailHref} className={cn(btnGhost, rowActionBtnSizeClass)}>
                Подробнее
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-1 pt-2.5 sm:flex-row sm:items-end sm:justify-between sm:gap-3 sm:pt-0">
            <div>
              <p className={cn("font-sans text-zinc-600", L ? "text-[11px]" : "text-[10px]")}>Ориентир входа</p>
              <p className={cn("mt-1 font-semibold tabular-nums text-white", L ? "text-base" : "text-sm")}>
                {item.sharePrice}{" "}
                <span className={cn("font-semibold", shareDeltaClass(item.sharePriceChange), L ? "text-sm" : "text-xs")}>
                  {item.sharePriceChange}
                </span>
              </p>
            </div>
            <p className={cn("font-sans text-zinc-600 sm:text-right", L ? "text-[11px]" : "text-[10px]")}>
              Выплаты:{" "}
              <span className="font-medium tabular-nums text-zinc-400">{item.lastMonthPayout}</span>
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
      <article className={cn(shell, "h-[382px] p-4 sm:p-5")}>
      <div className="mb-4 h-px w-full bg-white/8" aria-hidden />
      <div className={cardTitleRowClass}>
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-[#0a0a0a]">
            <MediaPlaceholder label="Аватар" aspectClassName="absolute inset-0 h-full w-full min-h-0" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-sans text-[22px] font-semibold leading-none tracking-tight text-white">{item.title}</p>
            <p className="mt-1 truncate text-xs text-zinc-500">{item.artist}</p>
          </div>
        </div>
      </div>

      <div className="mt-1 mb-2 h-px w-full bg-white/20" aria-hidden />
      <div className="mt-4 mb-4 flex h-9 w-full items-center justify-between gap-2">
        <Link href={buyHref} className={cn(btnBuyUnits, cardActionBtnSizeClass)}>
          Купить UNT
        </Link>
        <Link href={detailHref} className={cn(btnGhost, cardActionBtnSizeClass)}>
          Подробнее
        </Link>
      </div>

      <div className="mt-5">
        <div className="min-h-[98px]">
          <p className="truncate text-[11px] text-zinc-500">Ориентир входа (вторичка)</p>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="text-[34px] font-semibold leading-none tabular-nums text-white">{item.sharePrice}</span>
            <span className={cn("inline-block min-w-[86px] text-[28px] leading-none tabular-nums", toneValueClass(tone))}>
              {item.sharePriceChange}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-zinc-500">Выплаты за прошлый период {item.lastMonthPayout}</p>
        </div>
        <div className="mt-2 flex justify-center">
          <div className="w-[136px]">
            <CatalogTrackSparkline tone={tone} />
          </div>
        </div>
      </div>

      <div className={cardMetaRowClass}>
        <div className="flex h-5 items-center justify-between text-zinc-500">
          <span>Цена за 1 UNT</span>
          <span className="inline-block min-w-[84px] text-right font-semibold tabular-nums text-zinc-200">{item.sharePrice}</span>
        </div>
        <div className="flex h-5 items-center justify-between text-zinc-500">
          <span>Копитрейдеров</span>
          <span className="inline-block min-w-[84px] text-right font-semibold tabular-nums text-zinc-300">-- / --</span>
        </div>
        <div className="flex h-5 items-center justify-between text-zinc-500">
          <span>Актив под управлением</span>
          <span className="inline-block min-w-[84px] text-right font-semibold tabular-nums text-zinc-200">{item.lastMonthPayout}</span>
        </div>
      </div>
    </article>
  );
}
