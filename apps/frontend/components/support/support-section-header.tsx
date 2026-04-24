"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const supportHeaderItems: Array<{
  href: string;
  label: string;
  /** Только `/support` */
  supportRoot?: boolean;
}> = [
  { href: ROUTES.support, label: "Поддержка", supportRoot: true },
  { href: ROUTES.dashboardPayoutsHistory, label: "История" },
  { href: `${ROUTES.dashboardPayouts}/deposit`, label: "Пополнить" },
  { href: `${ROUTES.dashboardPayouts}/withdraw`, label: "Вывод" },
  { href: ROUTES.guideSelection, label: "Гиды" },
];

function isSupportNavActive(pathname: string, item: (typeof supportHeaderItems)[number]) {
  const p = pathname.replace(/\/$/, "") || "/";
  const h = item.href.replace(/\/$/, "");
  if (item.supportRoot) {
    return p === ROUTES.support;
  }
  return p === h || p.startsWith(`${h}/`);
}

/** Второй ряд навигации — как `PayoutsSectionHeader` на `/assets/payouts/history`. */
export function SupportSectionHeader() {
  const pathname = usePathname() ?? "";

  return (
    <div className="sticky top-[52px] z-85">
      <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 border-b border-neutral-200 bg-white">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Поддержка и выплаты"
            className="flex h-9 items-end gap-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {supportHeaderItems.map((item) => {
              const active = isSupportNavActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex h-full items-center border-b-2 px-0.5 text-[12px] font-medium whitespace-nowrap transition-colors",
                    active
                      ? "border-neutral-900 text-neutral-900"
                      : "border-transparent text-neutral-500 hover:text-neutral-800",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
