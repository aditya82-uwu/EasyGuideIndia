import type { CollectionEntry } from 'astro:content';

// Search Console clicks, highest first. Anything not listed sorts after, by city.
const BY_DEMAND = [
  'chepauk-stadium-chennai-entry-rules-parking-guide',
  'arun-jaitley-stadium-delhi-entry-rules-parking-guide',
  'mullanpur-stadium-chandigarh-entry-rules-parking-guide',
  'narendra-modi-stadium-ahmedabad-entry-rules-parking-guide',
  'ekana-stadium-lucknow-entry-rules-parking-guide',
  'wankhede-stadium-mumbai-entry-rules-parking-guide',
  'eden-gardens-kolkata-entry-rules-metro-parking-guide',
  'uppal-stadium-hyderabad-entry-gates-parking-guide-rgis',
  'dharamshala-cricket-stadium-entry-gates-parking-guide-hpca',
  'sawai-mansingh-stadium-jaipur-entry-rules-parking-guide',
  'barsapara-stadium-guwahati-entry-rules-parking-guide',
  'kaloor-stadium-kochi-entry-gates-parking-guide',
];

type Stadium = CollectionEntry<'stadiums'>;

export const byDemand = (list: Stadium[]) =>
  [...list].sort((a, b) => {
    const ia = BY_DEMAND.indexOf(a.data.legacySlug);
    const ib = BY_DEMAND.indexOf(b.data.legacySlug);
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib) || a.data.city.localeCompare(b.data.city);
  });

export const topCount = 6;

// One short fact for a card: the first quick answer about metro or train.
export const cardFact = (s: Stadium) =>
  s.data.quick.find((q) => /metro|train|tube|tram/i.test(q.q)) ?? s.data.quick[0];
