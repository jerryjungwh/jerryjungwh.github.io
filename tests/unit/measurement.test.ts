import { expect, test } from 'vitest';
import { EUROPE_EXTRA_ZONES } from '../../src/data/measurement';

test('유럽 나라에 딸렸지만 Europe/ 로 시작하지 않는 시간대를 빠짐없이 적는다', () => {
  // 포르투갈 아조레스·마데이라, 스페인 카나리아, 덴마크 페로, 아이슬란드, 프랑스 해외 지역.
  for (const zone of ['Atlantic/Azores', 'Atlantic/Madeira', 'Atlantic/Canary', 'Atlantic/Faroe', 'America/Martinique'])
    expect(EUROPE_EXTRA_ZONES, zone).toContain(zone);
});

test('Europe/ 로 시작하는 시간대는 목록에 넣지 않는다 (규칙이 이미 걸러 낸다)', () => {
  for (const zone of EUROPE_EXTRA_ZONES) expect(zone.startsWith('Europe/'), zone).toBe(false);
});

test('유럽 밖 시간대를 섞어 적지 않는다', () => {
  for (const zone of ['Asia/Seoul', 'America/New_York', 'Asia/Tokyo'])
    expect(EUROPE_EXTRA_ZONES as readonly string[], zone).not.toContain(zone);
});
