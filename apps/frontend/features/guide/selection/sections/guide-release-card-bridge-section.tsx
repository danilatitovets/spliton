import Link from "next/link";

import { GUIDE_CATALOG_CARD_HREF } from "@/constants/guide/selection";

import { GuideSectionShell } from "../ui/guide-section-shell";

export function GuideReleaseCardBridgeSection() {
  return (
    <GuideSectionShell
      id="release-card"
      title="Язык карточки в каталоге"
      subtitle="Разбор полей, mock UI и словарь терминов вынесены на страницу каталога — гид остаётся про выбор релиза, без повтора инструкции по UI."
      headerAlign="center"
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm leading-relaxed text-zinc-400">
          Откройте «Параметры релиза»: зоны карточки, ключевые поля, порядок «сначала смотреть», пример и FAQ именно по
          карточке.
        </p>
        <Link
          href={GUIDE_CATALOG_CARD_HREF}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/4"
        >
          Параметры релиза в каталоге
        </Link>
      </div>
    </GuideSectionShell>
  );
}
