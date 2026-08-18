# SPLITON — Final Technical State

**Date:** 2026-08-18 (completion pass, continued)
**Branch:** main (dirty worktree; no commit in this pass)
**Verdict:** NOT 100/100. Environment recovered. Connection-pool architecture fixed in code. Full live acceptance still blocked by Supabase session pooler `EMAXCONNSESSION`.

## Architecture (current)

| Layer | Fact |
| ----- | ---- |
| Frontend | Next.js App Router, port **3000** (not running this pass) |
| Backend | NestJS, port **4001** (not started against Supabase — pool exhausted) |
| Primary DB | Supabase PostgreSQL session pooler `:5432` (`pool_size` 15) |
| Dedicated E2E DB | Docker Postgres `127.0.0.1:5433` (`spliton-e2e-pg`) |
| Clean-migrate DB | Docker `spliton_e2e_zero` — **82/82 migrate deploy PASS** |
| Auth | HttpOnly refresh cookie + in-memory access token + `spliton_session=1` hint |

Runtime `DATABASE_URL` must stay session pooler `:5432` without `pgbouncer=true`. Transaction pooler `:6543` remains forbidden for Nest interactive txs.

## Inventory (rechecked 2026-08-18)

| Item | Count |
| ---- | ----- |
| Frontend `page.tsx` | **112** |
| Admin routes | **46** |
| Backend HTTP decorators | **556** (prior count; not re-summed this hour) |
| Prisma models | **109** |
| Prisma migrations | **82** |
| Markdown | **247** (prior) |

## Fixes landed this pass (code)

1. **Prisma session-pool cap** — `applyPrismaConnectionLimit()` default **5**, max **15**, applied by `PrismaService`. Isolated localhost/Docker URLs are **not** capped unless `PRISMA_CONNECTION_LIMIT` is set (so 20-way e2e claims are not starved).
2. **Shared e2e PrismaClient** — 45 `*.e2e-spec.ts` files no longer open a new client per helper. Concurrent races use `createIsolatedE2ePrisma()` and `$disconnect`.
3. **E2E teardown no longer hits Supabase** — `afterAll` was in `setupFiles` (`afterAll is not defined`), so teardown fell through to `.env` `DATABASE_URL` and opened more session-pooler clients. Teardown now calls `configureE2eDatabase()` first. Cleanup against `supabase.com` is refused unless isolated.
4. **Primary-order idempotent replay** — double submit with the same key was **409** because replay hashed `Number(units)` against DTO string `"2"`. Replay now compares `Decimal` + round id. E2E: **5/5 PASS**.
5. **Profile unknown ≠ zero / unverified** — security ring is a skeleton until `accountCenter.security` exists; KYC verify banner only when status is known.
6. **Cabinet demo default OFF** in staging/production (explicit `NEXT_PUBLIC_DEMO_FOR_ADMINS=1` still allowed).
7. **Admin/catalog mocks** remain gated behind explicit `*_DATA_SOURCE=mock`. Live default is live; live fetch does not swallow errors into mock KPI.

## Evidence executed this pass

| Gate | Result |
| ---- | ------ |
| `prisma validate` | PASS |
| `prisma generate` | PASS |
| Clean migrate `spliton_e2e_zero` | **82/82 PASS** |
| Docker `spliton_e2e` migrate status | up to date |
| `prisma migrate status` (Supabase session pooler) | **FAIL — EMAXCONNSESSION** pool_size 15 |
| Backend `tsc --noEmit` | PASS |
| Frontend `tsc --noEmit` | PASS |
| Backend unit (db-connection-policy, user-kyc) | PASS (9+5) |
| Frontend unit (auth, public-env, demo, profile overview/account/security/settings/verification) | PASS after mock `isStrictDeployMode` |
| Primary order e2e (Docker) | **5/5 PASS** |
| Secondary market e2e (Docker) | **6 PASS** (suite with primary in the same run) |
| Crypto engine + withdrawal ledger e2e | PASS (in the 21/22 cluster) |
| Crypto invariants e2e | **13/14 PASS**; 20-way pool claim **FAIL** (`Prisma engine empty` under concurrency) |
| Frontend `:3000` / backend `:4001` | **down** (intentionally not attached to exhausted Supabase) |
| Full route crawl / buttons / forms / 50× F5 / master journeys | **not re-run** |

Railway backend deploy `16354e57-62bd-46aa-a53e-997ae0fda94c` was **DEPLOYING** at last poll. Start command includes `prisma migrate deploy` against Supabase, which cannot obtain a session while pool_size 15 is full. Previous backend deploys **FAILED** for the same reason.

## Remaining (honest)

**P0**
- Supabase session pooler still `EMAXCONNSESSION`. Until the live Nest replica drops extra clients (or this deploy becomes SUCCESS with `connection_limit=5`), `migrate status` and a new replica start cannot be proven.

**P1**
- 20 concurrent deposit-pool claims flake with empty Prisma engine on Docker. Invariant not re-proven this pass.
- Full desktop/mobile crawl, button crawler, 50× profile F5, master user/admin journeys, performance p50/p95 — not executed after these changes.
- Schema parity vs live Supabase not compared (migrate status blocked).

**P2**
- `DIRECT_URL` still points at pooler host, not `db.<ref>.supabase.co`.
- One-off `scripts/**` still construct `new PrismaClient()` (not in Nest runtime).

## Scoring (honest)

Binding caps: live crawl / 50 F5 / master journeys not re-run → **MAX 92**. Supabase migrate status still FAIL → cannot claim operational 10/10. Crypto 20-way claim not green → financial red-team not 10/10.

Auth/profile flash and primary idempotent replay are **fixed in code** and unit/e2e covered where listed. They are **not** re-proven with 50 authenticated hard reloads on the live site.

**SPLITON FULL TECHNICAL READINESS: 92/100**
