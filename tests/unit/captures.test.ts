import { expect, test } from 'vitest';
import { allEntries, getCapture, mediaAlts, mediaSources, pendingCaptures } from '../../src/data/captures';
import { CASE_ORDER, CASE_SLUG, STEP_ORDER, type CaseId } from '../../src/lib/types';

test('언어 2 × 사례 6 × 기기 2 × 단계 8, 192칸이 모두 있다', () => {
  for (const lang of ['ko', 'en'] as const)
    for (const c of CASE_ORDER)
      for (const dev of ['phone', 'tablet'] as const)
        for (const st of STEP_ORDER) expect(getCapture(lang, c, dev, st), `${lang}/${c}/${dev}/${st}`).toBeDefined();
  expect(allEntries().length).toBe(192);
});

test('최종 화면의 파일 경로에는 그 언어·사례·기기가 들어 있다', () => {
  for (const [key, e] of allEntries()) {
    if (e.status !== 'final') continue;
    const [lang, c, dev] = key.split('/');
    for (const src of mediaSources(e.media))
      expect(src, key).toContain(`/captures/${lang}/${CASE_SLUG[c as CaseId]}/${dev}/`);
  }
});

test('임시 화면이 아닌 그림은 어느 칸이든 자기 사례 폴더의 파일만 쓴다', () => {
  for (const [key, e] of allEntries()) {
    const [lang, c, dev] = key.split('/');
    for (const src of mediaSources(e.media)) {
      if (src.includes('/captures/_pending/')) continue;
      expect(src, key).toContain(`/captures/${lang}/${CASE_SLUG[c as CaseId]}/${dev}/`);
    }
  }
});

test('대체 문장이 비어 있지 않다', () => {
  for (const [key, e] of allEntries()) for (const alt of mediaAlts(e.media)) expect(alt.length, key).toBeGreaterThan(10);
});

test('pendingCaptures는 임시 화면인 칸의 열쇠만 돌려준다', () => {
  const keys = pendingCaptures();
  expect(keys).toEqual(allEntries().filter(([, e]) => e.status === 'pending').map(([key]) => key));
  for (const k of keys) expect(k).toMatch(/^(ko|en)\/[a-z_]+\/(phone|tablet)\/[a-z_]+$/);
});

test('화면 목록 파일에 있는 칸은 그 값이고, 없는 칸은 임시 화면이다', async () => {
  const manifest = (await import('../../src/data/captures.manifest.json')).default as Record<string, unknown>;
  const listed = Object.keys(manifest);
  expect(listed.length).toBeGreaterThan(0);
  for (const [key, entry] of allEntries()) {
    if (listed.includes(key)) expect(entry, key).toEqual(manifest[key]);
    else {
      expect(entry.status, key).toBe('pending');
      expect(mediaSources(entry.media).every((src) => src.includes('/captures/_pending/')), key).toBe(true);
    }
  }
  // Every listed key is a real cell: a typo in the file must not silently drop a screen.
  const cells = allEntries().map(([key]) => key);
  for (const key of listed) expect(cells, key).toContain(key);
});
