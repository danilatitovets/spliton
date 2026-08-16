import { tronFetchJson, TronProviderError } from './tron-http.client';

function jsonResponse(body: unknown, init?: { status?: number; headers?: Record<string, string> }) {
  return {
    ok: (init?.status ?? 200) >= 200 && (init?.status ?? 200) < 300,
    status: init?.status ?? 200,
    headers: {
      get: (name: string) => init?.headers?.[name.toLowerCase()] ?? null,
    },
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

describe('tronFetchJson', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('parses JSON on success', async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ ok: true })) as typeof fetch;
    await expect(
      tronFetchJson('https://api.trongrid.io/wallet/getnowblock', { timeoutMs: 1000 }),
    ).resolves.toEqual({ ok: true });
  });

  it('retries 429 then succeeds', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, { status: 429, headers: { 'retry-after': '0' } }))
      .mockResolvedValueOnce(jsonResponse({ ok: true })) as typeof fetch;
    await expect(
      tronFetchJson('https://api.trongrid.io/x', { timeoutMs: 1000, maxAttempts: 3 }),
    ).resolves.toEqual({ ok: true });
  });

  it('retries 500 then succeeds', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, { status: 500 }))
      .mockResolvedValueOnce(jsonResponse({ ok: true })) as typeof fetch;
    await expect(
      tronFetchJson('https://api.trongrid.io/x', { timeoutMs: 1000, maxAttempts: 3 }),
    ).resolves.toEqual({ ok: true });
  });

  it('fails closed on invalid JSON', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      text: async () => 'not-json',
    } as unknown as Response) as typeof fetch;
    await expect(
      tronFetchJson('https://api.trongrid.io/x', { timeoutMs: 1000, maxAttempts: 1 }),
    ).rejects.toBeInstanceOf(TronProviderError);
  });
});
