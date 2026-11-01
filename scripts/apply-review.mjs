// Apply data/review-worksheet.csv decisions:
//  1. list extra KEEP pages for convert-guides.mjs -> data/guide-paths-extra.json
//  2. rebuild vercel.json redirects (old WP 301s + new REDIRECT rows), resolving chains
//  3. rewrite markdown links that point at redirected pages to their final target
import { readFile, writeFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const rows = (await readFile(new URL('data/review-worksheet.csv', root), 'utf8')).split('\n').slice(1)
  .map((l) => l.split('","').map((x) => x.replace(/"/g, '')))
  .map(([action, path, , , , , , , , to]) => ({ action, path, to }));

const LEGAL = new Set(['about-us', 'contact-us', 'privacy-policy', 'terms-and-conditions', 'disclaimer']);

// Pages already migrated (guides by legacyPath, stadiums by legacySlug)
const done = new Set();
for (const f of await readdir(new URL('src/content/guides/', root))) {
  const t = await readFile(new URL(`src/content/guides/${f}`, root), 'utf8');
  done.add(t.match(/^legacyPath: "(.+)"/m)[1]);
}
for (const f of await readdir(new URL('src/content/stadiums/', root))) {
  const t = await readFile(new URL(`src/content/stadiums/${f}`, root), 'utf8');
  done.add('blog/' + t.match(/^legacySlug: "?([^"\n]+)"?/m)[1]);
}

let prev = [];
try { prev = JSON.parse(await readFile(new URL('data/guide-paths-extra.json', root), 'utf8')); } catch {}
const extra = [...new Set([...prev, ...rows.filter((r) => r.action === 'KEEP' && !LEGAL.has(r.path) && !done.has(r.path)).map((r) => r.path)])];
await writeFile(new URL('data/guide-paths-extra.json', root), JSON.stringify(extra, null, 2));
console.log('extra pages to migrate:', extra.length);

// Redirect map
const vercel = JSON.parse(await readFile(new URL('vercel.json', root), 'utf8'));
const map = new Map(vercel.redirects.map((r) => [r.source, r.destination]));
// Redirection plugin export (301 rules only; 410s are left to 404)
const plugin = JSON.parse(await readFile(new URL('data/redirection-export.json', root), 'utf8'));
for (const r of plugin.redirects.filter((x) => x.enabled && x.action_code === 301 && x.action_type === 'url' && !x.regex)) {
  const src = r.url.endsWith('/') ? r.url : r.url + '/';
  const dest = r.action_data.url;
  if (dest.startsWith('/') && !dest.includes('?p=')) map.set(src, dest.endsWith('/') ? dest : dest + '/');
}
for (const r of rows.filter((x) => x.action === 'REDIRECT')) map.set(`/${r.path}/`, r.to);
map.set('/blog/', '/stadiums/');

const resolve = (dest) => {
  const seen = new Set();
  while (map.has(dest) && !seen.has(dest)) { seen.add(dest); dest = map.get(dest); }
  return dest;
};
const redirects = [...map].map(([source, d]) => ({ source, destination: resolve(d), permanent: true }))
  .filter((r) => r.source !== r.destination);
await writeFile(new URL('vercel.json', root), JSON.stringify({ trailingSlash: true, redirects }, null, 2));
console.log('redirects:', redirects.length);

// Rewrite links in migrated markdown
let rewritten = 0;
for (const dir of ['guides', 'stadiums']) {
  for (const f of await readdir(new URL(`src/content/${dir}/`, root))) {
    const url = new URL(`src/content/${dir}/${f}`, root);
    const before = await readFile(url, 'utf8');
    const after = before.replace(/\]\((\/[^)#\s]*\/)\)/g, (m, href) => (map.has(href) ? `](${resolve(href)})` : m));
    if (after !== before) { await writeFile(url, after); rewritten++; }
  }
}
console.log('markdown files with rewritten links:', rewritten);
