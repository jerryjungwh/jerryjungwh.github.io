import { load } from 'cheerio';
import { expect, test } from 'vitest';
import { SITE_KO } from '../../src/data/site.ko';
import { APP_STORE_URL } from '../../src/lib/urls';
import { CASE_ORDER, CASE_SLUG } from '../../src/lib/types';
import { read } from './helpers';

const $ = load(read('dist/index.html'));

test('머리글: 로고, 자주 묻는 질문, English, 앱 받기', () => {
  expect($('header a[href="/"]').length).toBe(1);
  expect($('header a[href="/faq/"]').length).toBe(1);
  expect($('header a[href="/en/"]').text()).toContain('English');
  expect($('header a[href="/en/"]').attr('hreflang')).toBe('en');
});

test('「앱 받기」는 스토어 링크가 아니라 설치 영역으로 내려간다', () => {
  const getApp = $('header a[href="#install"]');
  expect(getApp.length).toBe(1);
  expect(getApp.attr('data-track')).toBeUndefined();
  expect($('#install').length).toBe(1);
});

test('Google Play 링크는 진짜 링크이고 이름표와 고정 id가 있다', () => {
  const play = $('a[data-track="store_click"][data-store="google_play"]');
  expect(play.length).toBe(2); // hero, page_end
  expect(play.map((_, a) => $(a).attr('id')).get().sort()).toEqual(['cta-play-hero', 'cta-play-page_end']);
  play.each((_, a) => {
    expect($(a).attr('href')).toContain('https://play.google.com/store/apps/details?id=com.jjsoft.android.simplescheduler');
    expect($(a).attr('href')).toContain('referrer=');
    expect(decodeURIComponent($(a).attr('href')!)).toContain(`utm_content=home.${$(a).attr('data-cta')}`);
    expect($(a).attr('id')).toBe(`cta-play-${$(a).attr('data-cta')}`);
  });
});

test('App Store 링크도 진짜 링크이고 준비 중이라는 안내가 붙는다', () => {
  const ios = $('a[data-track="store_click"][data-store="app_store"]');
  expect(ios.length).toBe(2);
  ios.each((_, a) => expect($(a).attr('href')).toBe(APP_STORE_URL));
  expect($('body').text()).toContain('iPhone 앱은 새 버전을 준비하고 있어요. 지금 버전은 Android 앱보다 기능이 적어요.');
  expect($('body').text()).toContain('Android 앱 화면이에요');
});

test('문서형 절이 정해진 순서로 있고 절마다 제목이 있다', () => {
  expect($('main > section[id]').map((_, s) => $(s).attr('id')).get()).toEqual(['cases', 'what', 'by-case', 'reviews', 'faq', 'install']);
  for (const id of ['what', 'by-case', 'reviews', 'faq', 'install']) expect($(`#${id} > h2, #${id} > * > h2`).length, id).toBe(1);
  expect($('h1').length).toBe(1);
});

test('정의문과 한눈에 보기 표가 있고 가격 문구는 정해진 그대로다', () => {
  expect($('#what').text()).toContain('심간표(SimpleScheduler)는 매주 반복되는 수업과 학원 일정을 주간 시간표로 만들고');
  expect($('#what dl dt').length).toBeGreaterThanOrEqual(9);
  expect($('#what dl dt').length).toBe($('#what dl dd').length);
  expect($('#what').text()).toContain(
    '월 1,500원, 연 14,900원이고 7일 무료 체험이 있어요(2026년 11월 기준, 실제 가격은 Google Play 표시를 따릅니다)',
  );
});

test('「최근 업데이트」가 날짜와 함께 보인다', () => {
  const time = $('#what time[datetime]');
  expect(time.length).toBe(1);
  expect(time.attr('datetime')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(time.text()).toMatch(/^\d{4}년 \d{1,2}월 \d{1,2}일$/);
});

test('사례별로 자세히: 사례 페이지 여섯 개로 가는 링크', () => {
  expect($('#by-case a').map((_, a) => $(a).attr('href')).get()).toEqual(CASE_ORDER.map((c) => `/for/${CASE_SLUG[c]}/`));
});

test('리뷰에는 출처와 연월이 있고 작성자 이름이 없다', () => {
  const r = SITE_KO.reviews;
  expect($('#reviews figure').length).toBe(r.items.length + r.shipped.groups.reduce((n, g) => n + g.reviews.length, 0));
  $('#reviews figure').each((_, f) => {
    expect($(f).find('blockquote').text().trim().length).toBeGreaterThan(10);
    expect($(f).find('figcaption').text().trim()).toMatch(/^Google Play 리뷰 · \d{4}년 \d{1,2}월$/);
  });
});

test('리뷰 절은 답글 수로 시작하고, 건의 리뷰 묶음마다 반영 글이 하나씩 붙는다', () => {
  const { lead, shipped } = SITE_KO.reviews;
  expect($('#reviews .doc-text').text().trim()).toBe(lead);
  expect($('#reviews h3').length).toBe(1);
  expect($('#reviews h3').text().trim()).toBe(shipped.heading);
  const groups = $('#reviews .shipped-group');
  expect(groups.length).toBe(shipped.groups.length);
  groups.each((i, el) => {
    const data = shipped.groups[i];
    expect($(el).find('figure').length, data.note).toBe(data.reviews.length);
    expect($(el).find('.shipped-note').length, data.note).toBe(1);
    // Read as plain text: the label and the note stay separate words without styles.
    const note = $(el).find('.shipped-note').text().replace(/\s+/g, ' ').trim();
    expect(note).toBe(`${shipped.label} ${data.note}`);
  });
  // The note is the site speaking, not a quote.
  expect($('#reviews .shipped-note blockquote, #reviews blockquote .shipped-note').length).toBe(0);
});

test('자주 묻는 질문은 답을 펼친 목록이고 전체 보기 링크가 있다', () => {
  const count = $('#faq dl dt').length;
  expect(count).toBeGreaterThanOrEqual(4);
  expect(count).toBeLessThanOrEqual(5);
  expect($('#faq dl dd').length).toBe(count);
  expect($('#faq details').length).toBe(0);
  expect($('#faq a[href="/faq/"]').length).toBe(1);
});

test('바닥글: 사례 6, 질문, 소개, 정책 두 주소, 문의, 언어 전환', () => {
  for (const c of CASE_ORDER) expect($(`footer a[href="/for/${CASE_SLUG[c]}/"]`).length, c).toBe(1);
  expect($('footer a[href="/faq/"]').length).toBe(1);
  expect($('footer a[href="/about/"]').length).toBe(1);
  expect($('footer a[href="https://simganpyo.com/SimpleScheduler-Android/"]').length).toBe(1);
  expect($('footer a[href="https://simganpyo.com/SimpleScheduler-Android/terms"]').length).toBe(1);
  expect($('footer a[href="mailto:jerryjung2929@gmail.com"]').length).toBe(1);
  expect($('footer a[href="/en/"]').length).toBe(1);
});

test('앱 아이콘이 파비콘이다 (Astro 기본 그림이 아니다)', () => {
  expect($('link[rel="icon"]').attr('href')).toMatch(/\.png$/);
  expect($('link[rel="apple-touch-icon"]').length).toBe(1);
});
