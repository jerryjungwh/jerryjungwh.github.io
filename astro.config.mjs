// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://simganpyo.com',
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  // Keep the built CSS readable by Safari 14+: no media-query range syntax, no newer color functions.
  vite: { build: { cssTarget: ['safari14', 'chrome90', 'firefox90', 'edge90'] } },
  integrations: [
    sitemap({ i18n: { defaultLocale: 'ko', locales: { ko: 'ko', en: 'en' } } }),
  ],
});
