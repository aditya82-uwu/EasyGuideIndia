# Cutover plan: easyguideindia.in from Hostinger WordPress to Vercel

Checked 1 November 2026. Domain is registered at GoDaddy. DNS is hosted at Hostinger.

## What the live setup looks like today

| Item | Value |
| --- | --- |
| Registrar | GoDaddy |
| Nameservers | `ns1.dns-parking.com`, `ns2.dns-parking.com` (Hostinger DNS, not GoDaddy) |
| Apex A records | `91.108.106.175`, `147.79.69.177` |
| Apex AAAA records | `2a02:4780:3c:a44:d94f:11e3:2cf1:d2de`, `2a02:4780:3d:336e:51ca:ae2:3ece:4489` |
| `www` | CNAME to `www.easyguideindia.in.cdn.hstgr.net` (Hostinger CDN) |
| Primary host | `www` (apex returns 301 to `https://www.easyguideindia.in/`) |
| Email | MX `mx1.hostinger.com` (5), `mx2.hostinger.com` (10); SPF `v=spf1 include:_spf.mail.hostinger.com ~all`; DKIM CNAME `hostingermail-a._domainkey` to `hostingermail-a.dkim.mail.hostinger.com`; DMARC `v=DMARC1; p=none` |
| Google tag | `GT-M34B4S4P` (Site Kit) |
| Search Console token | meta `google-site-verification` starting `Eke5l-kN` |
| AdSense | `ca-pub-7671942092105363`, Auto ads ON, ads.txt Authorized |
| WordPress content | 44 posts, 94 pages, last edit 27 Sep 2026. Matches the export, so no re-export is needed. |

Save the old values above. They are the rollback.

## Why DNS needs care

The nameservers are Hostinger's. When Hostinger hosting is cancelled, the DNS zone and any Hostinger mailbox can disappear with it. So the plan has two stages: switch the website first while Hostinger still hosts DNS, then move DNS away and cancel hosting only after email is sorted.

## Before cutover (nothing here touches DNS)

Done in code, pushed:
- [x] 190 redirects in `vercel.json`, all tested against the preview (`node scripts/test-redirects.mjs <url>`).
- [x] Google tag and Search Console meta tag added to the new site, so analytics and verification survive the switch.
- [x] `ads.txt` with your AdSense line, ad slots and two ad units.
- [x] `robots.txt`, sitemap at `/sitemap-index.xml`, canonical tags on `www`.

Needs you:
- [ ] **Hosting plan.** Ads are commercial use. Vercel Hobby does not allow it. Choose Vercel Pro ($20 a month) or move the project to Cloudflare Pages, then continue.
- [ ] **Hostinger backup.** hPanel > Backups, plus an All-in-One WP Migration `.wpress` export. Keep both for at least a year.
- [ ] **Email.** Do you use a mailbox on the domain? DKIM exists, so one was probably set up. Tell me which address.
- [ ] **Search Console.** Check whether the property is "Domain" (verified by DNS) or "URL prefix" (verified by the meta tag, now on the new site).
- [ ] **Bank details** in AdSense. Payments stop until this is added. Only you can do it.
- [ ] Pick a quiet day. Best window: late November or December, well before IPL 2027 in March, so Google reprocesses the site first.

## Cutover day

1. **Vercel.** Project > Settings > Domains. Add `www.easyguideindia.in` and set it as primary. Add `easyguideindia.in` and set it to redirect to `www`. Vercel shows the exact DNS values. Use those, not the generic ones below.
2. **Hostinger hPanel > Domains > DNS zone** (the zone is here because the nameservers are Hostinger's):
   - Delete both **AAAA** records on the apex. Left in place they send IPv6 visitors to the old server.
   - Change the apex **A** records to the single value Vercel shows (usually `76.76.21.21`). Remove the second A record.
   - Change the `www` **CNAME** from the `hstgr.net` CDN name to the value Vercel shows (usually `cname.vercel-dns.com`).
   - Leave MX, SPF, DKIM and DMARC records alone.
   - Set TTL to 300 on the records you edit.
3. **Wait 5 to 15 minutes**, then in Vercel confirm both domains show "Valid configuration" and the certificate is issued.
4. **Check from your own machine** (replace nothing):
   ```bash
   curl -sI https://easyguideindia.in/ | head -5
   curl -sI https://www.easyguideindia.in/ | head -5
   curl -s https://www.easyguideindia.in/ads.txt
   node scripts/test-redirects.mjs https://www.easyguideindia.in
   ```
   Expected: apex returns a redirect to `www`, `www` returns 200 from Vercel, `ads.txt` shows your line, and all 190 redirects pass.
5. **AdSense.** Ads > By site > easyguideindia.in: turn **Auto ads OFF**. Keep Auto optimize as you prefer. Check Sites shows ads.txt "Authorized".
6. **Search Console.** Submit `https://www.easyguideindia.in/sitemap-index.xml`. Remove old WordPress sitemaps if listed. Use URL Inspection on the home page, the IPL 2027 page, Chepauk, Arun Jaitley, Mullanpur, Narendra Modi, Ekana and Wankhede, then "Request indexing".
7. **Analytics.** Open GA4 Realtime on your phone and confirm a hit.
8. **Spot checks on a phone:** home, `/ipl-2027/`, one stadium, one guide, `/search/`, a dead URL (404 page), and an old URL such as `/documents/lock-unlock-aadhaar-biometrics/` (redirect).

## Rollback (if something is badly wrong)

In the Hostinger DNS zone put back the A records `91.108.106.175` and `147.79.69.177`, the two AAAA records, and the `www` CNAME to `www.easyguideindia.in.cdn.hstgr.net`. With TTL 300 the old site is back within about 15 minutes. Turn Auto ads back ON if you had turned it off. Keep Hostinger hosting active until all checks below pass.

## First 4 weeks

| When | Check | Act if |
| --- | --- | --- |
| Day 1 to 3 | Search Console > Pages: errors, "Not found (404)", "Page with redirect" | New 404s on URLs that used to work: add a redirect |
| Daily, week 1 | Search Console > Performance: clicks and impressions against the same days last week | Clicks down more than 30% for 5 days: check indexing and redirects first |
| Week 1 | Vercel > Logs: 404 paths | Any real page in the list: redirect it |
| Week 1 | AdSense > Sites: status; Reports: first impressions | "Needs attention": read the message, fix, request review |
| Week 2 | Core Web Vitals report and PageSpeed on a stadium page | LCP over 2.5 s or CLS over 0.1: remove the sidebar ad first |
| Week 4 | Compare clicks, impressions, average position by page with the pre-cutover export | A top page lost more than 2 positions: review its title and content |

Small dips for 1 to 2 weeks after a platform move are normal. Do not change titles or URLs during this period.

## Stage 2: after 30 stable days

1. Decide email. Options: keep Hostinger email only (needs paid Hostinger email or hosting kept), move to Google Workspace or Zoho Mail, or use Cloudflare Email Routing for forwarding only. Export any needed mail over IMAP first.
2. Move DNS off Hostinger: in Vercel use Vercel DNS, or at GoDaddy use its default nameservers. Recreate A, CNAME, MX, SPF, DKIM and DMARC for the new mail provider **before** switching nameservers. Nameserver changes take up to 48 hours.
3. Confirm the site, email and AdSense all still work, then cancel Hostinger hosting. Do not cancel the GoDaddy domain registration; renew it there.
4. Keep the redirects in `vercel.json` for at least a year.

## Open items that block cutover

1. Hosting plan decision (Vercel Pro or Cloudflare Pages).
2. Email: which mailbox, if any.
3. Hostinger and `.wpress` backups saved.
