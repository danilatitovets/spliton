"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { loginPathWithNext } from "@/constants/routes";
import {
  addWatchlistItem,
  fetchWatchlist,
  removeWatchlistItem,
} from "@/services/secondary-market.service";

type FavoriteEntry = {
  watchlistId: string;
  releaseUuid: string;
};

export function useCatalogFavorites() {
  const { isAuthenticated, isLoading: authLoading, authorizedFetch } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [entries, setEntries] = useState<FavoriteEntry[]>([]);
  const [ready, setReady] = useState(false);
  const pendingRef = useRef<Set<string>>(new Set());
  const fetchRef = useRef(authorizedFetch);
  const entriesRef = useRef(entries);
  const hydrateGen = useRef(0);

  fetchRef.current = authorizedFetch;
  entriesRef.current = entries;

  const hydrate = useCallback(async (opts?: { soft?: boolean }) => {
    const soft = Boolean(opts?.soft);
    if (!isAuthenticated) {
      setEntries([]);
      setReady(true);
      return;
    }

    const gen = ++hydrateGen.current;
    if (!soft) setReady(false);

    try {
      const { items } = await fetchWatchlist(fetchRef.current);
      if (gen !== hydrateGen.current) return;
      setEntries(
        items.map((item) => ({
          watchlistId: item.id,
          releaseUuid: item.releaseUuid,
        })),
      );
    } catch {
      if (gen !== hydrateGen.current) return;
    } finally {
      if (gen === hydrateGen.current) setReady(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;
    void hydrate({ soft: entriesRef.current.length > 0 });
  }, [authLoading, isAuthenticated, hydrate]);

  const favoriteIds = useMemo(
    () => new Set(entries.map((e) => e.releaseUuid)),
    [entries],
  );

  const favoriteIdList = useMemo(() => Array.from(favoriteIds), [favoriteIds]);

  const watchlistIdByRelease = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of entries) map.set(e.releaseUuid, e.watchlistId);
    return map;
  }, [entries]);

  const requireAuth = useCallback(() => {
    if (authLoading) return;
    router.push(loginPathWithNext(pathname || "/catalog"));
  }, [authLoading, pathname, router]);

  const isFavorite = useCallback(
    (releaseId: string) => favoriteIds.has(releaseId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    async (releaseId: string): Promise<"added" | "removed" | "auth" | "noop"> => {
      if (authLoading) return "noop";
      if (!isAuthenticated) {
        requireAuth();
        return "auth";
      }
      if (pendingRef.current.has(releaseId)) return "noop";

      pendingRef.current.add(releaseId);
      const existingWatchlistId = watchlistIdByRelease.get(releaseId);
      const snapshot = entriesRef.current;

      try {
        if (existingWatchlistId) {
          setEntries((prev) => prev.filter((e) => e.releaseUuid !== releaseId));
          if (!String(existingWatchlistId).startsWith("temp-")) {
            await removeWatchlistItem(fetchRef.current, existingWatchlistId);
          }
          return "removed";
        }

        const tempId = "temp-" + releaseId;
        setEntries((prev) => {
          if (prev.some((e) => e.releaseUuid === releaseId)) return prev;
          return [...prev, { watchlistId: tempId, releaseUuid: releaseId }];
        });

        const created = await addWatchlistItem(fetchRef.current, releaseId);
        setEntries((prev) => {
          const withoutTemp = prev.filter(
            (e) => e.watchlistId !== tempId && e.releaseUuid !== releaseId,
          );
          return [...withoutTemp, { watchlistId: created.id, releaseUuid: releaseId }];
        });
        return "added";
      } catch {
        setEntries(snapshot);
        return "noop";
      } finally {
        pendingRef.current.delete(releaseId);
      }
    },
    [authLoading, isAuthenticated, requireAuth, watchlistIdByRelease],
  );

  return {
    isAuthenticated,
    authLoading,
    ready,
    favoriteIds,
    favoriteIdList,
    isFavorite,
    toggleFavorite,
    requireAuth,
    reload: () => hydrate({ soft: true }),
  };
}
