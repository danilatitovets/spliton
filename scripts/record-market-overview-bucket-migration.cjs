const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  try {
    const existing = await prisma.$queryRawUnsafe(
      `SELECT migration_name FROM _prisma_migrations WHERE migration_name = $1`,
      "20260806190000_market_overview_search_price_bucket_cast",
    );
    if (Array.isArray(existing) && existing.length) {
      console.log("already recorded");
      return;
    }
    await prisma.$executeRawUnsafe(
      `INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
       VALUES (gen_random_uuid()::text, 'manual-apply', NOW(), $1, NULL, NULL, NOW(), 1)`,
      "20260806190000_market_overview_search_price_bucket_cast",
    );
    console.log("migration recorded");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
