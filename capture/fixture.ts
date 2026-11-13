import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { CaseId, Lang } from '../src/lib/types.ts';

/**
 * What the capture run puts into the app for one case in one language, and the alt text of each screen.
 * The JSON files under capture/fixtures are the source: the instrumented test in the app repository reads
 * the same file (SiteCaptureSeeder.parse), so field names here and there must stay the same.
 */
export type DayRange = 'weekdays' | 'weekdays_sat' | 'weekdays_sun' | 'all';
export type UniqueScreen = 'background' | 'saturday' | 'schedule_alarm' | 'schedule_detail' | 'second_timetable';

export interface FixtureSchedule {
  key: string;
  /** Monday = 0 … Sunday = 6, as the app stores it. */
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  start: string;
  end: string;
  title: string;
  place?: string;
  person?: string;
  /** The class's memo, shown in its detail. */
  note?: string;
  color: number;
  /** Shown from the "unique" step on. Without it the class is there from "fill". */
  since?: 'unique';
  /** The class has its own alarm (rings at the start time). */
  alarm?: true;
}

export interface FixtureTimetable {
  key: string;
  title: string;
  days: DayRange;
  startHour: number;
  endHour: number;
  timeFormat: '24h' | '12h';
  /** Default class length in minutes, shown on the timetable settings screen (the app's default is 60). */
  defaultMinutes?: number;
  /** Class text size and row height, when the app's defaults do not fit this timetable on the screen. */
  textSizeSp?: number;
  cellHeightDp?: number;
  /** The same two on the tablet, whose landscape screen has less height for rows. Unset: the values above. */
  tablet?: { textSizeSp?: number; cellHeightDp?: number };
  /** Labels on the class detail: 'student' (classroom, professor; the app's default) or 'general' (location, person). */
  fieldNameMode?: 'student' | 'general';
  /** A second timetable that appears at the "unique" step. */
  since?: 'unique';
  /** What the "unique" step changes on this timetable. */
  unique?: { days?: DayRange; backgroundImage?: string };
  schedules: FixtureSchedule[];
}

export interface FixtureTodo {
  key: string;
  title: string;
  note?: string;
  timetable: string;
  schedule?: string;
  /** The next such weekday (today counts), at this time. */
  due?: { day: 0 | 1 | 2 | 3 | 4 | 5 | 6; time: string };
  reminderMinutes?: 5 | 10 | 30 | 60 | 1440;
  color: number;
}

export interface CaptureFixture {
  case: CaseId;
  lang: Lang;
  timetables: FixtureTimetable[];
  todos: FixtureTodo[];
  steps: {
    create: { alt: string };
    /**
     * ② stacks the classes up, three or four screens: each adds these classes of the first timetable to the ones
     * before it, and the last holds every class that is there from the start (not `since`).
     */
    fill: { frames: { add: string[]; alt: string }[] };
    /** Two screens for second_timetable (the switcher list, then the second timetable); one otherwise. */
    unique: { screen: UniqueScreen; schedule?: string; alts: string[] };
    /** One screen (the To-Do's own screen) or two (then the class it is linked to, tapped on the timetable). */
    todo: { todo: string; alts: string[] };
    remind: { todo: string; alts: [string, string] };
    /** Weekly, Today overview, To-Do. */
    widgets: { alts: [string, string, string] };
    widget_done: { todo: string; alt: string };
    lock_screen: { alt: string };
  };
}

export function loadFixture(lang: Lang, c: CaseId): CaptureFixture {
  return JSON.parse(readFileSync(fileURLToPath(new URL(`./fixtures/${lang}/${c}.json`, import.meta.url)), 'utf8'));
}

const VISIBLE: Record<DayRange, number[]> = {
  weekdays: [0, 1, 2, 3, 4],
  weekdays_sat: [0, 1, 2, 3, 4, 5],
  weekdays_sun: [0, 1, 2, 3, 4, 6],
  all: [0, 1, 2, 3, 4, 5, 6],
};
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
/**
 * Height for the rows of the weekly table, measured on the capture emulators (Pixel 9 portrait, Pixel Tablet
 * landscape). Taller and the last hours scroll out of the screen. The app's default row is 60dp an hour.
 */
const ROWS_DP = { phone: 650, tablet: 515 } as const;
const DEFAULT_ROW_DP = 60;
/** The app's smallest row. A day that needs it can get no shorter, so it may scroll a little. */
const MIN_ROW_DP = 36;
const minutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const MIN_ALT = 10;

/** Everything wrong with a fixture, as sentences. Empty when the app could reach this state and every key resolves. */
export function fixtureProblems(f: CaptureFixture): string[] {
  const out: string[] = [];
  const twice = (keys: string[], where: string) => {
    for (const k of new Set(keys.filter((x, i) => keys.indexOf(x) !== i))) out.push(`${where}: 열쇠가 두 번 나온다 (${k})`);
  };
  twice(f.timetables.map((t) => t.key), '시간표');
  twice(f.todos.map((t) => t.key), 'To-Do');

  for (const t of f.timetables) {
    twice(t.schedules.map((s) => s.key), `시간표 ${t.key}`);
    if (t.fieldNameMode !== undefined && t.fieldNameMode !== 'student' && t.fieldNameMode !== 'general') out.push(`${t.key}: fieldNameMode는 student 또는 general이다`);
    for (const [where, v] of [['', t], ['tablet.', t.tablet ?? {}]] as const) {
      // The app clamps to these ranges without a word, which would make the fit check below wrong.
      if (v.cellHeightDp !== undefined && !(v.cellHeightDp >= 36 && v.cellHeightDp <= 120)) out.push(`${t.key}: ${where}cellHeightDp는 36~120이다`);
      if (v.textSizeSp !== undefined && !(v.textSizeSp >= 5 && v.textSizeSp <= 24)) out.push(`${t.key}: ${where}textSizeSp는 5~24다`);
    }
    const hours = t.endHour - t.startHour;
    const phoneRows = hours * (t.cellHeightDp ?? DEFAULT_ROW_DP);
    const tabletRows = hours * (t.tablet?.cellHeightDp ?? t.cellHeightDp ?? DEFAULT_ROW_DP);
    if (phoneRows > ROWS_DP.phone) out.push(`${t.key}: 폰에서 하루가 한 화면에 들어가지 않는다 (${phoneRows}dp > ${ROWS_DP.phone}dp)`);
    if (tabletRows > ROWS_DP.tablet && (t.tablet?.cellHeightDp ?? t.cellHeightDp) !== MIN_ROW_DP) out.push(`${t.key}: 태블릿에서 하루가 한 화면에 들어가지 않는다 (${tabletRows}dp > ${ROWS_DP.tablet}dp, tablet.cellHeightDp를 정한다)`);
    for (const s of t.schedules) {
      const at = `${t.key}/${s.key}`;
      if (!TIME.test(s.start) || !TIME.test(s.end)) {
        out.push(`${at}: 시간은 HH:MM으로 적는다`);
        continue;
      }
      if (minutes(s.start) >= minutes(s.end)) out.push(`${at}: 시작이 끝보다 늦거나 같다`);
      if (minutes(s.start) < t.startHour * 60 || minutes(s.end) > t.endHour * 60) out.push(`${at}: 시간표 범위(${t.startHour}~${t.endHour}시) 밖이다`);
      const days = s.since === 'unique' ? (t.unique?.days ?? t.days) : t.days;
      if (!VISIBLE[days].includes(s.day)) out.push(`${at}: 그 단계에 보이지 않는 요일이다`);
      if (!Number.isInteger(s.color) || s.color < 0 || s.color > 10) out.push(`${at}: 색 번호는 0~10이다`);
    }
    for (const [i, a] of t.schedules.entries())
      for (const b of t.schedules.slice(i + 1))
        if (a.day === b.day && TIME.test(a.start) && TIME.test(b.start) && minutes(a.start) < minutes(b.end) && minutes(b.start) < minutes(a.end))
          out.push(`${t.key}: ${a.key}와 ${b.key}가 겹친다`);
  }

  const schedule = (timetable: string, key: string) => f.timetables.find((t) => t.key === timetable)?.schedules.find((s) => s.key === key);
  for (const t of f.todos) {
    if (!f.timetables.some((x) => x.key === t.timetable)) out.push(`To-Do ${t.key}: 시간표 ${t.timetable}가 없다`);
    else if (t.schedule && !schedule(t.timetable, t.schedule)) out.push(`To-Do ${t.key}: 수업 ${t.schedule}가 없다`);
    if (t.due && (!TIME.test(t.due.time) || t.due.day < 0 || t.due.day > 6)) out.push(`To-Do ${t.key}: 마감은 요일 0~6과 HH:MM이다`);
    if (t.reminderMinutes && !t.due) out.push(`To-Do ${t.key}: 리마인더는 마감 시간이 있어야 켠다`);
  }

  const first = f.timetables[0];
  const todo = (step: string, key: string) => {
    const found = f.todos.find((t) => t.key === key);
    if (!found) out.push(`${step}: To-Do ${key}가 없다`);
    return found;
  };
  todo('todo', f.steps.todo.todo);
  todo('widget_done', f.steps.widget_done.todo);
  const reminded = todo('remind', f.steps.remind.todo);
  if (reminded && !reminded.reminderMinutes) out.push(`remind: To-Do ${reminded.key}에 리마인더가 없다`);

  const fill = f.steps.fill.frames ?? [];
  if (fill.length < 3 || fill.length > 4) out.push('fill: 장은 3~4장이다');
  const stacked: string[] = [];
  fill.forEach((frame, i) => {
    if (!frame.add?.length) out.push(`fill: ${i + 1}번째 장에 더할 수업이 없다`);
    for (const key of frame.add ?? []) {
      const found = first?.schedules.find((x) => x.key === key);
      if (!found) out.push(`fill: 수업 ${key}가 없다`);
      else if (found.since === 'unique') out.push(`fill: 수업 ${key}는 ③부터 나오는 수업이다`);
      if (stacked.includes(key)) out.push(`fill: 수업 ${key}가 두 번 나온다`);
      stacked.push(key);
    }
  });
  for (const x of first?.schedules ?? []) if (!x.since && !stacked.includes(x.key)) out.push(`fill: 수업 ${x.key}가 ②에 들어가지 않는다`);
  if (new Set(fill.map((x) => x.alt)).size !== fill.length) out.push('fill: 장마다 대체 문장이 달라야 한다');

  const u = f.steps.unique;
  if (u.alts.length !== (u.screen === 'second_timetable' ? 2 : 1)) out.push(`unique: 대체 문장이 ${u.screen === 'second_timetable' ? '두' : '한'} 개여야 한다`);
  const t = f.steps.todo;
  if (t.alts.length < 1 || t.alts.length > 2) out.push('todo: 대체 문장은 한 개(To-Do 화면) 또는 두 개(그리고 연결된 수업)다');
  if (t.alts.length === 2 && !f.todos.find((x) => x.key === t.todo)?.schedule) out.push('todo: 두 번째 화면은 연결된 수업인데, To-Do에 연결된 수업이 없다');
  if (f.steps.remind.alts.length !== 2) out.push('remind: 대체 문장이 두 개여야 한다');
  if (f.steps.widgets.alts.length !== 3) out.push('widgets: 대체 문장이 세 개여야 한다');
  const focus = u.schedule ? schedule(first?.key, u.schedule) : undefined;
  if (u.schedule && !focus) out.push(`unique: 수업 ${u.schedule}가 없다`);
  if (u.screen === 'saturday' && !first?.unique?.days) out.push('unique(saturday): 늘릴 요일(unique.days)이 없다');
  if (u.screen === 'second_timetable' && !f.timetables.some((t) => t.since === 'unique')) out.push('unique(second_timetable): 둘째 시간표가 없다');
  if (u.screen === 'schedule_alarm' && !focus?.alarm) out.push('unique(schedule_alarm): 알람이 켜진 수업을 가리켜야 한다');
  if (u.screen === 'schedule_detail' && !focus) out.push('unique(schedule_detail): 누를 수업이 없다');

  const alts: [string, string[]][] = [
    ['create', [f.steps.create.alt]],
    ['fill', fill.map((x) => x.alt)],
    ['unique', u.alts],
    ['todo', t.alts],
    ['remind', f.steps.remind.alts],
    ['widgets', f.steps.widgets.alts],
    ['widget_done', [f.steps.widget_done.alt]],
    ['lock_screen', [f.steps.lock_screen.alt]],
  ];
  for (const [step, list] of alts) if (list.some((a) => !a || a.length <= MIN_ALT)) out.push(`${step}: 대체 문장이 너무 짧다`);
  return out;
}
