import type { Metadata } from "next";

import { DashboardCatalogPage } from "@/components/dashboard/dashboard-catalog-page";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export const metadata: Metadata = {
  title: "Каталог релизов",
  description:
    "Каталог revenue share релизов RevShare: units, раунды, USDT (TRC20), вторичный рынок передачи rights — ориентиры по карточке, не гарантии.",
};

export default function CatalogRoutePage() {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden">
      <div className="sticky top-0 z-120 shrink-0 bg-black">
        <DashboardHeader />
      </div>
      <div className="flex h-0 min-h-0 flex-1 flex-col overflow-hidden">
        <DashboardCatalogPage />
      </div>
    </div>
  );
}
