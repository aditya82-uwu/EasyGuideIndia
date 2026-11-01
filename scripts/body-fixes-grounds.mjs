// Second batch of body corrections: the 15 grounds outside the busiest eight.
// Run after convert-stadiums.mjs and body-fixes.mjs. A patch that no longer matches is reported.
import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

const patches = {
  'dharamshala-hpca': [
    ['-   Don’t try to drive to the stadium gate, as the surrounding roads are closed to vehicles.', '-   Don’t try to drive to the stadium gate: roads around it have been restricted to vehicles on match days, so follow the police signs. These plans are from earlier IPL seasons (2023 and 2025), so check the Kangra police notice for your match.'],
    ['No-vehicle zone on match days</td>', 'Roads restricted to vehicles on match days</td>'],
  ],
  'barsapara-guwahati': [
    ['It seats about 46,000 (extendable to about 55,000). ', ''],
    ['<tr><td><strong>Capacity</strong></td><td>About 46,000 (extendable to about 55,000)</td></tr>', ''],
    ['4:00 PM for a 7:30 PM match</td>', 'Check your ticket. Other IPL grounds opened about 3 hours before the start</td>'],
    ['-   **Gates open at 4:00 PM for 7:30 PM matches.** Reach by about 5:30 PM, as there are two layers of security checks.', '-   **Gates have opened roughly three hours before the start at IPL grounds.** Check your ticket, and allow time for two layers of security checks.'],
    ['-   **Match-day buses:** special ASTC buses usually run from Adabari and Paltan Bazar to the stadium.', '-   **Match-day buses:** special buses have been announced for some matches. Check the announcement for your match.'],
    ['-   Restrictions generally run from 2 PM to midnight on evening match days, and A.K. Azad Road has been made one-way (Lalganesh Tiniali to Cycle Factory Tiniali) from the afternoon.', '-   Restrictions have run through the afternoon and evening on match days, and A.K. Azad Road has been made one-way in past advisories. Check the Guwahati Traffic Police notice for your match.'],
    ['-   **Public parking:** **Champawati Field** and **Sawkuchi High School Ground**.', '-   **Public parking:** **Champawati Field** (a standard parking site for big matches) and other grounds named in the police advisory.'],
    ['Champawati Field, Sawkuchi High School Ground</td>', 'Champawati Field and other grounds named by police</td>'],
  ],
  'kaloor-kochi': [
    ['(normally around 10 PM)', '(it varies by date)'],
    ['-   **Paid public parking** is at the open **Helipad Ground** behind the stadium, first come, first served.', '-   **Paid public parking** has been reported at the open **Helipad Ground** behind the stadium. Confirm with Kerala Blasters before the match.'],
    ['Paid parking at the Helipad Ground behind the stadium</td>', 'Paid parking reported at the Helipad Ground behind the stadium</td>'],
  ],
  'chinnaswamy-bengaluru': [
    ['## Chinnaswamy Stadium at a glance\n', '_For IPL 2026, reports said entry was fully digital with QR tickets, spectator numbers were capped at about 28,000, and gates opened about four hours before the start. Confirm the rules for your match._\n\n## Chinnaswamy Stadium at a glance\n'],
    ['-   **Designated parking** has been available at **Freedom Park**, **UB City** and other notified locations.', '-   **Designated parking** in 2026 included **UB City** and **Shivajinagar Bus Stand** (police list), and **Freedom Park** in earlier seasons.'],
    ['Freedom Park, UB City and other designated spots</td>', 'UB City and Shivajinagar Bus Stand (2026 police list); Freedom Park in past seasons</td>'],
    ['BRV Ground, Manekshaw Parade Ground</td>', 'BRV Ground and Manekshaw Parade Ground in past seasons</td>'],
  ],
  'jrd-tata-jamshedpur': [
    ['The club has set up nine entry gates, so use the one on your ticket.', 'The club has reported nine entry gates, so use the one on your ticket.'],
    ['Nine gates for supporters and media</td>', 'Nine gates reported for supporters and media</td>'],
  ],
  'old-trafford-manchester': [
    ['-   You **can bring your own food and drink**, but drinks must be in plastic bottles of up to **500 ml**.', '-   You **can bring your own food and drink**, but not glass bottles, cans or alcohol.'],
    [', about the size of a regular backpack. All bags', '. All bags'],
    ['-   **Park and ride:** many Metrolink stops have free park and ride. The closest is **Stretford** (Edge Lane, M32 8HN).', '-   **Park and ride:** several Metrolink stops have park and ride, with **Stretford** the nearest. Check Transport for Greater Manchester and the club’s travel page for current details.'],
  ],
  'headingley-leeds': [
    ['There’s **no luggage drop** at Headingley.', 'The ground’s regulations list no luggage drop service, so don’t bring suitcases.'],
  ],
  'lords-london': [
    ['For matches where it’s allowed, each adult may bring **one** of:', 'For matches where it’s allowed, each adult could bring **one** of the following (quantities as reported in 2021; confirm on the MCC page):'],
  ],
  'utilita-bowl-southampton': [
    ['-   **Free rail shuttle:** on match days, express shuttle buses run from outside **Southampton Airport Parkway** and **Hedge End** stations, dropping you at the stadium gates. They start an hour before gates open and run until 30 minutes after play ends.',
     '-   **Rail shuttle:** on match days, shuttle buses run from outside **Southampton Airport Parkway** and **Hedge End** stations to the stadium gates. They have been free for The Hundred and Vitality Blast, and paid for some internationals (£5 adults, £3 under-17 on one fixture). Times vary: for one recent match they ran from an hour before gates opened until 30 minutes after play ended.'],
    ['Free rail shuttle buses on match days</td>', 'Rail shuttle buses on match days (free for The Hundred and Blast, paid for some internationals)</td>'],
    ['"Yes. On match days, free shuttle buses run from Southampton Airport Parkway and Hedge End stations."', '"Yes. Rail shuttle buses run from Southampton Airport Parkway and Hedge End on match days. They have been free for The Hundred and Vitality Blast and paid for some internationals."'],
  ],
  'bristol-county-ground': [
    ['Routes 72–77 from Temple Meads stop within about 100 yards</td>', 'Services 17, 70 and 72 to 76 stop within about a five-minute walk</td>'],
    ['-   **Bus from Temple Meads:** bus routes **72, 73, 74, 75, 76 and 77** stop within about 100 yards of the ground.', '-   **Bus:** services **17, 70, 72, 73, 74, 75 and 76** stop within about a five-minute walk (72 to 76 on Gloucester Road, 17 on Muller Road). Check First Bus for times.'],
  ],
  'edgbaston-birmingham': [
    ['501 Shuttle Bus from New Street (booked in advance)</td>', '501 Shuttle Bus from New Street (tickets in the NXBus app or by contactless on the bus)</td>'],
    ['Pre-booked, off-site; residents-only zone around the ground</td>', 'Pre-booked, off-site match-day car parks</td>'],
    ['Tickets have been £6 per adult and £4.50 per child for a day pass; book in advance.', 'A day ticket was £6 per adult and £4 per child (aged 5 to 15) in April 2026, bought in the NXBus mTicket app or by contactless on the bus. The shuttle runs for selected matches, including all internationals and The Hundred.'],
    ['On match days there’s a large **controlled parking zone** around the stadium where streets are for permit holders only, and cars parked without a permit may be ticketed or towed.', 'Streets around the ground carry local parking restrictions on match days, so use the pre-booked car parks rather than parking on residential roads.'],
  ],
  'azteca-mexico-city': [
    ['The stadium’s general parking has about **3,200 spaces** with several vehicle entrances.', 'The stadium’s general parking has about **3,200 spaces** with several vehicle entrances, but for some 2026 matches, including Mexico vs Portugal and América vs Cruz Azul, no parking was available.'],
  ],
};

let misses = 0;
for (const [file, list] of Object.entries(patches)) {
  const url = new URL(`src/content/stadiums/${file}.md`, root);
  let text = await readFile(url, 'utf8');
  for (const [from, to] of list) {
    if (text.includes(from)) text = text.replace(from, to);
    else if (!text.includes(to)) { misses++; console.log(`MISS ${file}: ${from.slice(0, 80)}`); }
  }
  await writeFile(url, text);
}
console.log(misses ? `${misses} patches did not match` : 'all ground patches applied');
