import { expect, test } from '@playwright/test';

const KO_PAGES = [
  '/',
  '/for/elementary-school/',
  '/for/middle-school/',
  '/for/high-school/',
  '/for/university/',
  '/for/after-school/',
  '/for/lessons/',
  '/faq/',
  '/about/',
];

for (const path of KO_PAGES) {
  test(`${path} 는 360px에서 가로로 넘치지 않는다`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('사례 페이지는 그 사례에서 시작하고 마지막 단계 뒤 첫 단계로 돌아간다', async ({ page }) => {
  await page.clock.install();
  await page.goto('/for/middle-school/');
  await expect(page.locator('[data-stepper][data-ready]')).toHaveCount(1);
  await expect(page.locator('html')).toHaveAttribute('data-start-case', 'middle_school');
  await expect(page.locator('article[data-case="middle_school"]')).toBeVisible();
  const steps = page.locator('article[data-case]:visible li[data-step] button');
  await steps.nth(7).click();
  await expect(steps.nth(7)).toHaveAttribute('aria-current', 'step');
  await page.clock.runFor(30000);
  await expect(page.locator('article[data-case="middle_school"]')).toBeVisible();
  await expect(steps.nth(7)).toHaveAttribute('aria-current', 'false');
});

test('사례 페이지의 긴 설명은 5초보다 오래 머문다', async ({ page }) => {
  await page.clock.install();
  await page.goto('/for/university/');
  await expect(page.locator('[data-stepper][data-ready]')).toHaveCount(1);
  const steps = page.locator('article[data-case]:visible li[data-step] button');
  await steps.nth(2).click();
  await page.clock.runFor(5500);
  await expect(steps.nth(2)).toHaveAttribute('aria-current', 'step');
});

test('머리글의 「앱 받기」는 같은 페이지의 설치 영역으로 간다', async ({ page }) => {
  await page.goto('/faq/');
  await page.locator('header a[href="#install"]').click();
  await expect(page).toHaveURL(/\/faq\/#install$/);
  await expect(page.locator('#install')).toBeInViewport();
});

test('없는 주소는 안내 페이지를 보인다', async ({ page }) => {
  const response = await page.goto('/no-such-page/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('main a[href="/"]')).toBeVisible();
});
