import { existsSync } from 'node:fs';
import { expect, test } from 'vitest';
import { read } from './helpers';

// The policy pages live in the SimpleScheduler-Android repository and are served on the same host,
// so they load /policy.css from this site: one set of colours and type for both.
test('/policy.css는 사이트의 색·기본·문서 CSS를 그대로 담는다', () => {
  const css = read('dist/policy.css');
  for (const f of ['tokens', 'global', 'doc', 'policy']) expect(css, f).toContain(read(`src/styles/${f}.css`));
  expect(css).toContain('.policy > h1');
});

test('/policy.css는 사이트와 같은 Pretendard 글꼴을 사이트가 내보낸 같은 파일로 부른다', () => {
  const css = read('dist/policy.css');
  const faces = read('node_modules/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css').match(/@font-face/g)!.length;
  expect(css.match(/@font-face/g)?.length).toBe(faces);
  const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1].replace(/["']/g, ''));
  expect(urls.length).toBe(faces);
  for (const u of urls) {
    expect(u, u).toMatch(/^\/_astro\/[^/]+\.woff2$/);
    expect(existsSync(`dist${u}`), u).toBe(true);
  }
});
