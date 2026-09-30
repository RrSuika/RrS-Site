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

### 7.1 回写脚本的锚点要按**这个文件自己的换行**拼

⚠️ **同一个仓库里两种换行并存**：`src/components/CassetteShelf.astro`（以及其它早期文件）是 **CRLF**，而新建的文件（`FanPage.astro`、`FanMosaic.astro`、`docs/*.md`）是 **LF**。

> ⚠️ **2026-10 更正**：上面这句里的 `FanPage.astro` **已经不准了**。本轮量到的是 `CRLF=4357 / bareLF=0` —— 它现在是 **CRLF**（中间某次工具回写把整个文件转过去了，`docs/*.md` 仍然是 LF：`fan-page.md` 量到 `bareLF=1133 / CRLF=0`）。
> **所以别再照这张名单猜**：`docs/pitfalls.md` 只说了「两种换行并存」，没说是哪几个文件。写脚本前**每次现量**，一行就够：
>
> ```js
> const crlf = (src.match(/\r\n/g) || []).length;
> const loneLf = (src.match(/(?<!\r)\n/g) || []).length;
> const NL = crlf > loneLf ? "\r\n" : "\n";
> ```
>
> 拼锚点、拼替换文本都用这个 `NL`，并且**在写盘前**断言 `src.split(anchor).length - 1 === 1`。

用脚本按锚点做替换时，多行锚点如果写死 `\n`，在 CRLF 文件里**永远匹配不上**，而报错只有一句「anchor missing」——2026-09-28 因此在同一个补丁上连试了三次（先怀疑反引号被转义、又怀疑 here-string 的问题），实际原因只是换行。

规则：

1. 拼锚点前先确认换行：把 `\r\n` 和「前面不是 `\r` 的 `\n`」各数一次。
2. 多行锚点和替换文本都用**同一个**换行变量拼（`$nl = [string][char]13 + [string][char]10`），不要混。
3. 报「anchor missing」时，先把锚点拆成单行逐个 `.Contains()` 验证，能立刻区分「换行不对」和「文字不对」。

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

### 9.1 2026-09-28：同一个坑换了个形式，又踩了一次

清理探针时把 `输入/sss/` 整个文件夹当成了「本轮草稿区」，按 keep 名单删掉 **169 个文件**。里面 `cover.jpg`、`新增测试.txt`、`63943998…jpg` 是**用户放进去的素材**——`输入/` 本来就是用户的投递口，而 `输入/sss` 还是用户自己那个 labs 项目文件夹。

- 站点没受影响：entry 的封面字段指向 `01-hardware-purple.jpg`，那份已经随 `d34a416` 提交在 git 里，要取回原始 drop 可以 `git show d34a416:src/content/entries/esp32-rgbnw-light-motor-controller/01-hardware-purple.jpg`。
- 但用户的原始文件是真的没了。`Remove-Item -Force` **不进回收站**。

失守的原因不是判断失误，而是**草稿和用户的素材住在同一个文件夹里**——规则 3 说「只删自己创建的文件」，可那个目录里我自己创建的文件占绝大多数，keep 名单一写就顺手把它当成自己的目录了。补一条：

5. **草稿必须有独占文件夹**：探针脚本、截图一律放 `输入/_scratch/`，**不放进 `输入/` 下任何用户自己建的文件夹，也不放进 `输入/` 根目录**。只有 `输入/_scratch/` 可以按目录清理，其它目录一律不碰，要清理只报告、不动手。

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

## 11. dev 服务器会拿着**过期的组件 `<style>`** 不放

2026-09-28：改完 `FanCta.astro` 的样式（11px → 6px、opacity 1 → 0.14）后，页面里**标记是新的、样式是旧的** —— 实测计算出来仍是 `font-size: 11px; padding: 11px 18px; opacity: 1`。

排查花了三轮（先怀疑作用域 cid、再怀疑美术页的冻结样式表覆盖、又怀疑 Chrome 缓存，换了干净 profile 也一样），最后靠 CDP 的 `CSS.getMatchedStylesForNode` 定位：**浏览器手里那条 `.fan-cta[data-astro-cid-…]` 规则的声明本身就是旧值**。同一时刻用 Node `fetch` 同一个 URL，返回的 HTML 里却是新值。

**修法：`astro dev stop` 再 `astro dev --background`，样式立刻生效。** 同一个文件里的 `<script>` 和模板是新的，只有 `<style>` 是旧的。

规则：

1. **改了任何组件（或页面）的 `<style>` 之后，先重启 dev 服务器再量。** 否则量到的是上一版样式，而且现象很像「我的选择器没生效」。
2. 判断「到底哪条规则赢了」不要靠读源码，用 `CSS.getMatchedStylesForNode`（`DOM.querySelector` 拿到 `nodeId`）—— 它会直接告诉你命中的规则、来源样式表、以及被禁用的声明。
3. 这条也解释了为什么「改了没用」有时是真的没用、有时只是没重启：**先重启一次再判断**，成本一分钟。
### 7.2 双引号字符串里的 `` `0 `` 是 **NUL**，不是「反引号 + 0」

2026-09-28：给 `FanPage.astro` 写一段 CSS 注释，内容是「`0 0 0 2px` 是描边不是阴影」。这段文字在 PowerShell 的**双引号**字符串里拼的，于是 `` `0 `` 被当成转义序列 → 写出了**一个 NUL 字节**。

后果不是构建失败（Astro 照样构建、页面照常），而是：

- `git diff` 把这个文件报成 **binary file**，看不到任何改动；
- 文件工具直接拒绝编辑（"cannot edit: binary file"）；
- 文件里少了一段文字，肉眼扫过去只像「句子有点怪」。

**规则**：

1. 要写字面量反引号，用**单引号**字符串（单引号里反引号没有特殊含义），或者用 `[char]96` 拼。
2. 用脚本回写之后，除了数 `U+FFFD`，再扫一遍**控制字节**：
   `[System.IO.File]::ReadAllBytes($p) | Where-Object { $_ -lt 0x20 -and $_ -notin 0x09,0x0A,0x0D }`
3. 文件工具报 "binary file" 时，先按上面扫 —— 几乎一定是某个转义写坏了，而不是工具出问题。
### 5.1 注释不能写在 JSX 的属性表里

`.astro` 里给一个元素写注释，位置只有两个：**子元素位置**（`<div>{/* … */}</div>`）或者**标签外**。写进属性表就出事：

```astro
<img src={x} alt="" {/* ⚠️ 这样写 */} loading={lazy()} />
<img src={x} alt=""  /* ⚠️ 这样也一样 */  loading={lazy()} />
```

`astro check` 的第一种报 **"Unterminated string literal" + "':' expected"**，位置指向注释下面两行；第二种报 **`boolean` 不能赋给 `string`**，附注说「所需类型来自属性 `is`」—— 两条都指不到真正的位置，因为属性流被注释切断了。

⚠️ **构建和页面都正常**，所以这个坑只会以「Problems 面板里有两条看不懂的错」的形式存在。判据是：报错位置落在一段**注释**里，就去属性表里找。

（老仓库里两处都是这么写的，2026-09-29 一起修掉，`astro check` 从 11 errors 到 0。）
---

## 12. 作用域外的 `var()`、快动画的取证、以及会迟到的 `setTimeout`（2026-09-30）

### 12.1 拿不到的自定义属性在 SVG 里**不是「没颜色」，是黑色**

`FanIntro.astro`（`/fan/` 的入场覆盖层）是 `.fan-root` 的**兄弟**，而粉丝页那套 `--fan-*` token 是定义在 `.fan-root` 上的。于是 `fill: var(--fan-white)` 里的变量**没有定义**——CSS 里这不是「回退到默认」，而是 *invalid at computed-value time*：属性变成它的**初始值**，`fill` 的初始值是 **black**。

结果：粉底上浮着一排**黑描边**的云。构建通过、`astro check` 通过、页面能渲染，只有截图看得出来。

- 判据：`var()` 的 fallback 只在写 `var(--x, fallback)` 时才存在；**跨组件的 token 作用域没有隐式继承**，元素不在那个作用域里就是没有。
- 修法：新根上**重新声明**用到的 token（值 1:1 抄自 `FanPage.astro`），并在注释里写明为什么。
- 这条对 `background` 同样成立（初始值是 `transparent`），所以症状会分成「黑」和「透明」两种，别只记住一个。

### 12.2 拍一个 600ms 的动画，不要跟它赛跑：**先冻住时钟**

`Page.captureScreenshot` 在这个页面上要 **300-600ms**（要回读一块 WebGL 表面）。破口只有 620ms，于是连续三次「按时」拍到的都是**已经结束**的画面——看起来像动画坏了，其实是取证方法坏了。

`输入/_scratch/fi-look.mjs` 的做法：等相位类名出现 → **冻住** → 再慢慢拍。

- ⚠️ **只冻你要看的那几个关键帧。** 第一版对 `document.getAnimations()` 全量设 `currentTime`，把还没结束的 `fiRise`（`fill: both`）一起倒回 140ms，十四朵云全被打回屏幕外，破口帧里一朵云都没有，看上去又像另一个 bug。正确的写法是：起云 `finish()`，只对 `fiFly`/`fiPuff`/`fiBloom` 设时间并 `pause()`。
- ⚠️ **JS 驱动的值冻不住。** 那个洞是 `requestAnimationFrame` 每帧写 `--fi-hole`，不是 CSS 动画，暂停所有动画也拦不住它。做法是把元素自己的 `style.setProperty` 换成忽略这一个属性的壳，再用保存下来的原函数写死想要的值。
- ⚠️ **覆盖层会自己删自己**（1s 计时器），第一轮拍到第二张时 `document.querySelector('.fi')` 已经是 `null`。给这个元素挂一个空的 `remove` 即可。
- 模板字符串里**不要写反引号**：注入的注释里写了 `` `currentTime` ``，直接把探针自己的模板字面量截断了（`SyntaxError: missing ) after argument list`）。

### 12.3 `setTimeout` 会迟到 300-600ms，绝对截止时间会切掉动画

入场里 `BURST_AT = 2100` 的破口计时器，在这页的渲染压力下实测落在 **~2400-2700ms**；它迟到的同时**所有跟着它起的 CSS 动画也一起迟**。第一版把删除写成一个绝对时刻（3000ms），于是碎片还在飞就被抹掉了。

- 规则：**后续相位的截止时间从「上一个相位真的发生」那一刻起算**，绝对时间只留给兜底（这里另有一个 5s 的防火墙）。
- 同一个坑的另一面：写探针时也别用绝对时刻断言相位（本仓库的探针已经因此误报过两次），要么读状态、要么读类名。

### 12.4 内联脚本的错误只有「页面异常探针」看得见

`CassetteShelf.astro` 里那段预热封面的内联脚本，读完了 `seen`、解析了 `urls`，然后调用一个**从来没定义过**的 `warmCovers`：每次打开 `/projects/` 和 `/lab/` 都在控制台抛 `ReferenceError`，预热也从来没生效过。`astro check` 看不见（内联脚本不在它的类型检查里）、构建通过、页面照常渲染。

- 规则：跑页面级探针时，**把 `Runtime.exceptionThrown` 和 `console.error` 收进断言**（`输入/_scratch/fan-intro.mjs` 里已是标准做法），并把 `astro dev` 下必然失败的 `/api/*` 请求白名单掉。
### 12.5 canvas 动画取证：给组件一个 `step(t)`，并给无头浏览器「焦点」

`FanIntro` 换成 canvas 版之后，上一节的 `getAnimations()` 办法整条失效——画面不再由 CSS 动画驱动，而是 rAF 里 `clearRect + drawImage` 画出来的。那一段留着的教训（截图比动画慢、要冻住时钟）仍然成立，换的是冻法：

- **组件暴露 `window.__fanIntro.step(t)`**：取消 rAF，只用第 t 秒画一帧（演示自己也有 `__cloudIntro`）。探针用它出图，一帧一次截图，随便每张多慢。
- ⚠️ **`frame()` 开头必须 `if (finished) return;`**：`step()` 取消 rAF 时可能已经有一帧在飞，那一帧会拿**实时时钟**盖掉冻结帧；超过 3.5s 时它还会顺手把整个入场拆掉，于是「拍到的是页面」看起来像动画坏了。
- ⚠️ **无头浏览器里后台标签的 rAF 会被节流**：同一轮里 `Target.createTarget` 开出来的标签不一定是活动标签，被节流时一次 rAF 都不跑——入场停在第一帧、`is-fi` 一直挂着、最后只剩 8s 兜底把它拆掉。症状是「同一份代码，上一次全绿、这一次三条时间断言全 null」。每个探针开完标签后加一句 `Emulation.setFocusEmulationEnabled({ enabled: true })` 即可。

### 12.6 页内时间戳，别用探针的墙钟

这一页截图要 0.3-1.7s，比破口(1.6s)还长。用墙钟在 2.9s 读状态，实际读到的是 ~4.1s 的状态（入场已经拆完了），于是「揭幕没发生」。正确做法是用 `Page.addScriptToEvaluateOnNewDocument` 在**文档开始**装一个 `MutationObserver`，把 `is-fi-revealed` 出现和 `.fi` 消失各自打一个时间戳，再读回来断言范围（实测 2374ms / 3533ms，与源码里的 2.35s / 3.5s 对得上）。

- ⚠️ 观察对象用 `document` 而不是 `document.documentElement`：文档开始那一刻 `<html>` 还不存在。
- ⚠️ 「消失」这一类时间戳要加「先见过才算」的守卫，否则文档开始时的空 DOM 会被记成一次移除（实测记成 12ms）。