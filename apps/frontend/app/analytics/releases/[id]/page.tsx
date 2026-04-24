import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ReleaseDetailScreen } from "@/features/analytics/releases/detail/release-detail-screen";
import { getReleaseAnalyticsRowById, getReleaseDetailPageData } from "@/lib/analytics/release-detail";

type PageProps = { params: Promise<{ id: string }> };
type PageSearchParams = Promise<{ from?: string | string[]; view?: string | string[] }>;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const row = getReleaseAnalyticsRowById(id);
  if (!row) return { title: "Релиз" };
  return {
    title: `${row.symbol} · ${row.release}`,
    description: `Карточка релиза RevShare: revenue share, units и выплаты USDT (TRC20). ${row.artist}.`,
  };
}

export default async function AnalyticsReleaseDetailPage({
  params,
  searchParams,
}: PageProps & { searchParams: PageSearchParams }) {
  const { id } = await params;
  const { from, view } = await searchParams;
  const source = Array.isArray(from) ? from[0] : from;
  const viewParam = Array.isArray(view) ? view[0] : view;
  const showPersonalLedger = viewParam === "ledger";
  const data = getReleaseDetailPageData(id);
  if (!data) notFound();

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden">
      <div className="sticky top-0 z-120 shrink-0 bg-black">
        <DashboardHeader />
      </div>
      <div className="flex h-0 min-h-0 flex-1 flex-col overflow-auto">
        <ReleaseDetailScreen data={data} source={source} showPersonalLedger={showPersonalLedger} />
      </div>
    </div>
  );
}
