"use client";

import { SecondaryMarketBreadcrumbNav } from "@/components/dashboard/secondary-market/secondary-market-breadcrumb-nav";
import { secondaryMarketHref } from "@/constants/dashboard/secondary-market";

import { SecondaryMarketOrderBookTab } from "./secondary-market-order-book-tab";

export function SecondaryMarketBookPage({ marketId }: { marketId: string }) {
  const pairLabel = `${marketId.toUpperCase()}/USDT`;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[#050505] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(183,245,0,0.08), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(232,121,249,0.06), transparent 50%)",
        }}
      />
      <header className="relative z-[1] shrink-0 border-b border-white/[0.09] bg-black/30 px-4 py-2.5 backdrop-blur-sm md:px-5">
        <SecondaryMarketBreadcrumbNav
          items={[
            { label: "Вторичный рынок", href: secondaryMarketHref("market") },
            { label: "Рынок листингов", href: secondaryMarketHref("market") },
            { label: `Терминал · ${pairLabel}` },
          ]}
        />
      </header>
      <div className="relative z-[1] min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3 pt-2 md:px-5 md:pb-4">
        <SecondaryMarketOrderBookTab layout="workspace" initialMarketId={marketId} />
      </div>
    </div>
  );
}
