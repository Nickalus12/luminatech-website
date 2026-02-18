import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    industry: z.string(),
    services: z.array(z.string()),
    metrics: z.record(z.object({
      before: z.string(),
      after: z.string(),
      improvement: z.string(),
    })),
    summary: z.string(),
    date: z.coerce.date(),
    featured: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Lumina ERP Team'),
    category: z.enum([
      'cloud-migration',
      'technical',
      'best-practices',
      'thought-leadership',
      'problem-solving',
    ]).default('technical'),
    tags: z.array(z.string()),
    image: z.string().optional(),
    draft: z.boolean().default(false),
    readTime: z.string().optional(),
  }),
});

export const collections = { blog, caseStudies };
