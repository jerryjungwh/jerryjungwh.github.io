import type { CtaId } from '../data/cta';
import { CASE_SLUG, type CaseId, type Lang, type PageKey } from './types';

export type { CtaId };

export const SITE_ORIGIN = 'https://simganpyo.com';
export const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.jjsoft.android.simplescheduler';
export const APP_STORE_URL = 'https://apps.apple.com/app/id1382292428';

/** Path without the language prefix, e.g. '/for/middle-school/'. */
function basePath(page: PageKey): string {
  if (page === 'home') return '/';
  if (page === 'faq' || page === 'about') return `/${page}/`;
  return `/for/${CASE_SLUG[page.slice('for_'.length) as CaseId]}/`;
}

export function pagePath(lang: Lang, page: PageKey): string {
  return (lang === 'en' ? '/en' : '') + basePath(page);
}

export function absoluteUrl(path: string): string {
  return SITE_ORIGIN + path;
}

export function alternates(page: PageKey): { ko: string; en: string; xDefault: string } {
  const en = absoluteUrl(pagePath('en', page));
  return { ko: absoluteUrl(pagePath('ko', page)), en, xDefault: en };
}

/** Page label used in Play referrer values: '/for/middle-school/' → 'for_middle-school', '/' → 'home'. */
export function pageLabel(page: PageKey): string {
  return basePath(page).replace(/^\/|\/$/g, '').replaceAll('/', '_') || 'home';
}

/**
 * The Play link written into the HTML at build time. Its source is always 'static':
 * visits where the runtime builder did not run (no script, crawlers, AI answers quoting the link).
 */
export function staticPlayUrl(lang: Lang, page: PageKey, cta: CtaId): string {
  const label = pageLabel(page);
  const referrer = `utm_source=static&utm_medium=web&utm_campaign=site_${lang}_${label}&utm_content=${label}.${cta}`;
  return `${PLAY_URL}&referrer=${encodeURIComponent(referrer)}`;
}

/**
 * Play link for places a machine reads rather than a person clicks: structured data and /llms.txt.
 * Each has its own source so installs that come through them can be told apart.
 */
export function machinePlayUrl(lang: Lang, source: 'jsonld' | 'llms_txt'): string {
  const referrer = `utm_source=${source}&utm_medium=web&utm_campaign=site_${lang}_${source}&utm_content=${source}`;
  return `${PLAY_URL}&referrer=${encodeURIComponent(referrer)}`;
}
