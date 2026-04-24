import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";

import { DetailSection } from "./detail-section";

export function ReleaseDetailAbout({ data }: { data: ReleaseDetailPageData }) {
  return (
    <DetailSection className="mt-10 pt-0 md:mt-12" eyebrow="Release" title={data.about.title}>
      <div className="max-w-[72ch] space-y-4 text-sm leading-relaxed text-zinc-400">
        {data.about.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </DetailSection>
  );
}
