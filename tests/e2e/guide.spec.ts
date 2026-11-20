import { expect, test, type Page } from '@playwright/test';

type Box = { x: number; y: number; width: number; height: number };
const overlap = (a: Box, b: Box) =>
  Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));

// Math.random() = 0.5 starts the home page at the university case (same as stepper.spec.ts).
async function open(page: Page, width: number, height: number, path = '/') {
  await page.setViewportSize({ width, height });
  await page.addInitScript(() => {
    Math.random = () => 0.5;
  });
  await page.goto(path);
  await expect(page.locator('[data-stepper][data-ready]')).toHaveCount(1);
}
const guide = (page: Page) => page.locator('.case-screens .guide:visible');
const caseText = (page: Page) => page.locator('article[data-case] .case-text:visible').first();

test('보이는 심간이는 하나이고 지금 사례의 말을 한다', async ({ page }) => {
  await open(page, 1440, 900);
  await expect(guide(page)).toHaveCount(1);
  await expect(page.locator('.case-screens .guide-bubble:visible')).toHaveText('이번 학기 시간표, 같이 만들어요');
});

for (const width of [1440, 768]) {
  test(`심간이는 단계 글과 겹치지 않는다 (${width}px)`, async ({ page }) => {
    await open(page, width, 900);
    expect(overlap((await guide(page).boundingBox())!, (await caseText(page).boundingBox())!)).toBe(0);
  });
}

test('en 1024px에서 말풍선이 단계 글과 겹치지 않는다', async ({ page }) => {
  await open(page, 1024, 800, '/en/');
  const bubble = (await page.locator('.case-screens .guide-bubble:visible').boundingBox())!;
  expect(overlap(bubble, (await caseText(page).boundingBox())!)).toBe(0);
});

test('폰 너비에서는 말풍선이 없고 심간이만 있다', async ({ page }) => {
  await open(page, 390, 844);
  await expect(guide(page)).toHaveCount(1);
  await expect(page.locator('.case-screens .guide-bubble:visible')).toHaveCount(0);
});

test('태블릿을 고르면 심간이가 화면을 가리지 않는다', async ({ page }) => {
  await open(page, 1440, 900);
  await page.locator('button[data-device="tablet"]').first().click();
  const shot = (await page.locator('figure[data-media][data-active][data-device="tablet"]:visible img').first().boundingBox())!;
  const g = (await guide(page).locator('img').boundingBox())!;
  expect(overlap(g, shot) / (shot.width * shot.height)).toBeLessThanOrEqual(0.04);
});

test('동작 줄이기에서는 움직이지 않는다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, 1440, 900);
  const name = await guide(page).locator('img').evaluate((img) => getComputedStyle(img).animationName);
  expect(name).toBe('none');
});

for (const [width, height] of [[390, 844], [768, 900]] as const) {
  test(`좁은 너비에서 심간이가 사례 버튼·단계 글·크게 보기를 가리지 않는다 (${width}px)`, async ({ page }) => {
    await open(page, width, height);
    const g = (await guide(page).boundingBox())!;
    for (const sel of ['.stepper-tabs button:visible', 'article[data-case] .case-text:visible', 'figure[data-media][data-active]:visible .media-zoom']) {
      for (const el of await page.locator(sel).all()) expect(overlap(g, (await el.boundingBox())!), sel).toBe(0);
    }
  });
}
