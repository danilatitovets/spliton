/**
 * Validates Supabase/Prisma connection URLs for interactive $transaction safety.
 * Transaction-mode pooler (:6543 + pgbouncer=true) is unsafe for long financial txs.
 */
export type DbConnectionIssue = {
  code: string;
  severity: 'error' | 'warning';
  message: string;
};

function parsePgUrl(raw: string | undefined): URL | null {
  if (!raw?.trim()) return null;
  try {
    return new URL(raw.trim().replace(/^postgresql:/i, 'postgres:'));
  } catch {
    return null;
  }
}

export function collectDbConnectionIssues(
  env: NodeJS.ProcessEnv = process.env,
): DbConnectionIssue[] {
  const issues: DbConnectionIssue[] = [];
  const databaseUrl = parsePgUrl(env.DATABASE_URL);
  const directUrl = parsePgUrl(env.DIRECT_URL);
  const nodeEnv = env.NODE_ENV ?? 'development';
  const strict = nodeEnv === 'production' || env.ENFORCE_DB_CONNECTION_POLICY === '1';

  if (databaseUrl) {
    const port = databaseUrl.port || '5432';
    const pgbouncer = databaseUrl.searchParams.get('pgbouncer') === 'true';
    const isPoolerHost = /pooler\.supabase\.com$/i.test(databaseUrl.hostname);
    if (port === '6543' || (isPoolerHost && pgbouncer)) {
      issues.push({
        code: 'DATABASE_URL_TRANSACTION_POOLER',
        severity: strict ? 'error' : 'warning',
        message:
          'DATABASE_URL uses Supabase transaction pooler (:6543 / pgbouncer=true). ' +
          'Interactive Prisma $transaction (secondary/primary/withdrawals) can fail with ' +
          '"Transaction not found". Prefer session pooler :5432 without pgbouncer=true for Nest runtime.',
      });
    }
  }

  if (directUrl) {
    const isPoolerHost = /pooler\.supabase\.com$/i.test(directUrl.hostname);
    const isDbHost = /^db\./i.test(directUrl.hostname);
    if (isPoolerHost && !isDbHost) {
      issues.push({
        code: 'DIRECT_URL_NOT_DIRECT_HOST',
        severity: 'warning',
        message:
          'DIRECT_URL points at pooler host, not db.<project-ref>.supabase.co. ' +
          'Migrations may work on session pooler, but Prisma docs require a true direct URL when available.',
      });
    }
  }

  if (databaseUrl && directUrl) {
    const same =
      databaseUrl.hostname === directUrl.hostname &&
      (databaseUrl.port || '5432') === (directUrl.port || '5432');
    if (same && /:6543/.test(env.DATABASE_URL ?? '')) {
      issues.push({
        code: 'DATABASE_AND_DIRECT_BOTH_TX_POOLER',
        severity: strict ? 'error' : 'warning',
        message: 'DATABASE_URL and DIRECT_URL both target the transaction pooler — split session vs direct.',
      });
    }
  }

  return issues;
}

export function assertDbConnectionPolicy(
  env: NodeJS.ProcessEnv = process.env,
): void {
  const issues = collectDbConnectionIssues(env);
  const errors = issues.filter((i) => i.severity === 'error');
  for (const issue of issues) {
    const line = `[db-connection] ${issue.code}: ${issue.message}`;
    if (issue.severity === 'error') {
      // eslint-disable-next-line no-console
      console.error(line);
    } else {
      // eslint-disable-next-line no-console
      console.warn(line);
    }
  }
  if (errors.length > 0) {
    throw new Error(
      `Unsafe DATABASE_URL/DIRECT_URL configuration:\n` +
        errors.map((e) => `  - ${e.code}: ${e.message}`).join('\n'),
    );
  }
}

const DEFAULT_PRISMA_CONNECTION_LIMIT = 5;
const MAX_PRISMA_CONNECTION_LIMIT = 15;

/**
 * Cap Prisma's client pool so one Nest replica cannot exhaust Supabase
 * session-mode `pool_size` (historically 15 → EMAXCONNSESSION).
 * Does not log or return secrets beyond the rewritten URL for Prisma itself.
 */
export function applyPrismaConnectionLimit(
  raw: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  const parsed = Number(env.PRISMA_CONNECTION_LIMIT ?? DEFAULT_PRISMA_CONNECTION_LIMIT);
  const limit =
    Number.isFinite(parsed) && parsed > 0
      ? Math.min(Math.floor(parsed), MAX_PRISMA_CONNECTION_LIMIT)
      : DEFAULT_PRISMA_CONNECTION_LIMIT;
  const trimmed = raw.trim();
  try {
    const url = new URL(trimmed.replace(/^postgresql:/i, 'postgres:'));
    const local =
      url.hostname === '127.0.0.1' ||
      url.hostname === 'localhost' ||
      url.hostname === '::1';
    // Isolated Docker/local Postgres can take more connections than Supabase
    // session pooler (pool_size 15). Do not cap unless explicitly configured.
    if (local && env.PRISMA_CONNECTION_LIMIT == null) {
      return trimmed;
    }
    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', String(limit));
    }
    return url.toString().replace(/^postgres:/i, 'postgresql:');
  } catch {
    if (/[?&]connection_limit=/.test(trimmed)) return trimmed;
    return `${trimmed}${trimmed.includes('?') ? '&' : '?'}connection_limit=${limit}`;
  }
}