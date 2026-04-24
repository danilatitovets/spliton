import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#000000] text-neutral-100 antialiased [color-scheme:dark]">
      {children}
    </div>
  );
}

