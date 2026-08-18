import request from 'supertest';
import { UserRoleCode } from '@prisma/client';
import { createE2eApp, E2eApp } from './helpers/create-e2e-app';
import { registerE2eUser } from './helpers/register-e2e-user';
import { seedWalletWithLedger } from './helpers/seed-wallet-ledger';
import { MockDepositProvider } from '../src/modules/deposit-ingestion/providers/mock-deposit.provider';
import { DepositIngestionService } from '../src/modules/deposit-ingestion/deposit-ingestion.service';
import { uniqueTrc20Address } from './helpers/e2e-trc20-address';
import { canonicalTestTxHash } from './helpers/canonical-tx-hash';
import { assignUserDepositAddress } from './helpers/assign-user-deposit-address';
import { mockUsdtTransfer } from './helpers/mock-usdt-transfer';
import { DepositIngestionSource } from '@prisma/client';
import { createIsolatedE2ePrisma, getE2ePrisma } from './helpers/e2e-prisma';

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}@example.com`;
}

async function registerUser(app: E2eApp, email: string) {
  const { userId, password } = await registerE2eUser(app, email);
  return { userId, password };
}

async function staffToken(app: E2eApp) {
  const email = uniqueEmail('deposit-staff');
  const { userId, password } = await registerUser(app, email);
  const prisma = getE2ePrisma();
  const role = await prisma.role.findUnique({
    where: { code: UserRoleCode.ACCOUNTANT },
  });
  if (role) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId: role.id } },
      create: { userId, roleId: role.id },
      update: {},
    });
  }
  const login = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password });
  return login.body.tokens.accessToken as string;
}

describe('Deposit ingestion (e2e)', () => {
  let app: E2eApp | undefined;
  let provider: MockDepositProvider;
  let ingestion: DepositIngestionService;

  beforeEach(async () => {
    process.env.TRON_PROVIDER_MODE = 'mock';
    process.env.DEPOSIT_INGESTION_ENABLED = 'false';
    process.env.TRON_CONFIRMATIONS = '20';
    process.env.KILL_SWITCH_DISABLE_DEPOSIT_CREDIT = 'false';
    app = await createE2eApp();
    provider = app.get(MockDepositProvider);
    ingestion = app.get(DepositIngestionService);
    provider.clear();
    provider.nowBlock = 10_020n;
  });

  afterEach(async () => {
    if (app) await app.close();
    app = undefined;
  });

  it('mock incoming tx credits wallet once', async () => {
    const email = uniqueEmail('dep-user');
    const { userId } = await registerUser(app!, email);
    const wallet = await seedWalletWithLedger(userId, '10');
    const depositAddress = uniqueTrc20Address('Dep');
    await assignUserDepositAddress(wallet.id, depositAddress);

    provider.enqueue(
      mockUsdtTransfer({
        txHash: canonicalTestTxHash(`tx-${Date.now()}`),
        toAddress: depositAddress,
        amount: '25',
      }),
    );
    const out = await ingestion.tick();
    expect(out.credited).toBe(1);

    const prisma2 = createIsolatedE2ePrisma();
    const balance = await prisma2.walletBalance.findUnique({
      where: { walletId: wallet.id },
    });
    expect(balance!.available.toString()).toBe('35');
    const depositCount = await prisma2.deposit.count({
      where: { walletTx: { walletId: wallet.id } },
    });
    expect(depositCount).toBe(1);
    await prisma2.$disconnect();
  });

  it('pending confirmations not credited; second pass credits once', async () => {
    const email = uniqueEmail('dep-pending');
    const { userId } = await registerUser(app!, email);
    const wallet = await seedWalletWithLedger(userId, '0');
    const depositAddress = uniqueTrc20Address('Pend');
    await assignUserDepositAddress(wallet.id, depositAddress);

    const txHash = canonicalTestTxHash(`tx-pending-${Date.now()}`);
    provider.nowBlock = 9_993n;
    provider.enqueue(
      mockUsdtTransfer({
        txHash,
        toAddress: depositAddress,
        amount: '5',
        blockNumber: 9_990n,
      }),
    );
    await ingestion.tick();

    const p1 = createIsolatedE2ePrisma();
    const b1 = await p1.walletBalance.findUnique({
      where: { walletId: wallet.id },
    });
    expect(b1!.available.toString()).toBe('0');
    await p1.$disconnect();

    provider.nowBlock = 10_020n;
    await ingestion.tick();
    await ingestion.tick();

    const p2 = createIsolatedE2ePrisma();
    const b2 = await p2.walletBalance.findUnique({
      where: { walletId: wallet.id },
    });
    expect(b2!.available.toString()).toBe('5');
    const dep = await p2.deposit.findFirstOrThrow({
      where: { blockchainTxid: txHash },
    });
    expect(dep.status).toBe('CREDITED');
    await p2.$disconnect();
  });

  it('unknown address is unattributed and admin lists deposits', async () => {
    const token = await staffToken(app!);
    const out = await ingestion.processTransfer(
      mockUsdtTransfer({
        txHash: canonicalTestTxHash(`tx-wrong-${Date.now()}`),
        toAddress: uniqueTrc20Address('Unknown'),
        amount: '3',
      }),
      DepositIngestionSource.AUTO,
    );
    expect(out).toBe('unattributed');

    const list = await request(app!.getHttpServer())
      .get('/api/admin/v1/deposits')
      .set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.items)).toBe(true);

    const unknown = await request(app!.getHttpServer())
      .get('/api/admin/v1/deposits/unattributed')
      .set('Authorization', `Bearer ${token}`);
    expect(unknown.status).toBe(200);
    expect(unknown.body.length).toBeGreaterThan(0);
  });
});
