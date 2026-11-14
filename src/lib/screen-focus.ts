import type { CaseId, StepId } from './types';

/**
 * Which part of an app screen a step shows on a narrow screen.
 *
 * A phone capture is 1080 x 2424. Shown whole it is either tiny or taller than the view, so the stepper
 * gives every step a window of the same height and this says what goes in it:
 *
 * - `show` — how much of the capture's height is in the window, 0 to 1. Less means a bigger screen: at
 *   0.7 the capture is about three times the size of the two-column one, at 1 the whole screen is in and
 *   it is as wide as the window is tall allows.
 * - `at` — where the window sits, as a percentage of the capture (0 its top, 100 its bottom). It is the
 *   image's `object-position`, and it does nothing at `show: 1`.
 *
 * These were set by looking at all 96 screens (six cases x eight steps x two languages) in the window;
 * `.superpowers/sdd/plan-publish-2026-11-13` holds the sheets and the script that makes them. Change a
 * capture, or the words of a step, and look at that step again.
 */
export interface ScreenFocus {
  show: number;
  at: number;
}
export type ScreenCut = 'none' | 'top' | 'bottom' | 'both';

/** The window at its smallest: the screen reads largest here, so steps use it unless they need more in. */
const CLOSE = 0.7;

/** What each step shows in every case. */
const BY_STEP: Record<StepId, ScreenFocus> = {
  // The timetable's name, its days and its hours are the top of the settings screen.
  create: { show: CLOSE, at: 0 },
  // A week of classes, evening academies included: the whole screen.
  fill: { show: 1, at: 0 },
  // Differs by case; the overrides below name the two that do not need the whole screen.
  unique: { show: 1, at: 0 },
  // The step names the To-Do and the class it is linked to, and the form puts them at its two ends, so
  // this window is wider than the rest: short of the whole screen, but enough to hold both.
  todo: { show: 0.82, at: 50 },
  // The reminder sheet, and the value picked in it, come up from the bottom.
  remind: { show: CLOSE, at: 100 },
  // Three widgets, one home screen each.
  widgets: { show: 1, at: 0 },
  // The To-Do widget and the "done" note under it.
  widget_done: { show: CLOSE, at: 100 },
  // The lock screen's own button is what says it is the lock screen, so it stays in.
  lock_screen: { show: 1, at: 0 },
};

/** Cases whose own step shows something other than the whole screen. */
const OVERRIDES: Partial<Record<`${CaseId}/${StepId}`, ScreenFocus>> = {
  // A class's details, opened as a sheet over the timetable.
  'university/unique': { show: CLOSE, at: 100 },
  // The sheet for switching between the two children's timetables.
  'after_school/unique': { show: CLOSE, at: 100 },
};

export function screenFocus(c: CaseId, step: StepId): ScreenFocus {
  return OVERRIDES[`${c}/${step}`] ?? BY_STEP[step];
}

/** Which sides of the capture the window cuts, so the edge there can be softened. */
export function screenCut({ show, at }: ScreenFocus): ScreenCut {
  if (show >= 1) return 'none';
  if (at <= 0) return 'bottom';
  if (at >= 100) return 'top';
  return 'both';
}

/** What the markup says, for the build test and for reading the HTML. */
export function screenFocusLabel(focus: ScreenFocus): string {
  return focus.show >= 1 ? 'whole' : `${Math.round(focus.show * 100)}% at ${focus.at}%`;
}
