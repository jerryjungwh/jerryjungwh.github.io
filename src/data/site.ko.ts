import type { SiteStrings } from '../lib/types';

/** Korean site strings. Prices carry their base date; the Play listing is the source of truth. */
export const SITE_KO: SiteStrings = {
  appName: '심간표',
  home: {
    title: '심간표 - 학교·학원 시간표와 과제를 한 앱에서',
    description:
      '심간표(SimpleScheduler)는 매주 반복되는 수업과 학원 일정을 주간 시간표로 만들고, 과제와 할 일을 수업에 연결해 관리하는 Android 시간표 앱이에요.',
    h1: ['우리 학교 시간 그대로,', '시간표와 할 일을 한 앱에서'],
    lead: '40분 수업도 75분 강의도 1분 단위로 넣고, 과제는 수업에 연결해요. 홈 화면 위젯과 잠금화면에서 바로 봐요.',
  },
  header: {
    homeLabel: '심간표 홈',
    faq: '자주 묻는 질문',
    otherLang: 'English',
    getApp: '앱 받기',
    navLabel: '주요 메뉴',
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
  what: {
    heading: '심간표는 어떤 앱인가요?',
    definition:
      '심간표(SimpleScheduler)는 매주 반복되는 수업과 학원 일정을 주간 시간표로 만들고, 과제와 할 일을 수업에 연결해 관리하는 Android 시간표 앱이에요. 홈 화면 위젯과 잠금화면에서 앱을 열지 않고 확인해요. 2017년부터 운영해 왔고, 회원가입 없이 무료로 써요.',
    factsHeading: '한눈에 보기',
    facts: [
      { term: '앱 이름', desc: '심간표, 심플시간표, SimpleScheduler' },
      { term: '쓸 수 있는 기기', desc: 'Android 7.0 이상 휴대폰과 태블릿, iPhone' },
      {
        term: '가격',
        desc: '무료(광고 포함). 광고를 없애는 프리미엄은 월 1,500원, 연 14,900원이고 7일 무료 체험이 있어요(2026년 11월 기준, 실제 가격은 Google Play 표시를 따릅니다).',
      },
      { term: '회원가입', desc: '없음' },
      { term: '데이터', desc: '기기 안에 저장, 암호 백업 파일로 옮기기' },
      { term: '위젯', desc: '주간표, 오늘 통합, To-Do' },
      { term: '언어', desc: '한국어, 영어, 일본어, 중국어 간체' },
      { term: '운영 시작', desc: '2017년' },
    ],
    updatedTerm: '최근 업데이트',
    formatDate: (iso) => {
      const [y, m, d] = iso.split('-').map(Number);
      return `${y}년 ${m}월 ${d}일`;
    },
  },
  byCase: {
    heading: '시간표 종류별로 자세히',
    blurbs: {
      elementary_school: '40분 수업과 준비물을 부모가 아이 대신 챙겨요.',
      middle_school: '45분 수업, 평일 학원, 토요일 학원을 한 장에 넣어요.',
      high_school: '50분 수업 7교시와 자율학습, 수행평가를 관리해요.',
      university: '강의실과 교수님을 적고 과제를 강의에 연결해요.',
      after_school: '아이마다 시간표를 따로 만들어 학원과 방과후를 정리해요.',
      lessons: '매주 반복되는 레슨과 개인 일정을 한 시간표에 넣어요.',
    },
  },
  reviews: {
    heading: 'Google Play 리뷰',
    items: [
      {
        text: '이만한 시간표 앱이 없어요.. 잘 쓰는 중입니다 👍👍 특히 좋았던 점은 현재 시각이 빨간선으로 뜬다는 거랑 일정마다 알림 설정이 따로 된단건데요, 디테일이 듬뿍 느껴지는 기능이에요..',
        year: 2026,
        month: 8,
      },
    ],
    caption: (year, month) => `Google Play 리뷰 · ${year}년 ${month}월`,
  },
  faq: { heading: '자주 묻는 질문', all: '질문 전체 보기' },
  install: {
    heading: '심간표 받기',
    play: 'Google Play에서 받기',
    appStore: 'App Store에서 받기',
    iosNote: 'iPhone 앱은 새 버전을 준비하고 있어요. 지금 버전은 Android 앱보다 기능이 적어요.',
  },
  casePage: {
    crumbsLabel: '현재 위치',
    title: (name) => `${name} 만들기 - 심간표`,
    stepsHeading: '여덟 단계로 보기',
    faqHeading: (name) => `${name}, 자주 묻는 질문`,
    moreHeading: '함께 보면 좋아요',
  },
  faqPage: {
    title: '자주 묻는 질문 - 심간표',
    description:
      '심간표 시간표 앱에 대해 자주 묻는 질문과 답이에요. 수업 시간 맞추기, 위젯, 알람, 가격, 백업, iPhone과 태블릿 지원을 다뤄요.',
    h1: '자주 묻는 질문',
    lead: '심간표를 쓰기 전에, 쓰면서 자주 묻는 것을 주제별로 모았어요.',
  },
  about: {
    title: '심간표 소개 - 2017년부터 만들어 온 시간표 앱',
    description:
      '심간표(심플시간표, SimpleScheduler)는 2017년부터 운영해 온 Android 시간표 앱이에요. 어떤 앱인지, 누가 만드는지, 어디로 문의하는지 적었어요.',
    h1: '심간표 소개',
    storyHeading: '2017년부터 지금까지',
    story: [
      '심간표는 2017년에 Android 앱으로 시작했어요. 이름은 「심플시간표」를 줄인 말이고, 영어 이름은 SimpleScheduler예요.',
      '2018년에는 iPhone 앱을 냈어요. iPhone 앱은 지금 새 버전을 준비하고 있어요.',
      '지금 Android 앱에는 수업에 연결하는 To-Do, 홈 화면 위젯 세 가지, 잠금화면 주간표, 암호를 건 백업 파일이 있어요. 회원가입을 받지 않고, 시간표와 할 일은 휴대폰 안에 저장해요.',
    ],
    makerHeading: '만든 사람',
    maker: '심간표는 Jerry Jung이 만들고 운영해요.',
    contactHeading: '문의',
    contact: '고칠 점이나 바라는 기능은 메일로 알려 주세요.',
  },
  notFound: {
    title: '페이지를 찾지 못했어요 - 심간표',
    h1: '페이지를 찾지 못했어요',
    text: '주소가 바뀌었거나 없는 페이지예요. 아래에서 찾는 시간표 종류를 골라 보세요.',
    home: '심간표 홈으로 가기',
  },
  footer: {
    navLabel: '사이트 안내',
    casesHeading: '시간표 종류',
    siteHeading: '심간표',
    about: '소개',
    faq: '자주 묻는 질문',
    contact: '문의',
    privacy: '개인정보처리방침',
    terms: '이용약관',
    maker: '만든 사람 Jerry Jung',
  },
};
