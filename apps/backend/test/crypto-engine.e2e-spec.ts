import request from 'supertest';
import {
  Prisma,
  PrismaClient,
  PrimaryRaiseRoundStatus,
  ReleaseStatus,
} from '@prisma/client';
import { createE2eApp, E2eApp } from './helpers/create-e2e-app';
import { registerE2eUser } from './helpers/register-e2e-user';
import { e2eEmail, e2eKey, e2eSlug, e2eSymbol } from './helpers/e2e-unique';
import { uniqueTrc20Address } from './helpers/e2e-trc20-address';
import { mockUsdtTransfer } from './helpers/mock-usdt-transfer';
import { MockDepositProvider } from '../src/modules/deposit-ingestion/providers/mock-deposit.provider';
import { DepositIngestionService } from '../src/modules/deposit-ingestion/deposit-ingestion.service';
import { DepositIngestionSource } from '@prisma/client';
import { seedWalletWithLedger } from './helpers/seed-wallet-ledger';
import { canonicalTestTxHash } from './helpers/canonical-tx-hash';
import { assignUserDepositAddress } from './helpers/assign-user-deposit-address';

async function seedPrimaryRound(units: string, price = '10') {
  const prisma = new PrismaClient();
  const release = await prisma.release.create({
    data: {
      slug: e2eSlug('crypto-rel'),
      symbol: e2eSymbol('C'),
      title: 'Crypto E2E Release',
      payoutFrequency: 'MONTHLY',
      totalUnits: new Prisma.Decimal(1000),
      unitsAvailablePrimary: new Prisma.Decimal(units),
      primaryUnitPrice: new Prisma.Decimal(price),
      status: ReleaseStatus.ACTIVE,
    },
  });
  const round = await prisma.primaryRaiseRound.create({
    data: {
      releaseId: release.id,
      status: PrimaryRaiseRoundStatus.LIVE,
      raiseTargetUsdt: new Prisma.Decimal(10000),
      hardCapUsdt: new Prisma.Decimal(10000),
      totalUnits: new Prisma.Decimal(units),
      soldUnits: new Prisma.Decimal(0),
    },
  });
  await prisma.$disconnect();
  return { release, round };
}

describe('USDT TRC-20 crypto engine (e2e)', () => {
  let app: E2eApp | undefined;
  let provider: MockDepositProvider;
  let ingestion: DepositIngestionService;

  beforeEach(async () => {
    process.env.TRON_PROVIDER_MODE = 'mock';
    process.env.KILL_SWITCH_DISABLE_DEPOSIT_CREDIT = 'false';
    process.env.FEATURE_ENABLE_DEPOSITS = 'true';
    app = await createE2eApp();
    provider = app.get(MockDepositProvider);
    ingestion = app.get(DepositIngestionService);
    provider.clear();
    provider.nowBlock = 20_000n;
  });

  afterEach(async () => {
    if (app) await app.close();
    app = undefined;
    delete process.env.KILL_SWITCH_DISABLE_DEPOSIT_CREDIT;
  });

  async function assignAddress() {
    const { userId, token } = await registerE2eUser(app!, e2eEmail('cuser'));
    const wallet = await seedWalletWithLedger(userId, '0');
    const address = uniqueTrc20Address('cdep');
    await assignUserDepositAddress(wallet.id, address);
    return { token, userId, address, walletId: wallet.id };
  }

  it('credits exactly once across 5 ingest repeats', async () => {
    const { userId, address, walletId } = await assignAddress();
    void userId;
    const txHash = canonicalTestTxHash(`once-${Date.now()}`);
    provider.enqueue(
      mockUsdtTransfer({ txHash, toAddress: address, amount: '12.5' }),
    );
    for (let i = 0; i < 5; i += 1) {
      await ingestion.tick();
    }
    const prisma = new PrismaClient();
    const balance = await prisma.walletBalance.findUnique({
      where: { walletId },
    });
    expect(balance!.available.toString()).toBe('12.5');
    expect(
      await prisma.deposit.count({ where: { blockchainTxid: txHash } }),
    ).toBe(1);
    await prisma.$disconnect();
  });

  it('parallel processTransfer credits once', async () => {
    const { address, walletId } = await assignAddress();
    const transfer = mockUsdtTransfer({
      txHash: canonicalTestTxHash(`race-${Date.now()}`),
      toAddress: address,
      amount: '7',
    });
    provider.enqueue(transfer);
    const results = await Promise.all([
      ingestion.processTransfer(transfer, DepositIngestionSource.AUTO),
      ingestion.processTransfer(transfer, DepositIngestionSource.AUTO),
    ]);
    expect(results.filter((r) => r === 'credited').length).toBe(1);
    const prisma = new PrismaClient();
    expect(
      (await prisma.walletBalance.findUnique({ where: { walletId } }))!
        .available.toString(),
    ).toBe('7');
    await prisma.$disconnect();
  });

  it('admin recover by txHash is idempotent with worker', async () => {
    const { address, walletId } = await assignAddress();
    const txHash = canonicalTestTxHash(`rec-${Date.now()}`);
    const transfer = mockUsdtTransfer({
      txHash,
      toAddress: address,
      amount: '9',
    });
    provider.enqueue(transfer);
    const [a, b] = await Promise.all([
      ingestion.tick(),
      ingestion.recoverByTxHash(txHash),
    ]);
    void a;
    void b;
    const prisma = new PrismaClient();
    expect(
      (await prisma.walletBalance.findUnique({ where: { walletId } }))!
        .available.toString(),
    ).toBe('9');
    expect(
      await prisma.deposit.count({ where: { blockchainTxid: txHash } }),
    ).toBe(1);
    await prisma.$disconnect();
  });

  it('kill switch confirms but does not credit', async () => {
    process.env.KILL_SWITCH_DISABLE_DEPOSIT_CREDIT = 'true';
    const { address, walletId } = await assignAddress();
    const txHash = canonicalTestTxHash(`kill-${Date.now()}`);
    provider.enqueue(
      mockUsdtTransfer({ txHash, toAddress: address, amount: '4' }),
    );
    const out = await ingestion.tick();
    expect(out.credited).toBe(0);
    const prisma = new PrismaClient();
    const dep = await prisma.deposit.findFirst({ where: { blockchainTxid: txHash } });
    expect(dep?.status).toBe('CONFIRMED');
    expect(
      (await prisma.walletBalance.findUnique({ where: { walletId } }))!
        .available.toString(),
    ).toBe('0');
    await prisma.$disconnect();
  });

  it('rejects failed and wrong-token transfers', async () => {
    const { address } = await assignAddress();
    const failed = await ingestion.processTransfer(
      mockUsdtTransfer({
        txHash: canonicalTestTxHash(`fail-${Date.now()}`),
        toAddress: address,
        amount: '1',
        success: false,
      }),
      DepositIngestionSource.AUTO,
    );
    expect(failed).toBe('ignored');
    process.env.TRON_USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
    const wrong = await ingestion.processTransfer(
      mockUsdtTransfer({
        txHash: canonicalTestTxHash(`tok-${Date.now()}`),
        toAddress: address,
        amount: '1',
        tokenContract: uniqueTrc20Address('tok'),
      }),
      DepositIngestionSource.AUTO,
    );
    expect(wrong).toBe('ignored');
    delete process.env.TRON_USDT_CONTRACT;
  });

  it('deposit credit then primary purchase is atomic', async () => {
    const { token, userId, address, walletId } = await assignAddress();
    provider.enqueue(
      mockUsdtTransfer({
        txHash: canonicalTestTxHash(`buy-${Date.now()}`),
        toAddress: address,
        amount: '50',
      }),
    );
    await ingestion.tick();
    const { round, release } = await seedPrimaryRound('100');
    const idem = e2eKey('crypto-buy');
    const first = await request(app!.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', idem)
      .send({ roundId: round.id, units: 2, idempotencyKey: idem });
    expect(first.status).toBe(201);
    expect(first.body.status).toBe('settled');
    const prisma = new PrismaClient();
    const balance = await prisma.walletBalance.findUnique({
      where: { walletId },
    });
    expect(Number(balance!.available.toString())).toBeLessThan(50);
    const position = await prisma.userPosition.findFirst({
      where: { userId, releaseId: release.id },
    });
    expect(position).toBeTruthy();
    const ownership = await prisma.ownershipLedger.findFirst({
      where: { userId, releaseId: release.id },
    });
    expect(ownership).toBeTruthy();
    await prisma.$disconnect();
  });
});
