// Convert legacy WP stadium posts into src/content/stadiums/*.md (body as markdown, metadata from Yoast).
// Quick answers are merged from data/quick-answers.json when present. Chepauk is hand-built: skipped.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const root = new URL('../', import.meta.url);
const posts = JSON.parse(await readFile(new URL('export/posts.json', root), 'utf8'));
let quick = {};
try { quick = JSON.parse(await readFile(new URL('data/quick-answers.json', root), 'utf8')); } catch {}

// file key -> [legacy slug, name, official name, city, state, country, home team]
const META = {
  'arun-jaitley-delhi': ['arun-jaitley-stadium-delhi-entry-rules-parking-guide', 'Arun Jaitley Stadium', 'Arun Jaitley Stadium (Feroz Shah Kotla)', 'Delhi', 'Delhi', 'India', 'Delhi Capitals'],
  'mullanpur-chandigarh': ['mullanpur-stadium-chandigarh-entry-rules-parking-guide', 'Mullanpur Stadium', 'Maharaja Yadavindra Singh International Cricket Stadium', 'New Chandigarh (Mullanpur)', 'Punjab', 'India', 'Punjab Kings'],
  'narendra-modi-ahmedabad': ['narendra-modi-stadium-ahmedabad-entry-rules-parking-guide', 'Narendra Modi Stadium', 'Narendra Modi Stadium (Motera)', 'Ahmedabad', 'Gujarat', 'India', 'Gujarat Titans'],
  'ekana-lucknow': ['ekana-stadium-lucknow-entry-rules-parking-guide', 'Ekana Stadium', 'BRSABV Ekana Cricket Stadium', 'Lucknow', 'Uttar Pradesh', 'India', 'Lucknow Super Giants'],
  'wankhede-mumbai': ['wankhede-stadium-mumbai-entry-rules-parking-guide', 'Wankhede Stadium', 'Wankhede Stadium', 'Mumbai', 'Maharashtra', 'India', 'Mumbai Indians'],
  'eden-gardens-kolkata': ['eden-gardens-kolkata-entry-rules-metro-parking-guide', 'Eden Gardens', 'Eden Gardens', 'Kolkata', 'West Bengal', 'India', 'Kolkata Knight Riders'],
  'uppal-hyderabad': ['uppal-stadium-hyderabad-entry-gates-parking-guide-rgis', 'Uppal Stadium', 'Rajiv Gandhi International Stadium (Uppal)', 'Hyderabad', 'Telangana', 'India', 'Sunrisers Hyderabad'],
  'dharamshala-hpca': ['dharamshala-cricket-stadium-entry-gates-parking-guide-hpca', 'Dharamshala Cricket Stadium', 'HPCA Stadium', 'Dharamshala', 'Himachal Pradesh', 'India', 'Punjab Kings (alternate home venue)'],
  'sms-jaipur': ['sawai-mansingh-stadium-jaipur-entry-rules-parking-guide', 'Sawai Mansingh Stadium', 'Sawai Mansingh Stadium (SMS)', 'Jaipur', 'Rajasthan', 'India', 'Rajasthan Royals'],
  'barsapara-guwahati': ['barsapara-stadium-guwahati-entry-rules-parking-guide', 'Barsapara Stadium', 'ACA Stadium, Barsapara', 'Guwahati', 'Assam', 'India', 'Rajasthan Royals (second home venue)'],
  'kaloor-kochi': ['kaloor-stadium-kochi-entry-gates-parking-guide', 'Kaloor Stadium', 'Jawaharlal Nehru International Stadium, Kaloor', 'Kochi', 'Kerala', 'India', 'Kerala Blasters (ISL)'],
  'chinnaswamy-bengaluru': ['m-chinnaswamy-stadium-bengaluru-entry-rules-parking-guide', 'M. Chinnaswamy Stadium', 'M. Chinnaswamy Stadium', 'Bengaluru', 'Karnataka', 'India', 'Royal Challengers Bengaluru'],
  'indira-gandhi-guwahati': ['indira-gandhi-athletic-stadium-guwahati-gates-parking-guide', 'Indira Gandhi Athletic Stadium', 'Indira Gandhi Athletic Stadium', 'Guwahati', 'Assam', 'India', 'NorthEast United FC'],
  'jrd-tata-jamshedpur': ['jrd-tata-sports-complex-jamshedpur-gates-parking-guide', 'JRD Tata Sports Complex', 'JRD Tata Sports Complex', 'Jamshedpur', 'Jharkhand', 'India', 'Jamshedpur FC'],
  'headingley-leeds': ['headingley-cricket-ground-entry-rules-gate-protocol', 'Headingley', 'Headingley Cricket Ground', 'Leeds', 'England', 'UK', 'Yorkshire'],
  'utilita-bowl-southampton': ['utilita-bowl-southampton-entry-rules-gate-protocol', 'Utilita Bowl', 'Utilita Bowl', 'Southampton', 'England', 'UK', 'Hampshire'],
  'bristol-county-ground': ['bristol-county-ground-entry-rules-gate-protocol', 'Bristol County Ground', 'Bristol County Ground', 'Bristol', 'England', 'UK', 'Gloucestershire'],
  'lords-london': ['lords-cricket-ground-entry-rules-gate-protocol', "Lord's", "Lord's Cricket Ground", 'London', 'England', 'UK', 'MCC / Middlesex'],
  'the-oval-london': ['the-oval-london-entry-rules-gate-protocol', 'The Oval', 'The Kia Oval', 'London', 'England', 'UK', 'Surrey'],
  'edgbaston-birmingham': ['edgbaston-stadium-entry-rules-gate-protocol-t20-world-cup', 'Edgbaston', 'Edgbaston Stadium', 'Birmingham', 'England', 'UK', 'Warwickshire'],
  'azteca-mexico-city': ['estadio-azteca-banorte-guide-tren-ligero-parking-rules', 'Estadio Azteca', 'Estadio Azteca (Banorte)', 'Mexico City', 'Mexico City', 'Mexico', 'Club America (World Cup 2026 venue)'],
  'old-trafford-manchester': ['old-trafford-cricket-ground-entry-rules-gate-protocol', 'Old Trafford', 'Old Trafford Cricket Ground', 'Manchester', 'England', 'UK', 'Lancashire'],
};

const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced' });
td.use(gfm);
td.remove(['script', 'style', 'svg']);

const clean = (html) => html
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<div id="ez-toc-container"[\s\S]*?<\/nav>\s*<\/div>/, '')
  .replaceAll('https://www.easyguideindia.in/', '/')
  .replace(/&#8217;/g, '’');

await mkdir(new URL('src/content/stadiums/', root), { recursive: true });
const q = (s) => JSON.stringify(s);
const missing = [];

for (const [file, [slug, name, official, city, state, country, team]] of Object.entries(META)) {
  const p = posts.find((x) => x.link.endsWith(`/blog/${slug}/`));
  if (!p) { missing.push(slug); continue; }
  const y = p.yoast_head_json ?? {};
  const title = y.title ?? p.title.rendered;
  const desc = y.description ?? y.og_description ?? '';
  let body = td.turndown(clean(p.content.rendered)).replace(/\n{3,}/g, '\n\n').trim();
  // The first paragraph is already the intro; keep it. Drop any leftover "Table of Contents" label.
  body = body.replace(/^Table of Contents\s*$/m, '');
  const fm = [
    '---',
    `legacySlug: ${q(slug)}`,
    `title: ${q(title.replace(/ - easyguideindia\.in$/, '').replace(/ \| Easy Guide India$/, ''))}`,
    `description: ${q(desc)}`,
    `name: ${q(name)}`,
    `officialName: ${q(official)}`,
    `city: ${q(city)}`,
    `state: ${q(state)}`,
    `country: ${q(country)}`,
    `homeTeam: ${q(team)}`,
    `published: ${p.date.slice(0, 10)}`,
    `updated: ${p.modified.slice(0, 10)}`,
    'quick:',
    ...(quick[file] ?? []).map((x) => `  - { q: ${q(x.q)}, a: ${q(x.a)}, tone: ${x.tone} }`),
    ...(quick[file] ? [] : ['  []']),
    '---',
    '',
  ].join('\n');
  await writeFile(new URL(`src/content/stadiums/${file}.md`, root), fm + body + '\n');
  console.log('wrote', file, body.length);
}
if (missing.length) console.log('MISSING', missing);
