-- Canonical TRON tx hashes, case-insensitive uniqueness, address immutability,
-- atomic pool claim support, lease fencing, ownership source identity.

-- 1) Lease fencing token
ALTER TABLE "crypto_worker_leases"
  ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;

-- 2) Ownership economic-event identity
ALTER TABLE "ownership_ledger"
  ADD COLUMN IF NOT EXISTS "source_entity_type" TEXT,
  ADD COLUMN IF NOT EXISTS "source_entity_id" TEXT;

UPDATE "ownership_ledger"
SET
  "source_entity_type" = COALESCE("source_entity_type", CASE
    WHEN "event_type"::text IN ('SECONDARY_BUY', 'SECONDARY_SELL') AND "trade_id" IS NOT NULL THEN 'trade'
    WHEN "event_type"::text = 'PRIMARY_BUY' AND "wallet_transaction_id" IS NOT NULL THEN 'wallet_transaction'
    ELSE NULL
  END),
  "source_entity_id" = COALESCE("source_entity_id", CASE
    WHEN "event_type"::text IN ('SECONDARY_BUY', 'SECONDARY_SELL') AND "trade_id" IS NOT NULL THEN "trade_id"::text
    WHEN "event_type"::text = 'PRIMARY_BUY' AND "wallet_transaction_id" IS NOT NULL THEN "wallet_transaction_id"::text
    ELSE NULL
  END)
WHERE "source_entity_id" IS NULL;

CREATE INDEX IF NOT EXISTS "ownership_ledger_source_entity_idx"
  ON "ownership_ledger" ("source_entity_type", "source_entity_id");

-- Drop leftover duplicate source rows (keep oldest) so UNIQUE can apply.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "event_type", "source_entity_type", "source_entity_id"
      ORDER BY "created_at" ASC, id ASC
    ) AS rn
  FROM "ownership_ledger"
  WHERE "source_entity_id" IS NOT NULL
)
DELETE FROM "ownership_ledger" ol
USING ranked
WHERE ol.id = ranked.id
  AND ranked.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS "ownership_ledger_event_source_uidx"
  ON "ownership_ledger" ("event_type", "source_entity_type", "source_entity_id")
  WHERE "source_entity_id" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "ownership_ledger_trade_event_uidx"
  ON "ownership_ledger" ("event_type", "trade_id")
  WHERE "trade_id" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "ownership_ledger_primary_wallet_tx_uidx"
  ON "ownership_ledger" ("wallet_transaction_id")
  WHERE "event_type" = 'PRIMARY_BUY' AND "wallet_transaction_id" IS NOT NULL;

-- 3) Canonicalize deposit tx hashes (trim + lowercase hex; strip 0x)
UPDATE "deposits"
SET "blockchain_txid" = lower(regexp_replace(btrim("blockchain_txid"), '^0x', '', 'i'))
WHERE "blockchain_txid" IS NOT NULL
  AND "blockchain_txid" <> lower(regexp_replace(btrim("blockchain_txid"), '^0x', '', 'i'));

UPDATE "unattributed_onchain_transfers"
SET "blockchain_txid" = lower(regexp_replace(btrim("blockchain_txid"), '^0x', '', 'i'))
WHERE "blockchain_txid" IS NOT NULL
  AND "blockchain_txid" <> lower(regexp_replace(btrim("blockchain_txid"), '^0x', '', 'i'));

UPDATE "deposit_ingestion_logs"
SET "blockchain_txid" = lower(regexp_replace(btrim("blockchain_txid"), '^0x', '', 'i'))
WHERE "blockchain_txid" IS NOT NULL
  AND "blockchain_txid" <> lower(regexp_replace(btrim("blockchain_txid"), '^0x', '', 'i'));

UPDATE "withdrawals"
SET "blockchain_txid" = lower(regexp_replace(btrim("blockchain_txid"), '^0x', '', 'i'))
WHERE "blockchain_txid" IS NOT NULL
  AND "blockchain_txid" <> lower(regexp_replace(btrim("blockchain_txid"), '^0x', '', 'i'));

UPDATE "withdrawals"
SET "provider_tx_hash" = lower(regexp_replace(btrim("provider_tx_hash"), '^0x', '', 'i'))
WHERE "provider_tx_hash" IS NOT NULL
  AND btrim("provider_tx_hash") <> ''
  AND "provider_tx_hash" <> lower(regexp_replace(btrim("provider_tx_hash"), '^0x', '', 'i'));

UPDATE "withdrawals"
SET "provider_tx_hash" = NULL
WHERE "provider_tx_hash" IS NOT NULL AND btrim("provider_tx_hash") = '';

-- 4) Drop case-variant duplicate deposits (keep CREDITED, then oldest)
WITH ranked AS (
  SELECT
    id,
    "wallet_tx_id",
    ROW_NUMBER() OVER (
      PARTITION BY lower("blockchain_txid")
      ORDER BY
        CASE WHEN "status"::text = 'CREDITED' THEN 0 ELSE 1 END,
        "created_at" ASC,
        id ASC
    ) AS rn
  FROM "deposits"
  WHERE "blockchain_txid" IS NOT NULL
)
UPDATE "deposits" d
SET "blockchain_txid" = NULL
FROM ranked
WHERE d.id = ranked.id
  AND ranked.rn > 1;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY lower("blockchain_txid")
      ORDER BY "created_at" ASC, id ASC
    ) AS rn
  FROM "unattributed_onchain_transfers"
  WHERE "blockchain_txid" IS NOT NULL
)
DELETE FROM "unattributed_onchain_transfers" u
USING ranked
WHERE u.id = ranked.id
  AND ranked.rn > 1;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY lower("blockchain_txid")
      ORDER BY
        CASE WHEN "status"::text = 'COMPLETED' THEN 0 ELSE 1 END,
        "created_at" ASC,
        id ASC
    ) AS rn
  FROM "withdrawals"
  WHERE "blockchain_txid" IS NOT NULL
)
UPDATE "withdrawals" w
SET "blockchain_txid" = NULL
FROM ranked
WHERE w.id = ranked.id
  AND ranked.rn > 1;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY lower("provider_tx_hash")
      ORDER BY
        CASE WHEN "status"::text = 'COMPLETED' THEN 0 ELSE 1 END,
        "created_at" ASC,
        id ASC
    ) AS rn
  FROM "withdrawals"
  WHERE "provider_tx_hash" IS NOT NULL
    AND btrim("provider_tx_hash") <> ''
)
UPDATE "withdrawals" w
SET "provider_tx_hash" = NULL
FROM ranked
WHERE w.id = ranked.id
  AND ranked.rn > 1;

-- 5) Case-insensitive unique indexes (canonical persisted values + functional unique)
CREATE UNIQUE INDEX IF NOT EXISTS "deposits_canonical_chain_txid_token_uidx"
  ON "deposits" (
    "chain_network",
    (lower("blockchain_txid")),
    (lower(COALESCE("token_contract", '')))
  )
  WHERE "blockchain_txid" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "unattributed_canonical_txid_uidx"
  ON "unattributed_onchain_transfers" (
    "chain_network",
    (lower("blockchain_txid")),
    (lower("token_contract"))
  );

CREATE UNIQUE INDEX IF NOT EXISTS "withdrawals_canonical_txid_uidx"
  ON "withdrawals" ((lower("blockchain_txid")))
  WHERE "blockchain_txid" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "withdrawals_canonical_provider_tx_hash_uidx"
  ON "withdrawals" ((lower("provider_tx_hash")))
  WHERE "provider_tx_hash" IS NOT NULL AND btrim("provider_tx_hash") <> '';

CREATE UNIQUE INDEX IF NOT EXISTS "withdrawals_provider_tx_hash_key"
  ON "withdrawals" ("provider_tx_hash");

-- 6) Never re-point a deposit address to another wallet / rewrite the address
CREATE OR REPLACE FUNCTION forbid_user_deposit_address_reassign()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW."wallet_id" IS DISTINCT FROM OLD."wallet_id" THEN
    RAISE EXCEPTION 'user_deposit_addresses.wallet_id is immutable';
  END IF;
  IF NEW."address" IS DISTINCT FROM OLD."address" THEN
    RAISE EXCEPTION 'user_deposit_addresses.address is immutable';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_forbid_user_deposit_address_reassign ON "user_deposit_addresses";
CREATE TRIGGER trg_forbid_user_deposit_address_reassign
  BEFORE UPDATE ON "user_deposit_addresses"
  FOR EACH ROW
  EXECUTE PROCEDURE forbid_user_deposit_address_reassign();

-- 7) Pool assignment is sticky: never retarget or return an assigned address to AVAILABLE
CREATE OR REPLACE FUNCTION forbid_deposit_address_pool_reassign()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW."address" IS DISTINCT FROM OLD."address" THEN
    RAISE EXCEPTION 'deposit_address_pool.address is immutable';
  END IF;
  IF OLD."assigned_wallet_id" IS NOT NULL
     AND NEW."assigned_wallet_id" IS DISTINCT FROM OLD."assigned_wallet_id" THEN
    RAISE EXCEPTION 'deposit_address_pool.assigned_wallet_id is immutable once set';
  END IF;
  IF OLD."assigned_user_id" IS NOT NULL
     AND NEW."assigned_user_id" IS DISTINCT FROM OLD."assigned_user_id" THEN
    RAISE EXCEPTION 'deposit_address_pool.assigned_user_id is immutable once set';
  END IF;
  IF OLD."assigned_wallet_id" IS NOT NULL AND NEW."status" = 'AVAILABLE' THEN
    RAISE EXCEPTION 'assigned deposit_address_pool rows cannot return to AVAILABLE';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_forbid_deposit_address_pool_reassign ON "deposit_address_pool";
CREATE TRIGGER trg_forbid_deposit_address_pool_reassign
  BEFORE UPDATE ON "deposit_address_pool"
  FOR EACH ROW
  EXECUTE PROCEDURE forbid_deposit_address_pool_reassign();
