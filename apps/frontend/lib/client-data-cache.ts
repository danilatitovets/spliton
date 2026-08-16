type CacheEntry = { at: number; data: unknown };

const store = new Map<string, CacheEntry>();

const DEFAULT_TTL_MS = 45_000;

/** In-memory client cache so assets pages remount without a long skeleton. */
export function getClientCache<T>(key: string, ttlMs = DEFAULT_TTL_MS): T | null {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > ttlMs) {
    store.delete(key);
    return null;
  }
  return hit.data as T;
}

export function setClientCache(key: string, data: unknown): void {
  store.set(key, { at: Date.now(), data });
}

export function invalidateClientCache(prefix?: string): void {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}