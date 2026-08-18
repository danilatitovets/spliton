/** QA / e2e catalog fixtures that must never surface on public market pages. */
const NOISE_GENRE = /test|filtergenre|admincancel|catalogtest|dummy|sample|qa|jazzcatalog/;
const NOISE_RELEASE =
  /\b(e2e|test|admin|compliance|dummy|sample|qa|book track|trade depth|ph track|admin cancel)\b/;

export function isNoiseCatalogGenre(raw: string | null | undefined): boolean {
  const g = (raw ?? "").trim().toLowerCase().replace(/\s+/g, "");
  if (!g) return true;
  return NOISE_GENRE.test(g);
}

export function isNoiseCatalogRelease(
  title: string | null | undefined,
  symbol?: string | null,
  artist?: string | null,
): boolean {
  const hay = `${title ?? ""} ${symbol ?? ""} ${artist ?? ""}`.toLowerCase();
  return NOISE_RELEASE.test(hay);
}
