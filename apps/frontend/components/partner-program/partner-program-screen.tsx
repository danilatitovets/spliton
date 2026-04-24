"use client";

import * as React from "react";
import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PartnerProgramPageContent } from "@/components/partner-program/partner-program-page-content";
import { UnderlineTab } from "@/components/shared/exchange/underline-tab";
import {
  parsePartnerProgramTabParam,
  PARTNER_PROGRAM_TABS,
  PARTNER_TAB_META,
  type PartnerProgramTabId,
} from "@/constants/dashboard/partner-program";
import { cn } from "@/lib/utils";

const ZONE_PILL: Record<PartnerProgramTabId, string> = {
  about: "bg-[#B7F500]/12 text-[#d4f570] ring-1 ring-[#B7F500]/22",
  process: "bg-sky-500/10 text-sky-200/95 ring-1 ring-sky-400/18",
  community: "bg-violet-500/10 text-violet-200/95 ring-1 ring-violet-400/18",
  faq: "bg-amber-500/10 text-amber-200/95 ring-1 ring-amber-400/18",
};

function PartnerProgramScreenInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [tab, setTabState] = React.useState<PartnerProgramTabId>(() => {
    return parsePartnerProgramTabParam(searchParams.get("tab")) ?? "about";
  });

  React.useEffect(() => {
    const p = parsePartnerProgramTabParam(searchParams.get("tab"));
    if (p) setTabState(p);
  }, [searchParams]);

  const setTab = React.useCallback(
    (id: PartnerProgramTabId) => {
      setTabState(id);
      const next = new URLSearchParams(searchParams.toString());
      next.set("tab", id);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const pageMeta = PARTNER_TAB_META[tab];

  React.useEffect(() => {
    document.title = `${pageMeta.documentTitle} · Партнёрская программа · RevShare`;
  }, [pageMeta.documentTitle]);

  return (
    <div className="flex min-h-0 flex-col bg-black font-sans tabular-nums text-white antialiased">
      <header className="sticky top-0 z-40 shrink-0 border-b border-white/6 bg-black/95 backdrop-blur-sm supports-backdrop-filter:bg-black/85">
        <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8">
          <div className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between md:gap-4 md:py-3.5">
            <p
              className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600"
              aria-label="Контекст: партнёрская программа"
            >
              <span className="text-zinc-500">RevShare</span>
              <span className="text-zinc-800" aria-hidden>
                ·
              </span>
              <span className="text-zinc-400">Партнёрская программа</span>
              <span className="text-zinc-800" aria-hidden>
                ·
              </span>
              <span className="truncate text-zinc-500 normal-case tracking-normal">{pageMeta.documentTitle}</span>
            </p>
            <div className="flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              <span className="rounded-md bg-[#0a0a0a] px-2 py-1 ring-1 ring-white/8">USDT</span>
              <span className="rounded-md bg-[#0a0a0a] px-2 py-1 ring-1 ring-white/8">TRC20</span>
              <span className="rounded-md px-2 py-1 text-zinc-600">mock</span>
            </div>
          </div>

          <nav
            className="flex min-h-10 w-full flex-wrap items-center gap-x-1 gap-y-1 overflow-x-auto border-t border-white/6 pb-3 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-x-2 [&::-webkit-scrollbar]:hidden"
            aria-label="Разделы партнёрской программы"
          >
            {PARTNER_PROGRAM_TABS.map((t) => (
              <UnderlineTab key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
                {t.label}
              </UnderlineTab>
            ))}
          </nav>
        </div>
      </header>

      <main className="min-h-0 flex-1" aria-labelledby="partner-surface-title">
        <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8">
          <div
            key={tab}
            className="animate-secondary-market-surface-in border-b border-white/10 pb-6 pt-6 md:pb-8 md:pt-8"
          >
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em]",
                ZONE_PILL[tab],
              )}
            >
              {pageMeta.zoneLabel}
            </span>
            <h1
              id="partner-surface-title"
              className="mt-4 max-w-3xl text-2xl font-semibold tracking-tight text-white md:text-3xl"
            >
              {pageMeta.surfaceTitle}
            </h1>
            <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-zinc-500 md:text-[15px]">
              {pageMeta.surfaceSubtitle}
            </p>
          </div>

          <div key={`${tab}-body`} className="animate-secondary-market-surface-in pb-20 pt-6 md:pt-8">
            <PartnerProgramPageContent activeTab={tab} />
          </div>
        </div>
      </main>
    </div>
  );
}

export function PartnerProgramScreen() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] bg-black" aria-hidden />}>
      <PartnerProgramScreenInner />
    </Suspense>
  );
}
