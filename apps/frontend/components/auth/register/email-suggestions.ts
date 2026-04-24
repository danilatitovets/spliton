import { emailPattern } from "@/components/auth/register/validation";

export const SUGGESTED_DOMAINS = [
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",
  "icloud.com",
] as const;

export function getEmailSuggestions(raw: string): string[] {
  const t = raw.trim();
  if (!t || /\s/.test(t)) return [];
  const parts = t.split("@");
  if (parts.length > 2) return [];
  const local = (parts[0] ?? "").trim();
  if (!local) return [];
  if (parts.length === 1) {
    return SUGGESTED_DOMAINS.map((d) => `${local}@${d}`);
  }
  const domainPart = (parts[1] ?? "").toLowerCase();
  return SUGGESTED_DOMAINS.filter((d) => d.startsWith(domainPart)).map((d) => `${local}@${d}`);
}

export function shouldShowEmailSuggestions(raw: string): boolean {
  const t = raw.trim();
  if (!t) return false;
  if (emailPattern.test(t)) return false;
  return getEmailSuggestions(t).length > 0;
}
