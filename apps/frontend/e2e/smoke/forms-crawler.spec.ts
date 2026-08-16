/**
 * Forms crawler — inventory + empty/invalid probes on public and auth pages.
 * Destructive/financial submits are skipped (covered by financial e2e suites).
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
  return ["/", "/catalog", "/login", "/register", "/terms", "/fees", "/news", "/admin/login"];
}

const DANGEROUS_ACTION =
  /withdraw|sell|buy|purchase|transfer|delete|approve|reject|freeze|ban|pay|broadcast/i;

type FormRow = {
  route: string;
  action: string;
  method: string;
  fields: number;
  classification: "SAFE_PROBE" | "AUTH" | "MUTATION_SKIP" | "READ_ONLY";
};

const inventory: FormRow[] = [];
const summary = {
  forms: 0,
  emptyProbed: 0,
  invalidProbed: 0,
  pass: 0,
  fail: 0,
  skip: 0,
  skips: [] as string[],
};

async function discoverForms(page: Page, route: string): Promise<FormRow[]> {
  return page.evaluate((r) => {
    const forms = Array.from(document.querySelectorAll("form"));
    return forms.map((f) => {
      const action = f.getAttribute("action") || "";
      const method = (f.getAttribute("method") || "get").toLowerCase();
      const fields = f.querySelectorAll("input, select, textarea").length;
      const blob = `${action} ${f.id} ${f.className} ${f.innerText}`.slice(0, 200).toLowerCase();
      let classification: FormRow["classification"] = "SAFE_PROBE";
      if (/login|sign.?in|register|sign.?up|password|otp|2fa|verify/.test(blob)) classification = "AUTH";
      if (/withdraw|sell|buy|purchase|transfer|delete|approve|reject/.test(blob)) {
        classification = "MUTATION_SKIP";
      }
      if (method === "get" && fields === 0) classification = "READ_ONLY";
      return { route: r, action, method, fields, classification };
    });
  }, route);
}

async function probeEmpty(page: Page, formIndex: number): Promise<void> {
  const form = page.locator("form").nth(formIndex);
  if (!(await form.count())) return;
  const submit = form.locator('button[type="submit"], input[type="submit"]').first();
  if (!(await submit.count())) return;
  await submit.click({ timeout: 3_000 }).catch(() => undefined);
  await page.waitForTimeout(300);
}

async function probeInvalid(page: Page, formIndex: number): Promise<void> {
  const form = page.locator("form").nth(formIndex);
  if (!(await form.count())) return;
  const email = form.locator('input[type="email"], input[name*="email" i]').first();
  if (await email.count()) {
    await email.fill("not-an-email");
  }
  const text = form.locator('input[type="text"], input[type="password"]').first();
  if (await text.count()) {
    await text.fill("x");
  }
  const submit = form.locator('button[type="submit"], input[type="submit"]').first();
  if (await submit.count()) {
    await submit.click({ timeout: 3_000 }).catch(() => undefined);
  }
  await page.waitForTimeout(300);
}

test.describe("Forms crawler", () => {
  test.describe.configure({ mode: 'serial' });
  test.use({ viewport: { width: 1440, height: 900 } });
  test.setTimeout(180_000);

  const preferred = loadRoutes().filter((r) => {
    return (
      /login|register|forgot|reset|contact|support|profile|settings|fees|catalog|news|help|legal|terms|privacy|admin\/login/i.test(
        r,
      ) || r === "/"
    );
  });

  for (const route of preferred.slice(0, 40)) {
    test(`forms on ${route}`, async ({ page }) => {
      const pageErrors: string[] = [];
      page.on("pageerror", (e) => pageErrors.push(e.message));
      const res = await page.goto(route, { waitUntil: "domcontentloaded", timeout: 60_000 });
      expect(res?.status() ?? 500).toBeLessThan(500);
      await page.waitForLoadState("networkidle", { timeout: 12_000 }).catch(() => undefined);
      // Client components may hydrate after networkidle
      await page.waitForSelector("form, input[type='email'], input[type='password']", { timeout: 5_000 }).catch(() => undefined);

      const forms = await discoverForms(page, route);
      summary.forms += forms.length;
      inventory.push(...forms);

      for (let i = 0; i < forms.length; i++) {
        const f = forms[i];
        if (f.classification === "MUTATION_SKIP" || DANGEROUS_ACTION.test(f.action)) {
          summary.skip += 1;
          summary.skips.push(`${route} :: MUTATION_SKIP :: fields=${f.fields}`);
          continue;
        }
        if (f.classification === "READ_ONLY") {
          summary.skip += 1;
          continue;
        }

        try {
          await probeEmpty(page, i);
          summary.emptyProbed += 1;
          await page.goto(route, { waitUntil: "domcontentloaded", timeout: 45_000 }).catch(() => undefined);
          await probeInvalid(page, i);
          summary.invalidProbed += 1;

          const hard = pageErrors.filter(
            (m) =>
              !m.includes("Hydration failed") &&
              m !== "Not Found" &&
              !m.includes("Router action dispatched before initialization"),
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

  test("forms crawler summary", async () => {
    // eslint-disable-next-line no-console
    console.log("FORMS_CRAWLER_SUMMARY", JSON.stringify({ ...summary, inventoryCount: inventory.length }, null, 2));
    expect(summary.fail).toBe(0);
    expect(summary.forms).toBeGreaterThan(0);
  });
});