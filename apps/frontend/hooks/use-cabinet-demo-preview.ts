"use client";

import { useCallback, useSyncExternalStore } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import {
  getCabinetDemoDataPreference,
  isDemoPreviewEligible,
  setCabinetDemoDataPreference,
  subscribeCabinetDemoDataPreference,
} from "@/lib/demo/cabinet-demo-preview";

const serverSnapshot = () => false;

/** True when eligible user turned demo data ON (header toggle). */
export function useCabinetDemoPreview(): boolean {
  const { user, isAuthenticated } = useAuth();
  const preferred = useSyncExternalStore(
    subscribeCabinetDemoDataPreference,
    getCabinetDemoDataPreference,
    serverSnapshot,
  );
  if (!isAuthenticated || !isDemoPreviewEligible(user)) return false;
  return preferred;
}

/** Header toggle API for demo-eligible accounts. */
export function useCabinetDemoToggle() {
  const { user, isAuthenticated } = useAuth();
  const preferred = useSyncExternalStore(
    subscribeCabinetDemoDataPreference,
    getCabinetDemoDataPreference,
    serverSnapshot,
  );
  const eligible = Boolean(isAuthenticated && isDemoPreviewEligible(user));
  const enabled = eligible && preferred;

  const setEnabled = useCallback((next: boolean) => {
    setCabinetDemoDataPreference(next);
  }, []);

  return { eligible, enabled, setEnabled };
}
