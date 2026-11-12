/** Korean site strings. Task 7 adds the rest (header, definition, facts table, reviews, install). */
export const SITE_KO = {
  home: {
    title: '심간표 - 학교·학원 시간표와 과제를 한 앱에서',
    description:
      '심간표(SimpleScheduler)는 매주 반복되는 수업과 학원 일정을 주간 시간표로 만들고, 과제와 할 일을 수업에 연결해 관리하는 Android 시간표 앱이에요.',
    h1: ['우리 학교 시간 그대로,', '시간표와 할 일을 한 앱에서'] as [string, string],
    lead: '40분 수업도 75분 강의도 1분 단위로 넣고, 과제는 수업에 연결해요. 홈 화면 위젯과 잠금화면에서 바로 봐요.',
  },
  stepper: {
    sectionLabel: '사례로 보는 심간표',
    casesLabel: '시간표 종류',
    deviceLabel: '화면을 볼 기기',
    phone: '폰',
    tablet: '태블릿',
    pause: '자동 넘김 멈추기',
    resume: '자동 넘김 켜기',
    androidNote: 'Android 앱 화면이에요',
  },
};

export type SiteStrings = typeof SITE_KO;
