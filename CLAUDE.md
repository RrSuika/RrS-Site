# RrSuika Studio Portfolio — Project Conventions

Personal portfolio (Astro 7, static, no integrations), deployed to Cloudflare Pages at https://rrsuika-studio.pages.dev (auto-deploys on push to main).

> ## How this memory is organised — read this before anything else
>
> | Layer | File | When |
> | --- | --- | --- |
> | **Rules** (this file) | `CLAUDE.md` | Always in force. Deliberately short — it is injected on every turn, so module detail does **not** belong here. |
> | **Architecture facts + index** | `AI_CONTEXT.md` | On picking up a task: read §11 (`我要改什么 → 去哪`) and then only the sections you need. **Do not read it cover to cover.** |
> | **Detail, read on demand** | `docs/` — see `docs/README.md` | Only when touching that module. |
> | Dev server | `AGENTS.md` | `astro dev --background` usage only. |
>
> **⚠️ Read the module doc BEFORE editing that module** — each one opens with the traps that have already cost a bug in this repo:
>
> - `docs/cassette-shelf.md` — `/projects` + `/lab` shelf (`CassetteShelf.astro`, the temporary `shelf-tuner.ts`). **Mandatory before touching either**; it holds the `preserve-3d` hygiene rule, the single position formula, the drag sign conventions, the ring budget and the arrow geometry.
> - `docs/site-intro.md` — the preloader (`Layout.astro` SITE INTRO GUARD, `site-intro.ts`, global.css §16).
> - `docs/theme-switch.md` — the copy-wave theme reveal (`theme-transition.ts`, §15) and the starfield arrival.
> - `docs/backgrounds.md` — starfield, gravitational lens, black-hole video layer (§10, `GravitationalLens.astro`).
> - `docs/decisions.md` — "why is it like this" (decisions 1–23 with the measured numbers). Check here before redoing an existing implementation.
> - `docs/tech-debt.md` — known issues and deliberate leftovers.
> - `docs/pitfalls.md` — cross-module traps: build/measure/encoding. Read before writing any measurement script.
> - `docs/writing-style.md` — en/zh/nl copy conventions. **Hard rules; read before rewriting any copy.**
> - `docs/changelog.md` — the v1.x version log. Only for tracing a past change.
>
> When code and docs disagree, **the code wins** — and the doc gets corrected in the same task.

## Development

Start the dev server in background mode:

```
astro dev --background
```

Manage it with `astro dev stop`, `astro dev status`, `astro dev logs`. Build with `npm run build`; type/content check with `npx astro check`.

## Design system — READ THIS BEFORE TOUCHING STYLES

- **`src/styles/global.css` is the single source of truth** for all design tokens (14 sections, §-numbered in comments), imported once by `Layout.astro` frontmatter. Design-system-level CSS goes there; page-specific CSS goes in that page's own `<style>` (auto-scoped). A few blocks are `is:global` (e.g. `ProjectDetail`'s article typography).
- **Token fidelity policy**: every token value was copied 1:1 from the original pre-cleanup styles. When replacing literals, use a token **only if its value is identical in both themes**; otherwise leave the literal. Never invent new colors, never "harmonize" values, never recolor.
- Theme contract: `data-theme` on `<html>` (dark default), `localStorage["rrsuika-theme"]`, toggle via `window.__toggleTheme`. First visit is always dark (no `prefers-color-scheme`); an inline head guard sets the attribute before the first paint.
- **⚠️ Hero terminal is temporarily hidden**: `global.css` §14 contains `.hero .terminal { display: none; }` with restore instructions. Deleting that block restores the terminal (element is intact in `Hero.astro`).
- **Old-palette literals are deliberate** (user chose to keep the original look) — do not recolor: Navbar warning stripe `#ff5f1f`, brand dots `#ff3333/#ffd400/#00b0ff`, Hero terminal `rgba(255,95,31,…)`, light greens `#00703c` / `#145a28`, and the frozen art-gallery styles in §11 (`frozen: kept verbatim`).
- **CJK**: `html[lang="zh"]` headings get `letter-spacing: 0; line-height: 1.2` (§13); `.hero h1` is Latin and keeps its display tracking.
- **Scrollbar is intentionally fully hidden** (original behaviour, kept by user preference). Do not "fix" it.
- **Fonts**: Google Fonts JetBrains Mono 400/700/800/900, Saira Condensed, VT323; self-hosted Smiley Sans Oblique (得意黑) subsets in `public/fonts/dyh`. `--font-mono`/`--font-body` include CJK fallbacks.
- Backgrounds (§10) — starfield, black-hole video layer, gravitational lens: **`docs/backgrounds.md`**.

### Four traps that must not be relearned (full list in `docs/pitfalls.md`)

- ⚠️ **Never write `backdrop-filter` and `-webkit-backdrop-filter` in one rule.** The build's CSS minifier (lightningcss, via Vite) treats the prefix as an alias, collapses the pair and keeps the **last** one — a `-webkit-`-last pair ships WebKit-only frost that Chrome/Edge/Firefox ignore. This failed in production while dev looked fine. The Safari fallback lives in its own `@supports (-webkit-backdrop-filter: …)` rule. Same rule for `mask`, `user-select`, `text-size-adjust`. **"Dev works, production doesn't" on a pure-CSS problem ⇒ suspect the minifier first.**
- ⚠️ **A stray `{` in a component's `<style>` silently drops every rule after it** — `astro check` and `npm run build` both pass and the page still renders, just undetailed. After editing a `<style>`, confirm the new selectors exist in `document.styleSheets` **before** believing any layout, colour or frame-rate measurement.
- ⚠️ **Astro scoping**: `<style is:global>` must contain bare selectors (Astro only strips `:global()` in scoped blocks; in an `is:global` block `:global(.x)` is invalid CSS and the whole rule is dropped). A scoped rule also **cannot** style a node created by JS — `document.createElement` output carries no `data-astro-cid-*`, so it needs `:global(...)`.
- ⚠️ **An overridable custom property's default belongs at the root of the scope** (`:global(:root)`), never on the element itself: a declaration on the element shadows the inherited inline override completely.

## Architecture conventions

- **`src/utils/routes.ts` is the single source for entry URLs** (`typeToRoute`, `buildEntryUrl`). Note detail routes use singular `note` (`/note/{slug}`), while the listing page is `/notes`. Never create per-component route maps — that bug produced 404s.
- **`src/utils/translations.ts` is the single translation source** (meta/nav/common/language/card/hero/featured/explore/latest/aboutPreview/footer/sections/system/skillMap). Never add inline translation dictionaries in components. `skillMap.hubs` feeds the about-page skill constellation (labels only — positions/links live in the page script).
- **i18n is manual** (no Astro i18n routing): `/zh` and `/nl` prefixes detected via `getLanguageFromPath`; every en page needs zh and nl mirror files. Use `getLocalizedPath`/`findTranslation` from `src/utils/i18n.ts`.
- **Content**: single collection `entries` (glob loader, `src/content.config.ts`); URL slug = entry folder name; en/cn/nl paired by `translationKey`. `collaboration` drives the TEAM badge. The `type` enum (`projects`/`lab`/`note`/`art`) is load-bearing — do not rename it.
- **Entry body images** (`![](./file.png)` or raw HTML `<img src="./…">`) are resolved to hashed URLs at build time by the satteri plugin in `astro.config.mjs` (`src/utils/markdown-resolve-images.ts`) — reference them with bare `./` filenames and never add client-side image src fixes.
- **Home page**: featured projects use a hardcoded `featuredKeys` list in the three homepage frontmatters (user preference); SYS.LOG excludes `type === "art"` entries (art has no detail pages).
- **Art pages are VISUAL-FROZEN**: code may be refactored or optimized, but rendered appearance must not change. Art images are pre-optimized with `npm run optimize-art`. `src/utils/artImages.ts` is the shared image source for all three `/art` pages.

## SEO conventions

- `Layout` Props: `title` (append `| RrSuika Studio` for pages), `description` (falls back to `t.meta.description`), `ogImage` (absolute path string), `alternateHrefs` (`undefined` = auto-assume all other languages; an array = explicit alternates, empty array = none; `null` = omit hreflang), `noIndex`.
- Structured data (JSON-LD, `is:inline`): `WebSite` in Layout head; `Person` on both About pages (name RrSuika Studio, alternateName RrS, sameAs GitHub/pixiv); `TechArticle` on detail templates (full ISO-8601 dates — schema.org requires timezone info; `translationOfWork` links the paired article).
- `sitemap.xml.ts` excludes art entries (no detail pages). `public/robots.txt` allows all but disallows `/art/` for AI-training crawlers. `public/google0d8…b1.html` is a Search Console verification file — do not delete.
- Site URL is configured in `astro.config.mjs` — canonical/hreflang/OG derive from it.
- **⚠️ Trailing slash is mandatory**: `astro.config.mjs` sets `trailingSlash: "always"`. Every internal link must carry it (only exception: assets and `/`). Without it Cloudflare 308-redirects and canonicals point at the redirect.

## Repository hygiene

- `输入/` is the AI's input drop-box (user drops materials for the AI to read and turn into site assets). It is gitignored and **never** committed or uploaded.
- `Skill/` holds the local skill packages (lieflat-charts, 去AI味, third-party packs). The **whole directory is gitignored** (2026-09-20) so the repo and its clones carry no skill files — the files stay on disk, so the `.claude/skills/` junctions keep working. Older commits still contain them; do not try to shrink that without asking.
- ⚠️ **Delete files by exact path only** (`Remove-Item -LiteralPath '…'`) — never clean a shared directory (`%TEMP%`, user folders) with a wildcard. Windows paths are case-insensitive, so `rrs-*` also matches the user's own `RRS-*.log`. Details + the 2026-09-19 incident: `docs/pitfalls.md` §9.
- Dead files removed in the 2026-08 cleanup: legacy `src/content/config.ts`, unused components/utilities, the old `#neural-canvas` and 2D star script (both preserved-but-disabled behind `data-neural` / `data-star-version`).

## AI Skills (2026-09-01)

Sources live in `Skill/` — **local-only, not in the repo** (whole directory gitignored since 2026-09-20, so a fresh clone has no skill files). `.claude/skills/` holds discovery links (also gitignored, not deployed).

- **lieflat-charts** (`Skill/lieflat-charts/`) — template-driven data-visualisation / HTML-report skill. Load it before building charts or reports; the site's own design system wins where they conflict.
- **去AI味 / lieflat-less-ai-tone** (`Skill/去AI味 skill.md`) — whitelist-based de-AI-ification of prose. Registered copy at `.claude/skills/lieflat-less-ai-tone/SKILL.md`. Use together with `docs/writing-style.md`.
