# AI_CONTEXT.md — RrSuika Studio Portfolio 项目上下文（AI 专用）

> **本文件是给未来 AI 助手的项目级长期记忆（Architecture & Design Memory）。**
> 接手任何新任务时：**先读本文件 → 再用快速索引（§11）定位文件 → 只读必要的源文件 → 动手。**
> 与 `CLAUDE.md` 的分工：CLAUDE.md 是**规则与政策**（必须遵守的约束），本文件是**架构事实与原因**（"现在怎么组织的、为什么、去哪改"）。`AGENTS.md` 只讲开发服务器的工作方式。
>
> - 最后更新：2026-08-31 v1.6（① 全站 URL 尾斜杠约定：`trailingSlash: "always"` + 所有链接/sitemap 带尾斜杠，修复 GSC"网页会自动重定向"告警，§9 决策 16；② 正文图片构建时解析：新增 `markdown-resolve-images.ts` Sätteri 插件接入 Astro 原生内容图片管线，删除 ProjectDetail 客户端图片修正，修复 Cloudflare 4xx 报告中的详情页图片 404，§9 决策 17）
> - 维护规则见 §12：代码若与本文件冲突，**以代码为准**，并更新本文件。
>
> **⚠️ v1.2 全量校正（旧段落中未逐行改写的“双语/仅 zh”表述，一律以下面为准）：**
> 站点现在是 **en（无前缀）/ zh（`/zh`）/ nl（`/nl`）三语**；`src/content/entries` 每个文件夹为 `en.md + cn.md + nl.md + 图片`；`src/pages` 有完整的 zh 与 nl 静态镜像；两个动态详情路由分别是 en 与“所有非 en 语言”。`translations.ts` 为 `{en, zh, nl}`。`package.json` 新增 `npm run check`（依赖 `@astrojs/check` + `typescript` devDeps）。`Layout` 的 prop 已改为 `alternateHrefs`（`undefined`=自动假设全部语言；空数组=显式无译文；`null`=省略 hreflang）。404 页的导航语言切换指向各语言首页。`ArtGallery.astro` 已删除，两个详情模板不再有 art 分支；`gallery` schema 字段暂时保留但当前无消费者。art 页面改为视觉冻结：允许代码优化，但视觉不得变化；`npm run optimize-art` 生成 `public/art-optimized/` 无损 webp（每张输出必须 ≥ 原文件 50%，否则保留原图），共享发现逻辑在 `src/utils/artImages.ts`。卡片与详情封面通过 `astro:assets` 输出 webp。

---

## 1. 项目概览

| 项       | 内容                                                                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 定位     | RrSuika Studio 个人作品集网站：工业设计 × 嵌入式系统 × 创意制造（Industrial Design × Embedded Systems × Creative Making）                                                                   |
| 技术栈   | **Astro 7.1.6**（纯静态输出）、**zod 4**（内容 schema）、TypeScript（`astro/tsconfigs/strict`）、原生 CSS + 少量原生 JS。**无任何集成**：无 React/Vue/Svelte、无 MDX、无 Tailwind、无适配器 |
| 站点     | https://rrsuika-studio.pages.dev （Cloudflare Pages，push 到 `main` 自动部署）                                                                                                              |
| 语言     | 英文为主（默认无前缀），中文为 `/zh` 前缀镜像。**手动 i18n**：不使用 Astro 内置 i18n routing（虽然 astro.config.mjs 里声明了 i18n 配置，实际路由全部手写，见 §3、§9）                       |
| 设计方向 | 复古科幻 CRT 终端 / 技术手册 HUD 风（retro-futurism）：暗色默认 + 亮色"蓝图纸"（Soviet technical manual）主题                                                                               |
| 阶段     | 生产运行中。架构稳定；art 页面**冻结**（用户决定）；首页 Hero 终端处于**临时隐藏实验**状态（§14，见 §10）                                                                                   |

**GitHub**：远程仓库 `RrS-Site`（账号 RrSuika；本地文件夹名为 MyPortfolio），主分支 `main`，工作树干净即代表生产状态。

---

## 2. 项目目录结构

```text
MyPortfolio/
├── CLAUDE.md                  # 项目规则/政策（设计系统、架构约定、SEO 约定、冻结声明）
├── AGENTS.md                  # 给 AI 的开发服务器工作方式（astro dev --background 等）
├── AI_CONTEXT.md              # ← 本文件
├── astro.config.mjs           # site URL + i18n 声明（详见 §8）
├── package.json               # scripts + 依赖（astro、zod）
├── tsconfig.json              # extends astro/tsconfigs/strict
├── README.md                  # 未修改的 Astro minimal 模板 README（见 §10）
├── 启动.bat                   # 一行：cmd /k npm run dev
├── .vscode/                   # 推荐 astro 插件 + "Development server" 启动配置
├── scripts/
│   └── og-card-gen.mjs        # 重新生成 public/og-card.png 的脚本（手动运行）
├── public/                    # 原样拷贝进站点的静态资源（不参与打包）
│   ├── favicon.ico / favicon-32x32.png / favicon-48x48.png
│   ├── og-card.png            # 默认 og:image（1200×630，由 scripts/og-card-gen.mjs 生成）
│   ├── robots.txt             # 全站允许；AI 训练爬虫禁 /art/ 与 /zh/art/
│   ├── google0d89945c0c4db4b1.html  # Google Search Console 验证文件
│   ├── icons/                 # 6 个软件 logo PNG（about 档案卡 SOFTWARE 行；来自 输入/，勿重命名）
│   └── art/fashion-design/    # 4 张 PNG 副本;为保留 alpha 透明通道直接以原图提供
├── src/
│   ├── content.config.ts      # ★ 内容 Schema 唯一事实来源（单一 collection `entries`）
│   ├── content/entries/       # ★ 全部内容：23 个条目文件夹，各含 en.md + cn.md + 图片
│   ├── layouts/
│   │   └── Layout.astro       # ★ 全站唯一布局（head/SEO/主题/背景层/全局脚本）
│   ├── pages/                 # 路由（静态页 + zh 镜像 + 2 个动态路由 + sitemap + 404）
│   │   ├── [type]/[...slug]/index.astro   # en 详情页动态路由
│   │   ├── [lang]/[type]/[slug]/index.astro  # zh 详情页动态路由
│   │   └── zh/                # 全部中文静态页镜像（独立文件，非模板共享）
│   ├── components/            # 11 个组件：全局 6 个 + home/ 5 个（见 §5）
│   ├── styles/
│   │   └── global.css         # ★ 设计系统唯一事实来源（14 个 section，955 行）
│   └── utils/                 # 4 个工具模块（见下表）
├── 输入/                      # ★ 用户给 AI 的"投递箱"：素材放这里，AI 读取后转写为站内内容（§12 规则 13）。已移出版本控制，永不提交/上传
├── node_modules/ .astro/ dist/  # 依赖/构建产物（gitignored，勿读勿改）
```

**`src/utils/` 四个工具模块（都读全了，是小型文件）：**

| 文件              | 职责                                                                                                                                      | 关键导出                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `routes.ts`       | **详情 URL 单一事实来源**                                                                                                                 | `typeToRoute`（projects→projects, lab→lab, **note→note 单数**, art→art）、`buildEntryUrl(entry, language)`                                                                                                                                                                                                                                                                                                                              |
| `i18n.ts`         | 语言判定与路径换算                                                                                                                        | `Language` 类型、`defaultLanguage="en"`、`getLanguageFromPath`（`/zh` 前缀判定）、`getLocalizedPath`（加/剥 `/zh` 前缀）、`findTranslation`（按 `translationKey`+`lang` 配对译文条目）                                                                                                                                                                                                                                                  |
| `translations.ts` | **全部文案唯一事实来源**（14 个 section：meta/nav/common/language/card/hero/featured/explore/latest/aboutPreview/footer/sections/system/skillMap） | `translations`（`{en, zh}`）、`getTranslations(language)`；用法 `const t = getTranslations(lang)` 后按路径取文案；`skillMap.hubs` 为 about 页技能星图数据（name + skills 数组，按 index 对应页面脚本里的坐标/连线）                                                                                                                                                                                              |
| `images.ts`       | 内容图片解析                                                                                                                              | `getProjectImage(id, filename)`：`import.meta.glob(eager)` 扫描 entries 图片；**特例**：`fashion-design` 的 PNG 返回 `/art/fashion-design/{file}`（走 public 保留透明通道）。**注意**：Astro 图片 glob 运行时返回的是 ImageMetadata 对象（`.src` 才是 URL），`getProjectImage` 返回原始值（ArtGallery 冻结区与详情页模板自行归一化）；渲染原生 `<img>` 时用 `getProjectImageUrl`（归一化为 URL 字符串，ProjectCard/ProjectDetail 在用） |
| `markdown-resolve-images.ts` | 正文图片构建时解析（Sätteri raw 节点插件，§9 决策 17） | `resolveEntryImages`：把正文原始 HTML 里 `<img src="./…">` 重写为 `__ASTRO_IMAGE_` 标记并注册进 `localImagePaths`，由 Astro 原生管线在渲染期解析为哈希 URL。经 `astro.config.mjs` 的 `markdown.processor: satteri({ hastPlugins })` 注册。⚠️ 勿在插件内用 `images.ts` 的 glob **值**（配置 bundle 无 astro:assets 处理，`.src` 是原始 `/src/content/...` 路径，生产 404）；只可用 lazy glob 的**键**做存在性检查 |

**在哪里改什么：**

- 新增页面 → `src/pages/`（en）+ `src/pages/zh/`（zh 镜像，两语言都要建）
- 新增组件 → `src/components/`（页面专用放对应页面内联或 `home/` 子目录）
- 修改全局样式/token → `src/styles/global.css`（唯一全局样式文件，遵守 fidelity 政策 §6）
- 新增内容 → `src/content/entries/`（§4）
- 改 Schema → `src/content.config.ts`
- 改路由映射 → `src/utils/routes.ts`（**不要**在组件里自建映射，见 §10）
- 改文案 → `src/utils/translations.ts`
- 站点级配置 → `astro.config.mjs` / `package.json`

---

## 3. 页面与路由架构

### 3.1 路由总表

| 路由                                        | 文件                                                   | 说明                                                              |
| ------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------- |
| `/`                                         | `src/pages/index.astro`                                | 首页（en）                                                        |
| `/zh`                                       | `src/pages/zh/index.astro`                             | 首页（zh，独立文件）                                              |
| `/projects` `/lab` `/notes` `/art` `/about` | `src/pages/{projects,lab,notes,art,about}/index.astro` | 五个列表/静态页（en）                                             |
| `/zh/projects` … `/zh/about`                | `src/pages/zh/{...}/index.astro`                       | 五个 zh 镜像（独立文件）                                          |
| `/{type}/{slug}`                            | `src/pages/[type]/[...slug]/index.astro`               | **en 详情页**：`/projects/{slug}`、`/lab/{slug}`、`/note/{slug}`  |
| `/zh/{type}/{slug}`                         | `src/pages/[lang]/[type]/[slug]/index.astro`           | **zh 详情页**（`lang` 参数**硬编码为 `"zh"`**，此文件只服务中文） |
| `/sitemap.xml`                              | `src/pages/sitemap.xml.ts`                             | 手写 XML 端点                                                     |
| `*`（未命中）                               | `src/pages/404.astro`                                  | 输出 `/404.html`，Cloudflare Pages 兜底所有未匹配路由             |

### 3.2 关键路由规则（容易踩坑）

1. **`note` 详情是单数 `/note/{slug}`，列表是复数 `/notes`**。历史上一份发散的路由映射生成过 `/notes/{slug}` 造成 404;`src/utils/routes.ts` 顶部注释专门记录此教训，所有链接必须经 `buildEntryUrl`/`typeToRoute`。
2. **两个动态路由文件各管一种语言，互不重定向**：en 路由用 `[...slug]` rest 参数（当前只用到单段，rest 是为了兼容未来多段 id）；zh 路由的 `[lang]` 段实际只会是 `"zh"`（en 路径由另一个文件接管，避免了 `/en/...` 前缀）。
3. **art 类型没有详情页**：两个动态路由的 `getStaticPaths` 都过滤 `entry.data.type !== "art"`，sitemap 也排除 art。art 只在 `/art` 列表页以自扫描方式展示（见 §7.7）。
4. 详情页 `getStaticPaths` 的核心逻辑（两个文件对称）：

```js
const entries = await getCollection("entries");
// en 路由: filter lang==="en"；zh 路由: filter lang==="zh"；两者都排除 type==="art"
const slug = entry.id.split("/")[0]; // 文件夹名即 slug
const translation = findTranslation(entries, entry, "zh" | "en");
// props: { project, projectId: slug, translation }
```

5. 详情页模板里存在 `project.data.type === "art" ? <ArtGallery/> : <ProjectDetail/>` 分支，但 art 已被过滤，**该分支实际不可达**（防御性代码）。渲染永远走 `<ProjectDetail project projectId Content translation />`。
6. 详情页内嵌 **TechArticle JSON-LD**（两张模板里各有一份，不在组件内）：`datePublished`/`dateModified` 都用 `data.date.toISOString()`（完整 ISO-8601 带时区；无独立修改日期，回退发布日期）；`translationOfWork` 嵌套对方语言文章的元数据（有译文时）。
7. `sitemap.xml.ts`：6 个静态路径 × 3 语言（en/zh/nl）+ 每个非 art 条目按其 `lang` 生成 URL（`/{type}/{slug}/` 或 `/zh|nl/{type}/{slug}/`），`lastmod` = 条目 `date` 的 YYYY-MM-DD，按字典序排序。**所有 URL 带尾斜杠**（§9 决策 17）。
8. `404.astro`：无语言判定，固定双语混合内容（三个按钮：`/`、`/zh`、`/projects`），`noIndex`。

### 3.3 新增内容类型 / 页面时需要动的地方

- 新**条目**（不新增类型）：只需加内容文件（§4），路由自动生成。
- 新**type 枚举值**（很少需要，代价高）：`src/content.config.ts` 的 enum → `src/utils/routes.ts` 的 `typeToRoute` → 两个动态路由的过滤逻辑 → `sitemap.xml.ts` → 相应列表页 →（zh 镜像同步）。
- 新**静态页面**：en 文件 + zh 镜像文件两个都要建，Layout 传 `alternateHref`（见 §5.1）。

---

## 4. 内容管理架构

### 4.1 单一 Content Collection：`entries`

- 定义：`src/content.config.ts`（55 行，全文件即 schema）。
- Loader：`glob({ pattern: "**/*.md", base: "./src/content/entries" })`。
- **URL slug = 条目文件夹名**（`entry.id` 形如 `{文件夹名}/en`，代码里 `entry.id.split("/")[0]` 取 slug）。
- 每个条目文件夹 = `en.md` + `cn.md` + 同目录图片。**23/23 个文件夹都有双语言文件，无缺失。**

### 4.2 Schema 全部字段（`src/content.config.ts` 逐字为准）

| 字段             | 类型                                     | 必填 | 作用 / 谁消费                                                                                                                                                                                                               |
| ---------------- | ---------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`          | string                                   | ✓    | 标题；列表卡片、详情 hero、JSON-LD、`<title>`                                                                                                                                                                               |
| `date`           | `z.coerce.date()`                        | ✓    | 发布日期；排序、卡片/详情显示、sitemap lastmod、JSON-LD（`.toISOString()`）                                                                                                                                                 |
| `description`    | string                                   | 否   | 摘要；卡片、详情 hero、`<meta description>`、JSON-LD                                                                                                                                                                        |
| `cover`          | **string**（无 `image()` 校验）          | 否   | 封面图**裸文件名**（如 `cover.png`、`01-setup.png`），相对条目文件夹；由 `getProjectImage(slug, cover)` 解析。18 个条目有，5 个 note 没有（button-debounce、isolation-gpio、power-supply、signal-amplifier、signal-filter） |
| `type`           | enum `["projects","lab","note","art"]`   | ✓    | 决定列表页归属与详情 URL 段。**注意是 `projects` 不是 `work`**；`gallery` 不是 type 而是字段                                                                                                                                |
| `category`       | string                                   | 否   | 细分分类；卡片底栏与详情 info 格                                                                                                                                                                                            |
| `collaboration`  | string                                   | 否   | 非空即显示 ProjectCard 的 TEAM badge（`/TEAMWORK/` 或 `/协作/`）。当前仅 `zoem-bike-bakfiets` 有值 `team`                                                                                                                   |
| `tags`           | string[]                                 | 否   | 卡片标签、列表页筛选 chips（`#{tag}` 显示，3n 循环红/黄/青描边）                                                                                                                                                            |
| `tools`          | string[]                                 | 否   | 详情页 info 四格之一                                                                                                                                                                                                        |
| `featured`       | boolean                                  | 否   | 目前**不参与**任何自动筛选（首页精选用硬编码 `featuredKeys`，见 §7.2）；保留字段                                                                                                                                            |
| `gallery`        | array of `{file: string, title: string}` | 否   | 仅 4 个 art 条目使用（fashion-design 4 项、food-art 6 项、illustrations 8 项、product-posters 7 项），由 **ArtGallery 组件（冻结）** 消费                                                                                   |
| `lang`           | enum `["en","zh"]`                       | ✓    | 条目的语言，决定挂到哪个语言的路由/列表                                                                                                                                                                                     |
| `translationKey` | string                                   | ✓    | en/cn 配对键（通常=文件夹名；**唯一例外** zoem-bike 文件夹用 `zoem-bike-cargo-box`）                                                                                                                                        |

### 4.3 条目清单（23 个，按 type 统计）

| type       | 数量 | 条目                                                                                                                                                                                                                                                                         |
| ---------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lab`      | 10   | 3d-printing-abs-material-test、esp32-ec11-encoder-oled、esp32-ec11-stepper-motor、esp32-inmp441-noise-monitor、esp32-rgbww-color-wheel、esp32-rgbww-fcob-comm、esp32-serial-test、esp32-wifi-led-brightness-control、studio-electrical-optimization、tinkercad-3ch-led-strip |
| `note`     | 6    | button-debounce-pullup-pulldown、electronics-fundamentals-notes、isolation-gpio-driver-mosfet-bjt-relay-optocoupler、power-supply-ldo-buck-boost、signal-amplifier-opamp-comparator、signal-filter-rc-high-low-pass                                                          |
| `art`      | 4    | fashion-design、food-art、illustrations、product-posters                                                                                                                                                                                                                     |
| `projects` | 3    | body-armor-protective-vest、light-diffusion-test-platform、zoem-bike-bakfiets                                                                                                                                                                                                |

### 4.4 en/cn 配对与 frontmatter 惯例

- **两语言相同**：`type`、`date`、`cover`、`featured`、`translationKey`、`collaboration`、`gallery[].file`。
- **两语言不同**：`title`、`description`、`category`、`lang`；`tags`/`tools` 多数翻译（个别条目两语言完全相同，如 esp32-rgbww-color-wheel 的 tags）；art 条目 `gallery[].title` 各自翻译。
- 图片路径：frontmatter 里写**裸文件名**（`cover: cover.png`）；正文 markdown 里用 `./` 前缀（`![...](./xxx.png)`）。
- 图片命名惯例：专用封面 `cover.png`（7 个文件夹）；`01-描述.png` 编号+描述（多数）；纯数字（studio-electrical 的 1–16.png）；扩展名 .png/.jpg/.jpeg 混用属正常。

### 4.5 如何新增内容（Step-by-step）

**新增项目（projects）/ 实验室记录（lab）：**

1. 建文件夹 `src/content/entries/{kebab-case-slug}/`（slug 即 URL，双语言共用）。
2. 写 `en.md`（`lang: en`）与 `cn.md`（`lang: zh`），两文件 `translationKey` 相同（通常=文件夹名）。
3. frontmatter 必填：`title`、`date`、`type`、`lang`、`translationKey`；建议：`description`、`category`、`tags`、`tools`、`cover`。
4. 图片放同文件夹，frontmatter 引用裸文件名。
5. 完成;路由、列表页、sitemap、首页 SYS.LOG 全部自动生效（首页精选除外，需手动加 `featuredKeys`，§7.2）。

**新增学习笔记（note）：** 同上，`type: note`。注意封面可选（5 个老笔记就没有 cover），TOC 对 note 取 h2 级别标题（§7.4）。

**新增艺术条目（art）：** 目前 art 条目 4 个已与冻结的 `/art` 页面硬编码分类绑定（§7.7、§10），**新增 art 条目需要先与用户确认**;冻结政策只允许改 SEO 相关 frontmatter。

> 素材来源：用户可能把图片/文档放在 `输入/` 里让 AI 转写（见 §12 规则 13）。

---

## 5. Component / Layout 架构

### 5.1 Layout.astro（全站唯一布局）

Props（都在 `src/layouts/Layout.astro` 顶部 interface）：

| Prop             | 语义                                                                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title?`         | `<title>`/og:title，默认 `"RrSuika Studio"`                                                                                                          |
| `description?`   | 缺省回退 `t.meta.description`（按语言）                                                                                                              |
| `ogImage?`       | string 或 null；缺省回退 `/og-card.png`                                                                                                              |
| `alternateHref?` | **`undefined` = 假定对方语言页面存在**，自动用 `getLocalizedPath` 推导 hreflang；**`null` = 不输出 hreflang**（页面无译文时，详情页无译文时传 null） |
| `noIndex?`       | 输出 `robots noindex`（404 页用）                                                                                                                    |

Layout 负责：head 全套（主题守卫内联脚本→防闪烁、charset/viewport/color-scheme/theme-color×2、Google Fonts JetBrains Mono 400/700/800/900、favicon、canonical、hreflang+x-default、og:_/twitter:_、**JSON-LD WebSite** `{name:"RrSuika Studio", url, inLanguage:["en","zh"]}`）；body 结构（skip-link、`#mobile-notice` 移动端提示、`#neural-canvas` 粒子画布、`<Navbar/>` + `<main#main-content/>`(slot) + `<Footer/>`、`<ScrollMeter/>`、`#crt-overlay` + `#tube-vignette` 背景层、粒子/主题切换/mobile-notice 三个脚本）。`global.css` 在此以 frontmatter import 引入（唯一引入点）。

### 5.2 组件清单（共 11 个）与复用指引

**全局复用（在 Layout 内，全站生效）：**

| 组件                | 职责                                                                                                                                                                                                                           | 备注                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `Navbar.astro`      | sticky 顶栏：品牌三色点、6 个导航链接（`t.nav.*`，href 用 `getLocalizedPath`）、**语言切换=镜像链接**（详情页先查译文是否存在，无则拦截弹 toast，见 §7.1）、主题切换按钮（调 `window.__toggleTheme`）、`#clock` 时钟、警告条纹 | **无汉堡菜单、无当前页高亮（无 aria-current）**；≤1000px 变纵向堆叠 |
| `Footer.astro`      | 页脚：三色条纹+状态行、身份区块、链接（GitHub `RrSuika`、email `ranrsuika@gmail.com`、pixiv `users/71884225`、QQ、Discord）、条形码、版权                                                                                      | 硬编码 `ROTTERDAM // NL`、`2026.V5.5`                               |
| `ScrollMeter.astro` | 右缘 LED 滚动进度条（10 段）+ 回顶/回底按钮 + 轨道拖拽滚动                                                                                                                                                                     | rAF 节流、`aria-hidden` 计量表、≤768px 隐藏                         |

**列表/详情复用：**

| 组件                  | Props                                                  | 职责                                                                                                                                                                                                                          | 被谁用                                                                             |
| --------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `ProjectCard.astro`   | `project`（必填）                                      | 条目卡片（整卡是 `<a>`）：PRJ_NODE//TYPE 头、cover+IMAGE_STREAM 角标、**TEAM badge（collaboration 驱动）**、title/description/tags、category+date 底栏                                                                        | projects/lab 列表页 ×4 + 首页 FeaturedProjects。链接经 `buildEntryUrl`（单一来源） |
| `ProjectDetail.astro` | `project`、`projectId`、`Content` 必填；`translation?` | 详情主体：hero、info 四格（年份/类型/分类/工具）、tags、正文 `<Content/>`、**侧边 TOC**、翻译不可用提示；客户端 JS：图片全屏灯箱、process 滚动轨道、TOC 生成（note 取 h2，其余取 h1，剥数字编号前缀）。正文 `./` 图片的解析已移到构建期（`markdown-resolve-images.ts`），组件内不再有图片路径修正 | 两张详情页模板                                                                     |
| `ArtGallery.astro`    | `project`、`projectId`                                 | **冻结**：art 条目详情展示（masonry 三列 + lightbox），消费 `gallery` 字段                                                                                                                                                    | 详情模板 art 分支（**实际不可达**，见 §3.2-5）                                     |

**首页专用（`src/components/home/`，index.astro、zh/index.astro、nl/index.astro 用）。页面区块顺序：Hero → FeaturedProjects → ExploreLinks → AboutPreview → LatestUpdates（2026-08-16 起 AboutPreview 与 LatestUpdates 互换）**：

| 组件                     | 职责                                                                                                                                                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Hero.astro`             | 首屏：左列大标题（Latin 保留 display tracking）+ 描述 + CTA；右侧 SYS.BOOT 打字机终端（**被 global.css §14 隐藏，元素完好**）                                                                                          |
| `FeaturedProjects.astro` | 精选区块：接收 `projects` 与 `totalCount`，渲染 3 张 ProjectCard（编号 01/02/03 叠加）                                                                                                                                 |
| `LatestUpdates.astro`    | SYS.LOG 面板：最新条目列表，**正确使用 `buildEntryUrl`** 生成链接                                                                                                                                                      |
| `ExploreLinks.astro`     | 4 张模块卡（PROJECTS/LAB/ART/NOTES）链到各列表页                                                                                                                                                                       |
| `AboutPreview.astro`     | OPERATOR 身份预览面板：id 块（OPERATOR/名字/状态）右侧**与 RrSuika Studio 齐平的 ACCESS FULL DOSSIER 链接**（24px `--text-scale-article-h3`，指向 about 页）；底部 meta 行（位置/领域）。无描述文字（2026-08-16 移除） |

**改 UI 的查找顺序：** 全局层（Navbar/Footer/ScrollMeter/背景）→ 组件文件；列表卡片 → `ProjectCard.astro`；详情 → `ProjectDetail.astro`；首页区块 → `home/` 对应组件；文案 → `translations.ts`；颜色/间距 → `global.css` token。**不要新写一套已有组件能做的事**（例：列表筛选已有 `.tag-bar`/`.tag-chip` 共享实现，§7.3）。

---

## 6. 样式与视觉设计系统

**唯一事实来源：`src/styles/global.css`（955 行，14 个 section）。** 文件头含两条铁律：

1. **BREAKPOINT REGISTRY**：断点字面量清单 `1100 / 1000 / 900 / 800 / 768 / 769 / 700 / 600 / 500`（媒体查询里不能引用 CSS 变量，所以全局与组件里保持字面量，新增断点要与清单同步）。
2. **FIDELITY POLICY**：所有 token 值 1:1 复制自清理前原样式；**替换字面量时，仅当 token 在两主题值相同才允许**，否则保留字面量；**禁止发明新颜色、"harmonize"、重着色**。

### 6.1 主题契约

- `data-theme` 属性挂在 `<html>` 上（`"dark"` | `"light"`）；`localStorage["rrsuika-theme"]` 持久化；切换入口 `window.__toggleTheme`（Layout 脚本）+ Navbar 按钮。
- **首次访问默认 dark**（不跟随 `prefers-color-scheme`）；head 内联守卫脚本在任何绘制前设好 `data-theme`，配套 `html:not([data-theme]) body { visibility: hidden }` 防闪烁。
- 暗色 token 定义在 `:root`（§1），亮色覆盖在 `:root[data-theme="light"]`（§2，只覆盖值不同的 token；排版/布局/圆角/缓动 token 两主题同值只定义一次）。

### 6.2 核心设计 token（两主题值）

**颜色（Dark / Light）：**

| Token                                                                         | Dark                                                                                  | Light                                                                      |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `--bg`                                                                        | `#07070d`                                                                             | `#f0ebe0`                                                                  |
| `--panel` / `--panel-light`                                                   | `#0e0e18` / `#161625`                                                                 | `#e5dfd3` / `#f8f4ec`                                                      |
| `--text` / `--text-bright` / `--text-soft` / `--text-tertiary` / `--text-dim` | `#e8e6e0` / `#ffffff` / `#dddddd` / `#999999` / `#777777`                             | `#1a1815` / `#1a1a1a` / `#444444` / `#666666` / `#555555`                  |
| `--on-accent`                                                                 | `#000000`                                                                             | `#ffffff`                                                                  |
| `--border` / `--border-accent` / `--border-strong` / `--border-divider`       | `rgba(255,255,255,.10)` / `rgba(224,148,58,.25)` / `rgba(255,255,255,.2)` / `#333333` | `rgba(0,0,0,.08)` / `rgba(176,112,32,.25)` / `rgba(0,0,0,.15)` / `#cccccc` |
| `--accent`（真空管琥珀）/ `--accent-glow` / `--accent-deep`                   | `#e8943a` / `#f0b860` / `#b87020`                                                     | `#c07020` / `#d08030` / `#8b4513`                                          |
| `--stripe-red` / `--stripe-yellow` / `--stripe-teal`                          | `#e04040` / `#f0c040` / `#3ab8d8`                                                     | `#c03030` / `#b89020` / `#1a8090`                                          |
| `--terminal-green`（磷光绿）                                                  | `#3af04f`                                                                             | `#1a7030`                                                                  |
| `--retro-red` / `--retro-yellow` / `--retro-cyan`（复古标题色）               | `#d65a4a` / `#f6c85f` / `#5edfff`                                                     | `#b84a3a` / `#c49a2a` / `#3a9ebf`                                          |
| `--code-bg`                                                                   | `#161625`                                                                             | `#f5f5f5`                                                                  |
| 表面系列 `--surface-*`、`--paper`（两主题同值 `#e8e3da`）等                   | 见 global.css §1/§2                                                                   |                                                                            |

**字体：** `--font-mono: "JetBrains Mono", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", "Courier New", monospace`；`--font-body: Arial, Helvetica, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`（JetBrains Mono 由 Layout 从 Google Fonts 加载 400/700/800/900）。

**字号**（`--text-scale-*`，暗色定义亮色复用）：hero `clamp(80px,10vw,110px)`、display `clamp(36px,5vw,64px)`、h1 64、h2 48、h3 34、article-h1 42、article-h2 32、article-h3 24、body 18、sm 15、xs 13 等。
**字距**（`--tracking-*`）：hero -6px、display -3px、tight -2px、slight -1px、micro 0.5px、label 1px、wider 1.5px、tag 2px、wide 3px。
**布局**：`--container-main: 1320px`、`--container-article: 1150px`、`--section-gap: 120px`、`--grid-gap: 30px` 等。
**圆角**：`--radius-xs 2px` … `--radius-lg 12px`、`--radius-cover 24px`、`--radius-pill 999px`。
**缓动**：`--ease-out`、`--ease-in-out`、弹簧族 `--spring-gentle/-snappy/-bounce/-expressive`、`--ease-warmup`（动画**时长**未 token 化，全部字面量）。
**阴影**：无通用 shadow token 族，仅亮色 `--shadow-paper`；其余阴影为组件内字面量。

### 6.3 背景层（§10）

`#neural-canvas` 粒子画布（fixed，dark `opacity: 0.25`，light `opacity: 0.1 + filter: invert(1)`，<900px 视口粒子数降为 70）+ hex grid（`body::before` 三向 linear-gradient，`52px 90px`）+ noise（`body::after` SVG feTurbulence data-URI）+ scanlines（`#crt-overlay`，dark `opacity: 0.28` / light `0.08`，`mix-blend-mode: screen`）+ amber vignette（`#tube-vignette`，`opacity: 0.6` / `0.4`）。粒子脚本在 Layout.astro 内（参数区：`CONNECTION_DIST = 140`、`mouse.radius = 140`、`shadowBlur = 8`、粒子色 55% `rgba(255,95,31,.9)` / 45% `rgba(0,176,255,.9)`）。

### 6.4 其他全局约定

- **§13 CJK**：`html[lang="zh"] h1/h2/h3 { letter-spacing: 0; line-height: 1.2; }`，但 `.hero h1` 是拉丁文本，恢复 `tracking-hero`/`line-height: 0.9`。
- **§14 Hero 终端隐藏**：`.hero .terminal { display: none; }`;恢复方法就是删掉这条规则（注释写明"无需修改任何其他文件"）。
- **滚动条全站完全隐藏**（`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`）;用户偏好的原始行为，不要"修复"。
- **旧调色板字面量**（刻意保留，勿重着色）：Navbar 警告条纹 `#ff5f1f`、品牌三色点 `#ff3333/#ffd400/#00b0ff`、Hero 终端 `rgba(255,95,31,…)`、亮色绿 `#00703c`（Footer/AboutPreview/LatestUpdates/about 页）、ScrollMeter 亮色深绿 `#145a28`、§11 里 art gallery 冻结样式（注释 "frozen: kept verbatim"）。
- 通用模式：`.tag-chip`（pill 筛选按钮，§12 共享实现）、`.data-tag`（mono 大写数据标签）、`.skip-link`、hover 用 `--ease-out`、按下 `--spring-snappy`；入场动画 `pageIn`/`cardIn` + 各网格容器 nth-child stagger（§8）；`prefers-reduced-motion` 全局降级（§9，并隐藏粒子画布）。
- 页面局部样式：写在各自 `.astro` 的 `<style>` 内（自动作用域）；少数 `is:global`（如 ProjectDetail 的 article 排版）。**全局设计系统级 CSS 只应进 global.css。**

---

## 7. 功能与交互架构

| 功能                               | 实现位置                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **导航 + 语言切换 + 主题切换**     | `Navbar.astro`。语言切换是**镜像链接**（服务端 `getLocalizedPath` 生成 href），不是 JS 切换；详情页上先查译文条目（`getCollection` + `typeToRoute` 反查）决定目标，无译文时 JS `preventDefault` 并弹 `#language-toast`（移出 nav 追加到 body 规避 stacking context）。主题按钮 `onclick="window.__toggleTheme?.()"`，函数定义在 Layout 脚本                                                                                                                                                                                                                                                                                                                                        |
| **首页精选**                       | `featuredKeys` **硬编码在三个首页文件的 frontmatter**（en/zh/nl，不在组件里）：`["body-armor-protective-vest", "zoem-bike-cargo-box", "light-diffusion-test-platform"]`（zoem 用 translationKey 而非文件夹名）。**列表顺序 = 卡片展示顺序**（2026-08-16 起用 `map`+`find` 按 curated 顺序取条目；此前 filter 按 collection 顺序，改列表顺序无效）。改精选=改这三个页面                                                                                                                                                                                                                                                                                                             |
| **SYS.LOG 最近活动**               | 首页 frontmatter：过滤 `type !== "art"`（art 无详情页，避免 404）→ 按日期倒序 → 取 3 条 → 传 `<LatestUpdates/>`（内部用 `buildEntryUrl`）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **列表筛选（projects/lab/notes）** | 三个列表页各自的 `.tag-bar`/`.tag-chip`（样式在 global.css §12 共享）；页面 frontmatter 硬编码 `filterTags`（en/zh 各一套，内容不同）；客户端 JS 点击 chip 按 `data-tags` 显示/隐藏。projects/lab 用 ProjectCard 网格，notes 是自绘 `a.note-row` 列表（只显示前 3 个 tag，链接用 `getLocalizedPath("/note", lang)` + slug）                                                                                                                                                                                                                                                                                                                                                        |
| **详情页交互**                     | `ProjectDetail.astro` 脚本：点击图片全屏灯箱、`#process-scroll` 无缝滚动轨道（可拖拽/悬停暂停）、侧边 TOC（锚点自动补 id、剥数字编号前缀；note 取 h2 标题级别）。正文图片 src 在构建期由 `markdown-resolve-images.ts` 解析，无客户端修正                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **ScrollMeter**                    | `ScrollMeter.astro`：scroll 监听（rAF 节流）→ 10 段 LED + 百分比文本；回顶/回底平滑滚动；轨道 `pointer` 拖拽滚动；≤768px 隐藏；`prefers-reduced-motion` 关闭过渡                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Hero 打字机**                    | `home/Hero.astro`：SYS.BOOT 启动序列 + 循环 live logs（终端整体被 global.css §14 隐藏）；左列文字逐字打字                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **art 页（冻结）**                 | `art/index.astro` + `zh/art/index.astro` 各自独立实现：`import.meta.glob(eager)` 扫描 4 个 art 条目文件夹图片（排除 `cover.png`）、硬编码 4 分类（CATEGORIES）+ 按语言作品名（TITLE_MAP）、每行无缝跑马灯（悬停暂停、拖拽 1.5×、点击 lightbox、Esc/←/→/触摸滑动）。**两语言文件实现有差异**（en 用 opacity 动画，zh 用 display 切换）                                                                                                                                                                                                                                                                                                                                              |
| **about 页**                       | 三个 about 页（en/zh/nl，独立文件）：design-process 站台自动轮播（IntersectionObserver 激活，1.5s/步）、capability matrix canvas（8 个绘制函数：3D 环面/CMF 色块/示波器/波纹/DNA 螺旋/矿石传送带/像素网格/软件终端，4.2s 轮播，`define:vars` 注入翻译）、**技能星图**（2026-09-01 重做，用户要求 Obsidian 关系图谱式效果：lieflat-charts B2 big-force 语法，ECharts 力导向网络——11 个技能大点（灰阶，亮度随连接数）+ 技能小点绕行 + 大点间骨干连线，亮度随连接数递增，定时轻微漂移，拖拽回弹、hover 邻接聚焦、点击空白重播、缩放平移；echarts@6 CDN `is:inline defer` 加载 + 轮询 boot；数据标签经 `t.skillMap` 三语注入，坐标/连线/大小在页面脚本）、ANNEX 打字机彩蛋。**dossier 卡**（PERSONNEL_DOSSIER // ABOUT_MODULE）：左列 identity（OPERATOR/名字/角色 + LOCATION/FIELD/INTERESTS mini 行;2026-08-16 平衡左右列移到左侧），右列 data 行（CURRENT_FOCUS/SKILLS 芯片/SOFTWARE 图标）。软件图标在 `public/icons/`（6 个灰度 logo），按明暗极性打 `pol-dark`/`pol-light` 类：暗主题 `pol-dark` 加 `invert(0.9)`，亮主题 `pol-light` 加 `brightness(0.3)`（2026-08-16 新增） |
| **背景粒子**                       | Layout.astro 脚本（参数见 §6.3）；`prefers-reduced-motion` 时隐藏                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **移动端提示**                     | `#mobile-notice`：sessionStorage `"rrsuika-mobile-notice"` 记忆关闭；桌面（≥769px）隐藏                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **结构化数据**                     | Layout head：`WebSite`（每页）；about 页：`Person`（name "RrSuika Studio"、alternateName `["RrS"]`、sameAs GitHub `RrSuika` + pixiv、Rotterdam NL）；详情模板：`TechArticle`（含 `translationOfWork`，§3.2-6）                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

---

## 8. 配置与部署

- **`astro.config.mjs`**（约 25 行）：`site: "https://rrsuika-studio.pages.dev"`；`trailingSlash: "always"`（全站 URL 尾斜杠约定，§9 决策 16）；`markdown.processor: satteri({ hastPlugins: [resolveEntryImages] })`（正文图片构建时解析，§9 决策 17，`satteri` 来自 `@astrojs/markdown-satteri`——Astro 7 默认 Markdown 处理器，已显式写入 dependencies）；`i18n: { locales: ["en","zh","nl"], defaultLocale: "en", routing: { prefixDefaultLocale: false } }`（**声明而已;实际路由全部手写**，Astro i18n routing 未被使用）；无 integrations、无 compressHTML 覆盖、无 redirects。
- **`package.json`**：scripts `dev`/`build`/`preview`/`astro`（均标准 Astro）；dependencies 仅 `astro ^7.1.6`、`zod ^4.4.3`；无 devDependencies；`engines: node >= 22.12.0`。
- **`tsconfig.json`**：`extends "astro/tsconfigs/strict"`，exclude `dist`。
- **开发**：`npm run dev`（localhost:4321）或根目录 `启动.bat`；按 AGENTS.md 约定，AI 应用 `astro dev --background` 启动、`astro dev stop/status/logs` 管理。
- **构建**：`npm run build` → 输出 `dist/`（纯静态，无 SSR/适配器）。
- **部署**：Cloudflare Pages Git 集成，push `main` 自动构建部署；**仓库内无 CI 配置**（无 `.github/workflows`、无 `wrangler.toml`、无 `_headers`/`_redirects`），构建命令/输出目录配置在 Cloudflare 控制台。
- **环境变量**：**无**。项目不需要任何 .env（.gitignore 含 `.env`/`.env.production` 仅防御性条目）。
- **SEO 静态文件**：`public/robots.txt`（`User-agent: *` 全允许；11 个 AI 训练爬虫 GPTBot/ChatGPT-User/ClaudeBot/Claude-Web/anthropic-ai/Google-Extended/CCBot/PerplexityBot/Meta-ExternalAgent/cohere-ai/Bytespider 被 `Disallow: /art/` 和 `/zh/art/`；Googlebot 不受影响；Sitemap 指向站点根）；`public/google0d8…b1.html` 是 Search Console 验证文件，勿删。
- **OG 分享卡**：`public/og-card.png`（1200×630）为全站默认 `og:image` 回退（Layout 逻辑：`ogImage ?? "/og-card.png"`）；修改需重跑 `node scripts/og-card-gen.mjs`（内联 SVG 硬编码→sharp 渲染）。**注意**：脚本 `import sharp` 依赖的是 astro 的传递依赖（未在 package.json 声明、无 npm script）;脆弱点见 §10。

---

## 9. 重要设计决策（"为什么现在是这样"）

1. **Astro + 零集成**：站点以静态内容为主、无重交互，追求构建简单与极致静态性能；不需要框架岛屿。所有交互用少量原生 JS 内联实现。
2. **单一 Content Collection（entries）+ 多 `type` 字段**：全部内容共用一份 schema 和一套动态路由，新增条目零代码。`type` 枚举 `projects/lab/note/art` 按内容性质分类（作品集/实验记录/学习笔记/艺术），**不是** `work`;不要按老文档或直觉改名。`gallery` 是字段不是 type。
3. **手动 i18n / 每语言独立页面文件**：en 与 zh 页面是**两套独立文件**而非共享模板，因为 about/art 页两语言差异极大（脚本、动画参数、样式覆盖都不同）。代价是双维护;这是被接受的设计，不是缺陷（新静态页必须建 zh 镜像）。
4. **双动态路由分工**（`[type]/[...slug]` 管 en、`[lang]/[type]/[slug]` 管 zh 且 lang 硬编码 "zh"）：让 en 保持无前缀、zh 有 `/zh` 前缀，两个文件对称可读。`[...slug]` rest 是前瞻设计（当前只用到单段）。
5. **`/note/{slug}` 单数 vs `/notes` 列表**：历史上出现过分叉的映射生成 `/notes/{slug}` 产生 404；此后 `routes.ts` 被定为链接生成的单一事实来源（见 §10 的残留偏差）。
6. **首页精选用硬编码 `featuredKeys`**：用户偏好人工策展（"featured" 字段反而只作声明）；改精选要动两个首页文件的前端代码。
7. **SYS.LOG 排除 art**：art 无详情页，排除避免首页链接到 404;任何"最新内容"类列表都应遵守此过滤。
8. **设计系统清理时的 FIDELITY POLICY**：token 值 1:1 复制原样式，宁可保留字面量也不"统一"颜色；旧调色板（`#ff5f1f` 警告橙、三原色点、`#00703c`/`#145a28` 旧绿）是用户选择保留的原始视觉，**不要重着色**（CLAUDE.md 同款规则）。
9. **Hero 终端临时隐藏（§14）**：用户评估无终端首页是否更清爽的实验；元素完好，恢复=删一条 CSS 规则。
10. **art 页面冻结**：用户决定不再改动 art 列表页、ArtGallery、gallery schema 字段（只允许改 SEO frontmatter）。相关代码视为历史冻结区。
11. **滚动条完全隐藏**：原始设计保留的用户偏好（牺牲可发现性，用户知情）。
12. **主题默认暗色**：不跟随系统偏好，首次访问一律 dark（防闪烁守卫 + localStorage）。
13. **fashion-design 图片双存**：`public/art/fashion-design/` 的 PNG 副本是为保留 alpha 透明通道（`getProjectImage` 特例分支），删除会破坏 art 页透明效果。
14. **全站 JSON-LD**：WebSite（每页）+ Person（about）+ TechArticle（详情）为 SEO 富结果服务；日期必须完整 ISO-8601 带时区（schema.org 要求）。
15. **og-card.png 手工生成**：分享卡视觉（终端风格 + 三色条 + 中英标语）由脚本硬编码 SVG 渲染，无构建步骤;改分享卡要改脚本并手动重跑。
16. **全站 URL 统一尾斜杠（2026-08-31）**：`astro.config.mjs` 设 `trailingSlash: "always"`（canonical/hreflang/og:url 自动带尾斜杠），`getLocalizedPath`/`buildEntryUrl`/`sitemap.xml.ts` 均输出尾斜杠，硬编码链接（404 页按钮、JSON-LD `url`）也带尾斜杠。原因：Cloudflare Pages 对目录型页面把不带斜杠的请求 308 重定向到带斜杠版本；默认 `"ignore"` 会让每个页面的 canonical 指向重定向 URL，Google Search Console 报"网页会自动重定向"并拖累收录。**新增内部链接必须带尾斜杠**（唯一例外：资源文件与首页 `/`）。
17. **正文图片构建时解析（2026-08-31）**：新增 `src/utils/markdown-resolve-images.ts`（Sätteri raw 节点插件，经 `markdown.processor: satteri({ hastPlugins })` 注册），把正文原始 HTML 中 `<img src="./…">` 重写为 `__ASTRO_IMAGE_` 标记并加入 `localImagePaths`，由 Astro 原生内容图片管线（image-marker + `updateImageReferencesInBody`）在渲染期解析为哈希 webp URL；同时删除了 ProjectDetail 里旧的客户端图片修正（隐藏 div 图片表 + DOMContentLoaded 重写）。原因：浏览器解析 HTML 时先用相对路径发请求，Cloudflare Error Monitoring 报大量详情页图片 404；markdown 语法图片（`![](./x.png)`）本就走原生管线，只缺原始 HTML 图片。**关键坑**：① 插件随 astro.config 打包，配置 bundle 里 `import.meta.glob(eager)` 的图片值没有 astro:assets 处理（`.src` 是 `/src/content/...` 原始路径，生产 404），插件内只能使用 lazy glob 的**键**做存在性检查，绝不解析**值**；② Astro 内容层把渲染结果缓存于 `node_modules/.astro/data-store.json`（仅按文件摘要失效），改动 markdown 管线配置后须删除 `node_modules/.astro` 强制重渲（Cloudflare 从干净环境构建，部署不受影响）。

---

## 10. 已知问题与技术债

状态标记：🟢 已解决 ｜ 🟡 当前存在 ｜ 🔵 暂不处理（有意为之） ｜ 🔴 未来计划

| 状态 | 问题                                   | 说明 / 注意                                                                                                                                                                                           |
| ---- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🟢   | ProjectCard 自建 routeMap              | 已修复（2026-08-14）：改用 `buildEntryUrl(project, project.data.lang)`，行为等价，与 `typeToRoute` 单一来源对齐。                                                                                     |
| 🟡   | Hero 终端被隐藏（实验状态）            | global.css §14。用户尚未决定保留还是恢复。改首页 Hero 视觉时勿被"终端不见了"误导。                                                                                                                    |
| 🟡   | ArtGallery 是死代码 + gallery 双实现   | 详情模板的 art 分支不可达（getStaticPaths 过滤 art）；实际 art 展示由两个冻结的 art 页各自实现的 marquee/lightbox 承担。两套实现并存且 en/zh 版还有细节差异。受冻结政策约束，**动它们需要用户解冻**。 |
| 🟢   | zh/notes 页未用翻译键                  | 已修复（2026-08-14）：改用 `t.sections.notes.*`，zh 翻译描述补句号与 en 对齐。两版样式覆盖的细微漂移仍存在，见 🔴 清单。                                                                              |
| 🟡   | about 页多文件臃肿且实现漂移           | en/zh/nl 三份独立实现（各 ~4000+ 行），canvas 动画脚本三份维护，动画参数与样式有独立差异。重构（共享模板）需要用户同意;这是当前最大的维护成本点。                                                     |
| 🟢   | README.md 是 Astro 模板默认 README     | 已修复（2026-08-14）：重写为面向访客的项目介绍（中英双语，由浅入深）。                                                                                                                                |
| 🟢   | og-card 脚本依赖 sharp 传递依赖        | 已修复（2026-08-14）：sharp 声明为 devDependency（^0.35.3），新增 `npm run og-card` 脚本（已运行验证）。                                                                                              |
| 🟢   | `输入/` 与 .gitignore 不一致           | 已解决（2026-08-14）：`git rm -r --cached 输入` 取消跟踪（本地文件保留）。该目录重新定义为**用户给 AI 的投递箱**，永不提交（§12 规则 13）。                                                           |
| 🟡   | Navbar 无当前页高亮                    | 无 `aria-current`/active 样式。属功能缺失而非 bug；加高亮属合理新需求。                                                                                                                               |
| 🟡   | zoem-bike 的 translationKey ≠ 文件夹名 | 文件夹 `zoem-bike-bakfiets`，translationKey 是 `zoem-bike-cargo-box`。配对依赖 translationKey（不依赖文件夹名），所以无功能性影响，但容易让新读者困惑。                                               |
| 🟡   | 无 en→zh 的 `/zh/404` 独立页           | 404 页双语混合固定内容，未按语言适配（可接受）。                                                                                                                                                      |
| 🔵   | 动画时长、断点未 token 化              | 断点因 CSS 限制必须字面量（有 BREAKPOINT REGISTRY 制度）；动画时长字面量是清理时的取舍。                                                                                                              |
| 🔵   | 滚动条隐藏                             | 用户偏好，勿"修复"。                                                                                                                                                                                  |
| 🔵   | `featured` 字段不参与自动筛选          | 首页精选靠硬编码 `featuredKeys`（用户偏好人工策展）。                                                                                                                                                 |
| 🔵   | 卡片/详情无 cover 的 note 条目         | 5 个早期 note 无 cover，卡片与详情做了无封面降级渲染，属正常设计。                                                                                                                                    |
| 🔴   | 可选重构清单                           | ArtGallery 与 art 页 gallery 实现统一（需解冻）；about 页双语言共享模板化；zh/notes 与 en 版样式漂移收敛。**这些都需要用户同意，不要擅自执行。**                                                      |

已解决的历史问题（勿回退）：详情路由 404（`/notes/{slug}` 发散映射，靠 `routes.ts` 单一来源解决）；TechArticle 缺 `dateModified`/日期无时区（2026-08 修复）；`translationOfWork` 嵌套字段不全（2026-08 补全）；Person 实体补 `alternateName: RrSuika`；2026-08 清理删除的遗留文件（旧 `src/content/config.ts`、`ContentList.astro`、空 `retro-ui.css`/`variables.css`）;**不要再创建同名遗留文件**。

---

## 11. 快速索引："我要改什么 → 去哪"

| 需求                         | 优先检查位置                                                                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 改首页 Hero / 恢复终端       | `src/components/home/Hero.astro` + `src/styles/global.css` §14（删除隐藏规则）                                          |
| 改首页精选项目               | `src/pages/index.astro`、`zh/index.astro`、`nl/index.astro` 的 `featuredKeys`                                           |
| 改首页 SYS.LOG 规则          | `src/pages/index.astro`（zh 同）frontmatter `latestEntries` 逻辑                                                        |
| 改导航 / 语言切换 / 主题按钮 | `src/components/Navbar.astro`                                                                                           |
| 改页脚链接/版权              | `src/components/Footer.astro`                                                                                           |
| 改项目/实验卡片              | `src/components/ProjectCard.astro`                                                                                      |
| 改详情页排版/TOC/灯箱        | `src/components/ProjectDetail.astro`                                                                                    |
| 改滚动进度条                 | `src/components/ScrollMeter.astro`                                                                                      |
| 改列表筛选标签               | 各列表页 frontmatter `filterTags` + global.css §12（`.tag-bar/.tag-chip`）                                              |
| 新增项目/笔记/实验           | `src/content/entries/`（§4.5 步骤）；首页精选另加 `featuredKeys`                                                        |
| 改内容字段/Schema            | `src/content.config.ts`（改 enum 会牵连路由，见 §3.3）                                                                  |
| 改全局颜色/间距/圆角/字体    | `src/styles/global.css`（token 在 §1/§2；遵守 fidelity 政策）                                                           |
| 改某条文案                   | `src/utils/translations.ts`（en+zh 两处）                                                                               |
| 改 URL 映射                  | `src/utils/routes.ts`（`typeToRoute`/`buildEntryUrl`）＋同步 ProjectCard                                                |
| 改语言判定/路径换算          | `src/utils/i18n.ts`                                                                                                     |
| 改图片解析                   | `src/utils/images.ts`                                                                                                   |
| 改 head/SEO/hreflang/JSON-LD | `src/layouts/Layout.astro`（详情 JSON-LD 在两张详情模板里；Person 在 about 页）                                         |
| 改 sitemap                   | `src/pages/sitemap.xml.ts`                                                                                              |
| 改 robots                    | `public/robots.txt`                                                                                                     |
| 改 404                       | `src/pages/404.astro`                                                                                                   |
| 改分享卡                     | `scripts/og-card-gen.mjs`（改后 `npm run og-card` 重跑）+ `public/og-card.png`                                          |
| 改 art 展示                  | ⚠️ 冻结区：`src/pages/art/index.astro`、`zh/art/index.astro`、`ArtGallery.astro`、`gallery` 字段;仅允许 SEO frontmatter |
| 改 about 页                  | `src/pages/about/index.astro` + `src/pages/zh/about/index.astro`（双文件都要改）                                        |
| 构建/部署问题                | `package.json`、`astro.config.mjs`；Cloudflare 控制台（仓库内无部署配置）                                               |

---

## 12. AI 工作规则

1. **执行任务前，先读本文件**（AI_CONTEXT.md），再用 §11 快速索引定位相关文件。
2. **不要无差别扫描整个项目**;只阅读任务涉及的源文件；仅当任务涉及本文档未覆盖的内容，或怀疑文档过时，才扩展阅读范围。
3. **CLAUDE.md 的约束是硬规则**（设计系统 token 政策、冻结区、路由单一来源、SEO 约定），与本文件冲突时以代码和 CLAUDE.md 为准。
4. **复用优先**：已有组件、已有样式模式（`.tag-chip`、`.data-tag`、卡片/详情）、已有工具函数，不要重复造。特别是：不要在组件里自建路由映射（历史 404 教训）。
5. **不要擅自改变**：路由结构、Content schema 的 `type` 枚举、组件结构、设计语言（含旧调色板字面量）。结构性改动先与用户确认。
6. **冻结区**（art 页面 4 处 + gallery 字段）：只允许改 SEO frontmatter。
7. **双语言义务**：任何 en 页面/文案改动都要同步 zh 镜像文件与 `translations.ts` 两语言。新静态页面必须建 zh 镜像。
8. **发现代码与本文档不一致**：以当前代码为准完成任务，并在任务收尾时更新本文档。
9. **完成较大架构修改后，主动更新本文档**（目录树、路由、组件职责、决策记录、技术债状态）。
10. **敏感信息禁入本文档**：不写密码、Token、API Key；调试临时代码的痕迹也不写入。
11. 开发服务器按 AGENTS.md 用后台模式（`astro dev --background`）；验证用 `npm run build`。
12. **用户的新约定必须写进本文件**：用户在对话中传达的任何新规则、新决策、新流程（例："`输入/` 是给 AI 的投递箱"），执行任务后要主动写入本文件（必要时同步 CLAUDE.md 和记忆），让未来的 AI 无需用户重复提醒。
13. **`输入/` 投递箱工作流**：用户会把新素材（项目图片、文档、skill 包等）放进 `输入/`。AI 应主动读取其中内容并转化为站内产物（写入 `src/content/entries/` 或合适位置），完成后与用户确认是否清理原文件。该目录**永不提交/上传 GitHub**（已移出版本控制）。
14. **荷兰语文风约定（2026-08-16 用户指示，改写 nl 文案必须遵守）**：nl 文案要像生活在荷兰的设计师/工程师本人写的;自然、偏口语，但整体专业、克制（参考技术博客/作品集语气）；避免过度书面化/生僻词、AI 腔（句式过于工整、重复表达、泛化术语）、机翻措辞。技术/设计/互联网词汇按荷兰从业者习惯**保留英文**（prototype、workflow、embedded systems、feedback、interface、rendering、hardware、software 等），不强行纯荷兰语，也不刻意插英文。保持原意、信息结构、技术含义与语气，不增删内容；原文已自然则不改。**硬约束**：nl 列表页（projects/lab/notes）的 `filterTags` 必须与条目 nl.md 的 `tags` 值**逐字一致**;筛选靠精确字符串匹配，改词会导致 chip 失效；art 页面与 art 条目冻结（§12 规则 6）不适用本条。
15. **英文文风约定（2026-08-16 用户指示，改写 en 文案必须遵守）**：en 文案要像设计师/工程师本人写的;自然、口语化、像真人，同时专业、略正式（技术博客/作品集语气）；清晰、自信、务实，不企业腔、不过度打磨。避免过于学术/正式的词、AI 腔（句式过于工整、重复开头、营销泛词、过度抛光）、机翻痕迹。适当简洁直接。技术/设计/软件/电子/AI/网络术语用从业者自然使用的说法。不增删内容、不改观点；已自然的句子不动。**硬约束同上**：en 列表页 `filterTags` 与条目 en.md `tags` 逐字一致；en.md 的 `tags` 字段禁止改动（B/C 两批规则）；art 冻结区不适用。**已知遗留**（用户未要求处理）：en 内容英式/美式拼写混杂（colour/color、organise、realised 等），各文件保持原有拼写。
16. **中文文风约定（2026-08-16 用户指示，改写 zh 文案必须遵守）**：zh 文案要像真正做工业设计/嵌入式/视觉创作的人自己写的;自然、口语化、像真人；避免生硬、机械、翻译腔。偏正式、专业但不书面化（技术博客/设计师个人网站语气）。**禁止**官方宣传稿/公关腔："致力于""赋能""探索……可能性""打造……体验"类套话一律不出现。简洁直接、符合现代中文互联网语境。减少 AI 特征（过度工整句式、连续相似结构、无意义总结、堆砌术语）。可自然夹杂英文术语（prototype、workflow、embedded systems、AI、ESP32 等），不强行翻译也不刻意插英文。项目/实验记录保留个人表达与思考感，但不过度随意。保持原意、信息结构、技术含义、核心观点；不增删信息；已自然的句子不动。**用户亲笔保留**：zh 版 `annex.intro`（"我超爱复古未来主义！！…"）逐字保留、永远不润色（zh about 页内还有一份硬编码副本，同样保留）。**硬约束同上**：zh 列表页 `filterTags` 与条目 cn.md `tags` 逐字一致；cn.md 的 `tags` 字段禁止改动；art 冻结区不适用。**备注**：zh about 页有部分 annex 文案的页面内硬编码副本（与 translations.ts zh 重复）。
17. **lieflat-charts skill（2026-09-01 安装）**：模板驱动的数据可视化/HTML 报告生成 skill，源码在 `Skill/lieflat-charts/`（入口 `SKILL.md`，含 catalog.md、templates/、color-presets.js 等）。发现路径：`.claude/skills/lieflat-charts` 是指向它的 junction（`.claude/` 已 gitignore，不随站点部署）。嵌套 .git 已移除，更新方式为重新 clone 覆盖该目录。用户要求用它做网站优化（图表/报告类内容）；绘制图表/生成报告前应加载此 skill，遵循其"默认图表模式、模板优先、Mono 保底配色"规则，产出与站点现有设计语言冲突时以站点设计系统（CLAUDE.md）为准。
18. **去AI味 skill（lieflat-less-ai-tone，2026-09-01 注册）**：白名单式改写写作中的 AI 痕迹——只能处理 skill 规则清单内的问题，未命中规则的文字逐字保留，不改文章框架、不增删信息。**原稿**在 `Skill/去AI味 skill.md`（用户自己维护）；**注册副本**在 `.claude/skills/lieflat-less-ai-tone/SKILL.md`（Claude Code 发现路径）。改动原稿后需重新复制到注册路径同步。适用于站点文案（en/zh/nl）成稿后的去 AI 味清理，与本文件 §12 规则 14/15/16 的文风约定配合使用。
19. **改写严禁添加不存在的细节（2026-09-01 用户指示，最高优先）**：去 AI 味/改写任何文案时，禁止添加原文没有的事实、技术细节或因果。曾有教训：AI 虚构"用单片机 PWM 驱动灯带"，实际用户用的是 PWM 控制器。硬件方案、器件型号、连接方式等拿不准的细节以原文为准；原文模糊就保持模糊，需要澄清时先问用户，绝不自己补写。
20. **各语言本土化优先（2026-09-01 用户指示）**：改写任何文案时，每个语言都要用该语言的本土化表述，不能直接从另一个语言润色好的版本机翻过来。发现原文带有机翻痕迹（语序照搬、直译习语、不自然的固定搭配）时应改为该语言的母语者自然说法，同时遵守规则 19（不增删事实）。与 §12 规则 14/15/16 的文风约定配合。
21. **中文翻案腔零容忍、拒绝夸张、真正润色（2026-09-01 用户指示，重要）**：① 中文文案里"不是……而是……"式翻案腔要彻底消灭——包括"不只是 A，还有 B""并不是 A""A，而不是 B"等变体，一律改成直接陈述（例："目的不是为了炫技，而是验证……"→"目的是验证……"；"这是一件背心，不是道具也不是复刻"→"这是一件背心"）。事实性否定（"有些板子不会自动进入烧录模式""如果光本身就不均匀"）和代码注释不受影响。② 收敛夸张用词（用户原话："我不会写'打个喷嚏就掀起来'这种夸张"），改为平实描述。③ 去 AI 味不等于只调标点/语序——要真正润色表述方式，让文本像人写的。2026-09-01 已按此对全部非 art、非首页的中文内容做深度清扫。
22. **英文/荷兰文 AI 味标准（2026-09-01 网络调研 + 用户指示）**：按公开调研确定 en/nl 的 AI 写作痕迹清单。**en**：负面平行结构（"not just X, but Y"、"isn't X — it's Y"、"Not because A, but because B"）一律改直接陈述；模板短语（"Furthermore/Moreover"、"It's important to note"、"plays a significant role"）不得出现；过度修饰词（delve/leverage/utilize/crucial/robust/seamless/landscape/tapestry 等）在技术语境可用、修辞语境禁用；破折号密度偏高是公认标志（本站在口语化随笔中保留，揭晓式破折号已随负面平行结构一并清除）。**nl**："niet alleen… maar ook…"、"niet X, maar Y"、"Geen X, maar Y" 同规则处理；句首连接词 echter/bovendien/daarnaast 与古旧词 voorts/derhalve 避免；"het is belangrijk om te benadrukken" 类模板句不得出现。保留项：事实性否定、规格注记（"allowed, not required"）、代码注释、口语化片语（"Not bad for a $5 microcontroller"）。2026-09-01 已按此清扫 en/nl 全部非 art、非首页内容。
