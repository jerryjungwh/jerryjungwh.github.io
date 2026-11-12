import { expect, test } from 'vitest';
import { SITE_EN } from '../../src/data/site.en';
import { SITE_KO } from '../../src/data/site.ko';

const sites = { ko: SITE_KO, en: SITE_EN } as const;

// Jerry, 2026-11-13: the point is that reviews steer the app. The note stays one short sentence.
test('건의 리뷰 묶음마다 리뷰가 있고, 반영 글은 버전·날짜 없는 짧은 한 문장이다', () => {
  for (const [lang, s] of Object.entries(sites)) {
    expect(s.reviews.shipped.groups.length, lang).toBeGreaterThan(0);
    for (const g of s.reviews.shipped.groups) {
      expect(g.reviews.length, g.note).toBeGreaterThan(0);
      expect(Object.keys(g).sort(), g.note).toEqual(['note', 'reviews']);
      expect(g.note, lang).not.toMatch(/\d/);
      expect(g.note.length, g.note).toBeLessThanOrEqual(lang === 'ko' ? 40 : 60);
      expect(g.note.match(/[.!?]/g)?.length, g.note).toBe(1);
    }
  }
});

test('같은 리뷰를 두 번 싣지 않는다', () => {
  for (const [lang, s] of Object.entries(sites)) {
    const texts = [...s.reviews.items, ...s.reviews.shipped.groups.flatMap((g) => g.reviews)].map((r) => r.text);
    expect(new Set(texts).size, lang).toBe(texts.length);
  }
});

test('영어판의 건의 리뷰와 반영 글에는 한글이 없다', () => {
  expect(JSON.stringify(SITE_EN.reviews)).not.toMatch(/[가-힣]/);
});
