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
 * `aria-current`, `aria-pressed`, the frame of a sequence and the progress marker.
 * It never calls focus() and never touches history or the URL.
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

/** Lazy images of a hidden screen have not been fetched. Ask for them before the screen shows. */
function fetchNow(figure: HTMLElement | null): void {
  figure?.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
    img.loading = 'eager';
  });
}

function mount(root: HTMLElement): void {
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

  const startId = document.documentElement.dataset.startCase;
  const startIndex = Math.max(0, cases.findIndex((c) => c.id === startId));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let state: StepperState = initialState(startIndex, reducedMotion);
  let shown: StepperState | null = null;
  let inView = true;

  const stepAt = (s: StepperState) => cases[s.caseIndex].steps[s.stepIndex];
  const figureAt = (s: StepperState) => stepAt(s).figures[s.device];
  const durationOf = (s: StepperState) => Number(figureAt(s)?.dataset.duration) || DEFAULT_STEP_MS;

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
      root.dataset.device = state.device;
      deviceButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.device === state.device)));
      fetchNow(figureAt(state));
      // Whatever comes next by itself: the following step, or the next case's first step.
      fetchNow(figureAt(reduce({ ...state, paused: false }, { type: 'tick', dtMs: 0, stepDurationMs: 0 }, dims)));
    }

    if (!prev || prev.paused !== state.paused) {
      if (pauseButton) {
        pauseButton.setAttribute('aria-pressed', String(state.paused));
        const label = state.paused ? pauseButton.dataset.labelResume : pauseButton.dataset.labelPause;
        if (label) pauseButton.textContent = label;
      }
      setFlag(root, 'data-paused', state.paused);
    }

    const figure = figureAt(state);
    const frames = figure ? [...figure.querySelectorAll<HTMLElement>('img[data-frame]')] : [];
    if (frames.length > 0) {
      const frameMs = Number(figure!.querySelector<HTMLElement>('[data-frame-ms]')?.dataset.frameMs) || DEFAULT_STEP_MS;
      const index = sequenceFrameIndex(frames.length, frameMs, state.elapsedMs);
      frames.forEach((frame, i) => setFlag(frame, 'data-on', i === index));
      if (frameLabel) frameLabel.textContent = frames[index].dataset.label ?? '';
    } else if (frameLabel && placeChanged) {
      frameLabel.textContent = '';
    }

    stepAt(state).item.style.setProperty('--p', Math.min(1, state.elapsedMs / durationOf(state)).toFixed(3));
    shown = state;
  }

  function send(event: StepperEvent): void {
    state = reduce(state, event, dims);
    render();
  }

  root.addEventListener('click', (e) => {
    const target = e.target as Element;
    const tab = target.closest<HTMLElement>('button[data-track="case_select"]');
    if (tab) return send({ type: 'selectCase', caseIndex: cases.findIndex((c) => c.id === tab.dataset.case) });

    const action = target.closest<HTMLElement>('[data-action]');
    if (action?.dataset.action === 'toggle-pause') return send({ type: 'togglePause' });
    if (action?.dataset.action === 'device') return send({ type: 'setDevice', device: action.dataset.device as Device });

    const item = target.closest<HTMLElement>('li[data-step]');
    if (item) {
      const stepIndex = cases[state.caseIndex].steps.findIndex((s) => s.item === item);
      send({ type: 'selectStep', stepIndex });
    }
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      inView = entries[entries.length - 1].isIntersecting;
    }).observe(root);
  }

  let last: number | null = null;
  function frame(now: number): void {
    // A hidden tab or a stepper scrolled out of view does not advance, and the gap is not counted later.
    if (document.hidden || !inView) {
      last = null;
    } else {
      const dtMs = last === null ? 0 : Math.min(now - last, MAX_TICK_MS);
      last = now;
      if (!state.paused) send({ type: 'tick', dtMs, stepDurationMs: durationOf(state) });
    }
    window.requestAnimationFrame(frame);
  }

  render();
  window.requestAnimationFrame(frame);
  root.setAttribute('data-ready', '');
  (window as unknown as { __stepper?: { getState(): StepperState } }).__stepper = { getState: () => ({ ...state }) };
}

export function mountSteppers(): void {
  document.querySelectorAll<HTMLElement>('[data-stepper]:not([data-ready])').forEach(mount);
}
