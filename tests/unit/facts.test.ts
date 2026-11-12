import { expect, test } from 'vitest';
import { CASES_EN } from '../../src/data/cases.en';
import { CASES_KO } from '../../src/data/cases.ko';
import { FAQ_EN } from '../../src/data/faq.en';
import { FAQ_KO } from '../../src/data/faq.ko';
import { SITE_EN } from '../../src/data/site.en';
import { SITE_KO } from '../../src/data/site.ko';

// Facts checked against the app's own strings and code on 2026-11-12. If the app changes, change both.
const ko = JSON.stringify([CASES_KO, FAQ_KO, SITE_KO]);
const en = JSON.stringify([CASES_EN, FAQ_EN, SITE_EN]);

test('영어판은 위젯을 앱 안의 이름으로 부른다: Today overview', () => {
  expect(en).not.toMatch(/Today widget/);
  expect(en).toContain('Today overview widget');
  expect(SITE_EN.what.facts.find((f) => f.term === 'Widgets')!.desc).toBe('Weekly, Today overview, To-Do');
});

test('리마인더는 마감 시간이 있어야 켜진다고 쓴다', () => {
  expect(ko).not.toContain('마감일을 정하지 않은 To-Do에는');
  expect(ko).toContain('마감 시간을 정하지 않은 To-Do에는 리마인더를 켤 수 없어요.');
  expect(en).toContain('A To-Do needs a due date and a due time before a reminder can be turned on.');
});

test('광고를 없애는 길 두 가지를 모두 말한다: 구독, 광고 한 편 보고 24시간', () => {
  const answer = (groups: typeof FAQ_KO, q: string) => groups.flatMap((g) => g.items).find((i) => i.q === q)!.a;
  expect(answer(FAQ_KO, '광고를 없애려면 어떻게 하나요?')).toContain('광고 한 편을 보면 24시간 동안 광고가 나오지 않아요');
  expect(answer(FAQ_EN, 'How do I remove ads?')).toContain('for 24 hours');
});

test('만든 사람 이름은 정책과 같게 적는다', () => {
  expect(SITE_KO.about.maker).toContain('정우현(Jerry Jung)');
  expect(SITE_KO.footer.maker).toContain('정우현(Jerry Jung)');
});

test('표의 날짜 항목은 페이지를 고친 날이라고 적는다', () => {
  expect(SITE_KO.what.updatedTerm).toBe('페이지 최근 업데이트');
  expect(SITE_EN.what.updatedTerm).toBe('Page last updated');
});

// Counted in the Play review export (2017-03 to 2026-09-23): reviews with text, and those with a developer reply.
test('답글 수는 Play 리뷰 내보내기에서 센 값이고 기준 달을 적는다', () => {
  expect(SITE_KO.reviews.lead).toContain('1,012건 가운데 783건');
  expect(SITE_KO.reviews.lead).toContain('2026년 9월 기준');
  expect(SITE_EN.reviews.lead).toContain('783 of the 1,012');
  expect(SITE_EN.reviews.lead).toContain('as of September 2026');
});

// 7.5.4 (173) reached production on 2026-11-07. The setting is named in strings_week_start.xml.
test('주 시작 요일 건의는 7.5.4에 들어갔다고 적는다', () => {
  const ko = SITE_KO.reviews.shipped.groups.find((g) => g.note.includes('한 주의 시작 요일'))!;
  expect(ko.when).toBe('2026년 11월, 버전 7.5.4');
  const en = SITE_EN.reviews.shipped.groups.find((g) => g.note.includes('First day of the week'))!;
  expect(en.when).toBe('November 2026, version 7.5.4');
  expect(en.reviews.length).toBe(2);
});

test('홈의 큰 제목에 검색어와 앱 이름이 들어간다', () => {
  expect(SITE_KO.home.h1).toEqual(['시간표 앱 심간표', '수업도 과제도 홈 화면에서 바로']);
  expect(SITE_EN.home.h1[0]).toBe('SimpleScheduler timetable app');
});
