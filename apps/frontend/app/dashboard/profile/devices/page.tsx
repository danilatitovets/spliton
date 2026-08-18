import type { Metadata } from "next";
import { Suspense } from "react";

import { ProfileDevicesPageContent } from "@/components/dashboard/profile/profile-devices-page";
import { ProfileSectionNav } from "@/components/dashboard/profile/profile-section-nav";
import { DashboardAppShell } from "@/components/layout/dashboard-app-shell";
import { profilePageMetaAsync } from "@/lib/i18n/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return profilePageMetaAsync("profile.devices.title", "profile.devices.description");
}

export default function ProfileDevicesPage() {
  return (
    <DashboardAppShell
      tone="dark"
      subheader={
        <Suspense fallback={null}>
          <ProfileSectionNav />
        </Suspense>
      }
      contentClassName="space-y-3 px-2.5 pb-[calc(4.25rem+env(safe-area-inset-bottom,0px)+0.75rem)] sm:space-y-4 sm:px-6 sm:pb-5 lg:px-8"
    >
      <ProfileDevicesPageContent />
    </DashboardAppShell>
  );
}
