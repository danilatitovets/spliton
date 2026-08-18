/**
 * Per-account cabinet demo preview.
 * Eligible users get a header toggle: demo data vs live API across the cabinet.
 */

import { isStrictDeployMode } from "@/lib/public-env";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN", "PLATFORM_ADMIN"]);

export const CABINET_DEMO_STORAGE_KEY = "spliton.cabinet-demo-data";
export const CABINET_DEMO_EVENT = "spliton-cabinet-demo";

export type DemoPreviewUser = {
  email?: string | null;
  roles?: string[] | null;
  profile?: { displayName?: string | null } | null;
};

function trimEnv(value: string | undefined): string | undefined {
  const v = value?.trim();
  return v ? v : undefined;
}

/** Comma/space-separated emails in NEXT_PUBLIC_DEMO_ACCOUNT_EMAILS. */
export function getDemoAccountEmails(): string[] {
  return (trimEnv(process.env.NEXT_PUBLIC_DEMO_ACCOUNT_EMAILS) ?? "")
    .split(/[,;\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Staging/production: off unless NEXT_PUBLIC_DEMO_FOR_ADMINS=1.
 * Local development: on unless explicitly 0/false.
 */
export function isDemoForAdminsEnabled(): boolean {
  const raw = trimEnv(process.env.NEXT_PUBLIC_DEMO_FOR_ADMINS);
  if (raw == null) return !isStrictDeployMode();
  return raw !== "0" && raw.toLowerCase() !== "false";
}

/** User may switch demo ↔ live in the header. */
export function isDemoPreviewEligible(user: DemoPreviewUser | null | undefined): boolean {
  if (!user) return false;
  const email = user.email?.trim().toLowerCase();
  if (email && getDemoAccountEmails().includes(email)) return true;
  if (!isDemoForAdminsEnabled()) return false;
  if (user.roles?.some((r) => ADMIN_ROLES.has(String(r).toUpperCase()))) return true;
  const display = user.profile?.displayName?.trim().toLowerCase() ?? "";
  if (display === "spliton admin" || display.endsWith(" admin")) return true;
  return false;
}

/** @deprecated use isDemoPreviewEligible */
export const isDemoPreviewUser = isDemoPreviewEligible;

/** Default off. Live cabinet data unless the user explicitly enables demo. */
function readStoredDemoPreference(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(CABINET_DEMO_STORAGE_KEY);
    if (raw == null) return false;
    return raw === "1" || raw === "true";
  } catch {
    return false;
  }
}

export function getCabinetDemoDataPreference(): boolean {
  return readStoredDemoPreference();
}

export function setCabinetDemoDataPreference(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CABINET_DEMO_STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    /* ignore quota / private mode */
  }
  window.dispatchEvent(new Event(CABINET_DEMO_EVENT));
}

export function subscribeCabinetDemoDataPreference(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const onStorage = (e: StorageEvent) => {
    if (e.key === CABINET_DEMO_STORAGE_KEY || e.key === null) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CABINET_DEMO_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CABINET_DEMO_EVENT, onStoreChange);
  };
}

/** Profile overview demo holdings (dark cabinet). */
export const PROFILE_DEMO_HOLDINGS = [
  {
    name: "Midnight Code",
    sub: "MD2145",
    price: "1 200 UNT",
    change: "+2,4%",
    up: true,
    cover: "/images/hero-journey/1.webp",
  },
  {
    name: "Neon Harbor",
    sub: "AC2145",
    price: "860 UNT",
    change: "+1,1%",
    up: true,
    cover: "/images/hero-journey/2.webp",
  },
  {
    name: "Signal Path",
    sub: "SGN",
    price: "420 UNT",
    change: "−0,6%",
    up: false,
    cover: "/images/hero-journey/3.webp",
  },
] as const;

export const PROFILE_DEMO_BALANCE = "11 280,45 USDT";
export const PROFILE_DEMO_SECURITY_SCORE = 72;
