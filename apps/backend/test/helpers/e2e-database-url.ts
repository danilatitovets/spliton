/**
 * Refuses destructive e2e cleanup against staging/production URLs.
 * Set ALLOW_E2E_CLEANUP=1 only when targeting a dedicated test project.
 */
export function assertSafeE2eCleanupTarget(url: string): void {
  const lower = url.toLowerCase();
  const env = (
    process.env.ENVIRONMENT ??
    process.env.NODE_ENV ??
    ''
  ).toLowerCase();
  const blockedHostHints = [
    'prod',
    'production',
    'staging',
    'spliton-prod',
    'spliton-staging',
  ];
  const blockedEnv = ['production', 'staging', 'prod'];

  if (blockedEnv.includes(env) && process.env.ALLOW_E2E_CLEANUP !== '1') {
    throw new Error(
      `Refusing e2e cleanup: ENVIRONMENT/NODE_ENV=${env}. Set ALLOW_E2E_CLEANUP=1 only on dedicated test DB.`,
    );
  }

  for (const hint of blockedHostHints) {
    if (lower.includes(hint) && process.env.ALLOW_E2E_CLEANUP !== '1') {
      throw new Error(
        `Refusing e2e cleanup: URL looks like ${hint}. Use TEST_DATABASE_URL for a dedicated e2e project.`,
      );
    }
  }

  const mainUrl = process.env.DATABASE_URL?.trim();
  const testUrl = process.env.TEST_DATABASE_URL?.trim();
  const isolated =
    process.env.E2E_ISOLATED_DATABASE === '1' ||
    /@(127\.0\.0\.1|localhost)(:|\/)/i.test(url);

  if (/supabase\.com/i.test(url) && !isolated && process.env.ALLOW_E2E_CLEANUP !== '1') {
    throw new Error(
      'Refusing e2e cleanup against Supabase. Set TEST_DATABASE_URL to Docker :5433 (or another isolated DB).',
    );
  }
  // After configureE2eDatabase remaps TEST → DATABASE, the two env vars match by design.
  // Refuse only when both point at the same non-isolated URL (shared main DB misuse).
  if (
    mainUrl &&
    testUrl &&
    mainUrl === testUrl &&
    !isolated &&
    process.env.ALLOW_E2E_CLEANUP !== '1'
  ) {
    throw new Error(
      'Refusing e2e cleanup: TEST_DATABASE_URL equals DATABASE_URL. Use a dedicated test project ' +
        '(local Docker :5433 or separate Supabase e2e), or set ALLOW_E2E_CLEANUP=1.',
    );
  }
}

/**
 * After `jest-e2e.setup.ts`, `DATABASE_URL` is the effective DB URL for tests
 * (including when it was copied from `TEST_DATABASE_URL`).
 */
export function resolveE2eDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is required for e2e (set DATABASE_URL or TEST_DATABASE_URL)',
    );
  }
  assertSafeE2eCleanupTarget(url);
  return url;
}
