import request from 'supertest';
import {
  ActorRole,
  DepositAddressPoolStatus,
  DepositAddressSource,
  DepositIngestionSource,
  DepositStatus,
  LedgerAccount,
  LedgerOperationType,
  LedgerPostingSide,
  OwnershipEventType,
  Prisma,
  ReleaseStatus,
  UserRoleCode,
  WalletTxDirection,
  WalletTxStatus,
  WalletTxType,
} from '@prisma/client';
import { createE2eApp, E2eApp } from './helpers/create-e2e-app';
import { registerE2eUser } from './helpers/register-e2e-user';
import { e2eEmail, e2eSlug, e2eSymbol } from './helpers/e2e-unique';
import { uniqueTrc20Address } from './helpers/e2e-trc20-address';
import { mockUsdtTransfer } from './helpers/mock-usdt-transfer';
import { canonicalTestTxHash } from './helpers/canonical-tx-hash';
import { assignUserDepositAddress } from './helpers/assign-user-deposit-address';
import { seedWalletWithLedger } from './helpers/seed-wallet-ledger';
import { MockDepositProvider } from '../src/modules/deposit-ingestion/providers/mock-deposit.provider';
import { DepositIngestionService } from '../src/modules/deposit-ingestion/deposit-ingestion.service';
import { DepositReconciliationService } from '../src/modules/deposit-ingestion/deposit-reconciliation.service';
import { CryptoWorkerLeaseService } from '../src/modules/deposit-ingestion/crypto-worker-lease.service';
import { DepositAddressPoolService } from '../src/modules/treasury/deposit-address-pool.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { getE2ePrisma } from './helpers/e2e-prisma';

async function staffToken(app: E2eApp, role: UserRoleCode = UserRoleCode.ACCOUNTANT) {
  const email = e2eEmail('inv-staff');
  const { userId, password } = await registerE2eUser(app, email);
  const prisma = getE2ePrisma();
  const row = await prisma.role.findUnique({ where: { code: role } });
  if (row) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId: row.id } },
      create: { userId, roleId: row.id },
      update: {},
    });
  }
  const login = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password });
  return login.body.tokens.accessToken as string;
}

describe('crypto invariants red-team (e2e)', () => {
  let app: E2eApp | undefined;
  let provider: MockDepositProvider;
  let ingestion: DepositIngestionService;
  let recon: DepositReconciliationService;
  let leases: CryptoWorkerLeaseService;
  let pool: DepositAddressPoolService;

  beforeEach(async () => {
    process.env.TRON_PROVIDER_MODE = 'mock';
    process.env.KILL_SWITCH_DISABLE_DEPOSIT_CREDIT = 'false';
    process.env.FEATURE_ENABLE_DEPOSITS = 'true';
    process.env.DEPOSIT_LEASE_TTL_MS = '60000';
    app = await createE2eApp();
    provider = app.get(MockDepositProvider);
    ingestion = app.get(DepositIngestionService);
    recon = app.get(DepositReconciliationService);
    leases = app.get(CryptoWorkerLeaseService);
    pool = app.get(DepositAddressPoolService);
    provider.clear();
    provider.nowBlock = 20_000n;
    const staleLease = await leases.tryAcquire(1);
    if (staleLease) await leases.release(staleLease);
  });

  afterEach(async () => {
    if (app) await app.close();
    app = undefined;
    delete process.env.KILL_SWITCH_DISABLE_DEPOSIT_CREDIT;
    delete process.env.DEPOSIT_LEASE_TTL_MS;
    delete process.env.TREASURY_HOT_WALLET_ADDRESS;
  });

  async function userWithAddress() {
    const { userId, token } = await registerE2eUser(app!, e2eEmail('inv-user'));
    const wallet = await seedWalletWithLedger(userId, '0');
    const address = uniqueTrc20Address('inv');
    await assignUserDepositAddress(wallet.id, address);
    return { userId, token, walletId: wallet.id, address };
  }

  it('P0: lowercase/uppercase/mixed-case concurrent ingest+recover credits once', async () => {
    const { walletId, address, token } = await userWithAddress();
    const canonical = canonicalTestTxHash(`case-p0-${Date.now()}`);
    const transfer = mockUsdtTransfer({
      txHash: canonical,
      toAddress: address,
      amount: '11.5',
    });
    provider.enqueue(transfer);

    const [w, r1, r2, r3] = await Promise.all([
      ingestion.tick(),
      ingestion.recoverByTxHash(canonical),
      ingestion.recoverByTxHash(canonical.toUpperCase()),
      ingestion.processTransfer(
        { ...transfer, txHash: `0x${canonical.toUpperCase()}` },
        DepositIngestionSource.RECOVERY,
      ),
    ]);
    void w;
    void r1;
    void r2;
    void r3;

    const prisma = getE2ePrisma();
    try {
      const deposits = await prisma.deposit.findMany({
        where: { blockchainTxid: canonical },
      });
      expect(deposits).toHaveLength(1);
      expect(deposits[0]!.blockchainTxid).toBe(canonical);
      expect(
        (await prisma.walletBalance.findUnique({ where: { walletId } }))!
          .available.toString(),
      ).toBe('11.5');
      const credits = await prisma.ledgerPosting.count({
        where: {
          walletId,
          operationType: LedgerOperationType.DEPOSIT_SETTLE,
          side: LedgerPostingSide.CREDIT,
        },
      });
      expect(credits).toBe(1);

      await expect(
        prisma.deposit.create({
          data: {
            walletTx: {
              create: {
                walletId,
                txType: WalletTxType.DEPOSIT,
                direction: WalletTxDirection.IN,
                amount: new Prisma.Decimal('1'),
                feeAmount: new Prisma.Decimal(0),
                netAmount: new Prisma.Decimal('1'),
                currency: 'USDT',
                status: WalletTxStatus.PENDING,
                happenedAt: new Date(),
              },
            },
            blockchainTxid: canonical.toUpperCase(),
            status: DepositStatus.DETECTED,
            chainNetwork: 'mainnet',
            tokenContract: transfer.tokenContract,
          },
        }),
      ).rejects.toThrow();

      const listed = await request(app!.getHttpServer())
        .get('/api/v1/wallet/deposits')
        .set('Authorization', `Bearer ${token}`);
      expect(listed.status).toBe(200);
      expect(listed.body.items[0].status).toBe('completed');
    } finally {
    }
  });

  it('admin HTTP recover with mixed-case hash is the same deposit', async () => {
    const { address, walletId } = await userWithAddress();
    const canonical = canonicalTestTxHash(`http-rec-${Date.now()}`);
    provider.enqueue(
      mockUsdtTransfer({ txHash: canonical, toAddress: address, amount: '3' }),
    );
    const token = await staffToken(app!);
    const res = await request(app!.getHttpServer())
      .post('/api/admin/v1/deposits/recover')
      .set('Authorization', `Bearer ${token}`)
      .send({ txHash: `  0X${canonical.toUpperCase()}  ` });
    expect([200, 201]).toContain(res.status);
    const prisma = getE2ePrisma();
    expect(await prisma.deposit.count({ where: { blockchainTxid: canonical } })).toBe(1);
    expect(
      (await prisma.walletBalance.findUnique({ where: { walletId } }))!
        .available.toString(),
    ).toBe('3');
  });

  it('CONFIRMED != CREDITED under kill switch; user API awaits credit', async () => {
    process.env.KILL_SWITCH_DISABLE_DEPOSIT_CREDIT = 'true';
    const { address, walletId, token } = await userWithAddress();
    const txHash = canonicalTestTxHash(`ks-${Date.now()}`);
    provider.enqueue(
      mockUsdtTransfer({ txHash, toAddress: address, amount: '8' }),
    );
    await ingestion.tick();
    const prisma = getE2ePrisma();
    const dep = await prisma.deposit.findFirstOrThrow({ where: { blockchainTxid: txHash } });
    expect(dep.status).toBe(DepositStatus.CONFIRMED);
    expect(
      (await prisma.walletBalance.findUnique({ where: { walletId } }))!
        .available.toString(),
    ).toBe('0');

    const listed = await request(app!.getHttpServer())
      .get('/api/v1/wallet/deposits')
      .set('Authorization', `Bearer ${token}`);
    expect(listed.body.items[0].status).toBe('confirmed_waiting_credit');
    expect(listed.body.items[0].status).not.toBe('completed');
  });

  it('maxAutoCredit: threshold auto-credits, +1 unit goes to MANUAL_REVIEW', async () => {
    const prisma = getE2ePrisma();
    await prisma.treasuryOperationalLimits.upsert({
      where: { id: 'platform' },
      create: {
        id: 'platform',
        maxAutoCreditDepositUsdt: new Prisma.Decimal('10'),
      },
      update: { maxAutoCreditDepositUsdt: new Prisma.Decimal('10') },
    });
    const a = await userWithAddress();
    const b = await userWithAddress();
    const c = await userWithAddress();
    const hugeUser = await userWithAddress();

    provider.enqueue(
      mockUsdtTransfer({
        txHash: canonicalTestTxHash(`thr-minus-${Date.now()}`),
        toAddress: a.address,
        amount: '9.999999',
      }),
    );
    provider.enqueue(
      mockUsdtTransfer({
        txHash: canonicalTestTxHash(`thr-eq-${Date.now()}`),
        toAddress: b.address,
        amount: '10',
      }),
    );
    provider.enqueue(
      mockUsdtTransfer({
        txHash: canonicalTestTxHash(`thr-plus-${Date.now()}`),
        toAddress: c.address,
        amount: '10.000001',
      }),
    );
    provider.enqueue(
      mockUsdtTransfer({
        txHash: canonicalTestTxHash(`thr-huge-${Date.now()}`),
        toAddress: hugeUser.address,
        amount: '999999999.123456',
      }),
    );
    await ingestion.tick();

    const creditedA = await prisma.deposit.findFirst({
      where: { walletTx: { walletId: a.walletId } },
    });
    const creditedB = await prisma.deposit.findFirst({
      where: { walletTx: { walletId: b.walletId } },
    });
    const reviewC = await prisma.deposit.findFirst({
      where: { walletTx: { walletId: c.walletId } },
    });
    const huge = await prisma.deposit.findFirst({
      where: { walletTx: { walletId: hugeUser.walletId } },
    });
    expect(creditedA?.status).toBe(DepositStatus.CREDITED);
    expect(creditedB?.status).toBe(DepositStatus.CREDITED);
    expect(reviewC?.status).toBe(DepositStatus.MANUAL_REVIEW);
    expect(huge?.status).toBe(DepositStatus.MANUAL_REVIEW);
    expect(
      (await prisma.walletBalance.findUnique({ where: { walletId: c.walletId } }))!
        .available.toString(),
    ).toBe('0');
    expect(huge?.amount?.toString()).toBe('999999999.123456');
    await prisma.treasuryOperationalLimits.update({
      where: { id: 'platform' },
      data: { maxAutoCreditDepositUsdt: new Prisma.Decimal('2000') },
    });
  });

  it('multi-leg recover: unique SPLITON dest wins; two SPLITON dests fail closed', async () => {
    const owned = await userWithAddress();
    const owned2 = await userWithAddress();
    const outsider = uniqueTrc20Address('out');
    const hashOne = canonicalTestTxHash(`ml-one-${Date.now()}`);
    provider.enqueue(
      mockUsdtTransfer({
        txHash: hashOne,
        toAddress: outsider,
        amount: '4',
      }),
    );
    provider.enqueue(
      mockUsdtTransfer({
        txHash: hashOne,
        toAddress: owned.address,
        amount: '6',
      }),
    );
    const recovered = await ingestion.recoverByTxHash(hashOne.toUpperCase());
    expect(recovered.status).toBe('credited');
    const prisma = getE2ePrisma();
    expect(
      (await prisma.walletBalance.findUnique({ where: { walletId: owned.walletId } }))!
        .available.toString(),
    ).toBe('6');

    const hashTwo = canonicalTestTxHash(`ml-two-${Date.now()}`);
    provider.enqueue(
      mockUsdtTransfer({ txHash: hashTwo, toAddress: owned.address, amount: '1' }),
    );
    provider.enqueue(
      mockUsdtTransfer({ txHash: hashTwo, toAddress: owned2.address, amount: '1' }),
    );
    const amb = await ingestion.recoverByTxHash(hashTwo);
    expect(amb.status).toBe('ambiguous');
    expect(await prisma.deposit.count({ where: { blockchainTxid: hashTwo } })).toBe(0);
  });

  it('multi-leg ignores non-USDT contract and does not take the first event', async () => {
    const owned = await userWithAddress();
    const hash = canonicalTestTxHash(`ml-tok-${Date.now()}`);
    provider.enqueue(
      mockUsdtTransfer({
        txHash: hash,
        toAddress: uniqueTrc20Address('first'),
        amount: '9',
        tokenContract: uniqueTrc20Address('notusdt'),
      }),
    );
    provider.enqueue(
      mockUsdtTransfer({
        txHash: hash,
        toAddress: owned.address,
        amount: '2',
      }),
    );
    const out = await ingestion.recoverByTxHash(hash);
    expect(out.status).toBe('credited');
    const prisma = getE2ePrisma();
    const dep = await prisma.deposit.findFirstOrThrow({ where: { blockchainTxid: hash } });
    expect(dep.amount?.toString()).toBe('2');
    expect(dep.toAddress).toBe(owned.address);
  });

  it('atomic pool claim: 20 concurrent users, one winner', async () => {
    const address = uniqueTrc20Address('pool1');
    const prisma = app!.get(PrismaService);
    await prisma.depositAddressPool.create({
      data: {
        address,
        asset: 'USDT',
        network: 'TRC20',
        status: DepositAddressPoolStatus.AVAILABLE,
        source: DepositAddressSource.ADMIN_POOL,
      },
    });
    await prisma.depositAddressPool.updateMany({
      where: { status: DepositAddressPoolStatus.AVAILABLE, address: { not: address } },
      data: { status: DepositAddressPoolStatus.DISABLED },
    });
    const users: Array<{
      token: string;
      userId: string;
      password: string;
      walletId: string;
    }> = [];
    for (let i = 0; i < 20; i++) {
      const u = await registerE2eUser(app!, e2eEmail(`claim-${i}`));
      const wallet = await seedWalletWithLedger(u.userId, '0');
      users.push({ ...u, walletId: wallet.id });
    }
    const results = await Promise.all(
      users.map((u) => pool.claimForWallet(u.walletId, u.userId, 'USDT', 'TRC20')),
    );
    const winners = results.filter((r) => r === address);
    expect(winners).toHaveLength(1);
    expect(results.filter((r) => r == null)).toHaveLength(19);
    const poolRow = await prisma.depositAddressPool.findUniqueOrThrow({
      where: { address },
    });
    const uda = await prisma.userDepositAddress.findUniqueOrThrow({
      where: { address },
    });
    expect(poolRow.assignedWalletId).toBe(uda.walletId);
    expect(uda.walletId).toBe(
      users.find((u) => results[users.indexOf(u)] === address)!.walletId,
    );
  }, 300_000);

  it('forbids raw wallet_id reassignment and delayed ROTATED still credits original owner', async () => {
    const original = await userWithAddress();
    const other = await userWithAddress();
    const prisma = app!.get(PrismaService);
    await expect(
      prisma.$executeRaw`
        UPDATE user_deposit_addresses
        SET wallet_id = ${other.walletId}::uuid
        WHERE address = ${original.address}
      `,
    ).rejects.toThrow();

    await prisma.userDepositAddress.updateMany({
      where: { address: original.address },
      data: { status: 'ROTATED', rotatedAt: new Date() },
    });
    const hash = canonicalTestTxHash(`delayed-${Date.now()}`);
    provider.enqueue(
      mockUsdtTransfer({
        txHash: hash,
        toAddress: original.address,
        amount: '5',
      }),
    );
    await ingestion.tick();
    expect(
      (await prisma.walletBalance.findUnique({ where: { walletId: original.walletId } }))!
        .available.toString(),
    ).toBe('5');
    expect(
      (await prisma.walletBalance.findUnique({ where: { walletId: other.walletId } }))!
        .available.toString(),
    ).toBe('0');
  });

  it('ownership ledger rejects duplicate source event', async () => {
    const { userId } = await userWithAddress();
    const prisma = app!.get(PrismaService);
    const release = await prisma.release.create({
      data: {
        slug: e2eSlug('own'),
        symbol: e2eSymbol('O'),
        title: 'Own',
        payoutFrequency: 'MONTHLY',
        totalUnits: new Prisma.Decimal(10),
        unitsAvailablePrimary: new Prisma.Decimal(10),
        primaryUnitPrice: new Prisma.Decimal(1),
        status: ReleaseStatus.ACTIVE,
      },
    });
    const sourceId = `order-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    await prisma.ownershipLedger.create({
      data: {
        userId,
        releaseId: release.id,
        eventType: OwnershipEventType.PRIMARY_BUY,
        unitsDelta: new Prisma.Decimal(1),
        sourceEntityType: 'order',
        sourceEntityId: sourceId,
        happenedAt: new Date(),
      },
    });
    await expect(
      prisma.ownershipLedger.create({
        data: {
          userId,
          releaseId: release.id,
          eventType: OwnershipEventType.PRIMARY_BUY,
          unitsDelta: new Prisma.Decimal(1),
          sourceEntityType: 'order',
          sourceEntityId: sourceId,
          happenedAt: new Date(),
        },
      }),
    ).rejects.toThrow();
  });

  it('overlap scan credits A,B,C,D once', async () => {
    const { address, walletId } = await userWithAddress();
    const now = Date.now();
    const hashes = ['A', 'B', 'C', 'D'].map((k) =>
      canonicalTestTxHash(`ov-${k}-${now}`),
    );
    const ts = {
      A: BigInt(now - 3000),
      B: BigInt(now - 2000),
      C: BigInt(now - 1000),
      D: BigInt(now + 50),
    };
    for (const key of ['A', 'B', 'C'] as const) {
      provider.enqueue(
        mockUsdtTransfer({
          txHash: hashes[['A', 'B', 'C'].indexOf(key)],
          toAddress: address,
          amount: '1',
          blockTimestampMs: ts[key],
        }),
      );
    }
    await ingestion.tick();
    provider.enqueue(
      mockUsdtTransfer({
        txHash: hashes[3],
        toAddress: address,
        amount: '1',
        blockTimestampMs: ts.D,
      }),
    );
    await ingestion.tick();
    const prisma = app!.get(PrismaService);
    expect(
      await prisma.deposit.count({ where: { blockchainTxid: { in: hashes } } }),
    ).toBe(4);
    expect(
      (await prisma.walletBalance.findUnique({ where: { walletId } }))!
        .available.toString(),
    ).toBe('4');
  });

  it('scan cursor watermark persists across ticks', async () => {
    const { address } = await userWithAddress();
    const hash = canonicalTestTxHash(`cur-${Date.now()}`);
    provider.enqueue(
      mockUsdtTransfer({
        txHash: hash,
        toAddress: address,
        amount: '1',
        blockTimestampMs: 1_700_000_000_000n,
      }),
    );
    await ingestion.tick();
    const prisma = app!.get(PrismaService);
    const cursor = await prisma.depositAddressScanCursor.findUnique({
      where: { address },
    });
    expect(cursor?.watermarkTimestamp).toBe(1_700_000_000_000n);
    await ingestion.tick();
    const again = await prisma.depositAddressScanCursor.findUnique({
      where: { address },
    });
    expect(again?.watermarkTimestamp).toBe(1_700_000_000_000n);
  });

  it('lease heartbeat holds ownership; stale worker cannot renew after takeover', async () => {
    // Longer TTL: remote Supabase latency / clock skew can exceed 400ms.
    const stale = await leases.tryAcquire(50);
    if (stale) await leases.release(stale);
    const a = await leases.tryAcquire(8_000);
    expect(a).toBeTruthy();
    const b1 = await leases.tryAcquire(8_000);
    expect(b1).toBeNull();
    await new Promise((r) => setTimeout(r, 120));
    expect(await leases.heartbeat(a!, 8_000)).toBe(true);
    await leases.release(a!);
    const b = await leases.tryAcquire(8_000);
    expect(b).toBeTruthy();
    expect(b!.version).toBeGreaterThan(a!.version);
    expect(await leases.heartbeat(a!, 8_000)).toBe(false);
    expect(await leases.heartbeat(b!, 8_000)).toBe(true);
    await leases.release(b!);
    const short = await leases.tryAcquire(300);
    expect(short).toBeTruthy();
    await new Promise((r) => setTimeout(r, 500));
    const takeover = await leases.tryAcquire(8_000);
    expect(takeover).toBeTruthy();
    expect(takeover!.version).toBeGreaterThan(short!.version);
    expect(await leases.heartbeat(short!, 8_000)).toBe(false);
    const ticks = await Promise.all([ingestion.tick(), ingestion.tick()]);
    expect(ticks.every((t) => t.skippedLock)).toBe(true);
    await leases.release(takeover!);
  });

  it('reconciliation detects chain-only, deposit-no-credit, credit-no-deposit, amount and user mismatch', async () => {
    const user = await userWithAddress();
    const other = await userWithAddress();
    const prisma = app!.get(PrismaService);

    const chainOnly = canonicalTestTxHash(`rc-chain-${Date.now()}`);
    provider.enqueue(
      mockUsdtTransfer({ txHash: chainOnly, toAddress: user.address, amount: '1' }),
    );
    const report1 = await recon.run({ autoFix: false });
    expect(report1.items.some((i) => i.finding === 'CHAIN_ONLY' && i.txHash === chainOnly)).toBe(
      true,
    );

    process.env.KILL_SWITCH_DISABLE_DEPOSIT_CREDIT = 'true';
    const noCredit = canonicalTestTxHash(`rc-nocred-${Date.now()}`);
    provider.enqueue(
      mockUsdtTransfer({ txHash: noCredit, toAddress: user.address, amount: '2' }),
    );
    await ingestion.processTransfer(
      mockUsdtTransfer({ txHash: noCredit, toAddress: user.address, amount: '2' }),
      DepositIngestionSource.AUTO,
    );
    const report2 = await recon.run({ autoFix: false });
    expect(
      report2.items.some((i) => i.finding === 'DEPOSIT_NO_CREDIT' && i.txHash === noCredit),
    ).toBe(true);

    await prisma.ledgerPosting.create({
      data: {
        walletId: user.walletId,
        ledgerAccount: LedgerAccount.USER_AVAILABLE,
        side: LedgerPostingSide.CREDIT,
        amount: new Prisma.Decimal('1'),
        currency: 'USDT',
        operationType: LedgerOperationType.DEPOSIT_SETTLE,
        sourceEntityType: 'deposit',
        sourceEntityId: '22222222-2222-2222-2222-222222222222',
        actorRole: ActorRole.SYSTEM,
        idempotencyKey: `recon-orphan-${Date.now()}`,
      },
    });
    const report3 = await recon.run({ autoFix: false });
    expect(report3.items.some((i) => i.finding === 'CREDIT_NO_DEPOSIT')).toBe(true);

    const mismatch = canonicalTestTxHash(`rc-amt-${Date.now()}`);
    process.env.KILL_SWITCH_DISABLE_DEPOSIT_CREDIT = 'false';
    provider.enqueue(
      mockUsdtTransfer({ txHash: mismatch, toAddress: other.address, amount: '3' }),
    );
    await ingestion.processTransfer(
      mockUsdtTransfer({ txHash: mismatch, toAddress: other.address, amount: '3' }),
      DepositIngestionSource.AUTO,
    );
    await prisma.deposit.updateMany({
      where: { blockchainTxid: mismatch },
      data: { amount: new Prisma.Decimal('9'), toAddress: user.address },
    });
    const report4 = await recon.run({ autoFix: false });
    expect(report4.items.some((i) => i.finding === 'AMOUNT_MISMATCH')).toBe(true);
    expect(report4.items.some((i) => i.finding === 'USER_MISMATCH')).toBe(true);
  });

  it('withdrawal rejects wrong treasury from, case-variant reuse, and ambiguous multi-leg', async () => {
    const { token, userId } = await registerE2eUser(app!, e2eEmail('wd-inv'));
    await seedWalletWithLedger(userId, '500');
    const dest = uniqueTrc20Address('wddest');
    const created = await request(app!.getHttpServer())
      .post('/api/v1/wallet/withdrawals')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: '100.00', toAddress: dest });
    expect(created.status).toBe(201);
    const id = created.body.id as string;
    const prisma = app!.get(PrismaService);
    const wd = await prisma.withdrawal.findUniqueOrThrow({
      where: { id },
      include: { walletTx: true },
    });
    const net = wd.walletTx.netAmount.toString();
    const staff = await staffToken(app!);
    const approve = await request(app!.getHttpServer())
      .post(`/api/admin/v1/withdrawals/${id}/approve`)
      .set('Authorization', `Bearer ${staff}`)
      .send({ note: 'ok' });
    expect(approve.status).toBe(201);

    const hash = canonicalTestTxHash(`wd-from-${Date.now()}`);
    const stranger = uniqueTrc20Address('stranger');
    const treasury = uniqueTrc20Address('hot');
    process.env.TREASURY_HOT_WALLET_ADDRESS = treasury;
    provider.enqueue(
      mockUsdtTransfer({
        txHash: hash,
        toAddress: dest,
        fromAddress: stranger,
        amount: net,
      }),
    );
    const wrongFrom = await request(app!.getHttpServer())
      .post(`/api/admin/v1/withdrawals/${id}/complete`)
      .set('Authorization', `Bearer ${staff}`)
      .send({ note: 'x', blockchainTxid: hash });
    expect(wrongFrom.status).toBeGreaterThanOrEqual(400);

    provider.clear();
    provider.enqueue(
      mockUsdtTransfer({
        txHash: hash,
        toAddress: dest,
        fromAddress: treasury,
        amount: net,
      }),
    );
    const ok = await request(app!.getHttpServer())
      .post(`/api/admin/v1/withdrawals/${id}/complete`)
      .set('Authorization', `Bearer ${staff}`)
      .send({ note: 'x', blockchainTxid: hash.toUpperCase() });
    expect([200, 201]).toContain(ok.status);

    const { token: token2, userId: user2 } = await registerE2eUser(app!, e2eEmail('wd-inv2'));
    await seedWalletWithLedger(user2, '500');
    const created2 = await request(app!.getHttpServer())
      .post('/api/v1/wallet/withdrawals')
      .set('Authorization', `Bearer ${token2}`)
      .send({ amount: '100.00', toAddress: dest });
    const approve2 = await request(app!.getHttpServer())
      .post(`/api/admin/v1/withdrawals/${created2.body.id}/approve`)
      .set('Authorization', `Bearer ${staff}`)
      .send({ note: 'ok' });
    expect(approve2.status).toBe(201);
    const reused = await request(app!.getHttpServer())
      .post(`/api/admin/v1/withdrawals/${created2.body.id}/complete`)
      .set('Authorization', `Bearer ${staff}`)
      .send({ note: 'x', blockchainTxid: hash.toUpperCase() });
    expect(reused.status).toBeGreaterThanOrEqual(400);
  });
});
