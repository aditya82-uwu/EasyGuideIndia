import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const place = z.object({
  name: z.string(),
  detail: z.string(),
});

const stadiums = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/stadiums' }),
  schema: z.object({
    // Old WordPress slug. Keeps the live URL /blog/<legacySlug>/ so rankings carry over.
    legacySlug: z.string(),
    title: z.string(),
    description: z.string(),
    // Answer-first opening paragraph shown under the page heading. Plain text, no markdown.
    intro: z.string().optional(),
    name: z.string(),
    officialName: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string().default('India'),
    homeTeam: z.string(),
    updated: z.coerce.date(),
    published: z.coerce.date(),
    // One-line answers shown above the fold. tone drives the colour.
    quick: z.array(z.object({
      q: z.string(),
      a: z.string(),
      tone: z.enum(['yes', 'no', 'info']),
    })).default([]),
    // Structured sections are optional. A guide with only a markdown body renders the body.
    transport: z.array(place).optional(),
    parking: z.array(place).optional(),
    gates: z.string().optional(),
    tickets: z.string().optional(),
    banned: z.array(z.string()).optional(),
    carry: z.string().optional(),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    sources: z.array(z.string()).default([]),
  }),
});

// Everything that is not a stadium page: how-to guides, explainers, legal pages.
const guides = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/guides' }),
  schema: z.object({
    // Full old URL path without slashes at the ends, e.g. "finance/ipl-2026-ticket-gst-refund-rules-explained".
    legacyPath: z.string(),
    title: z.string(),
    description: z.string(),
    section: z.enum(['finance', 'documents', 'railway', 'banking', 'blog', 'page']),
    published: z.coerce.date(),
    updated: z.coerce.date(),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  }),
});

export const collections = { stadiums, guides };
