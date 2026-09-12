# RrSuika Studio — Portfolio Site

The personal portfolio of **RrSuika Studio** — industrial design × embedded systems × creative making.
Live at **[rrsuika-studio.pages.dev](https://rrsuika-studio.pages.dev)** (Cloudflare Pages).

> 中文简介：这是 RrSuika Studio 的个人作品集网站，展示工业设计、嵌入式系统与创意制造作品，全站支持英、中、荷三语（中文位于 `/zh`，荷兰语位于 `/nl`）。技术栈为 Astro 7 纯静态构建 + 原生 CSS/JS，内容以 Markdown 内容集合管理，推送 `main` 分支即自动部署。

## What's inside

| Section  | Route      | Content                                        |
| :------- | :--------- | :--------------------------------------------- |
| Home     | `/`        | Featured work, latest activity (SYS.LOG), explore modules |
| Projects | `/projects` | Industrial / product design projects          |
| Lab      | `/lab`     | Hardware experiments (ESP32, 3D printing, electronics) |
| Art      | `/art`     | Illustrations, fashion design, food art, posters |
| Notes    | `/notes`   | Electronics self-study notes                   |
| About    | `/about`   | Profile, design process, capability matrix     |

Every page exists in English, Chinese (`/zh/...`) and Dutch (`/nl/...`).

## Tech stack

- **Astro 7** — fully static output, zero integrations, zero client-side frameworks
- **zod** — content collection schema (`src/content.config.ts`)
- Vanilla CSS design system (`src/styles/global.css`) + minimal vanilla JS
- **Cloudflare Pages** — auto-deploys on every push to `main` (no CI config in this repo)

## Repository structure

```text
src/
├── content/entries/     # All site content: one folder per entry (en.md + cn.md + nl.md + images)
├── pages/               # Routes: static pages, zh/nl mirrors, 2 dynamic detail routes, sitemap, 404
├── components/          # Reusable UI (Navbar, Footer, ProjectCard, ProjectDetail, home sections…)
├── styles/global.css    # The single design-token source of truth
├── utils/               # routes / i18n / translations / images helpers
└── layouts/Layout.astro # The single site layout (SEO, theme, background layers)
public/                  # Favicons, og-card.png, robots.txt…
scripts/og-card-gen.mjs  # Regenerates public/og-card.png (npm run og-card)
```

## Adding content

Each piece of content is a folder in `src/content/entries/` containing `en.md`, `cn.md`, `nl.md` and its images.
The URL slug is the folder name — **no code changes are needed for a new entry**.

> For AI collaborators: read [`AI_CONTEXT.md`](AI_CONTEXT.md) first — it is the project's architecture
> memory (structure, routes, content schema, design tokens, decisions, tech debt, and a
> "where to change what" index). [`CLAUDE.md`](CLAUDE.md) holds the hard conventions.

## Development

```bash
npm install     # Node >= 22.12
npm run dev     # http://localhost:4321
npm run build         # static output to dist/
npm run check         # TypeScript / Astro diagnostics
npm run optimize-art  # regenerate art-optimized lossless webp assets (art only)
```

## Deployment

Push to `main` → Cloudflare Pages builds and deploys automatically.

## Disclaimer

This is a personal portfolio. It is shared so others can read it and borrow ideas, not as professional advice.

- **No warranty.** The hardware notes, pinouts, wiring tables, firmware and structures documented here are personal experiments. They are not safety-reviewed and may contain mistakes. If you build from them, verify everything yourself first, especially supply voltage, current limits, polarity and heat. Low-voltage DC can still start a fire.
- **Parts and links go stale.** Part numbers and shop links reflect what I bought at the time. Listings change, revisions change, and the same link can point at a different board a month later.
- **Third-party material.** Datasheets, libraries, trademarked names and quoted figures belong to their owners. Where a project leaned on someone else's work, it is listed under Sources and credits below.
- **AI-assisted.** Some text, code and imagery were drafted with AI tools, then edited and verified by me. I only publish what I have run, measured or otherwise checked, but read it as my work with help, not as a reviewed source.

> 中文说明：本站是个人作品集，内容供参考与交流，不构成专业建议。硬件接线、固件与结构方案都是个人实验，未经安全审查，可能有错。若据此搭建，请先自行核对供电电压、电流上限、极性与发热。标注的购买链接会随时间失效或指向不同版本的板子。第三方数据手册、开源库与商标归各自作者所有。部分文字、代码与图像由 AI 工具起草，再由我修改并实测验证。

## Sources and credits

What this site and its projects depend on. This list grows as I add content.

### AI tools

AI assistants were used as drafting and engineering aids: scaffolding firmware, working through wiring tables and pinouts, and editing article text and this repository's documentation. Everything published here was reviewed, corrected and verified against a real bench before release. Where a measurement or a photo is shown, it came off my own bench or internet resources.

### Fonts

- **JetBrains Mono**, **Saira Condensed**, **VT323** — served via Google Fonts.
- **Smiley Sans Oblique (得意黑)** — self-hosted subsets under `public/fonts/dyh`.

### Project references

Per-lab material (datasheets, part-specific libraries such as Adafruit_SH110X / ESP32Encoder / U8g2, and vendor documentation) is credited inside the relevant lab entry.

## Links

- Website: [rrsuika-studio.pages.dev](https://rrsuika-studio.pages.dev)
- GitHub: [RrSuika](https://github.com/RrSuika)
- pixiv: [RrSuika Studio](https://www.pixiv.net/users/71884225)

© RrSuika Studio
