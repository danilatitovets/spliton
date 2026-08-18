"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { isLiveAccountEnabled } from "@/lib/public-env";
import {
  fetchEligibilitySummary,
  type EligibilitySummary,
} from "@/services/legal.service";

export function useEligibilitySummary() {
  const { authorizedFetch, isAuthenticated, isLoading: authLoading } = useAuth();
  const live = isLiveAccountEnabled() && isAuthenticated;
  const ready = !authLoading;

  const [data, setData] = useState<EligibilitySummary | null>(null);
  const [loading, setLoading] = useState(isLiveAccountEnabled());
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const reload = useCallback(async () => {
    if (!ready) return;
    const requestId = ++requestIdRef.current;

    if (!live) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const summary = await fetchEligibilitySummary(authorizedFetch);
      if (requestId !== requestIdRef.current) return;
      setData(summary);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setData(null);
      setError("verification.eligibility.loadError");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [authorizedFetch, live, ready]);

  useEffect(() => {
    void reload();
    return () => {
      requestIdRef.current += 1;
    };
  }, [reload]);

  return { live, data, loading, error, reload };
}
