// Official pages per ground, shown under "Official sources" on a guide. Every URL was checked to load.
export type Source = { name: string; url: string };

const IPL: Source = { name: 'IPL official site', url: 'https://www.iplt20.com/' };
const BCCI: Source = { name: 'BCCI', url: 'https://www.bcci.tv/' };
const ipl = (...own: Source[]): Source[] => [IPL, BCCI, ...own];

export const SOURCES: Record<string, Source[]> = {
  'chepauk-stadium-chennai-entry-rules-parking-guide': ipl(
    { name: 'Chennai Super Kings', url: 'https://www.chennaisuperkings.com/' },
    { name: 'Tamil Nadu Cricket Association', url: 'https://www.tnca.in/' },
    { name: 'Chennai Metro Rail', url: 'https://chennaimetrorail.org/' },
  ),
  'wankhede-stadium-mumbai-entry-rules-parking-guide': ipl({ name: 'Mumbai Indians', url: 'https://www.mumbaiindians.com/' }),
  'arun-jaitley-stadium-delhi-entry-rules-parking-guide': ipl(
    { name: 'Delhi Capitals', url: 'https://www.delhicapitals.in/' },
    { name: 'Delhi Metro Rail Corporation', url: 'https://delhimetrorail.com/' },
  ),
  'eden-gardens-kolkata-entry-rules-metro-parking-guide': ipl(
    { name: 'Kolkata Knight Riders', url: 'https://www.kkr.in/' },
    { name: 'Kolkata Metro', url: 'https://kolmetro.com/' },
  ),
  'm-chinnaswamy-stadium-bengaluru-entry-rules-parking-guide': ipl(
    { name: 'Royal Challengers Bengaluru', url: 'https://www.royalchallengers.com/' },
    { name: 'Namma Metro (BMRCL)', url: 'https://english.bmrc.co.in/' },
    { name: 'Bengaluru Traffic Police', url: 'https://btp.karnataka.gov.in/' },
  ),
  'uppal-stadium-hyderabad-entry-gates-parking-guide-rgis': ipl(
    { name: 'Sunrisers Hyderabad', url: 'https://www.sunrisershyderabad.in/' },
    { name: 'Hyderabad City Police', url: 'https://www.hyderabadpolice.gov.in/' },
  ),
  'narendra-modi-stadium-ahmedabad-entry-rules-parking-guide': ipl({ name: 'Ahmedabad Metro', url: 'https://ahmedabadmetrorail.com/' }),
  'ekana-stadium-lucknow-entry-rules-parking-guide': ipl({ name: 'Lucknow Super Giants', url: 'https://www.lucknowsupergiants.in/' }),
  'sawai-mansingh-stadium-jaipur-entry-rules-parking-guide': ipl(
    { name: 'Rajasthan Royals', url: 'https://www.rajasthanroyals.com/' },
    { name: 'Jaipur Metro', url: 'https://www.metrojaipur.com/' },
  ),
  'mullanpur-stadium-chandigarh-entry-rules-parking-guide': ipl({ name: 'Punjab Kings', url: 'https://www.punjabkingsipl.in/' }),
  'dharamshala-cricket-stadium-entry-gates-parking-guide-hpca': ipl({ name: 'Punjab Kings', url: 'https://www.punjabkingsipl.in/' }),
  'barsapara-stadium-guwahati-entry-rules-parking-guide': ipl({ name: 'Rajasthan Royals', url: 'https://www.rajasthanroyals.com/' }),
  'lords-cricket-ground-entry-rules-gate-protocol': [{ name: 'Transport for London', url: 'https://tfl.gov.uk/' }],
  'the-oval-london-entry-rules-gate-protocol': [{ name: 'Transport for London', url: 'https://tfl.gov.uk/' }],
  'old-trafford-cricket-ground-entry-rules-gate-protocol': [
    { name: 'Lancashire Cricket', url: 'https://www.lancashirecricket.co.uk/' },
    { name: 'Transport for Greater Manchester', url: 'https://tfgm.com/' },
  ],
};
