import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { catalogMarketOverviewReleaseAnalyticsPath } from "@/constants/routes";
import { ReleaseMarketAnalyticsScreen } from "@/features/catalog/market-overview/release-analytics/release-market-analytics-screen";
import { getCatalogReleaseMarketAnalyticsPageData } from "@/lib/catalog/release-market-analytics";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = getCatalogReleaseMarketAnalyticsPageData(id);
  if (!data) return { title: "Аналитика релиза" };
  return {
    title: `${data.header.symbol} · ${data.header.releaseTitle}`,
    description: `Внутренняя аналитика релиза: метрики, графики, ликвидность и выплаты. ${data.header.artist}.`,
    alternates: {
      canonical: catalogMarketOverviewReleaseAnalyticsPath(id),
    },
  };
}

export default async function CatalogMarketOverviewReleaseAnalyticsPage({ params }: PageProps) {
  const { id } = await params;
  const data = getCatalogReleaseMarketAnalyticsPageData(id);
  if (!data) notFound();

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-black">
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
        <DashboardHeader sticky={false} />
        <ReleaseMarketAnalyticsScreen data={data} />
      </div>
    </div>
  );
}
