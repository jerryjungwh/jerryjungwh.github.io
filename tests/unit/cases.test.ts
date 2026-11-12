import { expect, test } from 'vitest';
import { CASES_KO } from '../../src/data/cases.ko';
import { findForbidden } from '../../src/lib/forbidden';
import { CASE_ORDER, STEP_ORDER } from '../../src/lib/types';

test('사례 여섯 개가 정해진 순서로 있다', () => {
  expect(CASES_KO.map((c) => c.id)).toEqual([...CASE_ORDER]);
});

test('사례마다 단계 여덟 개가 뼈대 순서로 있다', () => {
  for (const c of CASES_KO) expect(c.steps.map((s) => s.id), c.id).toEqual([...STEP_ORDER]);
});

test('단계 제목은 24자, 한 문장 설명은 70자를 넘지 않는다', () => {
  for (const c of CASES_KO)
    for (const s of c.steps) {
      expect(s.title.length, `${c.id}/${s.id} title`).toBeLessThanOrEqual(24);
      expect(s.short.length, `${c.id}/${s.id} short`).toBeLessThanOrEqual(70);
    }
});

test('긴 설명은 한 문장 설명보다 길고 같은 글이 아니다', () => {
  for (const c of CASES_KO)
    for (const s of c.steps) {
      expect(s.long.length, `${c.id}/${s.id}`).toBeGreaterThan(s.short.length);
      expect(s.long, `${c.id}/${s.id}`).not.toBe(s.short);
    }
});

test('한 사례 안에서 단계 제목이 겹치지 않는다', () => {
  for (const c of CASES_KO) expect(new Set(c.steps.map((s) => s.title)).size, c.id).toBe(c.steps.length);
});

test('사례마다 이름, 두 줄 제목, 소개, 질문 세 개 이상이 있다', () => {
  for (const c of CASES_KO) {
    expect(c.name.length, c.id).toBeGreaterThan(0);
    expect(c.tab.length, c.id).toBeGreaterThan(0);
    expect(c.tab.length, c.id).toBeLessThanOrEqual(c.name.length);
    expect(c.h1.length, c.id).toBe(2);
    expect(c.intro.length, c.id).toBeGreaterThan(30);
    expect(c.faq.length, c.id).toBeGreaterThanOrEqual(3);
    for (const f of c.faq) {
      expect(f.q.endsWith('?'), `${c.id}: ${f.q}`).toBe(true);
      expect(f.a.length, `${c.id}: ${f.q}`).toBeGreaterThan(20);
    }
  }
});

test('쓰지 않기로 한 말이 없다', () => {
  for (const c of CASES_KO) expect(findForbidden(JSON.stringify(c), 'ko'), c.id).toEqual([]);
});
