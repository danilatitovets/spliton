import type { ReactNode } from "react";

/** Только главная: за контентом сплошной чёрный (включая область до футера). */
export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-black scheme-dark">{children}</div>
  );
}
