import { CASE_ORDER, STEP_ORDER, type CaseId, type Device, type Lang, type Media, type StepId } from '../lib/types';
import manifest from './captures.manifest.json';

/**
 * Which real app screen each step shows. Screens are captured from the emulator (capture/run.ts);
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

/**
 * The screens that exist, keyed 'ko/university/phone/fill'. capture/run.ts rewrites this file after a capture
 * run (one case on one device at a time); cells it does not list show the placeholder.
 */
const MANIFEST = manifest as Partial<Record<`${Lang}/${CaseId}/${Device}/${StepId}`, CaptureEntry>>;

function build(): Record<Lang, Record<CaseId, Record<Device, Record<StepId, CaptureEntry>>>> {
  const out = {} as Record<Lang, Record<CaseId, Record<Device, Record<StepId, CaptureEntry>>>>;
  for (const lang of LANGS) {
    out[lang] = {} as (typeof out)[Lang];
    for (const c of CASE_ORDER) {
      out[lang][c] = {} as (typeof out)[Lang][CaseId];
      for (const device of DEVICES) {
        out[lang][c][device] = {} as Record<StepId, CaptureEntry>;
        for (const step of STEP_ORDER)
          out[lang][c][device][step] = MANIFEST[`${lang}/${c}/${device}/${step}`] ?? pendingEntry(lang, device);
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
