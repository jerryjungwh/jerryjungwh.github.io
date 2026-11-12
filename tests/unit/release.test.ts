import { expect, test } from 'vitest';
import { robotsFor } from '../../src/lib/release';

test('배포용 빌드의 페이지는 검색에 열려 있다', () => {
  expect(robotsFor({ release: true, notFound: false })).toBeUndefined();
});

test('시험 주소용 빌드는 모든 페이지를 검색에서 뺀다', () => {
  expect(robotsFor({ release: false, notFound: false })).toBe('noindex');
});

test('404는 언제나 검색에서 뺀다', () => {
  expect(robotsFor({ release: true, notFound: true })).toBe('noindex');
  expect(robotsFor({ release: false, notFound: true })).toBe('noindex');
});
