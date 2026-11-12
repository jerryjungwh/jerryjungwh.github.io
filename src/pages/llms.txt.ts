import type { APIRoute } from 'astro';
import { caseDefs, faqGroups, siteStrings } from '../data/site';
import { pageMeta } from '../lib/seo';
import type { Lang } from '../lib/types';
import { APP_STORE_URL, absoluteUrl, machinePlayUrl, pagePath } from '../lib/urls';

/**
 * /llms.txt: the same facts the pages state, as plain Markdown for AI tools that read this file.
 * Nothing here is written only for machines; every line comes from the page copy.
 */
function section(lang: Lang): string {
  const t = siteStrings(lang);
  const url = (page: Parameters<typeof pagePath>[1]) => absoluteUrl(pagePath(lang, page));
  const lines: string[] = [
    lang === 'ko' ? `# ${t.appName} (SimpleScheduler)` : `# ${t.appName} (Simganpyo)`,
    '',
    `> ${t.what.definition}`,
    '',
    ...t.what.facts.map((f) => `- ${f.term}: ${f.desc}`),
    '',
    `## ${t.footer.navLabel}`,
    '',
    `- [${t.appName}](${url('home')}): ${pageMeta(lang, 'home').description}`,
    ...caseDefs(lang).map((c) => `- [${c.name}](${url(`for_${c.id}`)}): ${c.intro}`),
    `- [${t.faqPage.h1}](${url('faq')}): ${t.faqPage.description}`,
    `- [${t.about.h1}](${url('about')}): ${t.about.description}`,
    '',
    `## ${t.install.heading}`,
    '',
    `- [Google Play](${machinePlayUrl(lang, 'llms_txt')})`,
    `- [App Store](${APP_STORE_URL}): ${t.install.iosNote}`,
    '',
    `## ${t.faqPage.h1}`,
    '',
    ...faqGroups(lang).flatMap((g) => [`### ${g.title}`, '', ...g.items.flatMap((i) => [`**${i.q}**`, i.a, ''])]),
  ];
  return lines.join('\n');
}

export const GET: APIRoute = () =>
  new Response(`${section('ko')}\n---\n\n${section('en')}`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
