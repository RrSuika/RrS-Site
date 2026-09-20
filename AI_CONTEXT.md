# AI_CONTEXT.md — RrSuika Studio Portfolio 项目上下文（AI 专用）

> **本文件是项目级长期记忆（Architecture & Design Memory）。**
>
> **怎么读（重要）**：**不要通读**。先看下面的分工表 → 用 §11 快速索引定位文件 → 只读需要的那一两节（`read` 支持 `offset`/`limit`，可以按行读）。本文件是**索引**，细节按需去 `docs/`。
>
> | 层 | 文件 | 什么时候读 |
> | --- | --- | --- |
> | 规则（每轮自动注入） | `CLAUDE.md` | 一直生效，是**必须遵守的约束**；与本文件冲突时以代码和 CLAUDE.md 为准 |
> | 架构事实与索引 | **本文件** | 接手任何任务时读相关章节，不是整本 |
> | 技术细则 | `docs/README.md` 有总表 | **只在动到那个模块时读**——磁带盒 `docs/cassette-shelf.md`、开场 `docs/site-intro.md`、主题切换 `docs/theme-switch.md`、背景 `docs/backgrounds.md`、设计决策 `docs/decisions.md`、技术债 `docs/tech-debt.md`、跨模块陷阱 `docs/pitfalls.md`、文风 `docs/writing-style.md`、版本历史 `docs/changelog.md` |
> | 开发服务器 | `AGENTS.md` | 只讲 `astro dev --background` 的用法 |
>
> **当前状态**：v1.33（2026-09-19）。六个列表页（en/zh/nl × projects/lab）是 CSS 3D 磁带盒书架；首页暗色有黑洞视频 + 引力透镜星空；主题切换是整页拷贝的圆圈波；开场是机能仪表盘 + 信号色扫描退场。**逐轮完整记录见 `docs/changelog.md`**（v1.15 起），本文件头不再堆版本日志。
>
> **章节导航**：§1 概览 ｜ §2 目录结构 ｜ §3 路由 ｜ §4 内容管理 ｜ §5 组件与布局（§5.3 磁带盒名词表）｜ §6 样式与 token ｜ §7 功能与交互 ｜ §8 配置与部署 ｜ §9 设计决策（→ `docs/decisions.md`）｜ §10 技术债（→ `docs/tech-debt.md`）｜ §11 **快速索引：我要改什么 → 去哪** ｜ §12 AI 工作规则（14–23 见 `docs/writing-style.md`）
>
> **进度日志不再堆在这里**：每一轮的完整来龙去脉在 `docs/changelog.md`。

---

## 1. 项目概览

| 项       | 内容                                                                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 定位     | RrSuika Studio 个人作品集网站：工业设计 × 嵌入式系统 × 创意制造（Industrial Design × Embedded Systems × Creative Making）                                                                   |
| 技术栈   | **Astro 7.1.6**（纯静态输出）、**zod 4**（内容 schema）、TypeScript（`astro/tsconfigs/strict`）、原生 CSS + 少量原生 JS。**无任何集成**：无 React/Vue/Svelte、无 MDX、无 Tailwind、无适配器 |
| 站点     | https://rrsuika-studio.pages.dev （Cloudflare Pages，push 到 `main` 自动部署）                                                                                                              |
| 语言     | 英文为主（默认无前缀），中文为 `/zh` 前缀镜像。**手动 i18n**：不使用 Astro 内置 i18n routing（虽然 astro.config.mjs 里声明了 i18n 配置，实际路由全部手写，见 §3、§9）                       |
| 设计方向 | 复古科幻 CRT 终端 / 技术手册 HUD 风（retro-futurism）：暗色默认 + 亮色"蓝图纸"（Soviet technical manual）主题；2026-09-04 暗色文字改为暖白复古色，亮色背景改为黑色四边形+十字网格                                                                               |
| 阶段     | 生产运行中。架构稳定；art 页面**冻结**（用户决定）；首页 Hero 终端处于**临时隐藏实验**状态（§14，见 §10）                                                                                   |

**GitHub**：远程仓库 `RrS-Site`（账号 RrSuika；本地文件夹名为 MyPortfolio），主分支 `main`，工作树干净即代表生产状态。

---

## 2. 项目目录结构

```text
MyPortfolio/
├── CLAUDE.md                  # 项目规则/政策（**每轮自动注入，刻意保持短**：设计系统铁律、架构约定、SEO 约定、冻结声明 + 一份「动哪个模块先读哪份文档」的索引）
├── AGENTS.md                  # 给 AI 的开发服务器工作方式（astro dev --background 等）
├── AI_CONTEXT.md              # ← 本文件（索引与架构事实，不要通读）
├── docs/                      # ★ 技术细则，**只在动到那个模块时读**（总表见 docs/README.md）
│   ├── README.md              #   上面这张总表 + 编号对照（§9 决策 / §12 规则 14–23 / v1.x 去哪了）
│   ├── cassette-shelf.md      #   磁带盒书架全规格（改 CassetteShelf.astro 前必读）
│   ├── site-intro.md          #   站点开场 / preloader
│   ├── theme-switch.md        #   主题切换（整页拷贝圆圈波）+ 星空入场
│   ├── backgrounds.md         #   星空 / 引力透镜 / 黑洞视频层
│   ├── decisions.md           #   重要设计决策 1–23（"为什么现在是这样"）
│   ├── tech-debt.md           #   已知问题与技术债
│   ├── pitfalls.md            #   跨模块陷阱：构建/样式静默失效/验证方法/编码
│   ├── writing-style.md       #   en/zh/nl 文风约定（改写文案前必读）
│   └── changelog.md           #   v1.x 逐轮改动记录（平时不用读）
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
│   ├── media/blackhole.mp4    # 首页黑洞背景视频（1920×1080/60fps/约5s/3.1MB，来自 输入/黑洞动画 - AI 插帧.mp4，未转码）
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
│   ├── components/            # 12 个组件：全局 6 个（含 GravitationalLens 引力透镜）+ 列表/详情 4 个（含 CassetteShelf）+ home/ 5 个（见 §5）
│   ├── scripts/               # 客户端脚本模块（theme-transition.ts、site-intro.ts、shelf-tuner.ts）
│   ├── styles/
│   │   └── global.css         # ★ 设计系统唯一事实来源（14 个 section，1070+ 行）
│   └── utils/                 # 4 个工具模块（见下表）
├── 输入/                      # ★ 用户给 AI 的"投递箱"：素材放这里，AI 读取后转写为站内内容（§12 规则 13）。已移出版本控制，永不提交/上传
├── Skill/                     # ★ skill 包源码（lieflat-charts、去AI味、第三方包）。2026-09-20 起整个目录 gitignore、已移出版本控制（§12 规则 24）；文件仍在本地磁盘
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
- 每个条目文件夹 = `en.md` + `cn.md` + `nl.md` + 同目录图片。**25/25 个文件夹都有 en/zh/nl 三语言文件，无缺失。**

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

### 4.3 条目清单（25 个，按 type 统计）

| type       | 数量 | 条目                                                                                                                                                                                                                                                                         |
| ---------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lab`      | 12   | 3d-printing-abs-material-test、esp32-a4988-stepper-motor、esp32-ec11-encoder-oled、esp32-ec11-stepper-motor、esp32-inmp441-noise-monitor、esp32-multi-oled-encoder-hsv、esp32-rgbww-color-wheel、esp32-rgbww-fcob-comm、esp32-serial-test、esp32-wifi-led-brightness-control、studio-electrical-optimization、tinkercad-3ch-led-strip |
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

1. 建文件夹 `src/content/entries/{kebab-case-slug}/`（slug 即 URL，多语言共用）。
2. 写 `en.md`（`lang: en`）、`cn.md`（`lang: zh`）与 `nl.md`（`lang: nl`），三个文件 `translationKey` 相同（通常=文件夹名）。
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
| `blackhole?`     | 布尔；true 时渲染首页黑洞视频层（`#blackhole-layer` + `#blackhole-video`，暗色模式专用）。**仅三个首页**（`index.astro`/`zh/index.astro`/`nl/index.astro`）传 `blackhole`，其他页面不传 |

Layout 负责：head 全套（主题守卫内联脚本→防闪烁、charset/viewport/color-scheme/theme-color×2、Google Fonts JetBrains Mono 400/700/800/900、favicon、canonical、hreflang+x-default、og:_/twitter:_、**JSON-LD WebSite** `{name:"RrSuika Studio", url, inLanguage:["en","zh"]}`）；body 结构（skip-link、`#mobile-notice` 移动端提示、**`#blackhole-layer` 黑洞视频层（仅首页）**、`#star-canvas`（停用）、`#starfield-canvas` 星空画布、**`#lens-canvas` 引力透镜星空（仅首页/暗色/桌面端，接管旧星空）**、`#neural-canvas`（停用）、`<Navbar/>` + `<main#main-content/>`(slot) + `<Footer/>`、`<ScrollMeter/>`、`#crt-overlay` + `#tube-vignette` 背景层、黑洞自动播放/星空/主题切换/mobile-notice 脚本）；**站点开场**（`<head>` 内的 **SITE INTRO GUARD** 内联脚本决定放不放并持有 `window.__rrsIntroGate/__rrsIntroResolve` + `src/scripts/site-intro.ts` 播视觉 + `global.css §16`，规格与门控见 §9 决策 23 与 §11）。`global.css` 在此以 frontmatter import 引入（唯一引入点）。

### 5.2 组件清单（共 12 个）与复用指引

**全局复用（在 Layout 内，全站生效）：**

| 组件                | 职责                                                                                                                                                                                                                           | 备注                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `Navbar.astro`      | sticky 顶栏：品牌三色点、6 个导航链接（`t.nav.*`，href 用 `getLocalizedPath`）、**语言切换=镜像链接**（详情页先查译文是否存在，无则拦截弹 toast，见 §7.1）、主题切换按钮（调 `window.__toggleTheme`）、`#clock` 时钟、警告条纹 | **无汉堡菜单、无当前页高亮（无 aria-current）**；≤1000px 变纵向堆叠 |
| `Footer.astro`      | 页脚：三色条纹+状态行、身份区块、链接（GitHub `RrSuika`、email `ranrsuika@gmail.com`、pixiv `users/71884225`、QQ、Discord）、条形码、版权                                                                                      | 硬编码 `ROTTERDAM // NL`、`2026.V9.19`（每次大改手动升版，2026-09-19 由 `2026.V8.16` 升上来）                               |
| `ScrollMeter.astro` | 右缘 LED 滚动进度条（10 段）+ 回顶/回底按钮 + 轨道拖拽滚动                                                                                                                                                                     | rAF 节流、`aria-hidden` 计量表、≤768px 隐藏                         |
| `GravitationalLens.astro` | 首页引力透镜星空 `#lens-canvas`：单股连续内流（外慢→中快→内缓三档速度段，非分层循环）+ 顺时针旋进 + 吸积盘椭圆遮罩 + 黑洞圈外**圆形小星星带** + 键盘调参 HUD（详见 §9 决策 20、global.css §10 的 `--lens-*`） | 仅首页 / 暗色 / 桌面端（≥769px）；由 Layout 的 `blackhole` prop 渲染，并接管 `#starfield-canvas` |

**列表/详情复用：**

| 组件                  | Props                                                  | 职责                                                                                                                                                                                                                          | 被谁用                                                                             |
| --------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `ProjectCard.astro`   | `project`（必填）                                      | 条目卡片（整卡是 `<a>`）：PRJ_NODE//TYPE 头、cover+IMAGE_STREAM 角标、**TEAM badge（collaboration 驱动）**、title/description/tags、category+date 底栏                                                                        | **仅**首页 FeaturedProjects（2026-09-18 起 `/projects`、`/lab` 改用 CassetteShelf）。链接经 `buildEntryUrl`（单一来源） |
| `CassetteShelf.astro` | `entries`、`kind`（`"projects"｜"lab"`）、`filterTags`、`title`、`description`（必填） | **projects / lab 列表页的整套体验**（2026-09-18，同日多轮打磨，最新见 v1.32）：页头 + 标签筛选 + CSS-3D 磁带盒书架舞台。磁带盒 = 6 个 `.cas-f` 面（**封面铺满整个盒面**，转盘/编号/日期/色条/标题浮在其上 / 左右书脊 / 上下底 / 背板），姿态数学 1:1 移植参考 `layoutPose()`；**一屏 9 盘**（`MAX_SLOTS 4` + 7 个完整 + 两侧渐隐，主角占画面宽约 28%、盘距 0.45 自身宽），不足的位用空磁带布景（`.cas-blank`，`MAX_FILLERS = 6×MAX_SLOT_COUNT`）补满，`walkFrom/walkTo` 只覆盖真磁带所以空白永不可选；**主角落在环上第 `half` 位**才真正居中（这是最容易错的一步）；换盘＝**一条缓动 tween 驱动全行**（`progress` 共享，`slotIndex = ring − current + progress`），落地后环跳一格；开场＝黑幕渐入 → 从下方**左→右**升架（X 锁死、全程侧身、scale 2.05→2.30）→ 中心磁带 spring 抽出转 15°；交互＝左右拖动（**落点即行程**：`dragOffset` 是**整段手势**的位移，`SLOT_DRAG() = clamp(170px, 17vw, 280px)` 买一格，`progress` 就是格数偏移——手势期间不设上下限、只由 `DRAG_MAX 5` 格封顶；松手取整决定落点、`FLICK_COMMIT 2.6 格/秒` 只作**同向加一格**的加票，然后 `current` **一次性**移动整个距离；落点夹到真磁带，若落在布景里则用 `WALK_BACK_MS 260` 的 `snap` 把差值**滑**回去）、方向键、横向滚轮、两端**无圆框的粗 V 形箭头**（每侧一条写死方向的 SVG 折线：prev `M12 2 L2 13 L12 24` 尖在左、next `M2 2 L2 13 L2 24` 尖在右——⚠️ **折线的尖是中间那个坐标**，别再按首坐标推方向；尖角靠 `stroke-linejoin: miter`）、点击主角或面板里的 `INSPECT FILE` 实心按钮过场进详情页；右侧磨砂面板显示当前条目简介（WIP 琥珀 / ONLINE 绿，点由 CSS 画）。**无 three.js 依赖**，纯 `preserve-3d`；`≤860px`/`reduced-motion`/不支持 3D ⇒ flat 平面卡片模式 | `/projects`、`/lab` 及 zh/nl 镜像共 6 页 |
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

**改 UI 的查找顺序：** 全局层（Navbar/Footer/ScrollMeter/背景）→ 组件文件；**projects/lab 列表（磁带盒书架）→ `CassetteShelf.astro`**；其余列表卡片（首页精选、notes）→ `ProjectCard.astro`；详情 → `ProjectDetail.astro`；首页区块 → `home/` 对应组件；文案 → `translations.ts`（含 `shelf` 段）；颜色/间距 → `global.css` token。**不要新写一套已有组件能做的事**（例：列表筛选已有 `.tag-bar`/`.tag-chip` 共享实现，§7.3）。

### 5.3 磁带盒名词表（和用户沟通时统一用这套词）

⚠️ **用户不看代码**，沟通靠外形描述；这张表是「中文外形 ↔ 英文行业词 ↔ 本站 class」的三向对照。指问题时先用中文那列，改代码时用 class 那列。2026-09-19 的一次来回就是因为「环后面的窄长方形框」被理解成了 hub。

| 中文（用户说法） | 英文（真实盒式磁带行业词） | 本站元素 |
| --- | --- | --- |
| 磁带盒 / 外壳 | shell, housing | `.cas`（六个面 `.cas-f`） |
| 正面板（贴 J-card 那面） | front plate | `.cas-front` |
| J-card（印在正面和书脊上的那张纸） | J-card / inlay card | `.cas-label` |
| J-card 压边 | J-card lip | `.cas-label::after` |
| 书脊 / 侧面（标题印在窄边上） | spine | `.cas-left` / `.cas-right`、`.cas-spine-title` |
| 背板 | rear shell | `.cas-back` |
| 上/下侧壁（厚度那两条） | top / bottom edge | `.cas-top`、`.cas-bottom` |
| **观察窗（凹进去的矩形腔体）** | window / hub window | `.cas-window` |
| **轮盘井（两个大圆环）** | reel well / hub well | `.cas-reel` |
| 井沿细环 | well rim | `.cas-reel-ring` |
| **中心孔／轮毂（井里那个小黑圆）** | hub / spindle hole | `.cas-reel-hub` |
| 辐条／车削纹 | spokes / splines | `.cas-reel-spokes` |
| **两个井中间的窄长方形框（印型号那块）** | plate / label plate | `.cas-plate` |
| 型号标记（TYPE II · C-90） | type code | `.cas-plate-mark` |
| 强调色短杠 | accent tick | `.cas-plate-tick` |
| 100/50/0 刻度 | length scale | `.cas-plate-ticks`、`.cas-plate-nums` |
| 磁带路径／带身 | tape path / ribbon | `.cas-path`、`.cas-path-ribbon` |
| 导带轮（**已删除**，别再问它去哪了） | guide roller | 曾为 `.cas-path` 上的两个球 |
| 浮雕型号（壳上压出来的字） | moulded mark | `.cas-mould` |
| 封面底部的色条 | colour rail / accent bar | `.cas-accent-bar` |
| 空磁带（未录音的布景盘） | blank / unwritten tape | `.cas-blank`、`[data-fillers]` |

**真实磁带盒上有、本站没有建模的结构**（用户若提到可以据此判断）：防误抹片 / write-protect tab（顶边两个可掰断的小方片）、驱动孔 / capstan & drive holes（底面两个圆孔）、压带毡 / pressure pad & felt、屏蔽片 / shield plate、卷带制动 / reel brake、螺丝柱 / screw bosses、计数窗 / tape counter window。磁带类型代号 Type I（铁带）/ II（铬带）/ IV（金属带），`C-60 / C-90 / C-120` 是总时长（一面分钟数）。

调参面板（`src/scripts/shelf-tuner.ts`）的三个分组也是按这套词命名的：**REELS**（两个井 + 中心孔）、**PLATE**（中间那块窄长方形）、**HERO 3D**（选中那盘的三维姿态）。

---

## 6. 样式与视觉设计系统

**唯一事实来源：`src/styles/global.css`（1070+ 行，14 个 section）。** 文件头含两条铁律：

1. **BREAKPOINT REGISTRY**：断点字面量清单 `1100 / 1000 / 900 / 800 / 768 / 769 / 700 / 600 / 500`（媒体查询里不能引用 CSS 变量，所以全局与组件里保持字面量，新增断点要与清单同步）。
2. **FIDELITY POLICY**：所有 token 值 1:1 复制自清理前原样式；**替换字面量时，仅当 token 在两主题值相同才允许**，否则保留字面量；**禁止发明新颜色、"harmonize"、重着色**。

### 6.1 主题契约

- `data-theme` 属性挂在 `<html>` 上（`"dark"` | `"light"`）；`localStorage["rrsuika-theme"]` 持久化；切换入口 `window.__toggleTheme`（Layout 脚本）+ Navbar 按钮。
- 切换的视觉是**圆圈波**（`src/scripts/theme-transition.ts` + `global.css §15`）：每次点击从点击处（无坐标则按钮中心）**叠一份整页拷贝**并用 `clip-path: circle()` 从半径 0 长到最远角，圆内是新主题的**真实像素**（不是一块填色——填色会把内容盖住，用户原话「画面黑屏，然后新界面突然从暗部里浮现」），连点即多层拷贝叠成黑白相间的水波；最后一份盖满视口时所有拷贝在同一帧撤掉、根落到目标主题，接缝为零。**不用 View Transitions**（同一时刻只能有一个 → 连点被丢），详见 v1.23 与决策 23。
- **首次访问默认 dark**（不跟随 `prefers-color-scheme`）；head 内联守卫脚本在任何绘制前设好 `data-theme`，配套 `html:not([data-theme]) body { visibility: hidden }` 防闪烁。
- 暗色 token 定义在 `:root`（§1），亮色覆盖在 `:root[data-theme="light"]`（§2，只覆盖值不同的 token；排版/布局/圆角/缓动 token 两主题同值只定义一次）。⚠️ **这条「深色没有属性专属块」是主题揭示的关键约束**：`:root` 选择器只匹配 `<html>`，所以嵌在文档里的拷贝必须靠运行时生成的 `.theme-scope…` 规则拿主题；而 `buildScope()` 必须**连裸 `:root` 一起复制**（深色 token 就在那里），否则深色拷贝只能继承活动根的颜色。同理，`data-theme` 在连点期间会被停到 `dark`（见决策 23），**任何在事件里读 `data-theme` 判断明暗的代码**（`GravitationalLens` 的 MutationObserver、about 页的 `isLight()`、Layout 星空 rAF）在这一小段里会看到 dark；星空那份每帧重读、自愈，透镜那份只是可能提前 init 一次。

### 6.2 核心设计 token（两主题值）

**颜色（Dark / Light）：**

| Token                                                                         | Dark                                                                                  | Light                                                                      |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `--bg`                                                                        | `#07070d`                                                                             | `#f0ebe0`                                                                  |
| `--panel` / `--panel-light`                                                   | `#0e0e18` / `#161625`                                                                 | `#e5dfd3` / `#f8f4ec`                                                      |
| `--text` / `--text-bright` / `--text-soft` / `--text-tertiary` / `--text-dim` | `#eee4cf` / `#f6eedb` / `#e2d7bd` / `#b3a48a` / `#91846e`（2026-09 用户改暖，旧文档值已过时）                             | `#1a1815` / `#1a1a1a` / `#444444` / `#666666` / `#555555`                  |
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

黑洞视频 + 星空 + 引力透镜的完整规格、全部 `--blackhole-*`/`--lens-*` 旋钮、视口自适应基线与调参面板用法 → **`docs/backgrounds.md`**（改这一块之前必读；基线值分散在 `global.css §10` 与 `GravitationalLens.astro` 的 `FALLBACK`/`SCALED`，**改一处必须两处同步**）。

一句话版本：首页暗色由下到上是 纯黑底 → 黑洞视频 → 星空（桌面端暗色由 `#lens-canvas` 引力透镜接管）→ 内容；四层同为 `z-index: 0`，**层序 = DOM 顺序**，别移动标记。其他页面只有「`--bg` → 星空 → 内容」。

### 6.4 其他全局约定

- **§13 CJK**：`html[lang="zh"] h1/h2/h3 { letter-spacing: 0; line-height: 1.2; }`，但 `.hero h1` 是拉丁文本，恢复 `tracking-hero`/`line-height: 0.9`。
- **§14 Hero 终端隐藏**：`.hero .terminal { display: none; }`;恢复方法就是删掉这条规则（注释写明"无需修改任何其他文件"）。
- **滚动条全站完全隐藏**（`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`）;用户偏好的原始行为，不要"修复"。
- **旧调色板字面量**（刻意保留，勿重着色）：Navbar 警告条纹 `#ff5f1f`、品牌三色点 `#ff3333/#ffd400/#00b0ff`、Hero 终端 `rgba(255,95,31,…)`、亮色绿 `#00703c`（Footer/AboutPreview/LatestUpdates/about 页）、ScrollMeter 亮色深绿 `#145a28`、§11 里 art gallery 冻结样式（注释 "frozen: kept verbatim"）。
- **Hero 条形码与标题同色（2026-09-09 用户要求）**：`.barcode` 的条纹颜色走 `--barcode-ink`（暗色 = `--text`、亮色 = `--text-bright`），与 FUNCTIONAL 标题逐字同色；原来是写死的 `#fff`，在暖白标题旁边偏冷偏灰。以后改色请改这两个变量，不要写死 `#fff`。
- 通用模式：`.tag-chip`（pill 筛选按钮，§12 共享实现）、`.data-tag`（mono 大写数据标签）、`.skip-link`、hover 用 `--ease-out`、按下 `--spring-snappy`；入场动画 `pageIn`/`cardIn` + 各网格容器 nth-child stagger（§8）；`prefers-reduced-motion` 全局降级（§9，并隐藏粒子画布）。
- 页面局部样式：写在各自 `.astro` 的 `<style>` 内（自动作用域）；少数 `is:global`（如 ProjectDetail 的 article 排版）。**全局设计系统级 CSS 只应进 global.css。**
- ⚠️ **`<style is:global>` 里一律写裸选择器，不要写 `:global(...)`**：Astro 只在**作用域**样式块里剥离 `:global()`；`is:global` 块会被原样输出，而 `:global(.x)` 不是合法 CSS 选择器，浏览器**整条规则丢弃**（静默失效，dev 与 build 一样）。详见 §10。

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
| **背景星空**                       | `#starfield-canvas` 3D 天球星空（Layout.astro 脚本，参数见 §6.3）；原神经网络 `#neural-canvas` 被暂时禁用保留，`prefers-reduced-motion` 时隐藏                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
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

**全部决策（1–23）与实测数字 → `docs/decisions.md`**（决策 N = 该文件第 N 条）。要推翻/重做某个既有实现之前，先去那里查有没有已经踩过的坑。本文件只保留与架构直接相关的两条：

1. **Astro + 零集成**：静态内容为主、无重交互，不需要框架岛屿；所有交互用少量原生 JS 内联实现。
2. **手动 i18n / 每语言独立页面文件**：en 与 zh 页面是**两套独立文件**而非共享模板（about/art 两语言差异极大）。代价是双维护，**这是被接受的设计，不是缺陷**（新静态页必须建 zh 镜像）。

---

## 10. 已知问题与技术债

**全部条目（状态标记 + 说明）→ `docs/tech-debt.md`**。状态标记：🟢 已解决 ｜ 🟡 当前存在 ｜ 🔵 暂不处理（有意为之）｜ 🔴 未来计划。规划清理/重构、或撞见某个已知残留时再打开。

---

## 11. 快速索引："我要改什么 → 去哪"

| 需求                         | 优先检查位置                                                                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 改首页 Hero / 恢复终端       | `src/components/home/Hero.astro` + `src/styles/global.css` §14（删除隐藏规则）；标题那 20 条逐字偏移与调音面板见 `docs/hero-title.md`（面板开关 = `src/scripts/hero-tuner.ts` 顶部的 `TUNER_ENABLED`）                                          |
| 改背景星空 / 恢复神经网络 | `src/layouts/Layout.astro`（`#starfield-canvas` + 3D 星空脚本；神经网络恢复设 `data-neural="enabled"`）+ `global.css §10`。⚠️ **动手前读 `docs/backgrounds.md`** |
| 改首页黑洞视频 / 位置大小 | `global.css §10` 里 `#blackhole-layer` 的 `--blackhole-*`（**y 是 `calc(122px + 37.8vh)`，两点实测拟合**）+ `#blackhole-video` 的 `object-fit`；换视频改 `public/media/blackhole.mp4`；关掉黑洞 = 去掉三个首页 `<Layout>` 的 `blackhole` prop；手机端开关 = Layout 脚本与 §10 的 `min-width: 769px` 双保险。⚠️ 详情与「不要假设视口 = 屏幕分辨率」的教训见 `docs/backgrounds.md` |
| 改引力透镜 / 调每个圈的位置 | `src/components/GravitationalLens.astro` + `global.css §10` 的 `--lens-*`；现场调参：导航栏齿轮 / 反引号 / `?lens=tune`（方向键调、Shift ×10 / Alt ×0.1、COPY 复制参数）。⚠️ §10 默认值与组件内 `FALLBACK`/`SCALED` 互为镜像，改一处须两处同步（决策 21）——规格见 `docs/backgrounds.md` |
| 改首页精选项目               | `src/pages/index.astro`、`zh/index.astro`、`nl/index.astro` 的 `featuredKeys`                                           |
| 改首页 SYS.LOG 规则          | `src/pages/index.astro`（zh 同）frontmatter `latestEntries` 逻辑                                                        |
| 改导航 / 语言切换 / 主题按钮 | `src/components/Navbar.astro` + `src/scripts/theme-transition.ts` + `global.css §15`。⚠️ 主题揭示是**整页拷贝的圆圈波**（`.theme-stack` 挂 `<html>`、`buildScope()` 重写 `:root…` 规则、连点期间根停在 `dark`、落地 `applyInstant()` 关过渡），星空入场挂在 `applyInstant` 且必须读 `visibleTheme`——**动手前必读 `docs/theme-switch.md`**（含全套复验清单：拷贝逐像素 |Δ| ≤2、落地帧无在飞过渡、点击同步耗时 <12ms）。⚠️ **圆的快慢由 `EASING` 决定、不由时长决定，判据要用面积 r²**：v1.47 前用的 ease-out-quint 让**一半时间就盖掉 92% 的屏幕**（可感扫描只剩 ~230ms），现为 `ease` / `REVEAL_MS` 900 / `RIPPLE_MS` 660 |
| 改站点开场 / 预加载 | `Layout.astro`「SITE INTRO GUARD」（`<head>` 内联脚本，决定放不放 + 拥有 `window.__rrsIntroGate`）+ `src/scripts/site-intro.ts` + `global.css §16`。三态：会话首个页面放 / F5 放 / 站内跳转不放；进度必须真的到 100、退场是信号色扫描、入场动画只能 `fill-mode: backwards`——**动手前必读 `docs/site-intro.md`** |
| 改页脚链接/版权              | `src/components/Footer.astro`                                                                                           |
| 改项目/实验列表（磁带盒书架） | `src/components/CassetteShelf.astro`（六页共用）+ `src/scripts/shelf-tuner.ts`（临时调参面板）。⚠️ **动手前必读 `docs/cassette-shelf.md`**：preserve-3d 卫生、单一定位公式 `slotIndex`、拖动落点符号、环长预算、箭头几何、调参入口、复验清单全部在那里。名词表见 §5.3；决策背景见 `docs/decisions.md` 决策 22b |
| 改项目/实验卡片（首页精选、notes） | `src/components/ProjectCard.astro`（`.card` 的 `backdrop-filter: blur(20px)`；⚠️ 它**不能**和 `-webkit-backdrop-filter` 写进同一条规则——构建期 lightningcss 会按别名合并、只留最后一条（`-webkit` 在后则生产站整条失效），Safari 兜底因此放在紧随的 `@supports` 独立规则里，见决策 22；⚠️ `main`/`.card` 入场动画必须用 `animation-fill-mode: backwards`，残留 transform 会让 Chrome 丢掉模糊）                                                                                      |
| 改详情页排版/TOC/灯箱        | `src/components/ProjectDetail.astro`                                                                                    |
| 改滚动进度条                 | `src/components/ScrollMeter.astro`                                                                                      |
| 改列表筛选标签               | 各列表页 frontmatter `filterTags` + global.css §12（`.tag-bar/.tag-chip`）                                              |
| 新增项目/笔记/实验           | `src/content/entries/`（§4.5 步骤）；首页精选另加 `featuredKeys`                                                        |
| 改内容字段/Schema            | `src/content.config.ts`（改 enum 会牵连路由，见 §3.3）                                                                  |
| 改全局颜色/间距/圆角/字体    | `src/styles/global.css`（token 在 §1/§2；遵守 fidelity 政策）                                                           |
| 改某条文案                   | `src/utils/translations.ts`（en+zh 两处）                                                                               |
| 改 URL 映射                  | `src/utils/routes.ts`（`typeToRoute`/`buildEntryUrl`）＋同步 ProjectCard                                                |
| 看/调磁带盒书架的 3D | CDP 验证法（决策 22b）：`--virtual-time-budget` 会饿死 rAF、拍不到 transform，改用 `--remote-debugging-port` + 页面内 `Runtime.evaluate` 注入探针，用 `document.elementsFromPoint` 网格扫描打印「哪张面画在哪」，一眼看出 3D 是否塌成平面。看形状要解码 PNG 像素（`zlib.inflateSync` + 逐行反滤波）。⚠️ 完整清单（reduced-motion 陷阱、两次差分求交、轮询 `clipPath`、合成指针不可信）见 `docs/pitfalls.md` §6 |
| ⚠️ 折线/路径的「尖」在哪 | **折线的尖端是中间那个坐标，不是第一个**：`M2 2 L12 13 L2 24` 画的是 `>`（顶点 `(12,13)`）。按首坐标推方向会把一对箭头装反（v1.22 真实事故）。像素判据：人字只有**一列是单段**（尖），另一头必是两段（两条圆帽尾巴）。详见 `docs/cassette-shelf.md` |
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

1. **执行任务前，先按需读本文件**（AI_CONTEXT.md 是**索引**，不必通读）：用 §11 快速索引定位文件；动到某个模块之前，先读 `docs/` 里对应的那一份（`docs/README.md` 有总表）。
2. **不要无差别扫描整个项目**;只阅读任务涉及的源文件；仅当任务涉及本文档未覆盖的内容，或怀疑文档过时，才扩展阅读范围。
3. **CLAUDE.md 的约束是硬规则**（设计系统 token 政策、冻结区、路由单一来源、SEO 约定），与本文件冲突时以代码和 CLAUDE.md 为准。
4. **复用优先**：已有组件、已有样式模式（`.tag-chip`、`.data-tag`、卡片/详情）、已有工具函数，不要重复造。特别是：不要在组件里自建路由映射（历史 404 教训）。
5. **不要擅自改变**：路由结构、Content schema 的 `type` 枚举、组件结构、设计语言（含旧调色板字面量）。结构性改动先与用户确认。
6. **冻结区**（art 页面 4 处 + gallery 字段）：只允许改 SEO frontmatter。
7. **双语言义务**：任何 en 页面/文案改动都要同步 zh 镜像文件与 `translations.ts` 两语言。新静态页面必须建 zh 镜像。
8. **发现代码与本文档不一致**：以当前代码为准完成任务，并在任务收尾时更新本文档。
9. **完成较大架构修改后，主动更新本文档**（目录树、路由、组件职责）；**细节写进 `docs/` 里对应的那份文件**——不要为了"记全"把细节塞回本文件或 CLAUDE.md，那正是这次拆分要解决的问题。
10. **敏感信息禁入本文档**：不写密码、Token、API Key；调试临时代码的痕迹也不写入。
11. 开发服务器按 AGENTS.md 用后台模式（`astro dev --background`）；验证用 `npm run build`。
12. **用户的新约定必须写进本文件**：用户在对话中传达的任何新规则、新决策、新流程（例："`输入/` 是给 AI 的投递箱"），执行任务后要主动写入本文件（必要时同步 CLAUDE.md 和记忆），让未来的 AI 无需用户重复提醒。
13. **`输入/` 投递箱工作流**：用户会把新素材（项目图片、文档、skill 包等）放进 `输入/`。AI 应主动读取其中内容并转化为站内产物（写入 `src/content/entries/` 或合适位置），完成后与用户确认是否清理原文件。该目录**永不提交/上传 GitHub**（已移出版本控制）。

**规则 14–23（en/zh/nl 文风约定、去 AI 味、禁止虚构细节、本土化优先、中文翻案腔零容忍、条目正文不用破折号）→ `docs/writing-style.md`**（编号保留：规则 14 = 该文件第一条）。**改写任何文案之前必读**。

24. **`Skill/` 目录移出版本控制（2026-09-20 用户指示）**：skill 包源码只留本地磁盘，整个 `Skill/` 已写入 `.gitignore`，GitHub 远端 HEAD 不再包含任何 skill 文件（仓库不会因新增 skill 包而变大）。⚠️ 这**不减小** `.git` 体积（272 MB 主要来自 `src/content/entries/` 的历史大图，旧 blob 永久保留）。发现路径 `.claude/skills/`（junction + 注册副本）同样不进仓库。新增 skill 包直接放进 `Skill/` 即可，不会被提交。
