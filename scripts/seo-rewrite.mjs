// SEO rewrite for IPL pages: titles, descriptions and answer-first intros.
// Run after convert-stadiums, convert-guides and body-fixes. Facts come from the verified pages;
// nothing here adds a claim that is not already on the page. Also strips em dashes site-wide.
import { readFile, writeFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const TODAY = '2026-11-01';

const stadiums = {
  'chepauk-chennai': {
    title: 'Chepauk Stadium IPL 2027 Guide: Parking, Metro & Gates',
    description: 'Chepauk IPL 2027 guide: Government Estate metro 200 m away, free metro for CSK ticket holders in 2026, Marina Beach parking, gates and banned items.',
    intro: 'Chepauk Stadium (M. A. Chidambaram Stadium) in Chennai is the home ground of Chennai Super Kings. The nearest metro station is Government Estate, about a 200 m walk, and CSK ticket holders had free metro and MTC bus travel on match days in IPL 2026. Parking near the ground is very limited: without a car pass, fans parked on the Marina Beach service road and walked about 500 m. This guide covers gates, parking, tickets and banned items from earlier IPL seasons, and we update it when IPL 2027 notices appear.',
  },
  'wankhede-mumbai': {
    title: 'Wankhede Stadium IPL 2027 Guide: Gates, Parking & Trains',
    description: 'Wankhede IPL 2027 guide: no public parking, Churchgate and Marine Lines stations, Metro Line 3, BookMyShow tickets, gates and banned items.',
    intro: 'Wankhede Stadium in Churchgate, South Mumbai, is the home ground of Mumbai Indians. The ground has no public parking, so most fans arrive by Western Railway to Churchgate, a few minutes’ walk away, or to Marine Lines. Mumbai Metro Line 3 (Aqua Line) also serves the Churchgate area. This guide covers entry gates, tickets, parking and what you cannot carry in, based on IPL 2026 notices, and we update it when IPL 2027 details are announced.',
  },
  'arun-jaitley-delhi': {
    title: 'Arun Jaitley Stadium IPL 2027 Guide: Metro, Parking, Gates',
    description: 'Arun Jaitley Stadium IPL 2027 guide: Delhi Gate and ITO metro, free parking on Mata Sundari Road, which road leads to each gate, and banned items.',
    intro: 'Arun Jaitley Stadium (formerly Feroz Shah Kotla) on Bahadur Shah Zafar Marg is the home ground of Delhi Capitals. Delhi Traffic Police advise using the Violet Line metro: Delhi Gate and ITO are the nearest stations. In IPL 2026, free public parking was set up on Mata Sundari Road, Rajghat Power House Road and Velodrome Road, and parking near the gates was only for vehicles with an official label. Below are the roads that lead to each gate and the roads to avoid.',
  },
  'eden-gardens-kolkata': {
    title: 'Eden Gardens IPL 2027 Guide: Metro, Parking & Banned Items',
    description: 'Eden Gardens IPL 2027 guide: Esplanade metro, Eden Gardens station, no-parking zones on match days, KKR tickets and banned items.',
    intro: 'Eden Gardens in Kolkata is the home ground of Kolkata Knight Riders and the Cricket Association of Bengal. Kolkata Police restrict roads and parking around the ground on match days, so public transport is the practical choice: Esplanade metro station is about 1 km away, and Eden Gardens station on the Circular Railway is right by the ground. This guide covers road closures from earlier advisories, tickets and banned items, and we update it for IPL 2027.',
  },
  'chinnaswamy-bengaluru': {
    title: 'Chinnaswamy Stadium IPL 2027 Guide: Metro, Parking & Rules',
    description: 'Chinnaswamy IPL 2027 guide: Cubbon Park and MG Road metro, 2026 parking at UB City and Shivajinagar, digital entry and banned items.',
    intro: 'M. Chinnaswamy Stadium in central Bengaluru is the home ground of Royal Challengers Bengaluru. The nearest metro stations are Cubbon Park and MG Road on the Purple Line. Police ban parking on most nearby roads on match days, and in IPL 2026 they listed UB City and Shivajinagar Bus Stand for parking. Reports said IPL 2026 entry was fully digital, with spectator numbers capped at about 28,000. This guide covers metro, parking, drop-off points and banned items.',
  },
  'uppal-hyderabad': {
    title: 'Uppal Stadium IPL 2027 Guide: Metro, Parking & Banned Items',
    description: 'Uppal Stadium IPL 2027 guide: Stadium metro station, the four police parking grounds, gate timing and the banned items police have listed.',
    intro: 'Rajiv Gandhi International Cricket Stadium in Uppal is the home ground of Sunrisers Hyderabad. Stadium station on the Hyderabad Metro Blue Line is the nearest metro, and police advise the metro and RTC buses on match days. Police designated four public parking areas within about 500 m of the ground: Penguin, TGIALA, DSL and Modern Bakery. This guide covers parking, entry and the items police have banned, including laptops, cameras and electronics.',
  },
  'narendra-modi-ahmedabad': {
    title: 'Narendra Modi Stadium IPL 2027 Guide: Parking, Metro & Gates',
    description: 'Narendra Modi Stadium IPL 2027 guide: Motera Stadium metro, Show My Parking, gate timing, no re-entry and the banned items list.',
    intro: 'Narendra Modi Stadium in Motera, Ahmedabad, is the home ground of Gujarat Titans and the world’s largest cricket stadium by capacity. Motera Stadium station on the Red Line metro is the quickest way to arrive and leave. Parking is limited, and pre-booking through Show My Parking was offered for IPL 2026. Gates opened about three hours before the start in IPL 2025, and there is no re-entry once you leave. Below are parking, entry rules and the banned items list.',
  },
  'ekana-lucknow': {
    title: 'Ekana Stadium IPL 2027 Guide: Lucknow Parking, Metro & Rules',
    description: 'Ekana Stadium IPL 2027 guide: no metro at the ground, feeder buses, parking, gate timing and banned items for Lucknow Super Giants matches.',
    intro: 'BRSABV Ekana Cricket Stadium on Shaheed Path, Lucknow, is the home ground of Lucknow Super Giants. Lucknow Metro does not reach the ground: Indira Nagar is the nearest station, about 4 km away, so plan a cab, an auto or the feeder buses that ran from metro stations on IPL match days. Traffic on Shaheed Path is heavy before and after matches, so allow extra time. This guide covers transport, parking, gate timing and banned items for IPL 2027.',
  },
  'sms-jaipur': {
    title: 'Sawai Mansingh Stadium IPL 2027 Guide: Jaipur Parking & Rules',
    description: 'Sawai Mansingh Stadium IPL 2027 guide: how to reach Jaipur’s ground, limited parking, nearest bus stops and stations, gate timing and banned items.',
    intro: 'Sawai Mansingh Stadium (SMS Stadium) in Jaipur is the home ground of Rajasthan Royals. It is near Rambagh Circle and JLN Marg, and Jaipur Metro does not stop at the ground, so most fans come by bus, cab or auto. Parking is limited and police restrict parking around the stadium on match days. Gates opened about three hours before the start for IPL 2026 matches, for example 4:30 PM for a 7:30 PM game. This guide covers how to reach the ground, parking, entry and banned items.',
  },
  'mullanpur-chandigarh': {
    title: 'Mullanpur Stadium IPL 2027 Guide: Parking, Gates & Rules',
    description: 'Mullanpur IPL 2027 guide: paid lots P4 to P6 (₹200 car, ₹100 bike as reported), Show My Parking, about 16 gates and banned items.',
    intro: 'Maharaja Yadavindra Singh International Cricket Stadium in Mullanpur, New Chandigarh, is the home ground of Punjab Kings. It is outside the main city, so traffic and parking are the main things to plan. Paid public parking was in lots P4, P5 and P6 (₹200 for a car and ₹100 for a two-wheeler, as The Tribune reported), bookable on Show My Parking. Gates opened at 4:30 PM for the IPL 2026 opener. Below are the route, gates and banned items.',
  },
  'dharamshala-hpca': {
    title: 'HPCA Stadium Dharamshala IPL Guide: Parking, Shuttles & Rules',
    description: 'HPCA Stadium Dharamshala IPL guide: police parking plan, HRTC shuttles from Dari Ground, Kangra airport and what you can carry.',
    intro: 'The HPCA Stadium in Dharamshala, Himachal Pradesh, hosts internationals and some Punjab Kings IPL matches, with the Dhauladhar mountains behind the ground. Hill roads are narrow, so police restrict vehicles near the stadium on match days and run a parking and shuttle plan: in earlier plans, HRTC buses carried fans from grounds such as Dari Ground and Zorawar Stadium. This guide covers how to get there, parking, shuttles and what to carry.',
  },
  'barsapara-guwahati': {
    title: 'Barsapara Stadium Guwahati IPL Guide: Parking & Entry Rules',
    description: 'Barsapara Stadium Guwahati IPL guide: Champawati Field parking, road restrictions, drop-off points and banned items.',
    intro: 'Barsapara Cricket Stadium, officially the ACA Stadium, in Guwahati is Assam’s international cricket venue and a second home for Rajasthan Royals in the IPL. Police restrict roads around the ground on match days. Champawati Field is a standard parking site for big matches, and drop-off points have been at Barsapara Tiniali and Dhirenpara Tiniali in past advisories. This guide covers how to get there, parking and banned items.',
  },
};

const guides = {
  'finance--ipl-2026-stadium-entry-rules-mandatory-documents': {
    title: 'IPL 2027 Stadium Entry Rules: Tickets, ID, Banned Items',
    description: 'IPL 2027 entry rules from IPL 2026 notices: digital tickets, ID, banned items such as power banks and bags, gate timings and a guide to every IPL ground.',
    intro: 'IPL 2027 is reported to start around 10 March 2027, and entry rules for the new season have not been published yet. The rules below come from IPL 2026 notices and are broadly the same across grounds: carry a valid ticket on your phone, use the gate printed on it, arrive early, and leave power banks, bags and outside food at home. We update this page when 2027 notices appear, and link to a guide for each ground.',
  },
  'finance--ipl-2026-stadium-parking-fastag-rules': {
    title: 'IPL 2027 Stadium Parking Guide: Where to Park at Every Ground',
    description: 'Where to park for IPL 2027 matches at Wankhede, Chepauk, Arun Jaitley, Eden Gardens, Chinnaswamy, Uppal and Ahmedabad, plus the better metro or train option.',
    intro: 'Driving to an IPL match is usually the slowest way to get there. Most grounds are in city centres where police close roads and ban parking on match days. This guide lists where fans could park, and where not, at each IPL ground, using police and stadium advisories from recent seasons. Where a metro or train is close, it is almost always the better choice.',
  },
  'finance--ipl-2026-ticket-gst-refund-rules-explained': {
    title: 'IPL 2027 Tickets: How to Book, 40% GST and Refund Rules',
    description: 'How to book IPL tickets through the official partner, what 40% GST (since 22 Sep 2025) adds to the price, and refunds if a match is cancelled.',
    intro: 'IPL tickets carry 40% GST, in force since 22 September 2025 when the GST Council’s rate changes (GST 2.0) came in. The earlier rate was 28%. A ticket with a base price of ₹1,000 now costs ₹1,400 before booking fees. This guide explains how the tax is calculated, how it compares with other sports, how booking works and what happens to your money if a match is cancelled.',
  },
};

const setFm = (text, key, value) => {
  const line = `${key}: ${JSON.stringify(value)}`;
  const re = new RegExp(`^${key}: .*$`, 'm');
  return re.test(text) ? text.replace(re, () => line) : text;
};

let touched = 0;

for (const [file, c] of Object.entries(stadiums)) {
  const url = new URL(`src/content/stadiums/${file}.md`, root);
  let t = await readFile(url, 'utf8');
  t = setFm(t, 'title', c.title);
  t = setFm(t, 'description', c.description);
  t = setFm(t, 'updated', TODAY).replace(/^updated: "?([0-9-]+)"?$/m, 'updated: $1');
  // intro lives in frontmatter, right after description
  if (/^intro: .*$/m.test(t)) t = setFm(t, 'intro', c.intro);
  else t = t.replace(/^(description: .*)$/m, (m) => `${m}\nintro: ${JSON.stringify(c.intro)}`);
  // drop the old opening paragraph from the body (a bold-led first paragraph); Chepauk has none
  const parts = t.split(/^---$/m);
  if (parts.length >= 3) {
    const body = parts.slice(2).join('---').replace(/^\n+/, '');
    const lines = body.split('\n');
    const first = lines.findIndex((l) => l.trim());
    if (first >= 0 && lines[first].startsWith('**')) {
      lines.splice(first, 1);
      parts[2] = '\n' + lines.join('\n').replace(/^\n+/, '\n');
      t = parts.slice(0, 2).join('---') + '---' + parts[2];
    }
  }
  await writeFile(url, t);
  touched++;
}

for (const [file, c] of Object.entries(guides)) {
  const url = new URL(`src/content/guides/${file}.md`, root);
  let t = await readFile(url, 'utf8');
  t = setFm(t, 'title', c.title);
  t = setFm(t, 'description', c.description);
  t = setFm(t, 'updated', TODAY).replace(/^updated: "?([0-9-]+)"?$/m, 'updated: $1');
  const parts = t.split(/^---$/m);
  const lines = parts.slice(2).join('---').split('\n');
  const first = lines.findIndex((l) => l.trim() && !/^[_#|<-]/.test(l.trim()));
  if (first >= 0) {
    lines[first] = c.intro;
    t = parts.slice(0, 2).join('---') + '---' + lines.join('\n');
  }
  await writeFile(url, t);
  touched++;
}

// Em dashes: none anywhere in the content.
let stripped = 0;
for (const dir of ['guides', 'stadiums']) {
  for (const f of await readdir(new URL(`src/content/${dir}/`, root))) {
    const url = new URL(`src/content/${dir}/${f}`, root);
    const t = await readFile(url, 'utf8');
    const n = t.replace(/\s—\s/g, ', ').replace(/—/g, '-');
    if (n !== t) { await writeFile(url, n); stripped++; }
  }
}
console.log(`rewrote ${touched} pages, removed em dashes from ${stripped} files`);
