"use client";

import { LandingReveal } from "@/components/dashboard/landing-motion";
import { cn } from "@/lib/utils";

export type JourneyStep = {
  n: string;
  title: string;
  text: string;
};

const STEP_ACCENT = "#2f9e44";

export function DashboardJourneyTimeline({
  steps,
  className,
  ariaLabel = "Investor journey steps",
}: {
  steps: readonly JourneyStep[];
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div className={cn("relative mx-auto w-full max-w-2xl", className)} aria-label={ariaLabel}>
      <span
        className="absolute left-[47px] top-3 h-[calc(100%-24px)] w-px bg-white/[0.08] sm:left-[55px]"
        aria-hidden
      />

      <ol className="space-y-3 sm:space-y-3.5">
        {steps.map((step, index) => {
          const stepNum = String(index + 1).padStart(2, "0");
          const isActive = index === 0;

          return (
            <li key={step.n}>
              <LandingReveal delay={index * 0.06}>
                <div className="group relative grid grid-cols-[40px_20px_minmax(0,1fr)] items-start gap-2 sm:grid-cols-[48px_20px_minmax(0,1fr)] sm:gap-3">
                  <p className="pt-2 text-right font-mono text-[11px] font-medium tabular-nums tracking-[-0.02em] text-[#62666d]">
                    {stepNum}
                  </p>

                  <div className="relative flex justify-center pt-2.5">
                    <span
                      className={cn(
                        "relative z-10 inline-block size-2.5 shrink-0 rounded-full ring-4 ring-black",
                        !isActive && "bg-[#3f3f46]",
                      )}
                      style={isActive ? { backgroundColor: STEP_ACCENT } : undefined}
                      aria-hidden
                    />
                  </div>

                  <article
                    className={cn(
                      "min-w-0 rounded-[20px] bg-[#111113] px-4 py-3.5 transition duration-300 sm:px-5 sm:py-4",
                      "group-hover:bg-[#141416]",
                    )}
                  >
                    <h3 className="text-[15px] font-[510] leading-snug tracking-[-0.014em] text-white sm:text-[16px]">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed tracking-[-0.01em] text-[#8a8f98]">
                      {step.text}
                    </p>
                  </article>
                </div>
              </LandingReveal>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
