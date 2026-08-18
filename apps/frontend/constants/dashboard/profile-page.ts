import { ROUTES } from "@/constants/routes";

export const PROFILE_PAGE_TABS = [
  { id: "overview" },
  { id: "account" },
  { id: "verification" },
  { id: "legal" },
  { id: "security" },
  { id: "settings" },
] as const;

export type ProfilePageTabId = (typeof PROFILE_PAGE_TABS)[number]["id"];

export function profileDashboardHref(tab: ProfilePageTabId): string {
  const u = new URLSearchParams();
  u.set("tab", tab);
  return `${ROUTES.dashboardProfile}?${u.toString()}`;
}

export function profileDashboardSecurityHref(): string {
  return profileDashboardHref("security");
}

export function isProfileDevicesPath(pathname: string): boolean {
  return (
    pathname === ROUTES.dashboardProfileDevices ||
    pathname.startsWith(`${ROUTES.dashboardProfileDevices}/`)
  );
}

export function isProfileLegalPath(pathname: string): boolean {
  return pathname.startsWith(`${ROUTES.dashboardProfile}/legal`);
}

export function parseProfilePageTabParam(raw: string | null): ProfilePageTabId {
  if (raw === "devices") return "security";
  if (!raw) return "overview";
  return PROFILE_PAGE_TABS.some((t) => t.id === raw) ? (raw as ProfilePageTabId) : "overview";
}

export function resolveProfilePageTab(pathname: string, tabParam: string | null): ProfilePageTabId {
  if (isProfileDevicesPath(pathname)) return "security";
  if (isProfileLegalPath(pathname)) return "legal";
  return parseProfilePageTabParam(tabParam);
}

export function isProfileDevicesView(
  pathname: string,
  tabParam: string | null,
  viewParam: string | null,
): boolean {
  if (isProfileDevicesPath(pathname)) return true;
  if (tabParam === "devices") return true;
  if (viewParam === "devices") return true;
  return false;
}
