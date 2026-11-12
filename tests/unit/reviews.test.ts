import { expect, test } from 'vitest';
import { SITE_EN } from '../../src/data/site.en';
import { SITE_KO } from '../../src/data/site.ko';

const sites = { ko: SITE_KO, en: SITE_EN } as const;

// Jerry, 2026-11-13: the point is that reviews steer the app. Say it once, above the reviews:
// no note under each review, no reply counts.
test('건의 리뷰 묶음은 제목, 한 번만 하는 말, 리뷰로 되어 있다', () => {
  for (const [lang, s] of Object.entries(sites)) {
    expect(Object.keys(s.reviews).sort(), lang).toEqual(['caption', 'heading', 'items', 'shipped']);
    expect(Object.keys(s.reviews.shipped).sort(), lang).toEqual(['heading', 'intro', 'reviews']);
    expect(s.reviews.shipped.reviews.length, lang).toBeGreaterThan(0);
    expect(s.reviews.shipped.intro, lang).not.toMatch(/\d/);
  }
});

test('같은 리뷰를 두 번 싣지 않는다', () => {
  for (const [lang, s] of Object.entries(sites)) {
    const texts = [...s.reviews.items, ...s.reviews.shipped.reviews].map((r) => r.text);
    expect(new Set(texts).size, lang).toBe(texts.length);
  }
});

test('영어판의 리뷰 절에는 한글이 없다', () => {
  expect(JSON.stringify(SITE_EN.reviews)).not.toMatch(/[가-힣]/);
});
