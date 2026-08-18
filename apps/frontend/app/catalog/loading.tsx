import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CatalogCardsSkeleton } from "@/features/catalog/ui/catalog-skeleton";

export default function CatalogLoading() {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-black">
      <div className="sticky top-0 z-120 shrink-0 bg-black">
        <DashboardHeader sticky={false} flushBottom />
      </div>
      <div className="flex h-0 min-h-0 flex-1 flex-col overflow-hidden py-6 sm:py-8">
        <CatalogCardsSkeleton />
      </div>
    </div>
  );
}