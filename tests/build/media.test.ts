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

test('홈은 시작 사례가 방문마다 달라서 HTML에 먼저 받는 그림을 정해 두지 않는다', () => {
  const imgs = $('[data-media-kind] img');
  expect(imgs.filter('[loading="eager"]').length).toBe(0);
  expect(imgs.filter('[loading="lazy"]').length).toBe(imgs.length);
});

test('사례 페이지는 첫 단계의 폰 화면 한 장만 먼저 받는다', () => {
  const page = load(read('dist/for/university/index.html'));
  const eager = page('[data-media-kind] img[loading="eager"]');
  expect(eager.length).toBe(1);
  expect(eager.attr('fetchpriority')).toBe('high');
  expect(eager.closest('figure').attr('data-step')).toBe('create');
  expect(eager.closest('figure').attr('data-device')).toBe('phone');
});

test('임시 화면에는 「촬영 예정」이 적혀 있고, 최종 화면에는 없다', () => {
  // Once every screen is final there is nothing pending; the rule still has to hold for the rest.
  $('[data-media-kind][data-pending]').each((_, el) => {
    expect($(el).text()).toContain('촬영 예정');
  });
  $('[data-media-kind]:not([data-pending])').each((_, el) => {
    expect($(el).text()).not.toContain('촬영 예정');
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

test('녹화 칸: 포스터 그림 위에 소리 없는 영상이 하나 있고, 저절로 재생되지 않는다', () => {
  const boxes = $('[data-media-kind="video"]');
  expect(boxes.length).toBeGreaterThan(0);
  boxes.each((_, box) => {
    const video = $(box).find('video');
    expect(video.length).toBe(1);
    for (const attr of ['muted', 'playsinline', 'data-video']) expect(video.attr(attr), attr).toBeDefined();
    expect(video.attr('preload')).toBe('none');
    for (const attr of ['autoplay', 'controls', 'loop']) expect(video.attr(attr), attr).toBeUndefined();
    // The image under it carries the description; the video is the same screen moving.
    expect(video.attr('aria-hidden')).toBe('true');
    expect(video.attr('tabindex')).toBe('-1');
    const src = video.attr('src') ?? '';
    expect(src).toMatch(/^\/captures\/(ko|en)\/[a-z-]+\/(phone|tablet)\/widget_done\.mp4$/);
    expect(() => read(`dist${src}`)).not.toThrow();
    const poster = $(box).find('img');
    expect(poster.length).toBe(1);
    expect((poster.attr('alt') ?? '').length).toBeGreaterThan(10);
    expect(poster.attr('data-on')).toBeDefined();
  });
});
