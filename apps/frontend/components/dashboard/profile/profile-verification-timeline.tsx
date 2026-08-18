"use client";

import { Check } from "@/lib/lucide";

import { PROFILE_LINE } from "@/components/dashboard/profile/profile-shared";
import type { ProfileLineIconName } from "@/components/dashboard/profile/profile-shared";
import { useI18n } from "@/components/providers/i18n-provider";
import type { KycStatusApi } from "@/lib/kyc/kyc-status-adapter";
import { cn } from "@/lib/utils";

type TimelineStepId = "started" | "prepared" | "submitted" | "manual_review" | "decision";

const STEPS: TimelineStepId[] = ["started", "prepared", "submitted", "manual_review", "decision"];
const STEP_ICONS: ProfileLineIconName[] = ["verification", "id", "send", "support", "legal"];

function currentStep(status: KycStatusApi): TimelineStepId {
  switch (status) {
    case "PENDING":
      return "prepared";
    case "IN_REVIEW":
    case "MANUAL_REVIEW_REQUIRED":
      return "manual_review";
    case "APPROVED":
    case "REJECTED":
    case "EXPIRED":
      return "decision";
    default:
      return "started";
  }
}

function stepState(status: KycStatusApi, step: TimelineStepId): "done" | "current" | "upcoming" {
  const order: Record<TimelineStepId, number> = {
    started: 0,
    prepared: 1,
    submitted: 2,
    manual_review: 3,
    decision: 4,
  };
  let current = currentStep(status);
  if (status === "IN_REVIEW" || status === "MANUAL_REVIEW_REQUIRED") {
    if (step === "submitted") return "done";
  }
  const stepIdx = order[step];
  const currentIdx = order[current];
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "current";
  return "upcoming";
}

function stepLabelKey(step: TimelineStepId, status: KycStatusApi): string {
  if (step === "decision") {
    if (status === "REJECTED") return "verification.timeline.decisionRejected";
    if (status === "APPROVED") return "verification.timeline.decisionApproved";
    if (status === "EXPIRED") return "verification.timeline.decisionExpired";
    return "verification.timeline.decision";
  }
  return `verification.timeline.${step}`;
}

function TimelineStepNode({
  icon,
  visual,
}: {
  icon: ProfileLineIconName;
  visual: "done" | "current" | "upcoming";
}) {
  const Icon = PROFILE_LINE[icon];
  if (visual === "done") {
    return (
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-black" aria-hidden>
        <Check className="size-4" strokeWidth={2.75} />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full",
        visual === "current" ? "bg-white text-black" : "bg-white/[0.07] text-white/35",
      )}
      aria-hidden
    >
      <Icon className="size-4" strokeWidth={1.85} />
    </span>
  );
}

export function ProfileVerificationTimeline({
  status,
  submittedAt,
  reviewedAt,
}: {
  status: KycStatusApi;
  submittedAt?: string | null;
  reviewedAt?: string | null;
}) {
  const { t, locale } = useI18n();
  const steps = STEPS.map((step, index) => ({
    step,
    index,
    visual: stepState(status, step),
    icon: STEP_ICONS[index],
    labelKey: stepLabelKey(step, status),
    stamp:
      step === "submitted" || step === "manual_review"
        ? submittedAt
        : step === "decision"
          ? reviewedAt
          : null,
  }));

  return (
    <>
      <ol className="md:hidden">
        {steps.map(({ step, index, visual, icon, labelKey, stamp }) => (
          <li key={step} className="relative flex gap-3 pb-5 last:pb-0">
            {index < STEPS.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute top-9 bottom-0 left-[1.125rem] w-px -translate-x-1/2 border-l border-dashed",
                  visual === "done" ? "border-white/45" : "border-white/18",
                )}
              />
            ) : null}
            <TimelineStepNode icon={icon} visual={visual} />
            <StepCopy
              visual={visual}
              title={t(labelKey)}
              hint={t(`${labelKey}Hint`)}
              stamp={stamp && visual !== "upcoming" ? new Date(stamp).toLocaleString(locale) : null}
            />
          </li>
        ))}
      </ol>

      <ol className="hidden md:grid md:grid-cols-5 md:gap-3">
        {steps.map(({ step, index, visual, icon, labelKey, stamp }) => (
          <li key={step} className="relative flex min-w-0 flex-col items-center text-center">
            {index < STEPS.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute top-[1.125rem] left-[calc(50%+1.25rem)] h-px w-[calc(100%-0.5rem)] border-t border-dashed",
                  visual === "done" ? "border-white/45" : "border-white/18",
                )}
              />
            ) : null}
            <TimelineStepNode icon={icon} visual={visual} />
            <div className="mt-3 min-w-0">
              <StepCopy
                visual={visual}
                title={t(labelKey)}
                hint={t(`${labelKey}Hint`)}
                stamp={stamp && visual !== "upcoming" ? new Date(stamp).toLocaleString(locale) : null}
                align="center"
              />
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

function StepCopy({
  visual,
  title,
  hint,
  stamp,
  align = "start",
}: {
  visual: "done" | "current" | "upcoming";
  title: string;
  hint: string;
  stamp: string | null;
  align?: "start" | "center";
}) {
  return (
    <div className={cn("min-w-0 flex-1", align === "start" && "pt-0.5")}>
      <p
        className={cn(
          "text-[13px] font-semibold leading-snug",
          visual === "upcoming" ? "text-white/35" : "text-white",
        )}
      >
        {title}
      </p>
      <p
        className={cn(
          "mt-1 text-[12px] leading-relaxed",
          visual === "current" ? "text-zinc-400" : visual === "done" ? "text-zinc-500" : "text-white/30",
        )}
      >
        {hint}
      </p>
      {stamp ? <p className="mt-1 text-[11px] text-zinc-600">{stamp}</p> : null}
    </div>
  );
}
