import { expect, test } from 'vitest';
import { MAX_TICK_MS, initialState, reduce, stepDurationMs } from '../../src/lib/stepper-state';

const d = { cases: 6, steps: 8, fixedCase: false };
const s0 = initialState(2, false);
const tick = (dtMs: number) => ({ type: 'tick', dtMs, stepDurationMs: 5000 }) as const;

test('5초가 지나면 다음 단계로 넘어간다', () => {
  let s = s0;
  for (let i = 0; i < 20; i++) s = reduce(s, tick(250), d);
  expect([s.caseIndex, s.stepIndex, s.elapsedMs]).toEqual([2, 1, 0]);
});

test('마지막 단계 뒤에는 다음 사례의 첫 단계로, 마지막 사례 뒤에는 첫 사례로 간다', () => {
  expect(reduce({ ...s0, stepIndex: 7, elapsedMs: 4900 }, tick(250), d)).toMatchObject({ caseIndex: 3, stepIndex: 0, elapsedMs: 0 });
  expect(reduce({ ...s0, caseIndex: 5, stepIndex: 7, elapsedMs: 4900 }, tick(250), d)).toMatchObject({ caseIndex: 0, stepIndex: 0, elapsedMs: 0 });
});

test('사례 페이지(고정)에서는 같은 사례의 첫 단계로 돌아간다', () => {
  expect(reduce({ ...s0, stepIndex: 7, elapsedMs: 4900 }, tick(250), { ...d, fixedCase: true })).toMatchObject({ caseIndex: 2, stepIndex: 0 });
});

test('단계를 눌러도 자동 넘김은 계속된다', () => {
  expect(reduce({ ...s0, elapsedMs: 3000 }, { type: 'selectStep', stepIndex: 4 }, d)).toMatchObject({ stepIndex: 4, elapsedMs: 0, paused: false });
});

test('사례를 누르면 그 사례의 첫 단계에서 시작한다', () => {
  expect(reduce({ ...s0, stepIndex: 5 }, { type: 'selectCase', caseIndex: 4 }, d)).toMatchObject({ caseIndex: 4, stepIndex: 0, elapsedMs: 0 });
});

test('멈추면 시간이 흐르지 않고, 다시 켜면 흐른다', () => {
  const p = reduce(s0, { type: 'togglePause' }, d);
  expect(p.paused).toBe(true);
  expect(reduce(p, tick(250), d).elapsedMs).toBe(0);
  expect(reduce(reduce(p, { type: 'togglePause' }, d), tick(250), d).elapsedMs).toBe(250);
});

test('탭이 뒤에 있다 돌아와도 한 번에 MAX_TICK_MS까지만 흐른다', () => {
  expect(MAX_TICK_MS).toBe(250);
  expect(reduce(s0, tick(60000), d)).toMatchObject({ stepIndex: 0, elapsedMs: 250 });
});

test('기기를 바꿔도 단계와 시간은 그대로다', () => {
  expect(reduce({ ...s0, stepIndex: 3, elapsedMs: 1200 }, { type: 'setDevice', device: 'tablet' }, d)).toMatchObject({ stepIndex: 3, elapsedMs: 1200, device: 'tablet' });
});

test('범위를 벗어난 단계·사례 번호는 무시한다', () => {
  expect(reduce(s0, { type: 'selectStep', stepIndex: 8 }, d)).toEqual(s0);
  expect(reduce(s0, { type: 'selectCase', caseIndex: -1 }, d)).toEqual(s0);
});

test('reduce는 입력 상태를 바꾸지 않는다', () => {
  const before = { ...s0 };
  reduce(s0, tick(250), d);
  expect(s0).toEqual(before);
});

test('단계에 머무는 시간', () => {
  const frame = { src: 'a', alt: 'a' };
  expect(stepDurationMs({ kind: 'image', src: 'a', alt: 'a' })).toBe(5000);
  expect(stepDurationMs({ kind: 'sequence', frameMs: 700, frames: [frame, frame, frame, frame] })).toBe(4 * 700 + 2500);
  expect(stepDurationMs({ kind: 'sequence', frameMs: 2500, frames: [frame, frame, frame] })).toBe(3 * 2500);
  expect(stepDurationMs({ kind: 'video', src: 'a', poster: 'p', alt: 'a', durationMs: 9000 })).toBe(9000 + 1500);
});

test('이어 보기는 경과 시간으로 보일 장을 고르고 마지막 장에서 머문다', async () => {
  const { sequenceFrameIndex } = await import('../../src/lib/stepper-state');
  expect(sequenceFrameIndex(4, 700, 0)).toBe(0);
  expect(sequenceFrameIndex(4, 700, 699)).toBe(0);
  expect(sequenceFrameIndex(4, 700, 700)).toBe(1);
  expect(sequenceFrameIndex(4, 700, 2800)).toBe(3);
  expect(sequenceFrameIndex(4, 700, 5000)).toBe(3);
});

test('긴 설명이 붙은 단계는 읽을 시간만큼 더 머문다', async () => {
  const { stepStayMs } = await import('../../src/lib/stepper-state');
  const image = { kind: 'image', src: 'a', alt: 'a' } as const;
  // 짧은 글은 화면 길이(5초)를 그대로 쓴다
  expect(stepStayMs(image, '짧은 글')).toBe(5000);
  // 100자는 2초 + 100 × 60ms = 8초
  expect(stepStayMs(image, '가'.repeat(100))).toBe(8000);
  // 화면이 더 길면 화면 길이를 쓴다
  const long = { kind: 'sequence', frameMs: 2500, frames: [1, 2, 3, 4].map(() => ({ src: 'a', alt: 'a' })) } as const;
  expect(stepStayMs(long, '가'.repeat(100))).toBe(10000);
});

test('멈춘 채로 이어 보기를 손으로 넘기면 다음 장으로 가고, 마지막 장 뒤에는 첫 장으로 돌아간다', async () => {
  const { sequenceFrameIndex } = await import('../../src/lib/stepper-state');
  let s = { ...initialState(0, true), stepIndex: 5 };
  const next = { type: 'nextFrame', frames: 3, frameMs: 2500 } as const;
  s = reduce(s, next, d);
  expect(sequenceFrameIndex(3, 2500, s.elapsedMs)).toBe(1);
  s = reduce(s, next, d);
  expect(sequenceFrameIndex(3, 2500, s.elapsedMs)).toBe(2);
  s = reduce(s, next, d);
  expect(sequenceFrameIndex(3, 2500, s.elapsedMs)).toBe(0);
  expect(s.stepIndex).toBe(5);
  expect(s.paused).toBe(true);
});
