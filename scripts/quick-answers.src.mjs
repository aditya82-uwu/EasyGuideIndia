// Source for data/quick-answers.json. Every answer comes from the legacy post text and, for the
// grounds listed in `checked`, was re-verified against news reports and police notices on that date.
// Anything we could not confirm is worded as "commonly" or "check your ticket", or left out.
const Y = 'yes', N = 'no', I = 'info';
const COMMON = 'Commonly banned at IPL venues';
const pb = (a = COMMON) => ({ q: 'Power bank', a, tone: N });
const bags = (a = COMMON) => ({ q: 'Bags', a, tone: N });

export const checked = {
  'arun-jaitley-delhi': '2026-11-01',
  'mullanpur-chandigarh': '2026-11-01',
  'narendra-modi-ahmedabad': '2026-11-01',
  'ekana-lucknow': '2026-11-01',
  'wankhede-mumbai': '2026-11-01',
  'eden-gardens-kolkata': '2026-11-01',
  'uppal-hyderabad': '2026-11-01',
};

export default {
  'arun-jaitley-delhi': [
    { q: 'Nearest metro', a: 'Delhi Gate (gates 4, 5) or ITO (gates 3, 4, 5), Violet Line', tone: I },
    { q: 'Free parking', a: 'Mata Sundari Rd, Rajghat Power House Rd, Velodrome Rd', tone: I },
    { q: 'Near the gates', a: 'Only vehicles with an official parking label', tone: N },
    pb(),
    bags(),
    { q: 'Ticket type', a: 'E-ticket QR or physical. Follow your ticket', tone: I },
  ],
  'mullanpur-chandigarh': [
    { q: 'Public parking', a: 'Paid lots P4, P5, P6 for general spectators', tone: I },
    { q: 'Parking fee', a: 'Rs 200 car, Rs 100 two-wheeler, as The Tribune reported. Confirm per match', tone: I },
    { q: 'Gates', a: '16 gates reported. Use the one on your ticket', tone: I },
    pb(),
    bags(),
    { q: 'Tickets', a: 'District by Zomato. Pick up at Mohali or Mullanpur', tone: I },
  ],
  'narendra-modi-ahmedabad': [
    { q: 'Nearest metro', a: 'Motera Stadium station (Red Line)', tone: Y },
    { q: 'Parking', a: 'Limited. Pre-booking via Show My Parking was offered for IPL 2026', tone: I },
    { q: 'Gates open', a: 'About 3 hours before the start in IPL 2025. Check your ticket', tone: I },
    pb(),
    bags('Commonly banned at IPL venues (small ladies purses excepted)'),
  ],
  'ekana-lucknow': [
    { q: 'Metro', a: 'No station at the stadium. Indira Nagar is nearest, about 4 km', tone: N },
    { q: 'Last mile', a: 'Feeder buses from metro stations ran on IPL match days. Else cab or auto', tone: I },
    { q: 'Metro hours', a: 'Extended to 12:30 AM on IPL match days in a past season', tone: I },
    pb(),
    { q: 'Outside food and drink', a: 'Commonly banned at IPL venues', tone: N },
  ],
  'wankhede-mumbai': [
    { q: 'Nearest train', a: 'Churchgate, a few minutes walk', tone: I },
    { q: 'Metro', a: 'Line 3 (Aqua) serves the Churchgate area', tone: I },
    { q: 'Parking at stadium', a: 'None for the public. Roadside parking restricted on match days', tone: N },
    pb('Banned at past matches. Assume not allowed'),
    bags('Large bags banned. Carry phone, wallet, ticket'),
  ],
  'eden-gardens-kolkata': [
    { q: 'Nearest metro', a: 'Esplanade, about 1 km walk', tone: I },
    { q: 'Nearest train', a: 'Eden Gardens (Circular Railway)', tone: I },
    { q: 'Parking', a: 'Very limited. Police restrict nearby roads on match days', tone: N },
    pb(),
    bags('Commonly banned, with cameras'),
  ],
  'uppal-hyderabad': [
    { q: 'Nearest metro', a: 'Stadium station (Blue Line). Uppal also close', tone: I },
    { q: 'Metro', a: 'Police advise metro and RTC buses on match days', tone: Y },
    pb('Electronics are on police lists. Assume banned'),
    bags('Bags, pens and electronics are on police lists'),
  ],
  'dharamshala-hpca': [
    { q: 'Near the stadium', a: 'No-vehicle zone on match days', tone: N },
    { q: 'Shuttles', a: 'HRTC buses from designated parking grounds', tone: Y },
    { q: 'Nearest airport', a: 'Kangra (Gaggal), about 12 km', tone: I },
    pb(),
    bags('Backpacks and large bags commonly banned'),
  ],
  'sms-jaipur': [
    { q: 'Nearest bus stops', a: 'Rambagh Circle, Nagar Nigam (Lal Kothi)', tone: I },
    { q: 'Nearest train', a: 'Gandhinagar Jaipur. Jaipur Junction by cab', tone: I },
    { q: 'Parking', a: 'Limited. No-parking ring around the stadium', tone: N },
    pb(),
    bags('Bags and bottles commonly banned'),
  ],
  'barsapara-guwahati': [
    { q: 'Public parking', a: 'Champawati Field, Sawkuchi High School Ground', tone: I },
    { q: 'Drop-off', a: 'Barsapara Tiniali, Dhirenpara Tiniali', tone: I },
    { q: 'Gates open', a: '4:00 PM for a 7:30 PM match', tone: I },
    pb(),
    bags('Large backpacks commonly banned'),
  ],
  'kaloor-kochi': [
    { q: 'Nearest metro', a: 'JLN Stadium station (Kochi Metro)', tone: I },
    { q: 'Public parking', a: 'Paid, Helipad Ground behind the stadium', tone: I },
    { q: 'PIN code', a: '682017', tone: I },
  ],
  'chinnaswamy-bengaluru': [
    { q: 'Nearest metro', a: 'Cubbon Park and MG Road (Purple Line)', tone: I },
    { q: 'Parking', a: 'Freedom Park, UB City, other designated spots', tone: I },
    { q: 'Cab and auto pick-up', a: 'BRV Ground, Manekshaw Parade Ground', tone: I },
    pb('Commonly banned, with other electronics'),
  ],
  'indira-gandhi-guwahati': [
    { q: 'Location', a: 'Sarusajai Sports Complex, beside NH-37', tone: I },
    { q: 'Home team', a: 'NorthEast United FC (ISL)', tone: I },
  ],
  'jrd-tata-jamshedpur': [
    { q: 'Nearest railway', a: 'Tatanagar Junction', tone: I },
    { q: 'Entry gates', a: 'Nine gates for supporters and media', tone: I },
    { q: 'Home team', a: 'Jamshedpur FC (ISL)', tone: I },
  ],
  'headingley-leeds': [
    { q: 'Nearest station', a: 'Burley Park, about 5 min walk', tone: I },
    { q: 'Park and ride', a: 'From Beckett Park on international match days', tone: Y },
    { q: 'Bag size', a: 'Max 45 x 30 x 30 cm. No luggage drop', tone: I },
  ],
  'utilita-bowl-southampton': [
    { q: 'Nearest stations', a: 'Hedge End, Southampton Airport Parkway', tone: I },
    { q: 'Shuttle', a: 'Free rail shuttle buses on match days', tone: Y },
    { q: 'Payments', a: 'Cashless', tone: I },
    { q: 'Alcohol', a: 'Cannot be brought in', tone: N },
  ],
  'bristol-county-ground': [
    { q: 'Main stations', a: 'Bristol Temple Meads (2 mi), Bristol Parkway (4 mi)', tone: I },
    { q: 'Buses', a: 'Routes 72 to 77 from Temple Meads', tone: Y },
    { q: 'Bag and food rules', a: 'Vary by match. Check Gloucestershire Cricket', tone: I },
  ],
  'lords-london': [
    { q: 'Nearest tube', a: "St John's Wood (Jubilee line), 5 min walk", tone: I },
    { q: 'Famous entrance', a: 'The Grace Gates', tone: I },
    { q: 'Bags', a: 'Small bags only. Avoid luggage', tone: I },
  ],
  'the-oval-london': [
    { q: 'Nearest stations', a: 'Oval (Northern), Vauxhall (Victoria, National Rail)', tone: I },
    { q: 'Bags', a: 'One per person, max 45 x 30 x 30 cm', tone: I },
    { q: 'Own food', a: 'Allowed', tone: Y },
  ],
  'old-trafford-manchester': [
    { q: 'Tram', a: 'Old Trafford Metrolink stop, next to the ground', tone: Y },
    { q: 'Bags', a: 'One small bag, max 45 x 30 x 30 cm', tone: I },
    { q: 'Alcohol', a: 'Not allowed in. No cans or glass', tone: N },
  ],
};
