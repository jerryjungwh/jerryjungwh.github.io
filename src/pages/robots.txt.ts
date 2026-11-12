import type { APIRoute } from 'astro';
import { SITE_ORIGIN } from '../lib/urls';

// Every crawler is welcome, AI search crawlers included. Nothing is disallowed.
export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap-index.xml\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
