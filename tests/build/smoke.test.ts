import { readFileSync } from 'node:fs';
import { load } from 'cheerio';
import { expect, test } from 'vitest';

test('홈이 한국어 문서로 빌드된다', () => {
  const $ = load(readFileSync('dist/index.html', 'utf8'));
  expect($('html').attr('lang')).toBe('ko');
  expect($('link[rel="canonical"]').attr('href')).toBe('https://simganpyo.com/');
  expect($('link[rel="stylesheet"][href^="http"], script[src^="http"]').length).toBe(0);
});
