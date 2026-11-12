import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { load, type CheerioAPI } from 'cheerio';

export type Lang = 'ko' | 'en';
export interface BuiltPage { path: string; lang: Lang; $: CheerioAPI }

const DIST = 'dist';

export function read(file: string): string {
  return readFileSync(file, 'utf8');
}

export function filesUnder(dir: string, pattern: RegExp): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const name of readdirSync(d)) {
      const full = join(d, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (pattern.test(full)) out.push(full);
    }
  };
  if (existsSync(dir)) walk(dir);
  return out.sort();
}

/** Every built page except 404. `path` is the site path with trailing slash. */
export function allHtml(dir: string = DIST): BuiltPage[] {
  return filesUnder(dir, /index\.html$/).map((file) => {
    const path = '/' + file.slice(dir.length + 1).replace(/index\.html$/, '');
    return { path, lang: path.startsWith('/en/') ? 'en' : 'ko', $: load(read(file)) };
  });
}

export function koPaths(): string[] {
  return allHtml().filter((p) => p.lang === 'ko').map((p) => p.path);
}

export function enPaths(): string[] {
  return allHtml().filter((p) => p.lang === 'en').map((p) => p.path);
}

/** Site-internal link targets on a page (path only, no hash or query). */
export function internalLinks(page: BuiltPage): string[] {
  const out = new Set<string>();
  page.$('a[href]').each((_, a) => {
    const href = page.$(a).attr('href')!;
    if (href.startsWith('/') && !href.startsWith('//')) out.add(href.split('#')[0].split('?')[0]);
  });
  out.delete('');
  return [...out];
}

export function existsInDist(href: string): boolean {
  const target = join(DIST, href);
  return href.endsWith('/') ? existsSync(join(target, 'index.html')) : existsSync(target);
}

export function sitemapUrls(): string[] {
  return filesUnder(DIST, /sitemap-\d+\.xml$/).flatMap((f) =>
    [...read(f).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]),
  );
}

export function readAllCss(dir: string = DIST): string {
  const files = filesUnder(dir, /\.css$/).map(read);
  const inline = allHtml(dir).flatMap((p) => p.$('style').map((_, s) => p.$(s).text()).get());
  return [...files, ...inline].join('\n');
}
