import { expect, test } from 'vitest';
import { CASES_EN } from '../../src/data/cases.en';
import { CASES_KO } from '../../src/data/cases.ko';
import { allHtml } from './helpers';

const pages = allHtml().filter((p) => p.$('[data-stepper]').length > 0);
const lineOf = (lang: 'ko' | 'en', id: string) => (lang === 'ko' ? CASES_KO : CASES_EN).find((c) => c.id === id)!.guideLine;

test('사례마다 심간이가 하나씩, 장식으로 있다', () => {
  expect(pages.length).toBeGreaterThan(0);
  for (const p of pages)
    p.$('article[data-case]').each((_, a) => {
      const guides = p.$(a).find('.guide');
      expect(guides.length, `${p.path} ${p.$(a).attr('data-case')}`).toBe(1);
      expect(guides.attr('data-guide')).toBe('done');
      expect(guides.attr('aria-hidden')).toBe('true');
      expect(guides.find('img').attr('alt')).toBe('');
      expect(guides.find('img').attr('src')).toMatch(/guide-done/);
    });
});

test('말풍선은 그 사례의 문구다', () => {
  for (const p of pages)
    p.$('article[data-case]').each((_, a) => {
      const id = p.$(a).attr('data-case')!;
      expect(p.$(a).find('.guide .guide-bubble').text().trim(), `${p.path} ${id}`).toBe(lineOf(p.lang, id));
    });
});

test('말풍선 글이 제목에 들어가지 않는다', () => {
  for (const p of pages) {
    const headings = p.$('h1, h2, h3, h4').text();
    for (const c of p.lang === 'ko' ? CASES_KO : CASES_EN) expect(headings.includes(c.guideLine), `${p.path} ${c.id}`).toBe(false);
  }
});
