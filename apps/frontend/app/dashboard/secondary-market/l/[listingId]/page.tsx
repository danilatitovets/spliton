import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SecondaryMarketListingInfoScreen } from "@/components/dashboard/secondary-market/secondary-market-listing-info-screen";
import { getReleaseDetailPageData } from "@/lib/analytics/release-detail";
import {
  getSecondaryMarketListingById,
  SECONDARY_MARKET_LISTINGS_MOCK,
} from "@/mocks/dashboard/secondary-market-listings.mock";

type PageProps = { params: Promise<{ listingId: string }> };

export function generateStaticParams() {
  return SECONDARY_MARKET_LISTINGS_MOCK.map((l) => ({ listingId: l.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { listingId } = await params;
  const row = getSecondaryMarketListingById(listingId);
  if (!row) return { title: "Лот" };
  return {
    title: `${row.symbol} · ${row.track}`,
    description: `Лот на вторичном рынке RevShare: ${row.track} · ${row.artist}. Параметры предложения (макет).`,
  };
}

export default async function SecondaryMarketListingInfoPage({ params }: PageProps) {
  const { listingId } = await params;
  const listing = getSecondaryMarketListingById(listingId);
  if (!listing) notFound();

  const releaseDetail = getReleaseDetailPageData(listing.analyticsCatalogId);
  if (!releaseDetail) notFound();

  return (
    <div className="flex min-h-dvh flex-col bg-black text-white antialiased">
      <DashboardHeader sticky={false} />
      <SecondaryMarketListingInfoScreen listing={listing} releaseDetail={releaseDetail} />
    </div>
  );
}
