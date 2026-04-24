import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";

export function ReleaseDetailBreadcrumb({ data }: { data: ReleaseDetailPageData }) {
  return (
    <nav aria-label="Навигация" className="flex flex-wrap items-center gap-1 text-[12px] text-zinc-500">
      {data.breadcrumbs.map((crumb, i) => {
        const isLast = i === data.breadcrumbs.length - 1;
        return (
          <span key={`${crumb.label}-${i}`} className="flex items-center gap-1">
            {i > 0 ? <ChevronRight className="size-3.5 shrink-0 text-zinc-700" aria-hidden /> : null}
            {crumb.href && !isLast ? (
              <Link href={crumb.href} className="transition-colors hover:text-zinc-300">
                {crumb.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-zinc-300" : undefined}>{crumb.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
