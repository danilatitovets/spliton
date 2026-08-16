# Supabase Database Workflow

**Primary database:** Supabase PostgreSQL only (no Docker DB as source of truth).

## Environments

| Environment | Supabase project | Data | Migrations | Seed |
|-------------|------------------|------|------------|------|
| **Production** | `spliton-prod` (dedicated) | Real users, money, audit | CI/CD after staging | Roles upsert only |
| **Staging** | `spliton-staging` | Sanitized or test copy | First target for every release | Full idempotent seed OK |
| **Dev / Test** | `spliton-dev` or team shared | Dev + e2e | Local `migrate deploy` | Full seed |
| **E2E only** | `spliton-e2e` (recommended) | Disposable test rows | `npm run test:db:setup` | Optional seed |

**Rule:** Never point local `.env` at production unless doing a read-only emergency. Use separate project refs in connection strings.

## Connection strings

| Variable | Host / port | When |
|----------|-------------|------|
| `DATABASE_URL` | Session pooler `:5432` (**no** `pgbouncer=true`) | NestJS runtime — required for interactive Prisma `$transaction` |
| `DIRECT_URL` | `db.<ref>.supabase.co:5432` | `prisma migrate deploy`, DDL (prefer true direct host) |
| `TEST_DATABASE_URL` | Local Docker `:5433` or dedicated e2e session URL | Jest + `scripts/test-db-*.mjs` only |
| `TEST_DIRECT_URL` | Same as test DB / e2e direct | E2e migrate deploy |

**Do not** use transaction pooler `:6543?pgbouncer=true` as Nest `DATABASE_URL` — long financial `$transaction` can fail with `Transaction not found`. Enforced by `assertDbConnectionPolicy()` (`apps/backend/src/config/db-connection-policy.ts`).

Prisma schema:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

**Session pooler:** App queries + interactive transactions.  
**Direct:** Required for migrations when available — session pooler may work for DDL but true `db.*` is preferred.  
**Transaction pooler:** Avoid for Nest.

## Local development

```powershell
npm run prisma:check-backend   # port 3001 free (Windows EPERM)
npm run db:constraint-prechecks  # before CHECK migrations
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:seed
npm run dev
```

## Dedicated test database

See [E2E_DATABASE.md](./E2E_DATABASE.md). Summary:

```powershell
# .env: TEST_DATABASE_URL + TEST_DIRECT_URL
npm run test:db:setup
npm run test:db:drift-check
npm run test:db:check
```

Cleanup scripts refuse staging/production URLs unless `ALLOW_E2E_CLEANUP=1`.

## Migration deploy (staging / production)

1. [ ] `npm run db:constraint-prechecks` on target (zero violations on required checks)
2. [ ] Supabase backup / PITR confirmed for **production**
3. [ ] `npx prisma migrate status` — note pending migrations
4. [ ] `npm run prisma:migrate:deploy` on **staging** (uses `DIRECT_URL`)
5. [ ] `npm run test:db:drift-check` or manual smoke on finance tables
6. [ ] Deploy backend → smoke + finance e2e subset on `TEST_DATABASE_URL`
7. [ ] Repeat deploy on **production**
8. [ ] Verify `prisma migrate status` → up to date

### Enum migration note (`20260604120000`)

Deposit ingestion adds `deposit_status` value `CREDITED` and updates historical rows in the same migration. The migration file uses:

- `-- prisma:disable-transaction` — each statement commits separately (required: new enum labels must be visible before UPDATE)
- `ADD VALUE IF NOT EXISTS` — safe re-run
- `DO $$ … EXCEPTION duplicate_object` — idempotent CREATE TYPE / FK

Do **not** use manual `prisma db execute` as the primary path; `prisma migrate deploy` must succeed cleanly.

## Drift detection

Symptoms:

- Finance e2e 500 on wallet/ledger endpoints
- `migrate status` shows pending migrations but app “works” (schema applied manually)
- Missing `_prisma_migrations` table

Checks:

```powershell
npx prisma migrate status
npm run test:db:drift-check
npm run db:constraint-prechecks
```

Fix: `npm run test:db:setup` on dedicated DB, or `prisma migrate deploy` on staging with `DIRECT_URL`.

## Production deploy checklist

1. [ ] Prechecks on staging  
2. [ ] Backup on production  
3. [ ] Staging migrate + e2e subset green  
4. [ ] Staging app deploy + manual smoke ([STAGING_LIVE_CHECKLIST.md](./STAGING_LIVE_CHECKLIST.md))  
5. [ ] Production migrate  
6. [ ] Production app deploy  

## Rollback strategy

| Change type | Rollback |
|-------------|----------|
| Additive indexes / columns | Leave in place; deploy previous app binary |
| CHECK constraints | **Hard** — need new migration to DROP CONSTRAINT |
| Bad data migration | Forward-fix SQL + audit; no reset |

We do **not** use `migrate reset` on shared environments.

## Seed policy

| Env | `npm run prisma:seed` |
|-----|------------------------|
| Production | Only if runbook says so — roles upsert, SUPER_ADMIN idempotent |
| Staging / Dev / E2E | Safe — idempotent `skipDuplicates` |

## Crypto hardening (canonical tx + address invariants)

Applied via Prisma migrations (not `db push`):

| Migration | Purpose |
|-----------|---------|
| `20260815120000_crypto_usdt_trc20_engine` | Deposit/withdrawal TRC-20 engine tables, cursors, leases, address pool |
| `20260815200000_crypto_canonical_invariants` | Canonical/`lower(txid)` uniqueness, ownership source idempotency, lease `version`, address immutability triggers |

**Verify on target Supabase after deploy:**

```sql
-- expect these index/trigger names
SELECT indexname FROM pg_indexes WHERE schemaname='public'
  AND indexname IN (
    'deposits_canonical_chain_txid_token_uidx',
    'withdrawals_canonical_txid_uidx',
    'withdrawals_canonical_provider_tx_hash_uidx',
    'ownership_ledger_event_source_uidx'
  );
SELECT tgname FROM pg_trigger
  WHERE tgname IN (
    'trg_forbid_user_deposit_address_reassign',
    'trg_forbid_deposit_address_pool_reassign'
  );
```

**Kill switches (env):** `KILL_SWITCH_DISABLE_DEPOSIT_CREDIT`, `KILL_SWITCH_DISABLE_DEPOSITS`, `KILL_SWITCH_DISABLE_WITHDRAWALS`, `FEATURE_ENABLE_DEPOSITS`, `FEATURE_ENABLE_WITHDRAWALS`.

**Worker:** lease table `crypto_worker_leases` (id=`deposit-ingestion`) + heartbeat/fencing `version`. Scan cursors in `deposit_address_scan_cursors`.

**Historical i18n fix:** `20260608120000_app_locale_production_langs` is dependency-safe (skips columns not yet created). Clean `prisma migrate deploy` from empty PostgreSQL must succeed without `db push`.

## Security

- Service role key: backend only, never in Next.js `NEXT_PUBLIC_*`  
- See [SUPABASE_SECURITY_REVIEW.md](../database/SUPABASE_SECURITY_REVIEW.md)

## Related

- [E2E_DATABASE.md](./E2E_DATABASE.md)  
- [MIGRATION_AUDIT.md](../database/MIGRATION_AUDIT.md)  
- [DB_CONSTRAINT_PRECHECKS.md](../database/DB_CONSTRAINT_PRECHECKS.md)  
- [REPORT_WORKER_AND_STORAGE.md](./REPORT_WORKER_AND_STORAGE.md)
