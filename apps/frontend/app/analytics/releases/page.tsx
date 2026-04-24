import type { Metadata } from "next";

import { ReleaseAnalyticsPage } from "@/components/dashboard/release-analytics-page";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export const metadata: Metadata = {
  title: "Аналитика релизов",
  description:
    "Сравнение доходности релизов RevShare: динамика, выплаты, units и ключевые метрики по активам.",
};

export default function AnalyticsReleasesRoutePage() {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden">
      <div className="sticky top-0 z-120 shrink-0 bg-black">
        <DashboardHeader />
      </div>
      <div className="flex h-0 min-h-0 flex-1 flex-col overflow-hidden">
        <ReleaseAnalyticsPage />
      </div>
    </div>
  );
}
