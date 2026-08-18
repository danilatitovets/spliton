/** Unlock accept once the confirm control enters the viewport, not after the site footer. */
export function isConfirmControlReached(
  el: Element | null,
  viewportHeight = typeof window !== "undefined" ? window.innerHeight : 0,
): boolean {
  if (!el || viewportHeight <= 0) return false;
  return el.getBoundingClientRect().top < viewportHeight;
}
