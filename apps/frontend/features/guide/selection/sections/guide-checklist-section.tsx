import { GuideSectionShell } from "../ui/guide-section-shell";

export function GuideChecklistSection() {
  return (
    <GuideSectionShell
      id="checklist"
      title="На что смотреть перед входом"
      subtitle="Здесь будет видео с шагами перед углублением в метрики. Пока — серый шаблон под вставку плеера."
    >
      <div
        role="region"
        aria-label="Видео"
        className="flex aspect-video w-full max-w-4xl flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-zinc-900/35 px-4 py-8 text-center md:py-10"
      >
        <p className="text-[13px] font-medium text-zinc-500">Место под видео</p>
        <p className="max-w-md text-xs leading-relaxed text-zinc-600">
          Вставьте iframe или компонент плеера вместо этого блока — сетка и типографика секции остаются как у остальных разделов.
        </p>
      </div>
    </GuideSectionShell>
  );
}
