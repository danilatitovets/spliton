# Spliton

Full-stack music revenue-sharing platform — release units, secondary market trading, wallets, KYC, earnings, and operator tooling.

**Case study:** [tivonix.tech/projects/spliton](https://www.tivonix.tech/projects/spliton)

> Note: the previous Vercel preview URL is not currently serving a public demo. Use the case study link above for product context.

---

## Purpose

Spliton models ownership shares in music releases. Users can browse releases, hold positions, trade on a secondary market, manage wallet balances, and receive payout/earnings flows — with auth, roles, KYC, and admin audit capabilities.

---

## Main features

- User auth with email verification and refresh-token sessions
- Two-factor authentication support
- Roles and user profiles
- Artists, labels, releases, and release metrics
- Share lots, positions, market listings, orders, trades, and price history
- Wallets, balances, deposits, withdrawals, fees
- Earnings periods, distributions, and payouts
- Ownership ledger
- KYC verification + documents
- Notifications, sessions, risk flags, admin actions, audit logs

---

## Architecture

Monorepo layout:

```
spliton/
├── apps/backend   # NestJS API
├── apps/frontend  # Next.js UI
└── prisma/        # Shared Prisma schema + migrations
```

- **API:** NestJS + Prisma + PostgreSQL
- **Web:** Next.js + React + Tailwind CSS
- **Auth:** JWT access + refresh cookies, passport-jwt
- **Email:** provider abstraction (dev outbox / Postmark)

---

## Stack

| Area | Technologies |
| --- | --- |
| Backend | NestJS, Prisma, PostgreSQL, Passport JWT, Throttler |
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Data model | Prisma schema covering market, wallet, KYC, payouts, audit |
| Quality | Jest unit tests, Nest e2e suites |

---

## Security & data

- Separate `JWT_SECRET` and `JWT_REFRESH_SECRET`
- Refresh tokens via HTTP cookies (configurable domain / SameSite / Secure)
- 2FA encryption key (`TWO_FACTOR_ENCRYPTION_KEY`)
- Email verification tokens with TTL
- Admin actions and audit log models for operational traceability
- Secrets belong in `.env` only — never commit real values

---

## Local setup

```bash
npm install
cp .env.example .env
# set DATABASE_URL, DIRECT_URL, JWT secrets, etc.

# Prisma (from repo root / as documented in backend)
npx prisma migrate dev

# Backend
npm run backend:dev

# Frontend (separate terminal)
npm --prefix apps/frontend install
npm --prefix apps/frontend run dev
```

### Environment variables (from `.env.example`)

| Variable | Role |
| --- | --- |
| `DATABASE_URL` / `DIRECT_URL` | PostgreSQL connection |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Auth secrets |
| `FRONTEND_ORIGIN` | CORS / frontend origin |
| `AUTH_REFRESH_COOKIE_NAME` | Refresh cookie name |
| `AUTH_COOKIE_DOMAIN` / `AUTH_COOKIE_SECURE` / `AUTH_COOKIE_SAME_SITE` | Cookie policy |
| `AUTH_RETURN_REFRESH_TOKEN_IN_BODY` | Dev/API convenience flag |
| `EMAIL_PROVIDER` / `EMAIL_FROM` | Email delivery mode |
| `POSTMARK_SERVER_TOKEN` / `POSTMARK_MESSAGE_STREAM` | Postmark (optional) |
| `APP_PUBLIC_URL` | Public app URL |
| `EMAIL_VERIFICATION_TOKEN_TTL_HOURS` | Verification TTL |
| `TWO_FACTOR_ENCRYPTION_KEY` | 2FA secret encryption |
| `PORT` | API port |
| `DEV_EMAIL_OUTBOX_ENABLED` | Local email outbox helper |

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run backend:dev` | NestJS watch mode |
| `npm run backend:build` | Build API |
| `npm run backend:start` | Start API |
| `npm run backend:test` | Unit tests |
| `npm run backend:test:e2e` | e2e tests |
| `npm run backend:lint` | Lint CI |
| `npm --prefix apps/frontend run dev` | Frontend dev server |
| `npm --prefix apps/frontend run build` | Frontend production build |

---

## Status

**Full-stack platform codebase** with substantial domain modeling (market, wallet, KYC, payouts). Treat deployment status as environment-specific; public interactive demo URL is not currently available from the previous Vercel preview.
