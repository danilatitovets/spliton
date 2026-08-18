import type { VerificationUiStatus } from "@/constants/dashboard/profile-verification";

export type KycStatusApi =
  | "NOT_STARTED"
  | "PENDING"
  | "IN_REVIEW"
  | "MANUAL_REVIEW_REQUIRED"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED";

export type KycAddressPayload = {
  city: string;
  street: string;
  postalCode: string;
  countryCode?: string;
};

export type KycChecklistSteps = {
  details: boolean;
  identity: boolean;
  address: boolean;
  selfie: boolean;
};

export type KycStatusResponse = {
  status: KycStatusApi;
  level: string;
  countryCode: string | null;
  profileCountryCode?: string | null;
  documentType?: string | null;
  documentReference?: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  expiresAt: string | null;
  rejectionReasonSafe: string | null;
  provider: string;
  address?: KycAddressPayload | null;
  canSubmit?: boolean;
  required?: {
    details: boolean;
    identity: boolean;
    address: boolean;
    selfie: boolean;
  };
  steps?: KycChecklistSteps;
  files?: {
    identity: boolean;
    address: boolean;
    selfie: boolean;
  };
};

export function emptyKycSteps(): KycChecklistSteps {
  return { details: false, identity: false, address: false, selfie: false };
}

export function requiredKycStepCount(required?: KycStatusResponse["required"]): number {
  if (!required) return 3;
  return Number(required.details) + Number(required.identity) + Number(required.selfie) + Number(required.address);
}

export function completedRequiredStepCount(
  steps: KycChecklistSteps,
  required?: KycStatusResponse["required"],
): number {
  const flags = required ?? { details: true, identity: true, selfie: true, address: false };
  let done = 0;
  if (flags.details && steps.details) done += 1;
  if (flags.identity && steps.identity) done += 1;
  if (flags.selfie && steps.selfie) done += 1;
  if (flags.address && steps.address) done += 1;
  return done;
}

export function mapKycStatusToUi(status: KycStatusApi | string): VerificationUiStatus {
  switch (status) {
    case "APPROVED":
      return "approved";
    case "REJECTED":
      return "rejected";
    case "EXPIRED":
      return "expired";
    case "IN_REVIEW":
    case "MANUAL_REVIEW_REQUIRED":
      return "pending_review";
    case "PENDING":
      return "in_progress";
    case "NOT_STARTED":
    default:
      return "not_started";
  }
}
