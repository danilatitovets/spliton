import type { Metadata } from "next";
import { Suspense } from "react";

import {
  ProfileDashboardScreen,
  ProfileDashboardScreenFallback,
} from "@/components/dashboard/profile/profile-dashboard-screen";
import { ProfileSectionNav } from "@/components/dashboard/profile/profile-section-nav";
import { DashboardAppShell } from "@/components/layout/dashboard-app-shell";
import { profilePageMetaAsync } from "@/lib/i18n/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return profilePageMetaAsync("meta.profile.title", "meta.profile.description");
}

export default function DashboardProfilePage() {
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
      <Suspense fallback={<ProfileDashboardScreenFallback />}>
        <ProfileDashboardScreen />
      </Suspense>
    </DashboardAppShell>
  );
}
