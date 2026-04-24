"use client";

import * as React from "react";
import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SecondaryMarketMarketTab } from "@/components/dashboard/secondary-market/secondary-market-market-tab";
import { SecondaryMarketMyOrdersTab } from "@/components/dashboard/secondary-market/secondary-market-my-orders-tab";
import { SecondaryMarketReleaseAnalyticsTab } from "@/components/dashboard/secondary-market/secondary-market-release-analytics-tab";
import { SecondaryMarketTradeHistoryTab } from "@/components/dashboard/secondary-market/secondary-market-trade-history-tab";
import { SecondaryMarketWatchlistTab } from "@/components/dashboard/secondary-market/secondary-market-watchlist-tab";
import { SecondaryMarketRulesTab } from "@/components/dashboard/secondary-market/secondary-market-rules-tab";
import { UnderlineTab } from "@/components/shared/exchange/underline-tab";
import {
  isSecondaryBookMarketQuery,
  SECONDARY_MARKET_TAB_META,
  SECONDARY_MARKET_TABS,
  parseSecondaryMarketTabParam,
  type SecondaryMarketTabId,
  type SecondaryMarketTabZone,
} from "@/constants/dashboard/secondary-market";
import { secondaryMarketBookPath } from "@/constants/routes";
import {
  getSecondaryMarketListingByReleaseId,
  isSecondaryMarketReleaseIdKnown,
} from "@/mocks/dashboard/secondary-market-listings.mock";
import { cn } from "@/lib/utils";

const ZONE_PILL: Record<SecondaryMarketTabZone, string> = {
  trading: "bg-[#B7F500]/12 text-[#d4f570] ring-1 ring-[#B7F500]/22",
  operations: "bg-sky-500/10 text-sky-200/95 ring-1 ring-sky-400/18",
  ledger: "bg-violet-500/10 text-violet-200/95 ring-1 ring-violet-400/18",
  research: "bg-fuchsia-500/10 text-fuchsia-200/95 ring-1 ring-fuchsia-400/18",
  reference: "bg-amber-500/10 text-amber-200/95 ring-1 ring-amber-400/18",
};

function SecondaryMarketScreenInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tab: SecondaryMarketTabId = parseSecondaryMarketTabParam(searchParams.get("tab")) ?? "market";

  const setTab = React.useCallback(
    (id: SecondaryMarketTabId) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("tab", id);
      if (id !== "market") next.delete("market");
      if (id !== "analytics") next.delete("release");
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  React.useEffect(() => {
    const rawTab = searchParams.get("tab");
    if (rawTab !== "book") return;
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", "market");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  /** Старые ссылки `?tab=market&market=` ведут на отдельную страницу стакана. */
  React.useEffect(() => {
    const m = searchParams.get("market");
    if (tab !== "market" || !isSecondaryBookMarketQuery(m)) return;
    router.replace(secondaryMarketBookPath(m));
  }, [router, searchParams, tab]);

  const pageMeta = SECONDARY_MARKET_TAB_META[tab];

  const releaseRaw = searchParams.get("release");
  const analyticsReleaseId =
    tab === "analytics" && releaseRaw && isSecondaryMarketReleaseIdKnown(releaseRaw) ? releaseRaw : null;
  const analyticsUnknownRelease =
    tab === "analytics" &&
    typeof releaseRaw === "string" &&
    releaseRaw.length > 0 &&
    !isSecondaryMarketReleaseIdKnown(releaseRaw);

  React.useEffect(() => {
    let head = pageMeta.documentTitle;
    if (tab === "analytics" && analyticsReleaseId) {
      const row = getSecondaryMarketListingByReleaseId(analyticsReleaseId);
      if (row) head = `${row.symbol} · ${head}`;
    }
    document.title = `${head} · Вторичный рынок · RevShare`;
  }, [analyticsReleaseId, pageMeta.documentTitle, tab]);

  const tabBody = (() => {
    switch (tab) {
      case "market":
        return <SecondaryMarketMarketTab />;
      case "analytics":
        return (
          <SecondaryMarketReleaseAnalyticsTab
            releaseId={analyticsReleaseId}
            unknownReleaseQuery={analyticsUnknownRelease}
          />
        );
      case "orders":
        return <SecondaryMarketMyOrdersTab />;
      case "history":
        return <SecondaryMarketTradeHistoryTab />;
      case "watchlist":
        return <SecondaryMarketWatchlistTab />;
      case "rules":
        return <SecondaryMarketRulesTab />;
      default:
        return <SecondaryMarketMarketTab />;
    }
  })();

  return (
    <div className="flex min-h-0 flex-col bg-black font-sans tabular-nums text-white antialiased">
      <header className="sticky top-0 z-40 shrink-0 border-b border-white/6 bg-black/95 backdrop-blur-sm supports-backdrop-filter:bg-black/85">
        <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8">
          <nav
            className="flex min-h-10 w-full flex-wrap items-center gap-x-1 gap-y-1 overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-x-2 [&::-webkit-scrollbar]:hidden"
            aria-label="Разделы вторичного рынка"
          >
            {SECONDARY_MARKET_TABS.map((t) => (
              <UnderlineTab key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
                {t.label}
              </UnderlineTab>
            ))}
          </nav>
        </div>
      </header>

      <main
        className="min-h-0 flex-1"
        {...(tab === "analytics"
          ? { "aria-label": "Вторичный рынок" }
          : { "aria-labelledby": "secondary-market-surface-title" })}
      >
        <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8">
          {tab !== "analytics" ? (
            <div
              key={tab}
              className="animate-secondary-market-surface-in border-b border-white/10 pb-6 pt-6 md:pb-8 md:pt-8"
            >
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em]",
                  ZONE_PILL[pageMeta.zone],
                )}
              >
                {pageMeta.zoneLabel}
              </span>
              <h1
                id="secondary-market-surface-title"
                className="mt-4 max-w-3xl text-2xl font-semibold tracking-tight text-white md:text-3xl"
              >
                {pageMeta.surfaceTitle}
              </h1>
              <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-zinc-500 md:text-[15px]">
                {pageMeta.surfaceSubtitle}
              </p>
            </div>
          ) : null}

          <div
            key={`${tab}-body`}
            className={cn(
              "animate-secondary-market-surface-in pb-20",
              tab === "analytics" ? "pt-4 md:pt-5" : "pt-6 md:pt-8",
            )}
          >
            {tabBody}
          </div>
        </div>
      </main>
    </div>
  );
}

export function SecondaryMarketScreen() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] bg-black" aria-hidden />}>
      <SecondaryMarketScreenInner />
    </Suspense>
  );
}
