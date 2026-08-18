/** Client-safe retry hint: GET/read may retry; mutating callers must still honour idempotency. */
export function isRetryableHttpStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}
