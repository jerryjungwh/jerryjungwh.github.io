import { load } from 'cheerio';
import { expect, test } from 'vitest';
import { CASES_KO } from '../../src/data/cases.ko';
import { CASE_ORDER, STEP_ORDER } from '../../src/lib/types';
import { read, readAllCss } from './helpers';

const html = read('dist/index.html');
const $ = load(html);

test('여섯 사례와 마흔여덟 단계가 모두 HTML에 있다', () => {
  expect($('[data-stepper]').length).toBe(1);
  expect($('[data-stepper] article[data-case]').map((_, a) => $(a).attr('data-case')).get()).toEqual([...CASE_ORDER]);
  expect($('[data-stepper] ol[data-steps] > li[data-step]').length).toBe(48);
  $('[data-stepper] ol[data-steps]').each((_, ol) => {
    expect($(ol).children('li[data-step]').map((_, li) => $(li).attr('data-step')).get()).toEqual([...STEP_ORDER]);
  });
});

test('모든 단계의 제목과 한 문장 설명이 글로 들어 있다', () => {
  const text = $('[data-stepper]').text();
  for (const c of CASES_KO)
    for (const s of c.steps) {
      expect(text, `${c.id}/${s.id} title`).toContain(s.title);
      expect(text, `${c.id}/${s.id} short`).toContain(s.short);
    }
});

test('단계는 제목 안의 단추로 누른다 (단추 안에 제목 요소를 넣지 않는다)', () => {
  expect($('[data-stepper] li[data-step] h3 > button[type="button"]').length).toBe(48);
  expect($('[data-stepper] button h3, [data-stepper] button h4, [data-stepper] button p').length).toBe(0);
  $('[data-stepper] article[data-case]').each((_, a) => {
    expect($(a).find('li[data-step] button[aria-current="step"]').length).toBe(1);
  });
});

test('사례마다 제목(h2)이 있고 사례 단추가 여섯 개다', () => {
  expect($('[data-stepper] article[data-case] h2').length).toBe(6);
  const buttons = $('[data-stepper] button[data-track="case_select"]');
  expect(buttons.map((_, b) => $(b).attr('data-case')).get()).toEqual([...CASE_ORDER]);
  buttons.each((_, b) => expect($(b).attr('aria-pressed')).toMatch(/^(true|false)$/));
  expect(buttons.map((_, b) => $(b).text().trim()).get()).toEqual(CASES_KO.map((c) => c.tab));
});

test('사례·단계·기기마다 화면 자리가 하나씩 있다', () => {
  expect($('[data-stepper] figure[data-media]').length).toBe(6 * 8 * 2);
  for (const c of CASE_ORDER)
    for (const s of STEP_ORDER)
      for (const d of ['phone', 'tablet'])
        expect($(`figure[data-media][data-case="${c}"][data-step="${s}"][data-device="${d}"]`).length, `${c}/${s}/${d}`).toBe(1);
  expect($('[data-stepper] figure[data-media] img:not([alt]), [data-stepper] figure[data-media] img[alt=""]').length).toBe(0);
});

test('멈춤 단추와 폰·태블릿 전환이 있다', () => {
  expect($('[data-stepper] button[data-action="toggle-pause"]').length).toBe(1);
  expect($('[data-stepper] button[data-action="device"][data-device="phone"]').attr('aria-pressed')).toBe('true');
  expect($('[data-stepper] button[data-action="device"][data-device="tablet"]').attr('aria-pressed')).toBe('false');
});

test('스크립트가 없을 때 사례를 숨기지 않는다: 숨김 규칙은 html.js 아래에만 있다', () => {
  const css = readAllCss('dist');
  const hiding = [...css.matchAll(/([^{}]+)\{[^}]*display:\s*none[^}]*\}/g)]
    .flatMap((m) => m[1].split(','))
    .map((s) => s.trim())
    .filter((s) => /data-stepper|data-case|data-step|data-media/.test(s));
  expect(hiding.length).toBeGreaterThan(0);
  for (const selector of hiding) expect(selector, selector).toMatch(/^html\.js\b/);
});
