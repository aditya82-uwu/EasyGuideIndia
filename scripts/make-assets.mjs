// Generate favicon set and social share images into public/. Run: node scripts/make-assets.mjs
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const NAVY = '#0f172a', AMBER = '#f59e0b';

// Three stumps and two bails on a navy tile.
const mark = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${NAVY}"/>
  <rect x="19" y="18" width="5" height="30" rx="2" fill="${AMBER}"/>
  <rect x="29.5" y="18" width="5" height="30" rx="2" fill="${AMBER}"/>
  <rect x="40" y="18" width="5" height="30" rx="2" fill="${AMBER}"/>
  <rect x="21" y="13" width="10" height="3.5" rx="1.75" fill="#fff"/>
  <rect x="33" y="13" width="10" height="3.5" rx="1.75" fill="#fff"/>
</svg>`;

await writeFile(new URL('public/favicon.svg', root), mark(64));
await sharp(Buffer.from(mark(180))).png().toFile(new URL('public/apple-touch-icon.png', root).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
await sharp(Buffer.from(mark(32))).png().toFile(new URL('public/favicon-32.png', root).pathname.replace(/^\/([A-Za-z]:)/, '$1'));

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const wrap = (text, max) => {
  const lines = [];
  let cur = '';
  for (const w of text.split(' ')) {
    if ((cur + ' ' + w).trim().length > max) { lines.push(cur.trim()); cur = w; } else cur += ' ' + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines.slice(0, 3);
};

const card = ({ kicker, title, sub }) => {
  const lines = wrap(title, 20);
  const size = lines.length > 2 ? 84 : 100;
  const tspans = lines.map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : size * 1.1}">${esc(l)}</tspan>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${NAVY}"/>
  <rect x="0" y="0" width="14" height="630" fill="${AMBER}"/>
  <text x="80" y="110" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" letter-spacing="3" fill="${AMBER}">${esc(kicker)}</text>
  <text x="80" y="${lines.length > 2 ? 230 : 250}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="800" fill="#fff">${tspans}</text>
  <text x="80" y="520" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="#cbd5e1">${esc(sub)}</text>
  <text x="80" y="582" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800" fill="#fff">Easy<tspan fill="${AMBER}">Guide</tspan>India</text>
</svg>`;
};

const out = (rel) => new URL(rel, root).pathname.replace(/^\/([A-Za-z]:)/, '$1');
await mkdir(new URL('public/og/', root), { recursive: true });

await sharp(Buffer.from(card({ kicker: 'MATCH-DAY GUIDES', title: 'Reach the stadium. Know the rules.', sub: 'Gates, parking, metro and banned items for Indian cricket grounds' }))).png().toFile(out('public/og/default.png'));

let n = 0;
for (const f of await readdir(new URL('src/content/stadiums/', root))) {
  const t = await readFile(new URL(`src/content/stadiums/${f}`, root), 'utf8');
  const get = (k) => t.match(new RegExp(`^${k}: "?([^"\\n]+)"?`, 'm'))[1];
  await sharp(Buffer.from(card({ kicker: 'STADIUM GUIDE', title: get('name'), sub: `${get('city')} · Gates, parking, metro, rules` }))).png().toFile(out(`public/og/${get('legacySlug')}.png`));
  n++;
}
console.log('favicon set + default og + stadium og:', n);
