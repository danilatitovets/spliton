/**
 * Full App Router page crawl — desktop 1440x900 + mobile 390x844.
 * Discovers routes from tmp-route-manifest.json (generated) or built-in list.
 * Dynamic segments use env fixtures (CRAWL_*) or hardcoded safe placeholders.
 */
import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

type Manifest = {
  total: number;
  routes: string[];
  admin: string[];
  user: string[];
  dynamic: string[];
};

function normalizeRoute(route: string): string {
  return (
    route
      .replace(/\\/g, "/")
      .split("/")
      .filter((seg) => !(seg.startsWith("(") && seg.endsWith(")")))
      .join("/")
      .replace(/\/+/g, "/")
      .replace(/\/$/, "") || "/"
  );
}

function loadManifest(): Manifest {
  const candidates = [
    path.resolve(__dirname, "../../../../tmp-route-manifest.json"),
    path.resolve(process.cwd(), "tmp-route-manifest.json"),
    path.resolve(process.cwd(), "../../tmp-route-manifest.json"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const raw = JSON.parse(fs.readFileSync(p, "utf8")) as Manifest;
      return {
        ...raw,
        routes: raw.routes.map(normalizeRoute),
        admin: (raw.admin || []).map(normalizeRoute),
        user: (raw.user || []).map(normalizeRoute),
        dynamic: (raw.dynamic || []).map(normalizeRoute),
        total: raw.routes.map(normalizeRoute).length,
      };
    }
  }
  throw new Error("tmp-route-manifest.json missing — run scripts/_routes.cjs from repo root");
}

const FIX = {
  releaseId:
    process.env.CRAWL_RELEASE_ID ?? "93850e74-1cff-4911-9213-ffc87d86604c",
  releaseSlug: process.env.CRAWL_RELEASE_SLUG ?? "e2e-cmp-list-1781617706875",
  listingId: process.env.CRAWL_LISTING_ID ?? "56fc4ceb-207d-4caf-a4ed-0bc1bad5f11c",
  newsSlug: process.env.CRAWL_NEWS_SLUG ?? "live-1780530995291",
  helpSlug: process.env.CRAWL_HELP_SLUG ?? "revenue-share-payouts-overview",
  helpCatSlug: process.env.CRAWL_HELP_CAT_SLUG ?? "popular-questions",
  userId: process.env.CRAWL_USER_ID ?? "4f743c7c-3b58-48e9-b8fb-f4814caaada1",
  marketId: process.env.CRAWL_MARKET_ID ?? "default",
  policyId: process.env.CRAWL_POLICY_ID ?? "terms_of_service",
  disputeId: process.env.CRAWL_DISPUTE_ID ?? "00000000-0000-4000-8000-000000000001",
  supportId: process.env.CRAWL_SUPPORT_ID ?? "00000000-0000-4000-8000-000000000001",
};

function materialize(route: string): string {
  return normalizeRoute(route)
    .replace("/admin/users/[id]", `/admin/users/${FIX.userId}`)
    .replace("/analytics/releases/[id]", `/analytics/releases/${FIX.releaseId}`)
    .replace("/assets/positions/[id]", `/assets/positions/${FIX.releaseId}`)
    .replace("/assets/sell/[id]", `/assets/sell/${FIX.releaseId}`)
    .replace("/catalog/buy/[id]", `/catalog/buy/${FIX.releaseId}`)
    .replace(
      "/catalog/market-overview/analytics/[id]",
      `/catalog/market-overview/analytics/${FIX.releaseId}`,
    )
    .replace("/dashboard/disputes/[id]", `/dashboard/disputes/${FIX.disputeId}`)
    .replace(
      "/dashboard/profile/legal/[policyId]",
      `/dashboard/profile/legal/${FIX.policyId}`,
    )
    .replace(
      "/dashboard/secondary-market/book/[marketId]",
      `/dashboard/secondary-market/book/${FIX.marketId}`,
    )
    .replace(
      "/dashboard/secondary-market/l/[listingId]",
      `/dashboard/secondary-market/l/${FIX.listingId}`,
    )
    .replace("/dashboard/support/[id]", `/dashboard/support/${FIX.supportId}`)
    .replace("/legal/[type]", "/legal/terms")
    .replace("/news/[slug]", `/news/${FIX.newsSlug}`)
    .replace("/support/articles/[slug]", `/support/articles/${FIX.helpSlug}`)
    .replace("/support/categories/[slug]", `/support/categories/${FIX.helpCatSlug}`);
}

async function crawlPage(page: Page, pathName: string) {
  const pageErrors: string[] = [];
  const failed5xx: string[] = [];

  page.on("pageerror", (err) => pageErrors.push(err.message));
  page.on("response", (res) => {
    if (res.status() >= 500 && (res.url().includes("/api/") || res.url().includes(":4001"))) {
      failed5xx.push(`${res.status()} ${res.url()}`);
    }
  });

  const res = await page.goto(pathName, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForLoadState("networkidle", { timeout: 25_000 }).catch(() => undefined);

  expect(res, `no response for ${pathName}`).toBeTruthy();
  expect(res!.status(), `server error for ${pathName}`).toBeLessThan(500);
  await expect(page.locator("body")).toBeVisible();

  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + 4;
  });
  expect(overflow, `horizontal overflow on ${pathName}`).toBe(false);
  const hardErrors = pageErrors.filter((msg) => {
    if (msg.includes("Hydration failed because the server rendered HTML didn't match")) return false;
    if (msg.includes("Router action dispatched before initialization")) return false;
    if (msg === "Not Found" || msg === "NEXT_NOT_FOUND") return false;
    return true;
  });
  expect(hardErrors, `pageerrors on ${pathName}: ${hardErrors.join("; ")}`).toEqual([]);
  expect(failed5xx, `5xx API on ${pathName}: ${failed5xx.join("; ")}`).toEqual([]);
}

const manifest = loadManifest();
const ALL = [...new Set(manifest.routes.map(materialize))];
const ADMIN = [...new Set(manifest.admin.map(materialize))];
const USER = [...new Set(manifest.user.map(materialize))];

test.describe("Full route crawl desktop 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const pathName of ALL) {
    test(`desktop ${pathName}`, async ({ page }) => {
      await crawlPage(page, pathName);
    });
  }
});

test.describe("Full route crawl mobile 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const pathName of ALL) {
    test(`mobile ${pathName}`, async ({ page }) => {
      await crawlPage(page, pathName);
    });
  }
});

test.describe("Admin routes present in crawl", () => {
  test(`admin route count ${ADMIN.length}`, async () => {
    expect(ADMIN.length).toBeGreaterThanOrEqual(40);
    expect(ADMIN.every((r) => r === "/admin" || r.startsWith("/admin/"))).toBe(true);
    expect(ADMIN.some((r) => r.includes("(") || r.includes("\\"))).toBe(false);
  });
});

test("route manifest counts", async () => {
  expect(ALL.length).toBeGreaterThanOrEqual(100);
  expect(ADMIN.length).toBeGreaterThanOrEqual(40);
  expect(USER.length).toBeGreaterThanOrEqual(50);
});