import Link from "next/link";

import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";

import { DetailSection } from "./detail-section";

export function ReleaseDetailRelated({ data }: { data: ReleaseDetailPageData }) {
  return (
    <DetailSection eyebrow="Материалы" title="Связанные разделы">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {data.related.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-xl bg-[#111111] p-4 transition-colors hover:bg-white/[0.04]"
          >
            <p className="text-sm font-semibold text-white group-hover:text-lime-200/90">{card.title}</p>
            <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">{card.description}</p>
            <span className="mt-3 inline-block text-[11px] font-medium text-zinc-600 group-hover:text-lime-400/80">
              Перейти →
            </span>
          </Link>
        ))}
      </div>
    </DetailSection>
  );
}
