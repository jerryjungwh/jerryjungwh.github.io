/**
 * RELEASE=1 marks the build that goes to the real domain. Every other build (local, the test address
 * on github.io) is kept out of search: its screens are still placeholders and it would compete with
 * the real site later.
 */
export const IS_RELEASE: boolean = process.env.RELEASE === '1';

/** Value of <meta name="robots">, or undefined when the page is open to search. */
export function robotsFor(opts: { release: boolean; notFound: boolean }): 'noindex' | undefined {
  return opts.release && !opts.notFound ? undefined : 'noindex';
}
