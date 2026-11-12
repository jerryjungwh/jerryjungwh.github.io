import type { FaqItem } from '../lib/types';

export interface FaqGroup {
  id: string;
  title: string;
  /** `home: true` puts the question on the home page as well. */
  items: (FaqItem & { home?: boolean })[];
}

/** Answers state only what the app does today. Task 8 fills in the remaining questions. */
export const FAQ_KO: FaqGroup[] = [
  {
    id: 'timetable',
    title: '시간표 만들기',
    items: [
      {
        q: '40분, 45분, 50분 수업도 시간표에 맞출 수 있나요?',
        a: '네. 수업 시작과 끝을 1분 단위로 정해요. 8:40~9:25처럼 학교 시간표에 적힌 시간 그대로 넣을 수 있어요.',
        home: true,
      },
    ],
  },
  {
    id: 'start',
    title: '가격과 가입',
    items: [
      {
        q: '심간표는 무료인가요?',
        a: '네. 광고가 있는 무료 앱이에요. 광고를 없애는 프리미엄은 월 1,500원, 연 14,900원이고 7일 무료 체험이 있어요(2026년 11월 기준, 실제 가격은 Google Play 표시를 따릅니다).',
        home: true,
      },
      {
        q: '회원가입이 필요한가요?',
        a: '아니요. 회원가입도 로그인도 없어요. 시간표와 할 일은 휴대폰 안에 저장돼요.',
        home: true,
      },
    ],
  },
  {
    id: 'devices',
    title: '기기와 데이터',
    items: [
      {
        q: 'iPhone에서도 쓸 수 있나요?',
        a: 'App Store에 심간표가 있어요. 다만 iPhone 앱은 새 버전을 준비하고 있고, 지금 버전은 Android 앱보다 기능이 적어요.',
        home: true,
      },
      {
        q: '휴대폰을 바꾸면 시간표는 어떻게 옮기나요?',
        a: '앱에서 암호를 건 백업 파일을 만들고, 새 휴대폰의 심간표에서 그 파일로 복원해요. 저절로 옮겨지지는 않으니 바꾸기 전에 백업 파일을 만들어 두세요.',
        home: true,
      },
    ],
  },
];
