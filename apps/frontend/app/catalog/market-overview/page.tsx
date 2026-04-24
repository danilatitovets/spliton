import type { Metadata } from "next";
import { Suspense } from "react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MarketOverviewScreen } from "@/components/market-overview/market-overview-screen";

export const metadata: Metadata = {
  title: "Обзор рынка",
  description:
    "Срез внутреннего рынка RevShare: ликвидность стакана, размещения, secondary и сегменты. Сравнение доходности по релизам — в аналитике.",
};

export default function CatalogMarketOverviewPage() {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden">
      <div className="sticky top-0 z-120 shrink-0 bg-black">
        <DashboardHeader />
      </div>
      <div className="flex h-0 min-h-0 flex-1 flex-col overflow-hidden">
        <Suspense fallback={<div className="h-full min-h-[320px] bg-black" aria-hidden />}>
          <MarketOverviewScreen />
        </Suspense>
      </div>
    </div>
  );
}
