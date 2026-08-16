import type { ReactNode } from "react";

/** Header/subheader live in parent `assets/layout` so they stay mounted across tabs. */
export default function AssetsPortfolioLayout({ children }: { children: ReactNode }) {
  return children;
}