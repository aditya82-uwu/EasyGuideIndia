import { plain } from './md';

export const SITE = 'https://www.easyguideindia.in';
export const ORG = {
  '@type': 'Organization',
  '@id': `${SITE}/#org`,
  name: 'Easy Guide India',
  url: `${SITE}/`,
  logo: { '@type': 'ImageObject', url: `${SITE}/apple-touch-icon.png`, width: 180, height: 180 },
};

export const websiteLd = {
  '@type': 'WebSite',
  '@id': `${SITE}/#website`,
  url: `${SITE}/`,
  name: 'Easy Guide India',
  publisher: { '@id': `${SITE}/#org` },
  inLanguage: 'en-IN',
};

export const breadcrumbLd = (trail: { name: string; href?: string }[], current: { name: string; url: string }) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [
    ...trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: SITE + (t.href ?? '/') })),
    { '@type': 'ListItem', position: trail.length + 1, name: current.name, item: current.url },
  ],
});

export const articleLd = (o: { url: string; title: string; description: string; image: string; published: Date; updated: Date }) => ({
  '@type': 'Article',
  '@id': `${o.url}#article`,
  headline: o.title,
  description: o.description,
  image: o.image,
  datePublished: o.published.toISOString(),
  dateModified: o.updated.toISOString(),
  inLanguage: 'en-IN',
  author: { '@id': `${SITE}/#org` },
  publisher: { '@id': `${SITE}/#org` },
  isPartOf: { '@id': `${SITE}/#website` },
  mainEntityOfPage: o.url,
});

export const faqLd = (faqs: { q: string; a: string }[]) =>
  faqs.length
    ? [{
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })),
      }]
    : [];

export const venueLd = (v: { name: string; city: string; state: string; country: string; url: string }) => ({
  '@type': 'StadiumOrArena',
  name: v.name,
  url: v.url,
  address: {
    '@type': 'PostalAddress',
    addressLocality: v.city,
    addressRegion: v.state,
    addressCountry: v.country === 'UK' ? 'GB' : v.country === 'India' ? 'IN' : v.country === 'Mexico' ? 'MX' : v.country,
  },
});

export const graph = (...nodes: unknown[]) => JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes.flat() });
