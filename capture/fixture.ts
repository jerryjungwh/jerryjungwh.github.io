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
  /** Class text size and row height, when the app's defaults do not fit this timetable on the screen. */
  textSizeSp?: number;
  cellHeightDp?: number;
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
    fill: { alt: string };
    unique: { screen: UniqueScreen; schedule?: string; alt: string };
    todo: { todo: string; alt: string };
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

  const u = f.steps.unique;
  const focus = u.schedule ? schedule(first?.key, u.schedule) : undefined;
  if (u.schedule && !focus) out.push(`unique: 수업 ${u.schedule}가 없다`);
  if (u.screen === 'saturday' && !first?.unique?.days) out.push('unique(saturday): 늘릴 요일(unique.days)이 없다');
  if (u.screen === 'second_timetable' && !f.timetables.some((t) => t.since === 'unique')) out.push('unique(second_timetable): 둘째 시간표가 없다');
  if (u.screen === 'schedule_alarm' && !focus?.alarm) out.push('unique(schedule_alarm): 알람이 켜진 수업을 가리켜야 한다');
  if (u.screen === 'schedule_detail' && !focus) out.push('unique(schedule_detail): 누를 수업이 없다');

  const alts: [string, string[]][] = [
    ['create', [f.steps.create.alt]],
    ['fill', [f.steps.fill.alt]],
    ['unique', [u.alt]],
    ['todo', [f.steps.todo.alt]],
    ['remind', f.steps.remind.alts],
    ['widgets', f.steps.widgets.alts],
    ['widget_done', [f.steps.widget_done.alt]],
    ['lock_screen', [f.steps.lock_screen.alt]],
  ];
  for (const [step, list] of alts) if (list.some((a) => !a || a.length <= MIN_ALT)) out.push(`${step}: 대체 문장이 너무 짧다`);
  return out;
}
