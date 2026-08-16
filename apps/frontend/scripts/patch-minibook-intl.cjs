const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "../components/dashboard/dashboard-mini-order-book.tsx");
let s = fs.readFileSync(p, "utf8");
if (s.includes("Deterministic number formatting")) {
  console.log("already");
  process.exit(0);
}
const oldPrice = `function formatPrice(value: number, locale: AppLocale): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(intlLocaleFor(locale), {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
}

function formatUnits(value: number, locale: AppLocale): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(intlLocaleFor(locale), { maximumFractionDigits: 0 });
}`;

const nextPrice = `/** Deterministic number formatting — avoids Node vs browser Intl hydration mismatches. */
function formatPrice(value: number, locale: AppLocale): string {
  if (!Number.isFinite(value)) return "—";
  const fixed = value.toFixed(4);
  return locale === "en" ? fixed : fixed.replace(".", ",");
}

function formatUnits(value: number, locale: AppLocale): string {
  if (!Number.isFinite(value)) return "—";
  const n = Math.round(value);
  const raw = String(Math.abs(n));
  const grouped = raw.replace(/\\B(?=(\\d{3})+(?!\\d))/g, locale === "en" ? "," : "\\u00a0");
  return n < 0 ? \`-\${grouped}\` : grouped;
}`;

if (!s.includes(oldPrice)) {
  console.error("pattern not found");
  process.exit(1);
}
s = s.replace(oldPrice, nextPrice);
// drop unused intl import if only used by these
if (!s.includes("intlLocaleFor(")) {
  s = s.replace('import { intlLocaleFor } from "@/lib/i18n/formatters";\\n', "");
}
fs.writeFileSync(p, s, "utf8");
console.log("patched mini-order-book");
