# Cutover plan: easyguideindia.in from Hostinger WordPress to Cloudflare

Checked 1 November 2026. Domain registered at GoDaddy. DNS hosted at Hostinger. New site deployed on Cloudflare (Workers static assets) at `https://easyguideindia.themasculinemind82.workers.dev/`.

## Test results on the Cloudflare build

- 190 of 190 redirects pass. Home, IPL 2027, stadium, guide, search and legal pages return 200. Unknown URLs return the 404 page. `ads.txt`, `robots.txt`, sitemap, fonts and share images are served, and fonts and scripts are cached for a year.
- Canonical tags point to `https://www.easyguideindia.in/`. The Google tag `GT-M34B4S4P` and AdSense loader are present.

## What the live setup looks like today

| Item | Value |
| --- | --- |
| Registrar | GoDaddy |
| Nameservers | `ns1.dns-parking.com`, `ns2.dns-parking.com` (Hostinger DNS) |
| Apex A records | `91.108.106.175`, `147.79.69.177` |
| Apex AAAA records | `2a02:4780:3c:a44:d94f:11e3:2cf1:d2de`, `2a02:4780:3d:336e:51ca:ae2:3ece:4489` |
| `www` | CNAME to `www.easyguideindia.in.cdn.hstgr.net` |
| Primary host | `www` (apex returns 301 to `https://www.easyguideindia.in/`) |
| Email | MX `mx1.hostinger.com` (5) and `mx2.hostinger.com` (10); SPF `v=spf1 include:_spf.mail.hostinger.com ~all`; DKIM CNAME `hostingermail-a._domainkey` to `hostingermail-a.dkim.mail.hostinger.com`; DMARC `v=DMARC1; p=none` |
| Google tag | `GT-M34B4S4P` |
| Search Console token | meta `google-site-verification` starting `Eke5l-kN` |
| AdSense | `ca-pub-7671942092105363`, Auto ads ON, ads.txt Authorized |

Save these values. They are the rollback.

## Why the order matters

A Worker can only serve a custom domain if the domain's DNS is on Cloudflare. So DNS moves to Cloudflare first, with records copied exactly so nothing changes for visitors or email. Only then do we point the domain at the new site. Hostinger hosting stays active until the end because it holds WordPress and the mailbox.

## Before you start

- [ ] **Backup.** Hostinger hPanel > Backups, plus an All-in-One WP Migration `.wpress` export. Keep both for a year.
- [ ] **Email.** Which mailbox on the domain, if any? Its records are copied unchanged in stage 1.
- [ ] **DNSSEC.** In GoDaddy, check the domain has DNSSEC off. If it is on, turn it off before changing nameservers.
- [ ] **Bank details** in AdSense. Payments pause until added. Only you can do this.
- [ ] **Timing.** Best window is late November or December, well before IPL 2027 in March.

## Stage 1: move DNS to Cloudflare (no visible change)

1. Cloudflare dashboard > Add a domain > `easyguideindia.in` > Free plan.
2. Cloudflare scans and imports the existing records. Compare them with the table above. It must contain the A, AAAA, `www` CNAME, both MX, the SPF TXT, the DKIM CNAME and DMARC. Add any that are missing.
3. Set the website records (A, AAAA, `www`) to **DNS only** (grey cloud) for now so WordPress behaves exactly as before. Mail records must be DNS only.
4. At GoDaddy: My Products > domain > DNS > Nameservers > Change > "I'll use my own nameservers". Enter the two Cloudflare nameservers shown in step 1. Save.
5. Wait for Cloudflare to say the zone is Active (usually under an hour, up to 24). Meanwhile the old site and email keep working because the records are identical.
6. Confirm: `https://www.easyguideindia.in/` still loads WordPress, and a test email to and from your mailbox works.

## Stage 2: switch the website (cutover day)

1. Cloudflare > Workers & Pages > `easyguideindia` > Settings > Domains & Routes > Add > **Custom domain**: add `www.easyguideindia.in`, then `easyguideindia.in`. Cloudflare replaces the old website DNS records with its own. If it refuses because a record exists, delete the old A, AAAA and `www` CNAME records for the website, then retry. Leave MX, SPF, DKIM and DMARC alone.
2. Cloudflare > Rules > Redirect Rules > create: if hostname equals `easyguideindia.in` then dynamic redirect to `concat("https://www.easyguideindia.in", http.request.uri.path)`, status 301, preserve query string.
3. SSL/TLS: set "Always Use HTTPS" on. Leave Rocket Loader and Email Obfuscation off, since Rocket Loader can break ad scripts.
4. Check:
   ```bash
   curl -sI https://easyguideindia.in/ | head -5
   curl -sI https://www.easyguideindia.in/ | head -5
   curl -s https://www.easyguideindia.in/ads.txt
   node scripts/test-redirects.mjs https://www.easyguideindia.in
   ```
   Expected: apex 301 to `www`, `www` 200, `ads.txt` shows your line, all 190 redirects pass.
5. **AdSense:** Ads > By site > easyguideindia.in > turn **Auto ads OFF**. Confirm Sites shows ads.txt Authorized.
6. **Search Console:** submit `https://www.easyguideindia.in/sitemap-index.xml`. Run URL Inspection and "Request indexing" on the home page, `/ipl-2027/`, Chepauk, Arun Jaitley, Mullanpur, Narendra Modi, Ekana and Wankhede.
7. **GA4:** open Realtime on your phone and confirm a hit.
8. Phone spot checks: home, `/ipl-2027/`, a stadium, a guide, `/search/`, a dead URL (404 page), and an old URL like `/documents/lock-unlock-aadhaar-biometrics/` (redirect).

## Rollback

In Cloudflare DNS, remove the custom-domain records and restore the A records `91.108.106.175` and `147.79.69.177`, the two AAAA records, and `www` CNAME `www.easyguideindia.in.cdn.hstgr.net`, all as DNS only. WordPress is back within minutes. Turn Auto ads back ON.

## First 4 weeks

| When | Check | Act if |
| --- | --- | --- |
| Day 1 to 3 | Search Console > Pages: errors, "Not found (404)", "Page with redirect" | A page that used to work now 404s: add a redirect |
| Daily, week 1 | Performance: clicks and impressions vs the same days last week | Down over 30% for 5 days: check indexing and redirects |
| Week 1 | Cloudflare > Analytics: 404 paths | Any real page listed: redirect it |
| Week 1 | AdSense > Sites and Reports | "Needs attention": read it, fix, request review |
| Week 2 | PageSpeed on a stadium page | LCP over 2.5 s or CLS over 0.1: remove the sidebar ad first |
| Week 4 | Compare clicks and position by page with the pre-cutover export | A top page lost over 2 positions: review its title and content |

Do not change titles or URLs during this period. Small dips for 1 to 2 weeks are normal after a platform move.

## Stage 3: after 30 stable days

1. If you use the Hostinger mailbox, export mail over IMAP and move to a provider you control (Google Workspace, Zoho Mail), or switch to Cloudflare Email Routing for forwarding only. Update MX, SPF, DKIM and DMARC in Cloudflare DNS.
2. Confirm the site, email and AdSense all work, then cancel Hostinger hosting.
3. Keep the GoDaddy registration and renew it there.
4. Keep the redirects for at least a year.

## Open items

1. Backups saved.
2. Email decision.
3. DNSSEC status at GoDaddy.
4. AdSense bank details.
