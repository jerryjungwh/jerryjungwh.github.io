import { CASE_ORDER, type PageKey } from '../lib/types';

/**
 * Where store links sit. The growth report reads these values (data-cta, utm_content),
 * so tell the growth session the date whenever this list changes.
 */
export const CTA_IDS = ['hero', 'page_end', 'qr'] as const;
export type CtaId = (typeof CTA_IDS)[number];

/** Pages whose install area shows a QR: the home page and the case pages. */
export const QR_PAGES: PageKey[] = ['home', ...CASE_ORDER.map((id) => `for_${id}` as PageKey)];
