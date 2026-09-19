# 主题切换 + 星空入场 — 完整规格

> 来源：原 `CLAUDE.md` 的「Theme switch is a wave of page COPIES」与「The starfield ARRIVES when the page lands on dark」两段（逐字搬运）。
> 涉及文件：`src/scripts/theme-transition.ts`、`global.css §15`（切换）与 `§10`（`sfArrive` 关键帧）。
> ⚠️ 最核心的一条：**任何「刚才是浅色主题吗」的判断都必须读模块级的 `visibleTheme`，绝不能读 `data-theme`**——连点期间根被停在 `NEUTRAL_THEME`（dark），读属性等于永远读到 dark。
> 决策 23 里有全部实测数字（拷贝逐像素 |Δ|、点击同步耗时 100ms→7.5ms 等）。

- ⚠️ **The starfield ARRIVES when the page lands on dark** (`sfArrive` in §10 + `arriveBackground()` in `theme-transition.ts`). Light mode sets `display: none` on the canvases, so without this the field is a hard cut on the landing frame — reported as "圆环覆盖过后，星空是直接刷新在画面上，这样太突兀了". ⚠️ **A CSS transition cannot fix it** (a transition needs the element already rendered, and `display: none` is not a value opacity can animate from), so the fade is a **keyframe animation** started by a class that `applyInstant` toggles on the frame after the swap and removes when it finishes — a class already present cannot re-trigger its own animation, so it has to come off. ⚠️ **Opacity only** — no `transform` and no `filter`: these canvases have `position: fixed` descendants, and either property makes the canvas their containing block and shifts the whole background stack. ⚠️ It belongs in `applyInstant`, NOT in `setRoot`: during a burst the root is parked on the neutral theme, so `setRoot` fires while the page is still covered by the copies and the fade would burn out behind them.
  - ⚠️ **It was wired to the WRONG THEME for a day, and the shape of that bug is worth keeping.** The condition was `next === "dark" && rootTheme() !== "dark"` — and during a burst the root is *parked* on `NEUTRAL_THEME` (`dark`), so the second half was false on every real click. The fade therefore only ever ran on a page load or a reduced-motion swap, which is where it was measured and declared working, while the click path cut the field in ("星空是突然刷新出来的"). The fix is the module-level **`visibleTheme`** — the theme the visitor is actually looking at, updated only in `applyInstant` and deliberately not by `setRoot` (which is also the parking) — and `applyInstant` compares against that. **Any "did we just come from the light theme?" question must read `visibleTheme`, never the `data-theme` attribute.**
  - ⚠️ **1.6 s, and `from`-only.** "一两秒的平滑从深到浅的渐入" is the spec: the rest of the page is already lit when the fade starts, so anything near a second still reads as the stars being switched on. ⚠️ The keyframe deliberately declares **no `to { opacity }`**: the two canvases have different resting opacities (`#starfield-canvas` 0.85, `#lens-canvas` 0.9, and the homepage renders the LENS one), so an explicit `to: 0.85` under `forwards` pinned the lens field 0.05 low and released it when the class came off — a visible bump at the end of every arrival on the one page the lens is on. With only a `from`, the 100% keyframe is the element's own computed value. Measured on a real light→dark click: `0 → 0.05 → 0.21 → 0.39 → 0.62 → 0.79 → 0.86 → 0.9` at the landing, class off at 1.7 s.
- **Theme switch is a wave of page COPIES, not a fill colour** (`src/scripts/theme-transition.ts`, §15 of global.css): each click stacks one full-page copy of the page on a `.theme-stack` (appended to `<html>`, `pointer-events: none`, `z-index: 2147483000` — above the navbar, or the reveal stops at the header) and animates that copy's `clip-path` from `circle(0px at X Y)` to `circle(R at X Y)`, so the incoming theme is revealed as *real pixels* rather than a disc of colour. ⚠️ **A filled circle cannot work here and that is the whole point of the rewrite**: it hides every word and card inside the growing ring, so the gesture reads as "the screen goes black, then the page surfaces out of it" — the circle and the emergence are two disconnected events. With copies, the pixels inside the ring are already final, so when the last one covers the viewport the copies are dropped in the same frame and nothing changes visually. ⚠️ **Why not the View Transitions API** (which gives those snapshots for free): only one transition can be in flight, so a second click during a reveal is dropped and the button is dead for the length of the animation. Copies have no limit: N clicks are N circles, all growing at once, alternating themes — the ripple. ⚠️ **The CLICK must not do the layout** ("切换依旧有点卡顿"): `cloneNode` + append is 1.4 ms, but the browser then lays out and paints ~700 nodes and that frame measured **101 ms** — a freeze exactly at the moment of the click. So a `pointerdown` on the switch warms what the next click needs (`buildWarm`, used only within `WARM_MS` 400 ms, so it is always a picture of the page being clicked), and the click path takes it via `claimWarm`. A keyboard activation has no pointer event and builds on the click as before. ⚠️ **The ripple tween is created paused and released one frame later**: the copy's first paint is its most expensive frame, and at radius 0 nothing of the copy is on screen, so the cost lands where it cannot be seen and the circle then grows over an already-painted layer. ⚠️ **Copies need a theme the root is not using.** Every light rule in the project is `:root[data-theme="light"] …`, and `:root` matches `<html>` no matter where a copy sits, so a copy of the *other* theme gets the live theme's rules handed to it. Two consequences, both load-bearing: (1) `buildScope()` re-emits every `:root[…]`-rooted rule (including the bare `:root` block, which is where the DARK tokens live — there is no `:root[data-theme="dark"]`) into a runtime stylesheet as `.theme-scope[…]`, and the copies carry that class; (2) for the length of a burst the root itself is parked on `NEUTRAL_THEME` (`dark`, the theme with no attribute-specific rules) and the pending theme is applied when the burst lands. Measured: without (1) a dark copy of the light-blocked footer and shelf panel rendered light (mean |Δ| 107); with it, 1.0–2.0. ⚠️ **`applyInstant()` — the landing must not transition.** `body` alone transitions its background/colour over 400 ms, so landing a burst with transitions live makes the page fade from the old theme to the new one *after* the copies are gone, which is the "surface out of the dark" artefact all over again. It adds `html.theme-land` (`transition: none !important`), swaps, forces a recalc, removes the class. ⚠️ **Do not `animation-play-state: paused` inside a copy**: a copy restarts its animations when inserted, so pausing freezes keyframe 0 (an entrance animation's *pre* state — the shelf's tapes render transparent; measured mean |Δ| 37 against 2.8 untouched), and `animation-delay: -3600s` is worse (106 — it lands on an infinite glow's bright phase). The shelf's entrance is JS-driven, so a copy has no entrance to replay; leave animations alone. ⚠️ **A copy does not create a backdrop root**, so its `backdrop-filter` panels sample the page *behind* the copy — set `backdrop-filter: blur(0px)` on `.theme-ripple` (paints nothing, isolates). ⚠️ Canvases clone empty (copy the bitmap by index), a cloned `<video>` starts a second decoder (freeze the frame into `poster`, cache it per burst), the copy is nudged by `margin-top: -scrollY` and re-nudged on scroll, and a copy that is the *same* theme as the parked root is skipped entirely (the live document already is that layer). ⚠️ **Reduced motion** never builds any of this (instant swap); a burst that never settles lands via a 1.6 s guard.

---

## 追加（2026-09-19）：parking 改成「保持主题」的 hold class，并删掉 base 拷贝

**用户报的现象**：「light mode 切换 dark mode 时，会出现磁带盒先变黑，其次才是圆环覆盖整个画面，看起来没那么自然」（反方向一直正常）。

**真因不是拷贝，而是 parking 本身**：一轮揭示期间根被停在 `NEUTRAL_THEME`（dark），这是必须的（见 `NEUTRAL_THEME`：浅色根会把 `:root[data-theme="light"]` 的规则交给深色拷贝）。代价是**访客当时正在看的那一页**会立刻变成 dark。反方向看不出来（被离开的主题本来就是 dark），但 light→dark 时这就是「点击那一帧整页换了主题」。

旧实现靠一层 **base 拷贝**（离开主题的整页克隆）盖住它。base 确实能盖住，但它是一张**从未被光栅化过**的整页图层：点击发生在同一个任务里，浏览器必须在「根已经被停掉」的那一帧把它画出来 —— 也就是说，访客等的是这张图的第一帧。这正好解释了为什么只有需要 base 的那一个方向不自然。

**修法：把 `buildScope` 已经在拷贝上用的那套重发机制，指向活的根。**

- `buildScope()` 现在对每条 `:root[data-theme=light]` 规则**额外**发一份 hold 版本（`holdSelector()`），只针对浅色规则；裸 `:root` 块不发（它就是中性基线）。
- ⚠️ **后代选择器必须从 `<body>` 重新进入**：`holdSelector` 把 `:root[data-theme=light] .foo` 改写成 `:root.theme-hold-light > body .foo`。拷贝的结构是 `<div class="theme-scope"><body>…`，挂在 `<html>` 下、与真 body **同级**，所以少写 `> body` 就会让 hold 规则伸进深色拷贝里、把浅色覆盖交给它 —— 正是 `buildScope` 存在的理由（当年实测 |Δ| 107）。裸 token 块没有后代，保持 `:root.theme-hold-light`，靠继承下发；每个拷贝自己都会重新声明 token。
- `holdRoot(leaving)` 代替 `setRoot(NEUTRAL_THEME)`：加/去 `html.theme-hold-light`，把属性停在 dark，并把 `color-scheme` 设成**正在显示**的那个主题。
- ⚠️ 用的是 **`burstLeaving`**（这一轮第一次点击时可见的主题），不是当前这一次点击的 `leaving`：快速连点时第二次点击的「离开主题」是第一个圆的主题，但整片波底下的页面仍是最初那个 —— 否则第二次点击会让活的页面翻色，正好暴露在第一个圆还没扫到的区域。
- `applyInstant()` 里**必须摘掉 hold class**（它只是暂存态），`dropLayers()` 里清掉 `burstLeaving`。
- **base 拷贝整套删掉**：`WarmSet.base`、`buildWarm` 里的 `make(leaving)`、`claimWarm` 的 base、`offsetClones`/`onRippleDone`/`dropLayers` 里的 `base`。点击路径因此少一次整页克隆（`buildWarm` 现在只备一份）。

**实测**（`/projects`，1700×900）：

- light→dark 点击后立刻读：`html.theme-hold-light` 在、`data-theme="dark"`、`getComputedStyle(body).backgroundColor` = **`rgb(240, 235, 224)`**（浅色纸）✓ 活页面仍是浅色。
- **把拷贝全部删掉再看活页面**：与点击前的浅色页面逐格比对，24×12 网格 **mean |Δ| 0.0、worst 1.7** ✓ 即活页面本身就是那一页，没有任何「先变黑」的帧。
- 同一时刻读深色拷贝里的 `.shelf-panel`：`linear-gradient(90deg, rgba(7,7,12,.42), …)`，而活页面（浅色）是 `rgba(248,244,236,.55)` ✓ 拷贝渲染的是自己的深色规则，hold 没有漏进去。
- dark→light：不加 hold class（离开的就是中性主题），活页面保持深色 ✓ 与改动前一致。

⚠️ headless 里 `Page.captureScreenshot` 单帧要 0.5–0.9s，**拍不到 620ms 的波**；上面所有结论都来自「同一任务里同步读 DOM」+「把拷贝删掉后拍活页面」这两种能绕开时序的测法。

---

## 追加（2026-09-19）：主题开关的「月亮滑到太阳」morph

用户要求：① 把筛选 chip 刚做的 Apple 式连续圆角也用到主题开关上；② 「星空/白天切换有丝滑动画过渡，比如月球往右侧移动，同时变色变成太阳」。

**第一件事做出来几乎看不见，先说清楚**：开关是 44×22、`border-radius: 3px`，`corner-shape: squircle` 在 3px 半径上的差别是亚像素级的 ✓ 所以加是加了（同一套 `@supports` 渐进增强），但**它是一次「处理方式统一」，不是可见改版**；要真的看出区别得先把半径抬上去。

**第二件事有三个各自独立的「不丝滑」原因，全都修了**：

1. **两个天空是同一个 `background` 在两个主题间切换** —— CSS **不能在两个不同的渐变之间插值**，所以整块底色是**直接跳变**的。现在夜空渐变留在元素上，白天渐变变成 `::before` 图层、只动 `opacity`（0.45s）：两端的画面和原来逐像素一致，中间全是真混合。⚠️ 绝对定位子元素的 `inset: 0` 覆盖的是**内边距盒**，所以 1px 边框不会被这层洗掉。
2. **月亮和太阳本来是两块完整的不同径向渐变**（`background: radial-gradient(...)` 各一套）—— 同样不能插值 ✗ 于是圆盘在滑动到一半时**啪地换色**。现在阴影（右上高光 + 左下暗部）抽成 `background-image` 由两个主题共用，只有 `background-color` 在灰 `#8d8d99` 与琥珀 `#f7b731` 之间插值 ✓。
3. **最关键的一条：这些过渡根本就没跑过。** 主题揭示落地时 `applyInstant()` 会加 `html.theme-land { transition: none !important }` —— 这是**故意的**（不加的话拷贝撤掉之后 `body` 还会自己淡入 400ms，就是「从暗部里浮现」那个毛病），但它把**整页所有过渡**一起干掉了，开关的也逃不掉 ✗ 所以滑杆和圆盘是在落地那一帧**跳**过去的。

**修法：改用关键帧动画。** `transition: none` 管不到 animation ✓ 所以落地之后由 `applyInstant()` 给 `<html>` 挂 `theme-morph-to-light` / `theme-morph-to-dark`，`Navbar.astro` 里十来个 `@keyframes` 接管 0.5s：滑杆（`--spring-gentle`，带一点点回弹）、圆盘变色、白天图层淡入、星星交给云。⚠️ 三条约束：① **每个 keyframe 的 `to` 都等于落到的主题下元素自己的状态**（所以一个 fill-mode 都不需要；也因此必须和 `theme-transition.ts` 的 `MORPH_MS` 同步）；② **只在真的换主题时播**（`cameFrom !== next`）——页面加载也会走 `applyInstant`，不挡的话每次翻页滑杆都会从错误的一侧滑进来；③ 挂之前要**先摘 class + 强制一次 recalc**，否则 `MORPH_MS` 内连点两次时第二次不会重播（已经挂在身上的 class 无法重放自己的动画）。

**实测**（1700×900、真实点击、页面内 rAF 采样）：

| t(ms) | 滑杆 x | 圆盘颜色 | 白天层 | 星星 | 云 |
| --- | --- | --- | --- | --- | --- |
| 1129（落地前） | 0 | `rgb(141,141,153)` 月 | 0 | 1 | 0 |
| **1213** | **10.49** | **`rgb(205,166,90)`** | **0.603** | 0.397 | 0.603 |
| **1297** | **16.83** | **`rgb(234,178,62)`** | 0.877 | 0.123 | 0.877 |
| 1471 | 20.59 | `rgb(246,183,50)` | 0.995 | 0.005 | 0.995 |
| 1573 | 20.13 | `rgb(247,183,49)` 日 | 1 | 0 | 1 |
| 1739 | 20（落定） | 日 | 1 | 0 | 1 |

滑杆带一次 0.59px 的轻微过冲再回落（`--spring-gentle`）✓；圆盘取到 **205,166,90** 与 **234,178,62** 两个真正的中间色 ✓ —— 改动之前同一段采样里**中间色样本数是 0**。五个量（滑杆、圆盘、白天层、星星、云）在 0.45s 内同步推进、同时收尾。

### 追加（2026-09-19）：「两次白天变黑夜」的修法 —— 让波里的按钮显示**正在离开**的主题

用户报：「点击触发全局变色，按钮从白天变成黑夜。全局变色完成后，按钮又变成白天，然后才是你做的太阳变成月亮的动画，然后按钮变成黑夜。也就是点击一次按钮，出现了两次从白天变成黑夜的动画。」

**成因是两层叠加**：① 波（整页拷贝）里那份克隆是**新主题**的快照，所以圆环扫过按钮时它就已经翻成黑夜了；② 落地后的 morph 动画为了「月亮滑过去」必须从**旧状态**起步 —— 于是它先把按钮推回白天再往前走 ✗ 两段白天→黑夜，中间还夹着一次回退。

**修法：让拷贝里的按钮显示正在离开的主题。** 拷贝的 `data-theme` 永远是**进来**的那个主题，所以「显示拷贝自己主题的反面」＝「显示正在离开的主题」——两个方向用同一对规则就够，不需要知道这一轮往哪边走：

```css
:global(html .theme-ripple[data-theme="dark"]) .theme-switch { /* 白天的样子 */ }
:global(html .theme-ripple[data-theme="light"]) .theme-switch { /* 黑夜的样子 */ }
```

（每条 6 个声明：天空层不透明度、滑杆位移、圆盘底色与阴影、星星、云。⚠️ 圆盘的 `background-image` 阴影两个主题共用，不用覆盖。）

⚠️ **两个坑**：① `:global(...)` 包住祖先部分是**必须**的 —— `.theme-ripple` 由 `document.createElement` 造出来、没有 `data-astro-cid-*`，普通作用域选择器会编译成 `.theme-ripple[cid] .theme-switch[cid]`，**一个都匹配不上**（这正是 v1.33 里 `.shelf-panel-tags span` 那条死规则的同款陷阱；克隆出来的开关本身**带** cid，因为它是真标记的克隆）。② 选择器里那个 `html` 是**为了特异性**：`buildScope()` 会把开关的浅色规则重发成 `.theme-scope[data-theme="light"] .theme-switch[cid]`（0-4-0）并**最后**插进 `<head>`，同权重的覆盖会在源序上输掉。

**实测**（真实点击 + 页面内 rAF 采样）：

| 阶段 | light → dark | 说明 |
| --- | --- | --- |
| 波进行中（570–924ms） | 拷贝里的开关 = **白天**（x=20、琥珀、天空层 1） | 圆环扫过时按钮**不再先翻黑** ✓ |
| 落地（1152ms） | 活页面 x=**11.25**、圆盘 `rgb(193,162,102)`、天空层 0.49 | 唯一的一段过渡 |
| 1452ms | x=**−0.54**（轻微过冲）、`rgb(141,141,153)` | |
| 1587ms | x=0、月亮、黑夜 | 收尾 |

dark → light 方向同样是一条：0 → **6.84**（`rgb(183,158,112)`）→ **13.49**（`rgb(220,172,75)`）→ 18.37 → 20.34 → **20.60**（过冲）→ 20 ✓。**一次点击只有一段白天/黑夜的过渡** ✓。

---

## 追加（2026-09-19）：morph 搬进拷贝 —— 按钮跟着圆环变，而不是等它走完

用户要求：「dark mode 切换到 light mode 时，先进行圆环，圆环覆盖完毕后再切换会显得滞后……我希望他们同步变化」。

上一节把 morph 做成了**落地后由活页面播**：`applyInstant()` 给 `<html>` 挂 `theme-morph-to-light` / `-to-dark`。它确实修好了「跳变」，但把两件事锁成了**先后**关系——圆环扫过去时按钮还是旧样子，只有圆环铺满、拷贝撤掉之后按钮才开始动。用户要的同步在结构上做不到：**活页面在圆环还在长的时候不能变**（它就是圆环底下的那一层）。

**修法：让拷贝自己播。** 拷贝是**新插入**的元素，插进去时浏览器必然从第 0 帧启动它身上的 animation —— 这正是「圆环扫到哪、按钮就变到哪」需要的语义。于是：

- `Navbar.astro` 里六条 `@keyframes`（`knobToLight` / `knobToDark` / `faceToLight` / `faceToDark` / `dayIn` / `dayOut`）保留不动，改由**拷贝专属**的两组规则挂载：
  ```css
  :global(html .theme-ripple[data-theme="light"]) .switch-knob { animation: knobToLight 0.5s var(--spring-gentle); }
  :global(html .theme-ripple[data-theme="light"]) .knob-face { animation: faceToLight 0.5s var(--ease-out); }
  /* …::before / .switch-stars / .switch-cloud 各一条；data-theme="dark" 一组镜像 */
  ```
- 键在**拷贝自己的 `data-theme`**（永远是**进来**的主题）上，所以「显示拷贝主题的反面」＝「显示正在离开的主题」——与 v1.41 那一节同一条推理，一次覆盖两个方向，谁都不用知道这一轮往哪边走。
- **`applyInstant()` 里的 `theme-morph-*` 机制整体删掉**（含 `MORPH_MS` 与那个定时器）：活页面在落地这一帧**已经是新状态**了，再 morph 只会先把它推回旧状态再前进 —— 那正是 v1.41 修的「两次白天变黑夜」。现在一次点击只有**一段**过渡，而且这一段发生在圆环里。

⚠️ **顺手修掉一处静默失效（本次复查发现）**：`Navbar.astro` 里那段「拷贝里的开关」说明文字**有半截写在注释外面**（`*/` 提前结束，后面 14 行说明变成了裸 CSS 文本）。浏览器的错误恢复会把这段文本连同**紧跟其后的第一条规则**一起当成一个畸形选择器丢掉——丢的正好是 `…[data-theme="dark"] .theme-switch::before`（天空层那一条）。修法是把注释合回去。⚠️ 这类「文档写进样式表」的坑与 `pitfalls.md` 里「`<style>` 里多一个 `{` 会静默吞掉后面所有规则」同源：**改完 CSS 注释要在 `document.styleSheets` 里确认关键选择器真的在**，别只看源码。

**实测**（1700×900，真实点击主题开关）：

- 解析后的样式表里 10 条拷贝规则**全部存在**（`html .theme-ripple[data-theme="dark"|"light"] .theme-switch[cid]::before` / `.switch-knob[cid]` / `.knob-face[cid]` / `.switch-stars[cid]` / `.switch-cloud[cid]`）✓ 没有一条被畸形选择器吞掉。
- 点击后 300ms，拷贝里那份开关读到 `animationName` = **`knobToLight` / `faceToLight` / `dayIn`**（拷贝带 `data-theme="light"`，即显示正在离开的深色）✓ 动画确实挂在**拷贝**上，不是活页面。
- 1.5s 后：拷贝 0 个、`document.documentElement.dataset.theme = "light"`、活页面滑杆 `matrix(1,0,0,1,20,0)`、天空层 `1`、活页面 `animationName` = **`none`** ✓ 落地后活页面不再自己 morph。
