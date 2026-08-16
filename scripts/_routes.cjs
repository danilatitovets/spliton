const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const APP = path.join(ROOT, "apps", "frontend", "app");

function walk(dir, rel = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    if (e.name.startsWith(".") || e.name === "api") continue;
    const full = path.join(dir, e.name);
    const nextRel = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) {
      out.push(...walk(full, nextRel));
    } else if (/^page\.(tsx|ts|jsx|js|mdx)$/.test(e.name)) {
      out.push(rel || "");
    }
  }
  return out;
}

function toUrl(rel) {
  let s = String(rel).replace(/\\/g, "/");
  s = s
    .split("/")
    .filter((seg) => !(seg.startsWith("(") && seg.endsWith(")")))
    .filter((seg) => !seg.startsWith("@"))
    .join("/");
  if (!s) return "/";
  return "/" + s.replace(/\/+/g, "/").replace(/\/$/, "");
}

const raw = walk(APP);
const urls = [...new Set(raw.map(toUrl))].sort((a, b) => a.localeCompare(b));
const admin = urls.filter((u) => u === "/admin" || u.startsWith("/admin/"));
const user = urls.filter((u) => !(u === "/admin" || u.startsWith("/admin/")));
const dynamic = urls.filter((u) => u.includes("["));

const manifest = {
  total: urls.length,
  adminCount: admin.length,
  userCount: user.length,
  dynamicCount: dynamic.length,
  routes: urls,
  admin,
  user,
  dynamic,
  generatedAt: new Date().toISOString(),
};

fs.writeFileSync(path.join(ROOT, "tmp-route-manifest.json"), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({
  total: urls.length,
  admin: admin.length,
  user: user.length,
  dynamic: dynamic.length,
  sampleAdmin: admin.slice(0, 8),
  sampleUser: user.slice(0, 8),
}, null, 2));