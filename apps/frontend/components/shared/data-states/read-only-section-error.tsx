"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { useReadOnlySectionError } from "@/hooks/use-read-only-section-error";
import { formatApiErrorWithMeta } from "@/lib/i18n/format-api-error";
import { looksLikeI18nKey } from "@/lib/i18n/dictionaries";

import { SectionUnavailableState } from "./section-unavailable-state";

type ReadOnlySectionErrorProps = {
  sectionId: string;
  error: unknown;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: "light" | "dark" | "admin";
  compact?: boolean;
  className?: string;
  title?: string;
  description?: string;
};

/** Neutral unavailable state for read-only data loads; reports backend outages to the global notice. */
export function ReadOnlySectionError({
  sectionId,
  error,
  onRetry,
  retryLabel,
  variant = "light",
  compact = false,
  className,
  title,
  description,
}: ReadOnlySectionErrorProps) {
  const { t } = useI18n();
  useReadOnlySectionError(sectionId, error, onRetry);

  if (!error) return null;

  const meta = formatApiErrorWithMeta(error);
  const rawDescription = description ?? meta.message;
  const resolvedDescription =
    rawDescription && looksLikeI18nKey(rawDescription) ? t(rawDescription, rawDescription) : rawDescription;

  return (
    <SectionUnavailableState
      title={title}
      description={resolvedDescription}
      onRetry={onRetry}
      retryLabel={retryLabel}
      variant={variant}
      compact={compact}
      className={className}
      errorId={meta.requestId}
    />
  );
}
