import { load } from 'cheerio';
import { expect, test } from 'vitest';
import { read } from './helpers';

const $ = load(read('dist/index.html'));
const media = $('[data-media-kind]');

test('홈에 앱 화면 자리가 있다', () => {
  expect(media.length).toBeGreaterThan(0);
});

test('화면 자리는 비율로 크기를 잡아 그림이 늦게 와도 밀리지 않는다', () => {
  media.each((_, el) => {
    expect($(el).attr('style') ?? '').toMatch(/aspect-ratio:\s*\d+\s*\/\s*\d+/);
  });
  $('[data-media-kind] img').each((_, img) => {
    expect($(img).attr('width'), $.html(img)).toMatch(/^\d+$/);
    expect($(img).attr('height'), $.html(img)).toMatch(/^\d+$/);
  });
});

test('모든 화면 그림에 대체 문장이 있다', () => {
  const imgs = $('[data-media-kind] img');
  expect(imgs.length).toBeGreaterThan(0);
  imgs.each((_, img) => {
    expect(($(img).attr('alt') ?? '').length, $.html(img)).toBeGreaterThan(10);
  });
});

test('먼저 받는 그림은 한 장이고 나머지는 늦게 받는다', () => {
  const imgs = $('[data-media-kind] img');
  expect(imgs.filter('[loading="eager"]').length).toBe(1);
  expect(imgs.filter('[loading="lazy"]').length).toBe(imgs.length - 1);
});

test('임시 화면에는 「촬영 예정」이 적혀 있다', () => {
  const pending = $('[data-media-kind][data-pending]');
  expect(pending.length).toBeGreaterThan(0);
  pending.each((_, el) => {
    expect($(el).text()).toContain('촬영 예정');
  });
});

test('이어 보기는 장마다 차례 번호가 있고 첫 장만 켜져 있다', () => {
  const seq = $('[data-media-kind="sequence"]');
  expect(seq.length).toBeGreaterThan(0);
  seq.each((_, el) => {
    const frames = $(el).find('img[data-frame]');
    expect(frames.length).toBeGreaterThan(1);
    expect(frames.map((_, f) => $(f).attr('data-frame')).get()).toEqual(frames.map((i) => String(i)).get());
    expect(frames.filter('[data-on]').length).toBe(1);
    expect(frames.first().attr('data-on')).toBeDefined();
  });
});

test('실제 캡처는 여러 너비로 내보낸다', () => {
  const real = $('[data-media-kind] img[srcset]');
  expect(real.length).toBeGreaterThan(0);
  real.each((_, img) => {
    expect($(img).attr('srcset')!.split(',').length).toBeGreaterThan(1);
    expect($(img).attr('sizes')).toBeTruthy();
  });
});
