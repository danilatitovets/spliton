import { HttpStatus, Injectable } from '@nestjs/common';
import {
  DepositAddressPoolStatus,
  DepositAddressSource,
  DepositAddressStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { throwAdminError } from '../admin/common/admin-http.util';
import { isValidTrc20Address } from '../wallets/validators/trc20-address.validator';

export type DepositAddressPoolRowDto = {
  id: string;
  address: string;
  asset: string;
  network: string;
  status: DepositAddressPoolStatus;
  source: DepositAddressSource;
  assignedWalletId: string | null;
  assignedUserId: string | null;
  assignedAt: string | null;
  disabledAt: string | null;
  disabledByUserId: string | null;
  disableReason: string | null;
  archivedAt: string | null;
  archivedByUserId: string | null;
  createdByUserId: string | null;
  createdAt: string;
};

export type DepositAddressPoolListDto = {
  items: DepositAddressPoolRowDto[];
  total: number;
  availableCount: number;
  assignedCount: number;
  disabledCount: number;
  archivedCount: number;
};

const ASSIGNED_STATUSES = new Set<DepositAddressPoolStatus>([
  DepositAddressPoolStatus.ASSIGNED,
  DepositAddressPoolStatus.ACTIVE,
]);

@Injectable()
export class DepositAddressPoolService {
  constructor(private readonly prisma: PrismaService) {}

  async claimForWallet(
    walletId: string,
    userId: string,
    asset: string,
    network: string,
  ): Promise<string | null> {
    return this.prisma.$transaction(
      async (tx) => {
        const poolRows = await tx.$queryRaw<Array<{ address: string }>>`
        UPDATE deposit_address_pool AS p
        SET
          status = 'ASSIGNED',
          assigned_wallet_id = ${walletId}::uuid,
          assigned_user_id = ${userId}::uuid,
          assigned_at = NOW(),
          updated_at = NOW()
        WHERE p.id = (
          SELECT id
          FROM deposit_address_pool
          WHERE asset = ${asset}
            AND network = ${network}
            AND status = 'AVAILABLE'
          ORDER BY created_at ASC, id ASC
          FOR UPDATE SKIP LOCKED
          LIMIT 1
        )
        AND p.status = 'AVAILABLE'
        RETURNING p.address
      `;
        const address = poolRows[0]?.address;
        if (!address) return null;

        await tx.userDepositAddress.updateMany({
          where: { walletId, status: DepositAddressStatus.ACTIVE },
          data: {
            status: DepositAddressStatus.ROTATED,
            rotatedAt: new Date(),
          },
        });
        await tx.userDepositAddress.create({
          data: {
            walletId,
            address,
            status: DepositAddressStatus.ACTIVE,
            source: DepositAddressSource.ADMIN_POOL,
          },
        });
        await tx.wallet.update({
          where: { id: walletId },
          data: { address },
        });
        return address;
      },
      // Concurrent claim red-team needs headroom to acquire connections + locks.
      { maxWait: 20_000, timeout: 30_000 },
    );
  }

  async getById(id: string): Promise<DepositAddressPoolRowDto> {
    const row = await this.prisma.depositAddressPool.findUnique({ where: { id } });
    if (!row) {
      throwAdminError('ADDRESS_NOT_FOUND', 'Address not found', HttpStatus.NOT_FOUND);
    }
    return this.map(row!);
  }

  async adminAddAddress(
    address: string,
    asset = 'USDT',
    network = 'TRC20',
    actorUserId?: string,
  ) {
    const trimmed = address.trim();
    if (!isValidTrc20Address(trimmed)) {
      throwAdminError(
        'INVALID_TRC20_ADDRESS',
        'Некорректный TRON-адрес',
        HttpStatus.BAD_REQUEST,
      );
    }
    const existing = await this.prisma.depositAddressPool.findUnique({
      where: { address: trimmed },
    });
    if (existing) {
      throwAdminError(
        'ADDRESS_ALREADY_EXISTS',
        'Адрес уже есть в пуле',
        HttpStatus.CONFLICT,
      );
    }
    const row = await this.prisma.depositAddressPool.create({
      data: {
        address: trimmed,
        asset,
        network,
        status: DepositAddressPoolStatus.AVAILABLE,
        source: DepositAddressSource.ADMIN_POOL,
        createdByUserId: actorUserId ?? null,
      },
    });
    return this.map(row);
  }

  async adminBulkAddAddresses(
    addresses: string[],
    actorUserId: string,
    asset = 'USDT',
    network = 'TRC20',
  ) {
    const added: DepositAddressPoolRowDto[] = [];
    const duplicates: string[] = [];
    const invalid: string[] = [];

    for (const raw of addresses) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      if (!isValidTrc20Address(trimmed)) {
        invalid.push(trimmed);
        continue;
      }
      const existing = await this.prisma.depositAddressPool.findUnique({
        where: { address: trimmed },
      });
      if (existing) {
        duplicates.push(trimmed);
        continue;
      }
      const row = await this.prisma.depositAddressPool.create({
        data: {
          address: trimmed,
          asset,
          network,
          status: DepositAddressPoolStatus.AVAILABLE,
          source: DepositAddressSource.ADMIN_POOL,
          createdByUserId: actorUserId,
        },
      });
      added.push(this.map(row));
    }

    return { added, duplicates, invalid };
  }

  async listPool(asset = 'USDT', network = 'TRC20', limit = 200): Promise<DepositAddressPoolListDto> {
    const rows = await this.prisma.depositAddressPool.findMany({
      where: { asset, network },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    const items = rows.map((r) => this.map(r));
    return {
      items,
      total: items.length,
      availableCount: items.filter((r) => r.status === DepositAddressPoolStatus.AVAILABLE)
        .length,
      assignedCount: items.filter((r) => ASSIGNED_STATUSES.has(r.status)).length,
      disabledCount: items.filter(
        (r) =>
          r.status === DepositAddressPoolStatus.DISABLED ||
          r.status === DepositAddressPoolStatus.COMPROMISED,
      ).length,
      archivedCount: items.filter((r) => r.status === DepositAddressPoolStatus.ARCHIVED)
        .length,
    };
  }

  async adminDisable(
    id: string,
    reason: string,
    actorUserId: string,
    compromised = false,
  ) {
    if (!reason?.trim()) {
      throwAdminError(
        'REASON_REQUIRED',
        'Укажите причину',
        HttpStatus.BAD_REQUEST,
      );
    }
    const row = await this.prisma.depositAddressPool.findUnique({ where: { id } });
    if (!row) {
      throwAdminError('ADDRESS_NOT_FOUND', 'Address not found', HttpStatus.NOT_FOUND);
    }
    if (row!.status === DepositAddressPoolStatus.ARCHIVED) {
      throwAdminError(
        'ADDRESS_ARCHIVED',
        'Archived address cannot be disabled',
        HttpStatus.BAD_REQUEST,
      );
    }
    const updated = await this.prisma.depositAddressPool.update({
      where: { id },
      data: {
        status: compromised
          ? DepositAddressPoolStatus.COMPROMISED
          : DepositAddressPoolStatus.DISABLED,
        disabledAt: new Date(),
        disabledByUserId: actorUserId,
        disableReason: reason.trim(),
      },
    });
    return this.map(updated);
  }

  async adminEnable(id: string, reason: string, actorUserId: string) {
    if (!reason?.trim()) {
      throwAdminError(
        'REASON_REQUIRED',
        'Укажите причину',
        HttpStatus.BAD_REQUEST,
      );
    }
    const row = await this.prisma.depositAddressPool.findUnique({ where: { id } });
    if (!row) {
      throwAdminError('ADDRESS_NOT_FOUND', 'Address not found', HttpStatus.NOT_FOUND);
    }
    if (
      row!.status !== DepositAddressPoolStatus.DISABLED &&
      row!.status !== DepositAddressPoolStatus.COMPROMISED
    ) {
      throwAdminError(
        'ADDRESS_NOT_DISABLED',
        'Only disabled addresses can be re-enabled',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (row!.assignedWalletId) {
      throwAdminError(
        'ADDRESS_ALREADY_ASSIGNED',
        'Assigned deposit addresses cannot return to the pool',
        HttpStatus.CONFLICT,
      );
    }
    const updated = await this.prisma.depositAddressPool.update({
      where: { id },
      data: {
        status: DepositAddressPoolStatus.AVAILABLE,
        disabledAt: null,
        disabledByUserId: null,
        disableReason: null,
        archivedAt: null,
        archivedByUserId: null,
      },
    });
    return this.map(updated);
  }

  async adminArchive(id: string, reason: string, actorUserId: string) {
    if (!reason?.trim()) {
      throwAdminError(
        'REASON_REQUIRED',
        'Укажите причину',
        HttpStatus.BAD_REQUEST,
      );
    }
    const row = await this.prisma.depositAddressPool.findUnique({ where: { id } });
    if (!row) {
      throwAdminError('ADDRESS_NOT_FOUND', 'Address not found', HttpStatus.NOT_FOUND);
    }
    if (ASSIGNED_STATUSES.has(row!.status)) {
      throwAdminError(
        'ADDRESS_ASSIGNED',
        'Assigned address cannot be archived',
        HttpStatus.BAD_REQUEST,
      );
    }
    const updated = await this.prisma.depositAddressPool.update({
      where: { id },
      data: {
        status: DepositAddressPoolStatus.ARCHIVED,
        archivedAt: new Date(),
        archivedByUserId: actorUserId,
        disableReason: reason.trim(),
      },
    });
    return this.map(updated);
  }

  private map(row: {
    id: string;
    address: string;
    asset: string;
    network: string;
    status: DepositAddressPoolStatus;
    source: DepositAddressSource;
    assignedWalletId: string | null;
    assignedUserId: string | null;
    assignedAt: Date | null;
    disabledAt: Date | null;
    disabledByUserId: string | null;
    disableReason: string | null;
    archivedAt: Date | null;
    archivedByUserId: string | null;
    createdByUserId: string | null;
    createdAt: Date;
  }): DepositAddressPoolRowDto {
    return {
      id: row.id,
      address: row.address,
      asset: row.asset,
      network: row.network,
      status: row.status,
      source: row.source,
      assignedWalletId: row.assignedWalletId,
      assignedUserId: row.assignedUserId,
      assignedAt: row.assignedAt?.toISOString() ?? null,
      disabledAt: row.disabledAt?.toISOString() ?? null,
      disabledByUserId: row.disabledByUserId,
      disableReason: row.disableReason,
      archivedAt: row.archivedAt?.toISOString() ?? null,
      archivedByUserId: row.archivedByUserId,
      createdByUserId: row.createdByUserId,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
