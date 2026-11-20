import { readdirSync, readFileSync, statSync } from 'node:fs';
import { expect, test } from 'vitest';

// Simgani drawings are generated from the canon drawing code (character-geometry, app repo) by web.py.
const DIR = 'src/assets/character';
const manifest = JSON.parse(readFileSync(`${DIR}/manifest.json`, 'utf8'));

test('심간이 그림은 목록과 폴더가 같다', () => {
  const svgs = readdirSync(DIR).filter((f) => f.endsWith('.svg')).sort();
  expect([...manifest.files].sort()).toEqual(svgs);
});

test('안내 자세 넷이 있다', () => {
  for (const p of ['basic', 'done', 'focus', 'oops']) expect(manifest.files).toContain(`guide-${p}.svg`);
});

test('심간이 그림 한 장은 6KB 이하이고 viewBox가 있다', () => {
  for (const f of manifest.files) {
    expect(statSync(`${DIR}/${f}`).size, f).toBeLessThanOrEqual(6 * 1024);
    expect(readFileSync(`${DIR}/${f}`, 'utf8'), f).toMatch(/^<svg[^>]+viewBox="0 0 240 240"/);
  }
});

test('정본 커밋이 적혀 있고 로컬 경로가 없다', () => {
  expect(manifest.commit).toMatch(/^[0-9a-f]{7,40}$/);
  expect(JSON.stringify(manifest)).not.toMatch(/\/Users\/|\/private\//);
});
