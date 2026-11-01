// Audit built HTML in dist/: title, description, canonical, headings, JSON-LD, images, duplicates.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SITE = 'https://www.easyguideindia.in';

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'pagefind' && e.name !== '_astro') out.push(...(await walk(full))); }
    else if (e.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const issues = [];
const titles = new Map();
const descs = new Map();
const add = (page, msg) => issues.push(`${page || '/'}  ${msg}`);
const attr = (html, re) => html.match(re)?.[1];

for (const file of await walk(dist)) {
  const page = '/' + file.slice(dist.length).replaceAll('\\', '/').replace(/index\.html$/, '').replace(/404\.html$/, '404');
  if (page === '/404') continue;
  const html = await readFile(file, 'utf8');
  const unesc = (t) => t?.replaceAll('&amp;', '&').replaceAll('&#39;', "'").replaceAll('&quot;', '"');
  const title = unesc(attr(html, /<title>([^<]*)<\/title>/));
  const desc = unesc(attr(html, /<meta name="description" content="([^"]*)"/));
  const canon = attr(html, /<link rel="canonical" href="([^"]*)"/);
  const h1s = [...html.matchAll(/<h1[\s>]/g)].length;
  const noindex = /name="robots" content="noindex/.test(html);

  if (!title) add(page, 'missing <title>');
  else {
    if (title.length > 65) add(page, `title ${title.length} chars (over 65)`);
    if (title.length < 20) add(page, `title only ${title.length} chars`);
    (titles.get(title) ?? titles.set(title, []).get(title)).push(page);
  }
  if (!desc) add(page, 'missing meta description');
  else {
    if (desc.length > 160) add(page, `description ${desc.length} chars (over 160)`);
    if (desc.length < 70) add(page, `description only ${desc.length} chars`);
    (descs.get(desc) ?? descs.set(desc, []).get(desc)).push(page);
  }
  if (canon !== SITE + page) add(page, `canonical ${canon} (expected ${SITE + page})`);
  if (h1s !== 1) add(page, `${h1s} <h1> elements`);
  if (noindex) add(page, 'noindex (expected only on /search/)');

  // heading order: no level skips deeper than +1
  const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
  for (let i = 1; i < levels.length; i++) if (levels[i] > levels[i - 1] + 1) { add(page, `heading jump h${levels[i - 1]} to h${levels[i]}`); break; }

  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt=/.test(m[0])) add(page, 'img without alt');

  // JSON-LD must parse
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { add(page, 'invalid JSON-LD'); }
  }
  const hasFaqText = /Frequently asked questions/i.test(html);
  const hasFaqSchema = /"FAQPage"/.test(html);
  if (hasFaqText && !hasFaqSchema) add(page, 'visible FAQ section but no FAQPage schema');
  if (hasFaqSchema && !hasFaqText) add(page, 'FAQPage schema but no visible FAQ section');
  if (!/"BreadcrumbList"/.test(html) && page !== '/' && page !== '/search/' && !/privacy|terms|disclaimer|about|contact/.test(page)) add(page, 'no BreadcrumbList schema');
}
for (const [t, pages] of titles) if (pages.length > 1) add(pages.join(', '), `duplicate title "${t}"`);
for (const [d, pages] of descs) if (pages.length > 1) add(pages.join(', '), 'duplicate description');

const byKind = {};
for (const i of issues) { const k = i.split('  ')[1].replace(/[0-9]+/g, 'N').slice(0, 40); byKind[k] = (byKind[k] || 0) + 1; }
console.log(byKind);
console.log(issues.slice(0, Number(process.argv[2] ?? 60)).join('\n'));
console.log('issues:', issues.length);
