/**
 * Measurement is one Google Tag Manager container, shared by the Korean and English pages.
 * Nothing else is loaded from outside, and no gtag.js: GTM loads GA4 itself.
 *
 * Jerry owns the container. Until its id is here the site ships with no measurement at all —
 * no script, no cookies, no requests — which is what we want before the policy's cookie section
 * is published (Google Analytics terms, clause 7).
 *
 * The policy pages are a separate repository (Jekyll) and have no container by design.
 */
export const GTM_ID = 'GTM-K26JMP72';

/**
 * Where a visitor is, for the consent default. The site is static, so it cannot know the country;
 * the browser's time zone is what it has. These are the zones of the 32 places Google's EU user
 * consent policy covers (EEA, the UK, Switzerland), including the islands that belong to them.
 *
 * The rule — this list, or a zone under `Europe/` — is applied in one place: the small script
 * `Layout.astro` puts in the <head>, which runs before the container and marks the document. The
 * rest of the site reads that mark rather than working it out again.
 */
export const EUROPE_EXTRA_ZONES = [
  'Atlantic/Azores',
  'Atlantic/Madeira',
  'Atlantic/Canary',
  'Atlantic/Faroe',
  'Atlantic/Reykjavik',
  'Indian/Mayotte',
  'Indian/Reunion',
  'America/Guadeloupe',
  'America/Martinique',
  'America/Cayenne',
  'America/Miquelon',
] as const;

/** The key the visitor's own choice is kept under. 'granted' or 'denied'; nothing else is stored. */
export const CONSENT_KEY = 'simganpyo.consent';
