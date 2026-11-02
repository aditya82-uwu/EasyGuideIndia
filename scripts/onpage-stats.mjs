// Quick on-page stats over dist/: title and description lengths, H1 count, missing alt, word count, schema types.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'pagefind' && e.name !== '_astro') yield* walk(p); }
    else if (e.name === 'index.html') yield p;
  }
}

const rows = [];
for await (const f of walk('dist')) {
  const h = await readFile(f, 'utf8');
  const path = '/' + relative('dist', f).replace(/\\/g, '/').replace(/index\.html$/, '');
  const title = (h.match(/<title>(.*?)<\/title>/s) || [, ''])[1];
  const desc = (h.match(/<meta name="description" content="(.*?)"/) || [, ''])[1];
  const h1 = (h.match(/<h1[ >]/g) || []).length;
  const noAlt = (h.match(/<img[^>]*>/g) || []).filter((i) => !/alt=/.test(i)).length;
  const text = h.replace(/<(script|style)[^>]*>.*?<\/\1>/gs, '').replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  const types = [...new Set([...h.matchAll(/"@type":"([A-Za-z]+)"/g)].map((m) => m[1]))];
  rows.push({ path, t: title.length, d: desc.length, h1, noAlt, words, types });
}
console.log(rows.length, 'pages');
console.log('title>60:', rows.filter((r) => r.t > 60).map((r) => r.path + ':' + r.t));
console.log('title<25:', rows.filter((r) => r.t < 25).map((r) => r.path));
console.log('desc>160:', rows.filter((r) => r.d > 160).map((r) => r.path + ':' + r.d));
console.log('desc<70:', rows.filter((r) => r.d < 70).map((r) => r.path + ':' + r.d));
console.log('h1 != 1:', rows.filter((r) => r.h1 !== 1).map((r) => r.path));
console.log('img without alt:', rows.reduce((a, r) => a + r.noAlt, 0));
console.log('avg words:', Math.round(rows.reduce((a, r) => a + r.words, 0) / rows.length));
console.log('thin <400 words:', rows.filter((r) => r.words < 400).map((r) => r.path + ':' + r.words));
console.log('no schema:', rows.filter((r) => !r.types.length).map((r) => r.path));
