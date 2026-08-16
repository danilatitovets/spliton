"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "@/lib/lucide";

import type { PositionPreviewItem } from "@/components/dashboard/assets/assets-mock-data";
import { MetricsInfoTip } from "@/components/dashboard/assets/metrics-info-tip";
import { assetsMutedCardClass } from "@/components/dashboard/assets/assets-ui";
import { useI18n } from "@/components/providers/i18n-provider";
import { assetsPositionDetailPath } from "@/constants/routes";
import { formatNumber } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

const statusPill: Record<PositionPreviewItem["status"], string> = {
  Active: "bg-blue-50 text-blue-700",
  "Open round": "bg-amber-50 text-amber-800",
  Secondary: "bg-violet-50 text-violet-700",
  Closed: "bg-neutral-100 text-neutral-500",
};

const POSITION_STATUS_KEYS: Record<PositionPreviewItem["status"], string> = {
  Active: "positions.widgets.status.active",
  "Open round": "positions.widgets.status.openRound",
  Secondary: "positions.widgets.status.secondary",
  Closed: "positions.widgets.status.closed",
};

function getOwnedUnits(row: PositionPreviewItem): number {
  if (typeof row.heldUnits === "number" && Number.isFinite(row.heldUnits)) return row.heldUnits;
  return Number(row.units.replace(/\s/g, ""));
}

function resolveCoverUrl(row: PositionPreviewItem): string | null {
  if (row.coverUrl?.trim()) return row.coverUrl.trim();
  const raw = row.catalogReleaseId ?? row.id;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return null;
  const slot = ((Math.abs(n) - 1) % 5) + 1;
  return `/images/catalog/${slot}.png`;
}

function positionHref(row: PositionPreviewItem): string {
  return assetsPositionDetailPath(row.catalogReleaseId ?? row.id);
}

export function PositionsTableCard({
  rows,
  loading = false,
  live: _live = false,
  compact = false,
}: {
  rows: PositionPreviewItem[];
  loading?: boolean;
  live?: boolean;
  compact?: boolean;
}) {
  const { t, locale } = useI18n();

  if (loading) {
    return (
      <section className={assetsMutedCardClass}>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-white/70" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={cn(assetsMutedCardClass, compact && "py-4")} aria-label={t("positions.widgets.tableAria")}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-semibold tracking-tight text-neutral-900 sm:text-lg">
              {t("positions.widgets.tableTitle")}
            </h2>
            <MetricsInfoTip label={t("positions.widgets.infoLabel")}>
              {t("positions.widgets.tableInfo")}
            </MetricsInfoTip>
          </div>
          <p className="mt-0.5 text-sm text-neutral-500">{t("positions.widgets.tableSubtitle")}</p>
        </div>
      </div>

      <ul className="divide-y divide-neutral-200/70">
        {rows.map((row) => {
          const href = positionHref(row);
          const cover = resolveCoverUrl(row);
          return (
            <li key={row.id} id={`position-${row.id}`} className="scroll-mt-28 first:pt-0 last:pb-0">
              <Link
                href={href}
                className="flex items-center justify-between gap-3 py-3.5 transition hover:bg-neutral-50/80 first:pt-1 last:pb-1"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {cover ? (
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                      <Image src={cover} alt="" fill sizes="40px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-[11px] font-bold uppercase text-neutral-500">
                      {row.release.slice(0, 2)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-neutral-900">{row.release}</p>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                          statusPill[row.status],
                        )}
                      >
                        {t(POSITION_STATUS_KEYS[row.status])}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-neutral-500">
                      {row.artist}
                      <span className="mx-1 text-neutral-300">·</span>
                      {formatNumber(getOwnedUnits(row), locale)} UNT
                      <span className="mx-1 text-neutral-300">·</span>
                      {row.share}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                  <p className="font-mono text-sm font-semibold tabular-nums text-neutral-900 sm:text-[15px]">
                    {row.value}
                  </p>
                  <span
                    className="inline-flex size-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500"
                    aria-hidden
                  >
                    <ChevronRight className="size-4" strokeWidth={2} />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
