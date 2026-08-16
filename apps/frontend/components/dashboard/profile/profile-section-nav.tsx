"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { DashboardSectionSubheaderShell } from "@/components/dashboard/dashboard-section-subheader-shell";
import { MagnificationDock } from "@/components/ui/magnification-dock";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  PROFILE_PAGE_TABS,
  parseProfilePageTabParam,
  profileDashboardHref,
  type ProfilePageTabId,
} from "@/constants/dashboard/profile-page";
import { profileTabLabel } from "@/lib/i18n/profile-messages";
import { FileText, Lock, Settings, ShieldCheck, UserRound } from "@/lib/lucide";

const TAB_ICONS: Record<ProfilePageTabId, typeof UserRound> = {
  overview: UserRound,
  verification: ShieldCheck,
  legal: FileText,
  security: Lock,
  settings: Settings,
};

export function ProfileSectionNav() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { locale, t } = useI18n();
  const tab = useMemo(
    () => parseProfilePageTabParam(searchParams.get("tab")),
    [searchParams],
  );

  const items = useMemo(
    () =>
      PROFILE_PAGE_TABS.map((item) => {
        const Icon = TAB_ICONS[item.id];
        const label = profileTabLabel(item.id, locale);
        return {
          icon: <Icon size={20} strokeWidth={1.85} aria-hidden />,
          label,
          active: item.id === tab,
          onClick: () => {
            router.push(profileDashboardHref(item.id), { scroll: false });
          },
        };
      }),
    [locale, router, tab],
  );

  if (!pathname.startsWith("/dashboard/profile")) return null;

  return (
    <DashboardSectionSubheaderShell variant="dark" innerClassName="flex justify-center py-2 sm:py-2.5">
      <MagnificationDock
        items={items}
        ariaLabel={t("profile.nav.ariaLabel")}
        panelHeight={58}
        baseItemSize={42}
        magnification={62}
        distance={140}
        dockHeight={120}
        spring={{ mass: 0.12, stiffness: 170, damping: 14 }}
      />
    </DashboardSectionSubheaderShell>
  );
}
