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
});

test.describe('스크립트가 꺼져 있을 때', () => {
  test.use({ javaScriptEnabled: false });

  test('여섯 사례와 모든 단계 글이 보인다', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('article[data-case]:visible')).toHaveCount(6);
    await expect(page.locator('li[data-step] .step-text:visible')).toHaveCount(48);
    await expect(page.locator('[data-action="toggle-pause"]')).toBeHidden();
  });

  test('360px에서 가로로 넘치지 않는다', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
