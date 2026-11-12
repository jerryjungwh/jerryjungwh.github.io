// Measures LCP and CLS of built pages on an emulated mid-range phone (4x slower CPU, slow 4G).
// Usage: npm run build && npx astro preview --port 4321, then: node scripts/measure.mjs
import { chromium, devices } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:4321';
const PAGES = ['/', '/en/', '/for/university/', '/faq/'];
// Same network numbers Lighthouse uses for its mobile preset.
const SLOW_4G = { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 };

const browser = await chromium.launch();
for (const path of PAGES) {
  const runs = [];
  for (let i = 0; i < 3; i++) {
    const context = await browser.newContext({ ...devices['Pixel 7'] });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', SLOW_4G);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.addInitScript(() => {
      window.__m = { lcp: 0, cls: 0 };
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) window.__m.lcp = e.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value;
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(BASE + path, { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    runs.push(await page.evaluate(() => window.__m));
    await context.close();
  }
  runs.sort((a, b) => a.lcp - b.lcp);
  const mid = runs[1];
  console.log(`${path.padEnd(18)} LCP ${(mid.lcp / 1000).toFixed(2)}s  CLS ${mid.cls.toFixed(3)}  (LCP runs: ${runs.map((r) => (r.lcp / 1000).toFixed(2)).join(', ')})`);
}
await browser.close();
