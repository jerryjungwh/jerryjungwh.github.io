/**
 * RELEASE=1 marks the build that goes to the real domain. Every other build (local, the test address
 * on github.io) is kept out of search: its screens are still placeholders and it would compete with
 * the real site later.
 */
export const IS_RELEASE: boolean = process.env.RELEASE === '1';

/**
 * The release build must not ship a placeholder screen. Called while pages are built, so
 * `RELEASE=1 astro build` stops by itself and does not depend on a test being run first.
 */
export function assertReleasable(pending: string[], release: boolean): void {
  if (!release || pending.length === 0) return;
  const shown = pending.slice(0, 12).join(', ');
  const more = pending.length > 12 ? ` 외 ${pending.length - 12}개` : '';
  throw new Error(`배포용 빌드를 멈춘다: 임시 화면 ${pending.length}개가 남아 있다 (${shown}${more})`);
}

/** Value of <meta name="robots">, or undefined when the page is open to search. */
export function robotsFor(opts: { release: boolean; notFound: boolean }): 'noindex' | undefined {
  return opts.release && !opts.notFound ? undefined : 'noindex';
}
