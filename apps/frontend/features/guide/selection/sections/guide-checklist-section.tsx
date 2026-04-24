import { GUIDE_SELECTION_CHECKLIST, type GuideChecklistAssociation } from "@/constants/guide/selection";
import { cn } from "@/lib/utils";

import { GuideChecklistRowVisual } from "../ui/guide-checklist-row-visual";
import { GuideSectionShell } from "../ui/guide-section-shell";

function AssociationChip({ item }: { item: GuideChecklistAssociation }) {
  const base =
    "inline-flex max-w-full items-center rounded-lg bg-[#0a0a0a] px-2.5 py-1.5 text-left font-mono text-[11px] font-medium leading-snug text-zinc-400";

  const dest = item.href ?? (item.section ? `#${item.section}` : undefined);
  if (dest) {
    return (
      <a href={dest} className={cn(base, "transition-colors hover:text-[#c4f570]")}>
        <span className="truncate">{item.label}</span>
      </a>
    );
  }

  return (
    <span className={base}>
      <span className="truncate">{item.label}</span>
    </span>
  );
}

export function GuideChecklistSection() {
  return (
    <GuideSectionShell
      id="checklist"
      title="На что смотреть перед входом"
      subtitle="Шесть быстрых фильтров до углубления в метрики — та же сетка карточек и типографика, что в разделе про факторы выбора."
    >
      <div className="flex flex-col gap-4 md:gap-5">
        {GUIDE_SELECTION_CHECKLIST.map((row, idx) => (
          <article
            key={row.title}
            className="rounded-2xl bg-[#111111] p-6 transition-colors hover:bg-white/4 md:p-8"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Prefilter
                  </div>
                  <div className="font-mono text-[11px] font-medium tabular-nums text-zinc-600">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                </div>
                <h3 className="mt-3 text-xl font-semibold tracking-tight text-white md:text-2xl">{row.title}</h3>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {row.associations.map((assoc) => (
                    <AssociationChip key={`${row.title}-${assoc.label}`} item={assoc} />
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 justify-start border-t border-white/6 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <GuideChecklistRowVisual index={idx} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </GuideSectionShell>
  );
}
