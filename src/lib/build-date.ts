/** Date shown as "최근 업데이트". The deploy workflow sets SITE_UPDATED; local builds use today. */
export const BUILD_DATE: string = process.env.SITE_UPDATED ?? new Date().toISOString().slice(0, 10);
