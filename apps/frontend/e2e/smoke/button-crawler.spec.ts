/**
 * Safe button/action crawler — discovers and exercises non-destructive controls.
 * FINANCIAL / DESTRUCTIVE actions are classified and skipped with reason.
 */
import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

type Manifest = { routes: string[] };

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

function loadRoutes(): string[] {
  const candidates = [
    path.resolve(__dirname, "../../../../tmp-route-manifest.json"),
    path.resolve(process.cwd(), "tmp-route-manifest.json"),
    path.resolve(process.cwd(), "../../tmp-route-manifest.json"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const m = JSON.parse(fs.readFileSync(p, "utf8")) as Manifest;
      return [...new Set(m.routes.map(normalizeRoute).filter((r) => !r.includes("[")))];
    }
  }
  return ["/", "/catalog", "/login", "/terms", "/privacy", "/fees", "/news", "/trust", "/admin/login"];
}

const DANGEROUS =
  /delete|remove|destroy|withdraw|sell|buy|purchase|submit|confirm|approve|reject|pay|transfer|logout|sign.?out|disable|ban|freeze|suspend/i;

type ActionClass =
  | "NAVIGATION"
  | "READ_ONLY"
  | "MODAL"
  | "FILTER"
  | "TAB"
  | "MUTATION_SKIP"
  | "EXTERNAL";

function classify(el: { tag: string; role: string; type: string; text: string; href: string }): ActionClass {
  const blob = `${el.text} ${el.href} ${el.type} ${el.role}`.toLowerCase();
  if (el.href?.startsWith("http") && !el.href.includes("127.0.0.1") && !el.href.includes("localhost")) {
    return "EXTERNAL";
  }
  if (DANGEROUS.test(blob) || el.type === "submit") return "MUTATION_SKIP";
  if (el.role === "tab" || /tab/i.test(el.text)) return "TAB";
  if (/filter|sort|page/i.test(blob)) return "FILTER";
  if (el.tag === "a" || el.href) return "NAVIGATION";
  return "READ_ONLY";
}

async function discover(page: Page) {
  return page.evaluate(() => {
    const nodes = Array.from(
      document.querySelectorAll(
        'button, a[href], [role="button"], [role="tab"], [role="menuitem"], input[type="submit"]',
      ),
    );
    return nodes.slice(0, 80).map((n, i) => {
      const el = n as HTMLElement;
      const tag = el.tagName.toLowerCase();
      const role = el.getAttribute("role") || "";
      const type = (el.getAttribute("type") || "").toLowerCase();
      const text = (el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 80);
      const href = (el as HTMLAnchorElement).href || el.getAttribute("href") || "";
      return { i, tag, role, type, text, href };
    });
  });
}

const summary = { discovered: 0, executed: 0, pass: 0, fail: 0, skip: 0, skips: [] as string[] };

test.describe("Button crawler public pages", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.setTimeout(180_000);

  for (const route of loadRoutes()) {
    test(`actions on ${route}`, async ({ page }) => {
      const pageErrors: string[] = [];
      page.on("pageerror", (e) => pageErrors.push(e.message));
      let res = null as Awaited<ReturnType<Page["goto"]>> | null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          res = await page.goto(route, { waitUntil: "domcontentloaded", timeout: 60_000 });
          break;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (!msg.includes("ERR_CONNECTION_REFUSED") || attempt === 2) throw err;
          await page.waitForTimeout(2_000 * (attempt + 1));
        }
      }
      expect(res?.status() ?? 500).toBeLessThan(500);
      await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);

      const actions = await discover(page);
      summary.discovered += actions.length;

      for (const a of actions) {
        const cls = classify(a);
        if (cls === "MUTATION_SKIP" || cls === "EXTERNAL") {
          summary.skip += 1;
          summary.skips.push(`${route} :: ${cls} :: ${a.text || a.href}`);
          continue;
        }
        summary.executed += 1;
        try {
          const locator = page.locator('button, a[href], [role="button"], [role="tab"], [role="menuitem"]').nth(a.i);
          if (!(await locator.isVisible().catch(() => false))) {
            summary.skip += 1;
            continue;
          }
          const before = page.url();
          const clicked = await locator
            .click({ timeout: 2_500, force: false })
            .then(() => true)
            .catch(async () =>
              locator
                .click({ timeout: 1_500, force: true })
                .then(() => true)
                .catch(() => false),
            );
          if (!clicked) {
            summary.skip += 1;
            summary.skips.push(`${route} :: CLICK_SKIP :: ${a.text || a.href || a.i}`);
            continue;
          }
          await page.waitForTimeout(200);
          if (cls === "NAVIGATION" && page.url() !== before) {
            await page.goto(route, { waitUntil: "domcontentloaded", timeout: 45_000 }).catch(() => undefined);
          }
          const hard = pageErrors.filter(
            (m) =>
              !m.includes("Hydration failed") &&
              m !== "Not Found" &&
              !m.includes("Router action dispatched before initialization") &&
              !m.includes("Clipboard") &&
              !m.includes("writeText"),
          );
          expect(hard, hard.join("; ")).toEqual([]);
          pageErrors.length = 0;
          summary.pass += 1;
        } catch (err) {
          summary.fail += 1;
          throw err;
        }
      }
    });
  }

  test("button crawler summary", async () => {
    // eslint-disable-next-line no-console
    console.log("BUTTON_CRAWLER_SUMMARY", JSON.stringify(summary, null, 2));
    expect(summary.discovered).toBeGreaterThan(0);
  });
});