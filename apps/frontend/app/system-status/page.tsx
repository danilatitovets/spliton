import type { Metadata } from "next";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SystemStatusPageContent } from "@/components/system-status/system-status-page-content";
import { SystemStatusPageHero } from "@/components/system-status/system-status-page-hero";
import { systemStatusPageMetaAsync } from "@/lib/i18n/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return systemStatusPageMetaAsync("meta.systemStatus.title", "meta.systemStatus.description");
}

export default function SystemStatusPage() {
  return (
    <div className="relative flex min-h-dvh flex-col bg-black text-white">
      <DashboardHeader />
      <main className="relative z-10 flex-1 pb-16 pt-6 sm:pt-8">
        <SystemStatusPageHero />
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <SystemStatusPageContent />
        </div>
      </main>
    </div>
  );
}
