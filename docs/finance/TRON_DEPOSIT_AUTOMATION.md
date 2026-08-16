# TRON/USDT deposit automation

## Overview

SPLITON ingests USDT TRC-20 deposits by polling **assigned user addresses**, not the global USDT contract.

## Provider

- Interface: `DepositBlockchainProvider`
- Live: `TronDepositProvider` → TronGrid
  - list: `GET /v1/accounts/{address}/transactions/trc20?only_to=true`
  - verify: `POST /wallet/gettransactioninfobyid` + `POST /wallet/gettransactionbyid`
- Tests/dev: `MockDepositProvider` (forbidden in production when deposits are enabled)

Health: `GET /api/admin/v1/deposit-ingestion/health`

## Attribution

- `user_deposit_addresses.address` is unique
- one ACTIVE address per wallet
- no shared production address
- unknown recipient → `unattributed_onchain_transfers`

## Lifecycle

`PENDING_CONFIRMATIONS` → `CONFIRMED` → `CREDITED`

Failed / wrong token / malformed amount: ignored (fail closed, no credit).

## Exactly-once credit

- unique `deposits.blockchain_txid`
- unique `(chain_network, blockchain_txid, token_contract)` where txid present
- ledger idempotency `deposit-credit:{depositId}`
- `SELECT … FOR UPDATE` on the deposit row
- multi-replica: `crypto_worker_leases`

## Confirmations

`confirmations = currentConfirmedBlock - transactionBlock + 1`

`TRON_CONFIRMATIONS_REQUIRED` (fallback `TRON_CONFIRMATIONS`, default 20).

## Recovery

Admin `POST /api/admin/v1/deposits/recover` with txHash only. Amount from chain.

## Env

- `DEPOSIT_INGESTION_ENABLED`
- `FEATURE_ENABLE_DEPOSITS`
- `TRON_PROVIDER_MODE` (`mock|tron`)
- `TRON_PROVIDER_URL`
- `TRON_API_KEY`
- `TRON_NETWORK` (`mainnet|nile|shasta`)
- `TRON_USDT_CONTRACT`
- `TRON_CONFIRMATIONS_REQUIRED`
- `DEPOSIT_SCAN_INTERVAL_MS` / `TRON_POLL_INTERVAL`
- `KILL_SWITCH_DISABLE_DEPOSIT_CREDIT`
- `ALLOW_SHARED_DEPOSIT_ADDRESS` (dev/test only)

See also: [REAL_MONEY_OPERATIONS.md](../operations/REAL_MONEY_OPERATIONS.md).
