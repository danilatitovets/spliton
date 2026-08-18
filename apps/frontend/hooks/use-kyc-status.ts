"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { localizedApiError } from "@/lib/api/localized-error";
import type { KycAddressPayload, KycStatusResponse } from "@/lib/kyc/kyc-status-adapter";
import { isLiveAccountEnabled } from "@/lib/public-env";
import {
  fetchKycStatus,
  saveKycAddress,
  saveKycDetails,
  startKycVerification,
  submitKycManual,
  uploadKycDocument,
} from "@/services/kyc.service";

export function useKycStatus() {
  const { authorizedFetch, isAuthenticated } = useAuth();
  const live = isLiveAccountEnabled() && isAuthenticated;

  const [data, setData] = useState<KycStatusResponse | null>(null);
  const [loading, setLoading] = useState(live);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!live) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchKycStatus(authorizedFetch);
      setData(res);
    } catch (e) {
      setData(null);
      setError(localizedApiError(e));
    } finally {
      setLoading(false);
    }
  }, [authorizedFetch, live]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = useCallback(
    async (fn: () => Promise<KycStatusResponse>) => {
      if (!live) return false;
      setSubmitting(true);
      setError(null);
      try {
        setData(await fn());
        return true;
      } catch (e) {
        setError(localizedApiError(e));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [live],
  );

  const start = useCallback(
    async (countryCode?: string) => run(() => startKycVerification(authorizedFetch, countryCode)),
    [authorizedFetch, run],
  );

  const saveDetails = useCallback(
    async (body: { countryCode: string; documentType: string; documentReference: string }) =>
      run(() => saveKycDetails(authorizedFetch, body)),
    [authorizedFetch, run],
  );

  const submitManual = useCallback(
    async (body?: { countryCode: string; documentType: string; documentReference: string }) =>
      run(() => submitKycManual(authorizedFetch, body ?? {})),
    [authorizedFetch, run],
  );

  const saveAddress = useCallback(
    async (body: KycAddressPayload) => run(() => saveKycAddress(authorizedFetch, body)),
    [authorizedFetch, run],
  );

  const uploadDocument = useCallback(
    async (docType: "identity" | "address" | "selfie", file: File) =>
      run(() => uploadKycDocument(authorizedFetch, docType, file)),
    [authorizedFetch, run],
  );

  return {
    live,
    data,
    loading,
    error,
    submitting,
    reload: load,
    start,
    saveDetails,
    submitManual,
    saveAddress,
    uploadDocument,
  };
}
