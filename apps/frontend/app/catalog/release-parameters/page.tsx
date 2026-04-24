import type { Metadata } from "next";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ReleaseParametersScreen } from "@/components/release-parameters/release-parameters-screen";

export const metadata: Metadata = {
  title: "Параметры релиза",
  description:
    "Как читать карточку релиза в каталоге RevShare: units, investor share, raise target, payout model, статус и вторичный рынок.",
};

export default function CatalogReleaseParametersPage() {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden">
      <div className="sticky top-0 z-120 shrink-0 bg-black">
        <DashboardHeader />
      </div>
      <div className="flex h-0 min-h-0 flex-1 flex-col overflow-hidden">
        <ReleaseParametersScreen />
      </div>
    </div>
  );
}
