// Generate favicon set and social share images into public/. Run: node scripts/make-assets.mjs
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const PAPER = '#f6f3ec', INK = '#17150f', RED = '#b0382b';

// Three ink stumps and two red bails on a paper tile.
const mark = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${PAPER}"/>
  <rect x="19" y="20" width="5" height="30" rx="2" fill="${INK}"/>
  <rect x="29.5" y="20" width="5" height="30" rx="2" fill="${INK}"/>
  <rect x="40" y="20" width="5" height="30" rx="2" fill="${INK}"/>
  <rect x="20" y="13" width="11" height="4" rx="2" fill="${RED}"/>
  <rect x="33" y="13" width="11" height="4" rx="2" fill="${RED}"/>
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
  const lines = wrap(title, 18);
  const size = lines.length > 2 ? 104 : 124;
  const tspans = lines.map((l, i) => `<tspan x="84" dy="${i === 0 ? 0 : size * 1.0}">${esc(l)}</tspan>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${PAPER}"/>
  <rect x="84" y="78" width="56" height="4" fill="${RED}"/>
  <text x="84" y="128" font-family="Courier New, monospace" font-size="26" font-weight="700" fill="${RED}">${esc(kicker)}</text>
  <text x="84" y="${lines.length > 2 ? 270 : 290}" font-family="Georgia, 'Times New Roman', serif" font-size="${size}" fill="${INK}" letter-spacing="-3">${tspans}</text>
  <line x1="84" y1="500" x2="1116" y2="500" stroke="#ddd5c4" stroke-width="2"/>
  <text x="84" y="552" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#4b463b">${esc(sub)}</text>
  <text x="1116" y="552" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" fill="${INK}">Easy Guide India</text>
</svg>`;
};

const out = (rel) => new URL(rel, root).pathname.replace(/^\/([A-Za-z]:)/, '$1');
await mkdir(new URL('public/og/', root), { recursive: true });

await sharp(Buffer.from(card({ kicker: 'FIELD GUIDE TO INDIAN CRICKET GROUNDS', title: 'Reach the ground. Know the rules.', sub: 'Gates, parking, metro and banned items for Indian cricket grounds' }))).png().toFile(out('public/og/default.png'));

let n = 0;
for (const f of await readdir(new URL('src/content/stadiums/', root))) {
  const t = await readFile(new URL(`src/content/stadiums/${f}`, root), 'utf8');
  const get = (k) => t.match(new RegExp(`^${k}: "?([^"\\n]+)"?`, 'm'))[1];
  await sharp(Buffer.from(card({ kicker: 'STADIUM GUIDE', title: get('name'), sub: `${get('city')} · Gates, parking, transport, rules` }))).png().toFile(out(`public/og/${get('legacySlug')}.png`));
  n++;
}
console.log('favicon set + default og + stadium og:', n);
