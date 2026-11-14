import { expect, test } from 'vitest';
import { isEuropeTimeZone } from '../../src/data/measurement';

test('유럽·영국·스위스 시간대를 유럽으로 본다', () => {
  for (const zone of ['Europe/Berlin', 'Europe/London', 'Europe/Zurich', 'Europe/Reykjavik', 'Europe/Oslo'])
    expect(isEuropeTimeZone(zone), zone).toBe(true);
});

test('유럽 나라에 딸린 섬도 유럽으로 본다', () => {
  // 포르투갈 아조레스·마데이라, 스페인 카나리아, 프랑스 해외 지역.
  for (const zone of ['Atlantic/Azores', 'Atlantic/Madeira', 'Atlantic/Canary', 'America/Martinique'])
    expect(isEuropeTimeZone(zone), zone).toBe(true);
});

test('그 밖의 시간대는 유럽이 아니다', () => {
  for (const zone of ['Asia/Seoul', 'America/New_York', 'Asia/Tokyo', 'Australia/Sydney', 'Europe', undefined])
    expect(isEuropeTimeZone(zone), String(zone)).toBe(false);
});
