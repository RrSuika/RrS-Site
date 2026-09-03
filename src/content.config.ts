import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

const entries = defineCollection({

  loader: glob({
    pattern: '**/*.md',
    base: './src/content/entries',
  }),

  schema: z.object({

    title: z.string(),

    date: z.coerce.date(),

    description: z.string().optional(),

    cover: z.string().optional(),

    type: z.enum([
      'projects',
      'lab',
      'note',
      'art',
    ]),

    category: z.string().optional(),

    collaboration: z.string().optional(),

    tags: z.array(z.string()).optional(),

    tools: z.array(z.string()).optional(),

    featured: z.boolean().optional(),

    wip: z.boolean().optional(),

    gallery: z.array(z.object({
      file: z.string(),
      title: z.string(),
    })).optional(),

    lang: z.enum([
      'en',
      'zh',
      'nl',
    ]),

    translationKey: z.string(),

  })

});

export const collections = {
  entries,
};