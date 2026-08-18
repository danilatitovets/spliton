import { ProfileDashboardScreenFallback } from "@/components/dashboard/profile/profile-dashboard-screen";
import { DashboardAppShell } from "@/components/layout/dashboard-app-shell";

export default function DashboardProfileLoading() {
  return (
    <DashboardAppShell
      tone="dark"
      subheader={
        <div className="h-12 border-b border-white/[0.06] bg-black" aria-hidden>
          <div className="mx-auto flex h-full max-w-[1200px] items-center gap-2 px-4 sm:px-6 lg:px-8">
            <div className="h-8 w-24 animate-pulse rounded-full bg-white/[0.06]" />
            <div className="h-8 w-20 animate-pulse rounded-full bg-white/[0.06]" />
            <div className="h-8 w-28 animate-pulse rounded-full bg-white/[0.06]" />
          </div>
        </div>
      }
      contentClassName="space-y-3 px-2.5 pb-[calc(4.25rem+env(safe-area-inset-bottom,0px)+0.75rem)] sm:space-y-4 sm:px-6 sm:pb-5 lg:px-8"
    >
      <ProfileDashboardScreenFallback />
    </DashboardAppShell>
  );
}