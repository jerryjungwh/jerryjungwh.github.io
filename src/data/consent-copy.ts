import type { Lang } from '../lib/types';

/**
 * The consent banner's words. They live here rather than with the rest of the copy because the
 * banner is built by the script, only where it is needed: a visitor outside Europe never downloads
 * the markup, and the page's own HTML stays within its size budget. This is still the one place
 * these words are written.
 */
export const CONSENT_COPY: Record<Lang, { label: string; body: string; accept: string; decline: string; more: string }> = {
  ko: {
    label: '방문 통계 동의',
    body: '방문 통계를 보려고 Google Analytics 쿠키를 씁니다. 동의하지 않으면 통계를 모으지 않아요.',
    accept: '동의',
    decline: '동의 안 함',
    more: '개인정보처리방침',
  },
  en: {
    label: 'Analytics consent',
    body: 'We use Google Analytics cookies to see how the site is used. Decline and nothing is collected.',
    accept: 'Accept',
    decline: 'Decline',
    more: 'Privacy Policy',
  },
};
