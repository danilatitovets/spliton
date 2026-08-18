import type { AppLocale } from "@/lib/i18n/types";
import { localeMessage } from "@/lib/i18n/normalize-locale";
import { PROFILE_MESSAGES } from "@/lib/i18n/profile-messages";
import { intlLocaleFor } from "@/lib/i18n/formatters";

export type SecurityEventTone = "ok" | "warn" | "danger" | "neutral";

/** Auth audit log action codes (see backend AuthAuditEvent). */
export const AUTH_AUDIT_ACTIONS = new Set<string>([
  "REGISTER",
  "LOGIN_SUCCESS",
  "LOGIN_FAILED",
  "REFRESH_SUCCESS",
  "REFRESH_FAILED",
  "REFRESH_REUSE_DETECTED",
  "LOGOUT",
  "LOGOUT_ALL",
  "TWO_FACTOR_SETUP_STARTED",
  "TWO_FACTOR_ENABLED",
  "TWO_FACTOR_DISABLED",
  "TWO_FACTOR_CHALLENGE_CREATED",
  "TWO_FACTOR_CHALLENGE_SUCCESS",
  "TWO_FACTOR_CHALLENGE_FAILED",
  "TWO_FACTOR_BACKUP_CODE_USED",
  "TWO_FACTOR_RECOVERY_CODES_REGENERATED",
  "EMAIL_VERIFICATION_SENT",
  "EMAIL_VERIFICATION_RESENT",
  "EMAIL_VERIFIED",
  "EMAIL_VERIFICATION_FAILED",
  "EMAIL_VERIFICATION_REQUIRED",
  "PASSWORD_RESET_REQUESTED",
  "PASSWORD_RESET_FAILED",
  "PASSWORD_RESET_COMPLETED",
  "PASSWORD_CHANGED",
  "PASSWORD_CHANGE_FAILED",
]);

export function isAuthAuditAction(action: string): boolean {
  return AUTH_AUDIT_ACTIONS.has(action.trim().toUpperCase());
}

const TONE_BY_ACTION: Record<string, SecurityEventTone> = {
  LOGIN_SUCCESS: "ok",
  REGISTER: "ok",
  EMAIL_VERIFIED: "ok",
  PASSWORD_CHANGED: "ok",
  PASSWORD_RESET_COMPLETED: "ok",
  TWO_FACTOR_ENABLED: "ok",
  TWO_FACTOR_CHALLENGE_SUCCESS: "ok",
  REFRESH_SUCCESS: "neutral",
  LOGOUT: "neutral",
  LOGOUT_ALL: "neutral",
  TWO_FACTOR_SETUP_STARTED: "neutral",
  TWO_FACTOR_CHALLENGE_CREATED: "neutral",
  EMAIL_VERIFICATION_SENT: "neutral",
  EMAIL_VERIFICATION_RESENT: "neutral",
  PASSWORD_RESET_REQUESTED: "neutral",
  LOGIN_FAILED: "warn",
  REFRESH_FAILED: "warn",
  PASSWORD_CHANGE_FAILED: "warn",
  PASSWORD_RESET_FAILED: "warn",
  EMAIL_VERIFICATION_FAILED: "warn",
  TWO_FACTOR_CHALLENGE_FAILED: "warn",
  REFRESH_REUSE_DETECTED: "danger",
  TWO_FACTOR_DISABLED: "danger",
  TWO_FACTOR_BACKUP_CODE_USED: "warn",
};

const ACTION_LABEL_FALLBACK: Partial<Record<AppLocale, Record<string, string>>> = {
  ru: {
    REFRESH_SUCCESS: "Сессия продлена",
    REFRESH_REUSE_DETECTED: "Подозрительная активность с сессией",
  },
  en: {
    LOGIN_SUCCESS: "Successful sign-in",
  },
};

function translate(locale: AppLocale, key: string, fallback?: string): string {
  return localeMessage(PROFILE_MESSAGES, locale, key, fallback);
}

/** User-facing title for an auth / security audit action. */
export function securityEventLabel(action: string, locale: AppLocale): string {
  const normalized = action.trim().toUpperCase();

  const fromFallback = ACTION_LABEL_FALLBACK[locale]?.[normalized];
  if (fromFallback) return fromFallback;

  const securityKey = `profile.security.events.action.${normalized}`;
  const fromSecurity = translate(locale, securityKey);
  if (fromSecurity !== securityKey) return fromSecurity;
  const overviewKey = `profile.overview.activity.event.${normalized}`;
  const fromOverview = translate(locale, overviewKey);
  if (fromOverview !== overviewKey) return fromOverview;
  return translate(locale, "profile.security.events.action.UNKNOWN", normalized);
}

/** Optional one-line explanation shown under high-signal events. */
export function securityEventHint(action: string, locale: AppLocale): string | null {
  const normalized = action.trim().toUpperCase();
  const key = `profile.security.events.hint.${normalized}`;
  const msg = translate(locale, key);
  return msg !== key ? msg : null;
}

export function securityEventTone(action: string): SecurityEventTone {
  return TONE_BY_ACTION[action.trim().toUpperCase()] ?? "neutral";
}

function ipv4From(value: string): number[] | null {
  const v4 = value.startsWith("::ffff:") ? value.slice("::ffff:".length) : value;
  const parts = v4.split(".");
  if (parts.length !== 4) return null;
  const nums = parts.map((part) => Number(part));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return nums;
}

/** Loopback, RFC1918, link-local, and CGNAT (100.64/10) — not a public client address. */
export function isPrivateOrSharedIp(ip: string | null | undefined): boolean {
  if (!ip?.trim()) return false;
  const value = ip.trim().toLowerCase();
  if (value === "::1" || value === "localhost" || value === "127.0.0.1") return true;
  const [a, b] = ipv4From(value) ?? [];
  if (a == null || b == null) return false;
  if (a === 10 || a === 127) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

export function publicClientIp(ip: string | null | undefined): string | null {
  if (!ip?.trim()) return null;
  const value = ip.trim();
  if (isPrivateOrSharedIp(value)) return null;
  if (value.startsWith("::ffff:")) return value.slice("::ffff:".length);
  return value;
}

export function formatSecurityEventIp(ip: string | null | undefined, locale: AppLocale): string | null {
  const publicIp = publicClientIp(ip);
  if (publicIp) return publicIp;
  if (!ip?.trim()) return null;
  if (isPrivateOrSharedIp(ip.trim())) {
    return translate(locale, "profile.security.events.ipLocal", "This device");
  }
  return null;
}

export function formatSecurityEventWhen(
  iso: string,
  locale: AppLocale,
  timeZone?: string | null,
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(intlLocaleFor(locale), {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...(timeZone?.trim() ? { timeZone: timeZone.trim() } : {}),
  }).format(date);
}
