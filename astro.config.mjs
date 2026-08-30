import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://rrsuika-studio.pages.dev',

  // All URLs end with a trailing slash. Cloudflare Pages 308-redirects
  // slashless requests to the slash version, so a slashless canonical
  // (the Astro default) points at a redirect — Google reports these as
  // "Page with redirect". Keep canonical/hreflang/sitemap in sync.
  trailingSlash: 'always',

  i18n: {
    locales: ['en', 'zh', 'nl'],
    defaultLocale: 'en',

    routing: {
      prefixDefaultLocale: false,
    },
  },

});