# 滚动入场动效（scroll reveal）

**模块**：`src/scripts/scroll-reveal.ts` + `src/styles/global.css` §17
**入口**：`Layout.astro` 底部那个 `<script>` 里调用 `initReveal()`
**适用**：任何"内容进入视口时淡入上移"的需求

---

## 1. 设计约束（三条，每条都对应一个已修掉的坑）

### 1.1 钩子必须由 JS 添加，不能写在 HTML 里

隐藏态挂在 `html.js-reveal [data-reveal]` 下，而 `html.js-reveal` 与 `data-reveal`
**两个都由脚本添加**。所以：

- 脚本没加载 / 被拦 / 访客关了 JS ⇒ 什么都不隐藏，页面照常渲染
- 反过来做（HTML 里写 `data-reveal`、CSS 里无条件隐藏）⇒ 无 JS 访客看到空白页，
  其余人看到内容先闪一下再消失

### 1.2 只动 `translate` / `opacity`，绝不碰 `transform`

卡片的悬停抬升用的是 `transform: translateY(var(--hover-lift-card))`。
入场若也写 `transform`，两者会互相覆盖——谁赢取决于规则顺序，等于随机。
`translate` 是独立属性，**与 `transform` 叠加共存**，所以两者永不冲突。

⚠️ 这条有个可测量的后果：**不要把 `data-reveal` 标记到已经在用 `translate`
做自己布局的元素上**。目前这类元素只有两处：磁带架的抖动关键帧
（`CassetteShelf.astro` 的 `translate: -6px 0` 等）和导航栏移动端菜单链接。
标上去会让两边互相覆盖。

### 1.3 选择器特异性是 `html.js-reveal [data-reveal]`（0-2-1），是刻意的

`global.css` 在 `Layout.astro` 顶部被 import，**排在所有组件样式之前**。
同特异性的规则会因源码顺序输给组件样式，所以这里多带一个 `html` 类型选择器
压过 Astro 作用域规则的 `[data-astro-cid-…]`（0-1-0），而不用 `!important`。

### 1.4 ⚠️ `translate` 的"两值 vs 单值"由压缩器决定

隐藏态是 `translate: 0 var(--reveal-shift)`（两值），显示态若写 `translate: 0 0`，
lightningcss 会把它压成单值 `translate: 0`。已验证：单值对两值在当前 Chrome 下
**确实能插值**（实测 16 → 14.16 → 12.41 → … → 0），但这是个脆弱的巧合。
若哪天发现入场没有位移了，先看产物里这条被压成了什么。

---

## 2. 用法

### 2.1 给一个容器加一行属性（推荐）

```html
<div class="grid" data-reveal-group=".card" data-reveal-step="50">
```

- `data-reveal-group` 的值是**子元素选择器**，用 `querySelectorAll` 在容器内查
- `data-reveal-step` 是每项的错峰毫秒数，可省略（默认 50）
- 属性名必须在 `initReveal()` 跑之前就存在于 DOM 里（服务端渲染的元素天然满足）。
  客户端动态插入的内容需要在插入后自己调 `revealOn()`

### 2.2 或在脚本里显式调用

```ts
import { revealOn } from "../scripts/scroll-reveal";
revealOn(container, ".item", { step: 40 });
```

### 2.3 目前的挂载点

| 位置 | 选择器 | 错峰 |
| --- | --- | --- |
| 首页精选项目 | `.card` | 50 |
| 首页最新动态 | `.log` | 40 |
| 首页 Explore 卡片 | `.explore-card` | 50 |
| `/notes` 行 | `.note-row` | 40 |
| 项目详情页正文 | `article > h1, article > h2, article > figure, article > .tab-group` | 40 |
| 项目详情页图库 | `figure` | 40 |

**磁带架（`/projects`、`/lab`）故意没有挂**：它有自己的入场，且由
`window.__rrsIntroGate` 调度，再叠一层滚动入场会打架。

---

## 3. 行为细节

- **错峰上限 8 项**：第 9 项及以后不再累加延迟。长列表若按项累加，最后一项会被
  推迟好几秒，读起来是卡顿而不是编排。
- **入场后移除 `data-reveal`**：700ms（`EXIT_MS`）后移除，把元素交还给其余样式。
  延迟必须长于过渡时长，否则中途移除会让元素跳到终点、动画被吃掉。
- **每个元素只调度一次**：`seen` 是个 `WeakSet`，重复调用 `revealOn` 不会重复观察。
- **dev 模式立即入场**：`import.meta.env.DEV` 下直接加 `.is-revealed`。否则用无头
  浏览器截图/量 computed style 时，视口外的内容全是 opacity 0，测量结果全是假的。
- **`prefers-reduced-motion: reduce`**：`--reveal-shift` 归零、时长收到 220ms，
  只保留淡入（淡入有助于理解，位移才是会引起不适的部分）。

---

## 4. ⚠️ 不要再加"N 毫秒后全部放行"的兜底

曾经有过一个 `setTimeout(…, 2500)` 兜底，它**静默废掉了整个功能**：产物上实测，
所有元素在载入 2.5 秒后就被无条件放行，于是视口外的内容在屏幕外跑完入场动画，
滚到时已经是静止的——只有首屏 2.5 秒内可见的东西真正有动画。

它防的是"某个元素永远收不到 intersection 回调"，而这**不是真实的失败模式**：
IntersectionObserver 在 `observe()` 后的第一帧就会对所有目标回调一次（视口外的
报 `isIntersecting: false`），之后每次可见性变化还会再回调，所以目标不可能因为
"一直不可见"而被漏掉。真正"没有 observer"的情况由 `revealOn` 里的
`if (!io)` 分支兜住（立即全部显示）。

---

## 5. 交互副作用

`/notes` 的 tag 筛选会把行 `display: none` / `""`。一行可能在滚动经过时仍是隐藏的
（回调不触发，元素保留隐藏态），之后被筛选**显示出来**却还是 opacity 0 —— 看起来
像少了一行。所以三份 `notes/index.astro` 的筛选脚本里，把行显示出来时会一并
`classList.add("is-revealed")` + `removeAttribute("data-reveal")`。**改那段筛选逻辑时
别把这两行删掉。**
