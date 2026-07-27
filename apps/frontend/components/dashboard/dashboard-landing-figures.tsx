"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { landingPageMax } from "@/components/dashboard/dashboard-landing-tokens";
import { cn } from "@/lib/utils";

const STATS = [
  { key: "units", value: "UNT" },
  { key: "settle", value: "USDT" },
  { key: "mission", value: "1" },
] as const;

/**
 * Colossus-style figures strip: three oversized metrics, hairline columns.
 */
export function DashboardLandingFigures({ className }: { className?: string }) {
  const { t } = useI18n();

  return (
    <section
      className={cn("bg-black py-16 sm:py-20 md:py-24", className)}
      aria-labelledby="dash-figures-heading"
    >
      <div className={cn(landingPageMax, "px-4 sm:px-6 lg:px-8")}>
        <h2 id="dash-figures-heading" className="sr-only">
          {t("dashboard.figures.srTitle")}
        </h2>

        <div className="relative overflow-hidden rounded-[4px]">
          {/* subtle grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-[18%] top-0 h-px bg-gradient-to-r from-transparent via-[#3fe280]/70 to-transparent"
            aria-hidden
          />

          <div className="relative grid grid-cols-1 divide-y divide-white/[0.08] md:grid-cols-3 md:divide-x md:divide-y-0 md:divide-white/[0.08]">
            {STATS.map((stat, index) => (
              <article
                key={stat.key}
                className="flex flex-col items-center justify-center px-6 py-12 text-center sm:py-14 md:px-8 md:py-16 motion-safe:animate-[fadeUp_0.7s_ease-out_both]"
                style={{ animationDelay: `${100 + index * 100}ms` }}
              >
                <p className="text-[clamp(2.75rem,6vw,4.5rem)] font-[510] leading-none tracking-[-0.04em] text-white [font-feature-settings:'cv01'_on,'ss03'_on,'zero'_on]">
                  {stat.value}
                </p>
                <p className="mt-4 max-w-[16rem] text-[13px] leading-snug tracking-[-0.01em] text-[#8a8f98] sm:text-[14px]">
                  {t(`dashboard.figures.stat.${stat.key}`)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}