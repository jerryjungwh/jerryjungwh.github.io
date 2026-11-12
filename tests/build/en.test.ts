import { load } from 'cheerio';
import { expect, test } from 'vitest';
import { CASES_EN } from '../../src/data/cases.en';
import { CASE_ORDER, CASE_SLUG } from '../../src/lib/types';
import { allHtml, enPaths, koPaths, read } from './helpers';

test('한국어와 영어의 페이지 짝이 맞다', () => {
  expect(enPaths().sort()).toEqual(koPaths().map((p) => '/en' + p).sort());
  expect(enPaths().length).toBe(9);
});

test('영어 홈: 언어, 제목, 달러 가격, 한국어로 가는 링크', () => {
  const $ = load(read('dist/en/index.html'));
  expect($('html').attr('lang')).toBe('en');
  expect($('title').text()).toContain('SimpleScheduler (Simganpyo)');
  expect($('#what').text()).toContain('$0.99');
  expect($('#what').text()).toContain('$9.99');
  expect($('header a[href="/"]').text()).toContain('한국어');
  expect($('header a[href="/"]').attr('hreflang')).toBe('ko');
  expect($('header a[href="/en/"]').length).toBe(1); // logo → English home
  expect($('header a[href="/en/faq/"]').length).toBe(1);
});

test('영어 홈의 리뷰는 영어 원문이고 출처는 영어로 적는다', () => {
  const $ = load(read('dist/en/index.html'));
  expect($('#reviews blockquote').length).toBeGreaterThan(0);
  $('#reviews blockquote').each((_, b) => expect($(b).text()).not.toMatch(/[가-힣]/));
  $('#reviews figcaption').each((_, f) => expect($(f).text().trim()).toMatch(/^Google Play review · [A-Z][a-z]+ \d{4}$/));
});

test('영어 페이지 본문의 한글은 언어 전환 링크와 앱의 한국어 이름뿐이다', () => {
  for (const p of allHtml().filter((x) => x.lang === 'en')) {
    const body = p.$('body').clone();
    body.find('[lang="ko"], script, style').remove();
    const korean = (body.text().match(/[가-힣]+/g) ?? []).filter((word) => word !== '심간표');
    expect(korean, p.path).toEqual([]);
    expect(p.$('time[datetime]').first().text(), p.path).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
  }
});

test('영어 사례 페이지: 영어 글, 영어 주소로 가는 링크, 출처 꼬리표', () => {
  for (const c of CASE_ORDER) {
    const def = CASES_EN.find((x) => x.id === c)!;
    const $ = load(read(`dist/en/for/${CASE_SLUG[c]}/index.html`));
    expect($('html').attr('lang')).toBe('en');
    expect($('h1').text()).toContain(def.h1[0]);
    for (const s of def.steps) expect($('[data-stepper]').text(), s.id).toContain(s.long);
    expect($('nav[aria-label="You are here"] a[href="/en/"]').length).toBe(1);
    expect($('#more a').map((_, a) => $(a).attr('href')).get()).toEqual(
      CASE_ORDER.filter((x) => x !== c).map((x) => `/en/for/${CASE_SLUG[x]}/`),
    );
    const play = $('a[data-track="store_click"][data-store="google_play"]').first().attr('href')!;
    expect(decodeURIComponent(play)).toContain(`utm_campaign=site_en_for_${CASE_SLUG[c]}`);
    expect($('link[rel="alternate"][hreflang="ko"]').attr('href')).toBe(`https://simganpyo.com/for/${CASE_SLUG[c]}/`);
  }
});

test('영어 홈의 단계형 사례: 여섯 사례, 임시 화면 안내도 영어', () => {
  const $ = load(read('dist/en/index.html'));
  expect($('[data-stepper] article[data-case]').length).toBe(6);
  expect($('[data-stepper] button[data-track="case_select"]').map((_, b) => $(b).text().trim()).get()).toEqual(CASES_EN.map((c) => c.tab));
  expect($('[data-stepper]').text()).toContain('Screens are from the Android app');
  expect($('[data-action="toggle-pause"]').attr('data-label-resume')).toBe('Resume auto-advance');
});

test('llms.txt에 영어 절과 영어 주소가 있다', () => {
  const llms = read('dist/llms.txt');
  expect(llms).toContain('# SimpleScheduler (Simganpyo)');
  for (const path of enPaths()) expect(llms, path).toContain(`https://simganpyo.com${path}`);
  expect(decodeURIComponent(llms)).toContain('utm_campaign=site_en_llms_txt');
});
