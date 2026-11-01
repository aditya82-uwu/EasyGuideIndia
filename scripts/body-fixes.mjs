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

// Chepauk is hand-built: add a note once.
const chepauk = new URL('src/content/stadiums/chepauk-chennai.md', root);
let c = await readFile(chepauk, 'utf8');
const note = '_Parking and traffic details follow the Greater Chennai Traffic Police arrangements published for earlier IPL seasons. We found no 2026 notice, so check the police and CSK announcements for your match._';
if (!c.includes(note)) await writeFile(chepauk, c.trimEnd() + '\n\n' + note + '\n');
console.log(misses ? `${misses} patches did not match` : 'all patches applied');
