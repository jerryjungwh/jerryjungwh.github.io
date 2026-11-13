/**
 * Captures real app screens for the site from a running emulator and writes them into the site.
 *
 *   npm run capture -- --device phone|tablet --lang ko|en [--case <case id>]
 *
 * For each case: push its fixture into the app, run SiteCaptureInstrumentedTest (app repository), pull the
 * screenshots and the recording, convert them, and update src/data/captures.manifest.json.
 * Emulator only. One emulator at a time. See README "다시 찍는 방법" for the one-time device setup.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { CASE_ORDER, CASE_SLUG, type CaseId, type Device, type Lang } from '../src/lib/types.ts';
import { fixtureProblems, loadFixture, type CaptureFixture } from './fixture.ts';
import { completeCells, expectedFiles, mergeManifest, pickEmulator, type Manifest } from './lib.ts';

const ADB = join(process.env.ANDROID_HOME ?? join(homedir(), 'Library/Android/sdk'), 'platform-tools/adb');
// From PATH unless set (Homebrew puts them in /opt/homebrew/bin).
const FFMPEG = process.env.FFMPEG ?? 'ffmpeg';
const FFPROBE = process.env.FFPROBE ?? 'ffprobe';
const PKG = 'com.jjsoft.android.simplescheduler';
const RUNNER = `${PKG}.test/androidx.test.runner.AndroidJUnitRunner`;
const TEST = `${PKG}.ui.SiteCaptureInstrumentedTest`;
/** The app build the screens come from. Raise it when the site is re-captured from a newer app. */
const APP_VERSION_CODE = 176;
/** Wednesday 2026-11-18 9:00 on the emulator's own clock: every case has classes that day, no alarm rings that early. */
const CAPTURE_DAY = { year: 2026, month: 11, day: 18, hour: 9 };
const DEVICES: Record<Device, { size: string; videoWidth: number; videoAspect: number }> = {
  phone: { size: '1080x2424', videoWidth: 540, videoAspect: 1080 / 2424 },
  tablet: { size: '2560x1600', videoWidth: 1280, videoAspect: 1280 / 800 },
};
const WIDGETS = ['ClickableWeeklyWidget', 'TodayCombinedWidget', 'TodoListWidget'];
const MAX_VIDEO_BYTES = 300 * 1024;
const root = (path: string) => fileURLToPath(new URL(`../${path}`, import.meta.url));
const MANIFEST = root('src/data/captures.manifest.json');

function option(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : undefined;
}
const device = option('device') as Device;
const lang = option('lang') as Lang;
const only = option('case') as CaseId | undefined;
if (!(device in DEVICES) || !['ko', 'en'].includes(lang) || (only && !CASE_ORDER.includes(only))) {
  console.error('usage: npm run capture -- --device phone|tablet --lang ko|en [--case <case id>]');
  process.exit(2);
}

const serial = pickEmulator(execFileSync(ADB, ['devices'], { encoding: 'utf8' }));
const adb = (...args: string[]) => execFileSync(ADB, ['-s', serial, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const shell = (command: string) => adb('shell', command);
function instrument(method: string, args: Record<string, string>): string {
  const extras = Object.entries({ siteCapture: 'true', ...args }).flatMap(([k, v]) => ['-e', k, v]);
  const out = adb('shell', 'am', 'instrument', '-w', ...extras, '-e', 'class', `${TEST}#${method}`, RUNNER);
  if (!out.includes('OK (1 test)')) throw new Error(`${method} 실패:\n${out}`);
  return out;
}

function checkDevice() {
  if (!/ranchu|goldfish/.test(shell('getprop ro.hardware'))) throw new Error('에뮬레이터가 아니다');
  if (!shell('wm size').includes(DEVICES[device].size)) throw new Error(`${device} 화면 크기(${DEVICES[device].size})가 아니다: ${shell('wm size').trim()}`);
  const version = shell(`dumpsys package ${PKG}`).match(/versionCode=(\d+)/)?.[1];
  if (Number(version) !== APP_VERSION_CODE) throw new Error(`앱 버전 코드가 ${APP_VERSION_CODE}이 아니다: ${version}`);
  if (!shell('pm list packages').includes(`${PKG}.test`)) throw new Error('검사 APK(app-debug-androidTest.apk)가 설치되어 있지 않다');
  const bound = shell('dumpsys appwidget').split('\n').filter((line) => /^\s+provider=ProviderId/.test(line)).join('\n');
  for (const widget of WIDGETS) if (!bound.includes(`.${widget}}`)) throw new Error(`런처에 ${widget} 위젯이 없다 (README의 기기 준비)`);
  // Settings other runs leave behind (CLAUDE.md: font_scale 2.0 tests) would silently change every screen.
  const fontScale = Number(shell('settings get system font_scale').trim() || '1');
  if (fontScale !== 1) throw new Error(`글꼴 배율이 1이 아니다(${fontScale}): adb shell settings put system font_scale 1`);
  if (/Override density/.test(shell('wm density'))) throw new Error('화면 밀도가 바뀌어 있다: adb shell wm density reset');
}

/** The emulator's own UTC offset, so the capture time is 9:00 there whatever the host's time zone. */
function captureTime(): number {
  const offset = shell('date +%z').trim(); // +0900
  const sign = offset.startsWith('-') ? -1 : 1;
  const minutes = sign * (Number(offset.slice(1, 3)) * 60 + Number(offset.slice(3, 5)));
  const { year, month, day, hour } = CAPTURE_DAY;
  return Date.UTC(year, month - 1, day, hour, 0) - minutes * 60_000;
}

function setCaptureClock() {
  shell(`cmd alarm set-time ${captureTime()}`);
  const now = shell("date '+%a %H:%M'").trim();
  if (!/^Wed 09:0[0-4]$/.test(now)) throw new Error(`에뮬레이터 시계를 수요일 9시로 맞추지 못했다(${now})`);
}

/**
 * Non-fatal DEV diagnostics a run records (widgets pointing at a timetable it removed, subscription lookups)
 * sit in Crashlytics' open sessions and go to the real Crashlytics on the app's next start. Drop them after
 * every case, with the app stopped (CLAUDE.md: deleteUnsentReports does not remove them).
 */
function dropCrashlyticsSessions() {
  shell(`am force-stop ${PKG}`);
  shell(`run-as ${PKG} sh -c 'rm -rf files/.crashlytics.v3/*/open-sessions/*'`);
}

function prepare() {
  shell(`appops set ${PKG} SYSTEM_ALERT_WINDOW allow`);
  shell(`appops set ${PKG} SCHEDULE_EXACT_ALARM allow`);
  shell(`pm grant ${PKG} android.permission.POST_NOTIFICATIONS`);
  shell('settings put global auto_time 0');
  instrument('setWallpaper', { siteWallpaper: 'plain' });
}

function restore() {
  const steps: [string, () => void][] = [
    ['배경 화면', () => instrument('setWallpaper', { siteWallpaper: 'default' })],
    // An emulator without telephony (Pixel Tablet) does not take network time back by itself: set it first.
    ['시계', () => shell(`cmd alarm set-time ${Date.now()}`)],
    ['자동 시간', () => shell('settings put global auto_time 1')],
    ['권한', () => (shell(`appops set ${PKG} SYSTEM_ALERT_WINDOW default`), shell(`appops set ${PKG} SCHEDULE_EXACT_ALARM default`))],
    ['Crashlytics 기록', dropCrashlyticsSessions],
  ];
  for (const [name, step] of steps) {
    try {
      step();
    } catch (error) {
      console.error(`되돌리기 실패(${name}): ${(error as Error).message.split('\n')[0]}`);
    }
  }
}

function push(name: string, content: Buffer) {
  execFileSync(ADB, ['-s', serial, 'shell', `run-as ${PKG} sh -c 'mkdir -p files/site-capture-in && cat > files/site-capture-in/${name}'`], { input: content });
}

async function captureCase(c: CaseId): Promise<Manifest> {
  const fixture = loadFixture(lang, c);
  const problems = fixtureProblems(fixture);
  if (problems.length) throw new Error(`${lang}/${c} 데이터 문제:\n${problems.join('\n')}`);
  push('fixture.json', readFileSync(root(`capture/fixtures/${lang}/${c}.json`)));
  for (const t of fixture.timetables) {
    const photo = t.unique?.backgroundImage;
    if (photo) push(photo, readFileSync(root(`capture/fixtures/images/${photo}`)));
  }
  setCaptureClock();
  try {
    instrument('captureSiteCase', { siteFixture: 'site-capture-in/fixture.json', siteDevice: device });
  } finally {
    dropCrashlyticsSessions();
  }

  const remote = `site-capture/${lang}/${c}/${device}`;
  const raw = mkdtempSync(join(tmpdir(), 'site-capture-'));
  const archive = execFileSync(ADB, ['-s', serial, 'exec-out', 'run-as', PKG, 'tar', 'cf', '-', '-C', `files/${remote}`, '.'], { maxBuffer: 256 * 1024 * 1024 });
  execFileSync('/usr/bin/tar', ['xf', '-', '-C', raw], { input: archive });
  adb('pull', `/sdcard/Android/data/${PKG}/files/${remote}/widget_done.mp4`, join(raw, 'widget_done.mp4'));
  try {
    return await convert(c, fixture, raw);
  } catch (error) {
    const slug = `${lang}/${CASE_SLUG[c]}/${device}`;
    for (const dir of [`src/assets/captures/${slug}.next`, `public/captures/${slug}.next`]) rmSync(root(dir), { recursive: true, force: true });
    throw new Error(`${(error as Error).message}\n(촬영 원본은 ${raw}와 기기의 files/${remote}에 남겨 두었다)`);
  }
}

/**
 * Turns one case's raw files into the site's screens. Everything is written next to the case's folders first
 * and swapped in only when all of it succeeded, so a failure never leaves a case half old and half new.
 */
async function convert(c: CaseId, fixture: CaptureFixture, raw: string): Promise<Manifest> {
  const remote = `site-capture/${lang}/${c}/${device}`;
  const session = JSON.parse(readFileSync(join(raw, 'capture-session.json'), 'utf8'));
  if (session.status !== 'complete' || session.versionCode !== APP_VERSION_CODE) throw new Error(`${remote}: ${JSON.stringify(session)}`);
  const present = readdirSync(raw);
  const missing = expectedFiles(fixture).filter((file) => !present.includes(file));
  if (missing.length) throw new Error(`${remote}: 빠진 파일 ${missing.join(', ')}`);

  const slug = `${lang}/${CASE_SLUG[c]}/${device}`;
  const images = root(`src/assets/captures/${slug}`);
  const videos = root(`public/captures/${slug}`);
  const nextImages = `${images}.next`;
  const nextVideos = `${videos}.next`;
  for (const dir of [nextImages, nextVideos]) {
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
  }
  for (const file of expectedFiles(fixture).filter((x) => x.endsWith('.png'))) {
    const name = `${file.replace(/-after\.png$|\.png$/, '')}.webp`;
    await sharp(join(raw, file)).webp({ quality: 92 }).toFile(join(nextImages, name));
  }

  const source = join(raw, 'widget_done.mp4');
  const [w, h] = execFileSync(FFPROBE, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', source], { encoding: 'utf8' }).trim().split(',').map(Number);
  // screenrecord falls back to 1280x720 and letterboxes when it cannot take the display's size.
  if (Math.abs(w / h - DEVICES[device].videoAspect) > 0.02) throw new Error(`${remote}: 녹화 비율이 화면과 다르다(${w}x${h})`);
  const video = join(nextVideos, 'widget_done.mp4');
  for (let crf = 28; ; crf += 3) {
    execFileSync(FFMPEG, ['-v', 'error', '-y', '-i', source, '-an', '-vf', `scale=${DEVICES[device].videoWidth}:-2,fps=30`,
      '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', video]);
    if (statSync(video).size <= MAX_VIDEO_BYTES) break;
    if (crf > 40) throw new Error(`${remote}: 녹화를 ${MAX_VIDEO_BYTES / 1024}KB 아래로 줄이지 못했다`);
  }
  const seconds = Number(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video], { encoding: 'utf8' }));
  const cells = completeCells(fixture, device, present, { durationMs: Math.round(seconds * 1000) });

  // Swap in. The old folders go only now; stale screens of earlier runs (renamed steps) go with them.
  for (const [dir, next] of [[images, nextImages], [videos, nextVideos]]) {
    rmSync(dir, { recursive: true, force: true });
    renameSync(next, dir);
  }
  // The raw screens and the full-rate recording take tens of MB on the device; the tablet image is nearly full.
  shell(`run-as ${PKG} rm -rf files/${remote}`);
  shell(`rm -rf /sdcard/Android/data/${PKG}/files/${remote}`);
  rmSync(raw, { recursive: true });
  return cells;
}

checkDevice();
let failed = false;
// Ctrl-C still gives the device back.
process.on('SIGINT', () => {
  console.error('\n중단: 기기를 되돌린다');
  restore();
  process.exit(130);
});
try {
  prepare();
  for (const c of only ? [only] : CASE_ORDER) {
    process.stdout.write(`${lang}/${c}/${device} … `);
    try {
      const cells = await captureCase(c);
      const manifest: Manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
      writeFileSync(MANIFEST, `${JSON.stringify(mergeManifest(manifest, cells, `${lang}/${c}/${device}/`), null, 2)}\n`);
      console.log(`${Object.keys(cells).length}칸`);
    } catch (error) {
      failed = true;
      console.log('실패');
      console.error((error as Error).message);
    }
  }
} finally {
  restore();
}
process.exit(failed ? 1 : 0);
