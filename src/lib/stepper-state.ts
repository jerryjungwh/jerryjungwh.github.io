import type { Device, Media } from './types';

export interface StepperState {
  caseIndex: number;
  stepIndex: number;
  elapsedMs: number;
  paused: boolean;
  device: Device;
}

export type StepperEvent =
  | { type: 'tick'; dtMs: number; stepDurationMs: number }
  /** `atMs`: where in the step to start. A paused visitor sees ② fully stacked (see restFrame). */
  | { type: 'selectStep'; stepIndex: number; atMs?: number }
  | { type: 'selectCase'; caseIndex: number }
  /** `atMs` when pausing: a stacking screen stops on its full week (see restFrame). Resuming keeps the time. */
  | { type: 'togglePause'; atMs?: number }
  /** A paused visitor asks for the next frame of a sequence. After the last frame comes the first. */
  | { type: 'nextFrame'; frames: number; frameMs: number }
  | { type: 'setDevice'; device: Device; atMs?: number };

export interface StepperDims {
  cases: number;
  steps: number;
  /** Case pages show one case only: after the last step they loop back to its first step. */
  fixedCase: boolean;
}

/** A tab that was in the background reports one huge frame gap. Never let it skip steps. */
export const MAX_TICK_MS = 250;

const IMAGE_MS = 5000;
const SEQUENCE_HOLD_MS = 2500;
const VIDEO_HOLD_MS = 1500;

export function initialState(caseIndex: number, paused: boolean): StepperState {
  return { caseIndex, stepIndex: 0, elapsedMs: 0, paused, device: 'phone' };
}

function advance(s: StepperState, d: StepperDims): StepperState {
  if (s.stepIndex + 1 < d.steps) return { ...s, stepIndex: s.stepIndex + 1, elapsedMs: 0 };
  const caseIndex = d.fixedCase ? s.caseIndex : (s.caseIndex + 1) % d.cases;
  return { ...s, caseIndex, stepIndex: 0, elapsedMs: 0 };
}

export function reduce(s: StepperState, e: StepperEvent, d: StepperDims): StepperState {
  switch (e.type) {
    case 'tick': {
      if (s.paused) return s;
      const elapsedMs = s.elapsedMs + Math.min(Math.max(e.dtMs, 0), MAX_TICK_MS);
      return elapsedMs >= e.stepDurationMs ? advance(s, d) : { ...s, elapsedMs };
    }
    case 'selectStep':
      if (e.stepIndex < 0 || e.stepIndex >= d.steps) return s;
      return { ...s, stepIndex: e.stepIndex, elapsedMs: e.atMs ?? 0 };
    case 'selectCase':
      if (e.caseIndex < 0 || e.caseIndex >= d.cases) return s;
      return { ...s, caseIndex: e.caseIndex, stepIndex: 0, elapsedMs: 0 };
    case 'togglePause':
      return s.paused ? { ...s, paused: false } : { ...s, paused: true, elapsedMs: Math.max(s.elapsedMs, e.atMs ?? 0) };
    case 'nextFrame': {
      if (e.frames < 2 || e.frameMs <= 0) return s;
      const next = (sequenceFrameIndex(e.frames, e.frameMs, s.elapsedMs) + 1) % e.frames;
      return { ...s, elapsedMs: next * e.frameMs };
    }
    case 'setDevice':
      return { ...s, device: e.device, elapsedMs: e.atMs ?? 0 };
  }
}

/** A sequence that turns faster than it holds is ② stacking classes up (0.7 s a screen). */
function isStacking(m: Media): boolean {
  return m.kind === 'sequence' && m.frameMs < SEQUENCE_HOLD_MS;
}

/**
 * The frame to show when nothing moves: without the script, paused, or with less motion asked for. A stacking
 * sequence shows its last screen, the full week its copy talks about; any other sequence its first.
 */
export function restFrame(m: Media): number {
  return isStacking(m) && m.kind === 'sequence' ? m.frames.length - 1 : 0;
}

/** How long a step stays before auto-advance. */
export function stepDurationMs(m: Media): number {
  switch (m.kind) {
    case 'image':
      return IMAGE_MS;
    case 'sequence': {
      const hold = isStacking(m) ? SEQUENCE_HOLD_MS : 0;
      return m.frames.length * m.frameMs + hold;
    }
    case 'video':
      return m.durationMs + VIDEO_HOLD_MS;
  }
}

/**
 * Case pages put two or three sentences on a step. The step stays long enough to read them:
 * 2 seconds plus 60 ms per character, and never shorter than the screen itself needs.
 */
export function stepStayMs(m: Media, text: string): number {
  return Math.max(stepDurationMs(m), 2000 + 60 * text.length);
}

/** Which frame of a sequence is showing after `elapsedMs` (last frame holds). */
export function sequenceFrameIndex(frames: number, frameMs: number, elapsedMs: number): number {
  return Math.min(frames - 1, Math.max(0, Math.floor(elapsedMs / frameMs)));
}
