import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { resolveEntryImages } from './src/utils/markdown-resolve-images';

export default defineConfig({
  site: 'https://rrsuika-studio.pages.dev',

  // All URLs end with a trailing slash. Cloudflare Pages 308-redirects
  // slashless requests to the slash version, so a slashless canonical
  // (the Astro default) points at a redirect — Google reports these as
  // "Page with redirect". Keep canonical/hreflang/sitemap in sync.
  trailingSlash: 'always',

  // Entry markdown references images as `./file.png`; resolve those to
  // real hashed/public URLs at build time (was done client-side before,
  // which produced 404s on every page load — see Cloudflare 4xx report).
  markdown: {
    processor: satteri({ hastPlugins: [resolveEntryImages] }),
  },

  i18n: {
    locales: ['en', 'zh', 'nl'],
    defaultLocale: 'en',

    routing: {
      prefixDefaultLocale: false,
    },
  },

});