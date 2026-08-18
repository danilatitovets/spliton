import { assertApiOk, parseApiClientError } from "@/lib/api/api-client-error";
import { getPublicApiBaseUrl } from "@/lib/public-env";

type AuthorizedFetch = (input: string, init?: RequestInit) => Promise<Response>;

export type AccountCompletenessLevel = "LOW" | "MEDIUM" | "HIGH" | "COMPLETE";
export type SecurityLevel = "LOW" | "MEDIUM" | "HIGH";

export type SecurityRecommendation = {
  code: string;
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  isCompleted: boolean;
  actionHref?: string;
};

export type AccountCenterSummary = {
  accountCompleteness: {
    score: number;
    maxScore: number;
    level: AccountCompletenessLevel;
    completedItems: string[];
    missingItems: string[];
  };
  security: {
    score: number;
    maxScore: number;
    level: SecurityLevel;
    recommendations: SecurityRecommendation[];
    emailVerified: boolean;
    twoFactorEnabled: boolean;
    passwordSet: boolean;
    passwordChangedAt?: string | null;
    activeSessionsCount?: number;
    lastLoginAt?: string | null;
  };
  verification: {
    status: string;
    level?: string | null;
    canDeposit?: boolean;
    canWithdraw?: boolean;
    canBuyPrimary?: boolean;
    canTradeSecondary?: boolean;
  };
  legal: {
    missingRequiredConsentsCount: number;
    hasAcceptedCurrentRequiredPolicies: boolean;
  };
  activity: {
    openSupportTicketsCount?: number;
    openDisputesCount?: number;
    unreadNotificationsCount?: number;
    pendingWithdrawalsCount?: number;
  };
  securityPreferences: {
    withdrawalEmailConfirmationEnabled: boolean;
    withdrawalAddressWhitelistEnabled: boolean;
    suspiciousLoginAlertsEnabled: boolean;
    emailSecurityNotificationsEnabled: boolean;
    enforcementReady: boolean;
  };
  recentSecurityEvents: Array<{
    id: string;
    action: string;
    ip: string | null;
    userAgent: string | null;
    createdAt: string;
  }>;
};

export type UserMeProfile = {
  id: string;
  email: string;
  emailVerified?: boolean;
  status?: string;
  roles?: string[];
  createdAt?: string;
  profile?: {
    displayName?: string | null;
    timezone?: string | null;
    preferredLocale?: string;
    countryCode?: string | null;
  };
  security?: {
    twoFaEnabled: boolean;
    activeSessions: number;
  };
  accountCenter?: AccountCenterSummary;
};

export async function fetchUserMe(fetcher: AuthorizedFetch): Promise<UserMeProfile> {
  const res = await fetcher(`${getPublicApiBaseUrl()}/users/me`);
  await assertApiOk(res);
  return res.json() as Promise<UserMeProfile>;
}

export async function patchUserPreferences(
  fetcher: AuthorizedFetch,
  body: { displayName?: string; preferredLocale?: string; timezone?: string },
): Promise<void> {
  const res = await fetcher(`${getPublicApiBaseUrl()}/users/me/preferences`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Не удалось сохранить настройки");
}

export type UserSessionItem = {
  id: string;
  device: string | null;
  ip: string | null;
  userAgent: string | null;
  lastActiveAt: string;
  createdAt: string;
  active: boolean;
  revokedAt: string | null;
  isCurrent?: boolean;
};

export async function fetchUserSessions(fetcher: AuthorizedFetch) {
  const res = await fetcher(`${getPublicApiBaseUrl()}/api/v1/me/sessions`);
  await assertApiOk(res);
  return res.json() as Promise<{ items: UserSessionItem[] }>;
}

export async function revokeUserSession(fetcher: AuthorizedFetch, sessionId: string) {
  const res = await fetcher(`${getPublicApiBaseUrl()}/api/v1/me/sessions/${sessionId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Не удалось завершить сессию");
}

export async function logoutAllUserSessions(fetcher: AuthorizedFetch) {
  const res = await fetcher(`${getPublicApiBaseUrl()}/api/v1/me/logout-all`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Не удалось завершить сессии");
}

export type SecurityEventItem = {
  id: string;
  action: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
};

export async function fetchSecurityEvents(fetcher: AuthorizedFetch) {
  const res = await fetcher(`${getPublicApiBaseUrl()}/api/v1/me/security-events`);
  await assertApiOk(res);
  return res.json() as Promise<{ items: SecurityEventItem[] }>;
}

export type UserSecurityPreferences = {
  withdrawalEmailConfirmationEnabled: boolean;
  withdrawalAddressWhitelistEnabled: boolean;
  suspiciousLoginAlertsEnabled: boolean;
};

export async function fetchSecurityPreferences(fetcher: AuthorizedFetch): Promise<UserSecurityPreferences> {
  const res = await fetcher(`${getPublicApiBaseUrl()}/api/v1/me/security-preferences`);
  await assertApiOk(res);
  return res.json() as Promise<UserSecurityPreferences>;
}

export async function patchSecurityPreferences(
  fetcher: AuthorizedFetch,
  body: Partial<UserSecurityPreferences>,
): Promise<UserSecurityPreferences> {
  const res = await fetcher(`${getPublicApiBaseUrl()}/api/v1/me/security-preferences`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await assertApiOk(res);
  return res.json() as Promise<UserSecurityPreferences>;
}

export async function changeUserPassword(
  fetcher: AuthorizedFetch,
  body: { currentPassword: string; newPassword: string },
): Promise<void> {
  const res = await fetcher(`${getPublicApiBaseUrl()}/api/v1/me/password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("profile.security.password.error.invalidCurrent");
    const err = await parseApiClientError(res);
    // Prefer localized profile keys for known weak-password / validation cases.
    if (res.status === 400) throw new Error("profile.security.password.error.generic");
    throw err;
  }
}
