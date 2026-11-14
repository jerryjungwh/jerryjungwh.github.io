import type { APIRoute, GetStaticPaths } from 'astro';
import { QR_PAGES } from '../../../data/cta';
import { qrSvg } from '../../../lib/qr';
import type { Lang, PageKey } from '../../../lib/types';
import { pageLabel, playUrlWith } from '../../../lib/urls';

/**
 * One QR a page and language, written out as a file at build time. The install area loads it as an
 * ordinary image, so the browser downloads it only where it is shown (a wide screen) and nothing of
 * the encoder reaches the visitor.
 */
const LANGS: Lang[] = ['ko', 'en'];

export const getStaticPaths: GetStaticPaths = () =>
  LANGS.flatMap((lang) => QR_PAGES.map((page) => ({ params: { lang, page: pageLabel(page) }, props: { lang, page } })));

export const GET: APIRoute<{ lang: Lang; page: PageKey }> = ({ props }) => {
  const label = pageLabel(props.page);
  // Where a QR install came from: the code itself, and the page its code was on.
  const url = playUrlWith({ s: 'qr', c: `site_${props.lang}_${label}` }, label, 'qr');
  return new Response(qrSvg(url), {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
