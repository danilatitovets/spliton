const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

async function main() {
  const sql = fs.readFileSync(
    "prisma/migrations/20260806190000_market_overview_search_price_bucket_cast/migration.sql",
    "utf8",
  );
  const prisma = new PrismaClient();
  try {
    await prisma.$executeRawUnsafe(sql);
    console.log("market_overview_search price_bucket cast applied");
    const rows = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::int AS c FROM market_overview_search($1::text, NULL, $2::text, NULL, NULL, NULL, NULL, NULL, NULL, $3::text, $4::text, $5::integer, $6::integer)`,
      "30d",
      "all",
      "activity",
      "desc",
      1,
      3,
    );
    console.log("smoke ok", rows);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
