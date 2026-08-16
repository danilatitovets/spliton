# Supabase Pool Tuning — Spliton

## Connection architecture (required)

| Purpose | URL | Host / port | Notes |
| ------- | --- | ----------- | ----- |
| Nest runtime (`DATABASE_URL`) | Session pooler | `*.pooler.supabase.com:5432` | **No** `pgbouncer=true`. Required for interactive Prisma `$transaction` (primary/secondary/withdrawals). |
| Migrations (`DIRECT_URL`) | Direct Postgres | `db.<PROJECT_REF>.supabase.co:5432` | Prefer true direct host when reachable. |
| Transaction pooler `:6543` | Avoid for Nest | `…:6543?pgbouncer=true` | Breaks long interactive transactions (`Transaction not found`). Rejected in production by `assertDbConnectionPolicy()`. |

See `apps/backend/src/config/db-connection-policy.ts` and `.env.example`.

## Ops tips

- Keep `connection_limit` modest per API replica (e.g. 5–10) on the session pooler URL query string if needed.
- Do not run backend e2e + load tests against the same shared pool as interactive QA.
- Prefer `TEST_DATABASE_URL` → local Docker (`docker-compose.test.yml` on `:5433`) or a dedicated Supabase e2e project.
- Optional: `PRISMA_SLOW_QUERY_MS=500` for slow-query logging in development.
- Public `market_overview` uses a short TTL cache in code; do not cache balances/ownership.
