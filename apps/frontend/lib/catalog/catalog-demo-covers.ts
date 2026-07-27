/** Demo artwork for catalog cards without a real cover — hero-journey set only. */
export const CATALOG_DEMO_COVERS = [
  "/images/hero-journey/1.webp",
  "/images/hero-journey/2.webp",
  "/images/hero-journey/3.webp",
] as const;

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Stable cover pick from demo set by id/title seed. */
export function pickCatalogDemoCover(seed: string): string {
  const list = CATALOG_DEMO_COVERS;
  return list[hashSeed(seed || "spliton") % list.length]!;
}

/**
 * Prefer real coverUrl; otherwise a deterministic hero-journey demo image.
 */
export function resolveCatalogCoverUrl(
  coverUrl: string | null | undefined,
  seed: string,
): string {
  const trimmed = coverUrl?.trim();
  if (trimmed) return trimmed;
  return pickCatalogDemoCover(seed);
}
