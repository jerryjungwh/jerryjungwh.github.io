import { expect, test } from 'vitest';
import { screenCut, screenFocus, screenFocusLabel } from '../../src/lib/screen-focus';
import { CASE_ORDER, STEP_ORDER } from '../../src/lib/types';

test('모든 사례와 단계에 보여 줄 자리가 정해져 있다', () => {
  for (const c of CASE_ORDER)
    for (const s of STEP_ORDER) {
      const { show, at } = screenFocus(c, s);
      expect(show, `${c}/${s} show`).toBeGreaterThan(0);
      expect(show, `${c}/${s} show`).toBeLessThanOrEqual(1);
      expect(at, `${c}/${s} at`).toBeGreaterThanOrEqual(0);
      expect(at, `${c}/${s} at`).toBeLessThanOrEqual(100);
    }
});

test('화면 아래가 요점인 단계는 아래를 보여 준다', () => {
  // 리마인더 시트의 고른 값, 위젯 완료 안내는 화면 맨 아래에 있다.
  expect(screenFocus('university', 'remind')).toEqual({ show: 0.7, at: 100 });
  expect(screenFocus('middle_school', 'widget_done')).toEqual({ show: 0.7, at: 100 });
});

test('To-Do 수정은 제목과 연결된 시간표·일정이 함께 들어가게 창을 넓힌다', () => {
  const todo = screenFocus('elementary_school', 'todo');
  expect(todo.at).toBe(50);
  // 화면 전체(1)보다는 좁게 — 넓히기만 하면 다른 단계만큼 크게 보이지 않는다.
  expect(todo.show).toBeGreaterThan(0.7);
  expect(todo.show).toBeLessThan(1);
});

test('요점이 화면 전체에 퍼진 단계는 통째로 보여 준다', () => {
  for (const step of ['fill', 'widgets', 'lock_screen'] as const)
    expect(screenFocus('middle_school', step).show, step).toBe(1);
});

test('사례마다 다른 단계는 그 사례의 화면에 맞춘다', () => {
  // 대학은 일정 상세 시트, 아이 학원은 시간표 전환 시트 — 둘 다 화면 아래에서 올라온다.
  expect(screenFocus('university', 'unique').at).toBe(100);
  expect(screenFocus('after_school', 'unique').at).toBe(100);
  // 나머지는 배경 사진·토요일 열·저녁 자율학습이라 화면 전체가 필요하다.
  expect(screenFocus('high_school', 'unique').show).toBe(1);
  expect(screenFocus('elementary_school', 'unique').show).toBe(1);
});

test('잘린 쪽만 가장자리를 흐리게 한다', () => {
  expect(screenCut({ show: 1, at: 0 })).toBe('none');
  expect(screenCut({ show: 0.7, at: 0 })).toBe('bottom');
  expect(screenCut({ show: 0.7, at: 100 })).toBe('top');
  expect(screenCut({ show: 0.82, at: 50 })).toBe('both');
});

test('HTML에 적히는 말은 사람이 읽을 수 있다', () => {
  expect(screenFocusLabel({ show: 1, at: 0 })).toBe('whole');
  expect(screenFocusLabel({ show: 0.7, at: 100 })).toBe('70% at 100%');
});
