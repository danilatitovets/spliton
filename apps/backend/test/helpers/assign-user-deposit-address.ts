import {
  DepositAddressSource,
  DepositAddressStatus,
  PrismaClient,
} from '@prisma/client';

export async function assignUserDepositAddress(
  walletId: string,
  address: string,
): Promise<void> {
  const prisma = new PrismaClient();
  try {
    await prisma.wallet.update({
      where: { id: walletId },
      data: { address },
    });
    const existing = await prisma.userDepositAddress.findUnique({
      where: { address },
    });
    if (existing) {
      if (existing.walletId !== walletId) {
        throw new Error('DEPOSIT_ADDRESS_IN_USE');
      }
      await prisma.userDepositAddress.update({
        where: { id: existing.id },
        data: {
          status: DepositAddressStatus.ACTIVE,
          rotatedAt: null,
        },
      });
      return;
    }
    await prisma.userDepositAddress.create({
      data: {
        walletId,
        address,
        status: DepositAddressStatus.ACTIVE,
        source: DepositAddressSource.STATIC,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}
