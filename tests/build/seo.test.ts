import { expect, test } from 'vitest';
import { findForbidden } from '../../src/lib/forbidden';
import { PLAY_URL } from '../../src/lib/urls';
import { allHtml, enPaths, existsInDist, internalLinks, read, sitemapUrls, type BuiltPage } from './helpers';

const pages = allHtml(); // every page except 404
const ORIGIN = 'https://simganpyo.com';

function jsonLd(p: BuiltPage): Record<string, unknown>[] {
  return p.$('script[type="application/ld+json"]')
    .toArray()
    .map((s) => JSON.parse(p.$(s).text()) as Record<string, unknown>);
}
const typesOf = (p: BuiltPage) => jsonLd(p).map((d) => d['@type']);

test('제목과 설명이 페이지마다 다르다', () => {
  expect(new Set(pages.map((p) => p.$('title').text())).size).toBe(pages.length);
  expect(new Set(pages.map((p) => p.$('meta[name="description"]').attr('content'))).size).toBe(pages.length);
  for (const p of pages) expect(p.$('meta[name="description"]').attr('content')!.length, p.path).toBeGreaterThan(40);
});

test('canonical은 쿼리 없는 자기 주소다', () => {
  for (const p of pages) {
    expect(p.$('link[rel="canonical"]').attr('href'), p.path).toBe(ORIGIN + p.path);
    expect(p.$('link[rel="canonical"]').attr('href')).not.toContain('?');
  }
});

test('hreflang: ko, en, x-default(영어)가 모두 있고 자기 언어는 자기 주소다', () => {
  for (const p of pages) {
    const alt = (l: string) => p.$(`link[rel="alternate"][hreflang="${l}"]`).attr('href');
    expect(alt('ko'), p.path).toBeDefined();
    expect(alt('en'), p.path).toBeDefined();
    expect(alt('x-default'), p.path).toBe(alt('en'));
    expect(alt(p.lang), p.path).toBe(ORIGIN + p.path);
    expect(alt('en'), p.path).toMatch(/^https:\/\/simganpyo\.com\/en\//);
  }
});

test('공유용 태그(og)가 제목·설명·주소와 같다', () => {
  for (const p of pages) {
    expect(p.$('meta[property="og:title"]').attr('content'), p.path).toBe(p.$('title').text());
    expect(p.$('meta[property="og:description"]').attr('content'), p.path).toBe(p.$('meta[name="description"]').attr('content'));
    expect(p.$('meta[property="og:url"]').attr('content'), p.path).toBe(ORIGIN + p.path);
    expect(p.$('meta[property="og:locale"]').attr('content'), p.path).toBe(p.lang === 'ko' ? 'ko_KR' : 'en_US');
  }
});

test('h1은 페이지마다 하나다', () => {
  for (const p of pages) expect(p.$('h1').length, p.path).toBe(1);
});

test('사이트 안 링크는 모두 있는 페이지로 간다', () => {
  // Until the English pages exist, links into /en/ have nowhere to land. Once one exists, all must.
  const englishBuilt = enPaths().length > 0;
  for (const p of pages)
    for (const href of internalLinks(p)) {
      if (!englishBuilt && href.startsWith('/en/')) continue;
      expect(existsInDist(href), `${p.path} → ${href}`).toBe(true);
    }
});

test('Play로 가는 링크에는 모두 출처 꼬리표가 있다', () => {
  for (const p of pages)
    p.$('a[href*="play.google.com"]').each((_, a) => {
      expect(p.$(a).attr('href'), p.path).toContain('referrer=');
    });
});

test('쓰지 않기로 한 말이 어느 페이지에도 없다', () => {
  for (const p of pages) expect(findForbidden(p.$('body').text(), p.lang), p.path).toEqual([]);
});

test('구조화 데이터: 홈과 소개에는 앱 정보와 사이트 정보, 하위 페이지에는 현재 위치', () => {
  for (const p of pages) {
    const types = typesOf(p);
    const home = p.path === '/' || p.path === '/en/';
    const about = p.path.endsWith('/about/');
    expect(types.includes('MobileApplication'), p.path).toBe(home || about);
    expect(types.includes('WebSite'), p.path).toBe(home || about);
    expect(types.includes('BreadcrumbList'), p.path).toBe(!home);
    for (const d of jsonLd(p)) expect(d['@context'], p.path).toBe('https://schema.org');
    expect(JSON.stringify(jsonLd(p))).not.toMatch(/aggregateRating|ratingValue/);
  }
});

test('앱 정보의 설치 주소는 jsonld 출처이고 sameAs는 꼬리표 없는 주소다', () => {
  const home = pages.find((p) => p.path === '/')!;
  const app = jsonLd(home).find((d) => d['@type'] === 'MobileApplication')!;
  expect(decodeURIComponent(String(app.installUrl))).toContain('utm_source=jsonld');
  expect(app.sameAs).toContain(PLAY_URL);
  expect(app.dateModified).toBe(home.$('#what time[datetime]').attr('datetime'));
});

test('질문 구조화 데이터의 글이 화면의 글과 글자까지 같다', () => {
  const withFaq = pages.filter((p) => typesOf(p).includes('FAQPage'));
  expect(withFaq.map((p) => p.path).sort()).toEqual(pages.filter((p) => /\/(faq|for\/[a-z-]+)\/$/.test(p.path)).map((p) => p.path).sort());
  for (const p of withFaq) {
    const data = jsonLd(p).find((d) => d['@type'] === 'FAQPage') as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    const shown = p.$('main dl.faq > div')
      .toArray()
      .map((div) => ({ q: p.$(div).find('dt').text(), a: p.$(div).find('dd').text() }));
    expect(data.mainEntity.map((e) => ({ q: e.name, a: e.acceptedAnswer.text })), p.path).toEqual(shown);
  }
});

test('robots.txt는 모든 수집기를 허용하고 sitemap을 알린다', () => {
  const robots = read('dist/robots.txt');
  expect(robots).toMatch(/User-agent: \*\nAllow: \/\n[\s\S]*Sitemap: https:\/\/simganpyo\.com\/sitemap-index\.xml/);
  expect(robots).not.toMatch(/Disallow: \/\S/);
});

test('sitemap에 모든 페이지가 있고 404는 없다', () => {
  const urls = sitemapUrls();
  for (const p of pages) expect(urls, p.path).toContain(ORIGIN + p.path);
  expect(urls.filter((u) => u.includes('404'))).toEqual([]);
  expect(urls.length).toBe(pages.length);
});

test('llms.txt에 앱 소개, 주요 페이지, 질문, 설치 주소가 있다', () => {
  const llms = read('dist/llms.txt');
  expect(llms.startsWith('# 심간표')).toBe(true);
  expect(llms).toContain('심간표(SimpleScheduler)는 매주 반복되는 수업과 학원 일정을 주간 시간표로 만들고');
  for (const p of pages) expect(llms, p.path).toContain(`${ORIGIN}${p.path}`);
  expect(llms).toContain('심간표는 무료인가요?');
  expect(decodeURIComponent(llms)).toContain('utm_source=llms_txt');
  expect(findForbidden(llms, 'ko')).toEqual([]);
});
