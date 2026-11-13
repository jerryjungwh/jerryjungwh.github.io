import { expect, test } from 'vitest';
import { loadFixture } from '../../capture/fixture.ts';
import { completeCells, expectedFiles, mergeManifest, pickEmulator } from '../../capture/lib.ts';

const HEADER = 'List of devices attached\n';

test('에뮬레이터가 하나일 때만 그 시리얼을 고르고, 실제 기기는 절대 고르지 않는다', () => {
  expect(pickEmulator(`${HEADER}emulator-5554\tdevice\n\n`)).toBe('emulator-5554');
  // A real phone over wireless adb next to the emulator: still the emulator.
  expect(pickEmulator(`${HEADER}adb-R3KL20A4BBE-1mkePE._adb-tls-connect._tcp\tdevice\nemulator-5554\tdevice\n`)).toBe('emulator-5554');
  expect(() => pickEmulator(`${HEADER}adb-R3KL20A4BBE-1mkePE._adb-tls-connect._tcp\tdevice\n`)).toThrow(/에뮬레이터/);
  expect(() => pickEmulator(`${HEADER}R3KL20A4BBE\tdevice\n`)).toThrow(/에뮬레이터/);
  expect(() => pickEmulator(HEADER)).toThrow(/에뮬레이터/);
  expect(() => pickEmulator(`${HEADER}emulator-5554\tdevice\nemulator-5556\tdevice\n`)).toThrow(/하나만/);
  // A booting or unauthorized emulator is not one to capture on.
  expect(() => pickEmulator(`${HEADER}emulator-5554\toffline\n`)).toThrow(/에뮬레이터/);
  expect(pickEmulator(`${HEADER}emulator-5554\tdevice\nemulator-5556\tunauthorized\n`)).toBe('emulator-5554');
});

const BASE = ['create.png', 'remind-1.png', 'remind-2.png', 'widgets-1.png', 'widgets-2.png', 'widgets-3.png', 'widget_done-after.png', 'widget_done.mp4', 'lock_screen.png'];
/** ② stacks the classes up: university in three screens, after-school in four. */
const FILL3 = ['fill-1.png', 'fill-2.png', 'fill-3.png'];
const FILL4 = [...FILL3, 'fill-4.png'];
const ONE = [...BASE, ...FILL3, 'unique.png', 'todo.png'];

test('한 사례가 내야 하는 파일: 두 장인 단계는 -1, -2가 붙는다', () => {
  // university: unique (class detail) and todo are one screen each.
  expect(expectedFiles(loadFixture('ko', 'university')).sort()).toEqual([...ONE].sort());
  // after_school: the switcher list then the second timetable; the To-Do then the class it is linked to.
  expect(expectedFiles(loadFixture('ko', 'after_school')).sort()).toEqual(
    [...BASE, ...FILL4, 'unique-1.png', 'unique-2.png', 'todo-1.png', 'todo-2.png'].sort(),
  );
  expect(expectedFiles(loadFixture('ko', 'university'))).not.toContain('fill.png');
  // A background step without a photo is not captured: its screen is left out.
  const noPhoto = structuredClone(loadFixture('ko', 'elementary_school'));
  noPhoto.timetables[0].unique = {};
  expect(expectedFiles(noPhoto)).not.toContain('unique.png');
  expect(expectedFiles(loadFixture('ko', 'elementary_school'))).toContain('unique.png');
});

test('파일이 모두 있으면 여덟 칸이 최종이 되고, 경로에 언어·사례·기기가 들어간다', () => {
  const f = loadFixture('ko', 'university');
  const cells = completeCells(f, 'phone', ONE, { durationMs: 5800 });
  const keys = Object.keys(cells);
  expect(keys.sort()).toEqual(['create', 'fill', 'lock_screen', 'remind', 'todo', 'unique', 'widget_done', 'widgets'].map((s) => `ko/university/phone/${s}`).sort());
  for (const entry of Object.values(cells)) expect(entry.status).toBe('final');
  // ② is a stacking sequence: 0.7 s a screen, then it holds on the full week.
  expect(cells['ko/university/phone/fill'].media).toEqual({
    kind: 'sequence',
    frameMs: 700,
    frames: f.steps.fill.frames.map((x, i) => ({ src: `/captures/ko/university/phone/fill-${i + 1}.webp`, alt: x.alt })),
  });
  expect(cells['ko/university/phone/todo'].media).toEqual({ kind: 'image', src: '/captures/ko/university/phone/todo.webp', alt: f.steps.todo.alts[0] });
  const remind = cells['ko/university/phone/remind'].media;
  expect(remind.kind === 'sequence' && remind.frames.map((x) => [x.src, x.alt])).toEqual([
    ['/captures/ko/university/phone/remind-1.webp', f.steps.remind.alts[0]],
    ['/captures/ko/university/phone/remind-2.webp', f.steps.remind.alts[1]],
  ]);
  const widgets = cells['ko/university/phone/widgets'].media;
  expect(widgets.kind === 'sequence' && widgets.frames.map((x) => x.label)).toEqual(['주간표', '오늘 통합', 'To-Do']);
  // The still under the recording is taken after its last tap: without the video, the To-Do is seen completed.
  expect(cells['ko/university/phone/widget_done'].media).toEqual({
    kind: 'video',
    src: '/captures/ko/university/phone/widget_done.mp4',
    poster: '/captures/ko/university/phone/widget_done.webp',
    alt: f.steps.widget_done.alt,
    durationMs: 5800,
  });
});

test('두 장인 단계는 이어 보기가 되고, 장마다 데이터의 대체 문장을 쓴다', () => {
  const f = loadFixture('en', 'after_school');
  const files = [...BASE, ...FILL4, 'unique-1.png', 'unique-2.png', 'todo-1.png', 'todo-2.png'];
  const cells = completeCells(f, 'tablet', files, { durationMs: 6000 });
  for (const step of ['unique', 'todo'] as const) {
    const m = cells[`en/after_school/tablet/${step}`].media;
    expect(m.kind === 'sequence' && m.frames.map((x) => [x.src, x.alt]), step).toEqual([
      [`/captures/en/after-school/tablet/${step}-1.webp`, f.steps[step].alts[0]],
      [`/captures/en/after-school/tablet/${step}-2.webp`, f.steps[step].alts[1]],
    ]);
  }
  const widgets = cells['en/after_school/tablet/widgets'].media;
  expect(widgets.kind === 'sequence' && widgets.frames.map((x) => x.label)).toEqual(['Weekly', 'Today overview', 'To-Do']);
});

test('파일이 하나라도 빠지면 그 사례는 한 칸도 바뀌지 않는다', () => {
  const f = loadFixture('ko', 'university');
  expect(completeCells(f, 'phone', ONE.filter((x) => x !== 'widgets-2.png'), { durationMs: 5800 })).toEqual({});
  expect(completeCells(f, 'phone', ONE.filter((x) => x !== 'widget_done.mp4'), { durationMs: 5800 })).toEqual({});
  expect(completeCells(f, 'phone', ONE.filter((x) => x !== 'fill-2.png'), { durationMs: 5800 })).toEqual({});
});

test('배경 사진이 없는 사례는 고유 단계만 빼고 일곱 칸이 최종이 된다', () => {
  const f = structuredClone(loadFixture('ko', 'lessons'));
  f.timetables[0].unique = {};
  const files = expectedFiles(f);
  const cells = completeCells(f, 'phone', files, { durationMs: 5800 });
  expect(Object.keys(cells).length).toBe(7);
  expect(cells['ko/lessons/phone/unique']).toBeUndefined();
});

test('목록을 합칠 때 그 사례·기기의 칸만 바뀐다', () => {
  const old = {
    'ko/university/phone/fill': { status: 'final', media: { kind: 'image', src: '/old.webp', alt: '예전 화면이다. 바뀌어야 한다.' } },
    'ko/university/phone/unique': { status: 'final', media: { kind: 'image', src: '/old-unique.webp', alt: '예전 화면이다. 지워져야 한다.' } },
    'ko/university/tablet/fill': { status: 'final', media: { kind: 'image', src: '/tablet.webp', alt: '태블릿 화면이다. 그대로 남는다.' } },
    'en/university/phone/fill': { status: 'final', media: { kind: 'image', src: '/en.webp', alt: 'English screen that must stay as it is.' } },
  } as const;
  const cells = { 'ko/university/phone/fill': { status: 'final', media: { kind: 'image', src: '/new.webp', alt: '새 화면이다. 이것으로 바뀐다.' } } } as const;
  const merged = mergeManifest(old, cells, 'ko/university/phone/');
  expect(Object.keys(merged)).toEqual(['en/university/phone/fill', 'ko/university/phone/fill', 'ko/university/tablet/fill']);
  expect(merged['ko/university/phone/fill'].media).toMatchObject({ src: '/new.webp' });
  expect(merged['ko/university/tablet/fill']).toEqual(old['ko/university/tablet/fill']);
  expect(merged['en/university/phone/fill']).toEqual(old['en/university/phone/fill']);
});
