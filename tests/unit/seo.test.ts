import { expect, test } from 'vitest';
import { CASES_KO } from '../../src/data/cases.ko';
import { appJsonLd, breadcrumbJsonLd, faqJsonLd, pageMeta, webSiteJsonLd } from '../../src/lib/seo';
import { CASE_ORDER, type PageKey } from '../../src/lib/types';
import { APP_STORE_URL, PLAY_URL, machinePlayUrl } from '../../src/lib/urls';

const PAGES: PageKey[] = ['home', 'faq', 'about', ...CASE_ORDER.map((c) => `for_${c}` as const)];

test('페이지마다 제목과 설명이 다르고 길이가 알맞다', () => {
  const metas = PAGES.map((p) => pageMeta('ko', p));
  expect(new Set(metas.map((m) => m.title)).size).toBe(PAGES.length);
  expect(new Set(metas.map((m) => m.description)).size).toBe(PAGES.length);
  for (const m of metas) {
    expect(m.title.length, m.title).toBeLessThanOrEqual(45);
    expect(m.title, m.title).toContain('심간표');
    expect(m.description.length, m.title).toBeGreaterThan(40);
    expect(m.description.length, m.title).toBeLessThanOrEqual(120);
  }
});

test('홈 제목은 정한 초안이고 사례 페이지 제목은 「〈사례 이름〉 만들기 - 심간표」다', () => {
  expect(pageMeta('ko', 'home').title).toBe('심간표 - 시간표 앱 | 학교·학원 시간표, 과제, 위젯');
  for (const c of CASES_KO) expect(pageMeta('ko', `for_${c.id}`).title).toBe(`${c.name} 만들기 - 심간표`);
});

test('앱 정보는 Android 앱 기준이고 별점이 없다', () => {
  const app = appJsonLd('ko') as Record<string, unknown>;
  expect(app['@type']).toBe('MobileApplication');
  expect(app.name).toBe('심간표');
  expect(app.alternateName).toEqual(['심플시간표', 'SimpleScheduler', 'Simganpyo']);
  expect(app.operatingSystem).toBe('Android 7.0');
  expect(app.sameAs).toEqual([PLAY_URL, APP_STORE_URL]);
  expect(app.installUrl).toBe(machinePlayUrl('ko', 'jsonld'));
  expect(String(app.installUrl)).toContain(encodeURIComponent('utm_source=jsonld'));
  expect(app.offers).toMatchObject({ '@type': 'Offer', price: '0', priceCurrency: 'KRW' });
  expect(app.author).toMatchObject({ '@type': 'Person', name: 'Jerry Jung' });
  expect(app.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(JSON.stringify(app)).not.toMatch(/aggregateRating|ratingValue|review/i);
});

test('사이트 정보에는 이름과 주소, 언어가 있다', () => {
  expect(webSiteJsonLd('ko')).toMatchObject({ '@type': 'WebSite', name: '심간표', url: 'https://simganpyo.com/', inLanguage: 'ko' });
});

test('현재 위치는 홈에서 그 페이지까지다', () => {
  const crumbs = breadcrumbJsonLd('ko', 'for_middle_school') as { itemListElement: { position: number; name: string; item: string }[] };
  expect(crumbs.itemListElement).toEqual([
    { '@type': 'ListItem', position: 1, name: '심간표', item: 'https://simganpyo.com/' },
    { '@type': 'ListItem', position: 2, name: '중학교 시간표', item: 'https://simganpyo.com/for/middle-school/' },
  ]);
  expect((breadcrumbJsonLd('ko', 'faq') as typeof crumbs).itemListElement[1].name).toBe('자주 묻는 질문');
});

test('질문과 답은 받은 글 그대로 들어간다', () => {
  const data = faqJsonLd([{ q: '무료인가요?', a: '네. 무료예요.' }]) as { mainEntity: unknown[] };
  expect(data.mainEntity).toEqual([
    { '@type': 'Question', name: '무료인가요?', acceptedAnswer: { '@type': 'Answer', text: '네. 무료예요.' } },
  ]);
});

test('기계가 읽는 자리의 Play 주소는 출처를 따로 적는다', () => {
  expect(decodeURIComponent(machinePlayUrl('ko', 'llms_txt'))).toContain('utm_source=llms_txt&utm_medium=web&utm_campaign=site_ko_llms_txt');
  expect(decodeURIComponent(machinePlayUrl('en', 'jsonld'))).toContain('utm_source=jsonld&utm_medium=web&utm_campaign=site_en_jsonld');
});
