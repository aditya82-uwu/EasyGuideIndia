# easyguideindia.in: WordPress to Astro on Vercel

## Findings (probed live site, 2026-11-01)
- 44 posts, 94 pages, 84 media files, categories: News, Sports, Uncategorized.
- WP REST API open: `/wp-json/wp/v2/{posts,pages,media,categories,tags,users}`. Full export possible without wp-admin.
- Theme: Sydney. Plugins seen: Yoast SEO, Redirection, LiteSpeed Cache, Site Kit, Ajax Search Lite, Simple History, All-in-One WP Migration.
- Permalinks: posts live under `/blog/...` area (Yoast canonical `/blog/`). Confirm exact URL patterns in task 1.
- No e-commerce, no comments seen. Content-only site = ideal for static.

## Decision: Astro (not Next.js)
Content site, mostly static, SEO matters. Astro ships zero JS by default, faster Core Web Vitals, Content Collections fit markdown. Vercel free Hobby tier hosts it. Next.js only if you need app features later.

## Cost
- Vercel Hobby: free (non-commercial). If site has ads/affiliate income, Hobby ToS may not allow it. Check; Pro = $20/mo. Alternative: Cloudflare Pages free.
- Domain: renew separately (~Rs 800-1000/yr). Move DNS only. Hostinger hosting can be cancelled after cutover.
- Do NOT cancel Hostinger before domain transfer or DNS check done. If domain registered at Hostinger, keep domain there or transfer first.

## Phase 0: Backup and audit
- [ ] 0.1 Full backup: Hostinger backup + All-in-One WP Migration export (`.wpress`). Store offline.
- [ ] 0.2 Crawl all URLs from sitemaps (post, page, category, post_tag, author). Save to `url-inventory.csv`.
- [ ] 0.3 Export Redirection plugin rules (Tools > Redirection > Import/Export, JSON/CSV).
- [ ] 0.4 Record Search Console baseline: top pages, clicks, indexed count. Record GA ID (Site Kit).
- [ ] 0.5 Note 94 pages: find which are real content vs. junk/thin/Elementor-style. Decide keep, merge, drop.
- [ ] 0.6 Log in to GoDaddy, screenshot current DNS records (A, CNAME, MX, TXT). Note AdSense ID and GA ID.

## Phase 1: Scaffold
- [ ] 1.1 `npm create astro@latest` in `C:\easyguideindia-app`, TypeScript strict, git init.
- [ ] 1.2 Add `@astrojs/sitemap`, `@astrojs/rss`, `@astrojs/mdx` (optional), Tailwind.
- [ ] 1.3 Content collections: `posts`, `pages` with zod schema (title, slug, date, modified, description, category, tags, author, heroImage, ogImage, canonical).
- [ ] 1.4 Set `site: https://www.easyguideindia.in` and `trailingSlash` to match WP (WP uses trailing slash).

## Phase 2: Content export script (Node, run once)
- [ ] 2.1 `scripts/export.mjs`: paginate REST API (`per_page=100`) for posts, pages, categories, tags, users, media. Save raw JSON in `export/`.
- [ ] 2.2 Convert `content.rendered` HTML to Markdown (`turndown` + gfm plugin). Handle: tables, galleries, embeds (YouTube/Twitter iframes), shortcodes, Gutenberg block comments, `<figure>` captions.
- [ ] 2.3 Write frontmatter from Yoast data: `yoast_head_json` gives title, description, og image, canonical, schema. Keep SEO title and description exactly.
- [ ] 2.4 Preserve slug and parent path for pages (hierarchical URLs).
- [ ] 2.5 Preserve original publish and modified dates.
- [ ] 2.6 Spot check 10 posts side by side with live site.

## Phase 3: Images and media
- [ ] 3.1 Download all 84 media originals from `/wp-content/uploads/` (use media REST `source_url`, not resized variants).
- [ ] 3.2 Save to `src/assets/uploads/YYYY/MM/`. Use Astro `<Image>` for AVIF/WebP and responsive sizes.
- [ ] 3.3 Rewrite image URLs in markdown to local paths. Keep alt text and captions.
- [ ] 3.4 Find images referenced in content but missing from media library (hotlinked/external). Download or flag.
- [ ] 3.5 Keep old `/wp-content/uploads/...` URLs working: Vercel rewrites to new path, so Google Images and backlinks stay valid.
- [ ] 3.6 Any PDFs/docs: copy to `public/`.

## Phase 4: Design and templates
- [ ] 4.1 Screenshot current site for reference. Build fresh design: pick direction, design tokens, home, post, category templates.
- [ ] 4.2 Layouts: Base, Post, Page, Category archive, Tag archive, Author, 404.
- [ ] 4.3 Header, footer, nav menu (copy from WP menus), breadcrumbs.
- [ ] 4.4 Search: replace Ajax Search Lite with Pagefind (static, free).
- [ ] 4.5 Pagination for blog/category archives.
- [ ] 4.6 Related posts, share buttons, table of contents (stadium guides are long).

## Phase 5: SEO parity (critical, protects rankings)
- [ ] 5.1 Same URLs. Diff new route list against `url-inventory.csv`; zero 404s.
- [ ] 5.2 Title, meta description, canonical, robots, OG, Twitter tags from frontmatter.
- [ ] 5.3 JSON-LD schema (Article, BreadcrumbList, Organization, WebSite) matching Yoast output.
- [ ] 5.4 `sitemap-index.xml`; add redirect `sitemap_index.xml` to it (Yoast name) or generate same filename.
- [ ] 5.5 `robots.txt`, RSS feed at `/feed/` (WP default path).
- [ ] 5.6 Port Redirection plugin rules into `vercel.json` redirects.
- [ ] 5.7 Redirect dropped URLs: author archives, tag pages, `?p=ID`, attachment pages.
- [ ] 5.8 Analytics (GA4 tag), Search Console verification tag, ad scripts if any.
- [ ] 5.9 Lighthouse target: 95+ mobile on all templates.

## Phase 6: Deploy to Vercel (staging)
- [ ] 6.1 Push repo to GitHub, import to Vercel, preview URL.
- [ ] 6.2 Add `X-Robots-Tag: noindex` on preview only.
- [ ] 6.3 Crawl preview with Screaming Frog or `seo-firecrawl`: compare titles, descriptions, H1, word count, status codes against old site.
- [ ] 6.4 Fix diffs. Run link checker for broken internal links.

## Phase 7: Cutover
- [ ] 7.1 Lower DNS TTL to 300s, 48h before.
- [ ] 7.2 Freeze WP edits. Re-run export for new content.
- [ ] 7.3 Add domain in Vercel. Edit DNS in GoDaddy (keep MX/TXT records). Point A `76.76.21.21` and CNAME `www` to `cname.vercel-dns.com` (use values Vercel shows). Set www as primary, apex redirect to www.
- [ ] 7.4 Verify HTTPS, redirects, sitemap, robots.
- [ ] 7.5 Submit sitemap in Search Console. Use URL Inspection on key pages.
- [ ] 7.6 Monitor Search Console 4 weeks: coverage, 404s, clicks.

## Phase 8: Cleanup
- [ ] 8.1 After 30 days stable, cancel Hostinger hosting. Keep the WP backup forever.
- [ ] 8.2 Decide editing workflow: edit markdown in git, or add headless CMS (Decap, Keystatic, Sanity free tier) if non-dev editing needed.

## Risks
- Rankings drop if URLs, titles, or internal links change. Mitigation: phase 5.
- Gutenberg/shortcode content converts messy. Mitigation: spot check, fix by hand.
- Vercel Hobby ToS for monetized sites. Check before launch.
- Domain at Hostinger: keep domain active when hosting cancelled.

## Decisions (answered 2026-11-01)
1. Domain at GoDaddy. Only DNS records change. No domain transfer. Hostinger hosting can be cancelled safely after cutover.
2. Site earns about $0.01-0.04 from Google Ads. Treat as non-commercial. Keep AdSense script if wanted. Vercel Hobby ToS says no commercial use; risk tiny at this revenue. Fallback: Cloudflare Pages (free, allows ads).
3. Content is AI-generated. Workflow: new posts = markdown files in git, written by Claude. No CMS needed. Push to GitHub, Vercel auto-deploys.
4. Full redesign. Phase 4 becomes fresh design, not Sydney copy.
5. No forms, newsletter, or comments. Task 4.7 dropped.

## Open questions
1. Redesign direction: stadium/match-day guide look (dark, bold sports) or clean editorial/news look?
2. Thin AI pages among the 94: OK to drop or merge low-value ones with 301 redirects?

## Search Console findings (12 months, ~10.3k clicks, 2.2M impressions)
- Traffic is the IPL season spike: peak 100k+ impressions/day in May 2026, now ~1k/day and ~10 clicks/day.
- 22 India stadium guides = 7,103 of ~10.3k clicks (69%). Chepauk 1,434, Arun Jaitley 1,288, Mullanpur 721, Modi 698, Ekana 591, Wankhede 565.
- Info directory (documents/banking/railway/finance, 83 pages) = about 680 clicks total. Aadhaar/PAN pages rank position 40-75: effectively invisible.
- 9 of 17 World Cup US/Mexico/Canada stadium guides: near-zero clicks, event over.
- 89% mobile. 92% India traffic.
- Queries are hyper-specific: "wankhede gate 4 entry", "is power bank allowed", "chepauk bike parking", "arun jaitley nearest metro gate 17". Users want one fact fast.
- IPL returns Mar 2027. Stadium pages are seasonal evergreen: must be fresh before then.

## Design approach (recommendation)
Rebrand around ONE niche: **India cricket stadium match-day guide** (gates, parking, metro, allowed items, entry time, refund rules).
1. Stadium = structured data (one YAML/JSON file per venue: gates, parking lots, metro, banned items, capacity, city). Every page generated from the same template. Consistent, scalable, easy for AI to update each season.
2. Page layout answers the query in the first screen: quick-answer cards (Power bank? Bag? Physical ticket? Entry time? Nearest metro? Parking?) then gate picker, parking table, how to reach. Long text below.
3. Per-gate anchor sections/pages for "wankhede gate 4"-style queries (inside the stadium page, not new thin pages).
4. Mobile-first, light, fast, high contrast. Sports look but readable: dark header, white content, one accent color. Minimal JS. Ad slots reserved to avoid layout shift.
5. Hubs: home (stadium grid by city + "next match"), /stadiums/, /ipl/ (rules, refunds, tickets, trials), /guides/.
6. Add stadiums with proven demand: Chinnaswamy (868 impr, 4 clicks, thin 468 words: rewrite), Feroz Shah Kotla parking queries, Rajiv Gandhi/Uppal, Dharamshala, SMS Jaipur.
7. Keep a small "Everyday guides" section for the few info pages with clicks (PM Kisan status, bank balance without app, IRCTC cancel/Tatkal, SSC/e-Shram). Drop the rest.

## Content audit
Files: export/*.json (raw WP data, 44 posts + 94 pages), data/content-audit.csv (every page with words, clicks, impressions, position, topic, suggested action), data/gsc-pages.csv, data/gsc-queries.csv. Scripts: scripts/export.mjs, scripts/audit.mjs.
Suggested split (rule: KEEP clicks>=5 or impr>=1500; REVIEW impr>=100; else DROP-CANDIDATE): KEEP 55, REVIEW 39, DROP-CANDIDATE 44.
Next: manual pass on REVIEW and DROP lists. Dropped URLs get 301 to nearest hub, not 404.
Legal pages (privacy, terms, disclaimer, about, contact): KEEP regardless. AdSense requires them.

## Content pipeline (run in this order when regenerating from the WordPress export)
1. `node scripts/convert-guides.mjs` and `node scripts/convert-stadiums.mjs` (rebuilds markdown from `export/`)
2. `node scripts/body-fixes.mjs` and `node scripts/body-fixes-grounds.mjs` (verified corrections)
3. `node scripts/seo-rewrite.mjs` (IPL titles, descriptions, intros; strips em dashes)
4. `node scripts/apply-review.mjs` (redirects, link relabelling)
5. `node scripts/insert-ads.mjs` (in-article ad block before the third h2)
6. `npm run build`, then `node scripts/seo-check.mjs` and `node scripts/check-links.mjs`

## AdSense
- Publisher ID `ca-pub-7671942092105363`. Ad units created 1 Nov 2026: "EGI Astro In-article" (3491926864) and "EGI Astro Display" (3824979686). IDs live in `src/lib/ads.mjs`.
- The loader script only loads on pages that pass `ads` to `BaseLayout`. Search, 404 and legal pages have no ads.
- At cutover: turn Auto ads OFF for easyguideindia.in (AdSense > Ads > By site) so Google does not add ads on top of these slots. Do this only after the new site is live on the domain, because Auto ads is what serves ads on the old WordPress site today.
- The GDPR message for UK/EEA/Switzerland is already active in Privacy & messaging.
