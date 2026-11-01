// Check every redirect in vercel.json against a deployed site. Usage: node scripts/test-redirects.mjs https://easy-guide-india.vercel.app
import { readFile } from 'node:fs/promises';

const base = (process.argv[2] ?? 'https://easy-guide-india.vercel.app').replace(/\/$/, '');
const { redirects } = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));

const bad = [];
let i = 0;
async function worker() {
  while (i < redirects.length) {
    const r = redirects[i++];
    try {
      const res = await fetch(base + r.source, { redirect: 'manual' });
      const loc = res.headers.get('location') ?? '';
      const path = loc.replace(base, '').replace('https://www.easyguideindia.in', '');
      if (![301, 308].includes(res.status) || path !== r.destination) bad.push(`${r.source} -> ${res.status} ${loc} (expected ${r.destination})`);
      else {
        const dest = await fetch(base + r.destination, { redirect: 'manual' });
        if (dest.status !== 200) bad.push(`${r.source} destination ${r.destination} returned ${dest.status}`);
      }
    } catch (e) { bad.push(`${r.source} failed: ${e.message}`); }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
console.log(`${redirects.length} redirects tested, ${bad.length} problems`);
console.log(bad.slice(0, 30).join('\n'));
process.exit(bad.length ? 1 : 0);
