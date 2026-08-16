const fs = require("fs");
const path =
  "prisma/migrations/20260806190000_market_overview_search_price_bucket_cast/migration.sql";
const src = fs.readFileSync(
  "prisma/migrations/20260806180000_market_overview_search_period/migration.sql",
  "utf8",
);

let fixed = src.replace(
  /v_spark_bucket text := CASE WHEN lower\(trim\(COALESCE\(p_period, '7d'\)\)\) = '24h' THEN 'H1' ELSE 'D1' END;/,
  "v_spark_bucket price_bucket := CASE WHEN lower(trim(COALESCE(p_period, '7d'))) = '24h' THEN 'H1'::price_bucket ELSE 'D1'::price_bucket END;",
);
fixed = fixed.replace(
  /v_spark_bucket := 'D1';/,
  "v_spark_bucket := 'D1'::price_bucket;",
);

const start = fixed.indexOf("CREATE OR REPLACE FUNCTION market_overview_search");
if (start < 0) throw new Error("function body not found");
const body = fixed.slice(start);
fs.mkdirSync(
  "prisma/migrations/20260806190000_market_overview_search_price_bucket_cast",
  { recursive: true },
);
fs.writeFileSync(
  path,
  "-- Cast sparkline bucket compare to price_bucket enum (fixes 42883)\n\n" + body,
);
console.log(
  "ok",
  body.includes("::price_bucket"),
  body.includes("v_spark_bucket price_bucket"),
);
