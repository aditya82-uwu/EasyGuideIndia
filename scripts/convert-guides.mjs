// Convert non-stadium WP pages/posts to src/content/guides/*.md. Keeps the old URL path in legacyPath.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const root = new URL('../', import.meta.url);
const all = [
  ...JSON.parse(await readFile(new URL('export/posts.json', root), 'utf8')),
  ...JSON.parse(await readFile(new URL('export/pages.json', root), 'utf8')),
];

// Old URL paths to migrate in this batch (KEEP list from data/content-audit.csv, plus legal pages AdSense needs).
const PATHS = [
  'finance/ipl-2026-stadium-entry-rules-mandatory-documents',
  'blog/how-to-join-ipl-cricket-trials-selection-process',
  'banking/check-bank-balance-without-app',
  'documents/pm-kisan-status-check',
  'documents/pm-kisan-beneficiary-list-village-wise',
  'finance/ipl-2026-fantasy-cricket-tax-rules-dream11-winnings',
  'finance/ipl-2026-stadium-parking-fastag-rules',
  'finance/ipl-2026-ticket-gst-refund-rules-explained',
  'documents/e-shram-card-status-check',
  'railway/train-running-status-sms',
  'railway/irctc-tatkal-ticket-booking',
  'railway/cancel-train-ticket-irctc',
  'railway/irctc-refund-rules',
  'finance/what-is-comex-gold-silver',
  'blog/how-to-become-ipl-cricket-scout-career-guide',
  'railway/change-boarding-station-irctc',
  'blog/how-to-join-state-cricket-team-ranji-trophy-selection-process',
  'documents/check-aadhaar-update-status',
  'documents/check-jio-balance-online',
  'railway/how-to-find-indian-railways-special-trains-booking-guide',
  'banking/atm-transaction-failed-money-debited',
  'documents/apply-aadhaar-card-for-child',
  'banking/upi-setup-guide-india-aadhaar-debit-card',
  'documents/download-pan-card-pdf',
  'banking/check-bank-account-balance-online',
  'railway/check-train-running-status-online',
  'documents/aadhaar-seeding-status-check',
  'railway/check-pnr-status-online',
  'railway/irctc-login-train-ticket-booking',
  'documents/pan-card-reprint-online',
  'banking/digital-payment-refund-process-india',
  'documents/check-fastag-balance-online',
  'blog/ipl-playoffs-format-rules-explained',
  'blog/stadium-clear-bag-policy-guide',
  'about-us', 'contact-us', 'privacy-policy', 'terms-and-conditions', 'disclaimer',
];

try { PATHS.push(...JSON.parse(await readFile(new URL('data/guide-paths-extra.json', root), 'utf8'))); } catch {}

const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced' });
td.use(gfm);
td.remove(['script', 'style', 'svg']);

const clean = (html) => html
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<div id="ez-toc-container"[\s\S]*?<\/nav>\s*<\/div>/, '')
  .replaceAll('https://www.easyguideindia.in/', '/')
  .replace(/&#8217;/g, '’');

const q = (s) => JSON.stringify(s);
await mkdir(new URL('src/content/guides/', root), { recursive: true });
const missing = [];
const imgs = [];

for (const path of PATHS) {
  const p = all.find((x) => x.link === `https://www.easyguideindia.in/${path}/`);
  if (!p) { missing.push(path); continue; }
  const y = p.yoast_head_json ?? {};
  const section = path.includes('/') ? path.split('/')[0] : 'page';
  const title = (y.title ?? p.title.rendered).replace(/ - easyguideindia\.in$/, '').replace(/ \| Easy Guide India$/, '');
  const html = clean(p.content.rendered);
  for (const m of html.matchAll(/(?:src|href)="([^"]*wp-content[^"]*)"/g)) imgs.push([path, m[1]]);
  const body = td.turndown(html).replace(/\n{3,}/g, '\n\n').replace(/^Table of Contents\s*$/m, '').trim();
  const fm = [
    '---',
    `legacyPath: ${q(path)}`,
    `title: ${q(title)}`,
    `description: ${q(y.description ?? y.og_description ?? '')}`,
    `section: ${section}`,
    `published: ${p.date.slice(0, 10)}`,
    `updated: ${p.modified.slice(0, 10)}`,
    '---',
    '',
  ].join('\n');
  await writeFile(new URL(`src/content/guides/${path.replaceAll('/', '--')}.md`, root), fm + body + '\n');
}
console.log('written', PATHS.length - missing.length, 'missing', missing, 'wp-content refs', imgs);
