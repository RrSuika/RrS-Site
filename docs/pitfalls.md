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

## 9. 删文件：只按确切名字，绝不用通配符清共享目录

Windows 文件系统**大小写不敏感**，所以 `rrs-*` 会连 `RRS-*.log` 一起命中。2026-09-19 清理本轮探针脚本时，用 `rrs-*` 通配扫了 `%TEMP%`，把用户自己放在那里的 5 个 `RRS-*.log`（7–9 月的旧日志）一并删掉了——`%TEMP%` 是**共享目录**，里面从来不只是本次会话的东西。

规则：

1. 删除一律按**确切路径**：`Remove-Item -LiteralPath '<完整文件名>'`；多个文件就一条条列出来。
2. 一定要用通配符时，先 `Get-ChildItem <模式> | Select-Object -ExpandProperty FullName` **把命中列表打出来核对**，确认「这些全都是我这一轮创建的」再删。
3. 只删自己创建的文件。不要「顺手清理」更早的临时文件、别人的临时文件、以及任何不是自己刚写出来的东西。
4. 同理：不认识的路径不要删，只报告。

（`RrSuika` / `RRS` 的大小写差异在这台机器上不是差异——判断「是不是我的文件」不能靠前缀大小写。）

---

## 10. AI 自己的失误记录（每次犯错后追加，写之前先读这一节）

> 这一节的每一条都是**已经真实发生过的**，代价是用户的时间和一次返工。目的只有一个：同样的错不要犯第二次。
> 顺序：成因 → 后果 → 以后的硬规则。

### 10.1 用一个不相关的字段去驱动样式（2026-09-20）

`walstroomkast` 的 tab 面板需要高一点（340px → 460px），我把它写成了
`.project:has(.wip-notice) .tab-panel { height: 460px }` —— 也就是挂在 `wip` 字段上。
而 `wip: true` 会渲染详情页顶部的琥珀色 WIP 提示条、把首页卡片和磁带盒的状态点从 ONLINE 翻成 WIP。
于是「面板要高一点」这个纯样式需求，把一个**已经完成**的项目标成了「进行中」。用户发现后指出。

**规则**：样式需求就写在样式里（markdown 自己在面板上加 `tab-image` 类），不要借用任何语义字段当开关。
用一个字段驱动无关的 UI，等于悄悄改变了那个字段的含义。

### 10.2 索引切片切错位置，把文件写坏（2026-09-20，同一类错发生两次）

写了一个 `rebuild_drawings()` 用 `str.index()` 找锚点来切割 markdown：

- **第一次**：锚点 `<div class="side-by-side">` 在文件里出现两次，`index()` 拿到第一个，切点错位。`nl.md`
  从 26KB 被截成 10.5KB 后**写盘**了。⚠️ `walstroomkast` 当时**未被 git 跟踪**，没有历史可回滚，
  只能从对话记录里整份重建。教训：**「脚本报错」不等于「文件没被动过」** —— Python 的 `open().write()`
  是带缓冲的，截断结果可能已经落盘。
- **第二次**：同一函数在 `en.md` 的工程图纸后面留下一段**孤立的 `<div>` 残片**，`<div`/`</div>` 不再配平。

**规则**：

1. **不要用 `str.index(标签文字)` 去切 HTML。** 标签在文档里必然重复。要用**唯一的、内容性的结束锚点**
   （比如紧跟其后的那句正文），或者用正则一次匹配整块。
2. **写盘前先验证，验证不过就一个字都不写。** 这是唯一真正救了后面的那一步：最后一次改动被
   `ABORT, nothing written` 拦下，文件保持完好。
3. **验证要验对东西。** 我最初用 `<div` 与 `</div>` 的**计数相等**做校验，这是错的 —— `</div>` 里含 `<div`，
   而且替换本身就会改变嵌套层数。正确的是**遍历做括号深度走查**（过程中不得为负、结束时必须回到 0）。
   因为用了错的校验条件，我连续误报了 4 次 ABORT，白绕好几轮。
4. **改动体积要和预期规模对得上。** 一次「重排 + 换一个列表」不该让文件掉 40%。写完先比长度。
5. PowerShell 的 `$s.Length` 是 **UTF-16 码元数**，中文文件会明显大于 Python 的 `len(s)`：
   我因此一度误判 `cn.md` 被截断（15,547 vs 23,440），又浪费一轮。**跨工具核对大小用 `Get-Item Length`（字节）或 Python。**

### 10.3 反复重试一个被拒绝的操作，而不是换做法（2026-09-20）

`edit` 工具在这个仓库上会间歇性抛 `ReplaceFileW EIO (Win32 32)`。我对同一个文件连续原样重试，每次都失败。
真正的问题是**做法**（想改一行却走整文件重写路径），不是运气。

**规则**：同一个操作失败**两次**就换路径（改用脚本，或改文件里另一处），不要第三次原样重试。

### 10.4 把「我不知道」当成可以推断过去（贯穿整轮）

用户提供的 PPT 里 `Oplossingen - Verbindingen` 那一页**除了标题一个字都没有**。我在正文里写下
「最终选择：上下夹层固定」，用户随后给的信息部分印证、部分推翻了这个推断；同一页的图片我至今没看到内容。

**规则**：`writing-style.md` 规则 19 说不新增事实。这条的推论是：**信息缺失时留占位并明说**，
不要把「从旁边几条推出来的合理猜测」写成陈述句。占位符要显眼（`PLACEHOLDER-xxx（待补）`），
并且在给用户的回复里单独列出来。
