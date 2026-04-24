import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { ROUTES, analyticsReleaseDetailPath, catalogBuyUnitsPath } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { ReleaseMarketAnalyticsHeader } from "@/types/catalog/release-market-analytics";

/** Статус — тот же «премиальный» нейтральный слой, лёгкий оттенок текста по смыслу. */
const STATUS_PILL: Record<ReleaseMarketAnalyticsHeader["statusKey"], string> = {
  active: "text-zinc-200 ring-white/10",
  new: "text-zinc-200 ring-white/10",
  payouts: "text-zinc-300 ring-white/10",
  closed: "text-zinc-500 ring-white/8",
};

const ICON_BTN = cn(
  "flex size-9 shrink-0 items-center justify-center rounded-md bg-[#0a0a0a] text-zinc-400 ring-1 ring-white/8",
  "transition-colors hover:bg-white/[0.05] hover:text-zinc-200 hover:ring-white/12",
);

const ACTION_BTN = cn(
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-[#0a0a0a] px-3.5 text-[12px] font-medium text-zinc-300 ring-1 ring-white/8",
  "transition-colors hover:bg-white/[0.05] hover:text-white hover:ring-white/12",
);

function MetaChip({ children, mono }: { children: ReactNode; mono?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-[#0a0a0a] px-2 py-0.5 text-[11px] text-zinc-400 ring-1 ring-white/8",
        mono && "font-mono tabular-nums text-zinc-300",
      )}
    >
      {children}
    </span>
  );
}

export function ReleaseAnalyticsStickyHeader({ header }: { header: ReleaseMarketAnalyticsHeader }) {
  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-white/6 bg-black/95 backdrop-blur-sm supports-backdrop-filter:bg-black/85">
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8">
        <div className="flex flex-col gap-4 py-3.5 md:flex-row md:items-start md:justify-between md:gap-6 md:py-4">
          <div className="flex min-w-0 gap-3">
            <Link href={ROUTES.catalogMarketOverview} className={cn(ICON_BTN, "mt-0.5")} aria-label="Назад к обзору рынка">
              <ArrowLeft className="size-4" strokeWidth={1.75} />
            </Link>
            <div className="min-w-0 flex-1">
              <p
                className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600"
                aria-label="Контекст"
              >
                <span className="text-zinc-500">RevShare</span>
                <span className="text-zinc-800" aria-hidden>
                  ·
                </span>
                <span className="text-zinc-400">Каталог</span>
                <span className="text-zinc-800" aria-hidden>
                  ·
                </span>
                <span className="text-zinc-500">Обзор рынка</span>
                <span className="text-zinc-800" aria-hidden>
                  ·
                </span>
                <span className="truncate text-zinc-500 normal-case tracking-normal">Аналитика релиза</span>
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-md bg-[#0a0a0a] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ring-1 ring-inset",
                    STATUS_PILL[header.statusKey],
                  )}
                >
                  {header.statusLabel}
                </span>
                <span className="rounded-md px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-zinc-600">
                  mock
                </span>
              </div>

              <h1 className="mt-2 truncate text-xl font-semibold tracking-tight text-white md:text-2xl">{header.releaseTitle}</h1>
              <p className="mt-1 text-[14px] font-medium text-zinc-400">{header.artist}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <MetaChip mono>{header.symbol}</MetaChip>
                <MetaChip mono>{header.internalId}</MetaChip>
                <MetaChip>{header.genre}</MetaChip>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 md:pt-0.5 md:justify-end">
            <Link
              href={`${analyticsReleaseDetailPath(header.catalogReleaseId)}?from=catalog`}
              className={ACTION_BTN}
            >
              Открыть релиз
              <ExternalLink className="size-3.5 opacity-45" strokeWidth={1.75} aria-hidden />
            </Link>
            <Link href={catalogBuyUnitsPath(header.catalogReleaseId)} className={ACTION_BTN}>
              Купить units
            </Link>
            <Link href={ROUTES.dashboardSecondaryMarket} className={ACTION_BTN}>
              Secondary market
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
