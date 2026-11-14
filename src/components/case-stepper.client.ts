import {
  MAX_TICK_MS,
  initialState,
  reduce,
  sequenceFrameIndex,
  type StepperDims,
  type StepperEvent,
  type StepperState,
} from '../lib/stepper-state';
import type { Device } from '../lib/types';

/**
 * Behaviour of the case stepper. All content is already in the HTML; this only moves `data-active`,
 * `aria-current`, `aria-pressed`, the frame of a sequence, the progress marker, and plays the recording
 * of the step in view, and opens a screen at its original size ("view larger") in a <dialog>.
 * Stepping never calls focus() and never touches history or the URL. Focus moves only into the window the
 * visitor opened, and back to the button that opened it when it closes.
 */

interface StepNodes {
  item: HTMLElement;
  button: HTMLElement;
  figures: Record<Device, HTMLElement | null>;
}

interface CaseNodes {
  id: string;
  article: HTMLElement;
  tab: HTMLElement | null;
  steps: StepNodes[];
}

const DEFAULT_STEP_MS = 5000;

function readCases(root: HTMLElement): CaseNodes[] {
  return [...root.querySelectorAll<HTMLElement>('article[data-case]')].map((article) => {
    const id = article.dataset.case!;
    const figure = (step: string, device: Device) =>
      article.querySelector<HTMLElement>(`figure[data-media][data-step="${step}"][data-device="${device}"]`);
    return {
      id,
      article,
      tab: root.querySelector<HTMLElement>(`button[data-track="case_select"][data-case="${id}"]`),
      steps: [...article.querySelectorAll<HTMLElement>('li[data-step]')].map((item) => ({
        item,
        button: item.querySelector<HTMLElement>('button')!,
        figures: { phone: figure(item.dataset.step!, 'phone'), tablet: figure(item.dataset.step!, 'tablet') },
      })),
    };
  });
}

function setFlag(el: Element | null, name: string, on: boolean): void {
  if (!el) return;
  if (on) el.setAttribute(name, '');
  else el.removeAttribute(name);
}

/** Where a paused stepper starts a screen: ② on its full week (data-rest-frame), anything else at its start. */
function restMs(figure: HTMLElement | null): number {
  const media = figure?.querySelector<HTMLElement>('[data-rest-frame]');
  return media ? Number(media.dataset.restFrame) * (Number(media.dataset.frameMs) || 0) : 0;
}

/**
 * Lazy images of a hidden screen have not been fetched. Ask for them before the screen shows. With `video`, a
 * recording there is fetched too: the still under it shows the To-Do completed, so a recording
 * that is not loaded when its step starts would show the end first and then jump back to before the tap.
 */
function fetchNow(figure: HTMLElement | null, video = false): void {
  figure?.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
    img.loading = 'eager';
  });
  if (video) figure?.querySelectorAll<HTMLVideoElement>('video[data-video]').forEach((v) => (v.preload = 'auto'));
}

function mount(root: HTMLElement): void {
  // The page already went back to the plain document (this script arrived too late). Stay out of it:
  // running hidden would still advance and download screens nobody sees.
  if (!document.documentElement.classList.contains('js')) return;
  const cases = readCases(root);
  if (cases.length === 0 || cases.some((c) => c.steps.length === 0)) return;

  const dims: StepperDims = {
    cases: cases.length,
    steps: cases[0].steps.length,
    fixedCase: root.hasAttribute('data-fixed-case') || cases.length === 1,
  };
  const pauseButton = root.querySelector<HTMLElement>('[data-action="toggle-pause"]');
  const deviceButtons = [...root.querySelectorAll<HTMLElement>('[data-action="device"]')];
  const frameLabel = root.querySelector<HTMLElement>('[data-frame-label]');
  const stepNow = root.querySelector<HTMLElement>('[data-step-now]');
  const videos = [...root.querySelectorAll<HTMLVideoElement>('video[data-video]')];

  const startId = document.documentElement.dataset.startCase;
  const startIndex = Math.max(0, cases.findIndex((c) => c.id === startId));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let state: StepperState = initialState(startIndex, reducedMotion);
  let shown: StepperState | null = null;
  let inView = true;

  const stepAt = (s: StepperState) => cases[s.caseIndex].steps[s.stepIndex];
  const figureAt = (s: StepperState) => stepAt(s).figures[s.device];
  const durationOf = (s: StepperState) => Number(figureAt(s)?.dataset.duration) || DEFAULT_STEP_MS;

  /** Recordings this script has asked to play and not stopped since. */
  const started = new Set<HTMLVideoElement>();
  const dialog = root.querySelector<HTMLDialogElement>('dialog[data-zoom]');
  const zoomBody = dialog?.querySelector<HTMLElement>('[data-zoom-body]') ?? null;
  const zoomTitle = dialog?.querySelector<HTMLElement>('[data-zoom-title]') ?? null;
  let zoomOpener: HTMLElement | null = null;
  let zoomByPointer = false;
  /** The button a mouse visitor's window closed back onto: its focus ring is not someone reading with the keys. */
  let pointerFocus: Element | null = null;
  const zoomed = () => dialog?.open === true;
  // While the window is open the stepper and its recording wait, as when it is scrolled out of view.
  const onScreen = () => inView && !document.hidden && !zoomed();

  /**
   * Only the recording of the step in view plays, from its start, while the stepper runs and is on screen.
   * Pausing freezes it on the frame it reached. A visitor who asked for less motion starts paused, so sees
   * the still. The video is shown only once a frame from its start is on screen ('playing'): until then the
   * still image underneath stays, so neither a blank video nor the last run's final frame flashes by.
   */
  function syncVideos(placeChanged: boolean): void {
    const active = figureAt(state)?.querySelector<HTMLVideoElement>('video[data-video]') ?? null;
    for (const video of [...started]) {
      if (video === active) continue;
      video.pause();
      video.removeAttribute('data-playing');
      started.delete(video);
    }
    if (!active) return;
    if (placeChanged) {
      active.removeAttribute('data-playing');
      active.currentTime = 0;
    }
    if (state.paused || !onScreen()) {
      if (started.delete(active)) active.pause();
      return;
    }
    if (started.has(active)) return;
    // A recording plays once a step: after its end it stays on its last frame (a new place starts it over).
    if (active.ended) return;
    started.add(active);
    active.onplaying = () => active.setAttribute('data-playing', '');
    // A browser that cannot play it keeps showing the still image underneath.
    // iOS Safari refuses an auto-advanced step while nothing is buffered yet, and a refusal is final
    // here: the step would sit on its still image. play() itself starts the fetch, so wait for the
    // first frame and ask once more. Never call load(): it would rewind a part-played recording.
    let retried = false;
    const attempt = (): void => {
      // The step may have moved on while we waited: syncVideos drops it from `started`.
      if (!started.has(active)) return;
      active.play()?.catch(() => {
        if (!started.has(active)) return;
        active.removeAttribute('data-playing');
        if (retried) {
          // A browser that cannot play it keeps showing the still image underneath.
          started.delete(active);
          return;
        }
        retried = true;
        active.preload = 'auto';
        active.addEventListener('canplay', attempt, { once: true });
      });
    };
    attempt();
  }

  function render(): void {
    const prev = shown;
    const placeChanged =
      !prev || prev.caseIndex !== state.caseIndex || prev.stepIndex !== state.stepIndex || prev.device !== state.device;

    if (placeChanged) {
      cases.forEach((c, ci) => {
        const caseOn = ci === state.caseIndex;
        setFlag(c.article, 'data-active', caseOn);
        c.tab?.setAttribute('aria-pressed', String(caseOn));
        c.steps.forEach((step, si) => {
          const stepOn = caseOn && si === state.stepIndex;
          setFlag(step.item, 'data-active', stepOn);
          step.button.setAttribute('aria-current', stepOn ? 'step' : 'false');
          if (!stepOn) step.item.style.removeProperty('--p');
          setFlag(step.figures.phone, 'data-active', stepOn && state.device === 'phone');
          setFlag(step.figures.tablet, 'data-active', stepOn && state.device === 'tablet');
        });
      });
      if (stepNow) stepNow.textContent = String(state.stepIndex + 1);
      root.dataset.device = state.device;
      deviceButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.device === state.device)));
      fetchNow(figureAt(state));
    }
    if (placeChanged || prev?.paused !== state.paused) {
      // Whatever comes next by itself: the following step, or the next case's first step. A paused stepper
      // (also where less motion was asked for) plays no recording, so it does not fetch one.
      fetchNow(figureAt(reduce({ ...state, paused: false }, { type: 'tick', dtMs: 0, stepDurationMs: 0 }, dims)), !state.paused);
    }

    if (!prev || prev.paused !== state.paused) {
      if (pauseButton) {
        pauseButton.setAttribute('aria-pressed', String(state.paused));
        const label = state.paused ? pauseButton.dataset.labelResume : pauseButton.dataset.labelPause;
        if (label) pauseButton.textContent = label;
      }
      setFlag(root, 'data-paused', state.paused);
    }
    if (placeChanged || prev?.paused !== state.paused) syncVideos(placeChanged);

    const figure = figureAt(state);
    const frames = figure ? [...figure.querySelectorAll<HTMLElement>('img[data-frame]')] : [];
    if (frames.length > 0) {
      const frameMs = Number(figure!.querySelector<HTMLElement>('[data-frame-ms]')?.dataset.frameMs) || DEFAULT_STEP_MS;
      const due = sequenceFrameIndex(frames.length, frameMs, state.elapsedMs);
      // A frame that has not arrived would show as a blank screen: the one before it stays until it does.
      const arrived = (i: number) => (frames[i] as HTMLImageElement).complete && (frames[i] as HTMLImageElement).naturalWidth > 0;
      let index = due;
      while (index > 0 && !arrived(index)) index--;
      if (index !== due) frames[due].addEventListener('load', render, { once: true });
      frames.forEach((frame, i) => setFlag(frame, 'data-on', i === index));
      if (frameLabel) frameLabel.textContent = frames[index].dataset.label ?? '';
    } else if (frameLabel && placeChanged) {
      frameLabel.textContent = '';
    }

    stepAt(state).item.style.setProperty('--p', Math.min(1, state.elapsedMs / durationOf(state)).toFixed(3));
    shown = state;
  }

  /** Frames of the sequence on screen now, or null when the screen is a single image. */
  function sequenceNow(): { frames: number; frameMs: number } | null {
    const figure = figureAt(state);
    const frames = figure ? figure.querySelectorAll('img[data-frame]').length : 0;
    if (frames < 2) return null;
    const frameMs = Number(figure!.querySelector<HTMLElement>('[data-frame-ms]')?.dataset.frameMs) || DEFAULT_STEP_MS;
    return { frames, frameMs };
  }

  /**
   * Someone is reading the steps with the keyboard. Advancing would hide the element they are on
   * (the case changes) and drop their focus, so the stepper waits until focus leaves the steps.
   * A mouse click does not count: buttons do not match :focus-visible after a click.
   */
  function keyboardInSteps(): boolean {
    const el = document.activeElement;
    return el !== pointerFocus && el instanceof HTMLElement && cases[state.caseIndex].article.contains(el) && el.matches(':focus-visible');
  }
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') pointerFocus = null;
  });

  function send(event: StepperEvent): void {
    state = reduce(state, event, dims);
    render();
  }

  /** The screen in view, at its original size (the `src` every screen already has), in the window. */
  function openZoom(button: HTMLElement, byPointer: boolean): void {
    const figure = button.closest<HTMLElement>('figure[data-media]');
    const shown = figure?.querySelector<HTMLImageElement>('img[data-on]');
    if (!dialog || !zoomBody || !figure || !shown) return;
    const img = document.createElement('img');
    img.src = shown.getAttribute('src')!;
    img.alt = shown.alt;
    for (const name of ['width', 'height']) {
      const value = shown.getAttribute(name);
      if (value) img.setAttribute(name, value);
    }
    img.decoding = 'async';
    zoomBody.replaceChildren(img);
    if (zoomTitle) zoomTitle.textContent = [stepAt(state).button.textContent?.trim(), shown.dataset.label].filter(Boolean).join(' · ');
    dialog.dataset.device = figure.dataset.device;
    zoomOpener = button;
    zoomByPointer = byPointer;
    dialog.showModal();
    syncVideos(false);
  }

  dialog?.addEventListener('close', () => {
    zoomBody?.replaceChildren();
    syncVideos(false);
    if (zoomOpener && document.activeElement !== zoomOpener) zoomOpener.focus({ preventScroll: true });
    // Opened with the mouse and closed with Esc, the returned focus shows a ring; the stepper still goes on.
    pointerFocus = zoomByPointer ? zoomOpener : null;
    zoomOpener = null;
  });

  root.addEventListener('click', (e) => {
    const target = e.target as Element;
    // Inside the window: its close button, or the dark area around the picture, closes it.
    if (dialog && target.closest('dialog[data-zoom]')) {
      // The second click of a double click on 「크게 보기」 lands in the window it just opened.
      if (e.detail > 1) return;
      if (target.closest('[data-action="zoom-close"]') || !target.closest('img, .zoom-bar')) dialog.close();
      return;
    }
    // Before the paused "press the screen for the next frame" below: opening the window moves nothing.
    const zoom = target.closest<HTMLElement>('[data-action="zoom"]');
    if (zoom) return openZoom(zoom, e.detail > 0);
    const tab = target.closest<HTMLElement>('button[data-track="case_select"]');
    if (tab) return send({ type: 'selectCase', caseIndex: cases.findIndex((c) => c.id === tab.dataset.case) });

    const action = target.closest<HTMLElement>('[data-action]');
    if (action?.dataset.action === 'toggle-pause') return send({ type: 'togglePause', atMs: state.paused ? undefined : restMs(figureAt(state)) });
    if (action?.dataset.action === 'device') {
      const device = action.dataset.device as Device;
      return send({ type: 'setDevice', device, atMs: state.paused ? restMs(stepAt(state).figures[device]) : undefined });
    }

    // On a phone only the step in view is on screen; these move to the one before or after it, and
    // wrap, so neither end of the eight is a dead button.
    if (action?.dataset.action === 'step-prev' || action?.dataset.action === 'step-next') {
      const steps = cases[state.caseIndex].steps;
      const delta = action.dataset.action === 'step-next' ? 1 : steps.length - 1;
      const stepIndex = (state.stepIndex + delta) % steps.length;
      return send({ type: 'selectStep', stepIndex, atMs: state.paused ? restMs(steps[stepIndex].figures[state.device]) : undefined });
    }

    const item = target.closest<HTMLElement>('li[data-step]');
    const onScreen = target.closest<HTMLElement>('figure[data-media][data-active]');
    const stepIndex = item ? cases[state.caseIndex].steps.findIndex((s) => s.item === item) : -1;
    // While paused nothing moves by itself, so pressing the step in view (or its screen) again
    // shows the next frame of a sequence: otherwise the second and third widget would never show.
    const sequence = state.paused && (onScreen || stepIndex === state.stepIndex) ? sequenceNow() : null;
    if (sequence) return send({ type: 'nextFrame', ...sequence });
    if (item) send({ type: 'selectStep', stepIndex, atMs: state.paused ? restMs(cases[state.caseIndex].steps[stepIndex]?.figures[state.device] ?? null) : undefined });
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      inView = entries[entries.length - 1].isIntersecting;
    }).observe(root);
  }

  let last: number | null = null;
  let wasOnScreen = true;
  function frame(now: number): void {
    // The recording stops with the stepper and goes on where it was when the stepper is back.
    if (onScreen() !== wasOnScreen) {
      wasOnScreen = onScreen();
      syncVideos(false);
    }
    // A hidden tab or a stepper scrolled out of view does not advance, and the gap is not counted later.
    if (document.hidden || !inView) {
      last = null;
    } else {
      const dtMs = last === null ? 0 : Math.min(now - last, MAX_TICK_MS);
      last = now;
      if (!state.paused && !keyboardInSteps() && !zoomed()) send({ type: 'tick', dtMs, stepDurationMs: durationOf(state) });
    }
    window.requestAnimationFrame(frame);
  }

  render();
  window.requestAnimationFrame(frame);
  if (dialog && typeof dialog.showModal === 'function') root.setAttribute('data-zoom-ready', '');
  root.setAttribute('data-ready', '');
  (window as unknown as { __stepper?: { getState(): StepperState } }).__stepper = { getState: () => ({ ...state }) };
}

export function mountSteppers(): void {
  document.querySelectorAll<HTMLElement>('[data-stepper]:not([data-ready])').forEach(mount);
}
