import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";

import { DetailSection } from "./detail-section";

export function ReleaseDetailTerms({ data }: { data: ReleaseDetailPageData }) {
  return (
    <DetailSection eyebrow="Deal terms" title={data.terms.title}>
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {data.terms.rows.map((r) => (
          <article
            key={r.key}
            className="rounded-xl bg-[#090909] px-4 py-3.5 transition-colors hover:bg-[#101010]"
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">{r.key}</p>
            <p className="mt-1.5 font-mono text-[18px] font-semibold leading-tight text-white">{r.val}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">{r.note ?? "—"}</p>
          </article>
        ))}
      </div>
    </DetailSection>
  );
}
