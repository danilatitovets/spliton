/** Aligns with SQL catalog_normalize_genre buckets used by live catalog filters. */
export function normalizeCatalogGenreKey(raw: string): string {
  const g = raw.trim().toLowerCase();
  if (!g) return "";
  if (g.includes("pop")) return "pop";
  if (g.includes("hip")) return "hiphop";
  if (g.includes("rock")) return "rock";
  if (g.includes("indie")) return "indie";
  if (g.includes("electronic") || g.includes("electro") || g === "edm") return "electronic";
  return g.replace(/[^a-z0-9]+/g, "");
}

export function genresMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a.trim().toLowerCase() === b.trim().toLowerCase()) return true;
  const na = normalizeCatalogGenreKey(a);
  const nb = normalizeCatalogGenreKey(b);
  return Boolean(na && nb && na === nb);
}

export const CATALOG_GENRE_CHIP_KEYS = [
  "all",
  "electronic",
  "pop",
  "indie",
  "hiphop",
] as const;

export type CatalogGenreChipKey = (typeof CATALOG_GENRE_CHIP_KEYS)[number];

export function catalogGenreLabelKey(key: string): string {
  const normalized = normalizeCatalogGenreKey(key) || key.trim().toLowerCase();
  switch (normalized) {
    case "electronic":
      return "catalog.genre.electronic";
    case "pop":
      return "catalog.genre.pop";
    case "indie":
      return "catalog.genre.indie";
    case "hiphop":
      return "catalog.genre.hiphop";
    case "rock":
      return "catalog.genre.rock";
    default:
      return "";
  }
}
