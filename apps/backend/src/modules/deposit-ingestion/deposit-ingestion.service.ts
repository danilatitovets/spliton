import { Injectable, Logger } from '@nestjs/common';
import {
  ActorRole,
  DepositIngestionSource,
  DepositStatus,
  DepositWatcherStatus,
  LedgerOperationType,
  Prisma,
  UnattributedOnchainStatus,
  WalletTxDirection,
  WalletTxStatus,
  WalletTxType,
} from '@prisma/client';
import { Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletLedgerService } from '../admin/common/wallet-ledger.service';
import { FeatureFlagsService } from '../../common/platform/feature-flags/feature-flags.service';
import { ComplianceRiskScoringService } from '../compliance/compliance-risk-scoring.service';
import { NotificationEventsService } from '../notifications/notification-events.service';
import { ReferralEventsService } from '../referrals/referral-events.service';
import { OperationalLimitsService } from '../treasury/operational-limits.service';
import { CryptoWorkerLeaseService, type CryptoWorkerLeaseHandle } from './crypto-worker-lease.service';
import {
  DEPOSIT_BLOCKCHAIN_PROVIDER,
  type DepositBlockchainProvider,
  type VerifiedTrc20Transfer,
} from './providers/deposit-blockchain-provider.interface';
import { serializeVerified } from './providers/tron-trc20.mapper';
import { resolveTronRuntimeConfig, sameTronAddress } from './tron/tron-network.config';
import { confirmationsFromBlocks, parseTokenRawAmount, tokenRawToDecimal } from './tron/tron-amount';
import {
  InvalidTronTxHashError,
  normalizeTronTxHash,
  tryNormalizeTronTxHash,
  depositCreditIdempotencyKey,
} from './tron/tron-tx-hash';

export type IngestionTickResult = {
  scanned: number;
  credited: number;
  pending: number;
  ignored: number;
  unattributed: number;
  skippedLock: boolean;
};

@Injectable()
export class DepositIngestionService {
  private readonly logger = new Logger(DepositIngestionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: WalletLedgerService,
    @Inject(DEPOSIT_BLOCKCHAIN_PROVIDER)
    private readonly provider: DepositBlockchainProvider,
    private readonly riskScoring: ComplianceRiskScoringService,
    private readonly notificationEvents: NotificationEventsService,
    private readonly referralEvents: ReferralEventsService,
    private readonly flags: FeatureFlagsService,
    private readonly leases: CryptoWorkerLeaseService,
    private readonly limits: OperationalLimitsService,
  ) {}

  async cryptoHealth() {
    const provider = await this.provider.health();
    const watcher = await this.prisma.depositWatcherState.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
    const pending = await this.prisma.deposit.count({
      where: {
        status: {
          in: [
            DepositStatus.DETECTED,
            DepositStatus.PENDING_CONFIRMATIONS,
            DepositStatus.CONFIRMING,
            DepositStatus.PENDING,
          ],
        },
      },
    });
    const failed = await this.prisma.deposit.count({
      where: { status: { in: [DepositStatus.FAILED, DepositStatus.REJECTED] } },
    });
    const unknown = await this.prisma.unattributedOnchainTransfer.count({
      where: { status: UnattributedOnchainStatus.OPEN },
    });
    const addressesWatched = watcher?.addressesWatched ?? 0;
    const lastRunAt = watcher?.lastRunAt;
    const lagMs = lastRunAt ? Date.now() - lastRunAt.getTime() : null;
    return {
      provider,
      workerEnabled: process.env.DEPOSIT_INGESTION_ENABLED === 'true',
      watcherStatus: watcher?.status ?? null,
      lastRunAt: lastRunAt?.toISOString() ?? null,
      lastScannedBlock: watcher?.lastScannedBlock?.toString() ?? null,
      lastError: watcher?.lastError ?? null,
      addressesWatched,
      pendingDeposits: pending,
      failedDeposits: failed,
      unknownAddresses: unknown,
      ingestionLagMs: lagMs,
      killSwitchCredit: process.env.KILL_SWITCH_DISABLE_DEPOSIT_CREDIT === 'true',
      depositsEnabled: this.flags.isEffectivelyEnabled('enableDeposits'),
    };
  }

  async providerHealth() {
    return this.provider.health();
  }

  async tick(): Promise<IngestionTickResult> {
    const empty: IngestionTickResult = {
      scanned: 0,
      credited: 0,
      pending: 0,
      ignored: 0,
      unattributed: 0,
      skippedLock: false,
    };
    const leaseTtlMs = Math.max(
      200,
      Number.parseInt(process.env.DEPOSIT_LEASE_TTL_MS ?? '45000', 10) || 45_000,
    );
    const lease = await this.leases.tryAcquire(leaseTtlMs);
    if (!lease) {
      this.logEvent('deposit.scan.started', { skippedLock: true });
      return { ...empty, skippedLock: true };
    }

    this.logEvent('deposit.scan.started', { holder: lease.holder, version: lease.version });
    let lostLease = false;
    const heartbeat = setInterval(() => {
      void this.leases.heartbeat(lease, leaseTtlMs).then((ok) => {
        if (!ok) lostLease = true;
      });
    }, Math.max(50, Math.floor(leaseTtlMs / 3)));
    try {
      const result = await this.runScan(lease, leaseTtlMs, () => lostLease);
      this.logEvent('deposit.scan.completed', result);
      return result;
    } finally {
      clearInterval(heartbeat);
      await this.leases.release(lease);
    }
  }

  async recoverByTxHash(
    txHash: string,
    source: DepositIngestionSource = DepositIngestionSource.RECOVERY,
  ): Promise<{ depositId: string | null; status: string; reason?: string }> {
    let canonical: string;
    try {
      canonical = normalizeTronTxHash(txHash);
    } catch (err) {
      if (err instanceof InvalidTronTxHashError) {
        return { depositId: null, status: 'invalid_hash', reason: 'Invalid TRON txHash' };
      }
      throw err;
    }
    const transfers = await this.provider.getVerifiedTransfers(canonical);
    const cfg = resolveTronRuntimeConfig();
    const eligible = transfers.filter(
      (item) =>
        item.success &&
        item.chain === 'TRON' &&
        item.tokenStandard === 'TRC20' &&
        sameTronAddress(item.tokenContract, cfg.usdtContract),
    );
    if (eligible.length === 0) {
      return { depositId: null, status: 'not_found', reason: 'Transaction not found' };
    }

    const owned: VerifiedTrc20Transfer[] = [];
    for (const item of eligible) {
      if (await this.attributeWallet(item.toAddress)) owned.push(item);
    }
    if (owned.length > 1) {
      await this.log(null, canonical, 'deposit.ambiguous_multi_leg', {
        destinations: owned.map((item) => item.toAddress),
      });
      this.logEvent('deposit.failed', { txHash: canonical, reason: 'ambiguous_multi_leg' });
      return {
        depositId: null,
        status: 'ambiguous',
        reason: 'Multiple SPLITON destinations in one transaction',
      };
    }
    if (owned.length === 0) {
      if (eligible.length !== 1) {
        await this.log(null, canonical, 'deposit.ambiguous_multi_leg', {
          destinations: eligible.map((item) => item.toAddress),
        });
        return {
          depositId: null,
          status: 'ambiguous',
          reason: 'Multiple transfer events and no unique SPLITON destination',
        };
      }
    }
    const chosen = owned[0] ?? eligible[0]!;
    const result = await this.processTransfer(chosen, source);
    const existing = await this.prisma.deposit.findFirst({
      where: { blockchainTxid: canonical },
    });
    return {
      depositId: existing?.id ?? null,
      status: result,
      reason: existing?.ignoreReason ?? undefined,
    };
  }

  async recheckDeposit(depositId: string): Promise<DepositStatus> {
    const row = await this.prisma.deposit.findUnique({
      where: { id: depositId },
    });
    if (!row?.blockchainTxid) {
      return row?.status ?? DepositStatus.FAILED;
    }
    const verified = await this.provider.getVerifiedTransfers(row.blockchainTxid);
    const match =
      verified.find((item) => sameTronAddress(item.toAddress, row.toAddress ?? '')) ??
      (verified.length === 1 ? verified[0] : null);
    if (!match) return row.status;
    await this.processTransfer(match, row.ingestionSource);
    const updated = await this.prisma.deposit.findUniqueOrThrow({
      where: { id: depositId },
    });
    return updated.status;
  }

  private async runScan(
    lease: CryptoWorkerLeaseHandle,
    leaseTtlMs: number,
    leaseLost?: () => boolean,
  ): Promise<IngestionTickResult> {
    const watcher = await this.getWatcher();
    await this.markWatcher(watcher.id, watcher.lastScannedBlock, DepositWatcherStatus.RUNNING);

    const addresses = await this.listWatchedAddresses();
    let scanned = 0;
    let credited = 0;
    let pending = 0;
    let ignored = 0;
    let unattributed = 0;
    let maxBlock = watcher.lastScannedBlock;

    for (const address of addresses) {
      if (leaseLost?.()) {
        this.logEvent('deposit.scan.completed', { lostLease: true });
        break;
      }
      const held = await this.leases.heartbeat(lease, leaseTtlMs);
      if (!held) {
        this.logEvent('deposit.scan.completed', { lostLease: true });
        break;
      }
      const cursor = await this.prisma.depositAddressScanCursor.upsert({
        where: { address },
        create: { address },
        update: {},
      });
      try {
        const page = await this.provider.fetchTrc20Incoming(address, {
          watermarkTimestamp: cursor.watermarkTimestamp,
          fingerprint: null,
        });
        let maxTs = cursor.watermarkTimestamp;
        let maxSeenBlock = cursor.lastSeenBlock;
        for (const transfer of page.items) {
          scanned += 1;
          if (transfer.blockNumber > maxBlock) maxBlock = transfer.blockNumber;
          if (transfer.blockTimestampMs > maxTs) maxTs = transfer.blockTimestampMs;
          if (transfer.blockNumber > maxSeenBlock) maxSeenBlock = transfer.blockNumber;
          const result = await this.processTransfer(
            transfer,
            DepositIngestionSource.AUTO,
          );
          if (result === 'credited') credited += 1;
          else if (result === 'pending') pending += 1;
          else if (result === 'unattributed') unattributed += 1;
          else ignored += 1;
        }
        await this.prisma.depositAddressScanCursor.update({
          where: { address },
          data: {
            watermarkTimestamp: maxTs,
            lastSeenBlock: maxSeenBlock,
            lastFingerprint: page.fingerprint,
            lastScannedAt: new Date(),
            lastError: null,
          },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logEvent('deposit.provider_error', { address, message });
        await this.prisma.depositAddressScanCursor.update({
          where: { address },
          data: { lastError: message, lastScannedAt: new Date() },
        });
        await this.markWatcher(
          watcher.id,
          maxBlock,
          DepositWatcherStatus.ERROR,
          message,
        );
        throw err;
      }
    }

    await this.refreshPendingConfirmations();

    await this.markWatcher(watcher.id, maxBlock, DepositWatcherStatus.IDLE, undefined, {
      scanned,
      credited,
      pending,
      ignored,
      unattributed,
      addressesWatched: addresses.length,
    });

    return {
      scanned,
      credited,
      pending,
      ignored,
      unattributed,
      skippedLock: false,
    };
  }

  async processTransfer(
    transfer: VerifiedTrc20Transfer,
    source: DepositIngestionSource,
  ): Promise<'credited' | 'pending' | 'ignored' | 'unattributed' | 'duplicate'> {
    const cfg = resolveTronRuntimeConfig();
    const canonical = tryNormalizeTronTxHash(transfer.txHash);
    if (!canonical) {
      await this.log(null, transfer.txHash, 'ignored.invalid_txhash', {
        transfer: serializeVerified(transfer),
      });
      return 'ignored';
    }
    transfer = { ...transfer, txHash: canonical };

    if (!transfer.success) {
      await this.log(null, transfer.txHash, 'deposit.failed', {
        transfer: serializeVerified(transfer),
      });
      this.logEvent('deposit.failed', { txHash: transfer.txHash });
      return 'ignored';
    }

    if (transfer.chain !== 'TRON' || transfer.tokenStandard !== 'TRC20') {
      await this.log(null, transfer.txHash, 'ignored.wrong_network_or_asset', {
        transfer: serializeVerified(transfer),
      });
      return 'ignored';
    }

    if (
      cfg.usdtContract &&
      !sameTronAddress(transfer.tokenContract, cfg.usdtContract)
    ) {
      await this.log(null, transfer.txHash, 'ignored.wrong_token', {
        transfer: serializeVerified(transfer),
      });
      return 'ignored';
    }

    if (transfer.decimals !== cfg.decimals) {
      await this.log(null, transfer.txHash, 'ignored.wrong_decimals', {
        transfer: serializeVerified(transfer),
      });
      return 'ignored';
    }

    let raw: bigint;
    let amount: Prisma.Decimal;
    try {
      raw = parseTokenRawAmount(transfer.rawAmount);
      amount = tokenRawToDecimal(raw, transfer.decimals);
    } catch {
      await this.log(null, transfer.txHash, 'ignored.malformed_amount', {
        transfer: serializeVerified(transfer),
      });
      return 'ignored';
    }
    if (amount.lessThanOrEqualTo(0)) {
      await this.log(null, transfer.txHash, 'ignored.zero_amount', {
        transfer: serializeVerified(transfer),
      });
      return 'ignored';
    }

    const ownedDestCount = await this.countOwnedUsdtDestinations(
      canonical,
      cfg.usdtContract,
    );
    if (ownedDestCount > 1) {
      await this.log(null, transfer.txHash, 'deposit.ambiguous_multi_leg', {
        toAddress: transfer.toAddress,
      });
      this.logEvent('deposit.failed', {
        txHash: transfer.txHash,
        reason: 'ambiguous_multi_leg',
      });
      return 'ignored';
    }

    const wallet = await this.attributeWallet(transfer.toAddress);
    if (!wallet) {
      await this.recordUnattributed(transfer, amount);
      this.logEvent('deposit.unknown_address', {
        txHash: transfer.txHash,
        toAddress: transfer.toAddress,
      });
      return 'unattributed';
    }

    const existing = await this.prisma.deposit.findFirst({
      where: { blockchainTxid: transfer.txHash },
      include: { walletTx: true },
    });
    if (existing?.status === DepositStatus.CREDITED) {
      await this.log(existing.id, transfer.txHash, 'deposit.duplicate', {});
      this.logEvent('deposit.duplicate', { txHash: transfer.txHash });
      return 'duplicate';
    }

    const nowBlock = await this.provider.getNowBlock();
    const confirmations = confirmationsFromBlocks(nowBlock, transfer.blockNumber);
    const requiredConfirmations = cfg.confirmationsRequired;
    const confirmed = confirmations >= requiredConfirmations;
    const nextStatus = confirmed
      ? DepositStatus.CONFIRMED
      : DepositStatus.PENDING_CONFIRMATIONS;
    const suspicious = amount.greaterThanOrEqualTo(new Prisma.Decimal(1000));
    const blockTs =
      transfer.blockTimestampMs > 0n
        ? new Date(Number(transfer.blockTimestampMs))
        : null;

    let depositId: string;
    try {
      if (existing) {
        const updated = await this.prisma.deposit.update({
          where: { id: existing.id },
          data: {
            confirmations,
            providerBlockNumber: transfer.blockNumber,
            tokenContract: transfer.tokenContract,
            rawAmount: transfer.rawAmount,
            amount,
            blockTimestamp: blockTs,
            executionStatus: transfer.success ? 'SUCCESS' : 'FAILED',
            status: nextStatus,
            confirmedAt: confirmed ? new Date() : existing.confirmedAt,
          },
        });
        depositId = updated.id;
      } else {
        const created = await this.prisma.$transaction(async (tx) => {
          const walletTx = await this.ledger.createWalletTransaction(tx, {
            walletId: wallet.id,
            txType: WalletTxType.DEPOSIT,
            direction: WalletTxDirection.IN,
            amount,
            feeAmount: new Prisma.Decimal(0),
            netAmount: amount,
            currency: 'USDT',
            status: WalletTxStatus.PENDING,
            referenceType: 'deposit',
            referenceId: null,
            ctx: {
              operationType: LedgerOperationType.DEPOSIT_SETTLE,
              sourceEntityType: 'deposit_ingestion',
              sourceEntityId: wallet.id,
              actorRole: ActorRole.SYSTEM,
              currency: 'USDT',
              idempotencyKey: `deposit-ingest-tx:${cfg.chainNetwork}:${transfer.txHash}`,
            },
          });
          const row = await tx.deposit.create({
            data: {
              walletTxId: walletTx.id,
              blockchainTxid: transfer.txHash,
              fromAddress: transfer.fromAddress,
              toAddress: transfer.toAddress,
              confirmations,
              requiredConfirmations,
              status: nextStatus,
              ingestionSource: source,
              suspiciousFlag: suspicious,
              providerBlockNumber: transfer.blockNumber,
              tokenContract: transfer.tokenContract,
              chain: transfer.chain,
              chainNetwork: transfer.chainNetwork,
              assetCode: transfer.assetCode,
              tokenStandard: transfer.tokenStandard,
              rawAmount: transfer.rawAmount,
              amount,
              blockTimestamp: blockTs,
              detectedAt: new Date(),
              confirmedAt: confirmed ? new Date() : null,
              provider: this.provider.mode,
              executionStatus: 'SUCCESS',
              metadata: serializeVerified(transfer),
            },
          });
          await tx.walletTransaction.update({
            where: { id: walletTx.id },
            data: { referenceId: row.id },
          });
          return row;
        });
        depositId = created.id;
        this.logEvent('deposit.detected', { txHash: transfer.txHash, depositId });
      }
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        await this.log(null, transfer.txHash, 'deposit.duplicate', {
          race: true,
        });
        this.logEvent('deposit.duplicate', { txHash: transfer.txHash, race: true });
        const raced = await this.prisma.deposit.findFirst({
          where: { blockchainTxid: transfer.txHash },
        });
        if (!raced) return 'duplicate';
        depositId = raced.id;
      } else {
        throw err;
      }
    }

    await this.log(depositId, transfer.txHash, confirmed ? 'deposit.confirmed' : 'deposit.pending', {
      confirmations,
      requiredConfirmations,
    });
    this.logEvent(confirmed ? 'deposit.confirmed' : 'deposit.pending', {
      txHash: transfer.txHash,
      confirmations,
    });

    if (!confirmed) return 'pending';
    return this.creditIfAllowed(depositId, transfer.txHash);
  }

  private async creditIfAllowed(
    depositId: string,
    txHash: string,
  ): Promise<'credited' | 'pending' | 'ignored'> {
    if (!this.canCredit()) {
      await this.log(depositId, txHash, 'deposit.credit_blocked', {
        killSwitch: true,
      });
      return 'pending';
    }

    const limits = await this.limits.getLimits();
    const creditedPayload = await this.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM deposits WHERE id = ${depositId}::uuid FOR UPDATE
      `;
      if (!rows[0]) return null;
      const row = await tx.deposit.findUniqueOrThrow({
        where: { id: depositId },
        include: { walletTx: { include: { wallet: true } } },
      });
      if (row.status === DepositStatus.CREDITED) return null;
      if (
        row.status !== DepositStatus.CONFIRMED &&
        row.status !== DepositStatus.PENDING_CONFIRMATIONS &&
        row.status !== DepositStatus.DETECTED &&
        row.status !== DepositStatus.PENDING &&
        row.status !== DepositStatus.CONFIRMING
      ) {
        return null;
      }
      if (row.confirmations < row.requiredConfirmations) return null;

      const amount = row.amount ?? row.walletTx.netAmount;
      const maxAuto = new Prisma.Decimal(limits.maxAutoCreditDepositUsdt);
      if (amount.greaterThan(maxAuto)) {
        await tx.deposit.update({
          where: { id: row.id },
          data: { status: DepositStatus.MANUAL_REVIEW },
        });
        return { manualReview: true as const, row };
      }

      await this.ledger.creditAvailable(tx, row.walletTx.walletId, amount, {
        operationType: LedgerOperationType.DEPOSIT_SETTLE,
        sourceEntityType: 'deposit',
        sourceEntityId: row.id,
        actorRole: ActorRole.SYSTEM,
        currency: row.walletTx.currency,
        idempotencyKey: depositCreditIdempotencyKey(
          row.chainNetwork,
          row.blockchainTxid ?? txHash,
        ),
        walletTransactionId: row.walletTxId,
      });
      await tx.walletTransaction.update({
        where: { id: row.walletTxId },
        data: { status: WalletTxStatus.COMPLETED, settledAt: new Date() },
      });
      await tx.deposit.update({
        where: { id: row.id },
        data: {
          status: DepositStatus.CREDITED,
          creditedAt: new Date(),
          receivedAt: new Date(),
          confirmedAt: row.confirmedAt ?? new Date(),
        },
      });
      await tx.auditLog.create({
        data: {
          actorRole: ActorRole.SYSTEM,
          entityType: 'deposit',
          entityId: row.id,
          action: 'deposit.auto_credited',
          afterJsonb: { source: 'auto', ledgerMutation: true },
        },
      });
      return {
        manualReview: false as const,
        userId: row.walletTx.wallet.userId,
        depositId: row.id,
        amount,
        fromAddress: row.fromAddress,
      };
    });

    if (!creditedPayload) return 'pending';
    if ('manualReview' in creditedPayload && creditedPayload.manualReview) {
      await this.log(depositId, txHash, 'deposit.manual_review', {});
      return 'pending';
    }
    if (!('userId' in creditedPayload) || !creditedPayload.userId) {
      return 'pending';
    }
    void this.riskScoring.evaluateDeposit({
      userId: creditedPayload.userId,
      depositId: creditedPayload.depositId,
      amount: creditedPayload.amount,
      fromAddress: creditedPayload.fromAddress,
    });
    void this.notificationEvents.depositCredited({
      userId: creditedPayload.userId,
      depositId: creditedPayload.depositId,
      amount: creditedPayload.amount.toString(),
    });
    void this.referralEvents.onFirstDeposit({
      userId: creditedPayload.userId,
      depositId: creditedPayload.depositId,
      amount: creditedPayload.amount,
    });
    await this.log(depositId, txHash, 'deposit.credited', {});
    this.logEvent('deposit.credited', { txHash, depositId });
    return 'credited';
  }

  private canCredit(): boolean {
    if (!this.flags.isEnabled('enableDeposits')) return false;
    if (this.flags.isEnabled('disableDepositsImmediately')) return false;
    if (this.flags.isEnabled('disableDepositsCredit')) return false;
    return true;
  }

  private async countOwnedUsdtDestinations(
    canonicalTxHash: string,
    usdtContract: string,
  ): Promise<number> {
    const siblings = await this.provider.getVerifiedTransfers(canonicalTxHash);
    const dests: string[] = [];
    for (const item of siblings) {
      if (!item.success) continue;
      if (usdtContract && !sameTronAddress(item.tokenContract, usdtContract)) continue;
      if (!(await this.attributeWallet(item.toAddress))) continue;
      if (!dests.some((d) => sameTronAddress(d, item.toAddress))) {
        dests.push(item.toAddress);
      }
    }
    return dests.length;
  }

  private async attributeWallet(toAddress: string) {
    const assigned = await this.prisma.userDepositAddress.findFirst({
      where: { address: toAddress },
      include: { wallet: true },
      orderBy: { createdAt: 'asc' },
    });
    if (assigned?.wallet) return assigned.wallet;

    const wallets = await this.prisma.wallet.findMany({
      where: { address: toAddress, assetCode: 'USDT' },
    });
    if (wallets.length === 1) return wallets[0]!;
    return null;
  }

  private async recordUnattributed(
    transfer: VerifiedTrc20Transfer,
    amount: Prisma.Decimal,
  ) {
    await this.prisma.unattributedOnchainTransfer.upsert({
      where: {
        chainNetwork_blockchainTxid_tokenContract: {
          chainNetwork: transfer.chainNetwork,
          blockchainTxid: transfer.txHash,
          tokenContract: transfer.tokenContract,
        },
      },
      create: {
        chain: transfer.chain,
        chainNetwork: transfer.chainNetwork,
        assetCode: transfer.assetCode,
        tokenStandard: transfer.tokenStandard,
        tokenContract: transfer.tokenContract,
        blockchainTxid: transfer.txHash,
        fromAddress: transfer.fromAddress,
        toAddress: transfer.toAddress,
        rawAmount: transfer.rawAmount,
        amount,
        blockNumber: transfer.blockNumber,
        blockTimestamp:
          transfer.blockTimestampMs > 0n
            ? new Date(Number(transfer.blockTimestampMs))
            : null,
        confirmations: transfer.confirmations,
        status: UnattributedOnchainStatus.OPEN,
        reason: 'unknown_address',
        provider: this.provider.mode,
        metadata: serializeVerified(transfer),
      },
      update: {
        confirmations: transfer.confirmations,
        metadata: serializeVerified(transfer),
      },
    });
    await this.log(null, transfer.txHash, 'ignored.unknown_address', {
      transfer: serializeVerified(transfer),
    });
  }

  private async listWatchedAddresses(): Promise<string[]> {
    const rows = await this.prisma.userDepositAddress.findMany({
      select: { address: true },
    });
    const fromWallets = await this.prisma.wallet.findMany({
      where: { address: { not: null }, assetCode: 'USDT' },
      select: { address: true },
    });
    const set = new Set<string>();
    for (const row of rows) {
      if (row.address.startsWith('T_DEV_')) continue;
      set.add(row.address);
    }
    for (const row of fromWallets) {
      if (row.address && !row.address.startsWith('T_DEV_')) set.add(row.address);
    }
    return [...set];
  }

  private async refreshPendingConfirmations() {
    const pending = await this.prisma.deposit.findMany({
      where: {
        status: {
          in: [
            DepositStatus.PENDING_CONFIRMATIONS,
            DepositStatus.DETECTED,
            DepositStatus.CONFIRMING,
            DepositStatus.PENDING,
          ],
        },
        blockchainTxid: { not: null },
      },
      take: 200,
      orderBy: { createdAt: 'asc' },
    });
    for (const row of pending) {
      if (!row.blockchainTxid) continue;
      const verifiedList = await this.provider.getVerifiedTransfers(row.blockchainTxid);
      const verified =
        verifiedList.find((item) => sameTronAddress(item.toAddress, row.toAddress ?? '')) ??
        (verifiedList.length === 1 ? verifiedList[0] : undefined);
      if (!verified) continue;
      await this.processTransfer(verified, row.ingestionSource);
    }
  }

  private async getWatcher() {
    const cfg = resolveTronRuntimeConfig();
    return this.prisma.depositWatcherState.upsert({
      where: {
        network_assetCode: {
          network: cfg.chainNetwork,
          assetCode: 'USDT',
        },
      },
      create: {
        network: cfg.chainNetwork,
        assetCode: 'USDT',
        status: DepositWatcherStatus.IDLE,
      },
      update: {},
    });
  }

  private async markWatcher(
    id: string,
    lastScannedBlock: bigint,
    status: DepositWatcherStatus,
    error?: string,
    metrics?: Record<string, number>,
  ) {
    await this.prisma.depositWatcherState.update({
      where: { id },
      data: {
        status,
        lastRunAt: new Date(),
        lastScannedBlock,
        lastError: error ?? null,
        addressesWatched: metrics?.addressesWatched ?? undefined,
        lastMetrics: metrics ?? undefined,
      },
    });
  }

  private async log(
    depositId: string | null,
    blockchainTxid: string,
    action: string,
    payload: Prisma.InputJsonValue,
  ) {
    await this.prisma.depositIngestionLog.create({
      data: { depositId, blockchainTxid, action, payload },
    });
  }

  private logEvent(event: string, payload: Record<string, unknown>) {
    this.logger.log(JSON.stringify({ event, ...payload }));
  }

  private isUniqueViolation(err: unknown): boolean {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return true;
    }
    const code =
      typeof err === 'object' && err && 'code' in err
        ? String((err as { code: unknown }).code)
        : '';
    if (code === '23505') return true;
    const message = err instanceof Error ? err.message : String(err);
    return /duplicate key|unique constraint|_uidx|_txid_key/i.test(message);
  }
}
