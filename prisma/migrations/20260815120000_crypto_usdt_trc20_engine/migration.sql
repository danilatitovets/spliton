-- USDT TRC-20 production-grade ingress: deposit fields, unique address
-- attribution, scan cursors, worker leases, unattributed transfers.

-- Enums (PG <15 compatible)
DO $$ BEGIN
  ALTER TYPE "deposit_status" ADD VALUE 'REJECTED';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "deposit_ingestion_source" ADD VALUE 'RECOVERY';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "unattributed_onchain_status" AS ENUM ('OPEN', 'ASSIGNED', 'IGNORED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Deposit operational columns
ALTER TABLE "deposits"
  ADD COLUMN IF NOT EXISTS "chain" TEXT NOT NULL DEFAULT 'TRON',
  ADD COLUMN IF NOT EXISTS "chain_network" TEXT NOT NULL DEFAULT 'mainnet',
  ADD COLUMN IF NOT EXISTS "asset_code" TEXT NOT NULL DEFAULT 'USDT',
  ADD COLUMN IF NOT EXISTS "token_standard" TEXT NOT NULL DEFAULT 'TRC20',
  ADD COLUMN IF NOT EXISTS "raw_amount" TEXT,
  ADD COLUMN IF NOT EXISTS "amount" DECIMAL(20, 8),
  ADD COLUMN IF NOT EXISTS "block_timestamp" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "detected_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "confirmed_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "provider" TEXT,
  ADD COLUMN IF NOT EXISTS "execution_status" TEXT,
  ADD COLUMN IF NOT EXISTS "metadata" JSONB;

UPDATE "deposits" d
SET "amount" = wt."net_amount"
FROM "wallet_transactions" wt
WHERE d."wallet_tx_id" = wt."id"
  AND d."amount" IS NULL
  AND wt."net_amount" > 0;

CREATE INDEX IF NOT EXISTS "deposits_to_address_status_idx"
  ON "deposits" ("to_address", "status");
CREATE INDEX IF NOT EXISTS "deposits_chain_token_idx"
  ON "deposits" ("chain_network", "token_contract");

CREATE UNIQUE INDEX IF NOT EXISTS "deposits_chain_txid_token_uidx"
  ON "deposits" ("chain_network", "blockchain_txid", "token_contract")
  WHERE "blockchain_txid" IS NOT NULL;

ALTER TABLE "deposits"
  ADD CONSTRAINT "deposits_amount_positive"
  CHECK ("amount" IS NULL OR "amount" > 0);

-- Watcher metrics
ALTER TABLE "deposit_watcher_states"
  ADD COLUMN IF NOT EXISTS "addresses_watched" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "last_metrics" JSONB;

-- Per-address scan cursors
CREATE TABLE IF NOT EXISTS "deposit_address_scan_cursors" (
  "id" UUID NOT NULL,
  "address" TEXT NOT NULL,
  "last_fingerprint" TEXT,
  "watermark_timestamp" BIGINT NOT NULL DEFAULT 0,
  "last_seen_block" BIGINT NOT NULL DEFAULT 0,
  "last_scanned_at" TIMESTAMP(3),
  "last_error" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "deposit_address_scan_cursors_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "deposit_address_scan_cursors_address_key"
  ON "deposit_address_scan_cursors" ("address");

-- Multi-replica worker lease (pgbouncer-safe)
CREATE TABLE IF NOT EXISTS "crypto_worker_leases" (
  "id" TEXT NOT NULL,
  "holder" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "heartbeat_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "crypto_worker_leases_pkey" PRIMARY KEY ("id")
);

-- Unknown-address on-chain USDT
CREATE TABLE IF NOT EXISTS "unattributed_onchain_transfers" (
  "id" UUID NOT NULL,
  "chain" TEXT NOT NULL DEFAULT 'TRON',
  "chain_network" TEXT NOT NULL,
  "asset_code" TEXT NOT NULL,
  "token_standard" TEXT NOT NULL DEFAULT 'TRC20',
  "token_contract" TEXT NOT NULL,
  "blockchain_txid" TEXT NOT NULL,
  "from_address" TEXT NOT NULL,
  "to_address" TEXT NOT NULL,
  "raw_amount" TEXT NOT NULL,
  "amount" DECIMAL(20, 8) NOT NULL,
  "block_number" BIGINT NOT NULL,
  "block_timestamp" TIMESTAMP(3),
  "confirmations" INTEGER NOT NULL DEFAULT 0,
  "status" "unattributed_onchain_status" NOT NULL DEFAULT 'OPEN',
  "reason" TEXT NOT NULL,
  "provider" TEXT,
  "metadata" JSONB,
  "assigned_deposit_id" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "unattributed_onchain_transfers_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "unattributed_onchain_amount_positive" CHECK ("amount" > 0)
);
CREATE UNIQUE INDEX IF NOT EXISTS "unattributed_onchain_txid_uidx"
  ON "unattributed_onchain_transfers" ("chain_network", "blockchain_txid", "token_contract");
CREATE INDEX IF NOT EXISTS "unattributed_onchain_status_created_at_idx"
  ON "unattributed_onchain_transfers" ("status", "created_at");
CREATE INDEX IF NOT EXISTS "unattributed_onchain_to_address_idx"
  ON "unattributed_onchain_transfers" ("to_address");

-- Deduplicate active deposit addresses: keep oldest ACTIVE per address.
WITH ranked AS (
  SELECT
    id,
    address,
    ROW_NUMBER() OVER (PARTITION BY address ORDER BY created_at ASC, id ASC) AS rn
  FROM "user_deposit_addresses"
)
UPDATE "user_deposit_addresses" uda
SET
  "status" = 'ROTATED',
  "rotated_at" = COALESCE("rotated_at", CURRENT_TIMESTAMP)
FROM ranked
WHERE uda.id = ranked.id
  AND ranked.rn > 1;

-- If the same address is ACTIVE on multiple rows after the above, force extras.
WITH active_ranked AS (
  SELECT
    id,
    address,
    ROW_NUMBER() OVER (
      PARTITION BY address
      ORDER BY CASE WHEN status = 'ACTIVE' THEN 0 ELSE 1 END, created_at ASC, id ASC
    ) AS rn
  FROM "user_deposit_addresses"
)
UPDATE "user_deposit_addresses" uda
SET
  "status" = 'ROTATED',
  "rotated_at" = COALESCE("rotated_at", CURRENT_TIMESTAMP)
FROM active_ranked
WHERE uda.id = active_ranked.id
  AND active_ranked.rn > 1;

DROP INDEX IF EXISTS "user_deposit_addresses_address_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "user_deposit_addresses_address_uidx"
  ON "user_deposit_addresses" ("address");

CREATE UNIQUE INDEX IF NOT EXISTS "user_deposit_addresses_one_active_per_address"
  ON "user_deposit_addresses" ("address")
  WHERE "status" = 'ACTIVE';

-- One ACTIVE assignment per wallet
WITH wallet_active AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY wallet_id
      ORDER BY created_at DESC, id DESC
    ) AS rn
  FROM "user_deposit_addresses"
  WHERE "status" = 'ACTIVE'
)
UPDATE "user_deposit_addresses" uda
SET
  "status" = 'ROTATED',
  "rotated_at" = COALESCE("rotated_at", CURRENT_TIMESTAMP)
FROM wallet_active
WHERE uda.id = wallet_active.id
  AND wallet_active.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS "user_deposit_addresses_one_active_per_wallet"
  ON "user_deposit_addresses" ("wallet_id")
  WHERE "status" = 'ACTIVE';

-- Idempotency keys: keep first row, null later duplicates so unique can apply.
WITH wt_dupes AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY idempotency_key
      ORDER BY created_at ASC, id ASC
    ) AS rn
  FROM "wallet_transactions"
  WHERE "idempotency_key" IS NOT NULL
)
UPDATE "wallet_transactions" wt
SET "idempotency_key" = NULL
FROM wt_dupes
WHERE wt.id = wt_dupes.id
  AND wt_dupes.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS "wallet_transactions_idempotency_key_uidx"
  ON "wallet_transactions" ("idempotency_key");

WITH lp_dupes AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY idempotency_key
      ORDER BY created_at ASC, id ASC
    ) AS rn
  FROM "ledger_postings"
  WHERE "idempotency_key" IS NOT NULL
)
UPDATE "ledger_postings" lp
SET "idempotency_key" = NULL
FROM lp_dupes
WHERE lp.id = lp_dupes.id
  AND lp_dupes.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS "ledger_postings_idempotency_key_uidx"
  ON "ledger_postings" ("idempotency_key");
