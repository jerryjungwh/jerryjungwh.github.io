import { expect, test } from 'vitest';
import { CASES_EN } from '../../src/data/cases.en';
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

test('사례 페이지의 긴 설명은 사례마다 다르다: 같은 문장이 두 사례에 나오지 않는다', () => {
  for (const [lang, cases] of [['ko', CASES_KO], ['en', CASES_EN]] as const) {
    const seen = new Map<string, string>();
    for (const c of cases)
      for (const s of c.steps)
        for (const sentence of s.long.split(/(?<=[.?!])\s+/).map((x) => x.trim()).filter((x) => x.length > 0)) {
          const first = seen.get(sentence);
          expect(first === undefined || first === c.id, `${lang}: 「${sentence}」 (${first} / ${c.id})`).toBe(true);
          seen.set(sentence, c.id);
        }
  }
});

// Elementary and middle school and after-school are told by a parent making the child's timetable (design 7-1,
// Jerry 11-12: no under-16 audience). Words that put the student at the desk belong to the older cases only.
const PARENT_CASES: string[] = ['elementary_school', 'middle_school', 'after_school'];
const STUDENT_VOICE = { ko: ['다음 교시', '다음 수업', '쉬는 시간에'], en: ['next period', 'next class', 'between classes'] } as const;

test('부모가 말하는 사례(초등학교·중학교·아이 학원)에는 학생 본인 시점 말이 없다', () => {
  for (const [lang, cases] of [['ko', CASES_KO], ['en', CASES_EN]] as const)
    for (const c of cases.filter((x) => PARENT_CASES.includes(x.id))) {
      const text = JSON.stringify(c).toLowerCase();
      expect(STUDENT_VOICE[lang].filter((w) => text.includes(w)), `${lang}/${c.id}`).toEqual([]);
    }
});

// Simgani's one line beside each case (redesign 11-20, spec §6). Decorative: not a heading, not body text.
const GUIDE_LINES = {
  ko: {
    elementary_school: '아이 시간표, 같이 챙겨요',
    middle_school: '이번 학기, 같이 정리해요',
    high_school: '수업도 수행평가도 같이 챙겨요',
    university: '이번 학기 시간표, 같이 만들어요',
    after_school: '학원 가는 날, 같이 챙겨요',
    lessons: '매주 일정, 같이 정리해요',
  },
  en: {
    elementary_school: "Let's keep the school schedule together",
    middle_school: "Let's sort out this term together",
    high_school: 'Classes and assignments, together',
    university: "Let's build this semester together",
    after_school: 'Never miss an activity day',
    lessons: 'Your weekly plans, sorted together',
  },
} as const;

test('사례마다 말풍선 한 줄이 있다', () => {
  for (const c of CASES_KO) expect(c.guideLine, c.id).toBe(GUIDE_LINES.ko[c.id]);
  for (const c of CASES_EN) expect(c.guideLine, c.id).toBe(GUIDE_LINES.en[c.id]);
});
