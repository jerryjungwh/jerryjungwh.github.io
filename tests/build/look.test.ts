import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { filesUnder } from './helpers';

const css = filesUnder('dist', /\.css$/).map((f) => readFileSync(f, 'utf8')).join('\n');

test('캐릭터 색 토큰과 새 바탕 토큰이 있다', () => {
  expect(css).toMatch(/--ring-start:\s*#61d9ef/i);
  expect(css).toMatch(/--ring-end:\s*#889dfe/i);
  expect(css).toMatch(/--paper:\s*#fbfbfe/i);
});
