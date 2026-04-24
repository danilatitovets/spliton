import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SecondaryMarketBookPage } from "@/components/dashboard/secondary-market/secondary-market-book-page";
import { isSecondaryBookMarketQuery } from "@/constants/dashboard/secondary-market";

type PageProps = { params: Promise<{ marketId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { marketId } = await params;
  if (!isSecondaryBookMarketQuery(marketId)) return { title: "Стакан" };
  const sym = marketId.toUpperCase();
  return {
    title: `${sym} · Стакан`,
    description: `Книга ордеров и заявки RevShare (макет): ${sym}/USDT.`,
  };
}

export default async function SecondaryMarketBookRoutePage({ params }: PageProps) {
  const { marketId } = await params;
  if (!isSecondaryBookMarketQuery(marketId)) notFound();

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-black">
      <div className="shrink-0">
        <DashboardHeader sticky={false} />
      </div>
      <SecondaryMarketBookPage marketId={marketId} />
    </div>
  );
}
