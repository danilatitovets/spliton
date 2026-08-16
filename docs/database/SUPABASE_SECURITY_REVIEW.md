# Supabase Security Review

## Architecture

```
Browser → Next.js (public env only)
       → NestJS API (JWT, server secrets)
       → Supabase PostgreSQL (DATABASE_URL session pooler :5432)
```

**No direct Supabase client access from frontend** for financial tables — correct for FinTech.

## Keys & env

| Secret | Where | Status |
|--------|-------|--------|
| `DATABASE_URL` | Backend only | ✓ Session pooler `:5432` (no `pgbouncer=true`) |
| `DIRECT_URL` | Migrations/CI only | ✓ Direct `db.<ref>.supabase.co:5432` |
| `JWT_SECRET` / refresh | Backend only | ✓ |
| `SUPABASE_SERVICE_ROLE_KEY` | Listed in TODO — use server-only if Supabase APIs added | Do not expose to frontend |
| `NEXT_PUBLIC_*` | Frontend | ✓ No DB URLs in repo `.env.example` |

## RLS (Row Level Security)

| Approach | Recommendation |
|----------|----------------|
| Backend-only DB access | **Current** — RLS not required if no PostgREST/anon access to `public` |
| Future Supabase Realtime | Enable RLS per table if exposing anon key |

**Action:** In Supabase Dashboard → confirm no public policies on `wallet_*`, `withdrawals`, `deposits` if using Supabase API. If only Prisma connects, RLS optional but document "defense in depth" for staging.

## Connection security

- TLS enforced by Supabase
- Use **session pooler** (`:5432`, no `pgbouncer=true`) for Nest runtime; **direct** (`db.<ref>:5432`) for migrations. Transaction pooler (`:6543` + `pgbouncer=true`) is unsafe for interactive Prisma `$transaction`.
- Never commit `.env` — `.env.example` has placeholders only ✓

## Admin API

- Staff JWT + `RolesGuard` + per-service asserts
- No user API for withdrawal approve ✓

## Risks

| Risk | Mitigation |
|------|------------|
| Service role in frontend bundle | Code review + env lint |
| Shared dev DB credentials | Separate Supabase projects per env |
| `report_jobs.file_content` size | Move to object storage |
| E2E against production DB | Use dedicated test project |

## Checklist

- [ ] Production/staging/dev separate Supabase projects
- [ ] `DIRECT_URL` only in CI and local migrate, not Vercel frontend
- [ ] Rotate JWT secrets on staff compromise
- [ ] Backup: Supabase PITR / daily backups enabled on prod
