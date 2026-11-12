import type { CaseDef, FaqItem, Lang, SiteStrings } from '../lib/types';
import { CASES_KO } from './cases.ko';
import { FAQ_KO, type FaqGroup } from './faq.ko';
import { SITE_KO } from './site.ko';

/** One place that maps a language to its copy. English arrives with the English pages. */
function only<T>(lang: Lang, ko: T): T {
  if (lang === 'ko') return ko;
  throw new Error(`'${lang}' 문구가 아직 없다`);
}

export const siteStrings = (lang: Lang): SiteStrings => only(lang, SITE_KO);
export const caseDefs = (lang: Lang): CaseDef[] => only(lang, CASES_KO);
export const faqGroups = (lang: Lang): FaqGroup[] => only(lang, FAQ_KO);

/** The few questions shown on the home page. */
export function homeFaq(lang: Lang): FaqItem[] {
  return faqGroups(lang).flatMap((g) => g.items.filter((i) => i.home).map(({ q, a }) => ({ q, a })));
}
