import type { ReactNode } from "react";

export default function GuideSelectionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col overflow-hidden bg-white font-sans text-black antialiased [color-scheme:light]">
      {children}
    </div>
  );
}
