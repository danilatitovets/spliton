const fs = require("fs");
const path = require("path");

const EM = "\u2014";
const roots = ["apps/frontend"];
const exts = new Set([".ts", ".tsx"]);
const skip = /node_modules|\.next|dist|admin\/|features\/admin|services\/admin/;

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (!skip.test(p.replace(/\\/g, "/"))) walk(p, files);
    } else if (exts.has(path.extname(ent.name)) && !skip.test(p.replace(/\\/g, "/"))) {
      files.push(p);
    }
  }
  return files;
}

const importLine = 'import { emptyValueLabel } from "@/lib/analytics/display-value";';
let changed = 0;

for (const file of walk("apps/frontend")) {
  let src = fs.readFileSync(file, "utf8");
  const orig = src;
  if (!src.includes(EM) && !src.includes('return "-"') && !src.includes('?? "-"') && !src.includes(': "-"')) continue;

  src = src.split("'" + EM + "'").join("emptyValueLabel(locale)");
  src = src.split('"' + EM + '"').join("emptyValueLabel(locale)");
  src = src.split('return "-"').join("return emptyValueLabel(locale)");
  src = src.split('?? "-"').join("?? emptyValueLabel(locale)");
  src = src.split(': "-"').join(": emptyValueLabel(locale)");
  src = src.split('>-"<').join(">{emptyValueLabel(locale)}<");

  if (src !== orig) {
    if (!src.includes(importLine) && src.includes("emptyValueLabel(locale)")) {
      const lines = src.split(/\r?\n/);
      let insertAt = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("import ")) insertAt = i + 1;
        else if (insertAt > 0 && !lines[i].startsWith("import ") && lines[i].trim()) break;
      }
      lines.splice(insertAt, 0, importLine);
      src = lines.join("\n");
    }
    fs.writeFileSync(file, src, "utf8");
    changed++;
    console.log(file);
  }
}
console.log("changed", changed);
