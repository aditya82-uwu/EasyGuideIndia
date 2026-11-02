# SEO audit: www.easyguideindia.in

Audited 2 November 2026, one day after the Cloudflare cutover. Method: live `curl` checks plus a scan of the 92 built pages. Google API, CrUX and backlink data were not available, so performance and authority scores are estimates.

**SEO Health Score: 82 / 100.** Business type: informational publisher (cricket stadium guides, IPL explainers, India utilities), monetised with AdSense.

| Category | Score | Note |
| --- | --- | --- |
| Technical SEO | 90 | Clean redirects, canonicals, sitemap, HTTPS, security headers |
| Content quality | 74 | Good facts and structure, but no named author and thin utility pages |
| On-page SEO | 82 | One H1 per page, all descriptions 70 to 160 characters, 22 titles slightly long |
| Schema | 90 | Organization, WebSite, BreadcrumbList, Article, FAQPage, StadiumOrArena |
| Performance | 85 (estimate) | Static HTML, self-hosted fonts, CDN, 0.3 to 0.45 s TTFB. No field data yet |
| AI search readiness | 78 | Answer-first blocks and FAQs; no author or citations |
| Images | 80 | 0 images missing alt; few images overall |

## What works
- Domain: apex 301s to `www`, `http` 301s to `https`, 190 of 190 old URLs redirect, and the old `/sitemap_index.xml` 301s to the new sitemap.
- Crawl: `robots.txt` allows all and lists the sitemap. The sitemap has 91 URLs; `/search/` is noindex and excluded.
- Pages: 92 built, 0 broken internal links, one H1 on every page, canonicals all on `www`.
- Delivery: Cloudflare CDN with cache hits, nosniff, referrer policy and frame headers. `*.workers.dev` is noindex.
- Ads: `ads.txt` correct, Auto ads off, slots reserve height so layout does not shift.

## Findings

### High
1. **No named author or reviewer.** The site is AI-assisted and has no byline, so Google's Who/How/Why test is weak, and this is the main ranking risk for stadium safety and rules content. Add a named editor (or an honest "Easy Guide India editorial team" page with method), a byline and "Reviewed on" date on each stadium page, and link to `/how-we-check/`.
2. **No source links in the stadium guides.** Gate, parking and carry-rule claims cite no club, board or police notice. Add a "Sources" line with the official page per ground. This helps trust and AI citation.
3. **Not yet indexed under the new setup.** Sitemap submitted 1 Nov. Run URL Inspection and Request indexing on the home page, `/ipl-2027/` and the top 6 grounds, then watch Pages for "Page with redirect" and 404s.

### Medium
4. **22 titles are 61 to 66 characters** and may truncate (for example Eden Gardens, Narendra Modi, Ekana, IPL playoffs format). Trim to 60 or fewer, keeping "IPL 2027" and the ground name first. Do not change URLs.
5. **Thin utility pages under 400 words:** `/documents/check-jio-balance-online/`, `/documents/e-shram-card-registration/`, three `/railway/` status pages, and the `/banking/` hub. Merge the three train-status pages into one, or add steps, screenshots and a FAQ.
6. **Off-topic stadiums dilute the focus:** Lord's, Headingley, Old Trafford, Utilita Bowl, Estadio Azteca. They are not IPL. Keep them out of nav and the IPL hub, or merge into one "Overseas grounds" page.
7. **Outdated "IPL 2026" slugs** under `/finance/` (fantasy tax, FASTag parking). Keep the URLs, but make the H1 and title say 2027 and update the facts.
8. **`/contact-us/` title is under 25 characters** and the page is 228 words. Expand title ("Contact Easy Guide India: corrections and feedback") and say how corrections are handled. Required for AdSense trust.
9. **HTML cache header is `max-age=0, must-revalidate`.** Fine for freshness, and Cloudflare still serves HITs. Optionally add `s-maxage` via `_headers` for HTML.

### Low
10. No `llms.txt`. Optional, low value for ranking.
11. Add `dateModified` visibly on guides, and `Person` schema once an author exists.
12. Add `rel` hints for the main OG image on `/ipl-2027/`; confirm every ground has its own share image.
13. HSTS is off. Enable after a week of stable HTTPS (Cloudflare SSL/TLS > Edge Certificates), without preload at first.

## IPL 2027 focus
`/ipl-2027/` exists with status box, ground list, checklist and FAQ, and the home page leads with it. Gaps: no schedule or fixtures page (not published yet), so refresh the page the day the BCCI releases the fixtures and add a "matches at this ground" block to each stadium. Re-check all facts against 2027 match-day notices before March 2027.

## Not measured
CrUX and Lighthouse field data, backlinks, rankings, indexed-page count. Connect Search Console API or re-run after 2 to 4 weeks for traffic comparison against the pre-cutover export in `data/`.
