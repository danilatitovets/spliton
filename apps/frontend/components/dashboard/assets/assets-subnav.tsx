"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { assetsTabs } from "@/components/dashboard/assets/assets-tabs";
import { cn } from "@/lib/utils";

function isTabActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AssetsSubnav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-neutral-200 bg-[#fafafa]">
      <nav
        aria-label="Навигация раздела Мои активы"
        className="mx-auto flex h-12 w-full max-w-[1320px] items-end gap-5 overflow-x-auto px-4 sm:px-6 lg:px-8"
      >
        {assetsTabs.map((tab) => {
          const active = isTabActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "inline-flex h-full items-center border-b-2 text-sm font-medium transition-colors",
                active
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
