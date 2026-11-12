import { CASE_ORDER, CASE_SLUG, STEP_ORDER, type CaseId, type Device, type Lang, type Media, type StepId } from '../lib/types';

/**
 * Which real app screen each step shows. Screens are captured from the emulator (plan 2);
 * until a screen exists its cell is 'pending' and a release build refuses to ship.
 * `src` values are paths under src/assets (resolved by MediaView), so this file stays free of image imports.
 */
export type CaptureStatus = 'final' | 'pending';
export interface CaptureEntry {
  status: CaptureStatus;
  media: Media;
}

const LANGS: Lang[] = ['ko', 'en'];
const DEVICES: Device[] = ['phone', 'tablet'];

/** phone: Pixel 9 capture size. tablet: placeholder until plan 2 captures real tablet screens. */
export const DEVICE_ASPECT: Record<Device, string> = { phone: '1080 / 2424', tablet: '2560 / 1600' };

const PENDING_ALT: Record<Lang, string> = {
  ko: '아직 촬영하지 않은 화면이에요. 실제 앱 화면으로 바뀝니다.',
  en: 'This screen has not been captured yet. A real app screen will replace it.',
};

function pendingEntry(lang: Lang, device: Device): CaptureEntry {
  return { status: 'pending', media: { kind: 'image', src: `/captures/_pending/${device}.svg`, alt: PENDING_ALT[lang] } };
}

/** Folder that holds one case's screens. A case may only use files from its own folder. */
function dir(lang: Lang, c: CaseId, device: Device): string {
  return `/captures/${lang}/${CASE_SLUG[c]}/${device}/`;
}

type Overrides = Partial<Record<`${Lang}/${CaseId}/${Device}/${StepId}`, CaptureEntry>>;

/**
 * Development stand-ins: the existing college-data captures, mapped onto the eight-step skeleton.
 * They stay 'pending' because plan 2 re-captures every step with the final data.
 */
const uniPhone = dir('ko', 'university', 'phone');
const OVERRIDES: Overrides = {
  'ko/university/phone/fill': {
    status: 'pending',
    media: { kind: 'image', src: `${uniPhone}fill.png`, alt: '대학 시간표 예시 화면. 월요일부터 금요일까지 수업 열 개가 색으로 구분되어 있다.' },
  },
  'ko/university/phone/unique': {
    status: 'pending',
    media: { kind: 'image', src: `${uniPhone}unique.png`, alt: '자료구조 수업을 누른 화면. 요일, 시간, 강의실, 교수님과 연결된 To-Do가 보인다.' },
  },
  'ko/university/phone/todo': {
    status: 'pending',
    media: { kind: 'image', src: `${uniPhone}todo.png`, alt: '새 To-Do 화면. 제목 자료구조 실습 제출이 자료구조 수업에 연결되어 있다.' },
  },
  'ko/university/phone/remind': {
    status: 'pending',
    media: {
      kind: 'sequence',
      frameMs: 2500,
      frames: [
        { src: `${uniPhone}remind-1.png`, alt: '리마인더를 언제 받을지 고르는 화면. 마감 시간부터 며칠 전까지 고를 수 있다.' },
        { src: `${uniPhone}remind-2.png`, alt: '리마인더 시간이 되어 뜬 알람 화면. To-Do 제목과 다시 알림, 끄기 단추가 보인다.' },
      ],
    },
  },
  'ko/university/phone/widgets': {
    status: 'pending',
    media: { kind: 'image', src: `${uniPhone}widgets.png`, alt: '홈 화면의 오늘 통합 위젯. 오늘 수업 두 개와 할 일 세 개가 함께 보인다.' },
  },
};

function build(): Record<Lang, Record<CaseId, Record<Device, Record<StepId, CaptureEntry>>>> {
  const out = {} as Record<Lang, Record<CaseId, Record<Device, Record<StepId, CaptureEntry>>>>;
  for (const lang of LANGS) {
    out[lang] = {} as (typeof out)[Lang];
    for (const c of CASE_ORDER) {
      out[lang][c] = {} as (typeof out)[Lang][CaseId];
      for (const device of DEVICES) {
        out[lang][c][device] = {} as Record<StepId, CaptureEntry>;
        for (const step of STEP_ORDER)
          out[lang][c][device][step] = OVERRIDES[`${lang}/${c}/${device}/${step}`] ?? pendingEntry(lang, device);
      }
    }
  }
  return out;
}

export const CAPTURES = build();

export function getCapture(lang: Lang, c: CaseId, device: Device, step: StepId): CaptureEntry {
  return CAPTURES[lang][c][device][step];
}

/** Every cell as ['ko/middle_school/phone/fill', entry]. */
export function allEntries(): [key: string, entry: CaptureEntry][] {
  const out: [string, CaptureEntry][] = [];
  for (const lang of LANGS)
    for (const c of CASE_ORDER)
      for (const device of DEVICES)
        for (const step of STEP_ORDER) out.push([`${lang}/${c}/${device}/${step}`, CAPTURES[lang][c][device][step]]);
  return out;
}

export function pendingCaptures(): string[] {
  return allEntries().filter(([, e]) => e.status === 'pending').map(([key]) => key);
}

export function mediaSources(m: Media): string[] {
  if (m.kind === 'image') return [m.src];
  if (m.kind === 'sequence') return m.frames.map((f) => f.src);
  return [m.src, m.poster];
}

export function mediaAlts(m: Media): string[] {
  return m.kind === 'sequence' ? m.frames.map((f) => f.alt) : [m.alt];
}
