import { parseApiClientError } from "@/lib/api/api-client-error";
import { getPublicApiBaseUrl } from "@/lib/public-env";
import type { KycAddressPayload, KycStatusResponse } from "@/lib/kyc/kyc-status-adapter";

type AuthorizedFetch = (input: string, init?: RequestInit) => Promise<Response>;

const kycUrl = (path: string) => `${getPublicApiBaseUrl()}/api/v1/kyc${path}`;

export async function fetchKycStatus(
  authorizedFetch: AuthorizedFetch,
): Promise<KycStatusResponse> {
  const res = await authorizedFetch(kycUrl("/status"));
  if (!res.ok) throw await parseApiClientError(res);
  return res.json() as Promise<KycStatusResponse>;
}

export async function startKycVerification(
  authorizedFetch: AuthorizedFetch,
  countryCode?: string,
): Promise<KycStatusResponse> {
  const res = await authorizedFetch(kycUrl("/start"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(countryCode ? { countryCode } : {}),
  });
  if (!res.ok) throw await parseApiClientError(res);
  return res.json() as Promise<KycStatusResponse>;
}

export async function saveKycDetails(
  authorizedFetch: AuthorizedFetch,
  body: { countryCode: string; documentType: string; documentReference: string },
): Promise<KycStatusResponse> {
  const res = await authorizedFetch(kycUrl("/details"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await parseApiClientError(res);
  return res.json() as Promise<KycStatusResponse>;
}

export async function submitKycManual(
  authorizedFetch: AuthorizedFetch,
  body: { countryCode?: string; documentType?: string; documentReference?: string } = {},
): Promise<KycStatusResponse> {
  const res = await authorizedFetch(kycUrl("/submit-manual"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await parseApiClientError(res);
  return res.json() as Promise<KycStatusResponse>;
}

export async function saveKycAddress(
  authorizedFetch: AuthorizedFetch,
  body: KycAddressPayload,
): Promise<KycStatusResponse> {
  const res = await authorizedFetch(kycUrl("/address"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await parseApiClientError(res);
  return res.json() as Promise<KycStatusResponse>;
}

export async function uploadKycDocument(
  authorizedFetch: AuthorizedFetch,
  docType: "identity" | "address" | "selfie",
  file: File,
): Promise<KycStatusResponse> {
  const form = new FormData();
  form.append("docType", docType);
  form.append("file", file);
  const res = await authorizedFetch(kycUrl("/documents"), {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw await parseApiClientError(res);
  return res.json() as Promise<KycStatusResponse>;
}
