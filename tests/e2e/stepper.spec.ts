import { expect, test, type Page } from '@playwright/test';

// Math.random() = 0.5 picks index 3 of six cases: university. Its phone captures include a two-frame sequence (remind).
async function openAtUniversity(page: Page) {
  await page.addInitScript(() => {
    Math.random = () => 0.5;
  });
  await page.clock.install();
  await page.goto('/');
  await expect(page.locator('[data-stepper][data-ready]')).toHaveCount(1);
}

const visibleSteps = (page: Page) => page.locator('article[data-case]:visible li[data-step] button');
const currentStep = (page: Page) => page.locator('article[data-case]:visible li[data-step][data-active]');

test('무작위로 고른 사례에서 시작한다', async ({ page }) => {
  await openAtUniversity(page);
  await expect(page.locator('html')).toHaveAttribute('data-start-case', 'university');
  await expect(page.locator('article[data-case="university"]')).toBeVisible();
  await expect(page.locator('article[data-case="middle_school"]')).toBeHidden();
  await expect(page.locator('button[data-track="case_select"][data-case="university"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('button[data-track="case_select"][aria-pressed="true"]')).toHaveCount(1);
});

test('단계를 누르면 그 단계로 가고 5초 뒤 다음 단계로 넘어간다', async ({ page }) => {
  await openAtUniversity(page);
  const steps = visibleSteps(page);
  await steps.nth(3).click();
  await expect(steps.nth(3)).toHaveAttribute('aria-current', 'step');
  await expect(page.locator('figure[data-case="university"][data-step="todo"][data-device="phone"]')).toBeVisible();
  await expect(page.locator('figure[data-media]:visible')).toHaveCount(1);
  await page.clock.runFor(4500);
  await expect(steps.nth(3)).toHaveAttribute('aria-current', 'step');
  await page.clock.runFor(700);
  await expect(steps.nth(4)).toHaveAttribute('aria-current', 'step');
  await expect(steps.nth(3)).toHaveAttribute('aria-current', 'false');
});

test('단계 설명 글을 눌러도 그 단계로 간다', async ({ page }) => {
  await openAtUniversity(page);
  await page.locator('article[data-case="university"] li[data-step="unique"]').click({ position: { x: 5, y: 5 } });
  await expect(currentStep(page)).toHaveAttribute('data-step', 'unique');
});

test('마지막 단계 뒤에는 다음 사례의 첫 단계로 넘어간다', async ({ page }) => {
  await openAtUniversity(page);
  await visibleSteps(page).nth(7).click();
  await page.clock.runFor(5200);
  await expect(page.locator('article[data-case="after_school"]')).toBeVisible();
  await expect(page.locator('article[data-case="university"]')).toBeHidden();
  await expect(currentStep(page)).toHaveAttribute('data-step', 'create');
  await expect(page.locator('button[data-track="case_select"][data-case="after_school"]')).toHaveAttribute('aria-pressed', 'true');
});

test('사례 단추를 누르면 그 사례의 첫 단계부터 시작한다', async ({ page }) => {
  await openAtUniversity(page);
  await visibleSteps(page).nth(5).click();
  await page.locator('button[data-track="case_select"][data-case="lessons"]').click();
  await expect(page.locator('article[data-case="lessons"]')).toBeVisible();
  await expect(currentStep(page)).toHaveAttribute('data-step', 'create');
  await expect(page.locator('figure[data-case="lessons"][data-step="create"][data-device="phone"]')).toBeVisible();
});

test('멈춤 단추를 누르면 넘어가지 않고, 다시 누르면 넘어간다', async ({ page }) => {
  await openAtUniversity(page);
  const pause = page.locator('[data-action="toggle-pause"]');
  await pause.click();
  await expect(pause).toHaveAttribute('aria-pressed', 'true');
  await expect(pause).toHaveText('자동 넘김 켜기');
  await page.clock.runFor(12000);
  await expect(currentStep(page)).toHaveAttribute('data-step', 'create');
  await pause.click();
  await expect(pause).toHaveText('자동 넘김 멈추기');
  await page.clock.runFor(5200);
  await expect(currentStep(page)).toHaveAttribute('data-step', 'fill');
});

test('움직임 줄이기 설정이면 멈춘 채로 시작한다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openAtUniversity(page);
  await expect(page.locator('[data-action="toggle-pause"]')).toHaveAttribute('aria-pressed', 'true');
  await page.clock.runFor(12000);
  await expect(currentStep(page)).toHaveAttribute('data-step', 'create');
});

test('태블릿 전환은 같은 단계의 태블릿 화면을 보인다', async ({ page }) => {
  await openAtUniversity(page);
  await visibleSteps(page).nth(1).click();
  await page.locator('[data-action="device"][data-device="tablet"]').click();
  await expect(page.locator('figure[data-case="university"][data-step="fill"][data-device="tablet"]')).toBeVisible();
  await expect(page.locator('figure[data-case="university"][data-step="fill"][data-device="phone"]')).toBeHidden();
  await expect(page.locator('[data-action="device"][data-device="tablet"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-action="device"][data-device="phone"]')).toHaveAttribute('aria-pressed', 'false');
  await page.clock.runFor(5200);
  await expect(page.locator('figure[data-case="university"][data-step="unique"][data-device="tablet"]')).toBeVisible();
});

test('이어 보기는 장을 차례로 넘기고 다 보인 뒤 다음 단계로 간다', async ({ page }) => {
  await openAtUniversity(page);
  await visibleSteps(page).nth(4).click(); // remind: 2 frames x 2500ms
  const frames = page.locator('figure[data-case="university"][data-step="remind"][data-device="phone"] img[data-frame]');
  await expect(frames.nth(0)).toHaveAttribute('data-on', '');
  await page.clock.runFor(2700);
  await expect(frames.nth(1)).toHaveAttribute('data-on', '');
  await expect(frames.nth(0)).not.toHaveAttribute('data-on', '');
  await expect(currentStep(page)).toHaveAttribute('data-step', 'remind');
  await page.clock.runFor(2500);
  await expect(currentStep(page)).toHaveAttribute('data-step', 'widgets');
});

test('다음 단계의 그림을 미리 받는다', async ({ page }) => {
  await openAtUniversity(page);
  await visibleSteps(page).nth(0).click();
  const next = page.locator('figure[data-case="university"][data-step="fill"][data-device="phone"] img');
  await expect(next.first()).toHaveAttribute('loading', 'eager');
});

test('단계를 넘겨도 주소와 방문 기록이 바뀌지 않는다', async ({ page }) => {
  await openAtUniversity(page);
  const url = page.url();
  const length = await page.evaluate(() => history.length);
  await visibleSteps(page).nth(2).click();
  await page.clock.runFor(11000);
  await page.locator('button[data-track="case_select"][data-case="lessons"]').click();
  expect(page.url()).toBe(url);
  expect(await page.evaluate(() => history.length)).toBe(length);
});

test('자동 넘김이 초점을 빼앗지 않는다', async ({ page }) => {
  await openAtUniversity(page);
  await page.locator('[data-action="toggle-pause"]').focus();
  await page.clock.runFor(11000);
  await expect(page.locator('[data-action="toggle-pause"]')).toBeFocused();
});

test('검사용 상태 읽기가 있다', async ({ page }) => {
  await openAtUniversity(page);
  await visibleSteps(page).nth(2).click();
  const state = await page.evaluate(() => (window as unknown as { __stepper: { getState(): unknown } }).__stepper.getState());
  expect(state).toMatchObject({ caseIndex: 3, stepIndex: 2, paused: false, device: 'phone' });
});

for (const width of [360, 1280]) {
  test(`${width}px에서 가로로 넘치지 않는다`, async ({ page }) => {
    await page.setViewportSize({ width, height: 740 });
    await openAtUniversity(page);
    for (const device of ['phone', 'tablet']) {
      await page.locator(`[data-action="device"][data-device="${device}"]`).click();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, device).toBeLessThanOrEqual(0);
    }
  });
}

test('스크립트가 멈추면 3초 뒤 여섯 사례가 모두 보이는 문서로 돌아간다', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'requestAnimationFrame', {
      get() {
        throw new Error('test: script failure');
      },
    });
  });
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/\bjs\b/, { timeout: 6000 });
  await expect(page.locator('article[data-case]:visible')).toHaveCount(6);
  await expect(page.locator('button.media-zoom:visible')).toHaveCount(0);
});

test.describe('스크립트가 꺼져 있을 때', () => {
  test.use({ javaScriptEnabled: false });

  test('여섯 사례와 모든 단계 글이 보인다', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('article[data-case]:visible')).toHaveCount(6);
    await expect(page.locator('li[data-step] .step-text:visible')).toHaveCount(48);
    await expect(page.locator('[data-action="toggle-pause"]')).toBeHidden();
    await expect(page.locator('button.media-zoom:visible')).toHaveCount(0);
    await expect(page.locator('dialog[data-zoom]')).toBeHidden();
  });

  test('②는 다 쌓인 마지막 장이 보인다', async ({ page }) => {
    await page.goto('/');
    const frames = page.locator('figure[data-case="university"][data-step="fill"][data-device="phone"] img[data-frame]');
    await expect(frames.last()).toHaveAttribute('data-on', '');
    await expect(frames.first()).not.toHaveAttribute('data-on', '');
  });

  test('360px에서 가로로 넘치지 않는다', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test('홈에서는 고른 사례의 첫 화면을 먼저 받는다', async ({ page }) => {
  await openAtUniversity(page);
  const first = page.locator('figure[data-case="university"][data-step="create"][data-device="phone"] img').first();
  await expect(first).toHaveAttribute('loading', 'eager');
  await expect(first).toHaveAttribute('fetchpriority', 'high');
  // Hidden cases stay lazy: nothing is fetched for a case the visitor is not looking at.
  await expect(page.locator('figure[data-case="lessons"][data-step="create"][data-device="phone"] img').first()).toHaveAttribute('loading', 'lazy');
});

test('키보드 초점이 단계 목록에 있으면 넘어가지 않고, 초점이 나가면 다시 넘어간다', async ({ page }) => {
  await openAtUniversity(page);
  const last = visibleSteps(page).nth(7);
  await last.focus();
  await page.keyboard.press('Enter');
  await expect(last).toHaveAttribute('aria-current', 'step');
  await page.clock.runFor(12000);
  await expect(page.locator('article[data-case="university"]')).toBeVisible();
  await expect(last).toBeFocused();
  await expect(last).toHaveAttribute('aria-current', 'step');
  await page.locator('[data-action="toggle-pause"]').focus();
  await page.clock.runFor(5200);
  await expect(page.locator('article[data-case="after_school"]')).toBeVisible();
});

test('멈춘 채로 켜진 단계를 다시 누르면 이어 보기의 다음 장이 보인다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openAtUniversity(page);
  const remind = visibleSteps(page).nth(4);
  await remind.click();
  const frames = page.locator('figure[data-case="university"][data-step="remind"][data-device="phone"] img[data-frame]');
  await expect(frames.nth(0)).toHaveAttribute('data-on', '');
  await remind.click();
  await expect(frames.nth(1)).toHaveAttribute('data-on', '');
  await expect(frames.nth(0)).not.toHaveAttribute('data-on', '');
  await remind.click();
  await expect(frames.nth(0)).toHaveAttribute('data-on', '');
  await expect(currentStep(page)).toHaveAttribute('data-step', 'remind');
});

test('문서 모드로 돌아간 뒤에 늦게 온 스크립트는 붙지 않는다', async ({ page }) => {
  await page.route('**/_astro/*.js', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 4000));
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).not.toHaveClass(/\bjs\b/, { timeout: 6000 });
  await page.waitForLoadState('load');
  await page.waitForTimeout(500);
  await expect(page.locator('[data-stepper][data-ready]')).toHaveCount(0);
  await expect(page.locator('article[data-case]:visible')).toHaveCount(6);
});

// Headless Chromium has no H.264 decoder, so these watch what the page asks the video to do, not the picture.
async function watchVideos(page: Page) {
  await page.addInitScript(() => {
    const calls: string[] = [];
    (window as unknown as { __videoCalls: string[] }).__videoCalls = calls;
    const name = (v: HTMLMediaElement) => v.closest('figure')?.getAttribute('data-step') ?? '?';
    HTMLMediaElement.prototype.play = function () {
      calls.push(`play:${name(this)}`);
      // A browser fires 'playing' once a frame is on screen; the page shows the video only then.
      this.dispatchEvent(new Event('playing'));
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function () {
      calls.push(`pause:${name(this)}`);
    };
  });
}
const videoCalls = (page: Page) => page.evaluate(() => (window as unknown as { __videoCalls: string[] }).__videoCalls);
const doneVideo = (page: Page) => page.locator('figure[data-case="university"][data-step="widget_done"][data-device="phone"] video');

test('녹화 단계가 켜지면 영상을 처음부터 재생하고, 다른 단계로 가면 멈춘다', async ({ page }) => {
  await watchVideos(page);
  await openAtUniversity(page);
  expect(await videoCalls(page)).toEqual([]);
  await visibleSteps(page).nth(6).click();
  await expect(doneVideo(page)).toHaveAttribute('data-playing', '');
  expect(await videoCalls(page)).toEqual(['play:widget_done']);
  await visibleSteps(page).nth(1).click();
  await expect(doneVideo(page)).not.toHaveAttribute('data-playing', '');
  expect(await videoCalls(page)).toEqual(['play:widget_done', 'pause:widget_done']);
});

test('자동 넘김을 멈추면 영상도 멈추고, 다시 켜면 이어서 재생한다', async ({ page }) => {
  await watchVideos(page);
  await openAtUniversity(page);
  await visibleSteps(page).nth(6).click();
  await page.locator('[data-action="toggle-pause"]').click();
  expect(await videoCalls(page)).toEqual(['play:widget_done', 'pause:widget_done']);
  // Paused, the poster-like still frame stays on screen: the video is not hidden again.
  await expect(doneVideo(page)).toHaveAttribute('data-playing', '');
  await page.locator('[data-action="toggle-pause"]').click();
  expect(await videoCalls(page)).toEqual(['play:widget_done', 'pause:widget_done', 'play:widget_done']);
});

test('움직임 줄이기 설정이면 녹화 단계에서도 영상을 재생하지 않는다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await watchVideos(page);
  await openAtUniversity(page);
  await visibleSteps(page).nth(6).click();
  await expect(visibleSteps(page).nth(6)).toHaveAttribute('aria-current', 'step');
  expect(await videoCalls(page)).toEqual([]);
  await expect(doneVideo(page)).not.toHaveAttribute('data-playing', '');
});

// The still under a recording shows the To-Do completed. Unless the recording is already loaded when
// its step starts, that still shows first and the recording then jumps back to before the tap.
test('다음 단계가 녹화면 영상도 미리 받는다', async ({ page }) => {
  await watchVideos(page);
  await openAtUniversity(page);
  await expect(doneVideo(page)).toHaveAttribute('preload', 'none');
  await visibleSteps(page).nth(5).click();
  await expect(doneVideo(page)).toHaveAttribute('preload', 'auto');
});

test('움직임 줄이기 설정이면 녹화를 미리 받지 않는다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await watchVideos(page);
  await openAtUniversity(page);
  await visibleSteps(page).nth(5).click();
  await expect(visibleSteps(page).nth(5)).toHaveAttribute('aria-current', 'step');
  await expect(doneVideo(page)).toHaveAttribute('preload', 'none');
});

test('녹화 단계는 영상 길이만큼 머문 뒤 다음 단계로 간다', async ({ page }) => {
  await watchVideos(page);
  await openAtUniversity(page);
  await visibleSteps(page).nth(6).click();
  const stay = Number(await page.locator('figure[data-case="university"][data-step="widget_done"][data-device="phone"]').getAttribute('data-duration'));
  expect(stay).toBeGreaterThan(5000);
  await page.clock.runFor(stay - 400);
  await expect(visibleSteps(page).nth(6)).toHaveAttribute('aria-current', 'step');
  await page.clock.runFor(700);
  await expect(visibleSteps(page).nth(7)).toHaveAttribute('aria-current', 'step');
});

test('녹화 단계가 화면 밖으로 나가면 영상도 멈추고, 돌아오면 이어서 재생한다', async ({ page }) => {
  await watchVideos(page);
  await openAtUniversity(page);
  await visibleSteps(page).nth(6).click();
  expect(await videoCalls(page)).toEqual(['play:widget_done']);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(async () => (await page.clock.runFor(100), (await videoCalls(page)).join(' '))).toBe('play:widget_done pause:widget_done');
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(async () => (await page.clock.runFor(100), (await videoCalls(page)).join(' '))).toBe('play:widget_done pause:widget_done play:widget_done');
});

test('녹화를 처음부터 다시 틀 때는 첫 장면이 나오기 전까지 영상을 가린다', async ({ page }) => {
  await page.addInitScript(() => {
    // A browser that has not shown a frame yet: play() resolves, 'playing' never fires.
    HTMLMediaElement.prototype.play = () => Promise.resolve();
    HTMLMediaElement.prototype.pause = () => {};
  });
  await openAtUniversity(page);
  await visibleSteps(page).nth(6).click();
  await expect(visibleSteps(page).nth(6)).toHaveAttribute('aria-current', 'step');
  await expect(doneVideo(page)).not.toHaveAttribute('data-playing', '');
});

// 크게 보기: a window with the screen at its original size. The stepper and the recording wait while it is open.
const activeFigure = (page: Page) => page.locator('[data-stepper] figure[data-media][data-active]:visible');
const zoomButton = (page: Page) => activeFigure(page).locator('button[data-action="zoom"]');
const zoomDialog = (page: Page) => page.locator('dialog[data-zoom]');
const zoomClose = (page: Page) => zoomDialog(page).locator('button[data-action="zoom-close"]');
const toTablet = (page: Page) => page.locator('[data-action="device"][data-device="tablet"]').click();

test('크게 보기를 누르면 지금 화면의 원본 크기 그림이 창에 열린다(태블릿 2560px, 폰 1080px)', async ({ page }) => {
  await openAtUniversity(page);
  for (const [device, width] of [['phone', 1080], ['tablet', 2560]] as const) {
    if (device === 'tablet') await toTablet(page);
    const shown = activeFigure(page).locator('img[data-on]');
    await zoomButton(page).click();
    await expect(zoomDialog(page)).toHaveAttribute('open', '');
    const big = zoomDialog(page).locator('img');
    await expect(big).toHaveAttribute('src', (await shown.getAttribute('src'))!);
    await expect(big).toHaveAttribute('alt', (await shown.getAttribute('alt'))!);
    await expect.poll(() => big.evaluate((i: HTMLImageElement) => i.naturalWidth), { message: device }).toBe(width);
    await zoomClose(page).click();
  }
});

test('확대 창은 닫기 단추·Esc·바깥 누르기로 닫히고, 초점은 크게 보기 단추로 돌아온다', async ({ page }) => {
  await openAtUniversity(page);
  for (const how of ['button', 'escape', 'outside'] as const) {
    await zoomButton(page).click();
    await expect(zoomDialog(page)).toHaveAttribute('open', '');
    await expect(zoomClose(page), how).toBeFocused();
    if (how === 'button') await zoomClose(page).click();
    if (how === 'escape') await page.keyboard.press('Escape');
    if (how === 'outside') await page.mouse.click(4, page.viewportSize()!.height - 4);
    await expect(zoomDialog(page), how).not.toHaveAttribute('open', '');
    await expect(zoomButton(page), how).toBeFocused();
  }
});

test('확대 창이 열려 있는 동안 넘어가지 않고, 닫으면 그 자리에서 이어 간다', async ({ page }) => {
  await openAtUniversity(page);
  await visibleSteps(page).nth(1).click();
  const stay = Number(await activeFigure(page).getAttribute('data-duration'));
  await page.clock.runFor(1000);
  await zoomButton(page).click();
  await page.clock.runFor(stay + 5000);
  await expect(visibleSteps(page).nth(1)).toHaveAttribute('aria-current', 'step');
  await expect(page.locator('[data-action="toggle-pause"]')).toHaveAttribute('aria-pressed', 'false');
  await zoomClose(page).click();
  await page.clock.runFor(stay - 1000 - 400);
  await expect(visibleSteps(page).nth(1)).toHaveAttribute('aria-current', 'step');
  await page.clock.runFor(800);
  await expect(visibleSteps(page).nth(2)).toHaveAttribute('aria-current', 'step');
});

test('이어 보기는 지금 보이는 장을 크게 보이고, 멈춘 채로 눌러도 다음 장으로 넘어가지 않는다', async ({ page }) => {
  await openAtUniversity(page);
  await toTablet(page);
  await visibleSteps(page).nth(4).click(); // remind: 2 frames x 2500ms
  await page.clock.runFor(2700);
  const second = activeFigure(page).locator('img[data-frame="1"]');
  await expect(second).toHaveAttribute('data-on', '');
  await zoomButton(page).click();
  await expect(zoomDialog(page).locator('img')).toHaveAttribute('src', (await second.getAttribute('src'))!);
  await zoomClose(page).click();
  await page.locator('[data-action="toggle-pause"]').click();
  await zoomButton(page).click();
  await zoomClose(page).click();
  await expect(second).toHaveAttribute('data-on', '');
});

test('녹화 단계에서 열면 영상이 멈추고 완료 화면을 크게 보이며, 닫으면 이어서 재생한다', async ({ page }) => {
  await watchVideos(page);
  await openAtUniversity(page);
  await visibleSteps(page).nth(6).click();
  expect(await videoCalls(page)).toEqual(['play:widget_done']);
  const still = activeFigure(page).locator('img[data-on]');
  await zoomButton(page).click();
  await expect(zoomDialog(page).locator('img')).toHaveAttribute('src', (await still.getAttribute('src'))!);
  expect(await videoCalls(page)).toEqual(['play:widget_done', 'pause:widget_done']);
  await page.keyboard.press('Escape');
  await expect.poll(() => videoCalls(page)).toEqual(['play:widget_done', 'pause:widget_done', 'play:widget_done']);
});

test('누르기 전에는 원본 크기 그림을 받지 않고, 주소와 방문 기록도 바뀌지 않는다', async ({ page }) => {
  const requested: string[] = [];
  page.on('request', (r) => requested.push(new URL(r.url()).pathname));
  await openAtUniversity(page);
  await toTablet(page);
  const src = (await activeFigure(page).locator('img[data-on]').getAttribute('src'))!;
  const path = new URL(src, page.url()).pathname;
  const before = { url: page.url(), length: await page.evaluate(() => history.length) };
  expect(requested).not.toContain(path);
  await zoomButton(page).click();
  await expect.poll(() => requested.filter((x) => x === path).length).toBe(1);
  await page.keyboard.press('Escape');
  expect({ url: page.url(), length: await page.evaluate(() => history.length) }).toEqual(before);
});

test('움직임 줄이기 설정이면 열고 닫아도 멈춘 채로 있다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openAtUniversity(page);
  await zoomButton(page).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-action="toggle-pause"]')).toHaveAttribute('aria-pressed', 'true');
});

test('360px에서 창이 열려도 페이지는 가로로 넘치지 않고, 태블릿 화면은 창 안에서 옆으로 민다', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await openAtUniversity(page);
  await toTablet(page);
  await zoomButton(page).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  const body = zoomDialog(page).locator('[data-zoom-body]');
  expect(await body.evaluate((b) => b.scrollWidth > b.clientWidth)).toBe(true);
  expect(await zoomDialog(page).locator('img').evaluate((i) => i.getBoundingClientRect().width)).toBeGreaterThanOrEqual(1024);
});

// ② stacks the classes up: 0.7 s a screen, then it holds on the full week.
const fillFrames = (page: Page, device = 'phone') => page.locator(`figure[data-case="university"][data-step="fill"][data-device="${device}"] img[data-frame]`);

test('② 쌓이는 장면은 0.7초마다 한 장씩 켜지고, 다 쌓인 장에서 머문 뒤 ③으로 간다', async ({ page }) => {
  await openAtUniversity(page);
  await visibleSteps(page).nth(1).click();
  const frames = fillFrames(page);
  await expect(frames).toHaveCount(3);
  await expect(frames.nth(0)).toHaveAttribute('data-on', '');
  await page.clock.runFor(800);
  await expect(frames.nth(1)).toHaveAttribute('data-on', '');
  await page.clock.runFor(700);
  await expect(frames.nth(2)).toHaveAttribute('data-on', '');
  await page.clock.runFor(2900);
  await expect(visibleSteps(page).nth(1)).toHaveAttribute('aria-current', 'step');
  await expect(frames.nth(2)).toHaveAttribute('data-on', '');
  await page.clock.runFor(400);
  await expect(visibleSteps(page).nth(2)).toHaveAttribute('aria-current', 'step');
});

test('움직임 줄이기면 ②를 열 때 다 쌓인 장이 보이고, 누르면 첫 장부터 다시 넘어가며, 기기를 바꿔도 다 쌓인 장이다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openAtUniversity(page);
  await visibleSteps(page).nth(1).click();
  await expect(fillFrames(page).nth(2)).toHaveAttribute('data-on', '');
  await visibleSteps(page).nth(1).click();
  await expect(fillFrames(page).nth(0)).toHaveAttribute('data-on', '');
  await visibleSteps(page).nth(1).click();
  await expect(fillFrames(page).nth(1)).toHaveAttribute('data-on', '');
  await toTablet(page);
  await expect(fillFrames(page, 'tablet').last()).toHaveAttribute('data-on', '');
});

test('아직 받지 못한 장은 받을 때까지 앞 장을 계속 보인다', async ({ page }) => {
  let release!: () => void;
  const held = new Promise<void>((r) => (release = r));
  await page.route(/fill-2[^/]*\.webp/, async (route) => {
    await held;
    await route.continue();
  });
  await openAtUniversity(page);
  await visibleSteps(page).nth(1).click();
  await page.clock.runFor(900);
  await expect(fillFrames(page).nth(0)).toHaveAttribute('data-on', '');
  await expect(fillFrames(page).nth(1)).not.toHaveAttribute('data-on', '');
  release();
  await expect.poll(async () => (await page.clock.runFor(50), fillFrames(page).nth(1).getAttribute('data-on'))).toBe('');
});

test('②가 쌓이는 도중에 멈추면 다 쌓인 장에서 멈춘다', async ({ page }) => {
  await openAtUniversity(page);
  await visibleSteps(page).nth(1).click();
  await page.clock.runFor(500);
  await expect(fillFrames(page).nth(0)).toHaveAttribute('data-on', '');
  await page.locator('[data-action="toggle-pause"]').click();
  await expect(fillFrames(page).nth(2)).toHaveAttribute('data-on', '');
});

test('녹화가 끝난 뒤 창을 열고 닫아도 녹화를 처음부터 다시 틀지 않는다', async ({ page }) => {
  await watchVideos(page);
  await openAtUniversity(page);
  await visibleSteps(page).nth(6).click();
  expect(await videoCalls(page)).toEqual(['play:widget_done']);
  // The recording reached its end: the browser reports it as ended and holds the last frame.
  await doneVideo(page).evaluate((v) => Object.defineProperty(v, 'ended', { get: () => true }));
  await zoomButton(page).click();
  await zoomClose(page).click();
  // The dialog's close event runs after the click: it empties the window, then syncs the recording.
  await expect(zoomDialog(page).locator('img')).toHaveCount(0);
  expect(await videoCalls(page)).toEqual(['play:widget_done', 'pause:widget_done']);
});

test('폰 화면을 크게 보면 데스크톱에서 페이지 안 화면의 1.5배 이상으로 보인다', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openAtUniversity(page);
  const small = await activeFigure(page).locator('img[data-on]').evaluate((i) => i.getBoundingClientRect().width);
  await zoomButton(page).click();
  const big = await zoomDialog(page).locator('img').evaluate((i) => i.getBoundingClientRect().width);
  expect(big).toBeGreaterThanOrEqual(small * 1.5);
});

test('크게 보기를 두 번 눌러도 창이 열린 채로 있다', async ({ page }) => {
  await openAtUniversity(page);
  await zoomButton(page).dblclick();
  await expect(zoomDialog(page)).toHaveAttribute('open', '');
});

test('마우스로 열고 Esc로 닫으면 자동 넘김이 이어 간다', async ({ page }) => {
  await openAtUniversity(page);
  const stay = Number(await activeFigure(page).getAttribute('data-duration'));
  await zoomButton(page).click();
  await page.keyboard.press('Escape');
  await expect(zoomDialog(page)).not.toHaveAttribute('open', '');
  await page.clock.runFor(stay + 300);
  await expect(visibleSteps(page).nth(1)).toHaveAttribute('aria-current', 'step');
});

// iOS Safari refuses play() on an auto-advanced step while nothing is buffered. A single refusal used
// to leave the step on its still image: the recording never ran unless the visitor tapped the step.
test('첫 재생이 거부되면 받아 온 뒤 한 번 더 시도한다 (아이폰 Safari)', async ({ page }) => {
  await page.addInitScript(() => {
    const calls: string[] = [];
    (window as unknown as { __videoCalls: string[] }).__videoCalls = calls;
    const name = (v: HTMLMediaElement) => v.closest('figure')?.getAttribute('data-step') ?? '?';
    let refused = false;
    HTMLMediaElement.prototype.play = function () {
      if (!refused) {
        refused = true;
        calls.push(`refused:${name(this)}`);
        // The page should fetch and ask again; firing 'canplay' is what the browser does once it can.
        setTimeout(() => this.dispatchEvent(new Event('canplay')), 0);
        return Promise.reject(new DOMException('NotAllowedError'));
      }
      calls.push(`play:${name(this)}`);
      this.dispatchEvent(new Event('playing'));
      return Promise.resolve();
    };
  });
  await openAtUniversity(page);
  await visibleSteps(page).nth(6).click();
  await expect(doneVideo(page)).toHaveAttribute('data-playing', '');
  expect(await videoCalls(page)).toEqual(['refused:widget_done', 'play:widget_done']);
  // The retry fetches: a video left at preload="none" would have nothing to play.
  expect(await doneVideo(page).evaluate((v: HTMLVideoElement) => v.preload)).toBe('auto');
});

test('두 번째 재생도 거부되면 포기하고 정지 화면을 보인다', async ({ page }) => {
  await page.addInitScript(() => {
    const calls: string[] = [];
    (window as unknown as { __videoCalls: string[] }).__videoCalls = calls;
    const name = (v: HTMLMediaElement) => v.closest('figure')?.getAttribute('data-step') ?? '?';
    HTMLMediaElement.prototype.play = function () {
      calls.push(`refused:${name(this)}`);
      setTimeout(() => this.dispatchEvent(new Event('canplay')), 0);
      return Promise.reject(new DOMException('NotAllowedError'));
    };
  });
  await openAtUniversity(page);
  await visibleSteps(page).nth(6).click();
  // The retry runs a tick later, so wait for the second refusal rather than reading the list once.
  await expect.poll(() => videoCalls(page)).toEqual(['refused:widget_done', 'refused:widget_done']);
  await expect(doneVideo(page)).not.toHaveAttribute('data-playing', '');
  await expect(page.locator('figure[data-case="university"][data-step="widget_done"][data-device="phone"] img[data-on]')).toHaveCount(1);
  // It gives up after the second refusal: no endless retry loop.
  await page.waitForTimeout(300);
  expect(await videoCalls(page)).toEqual(['refused:widget_done', 'refused:widget_done']);
});
