import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function SecondaryMarketLoading() {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-black">
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto" data-mobile-scroll-root>
        <DashboardHeader sticky={false} />
        <div className="mx-auto w-full max-w-[1200px] space-y-3 px-4 py-6 sm:px-6" aria-busy="true">
          <div className="h-10 w-48 animate-pulse rounded-xl bg-white/[0.06]" />
          <div className="h-64 animate-pulse rounded-2xl bg-white/[0.06]" />
          <div className="h-40 animate-pulse rounded-2xl bg-white/[0.06]" />
        </div>
      </div>
    </div>
  );
}