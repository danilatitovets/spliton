import {
  applyPrismaConnectionLimit,
  collectDbConnectionIssues,
} from './db-connection-policy';

describe('applyPrismaConnectionLimit', () => {
  it('adds connection_limit=5 by default', () => {
    const out = applyPrismaConnectionLimit(
      'postgresql://u:p@aws-0-eu.pooler.supabase.com:5432/postgres',
      {},
    );
    expect(out).toContain('connection_limit=5');
    expect(out).toContain('pooler.supabase.com');
  });

  it('does not override an existing connection_limit', () => {
    const out = applyPrismaConnectionLimit(
      'postgresql://u:p@localhost:5432/db?connection_limit=3',
      { PRISMA_CONNECTION_LIMIT: '8' },
    );
    expect(out).toContain('connection_limit=3');
    expect(out).not.toContain('connection_limit=8');
  });

  it('does not cap isolated localhost/Docker URLs unless PRISMA_CONNECTION_LIMIT is set', () => {
    const out = applyPrismaConnectionLimit(
      'postgresql://u:p@127.0.0.1:5433/spliton_e2e',
      {},
    );
    expect(out).not.toContain('connection_limit');
  });

  it('honours PRISMA_CONNECTION_LIMIT and caps at 15', () => {
    const out = applyPrismaConnectionLimit(
      'postgresql://u:p@localhost:5433/spliton_e2e',
      { PRISMA_CONNECTION_LIMIT: '99' },
    );
    expect(out).toContain('connection_limit=15');
  });
});

describe('collectDbConnectionIssues', () => {
  it('flags transaction pooler DATABASE_URL in production', () => {
    const issues = collectDbConnectionIssues({
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://u:p@aws-0.pooler.supabase.com:6543/postgres?pgbouncer=true',
    });
    expect(issues.some((i) => i.code === 'DATABASE_URL_TRANSACTION_POOLER')).toBe(true);
  });
});
