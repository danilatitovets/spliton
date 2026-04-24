import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OverviewSectionTabs } from "@/components/dashboard/assets/overview-section-tabs";
import { assetsSellUnitsPath } from "@/constants/routes";
import { AssetsSellUnitsScreen } from "@/features/assets/sell-units/assets-sell-units-screen";
import { getHoldingPreviewForCatalogReleaseId } from "@/lib/assets/holdings";
import { getMarketOverviewRowByCatalogId } from "@/lib/catalog/release-market-analytics";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const row = getMarketOverviewRowByCatalogId(id);
  if (!row) return { title: "Продажа units" };
  return {
    title: `${row.symbol} · Продать units`,
    description: `Выставление units по релизу «${row.title}» с лимитной ценой. Макет кабинета RevShare.`,
    alternates: { canonical: assetsSellUnitsPath(id) },
  };
}

export default async function AssetsSellUnitsPage({ params }: PageProps) {
  const { id } = await params;
  const row = getMarketOverviewRowByCatalogId(id);
  const holding = getHoldingPreviewForCatalogReleaseId(id);
  if (!row || !holding) notFound();

  return (
    <div className="space-y-10 pb-8 sm:space-y-12">
      <OverviewSectionTabs />
      <AssetsSellUnitsScreen row={row} holding={holding} />
    </div>
  );
}
