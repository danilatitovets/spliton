"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { useI18n } from "@/components/providers/i18n-provider";
import {
  resolveProfilePageTab,
  type ProfilePageTabId,
} from "@/constants/dashboard/profile-page";
import { profileTabLabel } from "@/lib/i18n/profile-messages";
import { ChevronDown } from "@/lib/lucide";

export function ProfilePageHeader() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { locale, t } = useI18n();
  const tab = useMemo(
    () => resolveProfilePageTab(pathname, searchParams.get("tab")),
    [pathname, searchParams],
  );
  const title = profileTabLabel(tab as ProfilePageTabId, locale) || t("profile.header.fallbackTitle");

  return (
    <header className="-mx-4 border-b border-white/[0.08] bg-black px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex items-center gap-1.5">
        <h1 className="text-[1.25rem] font-semibold tracking-tight text-white sm:text-[1.35rem]">{title}</h1>
        <ChevronDown className="size-5 text-zinc-500" strokeWidth={2} aria-hidden />
      </div>
    </header>
  );
}
