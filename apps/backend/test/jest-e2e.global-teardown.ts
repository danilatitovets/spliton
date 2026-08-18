import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { cleanupE2eUsers } from './helpers/cleanup-e2e-users';
import { configureE2eDatabase } from './helpers/e2e-database-config';
import { disconnectE2ePrisma } from './helpers/e2e-prisma';

for (const envPath of [
  resolve(__dirname, '../../../.env'),
  resolve(__dirname, '../../.env'),
]) {
  if (existsSync(envPath)) {
    config({ path: envPath });
    break;
  }
}

export default async function globalTeardown(): Promise<void> {
  process.env.NODE_ENV = 'test';

  try {
    configureE2eDatabase();
  } catch (error) {
    console.warn(
      '[e2e] global teardown skipped: database not configured',
      error instanceof Error ? error.message : error,
    );
    return;
  }

  if (process.env.E2E_SKIP_GLOBAL_CLEANUP !== '1') {
    try {
      await cleanupE2eUsers();
    } catch (error) {
      console.warn(
        '[e2e] global teardown cleanup skipped or failed:',
        error instanceof Error ? error.message : error,
      );
    }
  }

  await disconnectE2ePrisma();
}
