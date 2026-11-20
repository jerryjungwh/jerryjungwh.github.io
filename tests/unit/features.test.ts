import { expect, test } from 'vitest';
import { FEATURES } from '../../src/lib/features';

// The 꾸미기 section shows a feature the app gets in 8.0.0. It is built now and switched on on release day
// (redesign 11-20, spec §7: the site must not show what the app does not have yet).
test('꾸미기 절은 8.0.0 출시 전에는 꺼 둔다', () => {
  expect(FEATURES.characterDeco).toBe(false);
});
