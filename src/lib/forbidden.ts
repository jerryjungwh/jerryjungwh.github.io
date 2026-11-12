import type { Lang } from './types';

/**
 * Words the site must not use: features the app does not have, ranking claims,
 * and sentences that address under-16 users (the declared target age is 16+).
 */
export const FORBIDDEN: Record<Lang, string[]> = {
  ko: ['캘린더', '날짜별 일정', '동기화', '클라우드', '1위', '최고', '초등학생은', '중학생은', '초등학생이라면', '중학생이라면'],
  en: ['calendar', 'sync', 'cloud', '#1', 'best timetable', 'for kids', 'for children'],
};

export function findForbidden(text: string, lang: Lang): string[] {
  const haystack = lang === 'en' ? text.toLowerCase() : text;
  return FORBIDDEN[lang].filter((word) => haystack.includes(word));
}
