import { expect, test, type Page } from '@playwright/test';

type Box = { x: number; y: number; width: number; height: number };
const overlap = (a: Box, b: Box) =>
  Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));

async function open(page: Page, width: number, height: number, path = '/') {
  await page.setViewportSize({ width, height });
  await page.addInitScript(() => {
    Math.random = () => 0.5;
  });
  await page.goto(path);
  await expect(page.locator('[data-stepper][data-ready]')).toHaveCount(1);
}

test('블록은 넓은 화면 6개, 폰 너비 3개만 보인다', async ({ page }) => {
  await open(page, 1440, 900);
  await expect(page.locator('.hero-block:visible')).toHaveCount(6);
  await open(page, 390, 844);
  await expect(page.locator('.hero-block:visible')).toHaveCount(3);
});

for (const [width, height] of [[1440, 900], [1024, 800], [390, 844]] as const) {
  for (const path of ['/', '/en/']) {
    test(`블록이 단계 글과 지금 화면을 가리지 않는다 (${width}px ${path})`, async ({ page }) => {
      await open(page, width, height, path);
      const text = (await page.locator('article[data-case] .case-text:visible').first().boundingBox())!;
      const shot = (await page.locator('figure[data-media][data-active]:visible img').first().boundingBox())!;
      for (const block of await page.locator('.hero-block:visible').all()) {
        const b = (await block.boundingBox())!;
        expect(overlap(b, text), 'case text').toBe(0);
        expect(overlap(b, shot), 'screen').toBe(0);
      }
    });
  }
}
