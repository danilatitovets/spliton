"use client";

import Link from "next/link";
import * as React from "react";

import { SplitMegamenuList } from "@/components/dashboard/dashboard-megamenu";
import type { DashboardNavItem } from "@/components/dashboard/dashboard-nav";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuPopup,
  NavigationMenuPositioner,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu-1";
import { cn } from "@/lib/utils";

type DashboardHeaderNavMenuProps = {
  items: DashboardNavItem[];
  value: string | null;
  onValueChange: (value: string | null) => void;
  onNavigate: () => void;
  ariaLabel: string;
  isItemActive: (item: DashboardNavItem) => boolean;
};

export function DashboardHeaderNavMenu({
  items,
  value,
  onValueChange,
  onNavigate,
  ariaLabel,
  isItemActive,
}: DashboardHeaderNavMenuProps) {
  const handleValueChange = React.useCallback(
    (next: unknown) => {
      onValueChange(typeof next === "string" ? next : null);
    },
    [onValueChange],
  );

  return (
    <NavigationMenu
      value={value}
      onValueChange={handleValueChange}
      delay={40}
      closeDelay={120}
      aria-label={ariaLabel}
      className="hidden max-w-none min-w-0 flex-none justify-start overflow-visible xl:flex"
    >
      <NavigationMenuList className="justify-start gap-0.5">
        {items.map((item) => {
          const active = isItemActive(item);
          const hasMenu = Boolean(item.children?.length);

          if (!hasMenu) {
            return (
              <NavigationMenuItem key={item.id} value={item.id}>
                <NavigationMenuLink
                  closeOnClick
                  active={active}
                  render={<Link href={item.href} />}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "flex-row items-center no-underline",
                    active && "bg-white/12 text-white",
                  )}
                >
                  {item.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          }

          return (
            <NavigationMenuItem key={item.id} value={item.id}>
              <NavigationMenuTrigger className={cn(active && "bg-white/12 text-white")}>
                {item.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="p-0 sm:min-w-[28rem] lg:min-w-[34rem]">
                <SplitMegamenuList openItem={item} onNavigate={onNavigate} comfortable />
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>

      <NavigationMenuPositioner>
        <NavigationMenuPopup />
      </NavigationMenuPositioner>
    </NavigationMenu>
  );
}
