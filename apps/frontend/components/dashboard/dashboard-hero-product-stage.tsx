"use client";

import { DashboardHeroJourneyPreview } from "@/components/dashboard/dashboard-hero-journey-preview";
import { DashboardMiniOrderBook } from "@/components/dashboard/dashboard-mini-order-book";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

function HeroStageOrderBook({ className }: { className?: string }) {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[16px] bg-[#0c0c0d]",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_24px_50px_-16px_rgba(0,0,0,0.9)]",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2.5">
        <p className="text-[11px] font-[510] tracking-[-0.011em] text-[#d0d6e0]">
          Spliton <span className="text-[#62666d]">·</span>{" "}
          <span className="text-[#8a8f98]">{t("dashboard.hero.stageFloatTitle")}</span>
        </p>
        <span className="inline-flex items-center gap-1 text-[10px] text-[#6b6f76]">
          <span className="size-1.5 rounded-full bg-[#3fe280]" aria-hidden />
          {t("dashboard.hero.stageLive")}
        </span>
      </div>
      <DashboardMiniOrderBook demo className="rounded-none border-0 bg-transparent shadow-none" />
    </div>
  );
}

/**
 * Hero stage: journey animation fills the frame without cropping.
 * Frame aspect matches the animation canvas (1280×720 → 16/10).
 */
export function DashboardHeroProductStage({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[1080px]", className)}>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[24px] bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        {/* contain + matching aspect = full frame, no crop of bottom/side UI */}
        <DashboardHeroJourneyPreview className="absolute inset-0 h-full w-full bg-black" />

        <div className="pointer-events-none absolute right-3 top-3 z-10 hidden w-[min(260px,30%)] lg:block xl:right-5 xl:top-5">
          <HeroStageOrderBook />
        </div>
      </div>
    </div>
  );
}
