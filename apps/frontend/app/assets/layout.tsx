import type { ReactNode } from "react";

import { AssetsCabinetShell } from "@/components/dashboard/assets/assets-cabinet-shell";

export default function AssetsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1">
        <AssetsCabinetShell>{children}</AssetsCabinetShell>
      </main>
    </div>
  );
}