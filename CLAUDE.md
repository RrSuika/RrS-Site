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
- Background layers (§10): active 3D starfield canvas (`#starfield-canvas`, script in Layout.astro — celestial-sphere stars with realistic spectral colours, proper motion, camera drift + local star drag; opacity 0.85 dark / hidden in light (replaced by retro black grid)) + hex grid + noise + scanlines (0.28 dark / 0.08 light) + vignette.
  - The old `#neural-canvas` neural network and the earlier 2D star script are disabled-but-preserved for rollback (`data-neural="enabled"` / `data-star-version="2d"`).
  - **Homepage black-hole video layer** (§10, dark mode, homepage only): `#blackhole-layer` (pure black base + `public/media/blackhole.mp4`) sits *before* `#starfield-canvas` in the DOM, so the homepage stack is black → video → stars → lens → content. All four backgrounds share `z-index: 0`; **layer order is DOM order — do not move the markup**. Tune size/position with the `--blackhole-*` knobs inside `#blackhole-layer` (`--blackhole-y` is `calc(122px + 37.8vh)`, fitted to two hand-tuned measurements — never assume the viewport matches the screen resolution). **Desktop only**: the layer is `display: none` until JS adds `.bh-on` at ≥ 769px, and the video uses `data-src` so phones never download it. Only the three homepages pass `blackhole` to `<Layout>`; other pages, light mode and mobile are unchanged. The video plays **continuously** — no pause on tab-hidden or theme switch (user request); a 2s watchdog re-plays it if the browser pauses background media.
  - **Gravitational-lens starfield** (§10, homepage only, dark mode + desktop): `src/components/GravitationalLens.astro` renders `#lens-canvas` *after* `#starfield-canvas` and takes over from it (`html[data-lens="on"]` hides the celestial field and the Layout script skips its work). Stars are **one continuous inward stream** — each is born near the outer edge and falls monotonically toward the hole through three speed segments (outer very slow → middle fast → inner slowing toward the ring) while spiralling clockwise (`--lens-swirl`, ∝ rRing/r); mid-flight the disk occludes them, and they **fade out at the black-hole outer ring** before respawning outside (no per-layer loops); **inside `--lens-r-ring` nothing is drawn (pure black)**. Because the video sits *below* the starfield, an **accretion-disk annulus** — a rotated ellipse whose inner and outer edges each have independent half-width/half-height (`--lens-disk-inner-w/h`, `--lens-disk-outer-w/h`, `--lens-disk-tilt/dx/dy/feather`), shifted up so its lower half is smaller — hides stars whose lensed screen position lands on the disk; they **fade out at the edge** and fade back in inside `diskInner`, next to the ring, where a **circular photon band** of tiny, bright, **non-stretched** stars fills the gap (`--lens-photon-band` width — keep it inside the disk's inner ellipse so the band stays circular — `--lens-photon-size` size multiplier, `--lens-gap-boost` brightness). All knobs are unitless custom properties on `#lens-canvas`; **the seven video-anchored geometry knobs** (centre-Y `cyVh`, radii `r-outer/r-mid/r-inner`, ring `r-ring`, disk-inner `w/h`) **are viewport-adaptive while §10 sits at the shipped baseline**: the component two-point-fits them (px ∝ viewport W) between the §10/FALLBACK profile (tuned on a 2K desktop, 1661×802) and a second calibration profile (1080p desktop, 1234×562 — the `SCALED` table in GravitationalLens.astro §2a), so the hole/ring/disk line up with the video on any ≥16:9 window — drag the window to another screen and it re-fits on resize. Tuner inline values or a hand-edited §10 block that differs from FALLBACK freeze verbatim. **Re-baselining the look = replace global.css §10 AND the matching `FALLBACK`/`SCALED` values in the component together** (the COPY output's `⚠` note says when a block contains auto-fitted values). **Keyboard tuner** (frosted-glass panel, draggable by its header; opens from the navbar tool icon, `` ` `` or `?lens=tune`): `1`–`0`/`TAB` select, arrows nudge (**Shift ×10 / Alt ×0.1**), the panel shows a per-target description (localised en/zh/nl; drag clamped to the viewport; themed thin scrollbar), the **COPY button** (or `C`) copies the tuned values — viewport size + px radii included — for global.css §10 or the AI, `R` resets. Tuning persists in `localStorage["rrsuika-lens-tune-v7"]` per browser — never in the repo (only nudged knobs are saved, so a tune from one screen never freezes another screen's defaults).
  - **Project / lab cards are frosted glass**: `ProjectCard.astro`'s `.card` keeps its translucent tint + noise texture and adds `backdrop-filter: blur(20px) saturate(160%)` (plus the `-webkit-` prefix). ⚠️ `main`'s `pageIn` and the cards' `cardIn` entrance animations use `animation-fill-mode: backwards` (NOT `both`): a lingering `transform` on `<main>` or the card makes Chrome silently drop the card's `backdrop-filter`. Every page that renders `ProjectCard` (`/projects`, `/lab`, `/notes`, homepage featured) gets the frost in both themes.


- CJK: `html[lang="zh"]` headings get `letter-spacing: 0; line-height: 1.2` (§13); `.hero h1` is Latin and keeps its display tracking.
- Scrollbar is intentionally fully hidden (original behavior, kept by user preference).
- Fonts: Google Fonts JetBrains Mono 400/700/800/900, Saira Condensed, VT323; self-hosted Smiley Sans Oblique (得意黑) subsets in `public/fonts/dyh`. `--font-mono`/`--font-body` include CJK fallbacks.
- Old-palette literals (`#ff5f1f`, brand dots `#ff3333/#ffd400/#00b0ff`, `rgba(255,95,31,…)`, light greens `#00703c/#145a28`) are deliberate — the user chose to keep the original look. Do not recolor them.

## Architecture conventions

- **`src/utils/routes.ts` is the single source for entry URLs** (`typeToRoute`, `buildEntryUrl`). Note detail routes use singular `note` (`/note/{slug}`), while the listing page is `/notes`. Never create per-component route maps — that bug produced 404s.
- **`src/utils/translations.ts` is the single translation source** (meta/nav/common/language/card/hero/featured/explore/latest/aboutPreview/footer/sections/system/skillMap). Never add inline translation dictionaries in components. `skillMap.hubs` feeds the about-page skill constellation (labels only — positions/links live in the page script).
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

## AI Skills (2026-09-01)

Two skills are installed for site work — sources in `Skill/`, discovery links in `.claude/skills/` (gitignored, never deployed):

- **lieflat-charts** (`Skill/lieflat-charts/`) — template-driven data-viz / HTML report generation. Load before drawing any chart or report (Mono-fallback palette, template-first rule, chart mode by default).
- **去AI味 / lieflat-less-ai-tone** (`Skill/去AI味 skill.md`) — whitelist-based removal of AI writing tells for en/zh/nl copy. After editing the source, re-copy it to `.claude/skills/lieflat-less-ai-tone/SKILL.md` to keep the registered copy in sync.
