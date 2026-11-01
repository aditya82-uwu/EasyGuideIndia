// Insert one in-article ad block before the third h2 of long guides. Run last, after apply-review.mjs.
// Skips legal and trust pages and any page with fewer than four h2 headings. Idempotent.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { AD_CLIENT, AD_SLOTS } from '../src/lib/ads.mjs';

const root = new URL('../', import.meta.url);
const SKIP = /^(about-us|contact-us|privacy-policy|terms-and-conditions|disclaimer|how-we-check)\.md$/;
const MARK = '<!-- ad:inarticle -->';
const BLOCK = `${MARK}
<aside class="ad-slot ad-slot-inarticle" aria-label="Advertisement" data-pagefind-ignore>
<p class="ad-label">Advertisement</p>
<ins class="adsbygoogle" style="display:block;text-align:center" data-ad-layout="in-article" data-ad-format="fluid" data-ad-client="${AD_CLIENT}" data-ad-slot="${AD_SLOTS.inarticle}"></ins>
</aside>
`;

let inserted = 0;
for (const dir of ['stadiums', 'guides']) {
  for (const f of await readdir(new URL(`src/content/${dir}/`, root))) {
    if (SKIP.test(f)) continue;
    const url = new URL(`src/content/${dir}/${f}`, root);
    let t = await readFile(url, 'utf8');
    if (t.includes(MARK)) continue;
    const parts = t.split(/^---$/m);
    if (parts.length < 3) continue;
    const body = parts.slice(2).join('---');
    const lines = body.split('\n');
    const h2 = lines.map((l, i) => (/^## /.test(l) ? i : -1)).filter((i) => i >= 0);
    if (h2.length < 4) continue;
    lines.splice(h2[2], 0, BLOCK);
    t = parts.slice(0, 2).join('---') + '---' + lines.join('\n');
    await writeFile(url, t);
    inserted++;
  }
}
console.log(`ad blocks inserted in ${inserted} pages`);
