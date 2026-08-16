# SPLITON — Final Technical State

**Date:** 2026-08-16  
**Branch:** main (dirty worktree; no commit in this pass)  
**Verdict:** NOT claimed 100/100 — see acceptance gates below.

## Architecture (current)

| Layer | Fact |
| ----- | ---- |
| Frontend | Next.js App Router, port **3000** |
| Backend | NestJS, port **4001** (no `/api/v1` prefix on auth; catalog under `/api/v1/...`) |
| Primary DB | Supabase PostgreSQL (development) |
| Runtime DB URL | Prefer **session pooler `:5432`** (no `pgbouncer=true`). Transaction pooler `:6543` is fail-closed for interactive `$transaction` (see `db-connection-policy.ts`). |
| Migrations | `DIRECT_URL` — true `db.<ref>.supabase.co` often unreachable from this network; pooler `:5432` used when direct host fails (ops constraint). |
| Dedicated E2E DB | Docker Postgres `127.0.0.1:5433` / `spliton_e2e` (`docker-compose.test.yml`) |
| Blockchain | Mock / TronGrid **read-only** in safe tests — no real USDT broadcast |

## Inventory (rechecked this pass)

| Item | Count |
| ---- | ----- |
| Frontend pages (`page.tsx`) | **111** |
| Admin routes (URL space) | **46** |
| Dynamic routes | **15** |
| Prisma migrations | **82** |
| Frontend Playwright specs | **13** (incl. crawl/button/forms) |
| Backend `*.e2e-spec.ts` | **~61** |

Route URLs must **not** include Next.js route-group segments like `(portal)` or Windows `\`. Generator: `scripts/_routes.cjs` → `tmp-route-manifest.json`.

## Evidence executed this pass

### Route crawl (corrected URLs)

- Desktop 1440×900 + Mobile 390×844
- **224 passed, FAIL=0** (`tmp-playwright-corrected-crawl.log`, ~17.9m)
- Prior “224 pass” with `/admin\(portal)\...` was **invalid** (wrong paths). Fixed.

### Forms crawler

- Serial workers=1
- **forms=10, empty/invalid probed=10, pass=10, fail=0** (`tmp-forms-crawler-serial.log`)

### Button crawler

- v1 (wrong admin URLs): discovered 197 / pass 184 / fail 0 / skip 13
- **Final corrected URLs (workers=1):** 97 passed / 26.2m (	mp-button-crawler-stable.log, EXIT=0). Mutations skipped by design; clipboard noise filtered.

### Critical financial / crypto E2E (Docker `:5433`)

After raising Prisma interactive transaction timeouts:

| Suite | Result |
| ----- | ------ |
| withdrawal-ledger | PASS |
| crypto-invariants | PASS (16 tests with withdrawal) |
| secondary-market-user-settle | PASS |
| crypto-engine | PASS |
| deposit-ingestion | PASS |
| e2e-database-config | PASS |

**Totals this retest:** 2+3 suites, **27 tests PASS** (fix1 log + rest log).  
Root cause of prior FAIL: Prisma default interactive tx **timeout 5s** / **maxWait** too low under concurrent pool claim + multi-step withdrawal ledger.

### Performance (warm)

| Flow | Result |
| ---- | ------ |
| `/auth/refresh` (unauth) | avg **~8ms**, p95 **~19ms** (401/429) — historical ~4.5s **gone** |
| catalog API | avg ~58–66ms (occasional spike ~559ms) |
| release detail API | avg **43ms**, p95 **646ms**, n=20 |
| FE `/catalog/buy/:id` | avg **~992ms** (dev server) |
| FE `/` | ~1.6s (dev) |
| FE `/catalog` | ~1.1s (dev) |

### Builds / Prisma

| Gate | Result |
| ---- | ------ |
| prisma validate | PASS |
| prisma generate | EPERM (query engine DLL locked by running Nest) — ops, not schema failure |
| migrate status (e2e `:5433`) | up to date, 82 migrations |
| backend `tsc --noEmit` | PASS |
| clean migrate on e2e | already applied (deploy no-op) |

## Fixes landed this pass

1. **Route manifest hygiene** — strip `(portal)` / normalize `/`; regenerate via `scripts/_routes.cjs`.
2. **Crawl/forms/button** — `normalizeRoute()`; re-executed crawl on real `/admin/*`.
3. **Landing demo cards** — explicit “Demo preview” label (prior pass).
4. **Profile legal / public legal** — normalize policy ids; 404 vs Prisma enum 500 (prior pass).
5. **Help-center seed flake** — shared Prisma + retry (prior pass).
6. **Prisma interactive tx defaults** — `PRISMA_TX_MAX_WAIT_MS` / `PRISMA_TX_TIMEOUT_MS` in `PrismaService` (default 10s/20s).
7. **Withdrawal create** — explicit `{ maxWait: 15s, timeout: 30s }`.
8. **Deposit pool claim** — explicit `{ maxWait: 20s, timeout: 30s }` for concurrency red-team.

## Explicit gaps (block 100/100)

1. **Full backend Jest e2e (~61 suites)** — not fully executed this pass (critical subset PASS).
2. **Full frontend Playwright** (buy/wallet/secondary/admin/role-matrix) — not all re-executed.
3. **Authenticated admin deep UI** — crawl proves route HTTP <500 (often login redirect); not full KPI/button mutation matrix as logged-in admin.
4. **Master user + master admin journeys** — not completed as single scripted E2E.
5. **All 245 markdown claims** — inventory exists; not every claim re-verified line-by-line this pass.
6. **DIRECT_URL true direct host** — network may block `db.<ref>.supabase.co` (external).
7. **prisma generate** while Nest holds engine DLL — restart Nest to regenerate.
8. **Button crawler** — mutations intentionally skipped; soft-skip for detached nodes; not “every mutation effect proven”.
9. **Session pooler saturation** — historical `EMAXCONNSESSION` when many Node clients hold session connections.

## Scoring (honest)

Per owner scoring ceilings: without full BE/FE suites and authenticated admin depth, **100 is forbidden**.

**SPLITON FULL TECHNICAL READINESS: 90/100**

Not complete for uncontrolled production. Suitable for **controlled staging** after: full e2e suite green, authenticated admin journey, generate unlock, DIRECT_URL ops decision.