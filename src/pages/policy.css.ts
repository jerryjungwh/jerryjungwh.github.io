import type { APIRoute } from 'astro';
// Same font faces as the site (Layout.astro). ?inline gives the CSS with url() pointing at the font files the build emits.
import fonts from 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css?inline';
import tokens from '../styles/tokens.css?raw';
import base from '../styles/global.css?raw';
import doc from '../styles/doc.css?raw';
import policy from '../styles/policy.css?raw';

// The policy pages (SimpleScheduler-Android repository) are served on the same host and load this file,
// so they share the site's colours, type and page frame. Their markup is that repository's _layouts/default.html.
export const GET: APIRoute = () =>
  new Response([fonts, tokens, base, doc, policy].join('\n'), {
    headers: { 'Content-Type': 'text/css; charset=utf-8' },
  });
