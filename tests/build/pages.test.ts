import { load } from 'cheerio';
import { expect, test } from 'vitest';
import { CASES_KO } from '../../src/data/cases.ko';
import { FAQ_KO } from '../../src/data/faq.ko';
import { SITE_EN } from '../../src/data/site.en';
import { SITE_KO } from '../../src/data/site.ko';
import { findForbidden } from '../../src/lib/forbidden';
import { CASE_ORDER, CASE_SLUG } from '../../src/lib/types';
import { allHtml, read } from './helpers';

for (const c of CASE_ORDER) {
  const slug = CASE_SLUG[c];
  const def = CASES_KO.find((x) => x.id === c)!;

  test(`사례 페이지 /for/${slug}/: 그 사례로 고정한 단계형 사례와 긴 설명`, () => {
    const $ = load(read(`dist/for/${slug}/index.html`));
    expect($('html').attr('lang')).toBe('ko');
    expect($('html').attr('data-start-case')).toBe(c);
    expect($('h1').length).toBe(1);
    expect($('h1').text()).toContain(def.h1[0]);
    expect($('h1').text()).toContain(def.h1[1]);
    expect($('main').text()).toContain(def.intro);
    expect($('[data-stepper]').attr('data-fixed-case')).toBe(c);
    expect($('[data-stepper] article[data-case]').length).toBe(1);
    expect($('[data-stepper] button[data-track="case_select"]').length).toBe(0);
    expect($('[data-stepper] figure[data-media]').length).toBe(16);
    const text = $('[data-stepper]').text();
    for (const s of def.steps) {
      expect(text, s.id).toContain(s.title);
      expect(text, s.id).toContain(s.long);
    }
  });

  test(`사례 페이지 /for/${slug}/: 현재 위치, 질문, 다른 사례, 설치`, () => {
    const $ = load(read(`dist/for/${slug}/index.html`));
    expect($('nav[aria-label="현재 위치"] a[href="/"]').length).toBe(1);
    expect($('nav[aria-label="현재 위치"] [aria-current="page"]').text()).toBe(def.name);
    expect($('#faq dt').length).toBeGreaterThanOrEqual(3);
    for (const f of def.faq) expect($('#faq').text()).toContain(f.a);
    const others = CASE_ORDER.filter((x) => x !== c).map((x) => `/for/${CASE_SLUG[x]}/`);
    expect($('#more a').map((_, a) => $(a).attr('href')).get()).toEqual(others);
    const play = $('a[data-track="store_click"][data-store="google_play"]');
    expect(play.length).toBe(2);
    play.each((_, a) => expect(decodeURIComponent($(a).attr('href')!)).toContain(`utm_campaign=site_ko_for_${slug}`));
    expect($('#install').length).toBe(1);
    expect($('main > section[id]').map((_, s) => $(s).attr('id')).get()).toEqual(['cases', 'faq', 'more', 'install']);
  });
}

test('자주 묻는 질문: 주제별로 묶은 질문이 열여덟 개 이상이고 답을 접지 않는다', () => {
  const $ = load(read('dist/faq/index.html'));
  expect($('h1').length).toBe(1);
  expect($('main dl dt').length).toBeGreaterThanOrEqual(18);
  expect($('main dl dt').length).toBe($('main dl dd').length);
  expect($('details').length).toBe(0);
  expect($('main section[id] > h2').length).toBe(FAQ_KO.length + 1); // groups + install
  for (const g of FAQ_KO) for (const i of g.items) expect($('main').text(), i.q).toContain(i.a);
  expect($('#install').length).toBe(1);
});

test('질문과 답: 주제는 다섯 개, 질문은 겹치지 않고, 쓰지 않기로 한 말이 없다', () => {
  expect(FAQ_KO.length).toBe(5);
  const questions = FAQ_KO.flatMap((g) => g.items.map((i) => i.q));
  expect(new Set(questions).size).toBe(questions.length);
  for (const q of questions) expect(q.endsWith('?'), q).toBe(true);
  expect(findForbidden(JSON.stringify(FAQ_KO), 'ko')).toEqual([]);
  expect(FAQ_KO.flatMap((g) => g.items).filter((i) => i.home).length).toBe(5);
});

test('소개: 정의문, 한눈에 보기 표, 이야기, 만든 사람, 문의', () => {
  const $ = load(read('dist/about/index.html'));
  expect($('h1').length).toBe(1);
  expect($('main').text()).toContain('심간표(SimpleScheduler)는 매주 반복되는 수업과 학원 일정을 주간 시간표로 만들고');
  expect($('main dl dt').length).toBeGreaterThanOrEqual(9);
  expect($('main').text()).toContain('2017년');
  expect($('main a[href="mailto:jerryjung2929@gmail.com"]').length).toBe(1);
  expect($('#install').length).toBe(1);
});

test('404: 홈으로 가는 링크가 있고 검색에 넣지 않는다', () => {
  const $ = load(read('dist/404.html'));
  expect($('a[href="/"]').length).toBeGreaterThan(0);
  expect($('meta[name="robots"]').attr('content')).toContain('noindex');
  expect($('link[rel="canonical"]').length).toBe(0);
  expect($('h1').length).toBe(1);
});

test('모든 페이지에 「최근 업데이트」 날짜와 머리글·바닥글이 있다', () => {
  const pages = allHtml();
  const ko = ['/', '/about/', '/faq/', ...CASE_ORDER.map((c) => `/for/${CASE_SLUG[c]}/`)];
  expect(pages.map((p) => p.path).sort()).toEqual([...ko, ...ko.map((path) => '/en' + path)].sort());
  for (const p of pages) {
    expect(p.$('footer time[datetime]').length, p.path).toBe(1);
    expect(p.$('header a[href="#install"]').length, p.path).toBe(1);
    expect(p.$('#install').length, p.path).toBe(1);
    expect(p.$('h1').length, p.path).toBe(1);
  }
});

test('CSS 없이 읽어도 제목 두 줄과 링크 목록의 낱말이 붙지 않는다', () => {
  for (const c of CASE_ORDER) {
    const def = CASES_KO.find((x) => x.id === c)!;
    const $ = load(read(`dist/for/${CASE_SLUG[c]}/index.html`));
    expect($('h1').text().replace(/\s+/g, ' ').trim()).toBe(`${def.h1[0]} ${def.h1[1]}`);
  }
  const home = load(read('dist/index.html'));
  expect(home('h1').text().replace(/\s+/g, ' ').trim()).toBe('시간표 앱 심간표 수업도 과제도 홈 화면에서 바로');
  expect(home('#what dt').last().text()).toBe('페이지 최근 업데이트');
  expect(home('footer').text()).toContain('정우현(Jerry Jung)');
  const first = home('#by-case li').first().text().replace(/\s+/g, ' ').trim();
  expect(first).toBe('초등학교 시간표 40분 수업과 준비물을 부모가 아이 대신 챙겨요.');
  const en = load(read('dist/en/for/university/index.html'));
  expect(en('h1').text().replace(/\s+/g, ' ').trim()).toBe('College class schedule Rooms and assignments on one page');
});

test('자주 묻는 질문 머리의 심간이는 말없이 집중한다', () => {
  for (const file of ['dist/faq/index.html', 'dist/en/faq/index.html']) {
    const $p = load(read(file));
    expect($p('.guide[data-guide="focus"]').length, file).toBe(1);
    expect($p('.guide-bubble').length, file).toBe(0);
  }
});

test('소개 머리의 심간이가 한마디 한다', () => {
  for (const [file, line] of [['dist/about/index.html', SITE_KO.guide.about], ['dist/en/about/index.html', SITE_EN.guide.about]]) {
    expect(load(read(file))('.guide[data-guide="basic"] .guide-bubble').text().trim(), file).toBe(line);
  }
});

test('404의 심간이는 놀란 얼굴로 제목과 같은 말을 한다', () => {
  expect(load(read('dist/404.html'))('.guide[data-guide="oops"] .guide-bubble').text().trim()).toBe(SITE_KO.notFound.h1);
});

test('사례 밖 심간이는 한 페이지에 2개 이하', () => {
  for (const p of allHtml()) expect(p.$('.guide').filter((_, g) => p.$(g).closest('[data-stepper]').length === 0).length, p.path).toBeLessThanOrEqual(2);
});
