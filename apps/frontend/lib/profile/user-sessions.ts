import type { SecuritySessionRow } from "@/constants/dashboard/profile-security";
import { profileSecurityLastActive } from "@/lib/i18n/profile-messages";
import type { AppLocale } from "@/lib/i18n/types";
import { publicClientIp } from "@/lib/profile/security-event-display";
import { parseUserAgentShort } from "@/lib/profile/security-labels";
import type { UserSessionItem } from "@/services/user-me.service";

export function sessionDeviceKind(device: string): "phone" | "laptop" {
  const value = device.toLowerCase();
  if (/iphone|ipad|android|ios|mobile|phone|tablet/.test(value)) return "phone";
  return "laptop";
}

function looksLikeUserAgent(value: string): boolean {
  return /mozilla\/|applewebkit|chrome\/|safari\/|gecko\//i.test(value) || value.length > 64;
}

export function mapUserSessionsToRows(
  items: UserSessionItem[],
  locale: AppLocale,
  browserLabel: string,
): SecuritySessionRow[] {
  if (items.length === 0) return [];
  const active = items.filter((s) => s.active);
  const sorted = [...active].sort(
    (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime(),
  );
  return sorted.map((row, index) => {
    const rawDevice = row.device?.trim() ?? "";
    const device =
      rawDevice && !looksLikeUserAgent(rawDevice)
        ? rawDevice
        : parseUserAgentShort(row.userAgent || rawDevice, locale) || browserLabel;
    const anyCurrent = sorted.some((s) => s.isCurrent);
    return {
      id: row.id,
      device,
      location: "—",
      ip: publicClientIp(row.ip) ?? "—",
      lastActive: profileSecurityLastActive(row.lastActiveAt, locale),
      lastActiveAt: row.lastActiveAt,
      createdAt: row.createdAt,
      current: anyCurrent ? Boolean(row.isCurrent) : index === 0,
    };
  });
}
