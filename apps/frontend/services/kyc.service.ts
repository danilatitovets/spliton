import { parseApiClientError } from "@/lib/api/api-client-error";
import { getPublicApiBaseUrl } from "@/lib/public-env";
import type { KycStatusResponse } from "@/lib/kyc/kyc-status-adapter";

type AuthorizedFetch = (input: string, init?: RequestInit) => Promise<Response>;

export async function fetchKycStatus(
  authorizedFetch: AuthorizedFetch,
): Promise<KycStatusResponse> {
  const res = await authorizedFetch(`${getPublicApiBaseUrl()}/api/v1/kyc/status`);
  if (!res.ok) throw await parseApiClientError(res);
  return res.json() as Promise<KycStatusResponse>;
}

export async function startKycVerification(
  authorizedFetch: AuthorizedFetch,
  countryCode?: string,
): Promise<KycStatusResponse> {
  const res = await authorizedFetch(`${getPublicApiBaseUrl()}/api/v1/kyc/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ countryCode }),
  });
  if (!res.ok) throw await parseApiClientError(res);
  return res.json() as Promise<KycStatusResponse>;
}

export async function submitKycManual(
  authorizedFetch: AuthorizedFetch,
  body: { countryCode: string; documentType: string; documentReference: string },
): Promise<KycStatusResponse> {
  const res = await authorizedFetch(`${getPublicApiBaseUrl()}/api/v1/kyc/submit-manual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await parseApiClientError(res);
  return res.json() as Promise<KycStatusResponse>;
}
