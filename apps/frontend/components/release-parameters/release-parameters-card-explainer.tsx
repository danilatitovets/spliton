import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CircleDot,
  Gauge,
  Layers,
  Percent,
  Play,
  Target,
} from "lucide-react";

import { RELEASE_PARAMETERS_CARD_ZONES } from "@/constants/release-parameters/page";

import { ReleaseSectionShell } from "./ui/release-section-shell";

const ZONE_ICONS: Record<(typeof RELEASE_PARAMETERS_CARD_ZONES)[number]["id"], LucideIcon> = {
  yield: Percent,
  available: Layers,
  history: BarChart3,
  status: CircleDot,
  filled: Gauge,
  raise: Target,
};

export function ReleaseParametersCardExplainer() {
  return (
    <ReleaseSectionShell
      id="rp-card"
      kicker="Каталог"
      title="Как читать карточку релиза"
      subtitle="Каждый параметр — отдельная плитка с номером и иконкой: так проще сопоставить список с реальной карточкой в каталоге. Слева — слот под видео-обложку."
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-10 lg:items-start">
        <div className="overflow-hidden rounded-2xl bg-[#2a2a2a]">
          <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-4 px-4">
            <div
              className="flex size-[72px] items-center justify-center rounded-full bg-black/40 text-white/95"
              aria-hidden
            >
              <Play className="ml-1 size-8 fill-current" strokeWidth={0} />
            </div>
            <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Видео · позже MP4 / HLS
            </p>
          </div>
          <p className="bg-black/25 px-4 py-3.5 text-center text-[12px] leading-relaxed text-zinc-500">
            Место под ролик по карточке релиза. Справа — расшифровка полей в том же порядке, как на экране.
          </p>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Параметры карточки
              </div>
              <p className="mt-1 text-sm text-zinc-500">6 зон · сверху вниз</p>
            </div>
          </div>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {RELEASE_PARAMETERS_CARD_ZONES.map((z, i) => {
              const Icon = ZONE_ICONS[z.id] ?? Percent;
              const n = String(i + 1).padStart(2, "0");
              return (
                <li key={z.id} data-zone={z.id}>
                  <div className="group flex h-full min-h-[140px] flex-col rounded-2xl bg-[#111111] p-5 transition-colors hover:bg-[#141414] md:min-h-[148px] md:p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#0a0a0a] text-sky-400/95 transition-colors group-hover:bg-sky-500/10 group-hover:text-sky-300">
                        <Icon className="size-[22px]" strokeWidth={1.35} aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span className="font-mono text-[11px] font-semibold tabular-nums text-sky-500/85">
                            {n}
                          </span>
                          <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-white md:text-base">
                            {z.title}
                          </h3>
                        </div>
                        <p className="mt-2.5 text-[13px] leading-relaxed text-zinc-400 md:text-sm">{z.body}</p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </ReleaseSectionShell>
  );
}
