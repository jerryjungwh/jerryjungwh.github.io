import type { CaptureEntry } from '../src/data/captures.ts';
import { CASE_SLUG, type Device, type Lang, type StepId } from '../src/lib/types.ts';
import type { CaptureFixture } from './fixture.ts';

/** The parts of a capture run that decide something. Running adb and converting files is capture/run.ts. */

export type Manifest = Record<string, CaptureEntry>;

/**
 * The serial to capture on, from the output of `adb devices`. Only a running emulator qualifies, and only
 * when it is the only one: a real phone attached over USB or wireless adb is never returned.
 */
export function pickEmulator(adbDevicesOutput: string): string {
  const ready = adbDevicesOutput
    .split('\n')
    .map((line) => line.trim().split(/\s+/))
    .filter(([serial, state]) => state === 'device' && /^emulator-\d+$/.test(serial ?? ''))
    .map(([serial]) => serial);
  if (ready.length === 0) throw new Error('켜져 있는 에뮬레이터가 없다. 실제 기기에서는 찍지 않는다.');
  if (ready.length > 1) throw new Error(`에뮬레이터는 하나만 켠다 (지금 ${ready.join(', ')})`);
  return ready[0];
}

const STEPS: StepId[] = ['create', 'fill', 'unique', 'todo', 'remind', 'widgets', 'widget_done', 'lock_screen'];

/**
 * Files the instrumented test leaves for each step (SiteCaptureInstrumentedTest in the app repository):
 * '<step>.png' for one screen, '<step>-1.png', '<step>-2.png', … for several. The recording's still is
 * a screenshot right after its last tap (the To-Do completed, with the app's toast), so a visitor without the
 * video still sees it done.
 */
function stepFiles(f: CaptureFixture, step: StepId): string[] {
  const frames = (n: number) => (n === 1 ? [`${step}.png`] : Array.from({ length: n }, (_, i) => `${step}-${i + 1}.png`));
  switch (step) {
    case 'unique':
      return frames(f.steps.unique.alts.length);
    case 'todo':
      return frames(f.steps.todo.alts.length);
    case 'remind':
      return frames(2);
    case 'widgets':
      return frames(3);
    case 'widget_done':
      return ['widget_done-after.png', 'widget_done.mp4'];
    default:
      return frames(1);
  }
}

const WIDGET_LABELS: Record<Lang, [string, string, string]> = {
  ko: ['주간표', '오늘 통합', 'To-Do'],
  en: ['Weekly', 'Today overview', 'To-Do'],
};
const FRAME_MS = 2500;

/** The steps this fixture can be captured for. A background step without a photo is left as a placeholder. */
function capturedSteps(f: CaptureFixture): StepId[] {
  const noPhoto = f.steps.unique.screen === 'background' && !f.timetables[0].unique?.backgroundImage;
  return STEPS.filter((step) => !(step === 'unique' && noPhoto));
}

export function expectedFiles(f: CaptureFixture): string[] {
  return capturedSteps(f).flatMap((step) => stepFiles(f, step));
}

/**
 * Manifest cells for one case on one device, once every expected file is there. With a file missing it
 * returns nothing, so a failed run never leaves a case half old and half new.
 */
export function completeCells(f: CaptureFixture, device: Device, presentFiles: string[], video: { durationMs: number }): Manifest {
  if (expectedFiles(f).some((file) => !presentFiles.includes(file))) return {};
  const dir = `/captures/${f.lang}/${CASE_SLUG[f.case]}/${device}/`;
  const image = (name: string, alt: string) => ({ kind: 'image' as const, src: `${dir}${name}.webp`, alt });
  /** One alt: a single screen. More: a sequence, one frame per alt, in the files' order. */
  const screens = (step: StepId, alts: string[]): CaptureEntry['media'] =>
    alts.length === 1
      ? image(step, alts[0])
      : { kind: 'sequence', frameMs: FRAME_MS, frames: alts.map((alt, i) => ({ src: `${dir}${step}-${i + 1}.webp`, alt })) };
  const media: Record<StepId, CaptureEntry['media']> = {
    create: image('create', f.steps.create.alt),
    fill: image('fill', f.steps.fill.alt),
    unique: screens('unique', f.steps.unique.alts),
    todo: screens('todo', f.steps.todo.alts),
    remind: screens('remind', f.steps.remind.alts),
    widgets: {
      kind: 'sequence',
      frameMs: FRAME_MS,
      frames: f.steps.widgets.alts.map((alt, i) => ({ src: `${dir}widgets-${i + 1}.webp`, alt, label: WIDGET_LABELS[f.lang][i] })),
    },
    widget_done: { kind: 'video', src: `${dir}widget_done.mp4`, poster: `${dir}widget_done.webp`, alt: f.steps.widget_done.alt, durationMs: video.durationMs },
    lock_screen: image('lock_screen', f.steps.lock_screen.alt),
  };
  const out: Manifest = {};
  for (const step of capturedSteps(f)) out[`${f.lang}/${f.case}/${device}/${step}`] = { status: 'final', media: media[step] };
  return out;
}

/** The manifest with one case-and-device (`prefix` = 'ko/university/phone/') replaced by `cells`. Keys sorted. */
export function mergeManifest(old: Manifest, cells: Manifest, prefix: string): Manifest {
  const kept = Object.entries(old).filter(([key]) => !key.startsWith(prefix));
  return Object.fromEntries([...kept, ...Object.entries(cells)].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}
