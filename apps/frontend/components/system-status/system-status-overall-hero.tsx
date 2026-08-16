"use client";

import "./system-status-overall-hero.css";

import Image from "next/image";
import * as React from "react";

import { useI18n } from "@/components/providers/i18n-provider";
import type { OverallTone } from "@/constants/system-status-mock";
import { cn } from "@/lib/utils";

const CHIP_CYCLE_MS = 2800;
const STATUS_HERO_ICON = "/images/system-status/system-status-hero.png";
const HEADER_VIDEO = "/videos/position-holding-bg.mp4";

const DEFAULT_FLY_LABELS = [
  "Кабинет",
  "Вывод USDT",
  "Вторичный рынок",
  "Выплаты",
  "Пополнение",
] as const;

function toneGlowClass(tone: OverallTone): string {
  const map: Record<OverallTone, string> = {
    success: "status-overall-hero__glow--success",
    warning: "status-overall-hero__glow--warning",
    maintenance: "status-overall-hero__glow--maintenance",
    danger: "status-overall-hero__glow--danger",
  };
  return map[tone];
}

function toneDotClass(tone: OverallTone): string {
  const map: Record<OverallTone, string> = {
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    maintenance: "bg-sky-400",
    danger: "bg-rose-400",
  };
  return map[tone];
}

type SystemStatusOverallHeroProps = {
  tone: OverallTone;
  headline: string;
  subline: string;
  explanation: string;
  lastUpdatedLabel: string;
  flyLabels?: readonly string[];
  className?: string;
};

export function SystemStatusOverallHero({
  tone,
  headline,
  subline,
  explanation,
  lastUpdatedLabel,
  flyLabels = DEFAULT_FLY_LABELS,
  className,
}: SystemStatusOverallHeroProps) {
  const { t } = useI18n();
  const chips = React.useMemo(
    () => flyLabels.map((label) => label.trim()).filter(Boolean),
    [flyLabels],
  );
  const [chipIndex, setChipIndex] = React.useState(0);

  React.useEffect(() => {
    if (chips.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setChipIndex((current) => (current + 1) % chips.length);
    }, CHIP_CYCLE_MS);

    return () => window.clearInterval(timer);
  }, [chips.length]);

  const activeChip = chips[chipIndex] ?? chips[0] ?? t("systemStatus.overall.servicesFallback");

  return (
    <section
      className={cn(
        "status-overall-hero relative isolate overflow-hidden rounded-2xl sm:rounded-[1.35rem]",
        className,
      )}
      aria-labelledby="health-overview"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <video
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-[14px] motion-reduce:hidden"
          src={HEADER_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/82 to-black" />
      </div>

      <div className="relative z-10 px-5 py-8 text-center sm:px-8 sm:py-10">
        <p
          id="health-overview"
          className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/50"
        >
          {t("systemStatus.overall.label")}
        </p>

        <div className="status-overall-hero__orb-wrap">
          <div className="status-overall-hero__sync">
            <p className="status-overall-hero__sync-label">{t("systemStatus.overall.sync")}</p>
            <p className="status-overall-hero__sync-name">{activeChip}</p>
          </div>

          <div className="status-overall-hero__rail">
            <span className="status-overall-hero__rail-line" />
            <span className="status-overall-hero__rail-target" />
            {activeChip ? (
              <span key={`${chipIndex}-${activeChip}`} className="status-overall-hero__fly-chip">
                <span className={cn("status-overall-hero__fly-chip-dot", toneDotClass(tone))} />
                <span>{activeChip}</span>
              </span>
            ) : null}
          </div>

          <div className="status-overall-hero__icon-wrap">
            <span className={cn("status-overall-hero__glow", toneGlowClass(tone))} aria-hidden />
            <div className="relative mx-auto size-[9.5rem] sm:size-[11rem]">
              <Image
                src={STATUS_HERO_ICON}
                alt=""
                fill
                sizes="176px"
                className="object-contain drop-shadow-[0_12px_36px_rgba(0,0,0,0.55)]"
                unoptimized
                priority
                aria-hidden
              />
            </div>
          </div>
        </div>

        <h2 className="mt-7 text-[1.75rem] font-semibold leading-tight tracking-tight text-white sm:text-3xl lg:text-[2.15rem]">
          {headline}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-white/65 sm:text-base">
          {subline}
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">{explanation}</p>
        <p className="mx-auto mt-5 font-mono text-[11px] tracking-wide text-zinc-500">
          {lastUpdatedLabel}
        </p>
      </div>
    </section>
  );
}
