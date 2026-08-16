const fs = require("fs");
const files = [
  "d:/Projects/spliton/apps/backend/scripts/seed-calculator-release.ts",
  "d:/Projects/spliton/apps/backend/src/modules/admin-updates/admin-updates.service.ts",
];
for (const f of files) {
  const buf = fs.readFileSync(f);
  if (buf[1] === 0) {
    fs.writeFileSync(f, buf.toString("utf16le"), "utf8");
    console.log("fixed", f);
  } else {
    console.log("ok", f);
  }
}
