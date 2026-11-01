// List internal links in dist/ that point to pages that do not exist, with the pages that use them.
import { readdir, readFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const exists = (p) => access(p).then(() => true, () => false);

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else if (e.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const broken = new Map();
for (const file of await walk(dist)) {
  const html = await readFile(file, 'utf8');
  for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = m[1];
    if (/\.[a-z0-9]+$/i.test(href)) continue;
    const target = join(dist, href, 'index.html');
    if (!(await exists(target))) {
      const page = file.slice(dist.length).replace(/index\.html$/, '').replaceAll('\\', '/');
      (broken.get(href) ?? broken.set(href, new Set()).get(href)).add(page);
    }
  }
}
for (const [href, pages] of [...broken].sort((a, b) => b[1].size - a[1].size)) console.log(String(pages.size).padStart(3), href);
console.log('broken targets:', broken.size);
