# Real-money operations (Spliton)

> Technical USDT TRC-20 engine is implemented in this repository. Legal/KYC sign-off is **out of scope** for technical readiness.
> Live canary (sending real USDT) is **operator-run** — the backend never signs or broadcasts.

## Private key policy

SPLITON backend:

- does **not** store a mnemonic
- does **not** store a treasury private key
- does **not** sign or broadcast blockchain withdrawals

Withdrawals are **manual/external signing**: lock → admin approve → operator broadcasts outside the app → paste txHash → backend **verifies on-chain** (SUCCESS, USDT contract, destination, exact net amount, confirmations) → complete.

`SUPER_ADMIN` / `ADMIN` may use an audited `manualOverride` with a required reason. Accountants cannot skip verification.

## Deposit flow

1. User requests a deposit address (`FEATURE_ENABLE_DEPOSITS=true`).
2. One **ACTIVE** TRON address is assigned to one user (`user_deposit_addresses` unique + one-active-per-wallet).
3. Shared/hot-wallet attribution is **forbidden in production**.
4. Worker (or admin recover-by-txHash) polls TronGrid **per assigned address**:
   `GET /v1/accounts/{address}/transactions/trc20`
5. Each transfer is verified with `gettransactioninfobyid` + `gettransactionbyid`:
   SUCCESS receipt, USDT contract, destination, exact raw amount (6 decimals), confirmations.
6. Lifecycle: `DETECTED` / `PENDING_CONFIRMATIONS` → `CONFIRMED` → `CREDITED` (exactly once via unique txHash + ledger idempotency `deposit-credit:{depositId}`).
7. Unknown destination → `unattributed_onchain_transfers` (never credited to a random user).

Confirmations: `currentBlock - txBlock + 1`, required = `TRON_CONFIRMATIONS_REQUIRED` (fallback `TRON_CONFIRMATIONS`).

## Kill switches

| Env | Effect |
|-----|--------|
| `FEATURE_ENABLE_DEPOSITS=false` or `KILL_SWITCH_DISABLE_DEPOSITS=true` | No new addresses / deposit API |
| `KILL_SWITCH_DISABLE_DEPOSIT_CREDIT=true` | Scan and persist DETECTED/PENDING/CONFIRMED, **no ledger credit** |
| `DEPOSIT_INGESTION_ENABLED=false` | Worker interval off (admin can still `POST /api/admin/v1/deposit-ingestion/run` and recover-by-hash) |

## Admin recovery

`POST /api/admin/v1/deposits/recover` `{ "txHash": "..." }`

Amount is **only** blockchain-derived. Duplicate recoveries are idempotent.

Also: recheck (`POST /api/admin/v1/deposits/:id/recheck`), unattributed list, reconciliation, crypto health (`GET /api/admin/v1/deposit-ingestion/health`).

## Withdrawal flow

available → locked request → admin approval → **external broadcast** → txHash → on-chain verification → completed.

Completion is **not** allowed on an arbitrary unverified hash (except audited admin override).

## Env (server-only)

See `.env.example`: `TRON_PROVIDER_MODE`, `TRON_PROVIDER_URL`, `TRON_API_KEY`, `TRON_NETWORK`, `TRON_USDT_CONTRACT`, `TRON_CONFIRMATIONS_REQUIRED`, `DEPOSIT_INGESTION_ENABLED`, `DEPOSIT_SCAN_INTERVAL_MS`, `FEATURE_ENABLE_DEPOSITS`, `KILL_SWITCH_DISABLE_DEPOSIT_CREDIT`.

Testnet: `TRON_NETWORK=nile` must **not** use the mainnet USDT contract (fail-closed).

## First controlled live canary (operator)

1. Staging/dev DB only until you explicitly choose production.
2. `TRON_PROVIDER_MODE=tron`, unique addresses, credit kill switch **on** first.
3. Send a **small** USDT TRC-20 to the user's assigned address (you send it; the app does not).
4. Confirm DETECTED → confirmations → (disable credit kill) CREDITED → buy units.
5. Do not enable public marketing until this is stable.

## No-go (hard stop)

- Private keys in repo, frontend, or logs
- Shared deposit address in production
- Mock Tron provider in production with deposits enabled
- Credit without SUCCESS + contract + destination + confirmations
- Completing a withdrawal without verified txHash (except audited override)
