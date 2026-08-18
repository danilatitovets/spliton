"use client";

import Link from "next/link";
import { Plus } from "@/lib/lucide";

import { BRAND } from "@/constants/brand";
import { SplitonDarkSurface } from "@/components/dashboard/assets/spliton-dark-surface";
import { VERIFY_VIDEO } from "@/components/dashboard/profile/profile-verification-steps";
import { cn } from "@/lib/utils";

export type ProfileVerificationHeroAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
};

const expandEase = "duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]";

/** Centered Spliton Verification plate — CTA pinned top-right, expands on hover. */
export function ProfileVerificationStatusHero({
  action,
}: {
  action?: ProfileVerificationHeroAction | null;
}) {
  const title = `${BRAND.name} Verification`;
  const showAction = Boolean(action && !action.disabled);

  return (
    <SplitonDarkSurface
      className="relative min-h-0 px-5 py-14 shadow-none sm:px-10 sm:py-16"
      contentClassName="relative min-h-[7.5rem] sm:min-h-[8.5rem]"
      watermarkCentered
      watermarkText={title}
      backgroundVideo={VERIFY_VIDEO}
      videoClarity="crisp"
      aria-label={title}
      overlay={showAction && action ? <HeroExpandPlus action={action} /> : null}
    >
      <h1 className="sr-only">{title}</h1>
    </SplitonDarkSurface>
  );
}

function HeroExpandPlus({ action }: { action: ProfileVerificationHeroAction }) {
  const className = cn(
    "group pointer-events-auto absolute top-3 right-3 sm:top-4 sm:right-4",
    "inline-flex h-10 max-w-10 flex-row-reverse items-center overflow-hidden rounded-full",
    "bg-white/[0.08] text-white",
    "transition-[max-width,background-color,color,box-shadow,transform] motion-reduce:transition-none",
    expandEase,
    "hover:max-w-[15rem] hover:bg-white hover:text-black hover:shadow-[0_10px_28px_rgba(0,0,0,0.4)]",
    "focus-visible:max-w-[15rem] focus-visible:bg-white focus-visible:text-black",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
    "active:scale-[0.97]",
  );

  const inner = (
    <>
      <span className="grid size-10 shrink-0 place-items-center" aria-hidden>
        <Plus className="size-[1.15rem] stroke-[2.25] transition-transform motion-reduce:transition-none duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-90 group-focus-visible:rotate-90" />
      </span>
      <span
        className={cn(
          "grid min-w-0 grid-cols-[0fr] opacity-0",
          "transition-[grid-template-columns,opacity] motion-reduce:transition-none",
          expandEase,
          "group-hover:grid-cols-[1fr] group-hover:opacity-100",
          "group-focus-visible:grid-cols-[1fr] group-focus-visible:opacity-100",
        )}
      >
        <span className="overflow-hidden">
          <span className="block whitespace-nowrap pl-4 pr-1 text-[13px] font-semibold tracking-tight">
            {action.label}
          </span>
        </span>
      </span>
    </>
  );

  if (action.href) {
    return (
      <Link href={action.href} className={className} aria-label={action.label}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={action.onClick} className={className} aria-label={action.label}>
      {inner}
    </button>
  );
}
