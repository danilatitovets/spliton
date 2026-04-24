import type { ReactNode } from "react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function AssetsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#f6f7f9]">
      <DashboardHeader />
      <main className="scheme-light flex-1 text-neutral-900">
        <div className="mx-auto w-full max-w-[1320px] px-4 pb-5 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
