// Score the REVIEW and DROP-CANDIDATE pages with extra evidence and propose KEEP / REDIRECT.
// Evidence: Search Console clicks/impressions, internal links from migrated pages, live 301s pointing at the page.
import { readFile, readdir, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const O = 'https://www.easyguideindia.in';

const audit = (await readFile(new URL('data/content-audit.csv', root), 'utf8')).split('\n').slice(1)
  .map((l) => l.split('","').map((x) => x.replace(/"/g, '')))
  .filter((r) => r[10] === 'REVIEW' || r[10] === 'DROP-CANDIDATE')
  .map(([type, id, url, title, published, words, clicks, impr, pos, topic, suggested]) =>
    ({ url, path: url.replace(O, '').replace(/^\/|\/$/g, ''), title, words: +words, clicks: +clicks, impr: +impr, pos, topic, suggested }));

// Internal links from migrated markdown
const md = [];
for (const dir of ['guides', 'stadiums']) {
  for (const f of await readdir(new URL(`src/content/${dir}/`, root))) md.push(await readFile(new URL(`src/content/${dir}/${f}`, root), 'utf8'));
}
const linksTo = (path) => md.filter((t) => t.includes(`](/${path}/)`)).length;

// Live 301s that land on the page
const vercel = JSON.parse(await readFile(new URL('vercel.json', root), 'utf8'));
const redirectsTo = (path) => vercel.redirects.filter((r) => r.destination.replace(/^\/|\/$/g, '') === path).length;

const SIBLING = [
  [/fastag/, 'documents/check-fastag-balance-online'],
  [/pan/, 'documents/pan-card-reprint-online'],
  [/aadhaar|aadhar/, 'documents/check-aadhaar-update-status'],
  [/pf-|epfo/, 'finance'],
];
const redirectTarget = (a) => {
  const p = a.path;
  if (a.topic === 'worldcup-stadium') return 'stadiums';
  if (p.startsWith('documents/')) {
    for (const [re, to] of SIBLING) if (re.test(p)) return to;
    return 'documents';
  }
  if (p.startsWith('finance/')) return 'finance';
  if (p.startsWith('railway/')) return 'railway';
  if (p.startsWith('banking/')) return 'banking';
  return '';
};

const LEGAL = new Set(['about-us', 'contact-us', 'privacy-policy', 'terms-and-conditions', 'disclaimer']);
const HUBS = new Set(['documents', 'railway', 'banking', 'finance', 'blog']);

const rows = audit.map((a) => {
  const inLinks = linksTo(a.path);
  const inRedirects = redirectsTo(a.path);
  let action, why;
  if (LEGAL.has(a.path)) { action = 'KEEP'; why = 'legal page, already migrated'; }
  else if (HUBS.has(a.path)) { action = 'HUB'; why = 'replaced by generated section hub'; }
  else if (a.topic === 'worldcup-stadium') { action = 'REDIRECT'; why = 'World Cup 2026 venue guide, event is over (owner decision)'; }
  else if (inLinks >= 2) { action = 'KEEP'; why = `${inLinks} migrated pages link here`; }
  else if (inRedirects >= 3) { action = 'KEEP'; why = `${inRedirects} live 301s land here`; }
  else if (a.clicks >= 2 || a.impr >= 300) { action = 'KEEP'; why = 'some search demand'; }
  else { action = 'REDIRECT'; why = a.impr < 100 ? 'under 100 impressions in 12 months' : 'low demand, no links'; }
  return { ...a, inLinks, inRedirects, action, why, to: action === 'REDIRECT' ? '/' + redirectTarget(a) + '/' : '' };
}).sort((x, y) => x.action.localeCompare(y.action) || y.impr - x.impr);

const head = ['action', 'path', 'title', 'words', 'clicks', 'impr', 'pos', 'inLinks', 'inRedirects', 'to', 'why'];
const esc = (v) => `"${String(v).replaceAll('"', '""')}"`;
await writeFile(new URL('data/review-worksheet.csv', root), [head.join(','), ...rows.map((r) => head.map((h) => esc(r[h])).join(','))].join('\n'));

for (const act of ['KEEP', 'ASK', 'HUB', 'REDIRECT']) {
  const g = rows.filter((r) => r.action === act);
  console.log(`\n== ${act} (${g.length})`);
  for (const r of g) console.log(`${String(r.words).padStart(4)}w ${String(r.clicks).padStart(3)}c ${String(r.impr).padStart(5)}i L${r.inLinks} R${r.inRedirects} /${r.path}/${r.to ? ' -> ' + r.to : ''} | ${r.why}`);
}
