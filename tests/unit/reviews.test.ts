import { expect, test } from 'vitest';
import { SITE_EN } from '../../src/data/site.en';
import { SITE_KO } from '../../src/data/site.ko';

const sites = { ko: SITE_KO, en: SITE_EN } as const;

test('건의 리뷰 묶음마다 리뷰가 있고, 언제 무엇을 넣었는지 적혀 있다', () => {
  for (const [lang, s] of Object.entries(sites)) {
    expect(s.reviews.shipped.groups.length, lang).toBeGreaterThan(0);
    for (const g of s.reviews.shipped.groups) {
      expect(g.reviews.length, g.note).toBeGreaterThan(0);
      expect(g.when, g.note).toMatch(/20\d\d/);
      expect(g.note.length, g.when).toBeGreaterThan(10);
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
