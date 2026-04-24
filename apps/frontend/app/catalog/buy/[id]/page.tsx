import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { catalogBuyUnitsPath } from "@/constants/routes";
import { CatalogBuyUnitsScreen } from "@/features/catalog/buy-units/catalog-buy-units-screen";
import { getMarketOverviewRowByCatalogId } from "@/lib/catalog/release-market-analytics";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const row = getMarketOverviewRowByCatalogId(id);
  if (!row) return { title: "Покупка units" };
  return {
    title: `${row.symbol} · Купить units`,
    description: `Оформление покупки units по релизу «${row.title}». Макет интерфейса RevShare.`,
    alternates: { canonical: catalogBuyUnitsPath(id) },
  };
}

export default async function CatalogBuyUnitsPage({ params }: PageProps) {
  const { id } = await params;
  const row = getMarketOverviewRowByCatalogId(id);
  if (!row) notFound();

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-white">
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
        <DashboardHeader sticky={false} />
        <CatalogBuyUnitsScreen row={row} />
      </div>
    </div>
  );
}
