/** Metallic orbital icons for the support hub (same style as megamenu). */
const SUPPORT_ICON_BASE = "/images/support-menu";

export const SUPPORT_CATEGORY_ICON_SRC: Record<string, string> = {
  "getting-started": `${SUPPORT_ICON_BASE}/getting-started.webp`,
  "popular-questions": `${SUPPORT_ICON_BASE}/popular-questions.webp`,
  "account-security": `${SUPPORT_ICON_BASE}/account-security.webp`,
  "deposits-withdrawals": `${SUPPORT_ICON_BASE}/deposits-withdrawals.webp`,
  "buy-sell-shares": `${SUPPORT_ICON_BASE}/buy-sell-shares.webp`,
  "secondary-market": `${SUPPORT_ICON_BASE}/secondary-market.webp`,
  payouts: `${SUPPORT_ICON_BASE}/payouts.webp`,
  docs: `${SUPPORT_ICON_BASE}/docs-terms.webp`,
};

export const SUPPORT_QUICK_ACTION_ICON_SRC: Record<string, string> = {
  openTicket: `${SUPPORT_ICON_BASE}/ticket.webp`,
  systemStatus: `${SUPPORT_ICON_BASE}/system-status.webp`,
  depositsWithdrawals: `${SUPPORT_ICON_BASE}/deposits-withdrawals.webp`,
  buyUnits: `${SUPPORT_ICON_BASE}/buy-sell-shares.webp`,
  secondaryMarket: `${SUPPORT_ICON_BASE}/secondary-market.webp`,
  accountSecurity: `${SUPPORT_ICON_BASE}/account-security.webp`,
};

export const SUPPORT_PRODUCT_DOC_ICON_SRC: Record<string, string> = {
  terms: `${SUPPORT_ICON_BASE}/docs-terms.webp`,
  privacy: `${SUPPORT_ICON_BASE}/docs-privacy.webp`,
  trust: `${SUPPORT_ICON_BASE}/docs-trust.webp`,
  "guide-selection": `${SUPPORT_ICON_BASE}/docs-guide.webp`,
  "guide-deal": `${SUPPORT_ICON_BASE}/docs-deal.webp`,
};

export function resolveSupportCategoryIconSrc(slug: string): string | undefined {
  return SUPPORT_CATEGORY_ICON_SRC[slug];
}
