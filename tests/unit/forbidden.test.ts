import { expect, test } from 'vitest';
import { findForbidden } from '../../src/lib/forbidden';

test('없는 기능을 가리키는 말을 찾는다', () => {
  expect(findForbidden('캘린더처럼 써요', 'ko')).toEqual(['캘린더']);
  expect(findForbidden('Sync across devices', 'en')).toEqual(['sync']);
});

test('16세 미만을 대상 사용자로 적은 문장을 찾는다', () => {
  expect(findForbidden('초등학생은 이렇게 써요', 'ko')).toEqual(['초등학생은']);
  expect(findForbidden('A timetable app for kids', 'en')).toEqual(['for kids']);
});

test('부모가 아이 시간표를 만드는 문장은 걸리지 않는다', () => {
  expect(findForbidden('부모가 초등학생 아이의 시간표를 만들어요', 'ko')).toEqual([]);
  expect(findForbidden("Set up your child's elementary school timetable", 'en')).toEqual([]);
});
