import { Injectable } from '@nestjs/common';
import { TreasuryAccountStatus, TreasuryAccountType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { isValidTrc20Address } from '../wallets/validators/trc20-address.validator';

@Injectable()
export class TreasuryPayoutWalletsService {
  constructor(private readonly prisma: PrismaService) {}

  async listApprovedFromAddresses(): Promise<string[]> {
    const fromEnv = [
      process.env.TREASURY_HOT_WALLET_ADDRESS,
      process.env.TREASURY_COLD_WALLET_ADDRESS,
    ]
      .map((v) => v?.trim() ?? '')
      .filter((v) => v && isValidTrc20Address(v));

    const rows = await this.prisma.treasuryAccount.findMany({
      where: {
        type: { in: [TreasuryAccountType.HOT_WALLET, TreasuryAccountType.COLD_WALLET] },
        status: TreasuryAccountStatus.ACTIVE,
        address: { not: null },
      },
      select: { address: true },
    });
    const fromDb = rows
      .map((row) => row.address?.trim() ?? '')
      .filter((v) => v && isValidTrc20Address(v));

    return [...new Set([...fromEnv, ...fromDb])];
  }
}
