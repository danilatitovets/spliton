import type { ReactNode } from "react";

/**
 * Лейаут только для /catalog.
 * CRM-поведение (фиксированная рабочая область под шапкой) локализовано здесь
 * и не влияет на /dashboard.
 */
export default function CatalogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col overflow-hidden bg-black font-sans tabular-nums text-white antialiased [color-scheme:dark]">
      {children}
    </div>
  );
}
