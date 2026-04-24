"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const BASE = ROUTES.dashboardPayouts;

type NavItem = {
  href: string;
  label: string;
  /** Только корень `/assets/payouts`, без вложенных маршрутов */
  overviewRoot?: boolean;
};

const payoutHeaderItems: NavItem[] = [
  { href: BASE, label: "Обзор", overviewRoot: true },
  { href: ROUTES.dashboardPayoutsComparison, label: "Сравнение" },
  { href: ROUTES.dashboardPayoutsHistory, label: "История" },
  { href: `${BASE}/deposit`, label: "Пополнить" },
  { href: `${BASE}/withdraw`, label: "Вывод" },
];

function isPayoutsNavActive(pathname: string, item: NavItem) {
  const p = pathname.replace(/\/$/, "") || "/";
  if (item.overviewRoot) {
    return p === BASE;
  }
  return p === item.href.replace(/\/$/, "") || p.startsWith(`${item.href.replace(/\/$/, "")}/`);
}

export function PayoutsSectionHeader() {
  const pathname = usePathname() ?? "";

  return (
    <div className="sticky top-[52px] z-85">
      <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 border-b border-neutral-200 bg-white">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Секции выплат"
            className="flex h-9 items-end gap-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {payoutHeaderItems.map((item) => {
              const active = isPayoutsNavActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex h-full items-center border-b-2 px-0.5 text-[12px] font-medium whitespace-nowrap transition-colors",
                    active ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-800",
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
