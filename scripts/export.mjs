// Pull all WordPress content via REST API into export/*.json
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = 'https://www.easyguideindia.in/wp-json/wp/v2';
const OUT = new URL('../export/', import.meta.url);
await mkdir(OUT, { recursive: true });

async function fetchAll(endpoint, extra = '') {
  const items = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${BASE}/${endpoint}?per_page=100&page=${page}${extra}`);
    if (res.status === 400) break; // past last page
    if (!res.ok) throw new Error(`${endpoint} p${page}: ${res.status}`);
    const batch = await res.json();
    items.push(...batch);
    const totalPages = Number(res.headers.get('x-wp-totalpages') || 1);
    if (page >= totalPages) break;
  }
  return items;
}

for (const ep of ['posts', 'pages', 'media', 'categories', 'tags', 'users']) {
  const data = await fetchAll(ep);
  await writeFile(new URL(`${ep}.json`, OUT), JSON.stringify(data, null, 2));
  console.log(ep, data.length);
}
