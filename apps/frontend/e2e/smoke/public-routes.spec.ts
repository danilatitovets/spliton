import { test, expect } from '@playwright/test';

import { ROUTES } from '../../constants/routes';

test.describe('Public smoke', () => {
  test('login page renders', async ({ page }) => {
    await page.goto(ROUTES.login);
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 }).or(page.getByRole('main'))).toBeVisible();
  });

  test('admin login page renders', async ({ page }) => {
    await page.goto(ROUTES.adminLogin);
    await expect(page.locator('body')).toBeVisible();
  });

  test('guest visiting /admin is redirected to admin login', async ({ page }) => {
    await page.goto(ROUTES.admin);
    await expect(page).toHaveURL(new RegExp(`${ROUTES.adminLogin.replace('/', '\\/')}`), {
      timeout: 30_000,
    });
  });

  test('catalog route responds', async ({ page }) => {
    await page.goto('/dashboard/catalog');
    await expect(page.locator('body')).toBeVisible();
  });

  test('wallet profile route responds', async ({ page }) => {
    await page.goto('/dashboard/profile');
    await expect(page.locator('body')).toBeVisible();
  });

  test('secondary market route responds', async ({ page }) => {
    await page.goto('/dashboard/secondary-market');
    await expect(page.locator('body')).toBeVisible();
  });

  test('assets overview responds', async ({ page }) => {
    await page.goto('/assets');
    await expect(page.locator('body')).toBeVisible();
  });
});

const CYRILLIC = /[А-Яа-яЁё]/;
const LOCALE_COOKIE = 'spliton_locale';

const PUBLIC_EN_ROUTES = [
  ROUTES.home,
  ROUTES.dashboardCatalog,
  ROUTES.catalogMarketOverview,
  ROUTES.support,
  ROUTES.news,
  ROUTES.login,
  ROUTES.myAssetsOverview,
  ROUTES.dashboardPayouts,
  ROUTES.dashboardActivity,
  ROUTES.dashboardSecondaryMarket,
  ROUTES.dashboardProfile,
] as const;

test.describe('EN locale Cyrillic smoke', () => {
  test.beforeEach(async ({ context, baseURL }) => {
    const url = new URL(baseURL ?? 'http://127.0.0.1:3000');
    await context.addCookies([
      {
        name: LOCALE_COOKIE,
        value: 'en',
        domain: url.hostname,
        path: '/',
        secure: url.protocol === 'https:',
        sameSite: 'Lax',
      },
    ]);
  });

  for (const path of PUBLIC_EN_ROUTES) {
    test(`no Cyrillic on ${path}`, async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.setItem('spliton_locale', 'en');
      });
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => undefined);
      // Shell chrome must be English; CMS body copy may still be RU until localized.
      const chrome = page.locator('header, nav, [data-testid="site-footer"], footer').first();
      const text = (await chrome.count())
        ? await page.locator('header, nav, footer').allInnerTexts().then((parts) => parts.join('\n'))
        : await page.locator('body').innerText();
      expect(text, `Cyrillic found in chrome on ${path}`).not.toMatch(CYRILLIC);
    });
  }
});
