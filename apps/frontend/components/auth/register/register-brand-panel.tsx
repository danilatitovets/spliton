"use client";

import { Music } from "lucide-react";

import { cn } from "@/lib/utils";

const RING_R = 86;
const RING_C = 2 * Math.PI * RING_R;

type RegisterBrandPanelProps = {
  step: 1 | 2 | 3;
  className?: string;
};

export function RegisterBrandPanel({ step, className }: RegisterBrandPanelProps) {
  const progress = (step - 1) / 2;
  const dashOffset = RING_C * (1 - progress);

  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-1 flex-col bg-black px-8 py-10 text-white sm:min-h-[320px] sm:px-10 sm:py-12 lg:min-h-dvh lg:px-12 lg:py-14",
        className
      )}
    >
      <div className="max-w-lg font-sans">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-500/80">
          Регистрация
        </p>
        <h1 className="mt-2 text-balance text-[1.65rem] font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-[1.85rem] lg:text-[2rem]">
          Создайте аккаунт RevShare
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-400">
          Три коротких шага — и вы в кабинете: доли треков, выплаты и аналитика без лишнего шума.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-10 lg:py-6">
        <div
          className="relative flex w-[min(280px,78vw)] items-center justify-center"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-label="Прогресс регистрации"
        >
          <div className="relative aspect-square w-full max-w-[260px]">
            <svg
              className="absolute inset-0 size-full -rotate-90"
              viewBox="0 0 200 200"
              aria-hidden
            >
              <defs>
                <filter id="register-ring-glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="4" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <circle
                cx="100"
                cy="100"
                r={RING_R}
                fill="none"
                stroke="oklch(0.32 0.02 265 / 0.45)"
                strokeWidth="5"
              />
              <circle
                cx="100"
                cy="100"
                r={RING_R}
                fill="none"
                stroke="oklch(0.55 0.12 165)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={dashOffset}
                className="transition-[stroke-dashoffset] duration-700 ease-out"
                style={{ filter: "url(#register-ring-glow)" }}
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <Music
                className="size-11 text-emerald-400/90 sm:size-12"
                strokeWidth={1.45}
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
