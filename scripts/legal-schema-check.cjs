require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
async function main() {
  const p = new PrismaClient();
  try {
    const cols = await p.$queryRawUnsafe("SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('legal_policies','user_legal_consents') AND column_name LIKE '%hash%' ORDER BY 1,2");
    const mig = await p.$queryRawUnsafe("SELECT migration_name, finished_at, rolled_back_at FROM _prisma_migrations WHERE migration_name LIKE '%legal%' ORDER BY finished_at DESC LIMIT 5");
    console.log('HASH_COLUMNS', JSON.stringify(cols, null, 2));
    console.log('LEGAL_MIGRATIONS', JSON.stringify(mig, null, 2));
  } finally { await p.$disconnect(); }
}
main();