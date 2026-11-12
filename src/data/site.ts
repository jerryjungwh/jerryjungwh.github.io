import type { CaseDef, FaqItem, Lang, SiteStrings } from '../lib/types';
import { CASES_EN } from './cases.en';
import { CASES_KO } from './cases.ko';
import { FAQ_EN } from './faq.en';
import { FAQ_KO, type FaqGroup } from './faq.ko';
import { SITE_EN } from './site.en';
import { SITE_KO } from './site.ko';

/** The one place that maps a language to its copy. */
const COPY: Record<Lang, { site: SiteStrings; cases: CaseDef[]; faq: FaqGroup[] }> = {
  ko: { site: SITE_KO, cases: CASES_KO, faq: FAQ_KO },
  en: { site: SITE_EN, cases: CASES_EN, faq: FAQ_EN },
};

export const siteStrings = (lang: Lang): SiteStrings => COPY[lang].site;
export const caseDefs = (lang: Lang): CaseDef[] => COPY[lang].cases;
export const faqGroups = (lang: Lang): FaqGroup[] => COPY[lang].faq;

/** The few questions shown on the home page. */
export function homeFaq(lang: Lang): FaqItem[] {
  return faqGroups(lang).flatMap((g) => g.items.filter((i) => i.home).map(({ q, a }) => ({ q, a })));
}
