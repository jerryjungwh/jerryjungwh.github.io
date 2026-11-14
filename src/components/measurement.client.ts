import { CONSENT_COPY } from '../data/consent-copy';
import { CONSENT_KEY, isEuropeTimeZone } from '../data/measurement';
import { SITE_ORIGIN } from '../lib/origins';
import { playUrlWith } from '../lib/urls';
import type { Lang } from '../lib/types';
import { resolveVisitSource, type StoredSource } from '../lib/visit-source';

/**
 * What the site itself does about measurement.
 *
 * Two jobs, and they are the same decision twice: where the consent default is "denied" nothing
 * happens until the visitor says yes — no Google tag (GTM holds that back itself) and no reading or
 * keeping of where the visit came from. Everywhere else both run as the page opens.
 *
 * The site is static and cannot know the visitor's country, so it goes by the browser's time zone.
 * GTM makes the same call by region for the tag; this one only governs the site's own code.
 */

const SOURCE_KEY = 'simganpyo.source';

/** Private windows and blocked storage throw rather than return null, so every use is wrapped. */
function readStore(store: 'session' | 'local', key: string): string | null {
  try {
    return (store === 'session' ? sessionStorage : localStorage).getItem(key);
  } catch {
    return null;
  }
}

function writeStore(store: 'session' | 'local', key: string, value: string): void {
  try {
    (store === 'session' ? sessionStorage : localStorage).setItem(key, value);
  } catch {
    /* The visit still works; it just starts over on the next page. */
  }
}

function storedSource(): StoredSource | null {
  const raw = readStore('session', SOURCE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredSource>;
    return typeof parsed.s === 'string' && typeof parsed.c === 'string' ? { s: parsed.s, c: parsed.c } : null;
  } catch {
    return null;
  }
}

function timeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

/** True where Google's EU user consent policy applies, so nothing may run before a yes. */
export function consentNeeded(): boolean {
  return isEuropeTimeZone(timeZone());
}

export function consentChoice(): 'granted' | 'denied' | null {
  const value = readStore('local', CONSENT_KEY);
  return value === 'granted' || value === 'denied' ? value : null;
}

/**
 * Tells the container the visitor said yes. This is the documented shim: gtag.js itself is not
 * loaded (GTM loads GA4), and what the container reads off dataLayer is an `arguments` object,
 * not a plain array, so the push has to come from a real function call.
 */
function grantAnalyticsConsent(): void {
  const w = window as unknown as { dataLayer?: IArguments[] };
  w.dataLayer = w.dataLayer ?? [];
  (function gtag(..._args: unknown[]) {
    w.dataLayer!.push(arguments);
  })('consent', 'update', { analytics_storage: 'granted' });
}

/**
 * Writes this visit's source into every Play link on the page, once, as the page opens. The links
 * are real links with a working address already; this only replaces `static` with where the visit
 * came from. Never on press: the tag reads the address from the link.
 */
export function writeStoreLinks(): void {
  const root = document.documentElement;
  const lang: Lang = root.dataset.lang === 'en' ? 'en' : 'ko';
  const page = root.dataset.page || 'home';
  const source = resolveVisitSource({
    hostname: location.hostname,
    search: location.search,
    referrer: document.referrer,
    lang,
    page,
    stored: storedSource(),
  });
  writeStore('session', SOURCE_KEY, JSON.stringify(source));
  document.querySelectorAll<HTMLAnchorElement>('a[data-store="google_play"][data-cta]').forEach((link) => {
    link.href = playUrlWith(source, page, link.dataset.cta!);
  });
  document.dispatchEvent(new CustomEvent('simganpyo:source', { detail: source }));
}

function mountBanner(lang: Lang): void {
  const banner = document.querySelector<HTMLElement>('[data-consent]');
  if (!banner) return;
  const copy = CONSENT_COPY[lang];
  banner.setAttribute('aria-label', copy.label);
  const policy = `${SITE_ORIGIN}/SimpleScheduler-Android/${lang === 'en' ? 'en/' : ''}`;
  const text = document.createElement('p');
  text.textContent = `${copy.body} `;
  const more = document.createElement('a');
  more.href = policy;
  more.textContent = copy.more;
  text.append(more);
  const buttons = document.createElement('div');
  for (const [choice, label] of [
    ['granted', copy.accept],
    ['denied', copy.decline],
  ] as const) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.consentChoice = choice;
    button.textContent = label;
    buttons.append(button);
  }
  banner.replaceChildren(text, buttons);
  banner.hidden = false;
  banner.addEventListener('click', (event) => {
    const choice = (event.target as Element).closest<HTMLElement>('[data-consent-choice]')?.dataset.consentChoice;
    if (choice !== 'granted' && choice !== 'denied') return;
    writeStore('local', CONSENT_KEY, choice);
    banner.hidden = true;
    if (choice !== 'granted') return;
    grantAnalyticsConsent();
    writeStoreLinks();
    document.documentElement.dataset.measurement = 'on';
  });
}

export function startMeasurement(): void {
  const root = document.documentElement;
  const lang: Lang = root.dataset.lang === 'en' ? 'en' : 'ko';
  const blocked = consentNeeded() && consentChoice() !== 'granted';
  if (!blocked) writeStoreLinks();
  if (consentNeeded() && consentChoice() === null) mountBanner(lang);
  // What the site decided, on the element itself: 'on' wrote the source into the links, 'held' is
  // waiting for a yes. It is how the checks know the script has run, and how to read a live page.
  root.dataset.measurement = blocked ? 'held' : 'on';
}
