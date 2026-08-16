import { resolveApiUrl } from "@/lib/public-env";
import type { AppLocale } from "@/lib/i18n/types";

export type ActiveAnnouncement = {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  shortMessage: string | null;
  actionLabel: string | null;
  actionUrl: string | null;
  dismissible: boolean;
  sticky: boolean;
};

const announcementCache = new Map<
  string,
  { expiresAt: number; promise: Promise<ActiveAnnouncement[]> }
>();
const ANNOUNCEMENT_TTL_MS = 30_000;

export async function fetchActiveAnnouncements(params: {
  locale: AppLocale;
  surface?: "public" | "app" | "admin";
  accessToken?: string | null;
}): Promise<ActiveAnnouncement[]> {
  const surface = params.surface ?? "app";
  const authKey = params.accessToken ? "auth" : "guest";
  const cacheKey = `${params.locale}:${surface}:${authKey}`;
  const hit = announcementCache.get(cacheKey);
  if (hit && hit.expiresAt > Date.now()) return hit.promise;

  const query = new URLSearchParams({
    locale: params.locale,
    surface,
  });
  const headers: HeadersInit = {};
  if (params.accessToken) {
    headers.Authorization = `Bearer ${params.accessToken}`;
  }

  const promise = (async () => {
    try {
      const response = await fetch(resolveApiUrl(`/api/v1/system-announcements/active?${query}`), {
        credentials: "include",
        headers,
        cache: "no-store",
      });
      if (!response.ok) return [] as ActiveAnnouncement[];
      const body = (await response.json()) as { items?: ActiveAnnouncement[] };
      return body.items ?? [];
    } catch {
      return [] as ActiveAnnouncement[];
    }
  })();

  announcementCache.set(cacheKey, {
    expiresAt: Date.now() + ANNOUNCEMENT_TTL_MS,
    promise,
  });
  return promise;
}

export async function dismissAnnouncement(id: string, accessToken: string): Promise<void> {
  await fetch(resolveApiUrl(`/api/v1/system-announcements/${id}/dismiss`), {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
}

export async function updateUserLocale(
  accessToken: string,
  preferredLocale: AppLocale,
): Promise<void> {
  await fetch(resolveApiUrl("/users/me/preferences"), {
    method: "PATCH",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ preferredLocale }),
  });
}
