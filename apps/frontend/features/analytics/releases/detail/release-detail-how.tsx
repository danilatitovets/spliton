import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";

import { DetailSection } from "./detail-section";

export function ReleaseDetailHow({ data }: { data: ReleaseDetailPageData }) {
  return (
    <DetailSection eyebrow="Механика" title={data.howItWorks.title}>
      <div className="grid gap-2 md:grid-cols-2">
        {data.howItWorks.blocks.map((b) => (
          <article key={b.heading} className="rounded-xl bg-[#111111] p-4 md:p-5">
            <h3 className="text-sm font-semibold text-white">{b.heading}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{b.body}</p>
          </article>
        ))}
      </div>
    </DetailSection>
  );
}
