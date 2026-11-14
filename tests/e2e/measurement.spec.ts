import { expect, test, type Page } from '@playwright/test';

// The preview server is not simganpyo.com, so every source the site writes here is 'test_site'.
// That is the rule itself (a test host must never look like real traffic); the source picking is
// covered by tests/unit/visit-source.test.ts.
const playHref = (page: Page) => page.locator('a[data-store="google_play"][data-cta]').first();

/** Waits for the script to have made its call, so a 'static' address is never read too early. */
async function referrerOf(page: Page, state: 'on' | 'held' = 'on'): Promise<string> {
  await expect(page.locator('html')).toHaveAttribute('data-measurement', state);
  const href = await playHref(page).getAttribute('href');
  return decodeURIComponent(new URL(href!).searchParams.get('referrer')!);
}

test('페이지가 열리면 Play 링크에 이 방문의 출처가 들어간다', async ({ page }) => {
  await page.goto('/?utm_source=test_a&utm_medium=social&utm_campaign=test_t1');
  await expect(playHref(page)).toHaveAttribute('href', /utm_campaign%3Dtest_t1/);
  expect(await referrerOf(page)).toBe('utm_source=test_site&utm_medium=web&utm_campaign=test_t1&utm_content=home.hero');
});

test('스크립트가 쓰기 전의 기본 주소는 static이고, 모든 Play 링크에 referrer가 있다', async ({ page }) => {
  await page.goto('/faq/');
  const raw = await page.evaluate(async () => {
    const html = await (await fetch(location.href)).text();
    return [...html.matchAll(/href="(https:\/\/play\.google\.com[^"]*)"/g)].map((m) => m[1]);
  });
  expect(raw.length).toBeGreaterThan(0);
  for (const href of raw) expect(decodeURIComponent(href)).toContain('utm_source=static');
});

test('같은 방문 안에서 다음 페이지로 가도 처음 들어온 캠페인을 그대로 쓴다', async ({ page }) => {
  await page.goto('/?utm_source=test_a&utm_campaign=test_t1');
  await page.locator('a[href="/faq/"]').first().click();
  await expect(page).toHaveURL(/\/faq\/$/);
  // The campaign is the one the visit came in with; the content follows the page pressed on.
  const referrer = await referrerOf(page);
  expect(referrer).toContain('utm_campaign=test_t1');
  expect(referrer).toContain('utm_content=faq.');
});

test.describe('유럽에서 온 방문', () => {
  test.use({ timezoneId: 'Europe/Berlin' });

  test('동의하기 전에는 배너를 보이고 출처를 읽지 않는다', async ({ page }) => {
    await page.goto('/?utm_source=test_a&utm_campaign=test_t1');
    await expect(page.locator('[data-consent]')).toBeVisible();
    expect(await referrerOf(page, 'held')).toContain('utm_source=static');
    expect(await page.evaluate(() => sessionStorage.getItem('simganpyo.source'))).toBeNull();
  });

  test('동의하면 배너가 사라지고 그때 출처가 들어간다', async ({ page }) => {
    await page.goto('/?utm_source=test_a&utm_campaign=test_t1');
    await page.locator('[data-consent-choice="granted"]').click();
    await expect(page.locator('[data-consent]')).toBeHidden();
    expect(await referrerOf(page)).toBe('utm_source=test_site&utm_medium=web&utm_campaign=test_t1&utm_content=home.hero');
    expect(await page.evaluate(() => localStorage.getItem('simganpyo.consent'))).toBe('granted');
  });

  test('거부하면 배너만 사라지고 출처는 끝까지 읽지 않는다', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-consent-choice="denied"]').click();
    await expect(page.locator('[data-consent]')).toBeHidden();
    await page.goto('/faq/');
    await expect(page.locator('[data-consent]')).toBeHidden();
    expect(await referrerOf(page, 'held')).toContain('utm_source=static');
  });
});

test('유럽이 아니면 배너를 보이지 않는다', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-consent]')).toBeHidden();
});
