"use client";

import Image from "next/image";
import { Search } from "@/lib/lucide";

import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

const HEADER_VIDEO = "/videos/position-holding-bg.mp4";
const SUPPORT_HERO_ICON = "/images/support/support-hero.png";

type SupportPageHeroProps = {
  search: string;
  onSearchChange: (value: string) => void;
  className?: string;
};

export function SupportPageHero({ search, onSearchChange, className }: SupportPageHeroProps) {
  const { t } = useI18n();

  return (
    <header className={cn("relative isolate mb-8 overflow-hidden rounded-2xl sm:mb-10 lg:mb-12", className)}>
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <video
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-[12px] motion-reduce:hidden"
          src={HEADER_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/72 to-black" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-5 px-5 py-8 text-center sm:gap-6 sm:px-8 sm:py-10 lg:py-12">
        <div className="relative size-[5.5rem] shrink-0 sm:size-28">
          <Image
            src={`${SUPPORT_HERO_ICON}?v=2`}
            alt=""
            fill
            sizes="112px"
            className="object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
            unoptimized
            aria-hidden
            priority
          />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[3.25rem]">
          {t("support.hero.title")}
        </h1>

        <div className="group relative mx-auto w-full max-w-xl">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-zinc-200"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("support.hero.searchPlaceholder")}
            aria-label={t("support.hero.searchAria")}
            autoComplete="off"
            className={cn(
              "h-12 w-full rounded-full border-0 bg-white/[0.06] py-2 pl-11 pr-4 font-mono text-sm text-white shadow-none",
              "placeholder:text-zinc-600 outline-none ring-0 transition-[background-color] duration-300",
              "hover:bg-white/[0.08] focus:bg-white/[0.1] focus:outline-none focus:ring-0",
            )}
          />
        </div>
      </div>
    </header>
  );
}
