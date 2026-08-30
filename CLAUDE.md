# RrSuika Studio Portfolio — Project Conventions

Personal portfolio (Astro 7, static, no integrations), deployed to Cloudflare Pages at https://rrsuika-studio.pages.dev (auto-deploys on push to main).

> **For AI assistants: read `AI_CONTEXT.md` first** — the project's architecture & design memory (directory tree, routes, content schema, component responsibilities, design tokens, design decisions, tech debt, and a "where to change what" index). This file holds the hard rules; when the two disagree, the code wins and `AI_CONTEXT.md` must be updated.

## Development

Start the dev server in background mode:

```
astro dev --background
```

Manage it with `astro dev stop`, `astro dev status`, `astro dev logs`. Build with `npm run build`.

## Design system — READ THIS BEFORE TOUCHING STYLES

- **`src/styles/global.css` is the single source of truth** for all design tokens (14 sections), imported once by `Layout.astro` frontmatter.
- **Token fidelity policy**: every token value was copied 1:1 from the original pre-cleanup styles. When replacing literals, use a token **only if its value is identical in both themes**; otherwise leave the literal. Never invent new colors, never "harmonize" values, never recolor.
- Theme contract: `data-theme` on `<html>` (dark default), `localStorage["rrsuika-theme"]`, toggle via `window.__toggleTheme`.
- **⚠️ Hero terminal is temporarily hidden**: `global.css` §14 contains `.hero .terminal { display: none; }` with restore instructions. Deleting that block restores the terminal (element is intact in `Hero.astro`).
- Background layers (§10): weakened particle canvas (`#neural-canvas`, script in Layout.astro — 140/70 particles, CONNECTION_DIST 140, shadowBlur 8, opacity 0.25 dark / 0.10 light) + hex grid + noise + scanlines (0.28 dark / 0.08 light) + vignette.
- CJK: `html[lang="zh"]` headings get `letter-spacing: 0; line-height: 1.2` (§13); `.hero h1` is Latin and keeps its display tracking.
- Scrollbar is intentionally fully hidden (original behavior, kept by user preference).
- Fonts: Google Fonts JetBrains Mono 400/700/800/900, Saira Condensed, VT323; self-hosted Smiley Sans Oblique (得意黑) subsets in `public/fonts/dyh`. `--font-mono`/`--font-body` include CJK fallbacks.
- Old-palette literals (`#ff5f1f`, brand dots `#ff3333/#ffd400/#00b0ff`, `rgba(255,95,31,…)`, light greens `#00703c/#145a28`) are deliberate — the user chose to keep the original look. Do not recolor them.

## Architecture conventions

- **`src/utils/routes.ts` is the single source for entry URLs** (`typeToRoute`, `buildEntryUrl`). Note detail routes use singular `note` (`/note/{slug}`), while the listing page is `/notes`. Never create per-component route maps — that bug produced 404s.
- **`src/utils/translations.ts` is the single translation source** (nav/common/hero/featured/explore/latest/aboutPreview/footer/sections/meta). Never add inline translation dictionaries in components.
- **i18n is manual** (no Astro i18n routing): `/zh` and `/nl` prefixes detected via `getLanguageFromPath`; every en page needs zh and nl mirror files. Use `getLocalizedPath`/`findTranslation` from `src/utils/i18n.ts`.
- **Content**: single collection `entries` (glob loader, `src/content.config.ts`); URL slug = entry folder name; en/cn/nl paired by `translationKey`. `collaboration` field drives the TEAM badge in ProjectCard.
- **Entry body images** (`![](./file.png)` or raw HTML `<img src="./…">`) are resolved to hashed URLs at build time by the satteri plugin in `astro.config.mjs` (`src/utils/markdown-resolve-images.ts`) — reference them with bare `./` filenames and never add client-side image src fixes.
- **Home page**: featured projects use a hardcoded `featuredKeys` list (user preference); SYS.LOG excludes `type === "art"` entries (art has no detail pages).
- **Art pages are VISUAL-FROZEN**: code may be refactored or optimized, but rendered appearance must not change. Art images are pre-optimized with `npm run optimize-art` (lossless webp only when output is >= 50% of the original size; otherwise the original is kept). `src/utils/artImages.ts` is the shared image source for all three `/art` pages.

## SEO conventions

- `Layout` Props: `title` (append `| RrSuika Studio` for pages), `description` (falls back to `t.meta.description`), `ogImage` (absolute path string), `alternateHrefs` (`undefined` = auto-assume all other languages; an array = explicit alternates, empty array = none; `null` = omit hreflang), `noIndex`.
- Structured data (JSON-LD, `is:inline`): `WebSite` in Layout head; `Person` on both About pages (name RrSuika Studio, alternateName RrS, sameAs GitHub/pixiv); `TechArticle` on detail templates (full ISO-8601 dates — schema.org requires timezone info; `translationOfWork` links the paired article).
- `sitemap.xml.ts` endpoint excludes art entries (no detail pages). `public/robots.txt` allows all crawlers except AI-training bots, which are disallowed from `/art/`, `/zh/art/` and `/nl/art/` (Googlebot unaffected).
- Site URL is configured in `astro.config.mjs` — canonical/hreflang/OG depend on it.
- **Trailing slash is mandatory**: `astro.config.mjs` sets `trailingSlash: "always"`, and every internal URL (canonical, hreflang, sitemap, links) ends with `/`. Cloudflare Pages 308-redirects slashless requests, which made canonicals point at redirects and triggered GSC "Page with redirect" (2026-08-31). Exception: asset URLs and the bare root `/`.

## Repository hygiene

- `输入/` is the AI's input drop-box (user drops materials for the AI to read and turn into site content). Gitignored and untracked — never commit or upload it.
- Dead files removed in 2026-08 cleanup: legacy `src/content/config.ts`, `ContentList.astro`, empty `retro-ui.css`/`variables.css`.
