export class TronProviderError extends Error {
  constructor(
    message: string,
    readonly code:
      | 'TIMEOUT'
      | 'HTTP'
      | 'RATE_LIMIT'
      | 'INVALID_JSON'
      | 'MALFORMED',
    readonly status?: number,
  ) {
    super(message);
    this.name = 'TronProviderError';
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitter(ms: number): number {
  const spread = Math.floor(ms * 0.2);
  return ms - spread + Math.floor(Math.random() * (spread * 2 + 1));
}

export async function tronFetchJson<T>(
  url: string,
  options: {
    method?: 'GET' | 'POST';
    apiKey?: string;
    body?: unknown;
    timeoutMs: number;
    maxAttempts?: number;
  },
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 4;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs);
    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (options.apiKey) headers['TRON-PRO-API-KEY'] = options.apiKey;
      if (options.body !== undefined) {
        headers['Content-Type'] = 'application/json';
      }
      const res = await fetch(url, {
        method: options.method ?? 'GET',
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      if (res.status === 429) {
        const retryAfter = Number.parseInt(res.headers.get('retry-after') ?? '', 10);
        const waitMs = Number.isFinite(retryAfter)
          ? retryAfter * 1000
          : jitter(400 * 2 ** (attempt - 1));
        if (attempt === maxAttempts) {
          throw new TronProviderError('TronGrid rate limited', 'RATE_LIMIT', 429);
        }
        await sleep(waitMs);
        continue;
      }

      if (res.status >= 500) {
        if (attempt === maxAttempts) {
          throw new TronProviderError(
            `TronGrid HTTP ${res.status}`,
            'HTTP',
            res.status,
          );
        }
        await sleep(jitter(300 * 2 ** (attempt - 1)));
        continue;
      }

      if (!res.ok) {
        throw new TronProviderError(
          `TronGrid HTTP ${res.status}`,
          'HTTP',
          res.status,
        );
      }

      const text = await res.text();
      try {
        return JSON.parse(text) as T;
      } catch {
        throw new TronProviderError('TronGrid returned invalid JSON', 'INVALID_JSON');
      }
    } catch (err) {
      if (err instanceof TronProviderError) {
        if (err.code === 'HTTP' && err.status && err.status < 500 && err.status !== 429) {
          throw err;
        }
        lastError = err;
        if (attempt === maxAttempts) throw err;
      } else if (err instanceof Error && err.name === 'AbortError') {
        lastError = new TronProviderError('TronGrid timeout', 'TIMEOUT');
        if (attempt === maxAttempts) throw lastError;
      } else {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt === maxAttempts) throw lastError;
      }
      await sleep(jitter(300 * 2 ** (attempt - 1)));
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new TronProviderError('TronGrid request failed', 'HTTP');
}
