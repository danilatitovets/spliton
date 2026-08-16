"use client";

import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";

function lifecycleBadgeClass(tone: ReleaseDetailPageData["pageState"]["badgeTone"]): string {
  switch (tone) {
    case "success":
      return "bg-emerald-500/12 text-emerald-300 ring-emerald-500/25";
    case "warning":
      return "bg-amber-500/12 text-amber-200 ring-amber-500/20";
    case "muted":
      return "bg-white/6 text-zinc-400 ring-white/10";
    default:
      return "bg-white/6 text-zinc-300 ring-white/10";
  }
}

export function ReleaseDetailHeroCta({ data }: { data: ReleaseDetailPageData }) {
  const { t } = useI18n();
  const { primaryCta, secondaryCta } = data.pageState;

  if (!primaryCta && !secondaryCta) return null;

  return (
    <div className="mt-4 flex flex-col gap-2.5 sm:mt-5 sm:flex-row sm:flex-wrap sm:gap-3">
      {primaryCta ? (
        primaryCta.disabled ? (
          <span
            className="inline-flex h-11 w-full cursor-not-allowed items-center justify-center rounded-full bg-white/8 px-6 text-[14px] font-medium tracking-normal text-zinc-500 sm:w-auto"
            title={primaryCta.reasonKey ? t(primaryCta.reasonKey) : undefined}
          >
            {t(primaryCta.labelKey)}
          </span>
        ) : (
          <SplitonCtaPill href={primaryCta.href} tone="onDark" className="w-full min-w-0 sm:w-auto sm:min-w-[10.5rem]">
            {t(primaryCta.labelKey)}
          </SplitonCtaPill>
        )
      ) : null}
      {secondaryCta && !secondaryCta.disabled ? (
        <SplitonCtaPill
          href={secondaryCta.href}
          tone="onDark"
          variant="ghost"
          withArrow={false}
          className="w-full sm:w-auto"
        >
          {t(secondaryCta.labelKey)}
        </SplitonCtaPill>
      ) : null}
    </div>
  );
}

export function ReleaseDetailLifecycleBadge({ data }: { data: ReleaseDetailPageData }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-normal ring-1 sm:text-[12px]",
        lifecycleBadgeClass(data.pageState.badgeTone),
      )}
    >
      {data.lifecycleLabel}
    </span>
  );
}
