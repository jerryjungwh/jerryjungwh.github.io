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

// A block counts only if the page actually paints it: five points inside it must hit the block itself, not a card
// or a screen drawn over it. The decoration ignores the pointer, so it is switched on for the probe only.
const painted = (page: Page) =>
  page.evaluate(() => {
    const blocks = [...document.querySelectorAll<HTMLElement>('.hero-block')];
    const decor = document.querySelector<HTMLElement>('.hero-decor')!;
    decor.style.pointerEvents = 'auto';
    const n = blocks.filter((b) => {
      const r = b.getBoundingClientRect();
      if (!r.width) return false;
      const pts = [[0.5, 0.5], [0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7]];
      return pts.every(([fx, fy]) => {
        const hit = document.elementFromPoint(r.x + r.width * fx, r.y + r.height * fy);
        return hit === b;
      });
    }).length;
    decor.style.pointerEvents = '';
    return n;
  });

for (const [width, count] of [[1440, 6], [1280, 6], [1024, 6], [960, 6], [900, 3], [768, 3], [390, 3]] as const) {
  for (const path of ['/', '/en/']) {
    test(`블록이 실제로 그려진다: ${count}개 (${width}px ${path})`, async ({ page }) => {
      await open(page, width, 1000, path);
      expect(await painted(page)).toBe(count);
    });
  }
}

const SOLID = ['.stepper-tabs button:visible', '.stepper-switch:visible', '.stepper-lead > :not(.hero-decor):visible', 'article[data-case] .case-text:visible', '.case-screens .guide:visible img'];
for (const [width, height] of [[1440, 1000], [1024, 900], [960, 900], [768, 900], [390, 844]] as const) {
  for (const path of ['/', '/en/']) {
    for (const device of ['phone', 'tablet'] as const) {
      test(`블록이 글·버튼·심간이·지금 화면을 가리지 않는다 (${width}px ${path} ${device})`, async ({ page }) => {
        await open(page, width, height, path);
        if (device === 'tablet') await page.locator('button[data-device="tablet"]').first().click();
        const media = (await page.locator('figure[data-media][data-active]:visible .media').first().boundingBox())!;
        // the dark frame is a 7px ring outside the screen
        const frame = { x: media.x - 8, y: media.y - 8, width: media.width + 16, height: media.height + 16 };
        const solids = [frame];
        for (const sel of SOLID) for (const el of await page.locator(sel).all()) solids.push((await el.boundingBox())!);
        for (const block of await page.locator('.hero-block:visible').all()) {
          const b = (await block.boundingBox())!;
          for (const box of solids) expect(overlap(b, box)).toBe(0);
        }
      });
    }
  }
}

// The light fades out before the edges of the section, so no faint rectangle shows against the page.
for (const width of [1440, 768]) {
  test(`첫 화면 빛은 상자 가장자리에서 바탕색이다 (${width}px)`, async ({ page }) => {
    await open(page, width, 900);
    const box = (await page.locator('.stepper').boundingBox())!;
    const png = await page.screenshot({ clip: { x: box.x, y: box.y, width: 400, height: 40 } });
    const px = await page.evaluate(async (b64) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      return [[1, 1], [100, 1]].map(([x, y]) => Array.from(ctx.getImageData(x, y, 1, 1).data.slice(0, 3)));
    }, png.toString('base64'));
    const paper = [0xfb, 0xfb, 0xfe];
    for (const p of px) expect(Math.max(...p.map((v, i) => Math.abs(v - paper[i]))), String(p)).toBeLessThanOrEqual(3);
  });
}
