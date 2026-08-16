/** Process-local TTL cache keys for public catalog reads. */
export const CATALOG_CACHE_KEYS = {
  releasesPrefix: 'catalog:releases:',
  releasesDefault: 'catalog:releases:default',
  releaseDetailPrefix: 'catalog:release:',
  primaryFeePct: 'catalog:primary-fee-pct',
  stats: 'catalog:stats',
  filtersPrefix: 'catalog:filters:',
} as const;

export function catalogFiltersCacheKey(kind: string): string {
  return `${CATALOG_CACHE_KEYS.filtersPrefix}${kind || 'all'}`;
}

export function catalogReleaseDetailCacheKey(releaseKey: string): string {
  return `${CATALOG_CACHE_KEYS.releaseDetailPrefix}${releaseKey.trim().toLowerCase()}`;
}
