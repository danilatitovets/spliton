import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const slowMs = Number(process.env.PRISMA_SLOW_QUERY_MS ?? '0');
    // Default Prisma interactive tx timeout (5s) is too low for multi-step
    // ledger / pool-claim work under concurrent load. Override via env.
    const txMaxWait = Number(process.env.PRISMA_TX_MAX_WAIT_MS ?? '10000');
    const txTimeout = Number(process.env.PRISMA_TX_TIMEOUT_MS ?? '20000');
    super({
      ...(slowMs > 0 ? { log: [{ emit: 'event', level: 'query' as const }] } : {}),
      transactionOptions: {
        maxWait: Number.isFinite(txMaxWait) && txMaxWait > 0 ? txMaxWait : 10_000,
        timeout: Number.isFinite(txTimeout) && txTimeout > 0 ? txTimeout : 20_000,
      },
    });
    if (slowMs > 0) {
      const client = this as PrismaClient & {
        $on?: (
          event: 'query',
          callback: (payload: { duration: number; query: string }) => void,
        ) => void;
      };
      client.$on?.('query', (event) => {
        if (event.duration >= slowMs) {
          this.logger.warn(
            `Slow query ${event.duration}ms: ${event.query.slice(0, 240)}`,
          );
        }
      });
    }
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
