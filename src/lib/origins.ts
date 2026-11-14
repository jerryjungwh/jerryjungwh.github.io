/**
 * The three addresses everything else is built from. They live apart from `urls.ts` so that the
 * module that works out where a visit came from can read the site's own host without importing the
 * module that imports it back.
 */
export const SITE_ORIGIN = 'https://simganpyo.com';
export const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.jjsoft.android.simplescheduler';
export const APP_STORE_URL = 'https://apps.apple.com/app/id1382292428';
