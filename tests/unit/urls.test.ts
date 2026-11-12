import { expect, test } from 'vitest';
import { absoluteUrl, alternates, pagePath, staticPlayUrl } from '../../src/lib/urls';

test('pagePath는 언어와 페이지로 사이트 경로를 만든다', () => {
  expect(pagePath('ko', 'home')).toBe('/');
  expect(pagePath('en', 'home')).toBe('/en/');
  expect(pagePath('ko', 'for_middle_school')).toBe('/for/middle-school/');
  expect(pagePath('en', 'for_after_school')).toBe('/en/for/after-school/');
  expect(pagePath('ko', 'faq')).toBe('/faq/');
});

test('absoluteUrl은 simganpyo.com 절대 주소를 만든다', () => {
  expect(absoluteUrl('/faq/')).toBe('https://simganpyo.com/faq/');
});

test('alternates의 x-default는 영어 주소다', () => {
  expect(alternates('faq')).toEqual({
    ko: 'https://simganpyo.com/faq/',
    en: 'https://simganpyo.com/en/faq/',
    xDefault: 'https://simganpyo.com/en/faq/',
  });
});

test('staticPlayUrl은 출처가 static인 Play 주소를 만든다', () => {
  const u = new URL(staticPlayUrl('ko', 'for_middle_school', 'hero'));
  expect(u.origin + u.pathname).toBe('https://play.google.com/store/apps/details');
  expect(u.searchParams.get('id')).toBe('com.jjsoft.android.simplescheduler');
  expect(u.searchParams.get('referrer')).toBe(
    'utm_source=static&utm_medium=web&utm_campaign=site_ko_for_middle-school&utm_content=for_middle-school.hero',
  );
  expect(new URL(staticPlayUrl('en', 'home', 'page_end')).searchParams.get('referrer')).toBe(
    'utm_source=static&utm_medium=web&utm_campaign=site_en_home&utm_content=home.page_end',
  );
});

test('staticPlayUrl의 referrer 값은 한 번만 인코딩된다', () => {
  expect(staticPlayUrl('ko', 'home', 'hero')).toBe(
    'https://play.google.com/store/apps/details?id=com.jjsoft.android.simplescheduler&referrer=' +
      encodeURIComponent('utm_source=static&utm_medium=web&utm_campaign=site_ko_home&utm_content=home.hero'),
  );
});
