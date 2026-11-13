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
  /** Full name, used as the case heading and in links: '초등학교 시간표'. */
  name: string;
  /** Short label for the case button: '초등학교'. */
  tab: string;
  h1: [string, string];
  intro: string;
  steps: StepDef[];
  faq: { q: string; a: string }[];
}

export type PageKey = 'home' | 'faq' | 'about' | `for_${CaseId}`;

export interface FaqItem {
  q: string;
  a: string;
}

/** Everything a page says that is not case copy. One object per language. */
/** A Google Play review. Original text, unedited. No author names. */
export interface Review {
  text: string;
  year: number;
  month: number;
}

export interface SiteStrings {
  appName: string;
  home: { title: string; description: string; h1: [string, string]; lead: string };
  header: { homeLabel: string; faq: string; otherLang: string; getApp: string; navLabel: string };
  stepper: {
    sectionLabel: string;
    casesLabel: string;
    deviceLabel: string;
    phone: string;
    tablet: string;
    pause: string;
    resume: string;
    androidNote: string;
    /** The button on a screen that opens it at its original size, and the window's close button. */
    zoom: string;
    zoomClose: string;
  };
  what: {
    heading: string;
    definition: string;
    factsHeading: string;
    facts: { term: string; desc: string }[];
    updatedTerm: string;
    formatDate(isoDate: string): string;
  };
  byCase: { heading: string; blurbs: Record<CaseId, string> };
  reviews: {
    heading: string;
    items: Review[];
    /**
     * Reviews that asked for something the app now has. `intro` says so once, above them: no note under
     * each review, no versions, dates or reply counts. The point is only that reviews steer the app.
     */
    shipped: { heading: string; intro: string; reviews: Review[] };
    caption(year: number, month: number): string;
  };
  faq: { heading: string; all: string };
  install: { heading: string; play: string; appStore: string; iosNote: string };
  casePage: {
    crumbsLabel: string;
    title(caseName: string): string;
    stepsHeading: string;
    faqHeading(caseName: string): string;
    moreHeading: string;
  };
  faqPage: { title: string; description: string; h1: string; lead: string };
  about: {
    title: string;
    description: string;
    h1: string;
    storyHeading: string;
    story: string[];
    makerHeading: string;
    maker: string;
    contactHeading: string;
    contact: string;
  };
  notFound: { title: string; h1: string; text: string; home: string };
  footer: {
    navLabel: string;
    casesHeading: string;
    siteHeading: string;
    about: string;
    faq: string;
    contact: string;
    privacy: string;
    terms: string;
    maker: string;
  };
}
