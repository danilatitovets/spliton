"use client";

import Link from "next/link";

import { PROFILE_MEGAMENU_ITEMS } from "@/components/dashboard/dashboard-megamenu";
import { cn } from "@/lib/utils";

/** Вертикальный список для мобильного `details` у иконки профиля */
export function DashboardProfileMobileLinks({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="border-t border-white/8 py-1">
      {PROFILE_MEGAMENU_ITEMS.map((tab) => (
        <Link
          key={tab.label}
          href={tab.href}
          onClick={onNavigate}
          className={cn(
            "block px-3 py-2.5 text-sm transition-colors hover:bg-white/[0.05]",
            tab.danger ? "text-fuchsia-300/95 hover:text-fuchsia-200" : "text-neutral-300",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
