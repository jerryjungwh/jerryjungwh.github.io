import { expect, test } from 'vitest';
import { assertReleasable, robotsFor } from '../../src/lib/release';

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

test('배포용 빌드는 임시 화면이 남아 있으면 그 목록과 함께 멈춘다', () => {
  expect(() => assertReleasable(['ko/university/phone/create', 'en/lessons/tablet/fill'], true)).toThrow(
    /임시 화면 2개.*ko\/university\/phone\/create/s,
  );
});

test('임시 화면이 없으면 배포용 빌드가 지나가고, 시험 빌드는 임시 화면이 있어도 지나간다', () => {
  expect(() => assertReleasable([], true)).not.toThrow();
  expect(() => assertReleasable(['ko/university/phone/create'], false)).not.toThrow();
});
