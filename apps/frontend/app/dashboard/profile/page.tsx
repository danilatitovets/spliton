import type { Metadata } from "next";
import { Suspense } from "react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  ProfileDashboardScreen,
  ProfileDashboardScreenFallback,
} from "@/components/dashboard/profile/profile-dashboard-screen";
import {
  ProfileSecondaryHeader,
  ProfileSecondaryHeaderFallback,
} from "@/components/dashboard/profile/profile-secondary-header";

export const metadata: Metadata = {
  title: "Профиль",
  description:
    "Профиль аккаунта RevShare: обзор, верификация, безопасность и настройки в макете кабинета.",
};

/** Тот же каркас, что у `/assets/*`: фон, scheme-light, отступы как у истории выплат */
export default function DashboardProfilePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#f6f7f9]">
      <DashboardHeader />
      <main className="scheme-light flex-1 text-neutral-900">
        <div className="mx-auto w-full max-w-[1320px] px-4 pb-5 sm:px-6 lg:px-8">
          <div className="space-y-4 pb-2">
            <Suspense fallback={<ProfileSecondaryHeaderFallback />}>
              <ProfileSecondaryHeader />
            </Suspense>
            <Suspense fallback={<ProfileDashboardScreenFallback />}>
              <ProfileDashboardScreen />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
