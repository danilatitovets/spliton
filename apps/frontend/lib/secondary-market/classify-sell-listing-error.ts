export type SellListingFailedKind =
  | "insufficient_units"
  | "invalid_price"
  | "network"
  | "compliance"
  | "generic";

const INSUFFICIENT_UNITS_CODES = new Set([
  "INSUFFICIENT_UNITS",
  "INSUFFICIENT_AVAILABLE",
  "INSUFFICIENT_BALANCE",
  "WALLET_INSUFFICIENT_BALANCE",
]);

const INVALID_PRICE_CODES = new Set([
  "INVALID_PRICE",
  "VALIDATION_ERROR",
  "BAD_REQUEST",
  "PRICE_OUT_OF_RANGE",
]);

const NETWORK_CODES = new Set([
  "NETWORK_ERROR",
  "SERVER_UNAVAILABLE",
  "TIMEOUT",
  "PROVIDER_UNAVAILABLE",
  "SYSTEM_MAINTENANCE",
]);

const COMPLIANCE_CODES = new Set([
  "COMPLIANCE_RESTRICTED",
  "CONSENT_REQUIRED",
  "LEGAL_CONSENT_REQUIRED",
  "KYC_REQUIRED",
  "KYC_IN_REVIEW",
  "AML_BLOCKED",
  "AML_RESTRICTED",
  "COUNTRY_RESTRICTED",
  "COUNTRY_BLOCKED",
  "FEATURE_DISABLED",
  "SECONDARY_MARKET_DISABLED",
]);

export function classifySellListingError(code?: string | null): SellListingFailedKind {
  if (!code) return "generic";
  if (INSUFFICIENT_UNITS_CODES.has(code)) return "insufficient_units";
  if (INVALID_PRICE_CODES.has(code)) return "invalid_price";
  if (NETWORK_CODES.has(code)) return "network";
  if (COMPLIANCE_CODES.has(code)) return "compliance";
  return "generic";
}

export function extractApiErrorCode(err: unknown): string | null {
  if (!err || typeof err !== "object") return null;
  const rec = err as Record<string, unknown> & {
    details?: { blockingCode?: string };
    response?: { error?: { code?: string; details?: { blockingCode?: string } } };
  };
  const blocking =
    rec.details?.blockingCode ?? rec.response?.error?.details?.blockingCode;
  if (typeof blocking === "string" && blocking.length > 0) return blocking;
  if (typeof rec.code === "string") return rec.code;
  if (typeof rec.errorCode === "string") return rec.errorCode;
  if (typeof rec.response?.error?.code === "string") return rec.response.error.code;
  return null;
}
