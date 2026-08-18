import { KycStatus } from '@prisma/client';

export function effectiveKycStatus(
  row: { status: KycStatus; expiresAt?: Date | null } | null | undefined,
): KycStatus {
  if (!row) return KycStatus.NOT_STARTED;
  if (
    row.status === KycStatus.APPROVED &&
    row.expiresAt &&
    row.expiresAt.getTime() <= Date.now()
  ) {
    return KycStatus.EXPIRED;
  }
  return row.status;
}

export function isKycLockedForEdits(status: KycStatus): boolean {
  return (
    status === KycStatus.APPROVED ||
    status === KycStatus.IN_REVIEW ||
    status === KycStatus.MANUAL_REVIEW_REQUIRED
  );
}

/** IN_REVIEW is reserved; manual submit currently writes MANUAL_REVIEW_REQUIRED only. */
