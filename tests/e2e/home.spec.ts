import { expect, test, type Page } from '@playwright/test';

type Box = { x: number; y: number; width: number; height: number };
const overlap = (a: Box, b: Box) =>
  Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
const box = async (page: Page, sel: string) => (await page.locator(sel).first().boundingBox())!;

for (const [width, path] of [[1440, '/'], [1440, '/en/'], [960, '/'], [768, '/'], [768, '/en/'], [390, '/']] as const) {
  test(`어떤 앱 절: 정의 문단은 제목 바로 아래에 있고 심간이에 가리지 않는다 (${width}px ${path})`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    const h2 = await box(page, '#what > h2');
    const gap = (await box(page, '#what .definition')).y - (h2.y + h2.height);
    expect(gap, 'gap under the heading').toBeGreaterThanOrEqual(16);
    expect(gap, 'gap under the heading').toBeLessThanOrEqual(48);
    // Headings and paragraphs are full-width blocks: what must stay clear is their text.
    const text = (sel: string) =>
      page.locator(sel).first().evaluate((el) => {
        const r = document.createRange();
        r.selectNodeContents(el);
        return [...r.getClientRects()].map((q) => ({ x: q.x, y: q.y, width: q.width, height: q.height }));
      });
    const solids = [...(await text('#what > h2')), ...(await text('#what .definition')), await box(page, '#what .facts-heading'), await box(page, '#what .facts')];
    const shapes = [await box(page, '#what .guide img')];
    if (await page.locator('#what .guide-bubble:visible').count()) shapes.push(await box(page, '#what .guide-bubble'));
    for (const shape of shapes) for (const solid of solids) expect(overlap(shape, solid)).toBe(0);
  });
}

for (const width of [960, 1024, 1100, 1280, 1440]) {
  test(`영어 홈 제목은 낱말 중간에서 줄을 바꾸지 않는다 (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/en/');
    const broken = await page.locator('.home-h1').evaluate((h1) => {
      const out: string[] = [];
      for (const span of h1.querySelectorAll('span')) {
        const text = span.firstChild!;
        for (const m of text.textContent!.matchAll(/\S+/g)) {
          const r = document.createRange();
          r.setStart(text, m.index!);
          r.setEnd(text, m.index! + m[0].length);
          if (new Set([...r.getClientRects()].map((q) => Math.round(q.top))).size > 1) out.push(m[0]);
        }
      }
      return out;
    });
    expect(broken).toEqual([]);
  });
}
