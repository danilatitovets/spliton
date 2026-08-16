import type { ReactNode } from "react";

import { DashboardCabinetHeaderStack } from "@/components/layout/dashboard-cabinet-header-stack";
import { cn } from "@/lib/utils";

const defaultContentClass =
  "mx-auto w-full max-w-[1200px] px-4 pb-5 pt-3 sm:px-6 sm:pt-4 lg:px-8";

/** Кабинет: sticky header stack + контент. */
export function DashboardAppShell({
  children,
  subheader,
  contentClassName,
  mainClassName,
  tone = "light",
}: {
  children: ReactNode;
  subheader?: ReactNode;
  contentClassName?: string;
  mainClassName?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div className={cn("flex min-h-dvh flex-col", dark ? "bg-black" : "bg-[#f6f7f9]")}>
      <DashboardCabinetHeaderStack subheader={subheader} />
      <main
        className={cn(
          "flex-1",
          dark ? "scheme-dark text-neutral-100" : "scheme-light text-neutral-900",
          mainClassName,
        )}
      >
        <div className={cn(defaultContentClass, contentClassName)}>{children}</div>
      </main>
    </div>
  );
}
