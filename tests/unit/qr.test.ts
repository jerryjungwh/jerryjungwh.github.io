import { encode } from 'uqr';
import { expect, test } from 'vitest';
import { qrRuns, qrSvg } from '../../src/lib/qr';
import { PLAY_URL } from '../../src/lib/urls';

test('이어진 칸을 한 줄로 묶어도 칸 집합은 그대로다', () => {
  for (const row of [
    [true, true, false, true],
    [false, false, false],
    [true],
    [false, true, true, true, false, true],
  ]) {
    const back = row.map(() => false);
    for (const [x, run] of qrRuns(row)) for (let i = 0; i < run; i++) back[x + i] = true;
    expect(back, JSON.stringify(row)).toEqual(row);
  }
});

test('묶은 만큼 그리는 명령이 줄어든다', () => {
  expect(qrRuns([true, true, true, true])).toEqual([[0, 4]]);
  expect(qrRuns([true, false, true])).toEqual([
    [0, 1],
    [2, 1],
  ]);
});

test('그린 QR은 정사각형이고, 어두운 쪽이 밝은 바탕 위에 온다', () => {
  const svg = qrSvg(`${PLAY_URL}&referrer=utm_source%3Dqr`);
  const box = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  expect(box, 'viewBox').toBeTruthy();
  expect(box![1]).toBe(box![2]);
  expect(svg).toContain('fill="#fff"');
  expect(svg).toContain('fill="#000"');
});

test('칸마다 그리는 것보다 짧다', () => {
  const text = `${PLAY_URL}&referrer=utm_source%3Dqr%26utm_campaign%3Dsite_ko_home`;
  const { data, size } = encode(text, { ecc: 'L', border: 2 });
  let naive = 0;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (data[y][x]) naive += `M${x} ${y}h1v1h-1z`.length;
  expect(qrSvg(text).length).toBeLessThan(naive);
});
