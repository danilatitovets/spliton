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
  about: "bg-zinc-800/45 text-zinc-100 ring-1 ring-zinc-500/35",
  process: "bg-zinc-800/45 text-zinc-100 ring-1 ring-zinc-500/35",
  community: "bg-zinc-800/45 text-zinc-100 ring-1 ring-zinc-500/35",
  faq: "bg-zinc-800/45 text-zinc-100 ring-1 ring-zinc-500/35",
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
            <p className="text-xl font-semibold tracking-tight text-white md:text-2xl">Партнёрская программа</p>
          </div>

          <nav
            className="flex min-h-10 w-full flex-wrap items-center gap-x-1 gap-y-1 overflow-x-auto border-t border-white/6 pb-3 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-x-2 [&::-webkit-scrollbar]:hidden"
            aria-label="Разделы партнёрской программы"
          >
            {PARTNER_PROGRAM_TABS.map((t) => (
              <UnderlineTab key={t.id} active={tab === t.id} onClick={() => setTab(t.id)} tone="neutral">
                {t.label}
              </UnderlineTab>
            ))}
          </nav>
        </div>
      </header>

      <main className="min-h-0 flex-1" aria-labelledby="partner-surface-title">
        <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8">
          <div key={`${tab}-body`} className="animate-secondary-market-surface-in pb-20 pt-6">
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
