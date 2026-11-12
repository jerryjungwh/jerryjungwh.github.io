/**
 * Where store links sit. The growth report reads these values (data-cta, utm_content),
 * so tell the growth session the date whenever this list changes.
 */
export const CTA_IDS = ['hero', 'page_end', 'qr'] as const;
export type CtaId = (typeof CTA_IDS)[number];
