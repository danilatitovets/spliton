const fs = require("fs");
const path = require("path");

const out = path.join(__dirname, "release-nav-stress.cjs");
const body = String.raw`const { chromium } = require("playwright");
const { writeFileSync } = require("fs");
const { resolve } = require("path");

const BASE = (process.env.PLAYWRIGHT_BASE_URL || "https://www.spliton.io").replace(/\/$/, "");

const CYCLE = [
  "/app",
  "/catalog",
  "/analytics/releases",
  "/dashboard/secondary-market",
  "/fees",
  "/news",
  "/trust",
  "/system-status",
  "/assets/calculator",
  "/login",
  "/register",
];

async function discoverReleaseIds(page) {
  await page.goto(BASE + "/catalog", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1500);
  return page.evaluate(() => {
    const hrefs = [...document.querySelectorAll('a[href*="/analytics/releases/"], a[href*="/catalog/"]')]
      .map((a) => a.getAttribute("href") || "")
      .filter(Boolean);
    const uuids = [];
    const re = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    for (const h of hrefs) {
      const m = h.match(re);
      if (m) uuids.push(m[0]);
    }
    return [...new Set(uuids)].slice(0, 6);
  });
}

function sampleStats(rows) {
  if (!rows.length) return null;
  const ms = rows.map((r) => r.ms);
  const pick = (n) => rows[Math.min(n, rows.length - 1)];
  return {
    n: rows.length,
    first: pick(0).ms,
    mid: pick(Math.floor(rows.length / 2)).ms,
    last: pick(rows.length - 1).ms,
    min: Math.min(...ms),
    max: Math.max(...ms),
    avg: Math.round(ms.reduce((a, b) => a + b, 0) / ms.length),
  };
}

async function countApis(page, pathName) {
  const seen = [];
  const handler = (req) => {
    const u = req.url();
    if (u.includes("/api/")) seen.push(u.replace(/^https?:\/\/[^/]+/, ""));
  };
  page.on("request", handler);
  try {
    await page.goto(BASE + pathName, { waitUntil: "networkidle", timeout: 90000 });
  } catch {
    await page.goto(BASE + pathName, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(2500);
  }
  page.off("request", handler);
  const counts = {};
  for (const u of seen) {
    const key = u.split("?")[0];
    counts[key] = (counts[key] || 0) + 1;
  }
  return { total: seen.length, byPath: counts };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: "ru-RU",
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push({ text: msg.text(), url: page.url() });
  });
  page.on("pageerror", (err) => pageErrors.push({ message: err.message, url: page.url() }));
  page.on("response", (res) => {
    if (res.status() >= 500) failedRequests.push({ url: res.url(), status: res.status(), page: page.url() });
  });

  const releaseIds = await discoverReleaseIds(page);
  console.log("releaseIds", releaseIds);

  const actions = [];
  for (let i = 0; i < 8; i++) {
    for (const p of CYCLE) actions.push({ type: "goto", path: p });
    for (const id of releaseIds.slice(0, 2)) {
      actions.push({ type: "goto", path: "/analytics/releases/" + id });
      actions.push({ type: "goto", path: "/catalog/buy/" + id });
      actions.push({ type: "back" });
      actions.push({ type: "forward" });
    }
    actions.push({ type: "goto", path: "/dashboard/secondary-market" });
    actions.push({ type: "reload" });
    actions.push({ type: "goto", path: "/catalog" });
  }
  while (actions.length > 110) actions.pop();
  while (actions.length < 100) {
    actions.push({ type: "goto", path: CYCLE[actions.length % CYCLE.length] });
  }

  const timings = [];
  const catalogSamples = [];
  const releaseSamples = [];
  const marketSamples = [];

  for (let i = 0; i < actions.length; i++) {
    const a = actions[i];
    const t0 = Date.now();
    let pathName = a.path || page.url();
    let status = 0;
    try {
      if (a.type === "goto") {
        const r = await page.goto(BASE + a.path, { waitUntil: "domcontentloaded", timeout: 90000 });
        status = r ? r.status() : 0;
        pathName = a.path;
      } else if (a.type === "back") {
        await page.goBack({ waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => null);
        pathName = new URL(page.url()).pathname;
      } else if (a.type === "forward") {
        await page.goForward({ waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => null);
        pathName = new URL(page.url()).pathname;
      } else if (a.type === "reload") {
        const r = await page.reload({ waitUntil: "domcontentloaded", timeout: 90000 });
        status = r ? r.status() : 0;
        pathName = new URL(page.url()).pathname;
      }
      await page.waitForTimeout(120);
    } catch (e) {
      console.error("action", i, "failed", e.message);
      timings.push({ i: i, type: a.type, path: pathName, ms: Date.now() - t0, status: 0, error: e.message });
      continue;
    }
    const ms = Date.now() - t0;
    const row = { i: i, type: a.type, path: pathName, ms: ms, status: status };
    timings.push(row);
    if (pathName.indexOf("/catalog") >= 0 && pathName.indexOf("/buy") < 0) catalogSamples.push(row);
    if (pathName.indexOf("/analytics/releases/") >= 0) releaseSamples.push(row);
    if (pathName.indexOf("/secondary-market") >= 0) marketSamples.push(row);
    if ((i + 1) % 10 === 0) console.log("nav " + (i + 1) + "/" + actions.length + " last=" + ms + "ms " + pathName);
  }

  await page.setViewportSize({ width: 375, height: 812 });
  const mobile = [];
  for (const p of ["/app", "/catalog", "/dashboard/secondary-market", "/login"]) {
    const t0 = Date.now();
    const r = await page.goto(BASE + p, { waitUntil: "domcontentloaded", timeout: 90000 });
    mobile.push({ path: p, ms: Date.now() - t0, status: r ? r.status() : 0 });
  }

  const requestCounts = {};
  for (const p of ["/catalog", "/dashboard/secondary-market", "/app", "/login"]) {
    requestCounts[p] = await countApis(page, p);
  }
  if (releaseIds[0]) {
    requestCounts["/analytics/releases/:id"] = await countApis(page, "/analytics/releases/" + releaseIds[0]);
    requestCounts["/catalog/buy/:id"] = await countApis(page, "/catalog/buy/" + releaseIds[0]);
  }

  const report = {
    base: BASE,
    actions: actions.length,
    releaseIds: releaseIds,
    catalog: sampleStats(catalogSamples),
    release: sampleStats(releaseSamples),
    market: sampleStats(marketSamples),
    all: sampleStats(timings),
    earlyVsLate: {
      catalog: {
        first3: catalogSamples.slice(0, 3).map((r) => r.ms),
        last3: catalogSamples.slice(-3).map((r) => r.ms),
      },
      release: {
        first3: releaseSamples.slice(0, 3).map((r) => r.ms),
        last3: releaseSamples.slice(-3).map((r) => r.ms),
      },
    },
    mobile: mobile,
    requestCounts: requestCounts,
    consoleErrors: consoleErrors.slice(0, 50),
    pageErrors: pageErrors.slice(0, 50),
    failedRequests: failedRequests.slice(0, 50),
    consoleErrorCount: consoleErrors.length,
    pageErrorCount: pageErrors.length,
    failed5xxCount: failedRequests.length,
  };

  const outPath = resolve(__dirname, "../../../PERFORMANCE_NAV_STRESS.json");
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  console.log("wrote " + outPath);
  await browser.close();
  if (pageErrors.length || failedRequests.length) process.exitCode = 2;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
`;

fs.writeFileSync(out, body, "utf8");
console.log("generated", out);
