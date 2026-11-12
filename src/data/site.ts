import type { Lang } from '../lib/types';
import { SITE_KO, type SiteStrings } from './site.ko';

/** Site strings for a language. English arrives with the English pages. */
export function siteStrings(lang: Lang): SiteStrings {
  if (lang === 'ko') return SITE_KO;
  throw new Error(`siteStrings: '${lang}' 문구가 아직 없다`);
}
