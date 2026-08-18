"use client";

import { useSearchParams } from "next/navigation";
import { useLayoutEffect, useMemo } from "react";

import { isProfileDevicesView, parseProfilePageTabParam } from "@/constants/dashboard/profile-page";
import { ProfileAccountContent } from "@/components/dashboard/profile/profile-account-content";
import { ProfileDevicesPageContent } from "@/components/dashboard/profile/profile-devices-page";
import { ProfileSettingsContent } from "@/components/dashboard/profile/profile-settings-content";
import { ProfileSecurityContent } from "@/components/dashboard/profile/profile-security-content";
import { ProfileVerificationContent } from "@/components/dashboard/profile/profile-verification-content";
import { ProfileLegalContent } from "@/components/dashboard/profile/profile-legal-content";
import { ProfileOverviewContent } from "@/components/dashboard/profile/profile-overview-content";

export function ProfileDashboardScreen() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const viewParam = searchParams.get("view");
  const tab = useMemo(() => parseProfilePageTabParam(tabParam), [tabParam]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [tab, tabParam, viewParam]);

  if (isProfileDevicesView("/dashboard/profile", tabParam, viewParam)) {
    return (
      <div className="scroll-mt-24">
        <ProfileDevicesPageContent />
      </div>
    );
  }

  if (tab === "account") {
    return (
      <div className="scroll-mt-24">
        <ProfileAccountContent />
      </div>
    );
  }

  if (tab === "verification") {
    return (
      <div className="scroll-mt-24">
        <ProfileVerificationContent />
      </div>
    );
  }

  if (tab === "legal") {
    return (
      <div className="scroll-mt-24">
        <ProfileLegalContent />
      </div>
    );
  }

  if (tab === "security") {
    return (
      <div className="scroll-mt-24">
        <ProfileSecurityContent />
      </div>
    );
  }

  if (tab === "settings") {
    return (
      <div className="scroll-mt-24">
        <ProfileSettingsContent />
      </div>
    );
  }

  return (
    <div className="scroll-mt-24">
      <ProfileOverviewContent />
    </div>
  );
}

export function ProfileDashboardScreenFallback() {
  return (
    <div className="scroll-mt-24 space-y-3 sm:space-y-4" aria-busy="true">
      <div className="h-28 animate-pulse rounded-2xl bg-white/[0.06]" />
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <div className="h-40 animate-pulse rounded-2xl bg-white/[0.06]" />
        <div className="h-40 animate-pulse rounded-2xl bg-white/[0.06]" />
        <div className="h-44 animate-pulse rounded-2xl bg-white/[0.06]" />
        <div className="h-44 animate-pulse rounded-2xl bg-white/[0.06]" />
      </div>
    </div>
  );
}
