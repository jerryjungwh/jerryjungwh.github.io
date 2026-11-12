import { statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { allHtml, filesUnder } from './helpers';

const KB = 1024;
const pages = allHtml();
const fileOf = (url: string) => `dist${url.split('?')[0]}`;

/** Every image file a selector's <img> elements can load, across all pages. */
function imageFiles(selector: string): string[] {
  const out = new Set<string>();
  for (const p of pages)
    p.$(selector).each((_, img) => {
      const srcset = p.$(img).attr('srcset') ?? '';
      for (const part of srcset.split(',')) if (part.trim()) out.add(fileOf(part.trim().split(/\s+/)[0]));
      const src = p.$(img).attr('src');
      if (src) out.add(fileOf(src));
    });
  return [...out];
}

test('휴대폰 캡처는 한 장에 60KB를 넘지 않는다', () => {
  const files = imageFiles('figure[data-device="phone"] img').filter((f) => !f.endsWith('.svg'));
  expect(files.length).toBeGreaterThan(0);
  for (const f of files) {
    expect(f, f).toMatch(/\.webp$/);
    expect(statSync(f).size, f).toBeLessThanOrEqual(60 * KB);
  }
});

test('태블릿 캡처는 한 장에 150KB를 넘지 않는다', () => {
  for (const f of imageFiles('figure[data-device="tablet"] img').filter((x) => !x.endsWith('.svg')))
    expect(statSync(f).size, f).toBeLessThanOrEqual(150 * KB);
});

test('녹화는 한 개에 300KB를 넘지 않는다', () => {
  for (const f of filesUnder('dist', /\.(mp4|webm)$/)) expect(statSync(f).size, f).toBeLessThanOrEqual(300 * KB);
});

test('바깥 서버에서 불러오는 스크립트·글꼴·그림이 없다', () => {
  for (const p of pages) {
    expect(p.$('script[src^="http"], link[rel="stylesheet"][href^="http"], link[rel="preload"][href^="http"]').length, p.path).toBe(0);
    expect(p.$('img[src^="http"], source[src^="http"], video[src^="http"]').length, p.path).toBe(0);
  }
  for (const css of filesUnder('dist', /\.css$/)) expect(readFileSync(css, 'utf8'), css).not.toMatch(/url\(["']?https?:/);
});

test('페이지가 처음 받는 것의 크기: HTML 20KB(gzip), 스크립트 12KB, 스타일 20KB(gzip) 이하', () => {
  for (const p of pages) {
    const file = `dist${p.path}index.html`;
    expect(gzipSync(readFileSync(file)).length, `${p.path} html`).toBeLessThanOrEqual(20 * KB);
    const scripts = p.$('script[src]').map((_, s) => fileOf(p.$(s).attr('src')!)).get();
    expect(scripts.reduce((n, f) => n + statSync(f).size, 0), `${p.path} js`).toBeLessThanOrEqual(12 * KB);
    const styles = p.$('link[rel="stylesheet"]').map((_, s) => fileOf(p.$(s).attr('href')!)).get();
    expect(styles.reduce((n, f) => n + gzipSync(readFileSync(f)).length, 0), `${p.path} css`).toBeLessThanOrEqual(20 * KB);
  }
});

test('시험 주소로 올리는 빌드는 검색에 넣지 않는다', () => {
  // The release build (RELEASE=1) drops this tag; lib/release.ts decides, and its unit test covers both.
  for (const p of pages) expect(p.$('meta[name="robots"]').attr('content'), p.path).toBe('noindex');
});
