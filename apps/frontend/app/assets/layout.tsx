import type { ReactNode } from "react";

import { AssetsCabinetShell } from "@/components/dashboard/assets/assets-cabinet-shell";

export default function AssetsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <main className="scheme-light flex-1 text-neutral-900">
        <AssetsCabinetShell>{children}</AssetsCabinetShell>
      </main>
    </div>
  );
}