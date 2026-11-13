import { expect, test } from 'vitest';
import { read } from './helpers';

// The policy pages live in the SimpleScheduler-Android repository and are served on the same host,
// so they load /policy.css from this site: one set of colours and type for both.
test('/policy.css는 사이트의 색·기본·문서 CSS를 그대로 담는다', () => {
  const css = read('dist/policy.css');
  for (const f of ['tokens', 'global', 'doc', 'policy']) expect(css, f).toContain(read(`src/styles/${f}.css`));
  expect(css).toContain('.policy > h1');
});
