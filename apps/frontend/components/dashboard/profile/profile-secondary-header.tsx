"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import {
  PROFILE_PAGE_TABS,
  parseProfilePageTabParam,
  profileDashboardHref,
} from "@/constants/dashboard/profile-page";
import { cn } from "@/lib/utils";

/** Второй ряд как у `PayoutsSectionHeader` на `/assets/payouts/history` */
export function ProfileSecondaryHeader() {
  const searchParams = useSearchParams();
  const tab = useMemo(
    () => parseProfilePageTabParam(searchParams.get("tab")),
    [searchParams],
  );

  return (
    <div className="sticky top-[52px] z-85">
      <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 border-b border-neutral-200 bg-white">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Профиль: разделы"
            className="flex h-9 items-end gap-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {PROFILE_PAGE_TABS.map((t) => {
              const isActive = t.id === tab;
              return (
                <Link
                  key={t.id}
                  href={profileDashboardHref(t.id)}
                  scroll={false}
                  className={cn(
                    "inline-flex h-full items-center border-b-2 px-0.5 text-[12px] font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "border-neutral-900 text-neutral-900"
                      : "border-transparent text-neutral-500 hover:text-neutral-800",
                  )}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

export function ProfileSecondaryHeaderFallback() {
  return (
    <div className="sticky top-[52px] z-85">
      <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-9 w-full max-w-[1320px] items-end px-4 sm:px-6 lg:px-8">
          <div className="mb-1.5 h-3 w-48 animate-pulse rounded bg-neutral-100" />
        </div>
      </div>
    </div>
  );
}
