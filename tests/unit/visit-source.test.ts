import { expect, test } from 'vitest';
import { PLAY_URL, playUrlWith } from '../../src/lib/urls';
import { resolveVisitSource, type VisitContext } from '../../src/lib/visit-source';

const base: VisitContext = {
  hostname: 'simganpyo.com',
  search: '',
  referrer: '',
  lang: 'ko',
  page: 'home',
  stored: null,
};
const at = (over: Partial<VisitContext>): VisitContext => ({ ...base, ...over });

test('주소에 utm_source가 있으면 그 값이 출처이고, 저장된 값을 덮어쓴다', () => {
  const source = resolveVisitSource(
    at({ search: '?utm_source=test_a&utm_medium=social&utm_campaign=test_t1', stored: { s: 'google.com', c: 'site_ko_home' } }),
  );
  expect(source).toEqual({ s: 'test_a', c: 'test_t1' });
});

test('다른 사이트에서 왔으면 호스트 이름이 출처다 (www. 와 m. 은 뗀다)', () => {
  expect(resolveVisitSource(at({ referrer: 'https://www.google.com/search?q=%EC%8B%9C%EA%B0%84%ED%91%9C' })).s).toBe('google.com');
  expect(resolveVisitSource(at({ referrer: 'https://m.search.naver.com/search.naver' })).s).toBe('search.naver.com');
});

test('앱에서 왔으면 패키지 이름이 출처다', () => {
  expect(resolveVisitSource(at({ referrer: 'android-app://com.google.android.googlequicksearchbox/' })).s).toBe('com.google.android.googlequicksearchbox');
});

test('리퍼러가 없으면 noref, 우리 사이트 안에서 왔는데 저장된 값이 없으면 internal이다', () => {
  expect(resolveVisitSource(at({ referrer: '' })).s).toBe('noref');
  expect(resolveVisitSource(at({ referrer: 'https://simganpyo.com/faq/' })).s).toBe('internal');
  expect(resolveVisitSource(at({ referrer: 'https://www.simganpyo.com/faq/' })).s).toBe('internal');
});

test('우리 사이트 안에서 왔고 저장된 값이 있으면 그 값을 그대로 쓴다', () => {
  const stored = { s: 'chatgpt.com', c: 'site_en_for_university' };
  expect(resolveVisitSource(at({ referrer: 'https://simganpyo.com/faq/', stored }))).toEqual(stored);
});

test('캠페인은 주소의 utm_campaign, 없으면 site_<언어>_<들어온 페이지>다', () => {
  expect(resolveVisitSource(at({ referrer: 'https://x.com/', lang: 'en', page: 'for_university' })).c).toBe('site_en_for_university');
  expect(resolveVisitSource(at({ search: '?utm_source=x&utm_campaign=c0001' })).c).toBe('c0001');
});

test('한글이나 기호가 든 값은 걸러 내고, 남는 것이 없으면 invalid다', () => {
  expect(resolveVisitSource(at({ search: '?utm_source=%EB%84%A4%EC%9D%B4%EB%B2%84&utm_campaign=%EA%B0%80%EC%9D%84' }))).toEqual({
    s: 'invalid',
    c: 'invalid',
  });
  expect(resolveVisitSource(at({ search: `?utm_source=${'a'.repeat(80)}` })).s).toHaveLength(60);
});

test('시험 주소 안에서 페이지를 옮겨도 처음 들어온 출처를 잃지 않는다', () => {
  // 「우리 사이트」는 지금 열려 있는 호스트 기준이다. simganpyo.com 기준으로 보면 시험 주소 안의
  // 이동이 바깥에서 온 것으로 보여서, 캠페인이 들어온 값에서 그 페이지 이름으로 바뀌어 버린다.
  const stored = { s: 'test_a', c: 'test_t1' };
  const moved = resolveVisitSource(
    at({ hostname: 'localhost', referrer: 'http://localhost:4321/?utm_source=test_a', page: 'faq', stored }),
  );
  expect(moved).toEqual({ s: 'test_site', c: 'test_t1' });
});

test('simganpyo.com이 아닌 곳에서 만든 주소의 출처는 test_site다', () => {
  expect(resolveVisitSource(at({ hostname: 'localhost', referrer: 'https://www.google.com/' })).s).toBe('test_site');
  expect(resolveVisitSource(at({ hostname: 'jerryjungwh.github.io', search: '?utm_source=naver' })).s).toBe('test_site');
});

test('만들어진 Play 주소는 누른 페이지와 자리를 utm_content에 담는다', () => {
  const url = playUrlWith({ s: 'google.com', c: 'site_ko_home' }, 'faq', 'page_end');
  expect(url.startsWith(`${PLAY_URL}&referrer=`)).toBe(true);
  const referrer = decodeURIComponent(new URL(url).searchParams.get('referrer')!);
  expect(referrer).toBe('utm_source=google.com&utm_medium=web&utm_campaign=site_ko_home&utm_content=faq.page_end');
});
