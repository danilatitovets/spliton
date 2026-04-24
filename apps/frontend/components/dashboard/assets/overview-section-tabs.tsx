"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const tabs = [
  { href: ROUTES.dashboardOverview, label: "Сводка" },
  { href: ROUTES.dashboardMetrics, label: "Метрики" },
  { href: ROUTES.dashboardActivity, label: "Активность" },
  { href: ROUTES.dashboardPositions, label: "Позиции" },
];

export function OverviewSectionTabs() {
  const pathname = usePathname();

  return (
    <div className="sticky top-[52px] z-85">
      <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 border-b border-neutral-200 bg-white">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Секции обзора"
            className="flex h-9 items-end gap-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {tabs.map((tab) => {
              const active =
                pathname === tab.href ||
                pathname.startsWith(`${tab.href}/`) ||
                (tab.href === ROUTES.dashboardPositions && pathname.startsWith(`${ROUTES.myAssetsSellUnits}/`));
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "inline-flex h-full items-center border-b-2 px-0.5 text-[12px] font-medium whitespace-nowrap transition-colors",
                    active ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-800"
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
