"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { DashboardSectionSubheaderShell } from "@/components/dashboard/dashboard-section-subheader-shell";
import { useI18n } from "@/components/providers/i18n-provider";
import { PillNav } from "@/components/ui/pill-nav";
import {
  PROFILE_PAGE_TABS,
  profileDashboardHref,
  resolveProfilePageTab,
  type ProfilePageTabId,
} from "@/constants/dashboard/profile-page";
import { profileTabLabel } from "@/lib/i18n/profile-messages";
import { FileText, IdCard, Lock, Settings, ShieldCheck, UserRound } from "@/lib/lucide";

const TAB_ICONS: Record<ProfilePageTabId, typeof UserRound> = {
  overview: UserRound,
  account: IdCard,
  verification: ShieldCheck,
  legal: FileText,
  security: Lock,
  settings: Settings,
};

export function ProfileSectionNav() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { locale, t } = useI18n();
  const tab = useMemo(
    () => resolveProfilePageTab(pathname, searchParams.get("tab")),
    [pathname, searchParams],
  );

  const items = useMemo(
    () =>
      PROFILE_PAGE_TABS.map((item) => {
        const Icon = TAB_ICONS[item.id];
        const label = profileTabLabel(item.id, locale);
        return {
          href: profileDashboardHref(item.id),
          icon: <Icon size={16} strokeWidth={1.9} aria-hidden />,
          label,
          active: item.id === tab,
        };
      }),
    [locale, tab],
  );

  if (!pathname.startsWith("/dashboard/profile")) return null;

  return (
    <DashboardSectionSubheaderShell
      variant="dark"
      innerClassName="flex max-w-none items-center justify-stretch gap-0 bg-transparent px-1 py-2 sm:px-2 md:px-4 md:py-3.5 lg:px-4 xl:px-5"
    >
      <div className="hidden size-7 shrink-0 xl:block" aria-hidden />
      <span className="mx-1 hidden h-5 w-px shrink-0 xl:block" aria-hidden />
      <div className="w-full min-w-0 xl:pl-3">
        <PillNav items={items} ariaLabel={t("profile.nav.ariaLabel")} iconOnlyMobile />
      </div>
    </DashboardSectionSubheaderShell>
  );
}
