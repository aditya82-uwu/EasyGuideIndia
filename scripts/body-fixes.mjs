// Corrections to converted stadium bodies, applied after convert-stadiums.mjs.
// Each patch was checked against news reports or official notices in November 2026.
// A patch that no longer matches is reported, so drift in the source text is visible.
import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const NOTE = '\n_The road lists and routes below come from earlier match advisories. Confirm them against the notice for your match._\n';

const patches = {
  'narendra-modi-ahmedabad': [
    ['-   Power banks and charging devices', '-   Power banks and charging devices (not named in the GCA list we found, but commonly banned at IPL venues, so leave them at home)'],
    ['**Gates open about 3 hours before the start.** Arrive early', '**Gates opened about 3 hours before the start in IPL 2025.** Arrive early'],
    ['About 3 hours before the start</td>', 'About 3 hours before the start (IPL 2025)</td>'],
    ['Pre-book through the Show My Parking app</td>', 'Pre-book through the Show My Parking app (offered for IPL 2026)</td>'],
    ['"About 3 hours before the start of play."', '"About 3 hours before the start in IPL 2025. Check your ticket."'],
  ],
  'ekana-lucknow': [
    ['-   **Match-day shuttles:** for some IPL 2026 matches, special shuttle buses were announced from central points such as Hazratganj and Charbagh. Check the announcement for your match.',
     '-   **Match-day buses:** Lucknow Metro has run feeder buses from stations such as Indira Nagar and Transport Nagar to the stadium on IPL match days, and extended metro hours to 12:30 AM. Check the announcement for your match.'],
    ['-   **Gates open about 3 hours before the start**: around 4:30 PM for a 7:30 PM match, and 12:30 PM for a 3:30 PM match (IPL 2026 timings).',
     '-   **Gates have opened about 3 hours before the start**, so around 4:30 PM for a 7:30 PM match. Check your ticket for your match.'],
    ['About 3 hours before the start (for IPL 2026 evening matches)', 'About 3 hours before the start in recent seasons'],
    ['"About 3 hours before the start: 4:30 PM for a 7:30 PM IPL match."', '"Gates have opened about 3 hours before the start, so around 4:30 PM for a 7:30 PM IPL match. Check your ticket."'],
    ['Traffic police have diverted vehicles from the Kamta–Shaheed Path junction on Ayodhya Road to alternative routes, so allow extra time.',
     'For a 2025 match, police diverted vehicles from Sultanpur Road and Arjunganj, barred autos and e-rickshaws from Shaheed Path, and stopped ride-hailing pickups on that stretch. Check the police advisory for your match.'],
  ],
  'wankhede-mumbai': [
    ['-   Bags larger than A4 size', '-   Backpacks and large bags (carry only a phone, wallet and ticket)'],
    ['Only a small bag. Bags larger than A4 size aren’t allowed.', 'Carry as little as possible. Backpacks and large bags are not allowed, so take just your phone, wallet and ticket.'],
  ],
  'eden-gardens-kolkata': [
    ['India’s oldest international cricket ground', 'one of India’s oldest international cricket grounds'],
    [', generally from 4 pm to 1 am on evening match days. Check the latest advisory.', '. Check the latest advisory for your date.'],
    ['## Road closures and parking\n', '## Road closures and parking\n' + NOTE],
  ],
  'uppal-hyderabad': [
    ['-   **Gates open three hours before the start.**', '-   **Gates have opened about three hours before the start.**'],
    ['3 hours before the start (IPL 2026)', 'About 3 hours before the start (recent seasons)'],
    ['Digital tickets (IPL 2026)', 'Check the ticket terms for your match'],
    ['None: banned items are confiscated', 'Not reported. Leave banned items at home'],
    ['-   For IPL 2026, **digital tickets were mandatory**. Keep your ticket ready in the app.', '-   Tickets for recent IPL matches were digital. Keep your ticket ready in the app.'],
    ['-   There’s **no cloakroom**. Banned items are confiscated at the gate and not returned.', '-   No cloakroom is reported, so leave banned items at home. Items found at the gate may be confiscated.'],
    ['and there’s no cloakroom.', 'and no cloakroom is reported.'],
  ],
  'mullanpur-chandigarh': [
    ['13 entry/exit gates; your gate is on your ticket', 'About 16 gates reported; your gate is on your ticket'],
    ['The stadium has 13 gates.', 'The stadium is reported to have about 16 gates.'],
    ['13 gates and banned items', '16 gates and banned items'],
    ['about 15 km from the centre', 'outside the main city'],
    [', about 15 km from central Chandigarh', ', outside the main city'],
    ['"About 15 km from central Chandigarh, in New Chandigarh. Allow extra time on match days."', '"It is in New Chandigarh, outside the main city. Allow extra time on match days."'],
    ['-   **Gates 1–4** are best reached from the Sector 39 (Chandigarh) stadium road side.\n', ''],
    ['-   **Shuttle buses:** for major matches, shuttle services have been run from Chandigarh bus stands. Check the announcement for your match.', '-   **Shuttle buses:** shuttle services have run for some major matches. Check the announcement for your match.'],
    ['It’s paid, and has been **₹200 for a car** and **₹100 for a two-wheeler**.', 'It’s paid. The Tribune reported **₹200 for a car** and **₹100 for a two-wheeler**; confirm the rate for your match.'],
  ],
  'arun-jaitley-delhi': [
    [' and holds about 41,000 spectators', ''],
    ['<tr><td><strong>Capacity</strong></td><td>About 41,000</td></tr>', ''],
    ['Delhi Gate (Violet Line)</td>', 'Delhi Gate or ITO (Violet Line)</td>'],
    ['**Delhi Gate** metro station on the **Violet Line** is closest, just a short walk from the stadium’s gates on Bahadur Shah Zafar Marg.',
     '**Delhi Gate** and **ITO** metro stations on the **Violet Line** are closest. Delhi Gate is a short walk from the gates on Bahadur Shah Zafar Marg. Police advisories have pointed Delhi Gate to Gates 4 and 5 and ITO to Gates 3, 4 and 5.'],
    ['## Which road leads to your gate\n', '## Which road leads to your gate\n' + NOTE],
  ],
};

let misses = 0;
for (const [file, list] of Object.entries(patches)) {
  const url = new URL(`src/content/stadiums/${file}.md`, root);
  let text = await readFile(url, 'utf8');
  for (const [from, to] of list) {
    if (text.includes(from)) text = text.replace(from, to);
    else if (!text.includes(to)) { misses++; console.log(`MISS ${file}: ${from.slice(0, 70)}`); }
  }
  await writeFile(url, text);
}

// Guides (src/content/guides). Re-run convert-guides.mjs, then this script, then apply-review.mjs.
const guidePatches = {
  'documents--check-pan-aadhaar-link-status': [
    ['**PANs not linked by 31 December 2025 became inoperative from 1 January 2026**', '**PANs issued with an Aadhaar enrolment ID (before 1 October 2024) had to be linked by 31 December 2025, or they became inoperative from 1 January 2026**. Other PANs had a 2023 deadline and a ₹1,000 late fee, per CBDT notifications'],
    ['Pay the ₹1,000 fee and [link it now](/documents/link-pan-with-aadhaar-online/)', 'Pay the ₹1,000 fee and [link it on the Income Tax portal](https://www.incometax.gov.in/iec/foportal/)'],
  ],
  'documents--update-photo-signature-pan-card': [
    ['Pay the fee (similar to a new PAN application, about ₹107 for an Indian address).', 'Pay the fee. The portal shows the exact amount, and guides quote roughly ₹50 to ₹107 for an Indian address depending on the agency and whether you want a physical card.'],
  ],
  'railway--change-boarding-station-irctc': [
    ['Since the rules revised in April 2026, you can do it **up to 30 minutes before the train’s scheduled departure** (earlier, only until chart preparation).',
     'News reports say rules revised in April 2026 let you do it **up to 30 minutes before the train leaves its originating station** (earlier, only until chart preparation). IRCTC’s own help page had not caught up when those reports appeared, so confirm the deadline for your PNR in your booking history.'],
  ],
  'railway--check-pnr-status-online': [
    ['(Railways moved the first chart earlier in 2025, about 8 hours before departure for most trains)', '(Railways moved the first chart earlier in 2025, about 8 hours before departure for most trains; later notices may change this)'],
  ],
  'finance--why-crude-oil-prices-rise-or-fall': [
    ['reached a record **88.7% in 2025-26** (provisional, per the Petroleum Ministry)', 'is around **88 to 89%** by recent estimates (Kpler, Carnegie)'],
    ['The US Energy Information Administration (EIA) reported that Gulf producers had shut in about **7.5 million barrels a day** by March 2026, and **Brent averaged about $103 a barrel** that month. After the strait reopened, the EIA’s September 2026 outlook expected Brent to average around **$90 in the second half of 2026** and **$74 in 2027**, as production and inventories recover.',
     'Reports from March 2026 described large Gulf output cuts and sharply higher Brent prices. We could not confirm exact figures, so check the US Energy Information Administration’s latest Short-Term Energy Outlook for current numbers.'],
  ],
  'finance--what-affects-gold-prices-india': [
    ['then raised to **15% in 2026**', 'then raised to **15% on 13 May 2026**'],
  ],
  'banking--check-bank-balance-without-app': [
    ['Numbers can change, so confirm on your bank’s official website if one doesn’t work.', 'We matched the SBI, HDFC and ICICI numbers against several listings. The others come from older lists, and numbers change, so confirm on your bank’s official website if one doesn’t work.'],
  ],
  'documents--pm-kisan-status-check': [
    ['-   **Biometric eKYC:** at a Common Service Centre (CSC).', '-   **Biometric eKYC:** at a Common Service Centre (CSC).\n-   **Farmer ID:** some states now also ask for a Farmer ID from the AgriStack registry, mainly for new registrations. Reports differ on where it is required, so check pmkisan.gov.in or your agriculture office.'],
  ],
  'railway--irctc-refund-rules': [
    ['These windows apply from the revised rules introduced in April 2026 (the no-refund cut-off moved from 4 hours to 8 hours). IRCTC shows the exact refund amount before you confirm a cancellation.',
     'These windows follow news reports of the revised rules from April 2026, which moved the no-refund cut-off from 4 hours to 8 hours. We could not match every slab to a Railway Board notice, so rely on the amount IRCTC shows before you confirm a cancellation.'],
  ],
  'finance--ipl-2026-stadium-parking-fastag-rules': [
    ['Freedom Park, UB City and notified spots', 'UB City and Shivajinagar Bus Stand (2026 police list); Freedom Park in past seasons'],
    ['Metro to Esplanade / Eden Gardens station', 'Metro to Esplanade, or Circular Railway to Eden Gardens station'],
    ['Champawati Field, Sawkuchi High School Ground', 'Champawati Field and other grounds named by police'],
    ['Match-day ASTC buses', 'Special buses on some match days'],
    ['Paid lots P4–P6 (₹200 car / ₹100 bike), Show My Parking', 'Paid lots P4–P6 (₹200 car / ₹100 bike as reported), Show My Parking'],
    ['Cab or match-day shuttle', 'Cab, or feeder buses from metro stations on some match days'],
  ],
  'finance--ipl-2026-stadium-entry-rules-mandatory-documents': [
    ['(for example District / Paytm Insider or BookMyShow, depending on the team and season)', '(for IPL 2026, District for Rajasthan Royals and BookMyShow for Mumbai Indians; it differs by team and season)'],
    ['-   **Most IPL tickets are now digital**, with a QR code in the ticketing app that’s scanned at the gate. At some venues a live QR code in the app is required and screenshots may not scan, so keep your phone charged.',
     '-   **Most IPL tickets are now digital**, with a QR code in the ticketing app that’s scanned at the gate. Mumbai Indians did not accept screenshots or screen recordings of its M-ticket in 2025, and Rajasthan Royals tickets sit in the District app profile and can’t be downloaded. Some guides say a few venues still ask fans to swap an e-ticket for a physical pass, so read your ticket instructions and keep your phone charged.'],
    ['-   **Children:** franchises usually require a ticket for children above a set age. The age differs by team, so check the terms on the ticketing page before buying.',
     '-   **Children:** Rajasthan Royals says a ticket is needed from age two, and anyone under 18 must come with an adult who also has a ticket. Other franchises may differ, so check the terms on the ticketing page before buying.'],
    ['These items appear on the prohibited lists of most IPL venues (including Chepauk, Uppal, Chinnaswamy, Wankhede and Narendra Modi Stadium):',
     'These items have appeared on prohibited lists at IPL venues in recent seasons, including Wankhede and Uppal. We found no official IPL 2026 list for most grounds, so use this as a guide and check your ticket:'],
    ['Most stadiums have **no cloakroom**, so items found at the gate are usually confiscated and not returned.', 'Cloakrooms are rare, so leave banned items at home. Items found at the gate may be confiscated.'],
    ['Gates usually open **2–3 hours before the first ball**. For a 7:30 PM match, several venues opened gates around 4:30 PM in IPL 2026.',
     'Gates usually open about **3 hours before the first ball**. In IPL 2026, Jaipur, Mullanpur and Ahmedabad opened gates at 4:30 PM for a 7:30 PM match, and Chinnaswamy was reported to open about four hours before.'],
    ['"No. Power banks and chargers are banned at almost every IPL venue, so charge your phone fully before you leave."',
     '"Usually not. Power banks have been on prohibited lists at Wankhede and Hyderabad and are commonly banned at IPL venues, so charge your phone fully and leave the power bank at home."'],
    ['"Gates usually open 2–3 hours before. Aim to arrive by about 6:00 PM to clear security comfortably."',
     '"Gates opened around 4:30 PM at several venues in IPL 2026, about three hours before a 7:30 PM start. Aim to arrive by about 6:00 PM to clear security comfortably."'],
    ['_Compiled from official stadium and police advisories for IPL 2026. Easy Guide India', '_Compiled from news reports of franchise, stadium and police advisories from IPL 2024 to 2026. No single official list covers every ground. Easy Guide India'],
  ],
};
for (const [file, list] of Object.entries(guidePatches)) {
  const url = new URL(`src/content/guides/${file}.md`, root);
  let text = await readFile(url, 'utf8');
  for (const [from, to] of list) {
    if (text.includes(from)) text = text.replace(from, to);
    else if (!text.includes(to)) { misses++; console.log(`MISS ${file}: ${from.slice(0, 70)}`); }
  }
  await writeFile(url, text);
}

// Chepauk is hand-built: add a note once.
const chepauk = new URL('src/content/stadiums/chepauk-chennai.md', root);
let c = await readFile(chepauk, 'utf8');
const note = '_Parking and traffic details follow the Greater Chennai Traffic Police arrangements published for earlier IPL seasons. We found no 2026 notice, so check the police and CSK announcements for your match._';
if (!c.includes(note)) await writeFile(chepauk, c.trimEnd() + '\n\n' + note + '\n');
console.log(misses ? `${misses} patches did not match` : 'all patches applied');
