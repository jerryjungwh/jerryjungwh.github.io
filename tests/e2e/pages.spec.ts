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

const ALL_PAGES = [...KO_PAGES, ...KO_PAGES.map((path) => '/en' + path)];

for (const path of ALL_PAGES) {
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

test('영어 홈의 단계형 사례가 움직이고 한국어 링크는 한국어 홈으로 간다', async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.5;
  });
  await page.clock.install();
  await page.goto('/en/');
  await expect(page.locator('[data-stepper][data-ready]')).toHaveCount(1);
  await expect(page.locator('article[data-case="university"]')).toBeVisible();
  const pause = page.locator('[data-action="toggle-pause"]');
  await expect(pause).toHaveText('Pause auto-advance');
  await page.clock.runFor(5200);
  await expect(page.locator('article[data-case]:visible li[data-step][data-active]')).toHaveAttribute('data-step', 'fill');
  await pause.click();
  await expect(pause).toHaveText('Resume auto-advance');
  await page.locator('header a[hreflang="ko"]').click();
  await expect(page).toHaveURL(/localhost:4321\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
});

test('영어 사례 페이지에서 한국어로 바꾸면 같은 사례의 한국어 페이지로 간다', async ({ page }) => {
  await page.goto('/en/for/after-school/');
  await page.locator('header a[hreflang="ko"]').click();
  await expect(page).toHaveURL(/\/for\/after-school\/$/);
  await expect(page.locator('h1')).toContainText('아이 학원 시간표');
});

test('휴대폰 폭의 사례 페이지는 화면과 그 단계 하나만 한 화면에 함께 보인다', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/for/university/');
  await expect(page.locator('[data-stepper][data-ready]')).toHaveCount(1);
  await page.locator('[data-action="toggle-pause"]').click();
  await expect(page.locator('article[data-case] li[data-step]:visible')).toHaveCount(1);
  const text = page.locator('li[data-step][data-active] .step-text');
  expect((await text.boundingBox())!.width).toBeGreaterThanOrEqual(240);
  // The last step is one press away, and its screen is still above it.
  await page.locator('[data-action="step-prev"]').click();
  await expect(page.locator('li[data-step="lock_screen"]')).toHaveAttribute('data-active', '');
  await page.locator('[data-stepper] .case-screens').scrollIntoViewIfNeeded();
  // The screen is cut off at the bottom, so what must be on view is the stage, not the whole capture.
  await expect(page.locator('figure[data-step="lock_screen"][data-device="phone"]')).toBeVisible();
  await expect(page.locator('[data-stepper] article[data-case] .case-screens')).toBeInViewport({ ratio: 0.9 });
  await expect(page.locator('li[data-step="lock_screen"] .step-title')).toBeInViewport();
});

test('휴대폰 폭 사례 페이지에서도 화면의 크게 보기로 창을 연다', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/for/university/');
  await expect(page.locator('[data-stepper][data-ready]')).toHaveCount(1);
  await page.locator('[data-action="toggle-pause"]').click();
  await page.locator('[data-stepper] .case-screens').scrollIntoViewIfNeeded();
  const zoom = page.locator('figure[data-media][data-active]:visible button[data-action="zoom"]');
  await expect(zoom).toBeInViewport();
  await zoom.click();
  await expect(page.locator('dialog[data-zoom]')).toHaveAttribute('open', '');
});
