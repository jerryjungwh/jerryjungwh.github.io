import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';
import { fixtureProblems, loadFixture, type CaptureFixture } from '../../capture/fixture.ts';
import { caseDefs } from '../../src/data/site';
import { findForbidden } from '../../src/lib/forbidden';
import { CASE_ORDER, type CaseId, type Lang } from '../../src/lib/types';

const LANGS: Lang[] = ['ko', 'en'];

/** A small valid fixture. Each test below breaks one thing in a copy of it. */
function valid(): CaptureFixture {
  return {
    case: 'university',
    lang: 'ko',
    timetables: [
      {
        key: 'main',
        title: '이번 학기',
        days: 'weekdays',
        startHour: 9,
        endHour: 17,
        timeFormat: '24h',
        schedules: [
          { key: 'ds', day: 0, start: '09:00', end: '10:30', title: '자료구조', place: '공학관 301', color: 0 },
          { key: 'os', day: 0, start: '13:00', end: '14:30', title: '운영체제', color: 1 },
        ],
      },
    ],
    todos: [{ key: 'lab', title: '자료구조 실습 제출', timetable: 'main', schedule: 'ds', due: { day: 2, time: '18:00' }, reminderMinutes: 60, color: 2 }],
    steps: {
      create: { alt: '시간표 설정 화면. 이름과 요일, 시간 범위가 보인다.' },
      fill: { alt: '주간표 화면. 수업 두 개가 색으로 구분되어 있다.' },
      unique: { screen: 'schedule_detail', schedule: 'ds', alts: ['자료구조 수업을 누른 화면. 강의실이 보인다.'] },
      todo: { todo: 'lab', alts: ['To-Do 편집 화면. 자료구조에 연결되어 있다.'] },
      remind: { todo: 'lab', alts: ['리마인더를 언제 받을지 고르는 화면이다.', '리마인더 시간이 되어 뜬 알람 화면이다.'] },
      widgets: { alts: ['홈 화면의 주간표 위젯이다. 수업이 보인다.', '홈 화면의 오늘 통합 위젯이다.', '홈 화면의 To-Do 위젯이다. 할 일이 보인다.'] },
      widget_done: { todo: 'lab', alt: 'To-Do 위젯에서 할 일을 완료로 바꾸는 모습이다.' },
      lock_screen: { alt: '잠금화면에 주간표가 보이는 화면이다.' },
    },
  };
}

function broken(change: (f: CaptureFixture) => void): string[] {
  const f = valid();
  change(f);
  return fixtureProblems(f);
}

test('온전한 데이터는 문제가 없다', () => {
  expect(fixtureProblems(valid())).toEqual([]);
});

test('앱에서 저장이 막히는 상태를 잡는다: 겹치는 수업, 범위 밖 수업, 보이지 않는 요일의 수업', () => {
  expect(broken((f) => (f.timetables[0].schedules[1] = { ...f.timetables[0].schedules[1], start: '10:00', end: '11:00' })).join('\n')).toMatch(/겹친다/);
  expect(broken((f) => (f.timetables[0].schedules[1].end = '18:30')).join('\n')).toMatch(/범위/);
  expect(broken((f) => (f.timetables[0].schedules[0].start = '08:30')).join('\n')).toMatch(/범위/);
  expect(broken((f) => (f.timetables[0].schedules[1].day = 5)).join('\n')).toMatch(/요일/);
  expect(broken((f) => (f.timetables[0].schedules[1].start = '15:00')).join('\n')).toMatch(/시작이 끝보다/);
});

test('고유 단계에서 늘린 요일의 수업은 그 단계부터 보이는 수업이어야 한다', () => {
  const saturday = (since?: 'unique') => (f: CaptureFixture) => {
    f.timetables[0].unique = { days: 'weekdays_sat' };
    f.steps.unique = { screen: 'saturday', alts: ['토요일 열이 더해진 주간표 화면이다.'] };
    f.timetables[0].schedules.push({ key: 'sat', day: 5, start: '10:00', end: '12:00', title: '영어학원', color: 3, since });
  };
  expect(broken(saturday('unique'))).toEqual([]);
  expect(broken(saturday()).join('\n')).toMatch(/요일/);
});

test('없는 열쇠를 가리키면 잡는다', () => {
  expect(broken((f) => (f.todos[0].schedule = 'nope')).join('\n')).toMatch(/nope/);
  expect(broken((f) => (f.todos[0].timetable = 'other')).join('\n')).toMatch(/other/);
  expect(broken((f) => (f.steps.todo.todo = 'gone')).join('\n')).toMatch(/gone/);
  expect(broken((f) => (f.steps.unique.schedule = 'gone')).join('\n')).toMatch(/gone/);
  expect(broken((f) => f.timetables[0].schedules.push({ ...f.timetables[0].schedules[0], day: 3 })).join('\n')).toMatch(/열쇠가 두 번/);
});

test('리마인더는 마감 시간이 있는 To-Do에만 붙고, 리마인더 단계의 To-Do에는 리마인더가 있다', () => {
  expect(broken((f) => delete f.todos[0].due).join('\n')).toMatch(/마감/);
  expect(broken((f) => delete f.todos[0].reminderMinutes).join('\n')).toMatch(/리마인더/);
});

test('고유 단계의 화면 종류에 필요한 데이터가 있어야 한다', () => {
  expect(broken((f) => (f.steps.unique = { screen: 'saturday', alts: ['토요일 열이 더해진 주간표 화면이다.'] })).join('\n')).toMatch(/saturday/);
  expect(broken((f) => (f.steps.unique = { screen: 'second_timetable', alts: ['시간표 두 개가 목록에 보이는 화면이다.', '둘째 시간표의 주간표 화면이다.'] })).join('\n')).toMatch(/second_timetable/);
  expect(broken((f) => (f.steps.unique = { screen: 'schedule_alarm', schedule: 'ds', alts: ['알람 표시가 있는 주간표 화면이다.'] })).join('\n')).toMatch(/schedule_alarm/);
});

test('화면 장 수와 대체 문장 수가 맞는다: 둘째 시간표는 두 장, To-Do는 한 장 또는 연결된 수업까지 두 장', () => {
  const second = (f: CaptureFixture) => {
    f.timetables.push({ key: 'second', title: '다음 학기', days: 'weekdays', startHour: 9, endHour: 12, timeFormat: '24h', since: 'unique', schedules: [] });
  };
  expect(broken((f) => { second(f); f.steps.unique = { screen: 'second_timetable', alts: ['시간표 두 개가 목록에 보이는 화면이다.', '둘째 시간표의 주간표 화면이다.'] }; })).toEqual([]);
  expect(broken((f) => { second(f); f.steps.unique = { screen: 'second_timetable', alts: ['시간표 두 개가 목록에 보이는 화면이다.'] }; }).join('\n')).toMatch(/unique: 대체 문장/);
  expect(broken((f) => (f.steps.unique.alts = ['수업을 누른 화면이다. 강의실이 보인다.', '한 장 더 있는 화면이다.'])).join('\n')).toMatch(/unique: 대체 문장/);
  expect(broken((f) => (f.steps.todo.alts = ['To-Do 편집 화면. 연결되어 있다.', '연결된 수업을 누른 화면이다.']))).toEqual([]);
  expect(broken((f) => { f.steps.todo.alts = ['To-Do 편집 화면. 연결되어 있다.', '연결된 수업을 누른 화면이다.']; delete f.todos[0].schedule; }).join('\n')).toMatch(/연결된 수업/);
  expect(broken((f) => (f.steps.todo.alts = [])).join('\n')).toMatch(/todo: 대체 문장/);
  expect(broken((f) => (f.steps.widgets.alts = f.steps.widgets.alts.slice(0, 2) as never)).join('\n')).toMatch(/widgets: 대체 문장/);
});

test('대체 문장이 짧으면 잡는다', () => {
  expect(broken((f) => (f.steps.fill.alt = '주간표')).join('\n')).toMatch(/fill/);
  expect(broken((f) => (f.steps.widgets.alts[1] = '위젯')).join('\n')).toMatch(/widgets/);
});

const UNIQUE_SCREEN: Record<CaseId, CaptureFixture['steps']['unique']['screen']> = {
  elementary_school: 'background',
  middle_school: 'saturday',
  high_school: 'schedule_alarm',
  university: 'schedule_detail',
  after_school: 'second_timetable',
  lessons: 'background',
};

test('사례 6 × 언어 2의 데이터가 모두 있고 문제가 없다', () => {
  for (const lang of LANGS)
    for (const c of CASE_ORDER) {
      const f = loadFixture(lang, c);
      expect([f.lang, f.case], `${lang}/${c}`).toEqual([lang, c]);
      expect(fixtureProblems(f), `${lang}/${c}`).toEqual([]);
      expect(f.steps.unique.screen, `${lang}/${c}`).toBe(UNIQUE_SCREEN[c]);
    }
});

test('화면에 나올 이름이 그 사례의 글에 나오는 이름과 같다', () => {
  for (const lang of LANGS)
    for (const c of CASE_ORDER) {
      const f = loadFixture(lang, c);
      const copy = JSON.stringify(caseDefs(lang).find((x) => x.id === c));
      const named = new Set([f.steps.todo.todo, f.steps.remind.todo, f.steps.widget_done.todo]);
      for (const t of f.timetables) expect(copy, `${lang}/${c} 시간표 ${t.title}`).toContain(t.title);
      for (const t of f.todos.filter((x) => named.has(x.key))) expect(copy, `${lang}/${c} To-Do ${t.title}`).toContain(t.title);
    }
});

test('영어 데이터에는 한글이 없고, 어느 데이터에도 쓰지 않기로 한 말이 없다', () => {
  for (const c of CASE_ORDER) expect(JSON.stringify(loadFixture('en', c)), c).not.toMatch(/[가-힣]/);
  for (const lang of LANGS) for (const c of CASE_ORDER) expect(findForbidden(JSON.stringify(loadFixture(lang, c)), lang), `${lang}/${c}`).toEqual([]);
});

test('수업 상세의 이름표는 대학만 강의실·교수명(학생용)이고, 나머지 사례는 장소·담당자(일반용)다', () => {
  for (const lang of LANGS)
    for (const c of CASE_ORDER)
      for (const t of loadFixture(lang, c).timetables)
        expect(t.fieldNameMode ?? 'student', `${lang}/${c}/${t.key}`).toBe(c === 'university' ? 'student' : 'general');
});

test('이름표 모드는 student 또는 general이다', () => {
  expect(broken((f) => ((f.timetables[0] as { fieldNameMode?: string }).fieldNameMode = 'teacher'))).toContain('main: fieldNameMode는 student 또는 general이다');
});

test('한국어는 24시간, 영어는 오전·오후로 시간을 보인다', () => {
  for (const c of CASE_ORDER) {
    expect(loadFixture('ko', c).timetables.every((t) => t.timeFormat === '24h'), c).toBe(true);
    expect(loadFixture('en', c).timetables.every((t) => t.timeFormat === '12h'), c).toBe(true);
  }
});

test('글에 적은 점심시간에는 수업이 없다', () => {
  const lunch: [Lang, string, string, string][] = [
    ['ko', '점심시간 12:10~13:00', '12:10', '13:00'],
    ['en', 'Lunch from 11:45 to 12:20', '11:45', '12:20'],
  ];
  for (const [lang, sentence, from, to] of lunch) {
    expect(JSON.stringify(caseDefs(lang).find((x) => x.id === 'elementary_school')), lang).toContain(sentence);
    const busy = loadFixture(lang, 'elementary_school').timetables[0].schedules.filter((s) => s.start < to && from < s.end);
    expect(busy.map((s) => s.key), lang).toEqual([]);
  }
});

test('하루가 기기 한 화면에 들어간다: 폰 650dp, 태블릿 515dp(실측), 칸 높이는 따로 정할 수 있다', () => {
  // 8 hours at the app's default row (60dp) fit both.
  expect(fixtureProblems(valid())).toEqual([]);
  expect(broken((f) => (f.timetables[0].cellHeightDp = 82)).join('\n')).toMatch(/폰/);
  expect(broken((f) => (f.timetables[0].cellHeightDp = 70)).join('\n')).toMatch(/태블릿/);
  expect(broken((f) => Object.assign(f.timetables[0], { cellHeightDp: 70, tablet: { cellHeightDp: 60 } }))).toEqual([]);
  expect(broken((f) => (f.timetables[0].tablet = { cellHeightDp: 65 })).join('\n')).toMatch(/태블릿/);
  // A long day at the app's smallest row (36dp) cannot get shorter: allowed, it scrolls a little.
  const longDay = (h: number) => (f: CaptureFixture) => Object.assign(f.timetables[0], { startHour: 7, endHour: 22, cellHeightDp: 43, tablet: { cellHeightDp: h } });
  expect(broken(longDay(36))).toEqual([]);
  expect(broken(longDay(37)).join('\n')).toMatch(/태블릿/);
});

test('칸 높이와 글씨 크기는 앱이 받는 범위 안이다(밖이면 앱이 말없이 바꾼다)', () => {
  expect(broken((f) => (f.timetables[0].cellHeightDp = 30)).join('\n')).toMatch(/36~120/);
  expect(broken((f) => (f.timetables[0].tablet = { cellHeightDp: 121 })).join('\n')).toMatch(/36~120/);
  expect(broken((f) => (f.timetables[0].textSizeSp = 4)).join('\n')).toMatch(/5~24/);
  expect(broken((f) => (f.timetables[0].tablet = { textSizeSp: 25 })).join('\n')).toMatch(/5~24/);
});

test('배경 사진 단계의 사례는 사진 파일을 가리키고, 그 파일이 capture/fixtures/images에 있다', () => {
  for (const lang of LANGS)
    for (const c of CASE_ORDER) {
      const f = loadFixture(lang, c);
      const photo = f.timetables[0].unique?.backgroundImage;
      if (f.steps.unique.screen !== 'background') {
        expect(photo, `${lang}/${c}`).toBeUndefined();
        continue;
      }
      expect(photo, `${lang}/${c}`).toMatch(/^[a-z0-9_-]+\.jpg$/);
      expect(existsSync(fileURLToPath(new URL(`../../capture/fixtures/images/${photo}`, import.meta.url))), `${lang}/${c}`).toBe(true);
    }
});
