"use client";

import Link from "next/link";
import { ExternalLink, Star, Trash2 } from "@/lib/lucide";

import { SecondaryMarketResponsiveSheet } from "@/components/dashboard/secondary-market/secondary-market-responsive-sheet";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import type { WatchlistItem } from "@/components/dashboard/secondary-market/secondary-market-watchlist.types";
import { ExchangeNeonSparkline } from "@/components/shared/charts/exchange-neon-sparkline";
import { useI18n } from "@/components/providers/i18n-provider";
import { secondaryMarketBookHref, secondaryMarketHref } from "@/constants/dashboard/secondary-market";
import { analyticsReleaseDetailPath, secondaryMarketReleaseAnalyticsPath } from "@/constants/routes";
import { getSecondaryMarketAnalyticsCatalogIdForReleaseSlug } from "@/mocks/dashboard/secondary-market-listings.mock";
import { cn } from "@/lib/utils";

function formatUsdt(n: number) {
  return n.toLocaleString("ru-RU", {
    minimumFractionDigits: n % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

function liquidityLabel(l: WatchlistItem["liquidity"], t: (key: string) => string) {
  if (l === "high") return t("secondaryMarket.kpi.liquidity.high");
  if (l === "med") return t("secondaryMarket.kpi.liquidity.med");
  return t("secondaryMarket.kpi.liquidity.low");
}

function bookHref(bookMarketId: string | null) {
  if (!bookMarketId) return secondaryMarketHref("market");
  return secondaryMarketBookHref(bookMarketId);
}

type Props = {
  item: WatchlistItem | null;
  onOpenChange: (open: boolean) => void;
  onRemove: (id: string) => void;
};

export function SecondaryMarketWatchlistDetailSheet({ item, onOpenChange, onRemove }: Props) {
  const { t } = useI18n();
  const pos = item ? item.change24hPct >= 0 : true;
  const change24hLabel = t("secondaryMarket.watchlist.column24h");

  return (
    <SecondaryMarketResponsiveSheet
      open={item != null}
      onOpenChange={onOpenChange}
      side="right"
      headerVideo
      title={item?.track ?? t("secondaryMarket.listingDetail.releaseFallback")}
      description={item ? `${item.artist} · ${item.symbol}` : undefined}
      widthClassName="md:w-[min(100vw-1rem,480px)]"
      footer={
        item ? (
          <div className="space-y-2">
            <SplitonCtaPill
              href={bookHref(item.bookMarketId)}
              tone="onDark"
              className="h-11 w-full justify-between gap-3 pl-5 pr-1.5 text-[13px] font-semibold"
            >
              {item.bookMarketId ? t("secondaryMarket.watchlist.openBook") : t("secondaryMarket.actions.goToMarket")}
            </SplitonCtaPill>
            <div className="flex gap-2">
              <Link
                href={secondaryMarketReleaseAnalyticsPath(item.releaseId)}
                scroll={false}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-white/[0.06] px-4 text-[12px] font-medium text-zinc-200 transition hover:bg-white/[0.1]"
                onClick={() => onOpenChange(false)}
              >
                {t("secondaryMarket.watchlist.analytics")}
              </Link>
              <Link
                href={`${analyticsReleaseDetailPath(getSecondaryMarketAnalyticsCatalogIdForReleaseSlug(item.releaseId))}?from=catalog`}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-white/[0.06] px-4 text-[12px] font-medium text-zinc-200 transition hover:bg-white/[0.1]"
                onClick={() => onOpenChange(false)}
              >
                {t("secondaryMarket.actions.release")}
                <ExternalLink className="size-3.5 opacity-55" aria-hidden />
              </Link>
            </div>
            <button
              type="button"
              onClick={() => {
                onRemove(item.id);
                onOpenChange(false);
              }}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-white/[0.04] text-[12px] font-medium text-zinc-400 transition hover:bg-white/[0.08] hover:text-zinc-200"
            >
              <Trash2 className="size-4" aria-hidden />
              {t("secondaryMarket.watchlist.removeFromList")}
            </button>
          </div>
        ) : undefined
      }
    >
      {item ? (
        <div className="space-y-4 pb-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Star className="size-4 fill-white text-white" aria-hidden />
              <span className="text-[11px] text-zinc-500">{t("secondaryMarket.watchlist.inWatchlist")}</span>
            </div>
            {item.spark.length >= 2 ? (
              <ExchangeNeonSparkline
                values={item.spark}
                trend={pos ? "up" : "down"}
                width={88}
                height={26}
                detailSegments={4}
              />
            ) : null}
          </div>

          <dl className="space-y-0 text-[12px]">
            {[
              [t("secondaryMarket.trade.pricePerUnitUnt"), `${formatUsdt(item.pricePerUnit)} USDT`],
              [
                change24hLabel,
                `${pos ? "+" : ""}${item.change24hPct.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%`,
              ],
              [t("secondaryMarket.watchlist.listingsCount"), String(item.listingsCount)],
              [t("secondaryMarket.watchlist.unitsInBook"), String(item.unitsInBook)],
              [t("secondaryMarket.watchlist.deals24h"), String(item.deals24h)],
              [t("secondaryMarket.analytics.liquidity"), liquidityLabel(item.liquidity, t)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-white/[0.05] py-2.5">
                <dt className="text-zinc-500">{label}</dt>
                <dd
                  className={cn(
                    "text-right font-mono tabular-nums text-zinc-200",
                    label === change24hLabel && (pos ? "text-emerald-300/90" : "text-rose-300/90"),
                  )}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="rounded-2xl bg-white/[0.04] p-3.5 text-[12px] leading-relaxed text-zinc-500">
            {t("secondaryMarket.watchlist.detailHint")}
          </p>
        </div>
      ) : null}
    </SecondaryMarketResponsiveSheet>
  );
}
