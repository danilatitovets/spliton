import { RELEASE_PARAMETERS_FIRST_LOOK } from "@/constants/release-parameters/page";

import { ReleaseSectionShell } from "./ui/release-section-shell";

export function ReleaseParametersPriority() {
  return (
    <ReleaseSectionShell
      id="rp-first"
      kicker="Быстрый проход"
      title="Что смотреть в первую очередь"
      subtitle="Короткий практический порядок чтения карточки перед углублением в аналитику или гид по выбору. Не заменяет полноценную стратегию — задаёт рамку внимания."
    >
      <ol className="grid gap-3 md:grid-cols-2">
        {RELEASE_PARAMETERS_FIRST_LOOK.map((item, idx) => (
          <li
            key={item.title}
            className="flex gap-4 rounded-xl bg-[#111111] p-5 transition-colors hover:bg-white/[0.04]"
          >
            <span className="font-mono text-xs font-semibold tabular-nums text-sky-400">
              {(idx + 1).toString().padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </ReleaseSectionShell>
  );
}
