# 심간표 홈페이지

심간표(SimpleScheduler) 앱의 홈페이지다. 주소는 `https://simganpyo.com`이고 GitHub Pages로 내보낸다.
설계와 계획은 앱 저장소의 `claude-docs/website/`에 있다(`design-2026-11-12.md`가 정본).

## 지금 상태 (2026-11-13)

- 한국어 9쪽과 영어 9쪽(`/en/`), 404 한 장이 빌드된다. 홈, 시간표 종류 6쪽, 자주 묻는 질문, 소개.
- 앱 화면은 에뮬레이터의 실제 앱 7.5.7에서 찍은 것이다(아래 「다시 찍는 방법」). 아직 찍지 못한 칸은 「촬영 예정」 임시 그림이고, 임시 그림이 남아 있으면 공개용 빌드가 실패한다.
- 측정(GTM), QR, 동의 배너는 아직 없다. 스토어 링크는 빌드 때 적는 기본 주소다.

## 실행

```bash
npm install
npx playwright install chromium   # 처음 한 번
npm run check                     # 단위 검사 → 빌드 → 빌드 검사 → 브라우저 검사
npm run preview                   # dist를 http://localhost:4321 에서 본다
```

- Astro 7의 `astro preview`는 백그라운드로 뜨는 환경이 있다. 끌 때는 `npx astro preview stop`.
- 속도 재기: `npm run preview` 뒤 `node scripts/measure.mjs`(느린 4G, 4배 느린 CPU로 흉내 낸 휴대폰).

## 구조

| 자리 | 맡는 일 |
|---|---|
| `src/data/cases.<lang>.ts` | 시간표 종류 6개 × 단계 8개의 글 |
| `src/data/site.<lang>.ts`, `faq.<lang>.ts` | 그 밖의 문구, 질문과 답 |
| `src/data/site.ts` | 언어 → 문구. 문구를 고르는 곳은 여기 하나다 |
| `src/data/captures.ts`, `captures.manifest.json` | 단계마다 보일 앱 화면 목록(192칸). 목록 파일에 없는 칸은 임시 화면(`pending`)이고, 임시 화면이 남아 있으면 배포용 빌드가 실패한다 |
| `capture/fixtures/<lang>/<case>.json` | 사례별 촬영 데이터: 앱에 넣을 시간표·수업·To-Do와 화면별 대체 문장. 화면과 글이 같은 이름을 쓰는지 검사한다 |
| `capture/run.ts`, `capture/lib.ts` | 에뮬레이터의 실제 앱에서 화면을 찍어 그림·녹화·목록 파일로 넣는 스크립트 |
| `src/assets/captures/`, `public/captures/` | 찍은 그림(WebP)과 녹화(MP4). 손으로 고치지 않는다 |
| `src/lib/stepper-state.ts` | 단계형 사례의 상태 계산(순수 함수) |
| `src/components/case-stepper.client.ts` | 그 상태를 화면에 옮기는 스크립트 |
| `src/lib/seo.ts` | 제목·설명·구조화 데이터. 페이지 제목을 정하는 곳은 여기 하나다 |
| `src/lib/urls.ts` | 주소와 스토어 링크 |
| `src/views/` | 페이지 틀. `src/pages/`는 언어만 넘긴다 |
| `tests/unit`, `tests/build`, `tests/e2e` | 순수 계산, 빌드 결과(HTML), 브라우저 동작 검사 |

지키는 것(검사로 고정돼 있다):

- 모든 글은 빌드된 HTML에 있다. 스크립트는 무엇을 보일지만 바꾼다. 스크립트가 없어도 여섯 사례가 문서로 보인다.
- 단계를 넘겨도 주소와 방문 기록을 바꾸지 않는다.
- 바깥 서버의 글꼴·스크립트·그림을 부르지 않는다.
- 폭 360px에서 가로로 넘치지 않는다.
- 쓰지 않는 말(`src/lib/forbidden.ts`)이 어느 페이지에도 없다.

## 올리기

`main`에 푸시하면 `.github/workflows/deploy.yml`이 `npm run check`를 돌리고 `dist/`를 GitHub Pages에 올린다.

### Jerry가 처음 한 번 할 일

1. GitHub에 `jerryjungwh/jerryjungwh.github.io` 저장소를 만든다(비어 있게).
2. 이 폴더에서 `git remote add origin git@github.com:jerryjungwh/jerryjungwh.github.io.git` 뒤 `git push -u origin main`.
3. 저장소 Settings → Pages → Source를 **GitHub Actions**로 바꾼다.
4. Actions 탭에서 `deploy`가 끝나면 `https://jerryjungwh.github.io/`에서 열린다.

이 시험 주소는 도메인을 연결하기 전이라 정책 페이지 주소(`jerryjungwh.github.io/SimpleScheduler-Android/`)에 영향을 주지 않는다.

### 시험 빌드와 공개 빌드

- 지금 워크플로는 시험 빌드를 올린다. 시험 빌드는 모든 페이지에 `noindex`를 넣어 검색에 잡히지 않는다(`src/lib/release.ts`).
- 공개할 때는 `deploy.yml`의 `run: npm run check`를 `run: npm run build:release`로 바꾼다. `RELEASE=1`이 붙어 `noindex`가 빠지고, 임시 화면이 하나라도 남아 있으면 검사가 실패해 올라가지 않는다.
- 공개 조건은 설계 19절이다: 화면이 모두 최종이고 도메인이 연결돼 있을 것.

## 다시 찍는 방법

화면은 모두 Android 에뮬레이터의 실제 앱(DEV 디버그 빌드)에서 찍는다. **실제 폰에서는 찍지 않는다.** 스크립트는 켜져 있는 에뮬레이터가 정확히 하나일 때만 돌고, USB나 무선으로 붙은 실제 기기는 고르지 않는다.

기기마다 처음 한 번:

1. 에뮬레이터 하나만 띄운다. 폰은 `Pixel_9_API_35_2`(1080×2424), 태블릿은 `Pixel_Tablet`(2560×1600).
2. 앱 저장소(`simple-scheduler-android-kotlin`)에서 `./gradlew assembleDebug assembleDebugAndroidTest`로 빌드하고, 두 APK를 `adb -s emulator-5554 install -r`로 넣는다. 앱 버전 코드는 `capture/run.ts`의 `APP_VERSION_CODE`와 같아야 한다.
3. 런처에 위젯 세 개를 붙인다. 위젯마다 `adb -s emulator-5554 shell am instrument -w -e siteCapture true -e siteWidget weekly -e class com.jjsoft.android.simplescheduler.ui.SiteCaptureInstrumentedTest#requestWidget com.jjsoft.android.simplescheduler.test/androidx.test.runner.AndroidJUnitRunner`(`weekly`, `today`, `todo`)를 돌리고, 뜨는 창에서 「Add to home screen」을 누른다. 길게 눌러 손잡이로 화면 폭에 맞게 키운다. 한 쪽에 위젯 하나씩 둔다.
4. 런처의 Home settings > Suggestions > 「Suggestions on Home screen」을 끈다(아래 줄에 추천 앱이 끼어들지 않게).

찍기:

```bash
npm run capture -- --device phone --lang ko          # 사례 여섯 개 (약 8분)
npm run capture -- --device phone --lang ko --case university   # 한 사례만
npm run check
```

- 스크립트가 하는 일: 날짜를 수요일 오전 9시로 맞추기, 런처 배경을 단색으로 바꾸기, 사례 데이터 넣기, 촬영 검사 실행, 그림을 WebP로·녹화를 300KB 이하 MP4로 바꾸기, 목록 파일 갱신. 끝나면 배경·시간·권한을 되돌린다.
- 한 사례의 파일이 하나라도 빠지면 그 사례는 한 칸도 바뀌지 않는다.
- 화면 속 글과 수업을 바꾸려면 `capture/fixtures/`의 JSON을 고치고 다시 찍는다. 사례 글(`src/data/cases.<lang>.ts`)에 나오는 시간표·To-Do 이름과 같아야 한다(검사가 본다).
- 하루가 한 화면에 들어오지 않거나 이름이 낱말 중간에서 줄바꿈되면 데이터의 `cellHeightDp`, `textSizeSp`를 고친다.
- 앱 화면이 바뀌는 출시 뒤에는 다시 찍는다.

## 속도

2026-11-12, `node scripts/measure.mjs`(Pixel 7 흉내, 느린 4G, CPU 4배 느리게, 세 번 중 가운데 값):

| 페이지 | 가장 큰 것이 뜨는 시간(LCP) | 화면 밀림(CLS) |
|---|---|---|
| `/` | 0.62초 | 0.012 |
| `/en/` | 0.58초 | 0.000 |
| `/for/university/` | 0.58초 | 0.000 |
| `/faq/` | 0.57초 | 0.000 |

목표는 LCP 2.5초 이하다. 지금은 화면이 대부분 임시 그림이라 가장 큰 것이 제목 글자다. 실제 캡처가 들어온 뒤 다시 잰다. Lighthouse로는 재지 않았다.

## 아직 없는 것

- 초등학교·레슨 사례의 「배경 사진」 단계 화면(언어·기기마다 2칸). 사진 파일을 받아야 찍는다.
- GTM, Play 주소를 방문 정보로 만드는 함수, QR, 동의 배너(측정 계획).
- 영어 정책 페이지, 도메인 연결, 검색 도구 등록(공개 계획).
- 공유용 그림(`og:image`), 기능 페이지 5개.
