export type Lang = 'ko' | 'en';
export type Device = 'phone' | 'tablet';

/** Cases are named after timetable kinds, not people (target age is 16+). Order is the button order. */
export const CASE_ORDER = [
  'elementary_school',
  'middle_school',
  'high_school',
  'university',
  'after_school',
  'lessons',
] as const;
export type CaseId = (typeof CASE_ORDER)[number];

export const CASE_SLUG: Record<CaseId, string> = {
  elementary_school: 'elementary-school',
  middle_school: 'middle-school',
  high_school: 'high-school',
  university: 'university',
  after_school: 'after-school',
  lessons: 'lessons',
};

/** Every case walks the same eight steps. */
export const STEP_ORDER = [
  'create',
  'fill',
  'unique',
  'todo',
  'remind',
  'widgets',
  'widget_done',
  'lock_screen',
] as const;
export type StepId = (typeof STEP_ORDER)[number];

export type Media =
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'sequence'; frames: { src: string; alt: string; label?: string }[]; frameMs: number }
  | { kind: 'video'; src: string; poster: string; alt: string; durationMs: number };

export interface StepDef {
  id: StepId;
  title: string;
  /** One sentence, shown on the home page. */
  short: string;
  /** Two or three sentences, shown on the case page. */
  long: string;
}

export interface CaseDef {
  id: CaseId;
  name: string;
  h1: [string, string];
  intro: string;
  steps: StepDef[];
  faq: { q: string; a: string }[];
}

export type PageKey = 'home' | 'faq' | 'about' | `for_${CaseId}`;
