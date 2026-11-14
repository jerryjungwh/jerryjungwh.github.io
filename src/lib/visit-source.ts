import type { Lang } from './types';
import { SITE_ORIGIN } from './origins';

/**
 * Where a visit came from, and the Play link that carries it.
 *
 * The site never classifies a visit ("search", "AI", "social"). It passes the host name on and the
 * growth report classifies, in one place. Every Play link on the site is built here, so a link is
 * never left without a referrer: an install from a link with none is recorded as "no source".
 *
 * The rules are `claude-docs/growth/homepage-gtm-request-2026-11-12.md` 2-3.
 */

export interface StoredSource {
  /** utm_source: where this visit came from. */
  s: string;
  /** utm_campaign: the post or the entry page it came in through. */
  c: string;
}

export interface VisitContext {
  /** location.hostname */
  hostname: string;
  /** location.search of the entry page */
  search: string;
  /** document.referrer */
  referrer: string;
  /** Language of the entry page. */
  lang: Lang;
  /** Page label of the entry page ('home', 'for_university', 'notfound'). */
  page: string;
  /** What an earlier page of this visit put in sessionStorage, if anything. */
  stored: StoredSource | null;
}

const SITE_HOST = new URL(SITE_ORIGIN).hostname;
const FIELD_MAX = 60;

/** Play reads these as one string, so a field keeps to lowercase letters, digits, dot, underscore, hyphen. */
export function cleanField(value: string): string {
  const kept = value
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, FIELD_MAX);
  return kept || 'invalid';
}

/** The same site: the host the page is on, give or take a `www.`. A test copy is its own site. */
function sameSite(host: string, current: string): boolean {
  const bare = (h: string) => h.replace(/^www\./, '');
  return bare(host) === bare(current);
}

/** The host a referrer names, with the `www.` or `m.` people never type. */
function fromReferrer(referrer: string, current: string): string | null {
  if (referrer.startsWith('android-app://')) return cleanField(referrer.slice('android-app://'.length).split('/')[0]);
  let url: URL;
  try {
    url = new URL(referrer);
  } catch {
    return null;
  }
  if (sameSite(url.hostname, current)) return null;
  return cleanField(url.hostname.replace(/^(www|m)\./, ''));
}

export function resolveVisitSource(ctx: VisitContext): StoredSource {
  const params = new URLSearchParams(ctx.search);
  const campaign = () => {
    const named = params.get('utm_campaign');
    return named ? cleanField(named) : cleanField(`site_${ctx.lang}_${ctx.page}`);
  };
  // A host that is not the live site is a local or test copy: everything it makes is marked as a
  // test, so the report can leave it out. Which host counts as "the same site" for a referrer is a
  // different question, and is answered against the host the page is actually on.
  const onLiveSite = sameSite(ctx.hostname, SITE_HOST);
  const stamp = (source: StoredSource): StoredSource => (onLiveSite ? source : { ...source, s: 'test_site' });

  // 1. A link that carries its own source. It is a new visit, so it replaces what was stored.
  const named = params.get('utm_source');
  if (named) return stamp({ s: cleanField(named), c: campaign() });

  // 2. Arrived from somewhere that is not the site. Also a new visit.
  const host = ctx.referrer ? fromReferrer(ctx.referrer, ctx.hostname) : null;
  if (host) return stamp({ s: host, c: campaign() });

  // 3. Another page of the same visit.
  if (ctx.stored) return stamp(ctx.stored);

  // 4. The address was typed, or the browser inside an app gave no referrer.
  if (!ctx.referrer) return stamp({ s: 'noref', c: campaign() });

  // 5. Came from the site itself with nothing stored: the source was lost on the way.
  return stamp({ s: 'internal', c: campaign() });
}
