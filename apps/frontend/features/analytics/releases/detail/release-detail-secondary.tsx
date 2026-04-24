import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";

import { cn } from "@/lib/utils";

import { DetailSection } from "./detail-section";

export function ReleaseDetailSecondary({
  data,
  className,
  sectionTitleClassName,
}: {
  data: ReleaseDetailPageData;
  className?: string;
  sectionTitleClassName?: string;
}) {
  return (
    <DetailSection
      className={cn(className)}
      eyebrow="Secondary"
      title={data.secondary.title}
      titleClassName={sectionTitleClassName}
      description="Внутренний рынок передачи units между пользователями. Метрики отражают активность заявок, а не «торговлю ценной бумагой»."
    >
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {data.secondary.rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between gap-3 rounded-xl bg-[#111111] px-4 py-3 transition-colors hover:bg-white/[0.04]"
          >
            <span className="text-[12px] text-zinc-500">{r.label}</span>
            <span className="font-mono text-sm font-semibold tabular-nums text-white">{r.value}</span>
          </div>
        ))}
      </div>
    </DetailSection>
  );
}
