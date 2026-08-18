/** Structured API error — preserves `code` for formatApiError / messageForApiError. */
export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly status?: number,
    readonly requestId?: string,
    readonly details?: unknown,
    readonly retryable?: boolean,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type ErrorBody = {
  error?: {
    code?: string;
    message?: string | string[];
    details?: { blockingCode?: string; [key: string]: unknown };
  };
  code?: string;
  message?: string | string[] | Record<string, unknown>;
  requestId?: string;
  correlationId?: string;
  retryable?: boolean;
  details?: { blockingCode?: string; [key: string]: unknown };
};

function extractMessage(raw: ErrorBody["message"]): string | undefined {
  if (!raw) return undefined;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    const parts = raw.filter((m): m is string => typeof m === "string");
    return parts.length > 0 ? parts.join(". ") : undefined;
  }
  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
  }
  return undefined;
}

export async function parseApiClientError(res: Response): Promise<ApiClientError> {
  try {
    const body = (await res.json()) as ErrorBody;
    const details = body.error?.details ?? body.details;
    const blocking =
      details && typeof details === "object" && typeof details.blockingCode === "string"
        ? details.blockingCode
        : undefined;
    const code = blocking ?? body.error?.code ?? body.code;
    const rawMessage = body.error?.message ?? body.message;
    const message =
      extractMessage(rawMessage) ??
      (typeof rawMessage === "string" ? rawMessage : undefined) ??
      res.statusText;
    const requestId =
      body.correlationId ??
      body.requestId ??
      res.headers.get("x-request-id") ??
      undefined;
    return new ApiClientError(message, code, res.status, requestId, details, body.retryable);
  } catch {
    const requestId = res.headers.get("x-request-id") ?? undefined;
    return new ApiClientError(res.statusText, undefined, res.status, requestId);
  }
}

export async function assertApiOk(res: Response): Promise<void> {
  if (!res.ok) throw await parseApiClientError(res);
}
