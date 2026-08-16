/** Generated Spliton icons for /assets/payouts overview. */
const BASE = "/images/payouts";

export const PAYOUTS_OVERVIEW_ICONS = {
  pulse: `${BASE}/payout-insight-pulse.png`,
  volume: `${BASE}/payout-insight-volume.png`,
  comparePrev: `${BASE}/payout-compare-icon-prev.png`,
  compareCurrent: `${BASE}/payout-compare-icon-current.png`,
  compareDeposit: `${BASE}/payout-compare-icon-deposit.png`,
  compareTexture: `${BASE}/payout-compare-card-texture.png`,
  releases: {
    Offset: `${BASE}/payout-release-offset.png`,
    "Midnight Drive": `${BASE}/payout-release-midnight.png`,
    "Glass Echo": `${BASE}/payout-release-glass.png`,
    "Low Horizon": `${BASE}/payout-release-horizon.png`,
    "Neon District": `${BASE}/payout-release-neon.png`,
  },
} as const;

export function payoutReleaseIcon(release: string): string {
  const map = PAYOUTS_OVERVIEW_ICONS.releases as Record<string, string>;
  return map[release] ?? PAYOUTS_OVERVIEW_ICONS.pulse;
}
