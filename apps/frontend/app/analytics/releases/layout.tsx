import type { ReactNode } from "react";

/** Тот же каркас, что у /catalog: фиксированная рабочая область, без влияния на /dashboard */
export default function AnalyticsReleasesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col overflow-hidden bg-black font-sans tabular-nums text-white antialiased scheme-dark">
      {children}
    </div>
  );
}
