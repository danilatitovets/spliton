"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { Check } from "@/lib/lucide";

import {
  VERIFICATION_STEPS,
  type VerificationUiStatus,
} from "@/constants/dashboard/profile-verification";
import { SplitonDarkSurface } from "@/components/dashboard/assets/spliton-dark-surface";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

const STEP_ICONS = [
  "/images/partner/partner-step-01.png",
  "/images/partner/partner-step-02.png",
  "/images/partner/partner-step-03.png",
  "/images/partner/partner-step-04.png",
] as const;

export const VERIFY_HERO_ICON = "/images/profile/profile-glass-verification.png";
export const VERIFY_DOC_ICONS = {
  id: "/images/verification/verify-doc-id.png?v=1",
  address: "/images/verification/verify-doc-address.png?v=1",
  selfie: "/images/verification/verify-doc-selfie.png?v=1",
} as const;

export const VERIFY_VIDEO = "/videos/position-holding-bg.mp4";

export function verificationStepVisual(
  status: VerificationUiStatus,
  stepIndex: number,
): "done" | "current" | "upcoming" {
  if (status === "approved" || status === "pending_review") return "done";
  if (status === "rejected") return stepIndex === 0 ? "current" : "upcoming";
  if (status === "not_started") return stepIndex === 0 ? "current" : "upcoming";
  /* in_progress: step 1 done, step 2 current, rest upcoming */
  if (stepIndex === 0) return "done";
  if (stepIndex === 1) return "current";
  return "upcoming";
}

export function ProfileVerificationSteps({
  status,
  className,
}: {
  status: VerificationUiStatus;
  className?: string;
}) {
  const { t } = useI18n();

  return (
    <ol className={cn("space-y-0 divide-y divide-white/[0.08] border-t border-white/[0.08]", className)}>
      {VERIFICATION_STEPS.map((step, index) => {
        const visual = verificationStepVisual(status, index);
        const icon = STEP_ICONS[index];
        const label = String(index + 1).padStart(2, "0");
        return (
          <li
            key={step.id}
            className="grid gap-3 py-5 sm:grid-cols-[5rem_1fr_auto] sm:items-center sm:gap-5 sm:py-6"
          >
            <div
              className={cn(
                "relative size-14 shrink-0 sm:size-[4.25rem]",
                visual === "upcoming" && "opacity-35 grayscale-[0.35]",
                visual === "done" && "opacity-95",
              )}
              aria-hidden
            >
              <Image
                src={`${icon}?v=1`}
                alt=""
                fill
                sizes="68px"
                className="object-contain"
                unoptimized
              />
              <span className="sr-only">{label}</span>
              {visual === "done" ? (
                <span className="absolute -right-0.5 -top-0.5 grid size-6 place-items-center rounded-full bg-[#B7F500] text-black shadow-[0_0_0_2px_rgba(0,0,0,0.65)]">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden />
                </span>
              ) : null}
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-[11px] font-medium uppercase tracking-[0.14em]",
                  visual === "current" ? "text-[#B7F500]/90" : "text-white/40",
                )}
              >
                {visual === "done"
                  ? t("verification.step.done", "Пройден")
                  : visual === "current"
                    ? t("verification.step.current", "Сейчас")
                    : t("verification.step.upcoming", "Далее")}
              </p>
              <h3
                className={cn(
                  "mt-1 text-base font-semibold tracking-tight sm:text-lg",
                  visual === "upcoming" ? "text-white/55" : "text-white",
                )}
              >
                {step.title}
              </h3>
              <p
                className={cn(
                  "mt-1.5 max-w-xl text-sm leading-relaxed",
                  visual === "upcoming" ? "text-white/35" : "text-zinc-400",
                )}
              >
                {step.description}
              </p>
            </div>
            {visual === "current" ? (
              <span className="hidden rounded-full bg-white/[0.08] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80 sm:inline-flex">
                {t("verification.step.active", "Активный шаг")}
              </span>
            ) : visual === "done" ? (
              <span className="hidden font-mono text-[12px] font-medium tabular-nums text-[#B7F500]/85 sm:inline">
                ✓
              </span>
            ) : (
              <span className="hidden font-mono text-[12px] tabular-nums text-white/25 sm:inline">{label}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function ProfileVerificationHeroSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <SplitonDarkSurface className={cn("min-h-0 shadow-none", className)} watermarkCompact>
      {children}
    </SplitonDarkSurface>
  );
}
