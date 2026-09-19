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

    /**
     * Short title printed on the CASSETTE SPINE, used in place of `title` when the
     * full one is too long for the spine's printed insert (2026-09-19: "可以把书脊的
     * 长标题改成短标题"). Purely a graphic label: it is language-NEUTRAL on purpose
     * and the same string goes in all three language files, exactly like the type
     * code printed on the window. ⚠️ Do not translate it per language — it is
     * printed matter on the object, not copy.
     */
    spineTitle: z.string().optional(),

    date: z.coerce.date(),

    dateLabel: z.string().optional(),

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