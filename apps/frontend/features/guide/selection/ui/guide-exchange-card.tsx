import type { LucideIcon } from "lucide-react";
import { ArrowRight, ClipboardList, History, Layers, LayoutGrid, ShieldAlert, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

import type { GuideTopicIconId } from "@/constants/guide/selection";
import { cn } from "@/lib/utils";

const TOPIC_ICONS: Record<GuideTopicIconId, LucideIcon> = {
  checklist: ClipboardList,
  release: LayoutGrid,
  factors: SlidersHorizontal,
  deal: Layers,
  payouts: History,
  risks: ShieldAlert,
};

export function GuideExchangeCard({
  href,
  icon,
  title,
  description,
  className,
}: {
  href: string;
  icon: GuideTopicIconId;
  title: string;
  description: string;
  className?: string;
}) {
  const Icon = TOPIC_ICONS[icon];

  return (
    <Link
      href={href}
      className={cn(
        "group flex min-h-[180px] flex-col overflow-hidden rounded-2xl bg-[#121212] p-3 transition-colors duration-200 hover:bg-[#161616] md:min-h-[200px] md:p-4",
        className,
      )}
    >
      <div className="flex w-full items-center justify-center overflow-hidden rounded-xl bg-[#0a0a0a]">
        <div className="flex aspect-[4/3] w-full max-h-[120px] items-center justify-center md:max-h-[140px]">
          <Icon
            className="size-[clamp(2.5rem,9vw,3.75rem)] text-white transition-transform duration-200 ease-out group-hover:scale-[1.03]"
            strokeWidth={1.35}
            aria-hidden
          />
        </div>
      </div>

      <h3 className="mt-3 text-sm font-semibold leading-snug tracking-tight text-white md:text-base">{title}</h3>
      <p className="mt-1.5 flex-1 text-[12px] leading-relaxed text-zinc-400 md:text-[13px]">{description}</p>
      <div className="mt-3 flex items-center gap-1 text-xs font-medium text-zinc-500 transition-colors group-hover:text-white md:text-sm">
        <span>Подробнее</span>
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </div>
    </Link>
  );
}
