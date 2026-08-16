"use client";

import { Check } from "@/lib/lucide";

import type { VerificationUiStatus } from "@/constants/dashboard/profile-verification";
import { profileLineIcon } from "@/components/dashboard/profile/profile-shared";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

type TimelineStepId = "not_started" | "started" | "submitted" | "manual_review" | "decision";

const STEPS: TimelineStepId[] = [
  "not_started",
  "started",
  "submitted",
  "manual_review",
  "decision",
];

const STEP_ICONS = ["verification", "id", "send", "support", "legal"] as const;

function stepState(
  status: VerificationUiStatus,
  step: TimelineStepId,
): "done" | "current" | "upcoming" {
  const order: Record<TimelineStepId, number> = {
    not_started: 0,
    started: 1,
    submitted: 2,
    manual_review: 3,
    decision: 4,
  };

  let current: TimelineStepId = "not_started";
  if (status === "in_progress") current = "started";
  else if (status === "pending_review") current = "manual_review";
  else if (status === "approved" || status === "rejected") current = "decision";

  const stepIdx = order[step];
  const currentIdx = order[current];
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "current";
  return "upcoming";
}

export function ProfileVerificationTimeline({ status }: { status: VerificationUiStatus }) {
  const { t } = useI18n();

  return (
    <ol className="divide-y divide-white/[0.06]">
      {STEPS.map((step, index) => {
        const visual = stepState(status, step);
        const icon = STEP_ICONS[index];
        const labelKey =
          step === "decision"
            ? status === "rejected"
              ? "verification.timeline.decisionRejected"
              : status === "approved"
                ? "verification.timeline.decisionApproved"
                : "verification.timeline.decision"
            : `verification.timeline.${step}`;

        return (
          <li key={step} className="flex items-start gap-3 py-4 first:pt-3 last:pb-4">
            <div
              className={cn("relative shrink-0", visual === "upcoming" && "opacity-35")}
              aria-hidden
            >
              {profileLineIcon(icon)}
              {visual === "done" ? (
                <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-[#B7F500] text-black">
                  <Check className="size-3" strokeWidth={3} aria-hidden />
                </span>
              ) : null}
            </div>
            <div className="min-w-0 pt-1">
              <p className="text-[15px] font-semibold text-white">{t(labelKey)}</p>
              <p
                className={cn(
                  "mt-0.5 text-[13px] leading-relaxed",
                  visual === "upcoming" ? "text-white/35" : "text-zinc-500",
                )}
              >
                {t(`${labelKey}Hint`)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
