"use client";

import Image from "next/image";

import { MegamenuPreviewChrome } from "@/components/dashboard/megamenu-preview-primitives";
import type { DashboardNavSubItem } from "@/components/dashboard/dashboard-nav";
import { cn } from "@/lib/utils";

export function MegamenuImagePreview({ sub }: { sub: DashboardNavSubItem }) {
  return (
    <div key={sub.href} className="overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-zinc-200/80">
      <MegamenuPreviewChrome title={sub.label} />
      <div className="relative aspect-5/4 overflow-hidden bg-[#f6f7f9] p-2">
        <div className="relative h-full overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-zinc-200/60">
          {sub.iconSrc ? (
            <Image
              src={sub.iconSrc}
              alt=""
              fill
              sizes="360px"
              className="object-cover object-top"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-neutral-50 text-sm font-bold tracking-tight text-neutral-400">
              {sub.iconHint ?? sub.label.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
