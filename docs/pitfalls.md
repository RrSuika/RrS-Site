# 跨模块陷阱速查

> 来源：原 `CLAUDE.md` 的「Frosted-glass cards」段（构建期压缩器陷阱）＋ 分散在各轮记录里的通用教训汇总。
> 什么时候读：写测量脚本之前；遇到「dev 正常生产失效」「样式静默失效」「改了半天没反应」这类怪现象时。

## 1. 前缀/无前缀成对的属性，不要写进同一条规则（lightningcss 会合并）

- **Frosted-glass cards elsewhere**: `ProjectCard.astro`'s `.card` keeps its translucent tint + noise texture and adds `backdrop-filter: blur(20px) saturate(160%)`. ⚠️ **Never write `backdrop-filter` and `-webkit-backdrop-filter` as a pair inside one rule**: the build's CSS minifier (lightningcss, pulled in by Vite — the project has no browserslist) treats the prefix as an alias of the unprefixed property, collapses the pair and keeps the **last** one. With `-webkit-` last, the built site shipped WebKit-only frost, which Chrome/Edge/Firefox ignore outright (verified by render A/B: an unprefixed-only box blurs, a `-webkit`-only box does not) — production had no frost while the dev server, serving unminified CSS, still showed it. Safari ≤ 17's fallback therefore lives in its own `@supports (-webkit-backdrop-filter: …)` rule just below `.card`; one declaration per rule gives the minifier nothing to merge. Same rule for any prefixed/unprefixed property pair (`mask`, `user-select`, `text-size-adjust`, …). ⚠️ `main`'s `pageIn` and the cards' `cardIn` entrance animations use `animation-fill-mode: backwards` (NOT `both`): a lingering `transform` on `<main>` or the card makes Chrome silently drop the card's `backdrop-filter`. Since 2026-09-18 `ProjectCard` is only rendered by `/notes` and the homepage featured block — `/projects` and `/lab` use `CassetteShelf` (which applies the same one-declaration-per-rule pattern to `.shelf-panel`).




## 2. Astro 的 `:global()` 两种失效方式

- **`<style is:global>` 里一律写裸选择器，不要写 `:global(...)`**：Astro 只在**作用域**样式块里剥离 `:global()`，`is:global` 块原样输出，而 `:global(.x)` 不是合法 CSS 选择器 → 浏览器**静默丢弃整条规则**。
- **作用域规则命不中 JS 创建的子节点**：`<style>` 里的 `.a span` 会被编译成 `.a[cid] span[cid]`，而 `document.createElement("span")` 造出来的节点没有 `data-astro-cid-*` → 选择器什么都不匹配。给运行时生成的元素写样式，必须用 `:global(.a span)`。
  踩过：`.shelf-panel-tags span` 从存在那天起就是死规则，标签一直用着继承色——这正是用户抱怨「tags 不够明确」的真因。

## 3. 自定义属性：可被覆写的那一层，默认值必须放在作用域的根

元素**自己**声明的自定义属性会完全遮蔽从 `<html>` 继承下来的 inline 覆写值。所以调参面板/外部覆写要能生效，默认值就得写在 `:global(:root)`，不能写在被覆写的元素上。
踩过：`--reel-*` 默认值写在 `.cas` 上，于是 REELS 面板每个滑杆都「没反应」，而走 `window.__shelfTune` 的 HERO 组一切正常。

## 4. `em` 在 `calc()` 里按**元素自己**的 font-size 解析

`max-width: calc(100% - 2 * var(--reel-size))` 写在铭牌上时，那个 `em` 走的是铭牌自己的 0.46em，于是要减掉的宽度只有实际尺寸的五分之一，框直接压在井上。混用 `%` 与 `em` 之前，先问一句「这个 em 是谁的」。

## 5. 量之前，先确认样式表真的解析了

`<style>` 里一个多余的 `{` 会让**它之后的所有规则被浏览器静默丢弃**：`astro check` 通过、`npm run build` 通过、页面照常渲染，只是细节全没了。基于那份坏样式表量出来的帧率/布局数字全是假的（曾据此得出「+17ms」的错误结论）。
**改完 `<style>` 后，先从 `document.styleSheets` 确认新选择器在不在，再相信任何布局、颜色或帧率数字。**

## 6. 验证一律走 CDP，`--virtual-time-budget` 拍不到动画

Headless Chrome 的虚拟时间会**饿死 `requestAnimationFrame`**，所有 rAF 驱动的 transform 都只能拍到第一帧。用 `--remote-debugging-port` + `Runtime.evaluate` 走真实时间。

- **视觉问题要解码像素**：箭头朝哪、两根棒有没有交叉、3D 有没有塌成平面，`getBoundingClientRect` 与 `getComputedStyle` 都答不了——`Page.captureScreenshot` 取小 clip → 自己解 PNG（`zlib.inflateSync` + 逐行反滤波）→ 打印墨迹图/列剖面。判据示例：人字**只有一列是单段**（那是尖），另一头必是两段（两条尾巴），这个不对称**就是**方向。
- **墨迹差分要两次求交**（画面 → 隐藏目标 → 画面）：星空在两拍之间会漂移，一颗移动的星只落在其中一次差分里（先把 `canvas` 全隐藏更省事）。
- **动画值不要靠截图采样**（8–20 帧延迟），直接轮询 `getComputedStyle(el).clipPath` / `.translate`。
- **`prefers-reduced-motion`**：headless 报 `reduce`，会关掉本项目**全部**入场动画（书架黑幕、开场编排、星空入场），于是测出「动画没跑」。测之前先 `Emulation.setEmulatedMedia` 成 `no-preference`。
- **开场动画只能在 `Page.reload` 下测**：`Page.navigate` 的 `navigation.type` 是 `navigate`，会被判定成站内跳转而跳过封面。
- **合成指针不可信**：Chrome 会把连发的 `Input.dispatchMouseEvent` 合并成 2–3 个 `pointermove`，所以派发 90px「快甩」实测只有 1.9 格/秒。短距离甩动要读内部量（探针读 `spring.velocity`）才能分辨「没触发」和「触发了但落点相同」。
- **`elementFromPoint` 打点前要注意 `pointer-events: none`**：`.cas-f` 面是 `pointer-events: none`，普通命中测试会直接穿过去，探针必须临时改成 `auto`。

## 7. 中文文件不要过 PowerShell 回写

`Set-Content` 不带显式编码会把 3 字节字符（`—`、`≈`、`≤`、CJK 文件名、`═` 分隔线）打成 `U+FFFD`——曾一次性产生 843 个类型错误。
用文件工具，或 `[System.IO.File]::WriteAllText(path, text, New-Object System.Text.UTF8Encoding($false))`；写完用 `ReadAllText` + 数 `U+FFFD` 复核。

## 8. 构建产物的几个假象

- 「dev 正常、生产失效」的**纯 CSS** 问题，第一嫌疑是构建期压缩器，不是部署或缓存：先比对生产 HTML 引用的 CSS 与本机 `dist` 里的同名文件**字节是否一致**。
- 查压缩后的 CSS 别用 `grep -c`（压低后整个文件只有一两行，计数恒为 1），用 `grep -o … | wc -l` 或正则 `Matches().Count`。
- `box-shadow` 的复合值里**永远不要用 `none`**：`none` 只在它是该属性唯一值时才合法，写进逗号串会让**整条声明**失效，连带把同一串里的 bevel 内阴影一起丢掉。想去掉就用 `0 0 0 rgba(0,0,0,0)`。
- Astro 内容层把渲染结果缓存在 `node_modules/.astro/data-store.json`，**只按文件摘要失效** → 改了 markdown 管线/插件配置后必须删掉 `node_modules/.astro` 强制重渲（Cloudflare 从干净环境构建，部署不受影响）。
- `import.meta.glob(eager)` 的**值**在 astro.config 打包的插件里没有 astro:assets 处理（`.src` 还是 `/src/...` 原始路径，生产 404）——插件内只能用 lazy glob 的**键**做存在性检查。
