export const LEGAL_POLICY_TYPE_ORDER = [
  "TERMS_OF_SERVICE",
  "PRIVACY_POLICY",
  "RISK_DISCLOSURE",
  "INVESTOR_AGREEMENT",
  "FEE_POLICY",
  "WITHDRAWAL_POLICY",
  "AML_POLICY",
  "KYC_POLICY",
  "SECONDARY_MARKET_RULES",
  "MARKET_RULES",
  "ROYALTY_RIGHTS_DISCLOSURE",
  "COOKIE_POLICY",
] as const;

export function sortLegalPoliciesByType<T extends { type: string }>(policies: T[]): T[] {
  const rank = new Map(LEGAL_POLICY_TYPE_ORDER.map((type, index) => [type, index]));
  return [...policies].sort((a, b) => {
    const aRank = rank.get(a.type as (typeof LEGAL_POLICY_TYPE_ORDER)[number]) ?? 999;
    const bRank = rank.get(b.type as (typeof LEGAL_POLICY_TYPE_ORDER)[number]) ?? 999;
    if (aRank !== bRank) return aRank - bRank;
    return a.type.localeCompare(b.type);
  });
}
