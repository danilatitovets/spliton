"use client";

import * as React from "react";
import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ReferralProgramPageContent } from "@/components/referral/referral-program-page-content-live";
import { useI18n } from "@/components/providers/i18n-provider";
import { smExchange } from "@/components/dashboard/secondary-market/secondary-market-exchange-styles";
import {
  parseReferralProgramTabParam,
  REFERRAL_PROGRAM_TABS,
  type ReferralProgramTabId,
} from "@/constants/dashboard/referral-program";
import { cn } from "@/lib/utils";

function ReferralProgramScreenInner() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [tab, setTabState] = React.useState<ReferralProgramTabId>(() => {
    return parseReferralProgramTabParam(searchParams.get("tab")) ?? "program";
  });

  React.useEffect(() => {
    const p = parseReferralProgramTabParam(searchParams.get("tab"));
    if (p) setTabState(p);
  }, [searchParams]);

  const setTab = React.useCallback(
    (id: ReferralProgramTabId) => {
      setTabState(id);
      const next = new URLSearchParams(searchParams.toString());
      next.set("tab", id);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const documentTitle = t(`referral.tabMeta.${tab}.documentTitle`);

  React.useEffect(() => {
    document.title = `${documentTitle} · ${t("referral.screen.documentSuffix")}`;
  }, [documentTitle, t]);

  return (
    <div className="flex min-h-0 flex-col bg-black font-sans tabular-nums text-white antialiased">
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8">
        <nav
          className="flex gap-1.5 overflow-x-auto py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={t("referral.screen.navAria")}
        >
          {REFERRAL_PROGRAM_TABS.map((tabItem) => (
            <button
              key={tabItem.id}
              type="button"
              onClick={() => setTab(tabItem.id)}
              className={cn(
                smExchange.chipBase,
                "px-3.5 py-2 text-[13px]",
                tab === tabItem.id ? smExchange.chipActive : smExchange.chipIdle,
              )}
            >
              {t(`referral.tab.${tabItem.id}`)}
            </button>
          ))}
        </nav>
      </div>

      <main className="min-h-0 flex-1">
        <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8">
          <div key={`${tab}-body`} className="animate-secondary-market-surface-in pb-20 pt-1">
            <ReferralProgramPageContent activeTab={tab} onRequestProgramTab={() => setTab("program")} />
          </div>
        </div>
      </main>
    </div>
  );
}

export function ReferralProgramScreen() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] bg-black" aria-hidden />}>
      <ReferralProgramScreenInner />
    </Suspense>
  );
}