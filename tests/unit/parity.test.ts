import { expect, test } from 'vitest';
import { CASES_EN } from '../../src/data/cases.en';
import { CASES_KO } from '../../src/data/cases.ko';
import { FAQ_EN } from '../../src/data/faq.en';
import { FAQ_KO } from '../../src/data/faq.ko';
import { SITE_EN } from '../../src/data/site.en';
import { SITE_KO } from '../../src/data/site.ko';
import { findForbidden } from '../../src/lib/forbidden';
import { appJsonLd, pageMeta } from '../../src/lib/seo';
import { CASE_ORDER, type PageKey } from '../../src/lib/types';

/** Key paths of an object, so two languages can be compared field by field. */
function shape(value: unknown, path = ''): string[] {
  if (Array.isArray(value)) return [`${path}[${value.length}]`];
  if (value && typeof value === 'object')
    return Object.keys(value)
      .sort()
      .flatMap((k) => shape((value as Record<string, unknown>)[k], `${path}.${k}`));
  return [`${path}:${typeof value}`];
}

test('영어 사례는 한국어와 틀이 같다: 사례 6, 단계 8, 질문 수', () => {
  expect(CASES_EN.map((c) => c.id)).toEqual(CASES_KO.map((c) => c.id));
  CASES_EN.forEach((c, i) => {
    expect(c.steps.map((s) => s.id), c.id).toEqual(CASES_KO[i].steps.map((s) => s.id));
    expect(c.faq.length, c.id).toBe(CASES_KO[i].faq.length);
    expect(c.h1.length, c.id).toBe(2);
  });
});

test('영어 사례 이름은 정한 표 그대로다', () => {
  expect(CASES_EN.map((c) => c.name)).toEqual([
    'Elementary school timetable',
    'Middle school timetable',
    'High school timetable',
    'College class schedule',
    'Kids’ activities schedule',
    'Lessons & personal schedule',
  ]);
});

test('영어 단계 글: 제목 40자, 한 문장 130자 이하, 긴 설명이 더 길고, 한글이 없다', () => {
  for (const c of CASES_EN) {
    expect(c.tab.length, c.id).toBeLessThanOrEqual(c.name.length);
    expect(new Set(c.steps.map((s) => s.title)).size, c.id).toBe(c.steps.length);
    for (const s of c.steps) {
      expect(s.title.length, `${c.id}/${s.id} title`).toBeLessThanOrEqual(40);
      expect(s.short.length, `${c.id}/${s.id} short`).toBeLessThanOrEqual(130);
      expect(s.long.length, `${c.id}/${s.id}`).toBeGreaterThan(s.short.length);
    }
    expect(JSON.stringify(c), c.id).not.toMatch(/[가-힣]/);
    for (const f of c.faq) expect(f.q.endsWith('?'), f.q).toBe(true);
  }
});

test('영어 문구는 한국어와 같은 항목을 모두 갖고 있다', () => {
  // Array lengths may differ where the content differs by language (reviews).
  const strip = (paths: string[]) => paths.map((p) => p.replace(/^(\.reviews\.(?:items|shipped\.reviews))\[\d+\]$/, '$1[]'));
  expect(strip(shape(SITE_EN))).toEqual(strip(shape(SITE_KO)));
  expect(Object.keys(SITE_EN.byCase.blurbs).sort()).toEqual([...CASE_ORDER].sort());
});

test('영어 질문은 한국어와 주제·질문 수·홈 표시가 같다', () => {
  expect(FAQ_EN.map((g) => g.id)).toEqual(FAQ_KO.map((g) => g.id));
  FAQ_EN.forEach((g, i) => {
    expect(g.items.length, g.id).toBe(FAQ_KO[i].items.length);
    expect(g.items.map((x) => Boolean(x.home)), g.id).toEqual(FAQ_KO[i].items.map((x) => Boolean(x.home)));
    for (const item of g.items) expect(item.q.endsWith('?'), item.q).toBe(true);
  });
  expect(JSON.stringify(FAQ_EN)).not.toMatch(/[가-힣]/);
});

test('영어 글에 쓰지 않기로 한 말이 없다', () => {
  for (const c of CASES_EN) expect(findForbidden(JSON.stringify(c), 'en'), c.id).toEqual([]);
  expect(findForbidden(JSON.stringify(FAQ_EN), 'en')).toEqual([]);
  expect(findForbidden(JSON.stringify(SITE_EN), 'en')).toEqual([]);
});

test('영어 가격은 달러이고 리뷰는 영어 원문뿐이다', () => {
  const price = SITE_EN.what.facts.map((f) => f.desc).join(' ');
  expect(price).toContain('$0.99');
  expect(price).toContain('$9.99');
  expect(price).toContain('November 2026');
  expect(SITE_EN.reviews.items.length).toBeGreaterThan(0);
  for (const r of SITE_EN.reviews.items) expect(r.text).not.toMatch(/[가-힣]/);
  expect(SITE_EN.reviews.caption(2026, 8)).toBe('Google Play review · August 2026');
  expect(SITE_EN.what.formatDate('2026-11-12')).toBe('November 12, 2026');
});

test('영어 제목에는 「SimpleScheduler (Simganpyo)」가 들어가고 페이지마다 다르다', () => {
  const pages: PageKey[] = ['home', 'faq', 'about', ...CASE_ORDER.map((c) => `for_${c}` as const)];
  const metas = pages.map((p) => pageMeta('en', p));
  expect(pageMeta('en', 'home').title).toBe('SimpleScheduler (Simganpyo) - Timetable app for classes, homework and widgets');
  expect(new Set(metas.map((m) => m.title)).size).toBe(pages.length);
  for (const m of metas) {
    expect(m.title, m.title).toContain('SimpleScheduler (Simganpyo)');
    expect(m.title.length, m.title).toBeLessThanOrEqual(80);
    expect(m.description.length, m.title).toBeGreaterThan(60);
    expect(m.description.length, m.title).toBeLessThanOrEqual(200);
  }
});

test('영어 앱 정보의 다른 이름에 한국어 이름이 들어간다', () => {
  const app = appJsonLd('en') as { name: string; alternateName: string[]; offers: { priceCurrency: string } };
  expect(app.name).toBe('SimpleScheduler');
  expect(app.alternateName).toEqual(['심간표', '심플시간표', 'Simganpyo']);
  expect(app.offers.priceCurrency).toBe('USD');
});
