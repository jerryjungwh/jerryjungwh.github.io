import { caseDefs, siteStrings } from '../data/site';
import { BUILD_DATE } from './build-date';
import type { CaseDef, FaqItem, Lang, PageKey } from './types';
import { APP_STORE_URL, PLAY_URL, absoluteUrl, machinePlayUrl, pagePath } from './urls';

export interface PageMeta {
  title: string;
  description: string;
}

const CONTEXT = 'https://schema.org';
const MAKER = { '@type': 'Person', name: 'Jerry Jung', alternateName: '정우현' };
/** Every name people search for. A page lists the ones that are not its own name. */
const ALTERNATE_NAMES = ['심간표', '심플시간표', 'SimpleScheduler', 'Simganpyo'];

function caseOf(lang: Lang, page: PageKey): CaseDef | undefined {
  return caseDefs(lang).find((c) => `for_${c.id}` === page);
}

/** Title and description of a page: the one place they are decided. */
export function pageMeta(lang: Lang, page: PageKey): PageMeta {
  const t = siteStrings(lang);
  if (page === 'home') return { title: t.home.title, description: t.home.description };
  if (page === 'faq') return { title: t.faqPage.title, description: t.faqPage.description };
  if (page === 'about') return { title: t.about.title, description: t.about.description };
  const c = caseOf(lang, page)!;
  return { title: t.casePage.title(c.name), description: c.intro };
}

/** Name of a page as it appears in the "you are here" trail. */
function pageName(lang: Lang, page: PageKey): string {
  const t = siteStrings(lang);
  if (page === 'home') return t.appName;
  if (page === 'faq') return t.faqPage.h1;
  if (page === 'about') return t.about.h1;
  return caseOf(lang, page)!.name;
}

/**
 * The app, described as the Android app (that is the full version). The App Store address appears only
 * in sameAs. No ratings: the site does not publish any.
 */
export function appJsonLd(lang: Lang): object {
  const t = siteStrings(lang);
  return {
    '@context': CONTEXT,
    '@type': 'MobileApplication',
    name: t.appName,
    alternateName: ALTERNATE_NAMES.filter((n) => n !== t.appName),
    description: t.what.definition,
    operatingSystem: 'Android 7.0',
    applicationCategory: 'ProductivityApplication',
    url: absoluteUrl(pagePath(lang, 'home')),
    installUrl: machinePlayUrl(lang, 'jsonld'),
    sameAs: [PLAY_URL, APP_STORE_URL],
    inLanguage: ['ko', 'en', 'ja', 'zh-Hans'],
    offers: { '@type': 'Offer', price: '0', priceCurrency: lang === 'ko' ? 'KRW' : 'USD' },
    author: MAKER,
    dateModified: BUILD_DATE,
  };
}

export function webSiteJsonLd(lang: Lang): object {
  const t = siteStrings(lang);
  return {
    '@context': CONTEXT,
    '@type': 'WebSite',
    name: t.appName,
    alternateName: ALTERNATE_NAMES.filter((n) => n !== t.appName),
    url: absoluteUrl(pagePath(lang, 'home')),
    inLanguage: lang,
    publisher: MAKER,
  };
}

export function breadcrumbJsonLd(lang: Lang, page: PageKey): object {
  const trail: PageKey[] = page === 'home' ? ['home'] : ['home', page];
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: pageName(lang, p),
      item: absoluteUrl(pagePath(lang, p)),
    })),
  };
}

/** Questions and answers exactly as the page shows them. */
export function faqJsonLd(items: FaqItem[]): object {
  return {
    '@context': CONTEXT,
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
}

/** Structured data for a page. `faq` is the list the page shows, when it shows one of its own. */
export function pageJsonLd(lang: Lang, page: PageKey, faq?: FaqItem[]): object[] {
  const out: object[] = [];
  if (page === 'home' || page === 'about') out.push(appJsonLd(lang), webSiteJsonLd(lang));
  if (page !== 'home') out.push(breadcrumbJsonLd(lang, page));
  if (faq && faq.length > 0) out.push(faqJsonLd(faq));
  return out;
}
