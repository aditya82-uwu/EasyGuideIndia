// Join exported WP content with Search Console page data -> data/content-audit.csv
import { readFile, writeFile } from 'node:fs/promises';

const load = async (f) => JSON.parse(await readFile(new URL(`../export/${f}`, import.meta.url), 'utf8'));
const posts = (await load('posts.json')).map((p) => ({ ...p, kind: 'post' }));
const pages = (await load('pages.json')).map((p) => ({ ...p, kind: 'page' }));

// GSC pages: strip #fragment, fold trailing slash. Base-URL row wins; fragments only fill gaps.
const csv = (await readFile(new URL('../data/gsc-pages.csv', import.meta.url), 'utf8')).split(/\r?\n/).slice(1);
const gsc = new Map();
for (const line of csv) {
  if (!line.trim()) continue;
  const [url, clicks, impr, , pos] = line.split(',');
  const [base, frag] = url.split('#');
  const key = base.replace(/\/$/, '');
  const row = { clicks: +clicks, impr: +impr, pos: +pos, frag: !!frag };
  const prev = gsc.get(key);
  if (!prev || (prev.frag && !row.frag)) gsc.set(key, row);
}

const strip = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
const topic = (u) => {
  if (/stadium|ground|field|gardens|bowl|arena|azteca|gate|parking/.test(u) && /world-cup|fifa|estadio|sofi|metlife|nrg|bmo|bc-place|lumen|levis|arrowhead|hard-rock|mercedes|gillette|lincoln|att-|state-farm|akron|bbva/.test(u)) return 'worldcup-stadium';
  if (/stadium|gate|parking|eden-gardens/.test(u) && /blog\//.test(u)) return 'india-stadium';
  if (/ipl|csk|rcb|mi-vs|rr-vs|gt-vs|dc-vs|pbks|lsg|srh|suryavanshi|fantasy|dream11|cricket/.test(u)) return 'ipl-cricket';
  if (/world-cup|fifa|messi|ronaldo|neymar/.test(u)) return 'worldcup-other';
  const m = u.match(/easyguideindia\.in\/([^/]+)\//);
  return m ? m[1] : 'other';
};

const rows = [...posts, ...pages].map((p) => {
  const key = p.link.replace(/\/$/, '');
  const g = gsc.get(key) ?? { clicks: 0, impr: 0, pos: '' };
  const words = strip(p.content.rendered).split(' ').filter(Boolean).length;
  let action;
  if (g.clicks >= 5 || g.impr >= 1500) action = 'KEEP';
  else if (g.impr >= 100) action = 'REVIEW';
  else action = 'DROP-CANDIDATE';
  return {
    type: p.kind, id: p.id, url: p.link, title: strip(p.title.rendered), published: p.date.slice(0, 10),
    words, clicks: g.clicks, impressions: g.impr, position: g.pos, topic: topic(p.link), suggested: action,
  };
}).sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions);

const head = Object.keys(rows[0]);
const esc = (v) => `"${String(v).replaceAll('"', '""')}"`;
await writeFile(new URL('../data/content-audit.csv', import.meta.url), [head.join(','), ...rows.map((r) => head.map((h) => esc(r[h])).join(','))].join('\n'));

const sum = {};
for (const r of rows) {
  const s = (sum[r.topic] ??= { n: 0, clicks: 0, impr: 0, KEEP: 0, REVIEW: 0, 'DROP-CANDIDATE': 0 });
  s.n++; s.clicks += r.clicks; s.impr += r.impressions; s[r.suggested]++;
}
console.table(sum);
console.log('total', rows.length, Object.fromEntries(['KEEP', 'REVIEW', 'DROP-CANDIDATE'].map((a) => [a, rows.filter((r) => r.suggested === a).length])));
