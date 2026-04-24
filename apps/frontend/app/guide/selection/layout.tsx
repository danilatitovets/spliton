import type { ReactNode } from "react";

export default function GuideSelectionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col overflow-hidden bg-black font-sans tabular-nums text-white antialiased [color-scheme:dark]">
      {children}
    </div>
  );
}
