"use client";

import { AssetsEmptyIllustration } from "@/components/dashboard/assets/assets-empty-illustration";
import type { AssetsEmptySituation } from "@/constants/assets/assets-empty-icons";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  message: string;
  title?: string;
  situation?: AssetsEmptySituation;
  className?: string;
  compact?: boolean;
};

export function EmptyState({
  message,
  title,
  situation,
  className,
  compact = false,
}: EmptyStateProps) {
  const illustrated = Boolean(situation);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        illustrated
          ? compact
            ? "px-3 py-6"
            : "px-4 py-8 sm:py-10"
          : compact
            ? "rounded-xl bg-neutral-50 px-3 py-6"
            : "rounded-2xl bg-neutral-50 px-4 py-8 sm:py-10",
        className,
      )}
      role="status"
    >
      {situation ? (
        <AssetsEmptyIllustration situation={situation} size={compact ? "sm" : "md"} />
      ) : null}
      {title ? (
        <p
          className={cn(
            "font-semibold text-neutral-800",
            situation ? "mt-4" : "",
            compact ? "text-xs" : "text-sm",
          )}
        >
          {title}
        </p>
      ) : null}
      <p
        className={cn(
          "max-w-sm leading-relaxed text-neutral-500",
          title ? "mt-1" : situation ? "mt-4" : "",
          compact ? "text-xs" : "text-sm",
        )}
      >
        {message}
      </p>
    </div>
  );
}
