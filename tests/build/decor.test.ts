import { expect, test } from 'vitest';
import { allHtml } from './helpers';

const withStepper = allHtml().filter((p) => p.$('[data-stepper]').length > 0);

test('단계형 사례마다 장식 묶음이 하나이고 블록은 6개다', () => {
  expect(withStepper.length).toBeGreaterThan(0);
  for (const p of withStepper) {
    expect(p.$('[data-stepper] .hero-decor[aria-hidden="true"]').length, p.path).toBe(1);
    expect(p.$('.hero-decor .hero-block').length, p.path).toBe(6);
  }
});

test('장식은 사례 화면과 단계 글 안에 없다', () => {
  for (const p of withStepper) expect(p.$('.case-screens .hero-decor, .case-text .hero-decor').length, p.path).toBe(0);
});
