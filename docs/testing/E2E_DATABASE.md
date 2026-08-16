# E2E test database workflow

## Why a separate database

Backend e2e registers users, posts ledger entries, and deletes `@example.com` users in teardown. Running against a shared dev Supabase causes:

- unique constraint flakes (email, symbol),
- pooler timeouts under parallel load,
- accidental coupling to manual QA data.

Use `TEST_DATABASE_URL` pointing at **local Docker** (preferred for destructive resets) or a dedicated Supabase e2e project. Do **not** rely on `ALLOW_E2E_ON_DATABASE_URL=1` except as a last-resort local override.

## Nest connection rule (same as runtime)

When e2e maps `TEST_DATABASE_URL` → Nest `DATABASE_URL`, that URL must support interactive Prisma `$transaction`:

- Local Docker: `postgresql://postgres:spliton_e2e@127.0.0.1:5433/spliton_e2e`
- Supabase e2e project: **session** pooler `:5432` **without** `pgbouncer=true` (not transaction `:6543`)

See `docs/production/SUPABASE_POOL_TUNING.md`.

## Local Docker setup

```powershell
docker compose -f docker-compose.test.yml up -d
# If port 5433 is already used by an older container (e.g. spliton-e2e-pg), reuse it.

# Root .env (never commit):
# TEST_DATABASE_URL=postgresql://postgres:spliton_e2e@127.0.0.1:5433/spliton_e2e
# TEST_DIRECT_URL=postgresql://postgres:spliton_e2e@127.0.0.1:5433/spliton_e2e

npm run test:db:setup:seed
```

If migrate deploy fails with **P3005** (schema present, no `_prisma_migrations`), it is safe to **DROP SCHEMA public CASCADE** only on this local Docker DB, then re-run `npm run test:db:setup`. Never do that on Supabase.

## Run e2e

```powershell
# Jest reads TEST_DATABASE_URL via apps/backend/test/jest-e2e.setup.ts
npm run backend:test:e2e
```

## Cleanup

- Automatic: `jest-e2e.global-teardown.ts` after full suite (`deleteMany` where `email` ends with `@example.com`).
- Manual: `npm run test:db:cleanup`
- Skip teardown (debug): `E2E_SKIP_GLOBAL_CLEANUP=1`

## CI secrets (GitHub)

| Secret | Maps to |
|--------|---------|
| `BACKEND_E2E_DATABASE_URL` | `DATABASE_URL` |
| `BACKEND_E2E_DIRECT_URL` | `DIRECT_URL` |
| `BACKEND_E2E_TEST_DATABASE_URL` | optional `TEST_DATABASE_URL` |
| `BACKEND_E2E_JWT_SECRET` | `JWT_SECRET` |
| `BACKEND_E2E_JWT_REFRESH_SECRET` | `JWT_REFRESH_SECRET` |

E2e job runs `npm run test:db:setup` then `apps/backend` `npm run test:e2e`.

## Safe seed

`prisma db seed` only upserts roles and optionally grants SUPER_ADMIN to a known email — it does not wipe business data. Safe on empty e2e DB via `npm run test:db:setup:seed`.
