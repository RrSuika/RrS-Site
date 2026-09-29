# 磁带盒书架 — 完整规格与陷阱

> 来源：原 `CLAUDE.md`「cassette shelves」整段（逐字搬运）。
> 涉及文件：`src/components/CassetteShelf.astro`（六页共用）、`src/scripts/shelf-tuner.ts`（**临时**调参面板，数值定稿后要删）、`src/utils/translations.ts` 的 `shelf` 段。
> 名词表（和用户沟通统一用词：观察窗 / 轮盘井 / 中心孔 / 辐条 / 井沿细环 / 铭牌 / 走带路径 / 浮雕型号 / 书脊 / 空磁带）在 `AI_CONTEXT.md` §5.3。
> 决策背景与全部实测数字在 `decisions.md` 决策 22b；CDP 验证方法在 `pitfalls.md` §6。
> **下面每一条都是约束，不是描述。** 先读一遍再动手，改完按最后一条复验。
> **最后追加的一节（2026-09-19）是当天的最新状态**：三个宽度控制（`--window-w` / `--plate-w` / `--well-inset`）怎么区分、已烘焙的 token 值、走带线为什么删掉、INSPECT 按钮与筛选 chip 的重做——**改这块之前先看那一节**。

- **`/projects` and `/lab` are cassette shelves, not card grids** (2026-09-18, four passes the same day): `src/components/CassetteShelf.astro` renders all six listing pages (en/zh/nl × projects/lab). Each entry is a **cassette tape on an archive shelf**. On load the shelf fades in from black, the tapes rise from below **left→right** (locked to their own slot's X, edge-on throughout, scale 2.05→2.30 — the intro reference's ladder), then the selected tape is pulled toward the viewer and turned **15°** so its **left spine and bottom edge** read in 3D as it gets the only warm key light. **Eleven tapes are painted** — the selection plus four either side (nine readable), packed at 0.45 of their own width apart, the rear wall at the reference's 58° and receding hard in Z — and a short shelf is padded with **blank cassettes** that carry no link and can never be selected. Right panel = the record brief with a filled `INSPECT FILE` button; click = transition into the detail page; **drag = the row follows the pointer continuously and glides to the nearest tape on release** (see the drag bullet below). Chunky frameless V-arrows Q-bounce at both screen edges, in phase and outward together.
  - ⚠️ **The step's timing is copied from the reference, not invented**: `progress === 0 ? 620 : 380 + distance·180` ms, `easeOutQuart` — the arrow and wheel path. ⚠️ **And the rotation must NOT depend on `progress`.** The reference's `layoutPose` reads the slot alone; an earlier revision blended the hero toward edge-on while the row travelled, which swings the selected tape 60° mid-step and is what made a 620 ms transition feel abrupt. The tape slides and recedes — it never turns against the motion.
  - **THE DRAG IS A CONTINUOUS ROW, NOT A SWIPE SWITCH** (2026-09-19: "慢慢拖能慢慢拖动磁带，而快速的拖能快速切换多个磁带，同时松开后根据拖动的力度加一个缓存渐出的体验"). ⚠️ The old gesture only ever measured `dragStart → now`, clamped `progress` to ±1.15 and asked one question — did the pointer travel `max(92px, 6.5vw)`? — so a 300 px drag, a 600 px drag and a 3000 px drag all did exactly the same thing.
  - **THE RELEASE IS: the landing IS the travel, and the re-base happens ONCE, at the end.** Dragging past five tapes lands on the fifth. `dragOffset` is the pointer's whole travel, `SLOT_DRAG()` (`clamp(170px, 17vw, 280px)`) buys one slot, `progress` is the resulting offset in slots, and `settleDrag` rounds it and moves `current` by the whole distance in a single `recycle` call — which is what keeps `ring − current + progress` invariant, so the painting never moves under the drag. ⚠️ **Two earlier revisions threw the magnitude away** and kept only `Math.sign(progress)` or clamped `progress` to ~1 slot, which is exactly the pair of reports "水平移动拖到一定距离就无法继续拖动，而这时才拖动了 2 个磁带盒的距离" and "无论我滑动多块，比如从 1 滑动到 5，松开鼠标后又会回退到 2 而不是 5". Normalising `current` mid-drag, or in single steps, is what forces that clamp. ⚠️ **`progress` grows to the RIGHT** (the row follows the pointer), so the tape at the centre while the row is held at `progress = p` is the one with ring index **`current − p`** — `settleDrag` must therefore land on `dest = current − land`, never `current + land`, and `recycleFromSpring`'s slack is `over = round(spring.target) + step` (the recycle needs the row on `−step`, and `recycle` preserves the picture only when its argument is `−progress`). Getting either sign wrong picks the tape *behind* the pointer and re-bases the ring by `2·land` in one frame — reported verbatim as "从左往右拖，比如从 5 拖到 4，松开鼠标后会变成拖到 6"，mirrored on the way back. ⚠️ Velocity is only a **tie-break** on top of the round (`FLICK_COMMIT` 2.6 sl/s, one slot at most) — a projected throw `v0/(e·rate)` added to the position was tried and does not work: it reaches a whole slot at ~7 sl/s, so it is either too weak to matter or makes an ordinary quick flick overshoot two tapes. ⚠️ The tie-break is `land = max(land, ceil(progress))` for a rightward flick and `min(land, floor(progress))` for a leftward one: the flick may carry the round to the **next whole slot in the direction of motion**, never a slot beyond it. The earlier `land ±= 1` did not check, so any release above the threshold added a whole slot on top of a round that had already committed one — a 0.8-slot flick skipped a tape the drag never reached.
  - ⚠️ **Three quantities on the spring, and mixing any two of them has produced a bug**: `target` (the slot offset the solver runs on = the raw landing, so the drop can settle in the scenery), `dir` (the distance it has left to run = `target − value`), and `dest` (the RING INDEX the selection ends on, clamped to a real tape). `recycleFromSpring` must read `dest`; it read the solver's travel once, which is `land − progress` and therefore **zero** whenever the release happened to land on a whole slot — so every clean drag settled straight back where it started.
  - ⚠️ **`snap.to` and `recycle`'s argument have INVERSE signs.** A forward step (a higher ring index) is `progress = −1` but `recycle(+1)`, and the step tween ends with `recycle(−snap.to)`. So the slide-home tween must end on **`−step`**. Ending it on `step` moved `current` by `−step` — a drag that should land two tapes forward jumped to the wrong end of the archive.
  - ⚠️ **`recycle` needs a range that admits BOTH the overshoot and the walk back in.** The re-base range is the walkable band **plus the one blank past either end**, not the ring's own ends: with the ring's ends the step that walks a blank's row home was refused, `snap.active` stayed true for ever and `lock` never cleared. And `dest` must never be constrained to `current ± DRAG_MAX` — on a short archive a long drag then gets clamped to a slot *behind* the start and the release walks the row backwards.
  - ⚠️ **The ring is sized for the DRAG**: `ring ≥ n + 2·(span + DRAG_MAX)`. `span` is the park lane `recycle` needs to keep the band paintable, `DRAG_MAX` is how far one gesture can travel, and the landing it re-bases onto has to be inside the ring. `MAX_FILLERS = 6 × MAX_SLOT_COUNT` (24 blanks) is what pays for it. Raising `DRAG_MAX` without raising that walks the painting off the end of the ring.
  - **A blank may be RE-BASED onto but never SELECTED.** The landing is clamped to a real tape; the *drop* is not, so a drag that overruns settles in the scenery. ⚠️ When the two differ the difference is **slid** away rather than assigned — the `snap` tween runs `progress` to `−step` and the `recycle` at its end finishes the move, so the visitor sees the blank slide out and the neighbouring tape slide in. Assigning it outright snaps the whole row sideways in one frame, which is the "空磁带盒直接消失，最近的有内容磁带盒直接刷新闪现出现" report.
  - ⚠️ **`recycle`'s "settled on the current slot" branch keys on `step`, not on `|progress|`** (a slow release settles at a whole target while `progress` is still hundredths, and the step got dropped). ⚠️ `dragSamples` must be cleared per gesture, and the release velocity is a **least-squares slope** over the window (two-point differencing collapses to noise at a low pointer report rate). ⚠️ **`GLIDE_RATE` 5.4 is separate from `SPRING_RATE` 9.2** on purpose: `1/rate` is the damping time constant, and 9.2 settles in ~110 ms, which reads as the tape being snatched rather than gliding.
  - ⚠️ **`prefers-reduced-motion` is a landmine when PROBING any of this.** Headless Chrome reports `reduce`, which switches off every entrance animation here (the shelf's curtain, the intro's moves, the starfield's arrival). A CDP test must `Emulation.setEmulatedMedia` to `no-preference` or it measures the reduced-motion branch and reports "the animation does not run".
  - **Neighbours are OPAQUE, dimmed and (in the dark theme) cooled — never translucent.** A see-through tape mixes with the starfield behind and the row reads as ghosts. `.cas-f::after` carries the tint and `--cas-beneath` (1 for everything but the selection) gates it, so the artwork recedes while the object stays solid. Dimming a *dimmed* neighbour all the way to nothing just leaves blank spines, which is the "spine titles are unreadable" complaint.
  - ⚠️ **NOTHING on a tape fades with `opacity` except the ring enter/leave (`--cas-o` = `tape.vis`) and the intro.** The cover crossfade above is GONE (2026-09-18): dimming the printed cover toward 0.8 as a tape turned edge-on made every neighbour's front plate see-through, so each tape showed the tape behind it and the row read as stacked translucent volumes — worst on the light theme, where the bleed is warm and obvious. Depth rides on the opaque veil, the Z separation and the scale. If a future pass wants the reference's crossfade back, it has to be a *veil* (an overlay inside the face), never alpha on the tape.
  - **The shell is a MATERIAL, themed by tokens on `.cas`**: `--shell-top/mid/bot`, `--shell-spine-a…d`, `--shell-edge-*`, `--shell-back`, `--shell-rim/inner/hi/ao/seam`, `--relief-hi/lo` (one light source, top-left, for every raised/recessed part), `--gloss-a/c` (the shell's specular sheen), `--metal-*`, `--shell-ink*`, `--glass-lip/edge/cavity-*`, `--plate-frost*`, `--blank-*`, `--shell-dim-*`, `--tape-drop-*`, `--key-glow`, and the reel set `--reel-*`. ⚠️ **The light theme is WARM GLOSSY PLASTIC — off-white/pale-buff with a real corner sheen** (2026-09-19: "冷铬银外壳不是很贴合，那个时代更多是一种偏黄偏白的塑料，带高光感的"). Read this together with the pass it replaces: the *first* warm attempt collapsed into mud ("像屎黄色") because the shell, its shadows and the page were all the same temperature, and the cool-chrome answer over-corrected. The rule is therefore **warm body, cool shadow, one real specular** — `--shell-*` are warm white (`#ffffff`/`#fbf5ea`/`#e4dbc6`), but `--tape-drop-*`, `--wall-drop` and `--shell-dim-*` stay **cool blue-grey**, which is what gives the warm body something to sit against. ⚠️ **The light theme has now been lifted TWICE** (2026-09-19): first "外壳太暗了，导致侧面标题看不清" (the shell sat a step darker than the page and the veil took another 45% off it), then "做的亮一些，现在太暗了，给人很闷的感觉". ⚠️ **"闷" has a measurable definition here: the shell was DARKER than the page it stands on.** Measured with the pixels classified per element (`elementFromPoint` — the faces are `pointer-events: none`, so a plain hit test sees through them): shell mean **229.5** against a page mean of **197.3**, i.e. **Δ +32**, where the previous pass had the object *below* the paper. ⚠️ The specular goes UP with the body (`--gloss-a` 0.4 → 0.62): on a near-white moulding the sheen is the only thing separating "glossy plastic" from "paper". This is also what the cassette-futurism references do — bone body, one hard specular, cool shadow ([aesthetic overview](https://aesthetics.fandom.com/wiki/Cassette_Futurism), [palette](https://raw.githubusercontent.com/taotao7/theme-tape/main/themes/cassette-futurism/palette.toml), [design notes](https://webclips.jp/design/cassette-futurism/)). The sheen lives in `.cas-label::before` as a **corner falloff anchored outside the top-left** (one gradient per theme); ⚠️ it must never become a diagonal BAND across the face — that reads as a sticker lying on the artwork and is what got the earlier sweep deleted. `--shell-ink*` must flip per theme or the spine titles vanish. The dark theme is unchanged graphite.
  - ⚠️ **THERE ARE TWO SHADOWS UNDER A TAPE, and the light theme now has NEITHER.** (1) the per-tape cast pair — `--tape-drop-far/near`, `--tape-drop-short` and `--wall-drop` on the faces; (2) `.shelf-floor`, the blurred **elliptical ground shadow** the whole row stands on, centred under the selection. Removing only (1) left (2) sitting there looking exactly like a tape shadow, which the user caught: "你只去除了所有磁带盒的下方阴影，但实际上有两种阴影存在". Both light-theme sets are now transparent/`none`, measured as a flat 232–234 across the floor's 900×76 rect against a 55-luminance dip before. ⚠️ Write them as **`0 0 0 rgba(0,0,0,0)`, never `none`**: every one of them is used inside a comma-joined `box-shadow` list, and `none` is only valid as the property's SOLE value — using it there drops the whole declaration and takes the shell's bevel insets with it. ⚠️ The **dark theme keeps both**: against black they are what stops the row floating.
  - **The reels and the window are MATTE and RECESSED, lit rather than ringed** (2026-09-19: "磁带盒内部的轮盘和旁边的框则是哑光凹陷，而不是现在这样这么明显的高光渐变。这会让质感很廉价"). ⚠️ **No highlight ramp anywhere inside the well**: `--reel-cavity` is a flat fill, `.cas-reel-hub` is a plain dark bore, and the recess is carried only by two hairline insets (near wall dark, far wall light) plus one hard-edged `radial-gradient` occlusion band in `.cas-reel::after`. A crisp bright ring or a lit hub face reads as a chrome button. The tuned values are baked into `:global(:root)` (see the tuner note below); `hub light X/Y` and `hub lit` were deliberately removed from the panel and their plumbing deleted.
  - **The plate between the hubs is FROSTED TRANSLUCENT PLASTIC** (2026-09-19: "磁带盒中间的那个长方形长框改成磨砂塑料质感，目前的看起来太金属了"): a milky low-contrast fill (`--plate-frost`) with a wide vertical falloff in `::before`, **no bright edge anywhere**. The metallic version was a near-black fill plus a single bright rule along its bottom edge and a glowing tick — a black bezel with a specular line *is* chrome. ⚠️ In the light theme `--plate-ink` is deliberately *light* (`rgba(255,252,242,.86)`): the milky fill composites over the dark window cavity into a mid-tone, so dark ink on it is the low-contrast option. ⚠️ **It is SIZED BY TOKENS now** (2026-09-19: "我希望调整磁带盒那两个环后面的窄长方形框的长宽和透明度"): `--plate-w` (a share of the window; capped in practice by the gap the wells leave), `--plate-h` (in the plate's own em, floor 4.2 in the panel because the two rows need ~4.05em) and `--plate-alpha` (scales the FROST FILL only — do not replace it with `opacity` on the element, which would fade the printed mark with it). **Shipped values: 39.5% / 4.7em / 0** — the plate is the print and its hairline ring with no milky fill at all, which is the tuning the user settled on. It was `flex: 1 1 auto` before, i.e. untunable. ⚠️ It is `flex: 0 1 auto` + a width, NOT `max-width: calc(100% - 2 * var(--reel-size))`: the `em` inside a `calc()` resolves against the **plate's** font-size (0.46em of the tape), so the wells would be subtracted at a fifth of their real size and the frame would overrun them. Because the wells are rigid (`flex: 0 0 auto`) the plate is the only item that can shrink, which is what caps it safely. ⚠️ `--well-gap` (the window's flex gap) is NOT the same control as **`--well-inset`**: the wells are spaced by `justify-content: space-between`, so the gap only closes the middle and each well stays pinned to its own edge of the window. The inset is extra inline padding and is what actually pulls both wells toward the centre — shipped at 2.8em, which takes their centres from ±39.6% to ±22.2% of the tape width (a real cassette is ≈±21%). ⚠️ Budget: two wells + two gaps eat ~121px of the window's ~340px content box, so past ~2.9em the plate is squeezed below its `--plate-w` and past ~4.3em its print clips. ⚠️ **The title is bottom-anchored and grows UPWARD**, so `bottom` has to clear the window's bottom edge for a TWO-line title: at 25% its top landed at 39%, straight across the smoked frame (reported as "标题和背后的黑框重叠"). It ships at **10.5%**. ⚠️ The header row needs `line-height: 1.2`: with `normal` the node measured 18.31px against the date's 15.35px at the same font-size, so `align-items: center` centred two different boxes and the date sat 4.5px high. ⚠️ Under the type code sits the **tape-length scale**: `100 / 50 / 0` left to right (`.cas-plate-nums`) over a tick strip (`.cas-plate-ticks`) — one element with four background layers (three hard majors pinned at 0/50/100% + `repeating-linear-gradient` minors every 10%), not eleven spans per tape. ⚠️ **Each number is CENTRED ON its tick** (`position: absolute` at 0/50/100% with `translateX(-50%)`), and the strip carries `padding-inline: 0.55em` so the end numbers' overhang stays inside the plate's `overflow: hidden`. `justify-content: space-between` put their *edges* on the ticks, so 100 sat half a glyph right of the left major and 0 half a glyph left of the right one — measured off, and worse the wider the frame was tuned (2026-09-19: "刻线正下方应该是对齐数字文本的中间"). ⚠️ The numbers reset the plate's 0.22em tracking to 0: tracking meant for a word makes three figures run together and stops the row reading as a scale.
  - **The BEZEL is a token** (`--shell-frame`, 0.7em ships): `.cas-label` is `inset: var(--shell-frame)`, so the shell gradient behind it shows as a frame around the printed J-card. Raise it and the frame thickens while the artwork shrinks — measured at 0.7em: a 12px bezel, label 411×254 inside a 434×277 face; at 1.6em: 27px and 381×224, with the window shrinking with it (361 → 335) because the whole deck is positioned as percentages of the label. 0 restores the old full-bleed card.
  - **The TOP BAND** (`.cas-recess`) is the moulded strip across the top of the face, drawn in the window's own material language (smoked cavity, hard lip at the near edge, hairline of light on the far one) because on the real object they are the same part. Height is `--recess-h` (1.9em ships) and the record line sits inside it. ⚠️ The user asked for "正面顶部那个矩形的结构，我不知道是不是叫观察窗" — this is the reading of it that was built; if they meant a *second* window with a visible pack, or the write-protect tab, the element is one div and it moves.
  - ⚠️ **`.cas-deck-idx` (the `05 / 06 / 07` at the top-right) is GONE** (2026-09-19: "右上角的 05 06 07 这样的数字去掉，他在其他地方已经重复出现过了") — the record number already appears on the panel, on the spine and in the footer readout. Do not bring it back without removing one of the other three. ⚠️ **The spine's "metal cap" is GONE too** ("dark mode 下的书脊的上方有一个白色渐变，对应 light mode 下有个黑色渐变，去掉他"): `.cas-left::before` / `.cas-right::before` was a `--metal-mid → --metal-lo → rgba(0,0,0,.5)` gradient across the top 6% of each spine — a bright white lip in the dark theme and a black one in the light theme, on the two faces that carry the printed title. The spine's own moulding already reads as capped through `--shell-spine-a`, so nothing is missing.
  - **The panel's tags and the filter chips** (2026-09-19: "里面的 tags 不够明确，可以做成比如 #Industrial Design #Sheet Metal 同时改成点缀色" + "tags 筛选的几个按钮，做成鼠标移动上去时进行动画，点击则按钮固定成橙色。参考首页的 ▶ ACCESS PROJECT DATABASE 按钮交互动效"): the panel tags are `#Tag` (the `#` is added in `updateUI`, never in the content — the tags are filter keys matched by exact string) and take ONE accent colour (`color-mix(accent 42%, transparent)` border, `9%` fill) instead of the three-stripe rotation, which read as a legend of three categories that do not exist. The chips reuse the hero CTA's gesture: an accent panel in `::before` at `translateY(101%)` sliding up over 0.4 s on hover (101, not 100, so the pill's radius cannot leave a hairline of accent at the bottom edge), and `.active` parks that fill for the current filter. ⚠️ **The chip needs `isolation: isolate` for the `z-index: -1` fill to stay behind its own text rather than behind the page.**
  - ⚠️ **A SCOPED RULE CANNOT STYLE A JS-CREATED CHILD.** `.shelf-panel-tags span` had been **dead for as long as it existed**: Astro compiles it to `.shelf-panel-tags[cid] span[cid]`, and the tags are built by `document.createElement("span")` in `updateUI`, so they never carry the scope attribute and the selector matched nothing. The tags rendered with the panel's inherited colour — which is *why* they read as "不够明确". The fix is `:global(.shelf-panel-tags span)`. **Any style for an element this component creates at runtime needs `:global()`**, and the same trap applies to the panel's status mark, the tag counts and anything else injected after hydration.
  - **A blank cassette is an UNWRITTEN TAPE, not an empty slot** (2026-09-19: "给空磁带做一个好看点的设计，现在封面什么都没有，可以加入比如磁带盒的默认外观"). `.cas-blank` carries a printed brand header band (`.cas-blank-header`, `{brand}` + `TYPE I`), a lighter paper pocket (`.cas-blank-sheet`), four writable rules (drawn as one `background-image` on `.cas-label-fallback` with `background-size: 100% 42%` / `position: 0 33%`, so they land inside the pocket) and a neutral type code (`.cas-blank-type`, `LOW NOISE · C-60`). ⚠️ **No accent stripe and no spine stripe** — an unused tape is the quietest object on the shelf — and the reel spokes are hidden because the well holds a full pack. The type code is deliberately language-neutral; do not add translation keys for scenery.
  - **The guide rollers under the reels are GONE** (2026-09-19: "两个大环的下面有一个小球，这个球去掉"): the two `0.42em` spheres on `.cas-path` read as beads stuck to the window. Only the ribbon is left. Do not bring them back.
  - **TEMPORARY: the shelf tuning panel** (`src/scripts/shelf-tuner.ts`, imported at the top of `CassetteShelf.astro`'s script): a chip at the bottom centre opens a draggable frosted panel with **four groups** — **REELS** (the two wells and their bores: `--reel-*` plus `--well-gap`), **PLATE** (the narrow frame between them: `--plate-w/h/alpha`), **SHELL** (the moulding: `--shell-frame`, `--recess-h`) and **HERO** (writes `window.__shelfTune`, read by the pose through `TUNE(name, constant)`) — a COPY button and a RESET per group, persistence in `localStorage["rrsuika-shelf-tune-v1"]`, `` ` `` toggles it. ⚠️ **The reel defaults therefore live on `:global(:root)`, never on `.cas`**: a custom property declared on `.cas` shadows the inherited inline value from `<html>` completely, which is exactly why the REELS sliders did nothing while the HERO ones worked. Defaults belong at the root of the scope so an override from above can win. ⚠️ `TUNE()` reads `window.__shelfTune` on **every call** — the panel publishes a fresh object per change, and caching the reference silently freezes the pose. ⚠️ Both groups' defaults are the **shipped** values, so RESET returns to what ships. ⚠️ **It exists only until the numbers are chosen**: bake them into the CSS token block and the pose constants, then delete the module, its import, the `TUNE()` indirection and the temporary `window.__shelfProbe` / `__shelfSeat` read-outs at the end of the component script. ⚠️ **The hub controls are `--reel-hub-w` / `--reel-hub-h`** (2026-09-19: "给我添加能移动 hub 的长度和宽度的变量，能调整 hub 的质感和透明度的变量") — one `--reel-hub-inset` could only ever describe a circle, so the bore is now positioned by `left/top: 50% + translate(-50%,-50%)` and sized in both axes (32%/32% ships, the same disc the old `inset: 34%` drew; unequal values give an ellipse). Alongside them: `--reel-hub-alpha` (the bore's opacity — below 1 the spokes read through the face), `--reel-hub-gloss` (depth of the radial falloff on the face) and `--reel-hub-grain` (a fine machined ring set). ⚠️ Gloss and grain **ship at 0**, i.e. dead flat matte: a knob that ships at 0 cannot quietly re-introduce the highlight ramp the user rejected, and the face is drawn in `.cas-reel-hub::before` with `calc()` inside the alpha so one slider scales a layer without a second property to keep in step.
  - **The reels turn on the SELECTION ONLY, and always** (2026-09-19: "圆环只在拖动状态下才会动…我希望是选择的磁带盒的圆环播放，其他磁带盒处于静止"): the condition is `!reduceMotion && hero.abs < 0.5` with a slow idle rate (0.22 rad/s) that spins up while the row is busy. It used to be `hero.abs < 1.7 && rowBusy`, i.e. the whole shelf was frozen at rest and only came alive during a drag. Nine tapes keep a fixed angle — which is also the cheapest state, since `--reel-spin` drives a `repeating-conic-gradient` repaint.
  - ⚠️ **The row-wide pitch is not a "look at the hero's bottom" control.** `RX_BASE` tilts all ten tapes together (reported the moment it was tried); the selection has its own `RX_HERO`, faded with the same `heroMask` falloff as `LIFT`, which moves the selected tape alone.
  - **The shell hardware** (2026-09-18; user brief was neumorphic relief, silver screws, a real window with product detail, frosted/gloss/metal, and then "质感很好，但是螺丝太丑了，去掉他们" + "新增的磁带中间框很丑，看起来很廉价"): ⚠️ **the four corner screws are GONE** — do not bring them back; a screw drawn in CSS at 26 px reads as a pale dot, not hardware, and forty of them made the row look like a toy. What remains is a moulded J-card lip (`.cas-label::after` — bright top-left / dark bottom-right insets), an embossed model code (`.cas-mould` — transparent text with a light/dark `text-shadow` pair), a matte recessed window carrying two hub wells, the tape ribbon (`.cas-path` — ⚠️ **its two guide rollers are gone too**, see above), and inside the window ONE mark (`.cas-plate` + `.cas-plate-mark` + a 2 px accent tick). ⚠️ **The diagonal gloss sweep on the front is GONE** (2026-09-19: "去掉目前磁带盒正面的斜高光") — a specular band across a cover image reads as a sticker lying on the artwork, not as light on plastic. The sheen that the light theme *does* want is a **corner falloff** on `.cas-label::before` (top-left, anchored off the corner), never a band; and it goes on the **shell**, never across the printed J-card. ⚠️ **Both the well and the hub are RECESSED, not raised** (2026-09-19: "轮子从目前的凸起改成凹陷，弱化质感"): inside a dent the far wall catches the key light and the near wall falls into shadow, so the bright edge is the bottom-right and the dark one the top-left — the inverse of every raised part on the shell, verified by sampling the hub's top vs bottom (dark: 25 vs 54, light: 29 vs 59). And since the matte pass, keep the contrast *low*: the spokes sit at 0.25 alpha because they are structure behind glass, not a gear. ⚠️ **The plate is the lesson about small type**: the first version stacked three 5 px lines and a fake barcode, which measured "cheap" on sight. At a 400 px tape the window is ~65 px tall, so anything under ~7 px with normal tracking is printed noise. One line, 0.46 em, 0.22 em tracking, plus the accent tick that carries the only colour. ⚠️ **Prefer hard edges and radial gradients over blurred insets** for anything on all ten tapes: a step measured +6.6 ms/frame with a cold raster (0–2 ms warm) against a headless baseline of ~80 ms. ⚠️ **Never trust a shell measurement without checking the stylesheet parsed**: an unmatched `{` in this component's `<style>` silently drops every rule after it (browser keeps going, `astro check` and `npm run build` both pass, the shelf renders partially undetailed). Check the brace balance of `<style>` and confirm the new selectors are in `document.styleSheets` before believing any layout, colour or pacing number.
  - ⚠️ **The light theme's neighbour veil is LIGHT, and the spine titles are why** (`--shell-dim-a/b` **0.18/0.28**, against the dark theme's 0.68/0.84; the two passes before it were 0.40/0.54 and 0.26/0.38). The light spine titles are dark ink, so the veil is what decides their contrast — at 0.40 over the old mid-tone spine the composite measured **2.6:1** on the worst neighbour (below the AA-large floor), and a 0.72 em title at 2.6:1 is mush. Measured A/B on the same five neighbours, sampling each title's rect and taking the 90th/3rd luminance percentiles: **2.6:1 → 4.4:1 worst case, 5.02:1 → 6.25:1 mean**. ⚠️ The veil stays **cool** — a warm veil on a beige shell just makes the neighbours a darker version of the selection — and it is now thin enough that the row's ordering comes from Z, scale and the key light rather than from shade.
  - ⚠️ **Centring lives in one line**: `current = clamp(half, walkFrom, walkTo)`. The painted band is `current ± half`, so the hero is only at screen centre when it sits exactly `half` positions along the ring.
  - ⚠️ **The ring must be long enough for the band AND the step.** The painted band is `current ± half`, and `recycle` may only re-base onto a slot the band still fits around — so the floor is really `n + 2·span`, not `n + 2·half`. ⚠️ With `2·half` a nine-tape archive had exactly zero slack and every drag ran into the wall. A short archive is padded to at least the full row (`2·half+1`) with blanks; a long one is padded by `span` at each end (`buildRing`'s `slack`), and the extras sit off-stage.
  - ⚠️ **Read the session handoff BEFORE the first render.** `updateUI` is what *writes* `rrsuika-shelf-card`, and `buildRing` calls `updateUI` — so reading it after the ring is built reads back the value boot just wrote (always "0"), silently resetting the card on every language switch. The read is at module scope, once.
  - ⚠️ **One position formula.** `slotIndex(tape) = ring − current + progress` is the single source for where a tape sits; paint, fade and DOM order all read it, and `progress` is shared by every tape so **one eased tween moves the whole row** and the ring steps under it on landing.
  - ⚠️ **`casEls` must exclude the blanks**: `[data-fillers] .cas` are the same shell markup, so a bare `querySelectorAll(".cas")` counts the scenery as projects (sixteen decorations now that the ring padding grew).
  - ⚠️ **Each arrow is ONE stroked polyline, and its TIP is its MIDDLE coordinate.** `M12 2 L2 13 L12 24` → vertex `(2,13)` → points **left**; `M2 2 L12 13 L2 24` → vertex `(12,13)` → points **right**. Reading the direction off the *first* coordinate is the bug that shipped an inward-pointing pair (2026-09-18): `M2 2 …` looks like "starts at x=2, so left" but it draws `>`. ⚠️ **Two bars can never make a sharp corner** — each bar ends in a rounded cap and the two caps bite a notch out of the vertex, which the user reported verbatim as "尖尖不是直角，而是一个凹陷的平". The point comes from `stroke-linejoin: miter` (+ `miterlimit: 8`) on a single geometry; the miter tip overhangs the 14px box by ~1px, which is what `overflow: visible` on the svg is for. Measured apex = **2px in 1 run** (a point); the two-bar version measured 2 runs at the same column (the notch). ⚠️ **No `scaleX(-1)` mirror**: direction lives in the path data, and the mirrored element would have to share its transform with the bounce. The bounce therefore rides the inner `svg`, and `.shelf-arrow` carries no transform at all. ⚠️ **The two keyframe sets (`shelfBounceOut` / `shelfBounceOutLeft`) are deliberate** — every `translate` is negated for the left arrow and the `scale` ladder is copied verbatim, so the pair moves **outward together**. Do NOT "simplify" this with `animation-direction: reverse`: that mirrors the animation in *time*, which equals a spatial negation only if the keyframes are antisymmetric about 50% **and** the scale is symmetric about 50% — and a symmetric scale throws away the pull-back/push-out contrast (thin on the recoil, fat on the throw). ⚠️ To see the real shape, dump the pixels: `getBoundingClientRect`/`getComputedStyle` cannot tell you which way a chevron points, or whether two bars overlap. A chevron has **exactly one column with a single run** — the tip; the other end is the two tail caps, and that asymmetry *is* the direction. ⚠️ Diff the screenshots **twice and intersect** (shown → hidden → shown): the starfield drifts between shots, so a moved star lands in only one diff (hiding the canvases first is easier still). ⚠️ Animate/measure the svg, not a `display: none` button — a hidden arrow reports `translate: 0` for ever and looks like a broken animation.
  - **Parked tapes must park off-stage.** Deep parking recedes in Z, and perspective pulls a distant tape *back toward the middle*, so the park distance has to grow with the stage width (`parkSlots()`).
  - **The frame is sized from the window WIDTH**: `S = min(h / WORLD_H, w / MIN_WORLD_W)`. ⚠️ `SPREAD_X` and `MIN_WORLD_W` are **one decision in two constants** — pitch sets the hero's size, the frame width sets how big every tape is, and their ratio sets how deeply they overlap. Change them together and re-measure (hero ≈28% of frame width; the check is "how many tapes are still whole").
  - **It is CSS 3D (`transform-style: preserve-3d`), NOT three.js.** `输入/磁带盒启动动画.html` + `输入/磁带盒主体动画.html` are *reference only* (three.js via CDN): porting them would add a dependency, turn the copy into textures (killing three languages, SEO and a11y), and fight the theme tokens. Their world-space choreography — `layoutPose`, the opacity split, `startProgressTween` and its durations — **is** ported 1:1.
  - ⚠️ **preserve-3d hygiene — the one thing that breaks this component.** No ancestor of a `.cas-f` face may gain `overflow: hidden`, `opacity < 1`, `filter`, `backdrop-filter`, `clip-path`, `mask`, `mix-blend-mode` or a non-3D `transform`: each silently forces `transform-style: flat` and the whole box collapses into a flat card. Per-tape fades ride on `--cas-o` (ring enter/leave and the intro only) and the neighbour tint on `--cas-beneath`, all read by the **faces** (leaves). The `.shelf-panel` chamfer's `clip-path` and the arrows' `translate`/`scale` bounce are safe because both are **siblings** of the 3D track.
  - ⚠️ **`will-change` belongs on the tape that is moving**, not on all of them: ten permanent compositor layers cost memory and force a re-raster the moment the shelf settles. The render loop never writes a custom property whose value has not changed, and a settled shelf writes nothing at all (`rowBusy` gates the reel spin and the idle breath) — that is what keeps a step from stuttering.
  - **Sign convention**: the reference's Three.js Euler `(rx, ry, rz)` maps to CSS as `translate3d(x, -y, z) rotateX(-rx) rotateY(ry) rotateZ(-rz)` (CSS Y points down; rotateX/rotateZ invert). The hero rotation is **`+15°`** here; the reference uses `-15°`, which shows the *right* wall — the brief asked for the left.
  - Sizing: `--S` = px per world unit, `perspective: calc(var(--S) * 11.8)`, `perspective-origin: 50% 50%`. Shell depth **`0.37`** world units (≈7.6% of W) — thin, because nine tapes stand in a tight row. `.shelf-track` carries `transform: translateY(var(--shelf-drop, 1.5%))` — measured so the hero's centre lands on the arrows' centre line (a track-level 2D translate is safe: it is the 3D context's root child and never flattens it). **Layout budget**: the page is `100svh − 76px` tall with no bottom padding and the footer's `--section-gap` zeroed (`!important`, scoped to these pages), so header + stage + footer exactly fill the fold. The header is ONE row and the section blurb lives in the stage's empty top band.
  - **The intro curtain is a first-visit moment only, and a tag filter never starts one**: filtering re-seats the survivors in place and fades the rest out where they stand, so nothing goes black. Both the curtain decision and the cover preload are gated on `sessionStorage["rrsuika-shelf-warm"]`, set by the same inline script that injects the `<link rel="preload">` tags. ⚠️ **`Astro.session` does not exist in this project** (`output: "static"`, no adapter), so a server-side session read silently returns `undefined` — that mistake re-fired a dozen preloads and replayed the black curtain on every navigation. **`sessionStorage["rrsuika-shelf-card"]` carries the current record across a language switch** (a full page load to a different URL).
  - **Status readout**: the ONLINE/WIP mark is drawn by CSS, not by the `●`/`◐` glyph in `translations.ts` — that glyph let the line wrap *between* the dot and the word and stranded it on its own row. `CassetteShelf` strips the glyph at render time and colours the mark (`WIP` amber, `ONLINE` green); `ProjectCard.astro` still prints the shared strings verbatim and carries `white-space: nowrap` on `.status` for the same reason.
  - **Dragging must not become a native drag**: `draggable="false"` + `-webkit-user-drag: none` + `user-select: none` + a `dragstart` preventDefault.
  - **`≤860px`, `prefers-reduced-motion`, or no `preserve-3d` ⇒ flat mode**: `data-mode="flat"` on `.shelf-page` switches to a plain card switcher — same markup, same state machine, no perspective and no rise. The mode flag lives on the **page root**, not on `<section class="shelf">`, because flat mode restyles the surrounding page shell.
  - The global `.scroll-cluster` (ScrollMeter) is hidden on these six pages: the shelf is a one-screen experience and the rail collides with the right arrow. That override needs `!important` (ScrollMeter's own rule is a scoped class+attribute selector, 0-2-0).
  - **Verifying it needs CDP, not `--virtual-time-budget`.** Headless Chrome's virtual time starves `requestAnimationFrame`, so every rAF-driven transform photographs as its first frame. Drive a real browser over `--remote-debugging-port` + `Runtime.evaluate`, measure the DOM, and when the question is visual (does this chevron point left? do its bars meet?) decode the PNG and profile the pixels instead of trusting a transform string. ⚠️ **Never round-trip this file through PowerShell `Set-Content`**: without an explicit encoding it mangles every 3-byte character (em dashes, `≈`, `≤`, CJK filenames, the `═` section rules) into `U+FFFD`. Use the file tools, or `[System.IO.File]::WriteAllText` with a `UTF8Encoding($false)`.

---

## 追加（2026-09-19）：窗口/铭牌的三个宽度控制、走带线删除、INSPECT 按钮重做、chip 改平

### 一、三个宽度控制不是一回事，改之前先分清

| 参数 | 是什么 | 默认 | 实测 |
| --- | --- | --- | --- |
| `--window-w` | **观察窗外框**（两个圆环所在的那个长方形）的宽度，占 J-card 的百分比，居中。⚠️ **只动边框，里面什么都不动** | `88%` | 405px 的 label 上窗口 356px = **87.9%**；60% → 243px、96% → 388px，线性有效 |
| `--plate-w` | 两个井**中间**那块窄长条（印 `TYPE II` 与 100/50/0 刻度）的宽度，占观察窗**内容盒**的百分比 | `46%` | 窗内容盒 239.2px 上铭牌 110px = **46.0%**，没有被打折 |
| `--well-inset` | 每个井从自己那侧窗边往里收多少 | `2.8em` | 井心约 **±23.1%** 带宽（真实磁带 ≈ ±21%） |

⚠️ **`--window-w` 是「只改边框」的控制，靠的是窗的内边距是算出来的**（2026-09-19 用户报「调整的时候，其他元素比如圆环，刻度表等位置都会变化，而我只需要调整变化」）：井是靠 `justify-content: space-between` 钉在窗的**内容盒**两侧的，所以窗一变宽，两个井就被一起推开。现在窗的 inline padding 写成

```css
padding-inline: max(0px, calc((var(--window-w, 88%) - var(--wells-w)) / 2));
--wells-w: calc(88% - 1.4em - 2 * var(--well-inset, 0em));
```

也就是**内容盒宽度固定成 `--wells-w`**：在默认的 88% 下它恰好等于旧的 `0.7em + --well-inset`（逐像素相同，是重构不是改版），其余任何值下井、铭牌、刻度、标题全都原地不动。实测（同一个 label 405×248，窗宽 88 → 96 → 72 → 60%）：

| `--window-w` | 窗宽 | 窗左/右边缘 % | 井心 % | 铭牌中心 % / 宽 | 刻度中心 % | 标题顶 % |
| --- | --- | --- | --- | --- | --- | --- |
| 88% | 356px | 5.93 / 93.83 | 26.67 / 73.09 | 49.88 / 110px | 50.0 | 8.06 |
| 96% | 388px | 1.98 / 97.78 | 26.91 / 73.09 | 49.88 / 110px | 50.0 | 8.06 |
| 72% | 291px | 14.07 / 85.93 | 26.91 / 73.33 | 50.12 / 110px | 50.25 | 8.06 |
| 60% | 243px | 20.00 / 80.00 | 26.91 / 73.09 | 49.88 / 110px | 50.0 | 8.06 |

只有「窗左/右边缘」两列在动，其余四列变化 ≤0.25%（整数像素取整的抖动）。⚠️ 滑块下限因此是 **60%**：井自身占带宽约 59%，再窄就没有内边距可以吸收了（`max(0px, …)` 是那道地板）。

⚠️ **`--plate-w` 的实际上限是 ~49.7%，不是 100%**：两个井是刚性的不能缩，所以铭牌的可用宽度 =
`窗内容宽 − 2 × 井宽 − 2 × --well-gap`（239.2 − 104 − 16.7 = 118.5px）。实测 46% → 110px，而 55% / 70% / 85% / 100% **全部停在 119px**。想把铭牌做得更宽，先调小 `well gap`（调到 0 时上限约 56%）或调大 `--window-w`。
⚠️ 不要试图用 `max-width: calc(100% - 2 * var(--reel-size))` 表达这个上限：`calc()` 里的 `em` 按**铭牌自己**的 0.46em 解析，会把井按五分之一尺寸减掉，框直接压到井上。

### 二、已烘焙的 token（用户定稿值，改这些要同步面板默认值）

```
SHELL  --shell-frame: 0.98em   // J-card 外的壳边（0.7 → 0.88 → 0.98：label 411 → 405 → 401px）
       --recess-h:    1.9em    // 顶部模压横带高度
       --window-w:    69.5%    // 观察窗宽（= 原来的 left/right: 6%）——**只动边框**
       --wells-w:     calc(88% - 1.4em - 2*var(--well-inset))  // 井+铭牌所在的固定内容盒，派生量，别手改
PLATE  --plate-w:      46%      // 铭牌宽
       --plate-h:      4.7em    // 铭牌高（铭牌自己的 em）
       --plate-alpha:  0        // 磨砂底填充，0 = 只有印刷与发丝环
REELS  --well-inset:   2.8em    // 井向内收多少
DEPTH  --dim-rate:     3.2      // 面纱不透明度 = min(1, --cas-depth × rate)
       --depth-blur:   2.4px    // 浅色主题里最远那盘的印刷模糊量（深色主题不用）
```

### 三、走带线（`.cas-path` / `.cas-path-ribbon`）已删除

2026-09-19：「刻度条下方有一个两侧渐变的线去掉」。那条 1px 线
`linear-gradient(90deg, transparent, --path-ink 18%, --path-ink 82%, transparent)` 是窗内**唯一**两端渐隐的线，压在铭牌 100/50/0 刻度的正下方，读起来像一条多余的强调线，而不是窗后的磁带路径（它的两个导带轮更早就因同样理由删掉了）。markup、样式、空白磁带的 `.cas-path-ribbon` 覆盖、`--path-ink` token 一并删除。

### 四、INSPECT 按钮（`.shelf-open`）四处重做

1. **发光**：`0 10px 26px -12px <accent>`（满不透明、下移 10px、spread −12px）不是发光——那是按钮自己颜色的**饱和色块挂在底边上**，还正好被面板的 `clip-path` 切齐。现在是真的光晕：`0 0 16px -4px color-mix(accent 60%, transparent)` + 一枚深色接触阴影，hover 提到 78% / 22px。
   ⚠️ 光晕半径必须**塞进面板的内边距**：实测按钮到面板左/右/下分别是 24 / 22 / 20px，光晕约 12px 外出，切不到。数值对照（按钮底边往下 2px 采样）：旧 **82** 红 / 新 **53** 红；22px 处旧 22 / 新 15。
2. **hover 从左往右推进**（「这个按钮做成从左往右的色彩推进，而不是其他按钮的从下往上」）：`::before` 用 `scaleX(0) → scaleX(1)`、`transform-origin: 0 50%`、0.45s。
   ⚠️ **填充色是 `--cas-accent-soft`——同色相、朝该主题的墨色反方向走一格**，不是压暗（2026-09-19：「hover 压暗有点丑，你去网上搜搜，改成一个合适的变色颜色」）。压暗饱和色会发浑，而且也不是主流做法：[Material 3](https://m3.material.io/foundations/interaction/states/state-layers) 用 on-color 的 state layer 把实心按钮**提亮**（hover 8% / press 10%），Ant Design 的主按钮 hover 亮一档，Carbon 才是往下压的那个异类。`--stripe-*-soft` 正好就是这个站点已有的那一档：深色主题里更深色（`#e04040 → #ff8888`）、浅色主题里更深（`#c03030 → #aa3333`），因为它在两个主题里都是**远离该主题墨色**的方向，所以标签对比度两边都上升（实测 4.69:1 → **8.6:1**；浅色 5.44:1 → **6.24:1**）。⚠️ 面板不在磁带里，所以 `--cas-accent-soft` 必须和 `--cas-accent` 一起拷到面板上（`applyPanel` / flat 切换两处），否则 hover 会掉回主题琥珀。
   ⚠️ 按钮是**实心**色板，`::before` 不能像 `.tag-chip` 那样用 `z-index: -1`（会被按钮自己的背景盖住）。它走 `z-index: auto`，子元素 `.shelf-open-label` 提到 `z-index: 1`；按钮自己 `position: relative; isolation: isolate; overflow: hidden`。⚠️ `overflow: hidden` 裁的是擦除面板，**不会**裁掉元素自己的 box-shadow。
3. **一律只有一个箭头**：标签字符串是 `inspect: "INSPECT FILE >"`（三语都是），而按钮右端还画过一个箭头，于是「右侧有两个箭头」。**去掉的是右边那个画出来的**（2026-09-19：「去掉最右侧的那个箭头」）；label 保留站点的 `>` 约定。如果哪天想反过来（留动画箭头、去掉字符串里的 `>`），要同时改 `translations.ts` 三处并删掉 label 里的 `>`——**两个都留就是这个 bug 的原样复现**。
4. **`justify-content: space-between` 与 `gap` 随箭头一起去掉了**：按钮只剩一个子元素，留着 `space-between` 是误导。

### 五、筛选 chip 改平（`global.css §12`）

2026-09-19：「我不希望他的带有白色渐变的立体拟物风格，平面就行了」。`.tag-chip::before` 的填充从
`145deg: --accent-glow → --accent 55% → --accent-deep` 改成**纯 `var(--accent)`**——那道从浅琥珀落到深琥珀的角高光就是「立体拟物」的全部来源。滑上来的手势（`translateY(101%) → 0`）、hover 的 1px 抬起、按下的 `scale(0.93)` 都保留，平面化只动填充。**不要往这里加渐变。**
⚠️ **边框、字色、填充必须走同一个时钟**（2026-09-19：「边框和橙色块往上的动画一致，而不是目前先让边框变色然后覆盖动画，这样会比较僵硬」）。原来是 `border-color` / `color` 各 0.25s、`::before` 的 `transform` 0.4s —— 边框和字先落地，填充 0.15s 后才追上来，读起来是两件事。现在四根里除了 `transform`（那 1px 抬起是独立的按压反馈）**全都 0.4s `--ease-out`**，和滑入同一条曲线。逐帧实测（页面内 rAF 采样 + 真实 hover）：填充走到 **63%** 时边框是 `rgba(241,189,108,.65)`、字色 `rgb(61,61,61)`；**92%** 时 `rgba(240,185,98,.92)` / `rgb(14,14,14)`；**98%** 时 `…,.98` / `rgb(4,4,4)` —— 三个量同步推进、同时收尾。

⚠️ 同一轮修掉一个**真 bug**：浅色主题里 `:root[data-theme="light"] .tag-chip`（**0-3-0**）压过 `.tag-chip.active`（0-2-0），于是当前筛选那颗 chip 被剥掉强调色底、却留着 `--on-accent` 白字——实测白字落在 `rgba(255,255,255,.55)` 上，**对比度 1.0**，等于隐形（而「点击则按钮固定成橙色」正是这个元素存在的理由）。现在浅色的 chip 覆盖一律写 `:not(.active)`。修好后实测 `.active` 底 `rgb(192,112,32)` + 白字 = **3.76:1**，这是 `--accent`/`--on-accent` 这对 token 自身的对比度，不是新引入的问题。

### 六、DEPTH — 越远越暗 / 越远越模糊（2026-09-19）

用户要的是「按离画面中心的距离」做整体压暗（深色主题）与空气透视（浅色主题：贴合背景色的亮色渐变 + 越远细节越模糊）。

**实现是一条链，只有一个几何量：**
1. 渲染循环对每盘算 `depth = min(1, |pos| / span)`（0 = 选中那盘，1 = 绘制带最外端），**量化到 1/120**，值变了才写 `--cas-depth`，并切 `.is-far`（`depth > 0.02`）。量化是因为这个值在换盘时每帧都在变，而每次写入都是一次绘制；静止的架子一个字节都不写。
2. `.cas-f::after`（面纱）的不透明度 = `min(1, var(--cas-depth) * var(--dim-rate))`。⚠️ **`--cas-beneath` 那道闸门已经删掉**：旧的写法是「非选中 = 1」，在磁带跨过中心的那一帧整体翻转，所以才需要一个 0.5s 的 transition 去盖住这个跳变；现在按距离连续变化，闸门反而会把这个台阶加回来。
3. 浅色主题另加 `filter: blur(calc(var(--cas-depth) * var(--depth-blur)))`，作用在 **`.cas-f > *`** 上——也就是 J-card（封面 + 全部印刷）**和两侧书脊的文字**。书脊必须一起糊：远处的磁带被转到接近侧身（~58°），你能看到的主要就是书脊。深色主题不模糊，距离只靠压暗表达。
4. 面纱的**颜色分主题**：深色是 `rgba(7,10,20,.68) → rgba(4,6,14,.84)`（冷黑，未变）；浅色**换成了纸张本身** `rgba(240,235,224,.6/.82)`——原来是冷黑 0.18/0.28，「空气透视」要的正是往它所在的背景色里退，而不是变暗；顺带把书脊标题（深墨字）的对比度抬上去而不是吃掉。

实测（同一个架子，`/projects`，`--dim-rate` 0 → 8，画面里只有磁带、其他元素隐藏）：每盘 `--cas-depth` 与面纱不透明度对称成对出现（0/0、0.2/0.64、0.4/1、0.6/1、0.8/1、1/1，左右一致），选中盘恒为 `depth 0`、面纱 0 ✓；浅色主题里模糊随距离 0 → 0.48 → 0.96 → 1.44 → 1.92 → 2.4px ✓。

⚠️⚠️ **面纱必须能盖住印在卡片上的东西，这靠的是绘制顺序，不是不透明度**（用户原话：「深色渐变…并没有应用到磁带盒标题字和下面的强调色线，PRJ_NODE // 字和右侧日期字以及他俩底部的边框」）。面纱原来在 `z-index: auto`，也就是压在**卡片上所有印刷元素的下面**：标题（`z-index: 4`）、下面的强调色线（3）、PRJ_NODE + 日期的表头行（2）、`.cas-label-scrim`（1）、顶部模压横带 `.cas-recess`（1，它那条下沿发丝线就是用户说的「他俩底部的边框」）。修法是两条一起：
- `.cas-f { isolation: isolate }` —— 让**面**成为自己的层叠上下文。没有它，`::after` 的 z-index 会去和**同一盘的其他面**（它们活在 `.cas` 的上下文里）比较，面纱就有可能盖到书脊上。⚠️ 这不会破坏 3D：`preserve-3d` 挂在 `.cas` 上，而 grouping 属性只压平**携带它的那个元素**，面本来就是一个扁平的叶子。
- `.cas-f::after { z-index: 8 }` —— 高于面内一切（面内最高是 7）。数字被 `isolation` 关在面里，所以只是一个局部常量。

**实测判据**（只保留印刷、隐藏封面/观察窗/顶带，取「亮像素或被强调色饱和的像素」，比较 `--dim-rate` 0 → 8 前后同一批像素）：修好前 **标题 / 表头 / 强调色线三者 0% 的印刷像素发生变化**（166.3→166.2、99.7→99.6、73.8→73.7）；修好后分别是 **29% / 50% / 25%** 变化，均值 166.3→**130.3**、99.7→**66.0**、73.8→**64.5** ✓。同一批测试里把 `z-index` 用 `!important` 改回 `auto` 就会退回 0%，所以这条修复确实来自绘制顺序。

### 七、重播开场按钮已删除

2026-09-19：「右下角的重播开场功能和按钮去掉」。`.shelf-replay` 的 markup、样式、点击监听、以及在拖拽命中测试里的选择器、还有 `translations.ts` 三语的 `shelf.replay` 字符串一并删除；`startIntro(full)` 本身留着（启动路径还在用它，只是再没有第二个调用者）。`.shelf-foot` 因此只剩左侧那行提示，`justify-content: space-between` 也跟着去掉了——**幕布现在是一个只在首次访问出现的一次性开场**（`sessionStorage["rrsuika-shelf-warm"]`），没有按钮可以再看第二遍。

### 八、切换时磁带盒互相穿模 —— 已修（2026-09-19）

**现象**：切换选中的磁带盒时，中心两侧的两盘互相穿模（用户报「切换磁带盒时，他们彼此穿模」）。

**真因：每个姿态量都只是 `|p|` 的函数，所以切换途中跨在中心两侧的那两盘（`p = ±0.5`）是严格的镜像——同样的 `|p|` ⇒ 同样的 z、同样的 y、同样的 scale。任何只读 `|p|` 的项都不可能把它们在深度上分开。** 静止时它们相距整整一个槽位的 z（1.55），所以看不出问题；一旦开始移动，跨中心的那一对会短暂地同深同高。

**测量方法（值得复用）**：把 `heroPose` 1:1 抄成一个离线脚本，用**分离轴定理（SAT）**判定两个 OBB 是否相交并算出穿透深度，然后扫过整个 `progress`（两个方向各一遍）与所有相邻槽位。基线结果：

| progress | 穿透深度（世界单位） | 是哪一对 |
| --- | --- | --- |
| 0（静止） | **0.000** | — |
| −0.2 | 0.143 | −0.2 / 0.8 |
| −0.4 | 0.563 | −0.4 / 0.6 |
| **−0.5** | **0.950** | **−0.5 / 0.5** |
| −0.7 | 0.339 | −0.7 / 0.3 |
| −1（静止） | 0.000 | — |

⚠️ **`Z_FALL` 完全无效**：1.55 / 1.8 / 2.0 / 2.2 / 2.5 / 3.0 / 3.5 全部还是 0.950 —— 镜像对同深，加深纵深救不了它。（先试过这条，被数据否掉。）

**修法：两个「过场」项，形状都是 `4·|p|·(1 − |p|)`** —— 在 `|p| = 0`（选中那盘）和 `|p| ≥ 1`（一槽之外）**恰好为 0**，只在半个槽位处最大。因为静止时磁带只坐在整数槽位上，所以**发布版静止姿态逐位不变**（实测 `restΔ 0.000`），只有过渡中的中间位置变了：

- **`PASS_TWIST = 0.3` rad**：两盘经过彼此时额外多转出去 17.2°（读作「给滑过去的磁带让路」）。
- **`PASS_GAP = 0.2`** 世界单位（= 卡带宽的 4%）：两盘再各自往外让 0.2。

单独一个都不够（只加 twist 最好到 0.244，只加 gap 最好到 0.580；两者的最优组合里最小的是 twist 0.3 + gap 0.2 ⇒ **0.000**）。⚠️ 之前搜到的「唯一解」还需要 `pinch 0.12`（两盘在交错时缩小 12%）——**太显眼，弃用**；旋转 + 让位就够了。

**端到端复核（不信任模型，直接读真实渲染）**：在页面里对每个磁带盒读 `getComputedStyle(el).transform` 的 `matrix3d`，把它的三个基向量和半长当成本地盒子的 OBB（半长 = `offsetWidth/2 × |基向量 x|`、`--cas-d/2 × 同一比例`），再对当帧所有可见真磁带两两跑 SAT，逐帧采样整个切换过程：

| | 最差穿透 |
| --- | --- |
| 两个 pass 项置 0（旧行为） | **78.2px = 0.874 世界单位 = 卡带宽的 18%** |
| 发布值（twist 0.3 + gap 0.2） | **0.000**（可见带内无任何相交） |

⚠️ 三条测量坑：① `--S` / `--cas-d` 挂在 **`.shelf`** 上（不是 `<html>`），读错地方会让半长变 NaN；② 必须排除 `.cas-blank`（布景空带）与 `is-hidden` 的磁带，否则停在**停车道**（`x = ±1253, z = −609`，画面外）的空带互相之间的相交会被当成结果——修好后唯一还相交的正是这些，**在视口外、看不见**，不用管；③ 别忘了把矩阵第 0 列的长度乘回半长（归一化基向量会把姿态 scale 丢掉）。

**调参**：HERO 组新增 **`pass twist`** 与 **`pass gap`** 两根滑杆，置 0 就能原样看到旧行为（18% 的穿透）。

### 九、松开鼠标后的落位过渡放慢 + chip 两端改成 Apple 式连续圆角（2026-09-19）

**① 释放弹簧放慢**（用户：「鼠标拖动时，松开鼠标后，从拖动磁带盒状态过渡到选择磁带盒的动画放慢一点，目前太快了」）。松手后的落位跑的是临界阻尼弹簧，`GLIDE_RATE` 就是它的衰减率，**时间常数 = 1/rate**：9.2（档案两端的回弹用）≈110ms，5.4 ≈185ms，**3.8 ≈265ms**（发布值）✓。⚠️ **`SPRING_MAX_MS` 必须跟着 `1/rate` 一起改**：求解器在封顶时刻残留 `e^(−rate·cap)` 的幅度，5.4/620ms 是 3.5%，保持同样 3.5% 时 3.8 需要 `620 × 5.4/3.8 ≈ 880`（取 **900**）。让封顶滞后于速率，切掉的那一帧会露出可见的跳变——行会差着约 5% 个槽位（≈11px）被 `recycleFromSpring` 一把抹平。**封顶本身不能去掉**：只靠速度阈值不封时长，等 `|v| < 0.02` 是几秒看不见的运动，而它一直占着 `lock`，之后每个手势都被拒（读起来像书架卡住）。实测（1700×900、真拖 100px 后松手，页面内 rAF 采样同一盘磁带的 x）：两条曲线起点都在 ~1050ms、峰值同为 ~90px，但回程明显分叉 —— 松手后约 **250ms 处旧值 64px / 新值 74px**、**约 500ms 处 34 / 50**、**约 750ms 处 16 / 31**，即新值一致落后，符合 185ms → 263ms 的时间常数 ✓。调音面板新增 **MOTION 组**，只有一根 `release glide`（1/rate 秒），置 9.2 就是最快、2 就是最慢。

**② chip 两端换成 Apple 式连续圆角**（用户：「按钮两侧视觉上过渡不够圆…苹果产品的边缘过渡不止一个简单的倒角，而是有细节设计的」）。胶囊的两端是**正圆弧**：曲率从直边的 0 在切点直接跳到 1/r，端头因此读成「贴上去的一块」，那个接缝就是「不够圆」的地方。苹果的圆角是**超椭圆（squircle）**：占用同样的范围，但曲率从直边一路渐入。CSS 现在直接用 `corner-shape` 暴露了它（CSS Borders 4：[MDN `corner-shape`](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-shape)、[Smashing Magazine](https://www.smashingmagazine.com/2026/03/beyond-border-radius-css-corner-shape-property-ui/)）。做法：

```css
@supports (corner-shape: squircle) {
  .tag-chip { corner-shape: squircle; }
}
```

⚠️ 刻意做成**渐进增强**：`@supports` 保证没实现该属性的浏览器继续用普通圆胶囊；hover 的填充由 chip 自己的 `overflow: hidden` 裁切，所以它会跟着这个形状走。实测（Chrome，`CSS.supports('corner-shape','squircle')` = true，计算值解析成 `superellipse(2)`）：在 chip 左端 26×38 css px 的区域、6 倍放大下逐像素比对，**2635 / 35568 个像素（7.4%）形状不同**，顶行处新形状比正圆**多伸进拐角约 2.8 css px** ✓ 形状确实变了，而且不是「更圆」而是「拐角更饱满、接缝更连续」——这正是连续曲率与简单倒角的区别。

### 十、误触选中文本 / 右键 与 调音面板暂时关闭（2026-09-19）

**① 禁用选中与右键**（用户：「在 projects 和 labs 容易误触导致选中画面文本内容而非拖动，需要在这两个界面禁用鼠标复制或右键」）。这六个页面整体就是**拖拽面**：指针落在磁带上再移动必须拖行，浏览器一旦判定成「选中文本」，访客得到的是蓝色刷选 + 不动的书架，而面板里那段简介是页面上最大的选中目标。做法两条：`.shelf-page { user-select: none }`（它会传播到整棵子树，面板/标题/页脚读数一起覆盖；`-webkit-user-select` 按项目约定写在**另一条规则**里，成对写会被构建期压缩器合并）＋ 在页面根上 `contextmenu` preventDefault（只在 stage 上拦不够，面板里的右键同样会中断手势）。⚠️ 这里没有任何内容是给人复制的。

**② 调音面板暂时隐藏**：`src/scripts/shelf-tuner.ts` 顶部加了 `const TUNER_ENABLED = false;`，`initShelfTuner()` 首行早退。**代码一行没删**——把开关翻成 `true` 就整套回来（面板默认值与已烘焙的 CSS/姿态常量一致，RESET 仍然回到发版值）。⚠️ 关掉之后 `apply()` 不再执行，页面完全由样式表和姿态常量决定，所以这同时也是**验证烘焙值是否自洽**的干净状态。

### 十一、列表页标题：字号/字距、贴底对齐、书脊长标题（v1.42 + v1.43）

**① 标题放大并改字距**（v1.42，用户：「列表页左上角标题放大」）。`.shelf-head h1` 从 `32px` 改到 **40px**，`letter-spacing` 从 `var(--tracking-tight)`（**−2px**）改到 **`+0.075em`**（实测计算值 `40px / 3px` ✓）。⚠️ 那个 −2px 是给**拉丁小写**标题用的收缩量，用在一串大写字母上会把字挤在一起；移动端断点仍是 32px。

**② 让可见的字底贴着按钮底**（v1.43，用户：「列表页左上角标题往下移动一点，让字体的底部贴着右侧几个按钮的底部」）。头行是 `align-items: flex-end`，**对齐的是两个盒子**，而行盒在基线下面还带着字体的下伸空间，所以字底看起来比按钮底高约 7px。⚠️ **不能用负 `margin-bottom`**：它会缩小 h1 的**外边距盒**，而那个尺寸正是决定 flex 行高的量 → 按钮会跟着一起上移，等于白改（实测 chip 底 **149 → 141.8**，而 h1 盒底仍停在 153 ✗）。正解是 `position: relative; top: 0.18em`（≈7.2px @40px）——只移动绘制、不改布局 ✓，用 `em` 所以移动端的 32px 会按比例跟着走。

**③ 书脊不再被长标题压字**（v1.43，用户：「标题过长时，书脊／侧面出现 RRSUIKA 和标题，标题和 01/02 数字重叠」）。**真因是 flex 收缩**：`.cas-spine-brand` 与 `.cas-spine-idx` 作为 flex 子项默认 `flex-shrink: 1`，长标题挤的是**它们**而不是自己；而这两个都是 `white-space: nowrap`、**没有 `overflow: hidden`**，被压扁的盒子里文字直接**溢出到标题上** ✗。三者里唯一带 `overflow: hidden` + `text-overflow: ellipsis` 的是标题，所以该让步的是它：

- `.cas-spine-brand, .cas-spine-idx { flex: 0 0 auto }` —— 钉死两端。
- `.cas-spine-title { flex: 1 1 auto; min-height: 0; max-height: 82%; display: block; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis }`。
- ⚠️ **`display` 必须是 `block`，不能是 `flex`**：`display: flex` 会把文字变成一个**匿名 flex 子项**，省略号作用在匿名盒上、**永远不会出现**（改之前它就是这样，等于没有省略号）。

**实测**（1700×900，`/nl/lab` 12 盘 + `/projects` 5 盘）：书脊面是 `flex-direction: column`，三段盒子 **brand 38px / title 185px / idx 11px**，**相邻两段之间的间距全部为 0**（既不重叠、也没有多余空隙），且 17 盘里 `scrollWidth − clientWidth` **全为 0**——现有标题都装得下，省略号是留给更长标题的兜底。

**④ 新增 `spineTitle` 字段**（配套 ③ 的「换短标签」方案）。`src/content.config.ts` 的 entry schema 加 `spineTitle: z.string().optional()`，六个 md（两个条目 × en/cn/nl）写上全大写短标签（`BUILD A PERSONAL WEBSITE`、`HOME SOLAR PANEL CIRCUIT DESIGN`）。⚠️ 生成的内容类型**滞后于 schema**，组件里读它要走一次带注释的断言：`((entry.data as { spineTitle?: string }).spineTitle ?? entry.data.title)`。

### 十二、空架子时幕布永不升起 —— `MOUNTING ARCHIVE` 卡死（2026-09-19）

**现象**：用户报「前往 labs，他一直在显示 mounting archive 加载，不跳转到磁带盒画面，**这是第一次出现这个问题**」。

**真因有三层，代码只占最后一层**：

1. 当时在跑的是一个**孤儿 dev server**：`astro dev status` 说「No dev server is running」，但 4321 端口有进程在响应（pid 10196，从 02:40 起就在）。CLI 的状态文件与进程对不上，于是谁都没去重启它。
2. 它端出来的六页**内容集合是空的**：`/projects` 与 `/lab` 的 HTML 里 24 个 `.cas` **全是 `.cas-blank`**（`MAX_FILLERS = MAX_SLOT_COUNT × 6 = 24`），真磁带 0 个；首页的条目链接同样是 0。⚠️ 这种情况**不报错、不弹覆盖层**，页面结构看着完全正常，只是数据是空的。
3. `casEls.length === 0` 时脚本**整体早退**（`if (casEls.length === 0) return;`）。而幕布 `.shelf-intro` 是**标记**，整个仓库里只有这个脚本会摘它——于是页面永远停在 `MOUNTING ARCHIVE`，且**没有任何 console 报错** ✓ 这正是最难查的那种卡死。

**修法**：早退前把该收的收了——`root.classList.add("is-ready")`、`#shelf-intro` 加 `is-done`（幕布淡出）、`.shelf-empty` 的 `hidden` 去掉。空架子上本来也没有开场可播，直接说清楚架子上是空的比假装在装载诚实。

**实测**（临时把 `/lab` 的 filter 改成 `false &&` 复现 0 盘，验完已复原）：

| | `is-ready` | 幕布 `is-done` | 幕布 opacity | 页面显示 |
| --- | --- | --- | --- | --- |
| 修前 | false | false | 1 | `MOUNTING ARCHIVE`（永久） |
| 修后 | **true** | **true** | **0** | **`NO TAPES MATCH THIS FILTER`** ✓ |

复原 filter 后逐页复核：`/lab` 12 盘、`/projects` 5 盘、`/zh/lab` 12 盘，全部 `is-ready` + 幕布 `is-done` ✓，console 无异常。

⚠️ **两条可复用的教训**：① `astro dev status` 说没在跑、端口却有响应 = **孤儿进程**，它会端出陈旧或残缺的构建结果；内容集合为空时页面**不会报错**，只会静悄悄地少东西——「页面结构对但数据空」先杀端口上的进程重启 dev server，再查代码。② **任何「只有某个脚本会摘掉的启动态 UI」都必须有一条无依赖的兜底路径**，否则它的失败模式是永久卡死而不是可见的错误。


---

## 追加（2026-09-28）：索引快速跳转选择器、幕布渐隐带、以及两个「换盘永远settle不了」的真 bug

### 一、INDEX 按钮 + 快速选择浮层（用户要求：「加一个按键，按下可以快速弹出各个项目的选择，这更容易阅读和找寻需要的项目。目前磁带盒效果保留」）

磁带的拖拽/箭头/chip 筛选**全部原样保留**，索引只是同一批数据的第二条入口。

| 部件 | 位置 | 说明 |
| --- | --- | --- |
| `.shelf-index` | `.shelf-head` 的第三个 flex 项（h1 / chip 条 / 它） | 打开浮层。⚠️ 它**不在 `.shelf-stage` 里**：页头不在 3D 上下文里，所以按钮与浮层都不可能压平 track；而且 stage 的 `pointerdown`（非磁带一律丢弃）根本看不到这棵子树，**打开索引永远不会触发拖动** |
| `.shelf-picker` | `.shelf-page` 的直接子节点，`position: fixed` | 遮罩 + 面板。面板沿用磁带面板的语言（切角、强调色竖线、磨砂底），`z-index: 70`（低于 launch veil 的 80 与开场幕布 90） |
| `.shelf-picker-row` | 脚本用 `document.createElement` 生成 | ⚠️ 因此**所有相关规则必须是 `:global(...)`**，否则作用域选择器命不中（pitfalls §2 的同一个坑） |

- **列表的数据源是磁带自己的 `data-` 属性**（`data-title` / `data-category` / `data-tags` / `data-date` / `data-index`），也就是 `updateUI` 写面板用的同一批值——列表和右侧档案面板**不可能描述成两个不同的记录**。
- ⚠️ **必须跳过 `tape.empty`**。环是被空白磁带**垫长**的（13 条档案 → 37 盘的环），第一版把 `list` 整个渲染出来，于是索引里出现 **33 行、其中 20 行标题是空的**（空磁带的 `data-title` 就是空字符串）。索引是**档案**的索引，布景不属于档案。判据用 `tape.empty`（事实），不要用 `walkFrom/walkTo`（它们是环位置，垫长会把它们推走）。
- **筛选在列表里而不是重建环**：行按 `is-filtered` 类隐藏（不是 `hidden` 属性，因为方向键行走和计数都还要看得到它）。空结果只插一条提示。
- **键盘**：打开后焦点进搜索框，↑↓ 在可见行之间走，ESC 关闭，点遮罩关闭，关闭后焦点回到按钮。按钮的 `aria-expanded` / `aria-label` 跟着状态翻转。
- **跳转复用筛选的两拍混合**，没有第二条路径：`jumpTo` 抬起 `filterOutPending` 并把目标记进 **`pendingSeat`**，`stepFilterSwap` 在旧行升出画面后调 `buildRing(tapes, pendingSeat)`，`startRiseIn` 把新行升进来。`pendingSeat` 是**环位置**（`current = clamp(target, walkFrom, walkTo)`），因为 `current` 是环位置而不是档案序号。
- ⚠️ **`buildRing(filtered, target)` 的 target 只对「当前环里已有的磁带」有效**：索引的列表本来就是从同一批筛选结果建的，所以每一行都在环里；不在的话回落到原来的「保留当前选中」行为。

### 二、幕布（`.shelf-scrim`）的硬边改柔和（用户报：「1/06 archive file 的上面一点，有一个黑边…一路从左延伸到右…和背景显得很割裂，给他做成柔和过渡」）

**真因是渐变停靠点太少**：深色主题的顶部渐变是 `0.72 → **0.28 @ 9%** → 透明 @ 22%`，**一个停靠点里掉了 0.44 的透明度**，那条 9% 的等高线就是用户看到的黑边；浅色主题同样（纸张色的一整条带子，末端齐刷刷断掉）。

**修法：让每一站按固定**比例**衰减（每级 ×0.56），整条曲线在对数空间里是平滑的**，且把跨度从 22% 拉长到 34%：

| 主题 | 0% | 6% | 12% | 18% | 24% | 29% | 34% |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 深色 | 0.72 | 0.403 | 0.226 | 0.126 | 0.071 | 0.040 | 0 |
| 浅色 | 0.80 | 0.448 | 0.251 | 0.140 | 0.079 | 0.044 | 0 |

底部那条同样处理（0.70 / 0.78 起，34% → 30%）。**顶部绝对值没动**（它就是幕布的身份，负责 HUD 微字的可读性）；**动的是曲线的形状**。

**实测**（CDP + 解码 PNG，逐 1% 台阶取整行均值，磁带/HUD/面板/页头全部隐藏后再量）：深色主题**相邻台阶的亮度差最大 2.5**（改前同一条线上是 0.44 的透明度跳变）；浅色主题在舞台顶带（0–20%）同样是平缓的 232–234。⚠️ 量浅色时若把页头一起拍进去，10% 处会出现约 18 的台阶——那是**芯片行的文字**被平均进来了（隐藏 `.shelf-head` 后消失），不是幕布。

### 三、两个真 bug：换过盘之后书架再也不 settle（都是这一轮为了验证索引才挖出来的）

**① `lock` 永不复位 → 箭头彻底失效。** tag 筛选与索引跳转都会抬 `lock`，而唯一会**放**它的地方是 `finishIntro`。但循环里的收尾判定是：

```js
if (!filterHold && !introDone && now - introT0 >= introDuration + CURTAIN_FADE) finishIntro();
```

`introT0` 是**页面加载时**盖的时间戳；筛选/跳转在几百毫秒后才排自己的升起，所以 `now - introT0` **早就越过了终点线**——这行在换盘的第一帧就触发，把 `introDone` 记成 `true`，此后每次调用都在自己第一行 return，`lock` 再也不放。**实测**：跳转后 `lock` 一直为 `true`，`shelf-next` 点了等于没点（用注入的 `lock` 状态日志确认「跳转抬起 → 再无下降」）。**修法：把「换盘占着这一拍」的两个旗标写进条件**——`!filterHold && !filterOutPending`。

⚠️ **顺手加 `!lock` 会死锁**：`finishIntro` 是唯一会 **放** `lock` 的地方，用它自己当自己的门条件，release 永远轮不到执行——实测 `introDone` 卡在 `false`、两个箭头全部失灵，比原 bug 更糟。

**② 换盘的升起不该用开场那一套时长。** `introEnd()` 是按**开场**编的（十个梯级 + 中央那盘的拉出，这里约 4.7s）。`navigate` 在 `introDone` 为假期间拒绝一切按键，于是「筛选之后几秒钟内箭头是死的」。修法：新增 `riseMs()`（只用实际梯级数：`RISE_START + (half + PARK_SLOTS) · RISE_STAGGER + RISE_DUR`），**`startRiseIn` 用它**；**开场仍用 `introEnd()`**（它的幕布可能被站点开场按着，不能被这条改动缩短）。再把 `navigate` 的第一道门从 `!introDone` 换成 **`!introDone && !swapRising`**：开场期间照旧拒绝（环和相机还在建），换盘的装饰性升起则允许走——**实测**跳转后第一次点箭头就能换盘（`2 → 3 → 4 → 5`），不再有「按了没反应」的那一下。

### 四、复验（CDP，`Emulation.setEmulatedMedia → no-preference` 必做）

| 判据 | 结果 |
| --- | --- |
| 索引按钮在页头、不在 3D stage 里 | ✓ `inHead` true / `inStage` false |
| 行数 = 档案数、无空行 | ✓ 13 / 13，空标题行 0 |
| 当前记录唯一高亮 | ✓ 1 行 `is-current`，计数读取 `13` |
| 搜索、空结果提示 | ✓ `rgbnw` → 1/13；`zzzzzz` → 一条提示 |
| 跳转到指定记录 | ✓ 面板标题与 `currentLabel` 同步跟上 |
| 跳转后箭头仍可用 | ✓ 连续三下依次为第 3/4/5 条 |
| ESC / 点遮罩关闭 | ✓ |
| 幕布台阶（深色） | ✓ 最大 2.5 luma，无硬边 |
| 页面异常 | ✓ 0（dev toolbar 的主题切换异常不计） |

⚠️ **探针要用注入的 `window.__rrsShelfInfo`**（`src/components/CassetteShelf.astro` 末尾，只读 getter）：`pickerOpen` / `pickerRows` / `currentLabel` / `ringSize` / `archiveSize` / `locked` / `progress` / `introDone` / `busy`。这些都是闭包局部量，只靠 DOM 断言分不清「没开」「开了又关」和「跳转真的动了环」。


---

## 追加（2026-09-28 之二）：选择器改成「走过去」、入场动画改成站内跳转专属

### 一、选取项目改成把整排磁带**走过去**，不再是「抽出 → 渐入」

用户要求：「不是抽出磁带盒，再渐入磁带盒，而是改成从当前磁带盒移动到选择的项目的磁带盒的动画」。tag 筛选的两拍混合（旧行升出 → 重建环 → 新行升入）**保持不动**，只把选择器的跳转换成了行走。

**新增的第三个 tween：`glide`**（`snap` 走 `progress`、`spring` 收尾、`glide` 走 `current`）。

| | `snap`（箭头一步） | `glide`（选择器跳转） |
| --- | --- | --- |
| 动的是 | `progress`（连续量） | **`current`（整槽走）** |
| 结束 | `recycle(step)` 把环重基一次 | 落位后 `progress = 0` + `reseat(false)` |
| 能走多远 | 一步（或拖动落点），**受 `DRAG_MAX = 5` 限制** | 任意距离（走最短弧，最多 `⌊环长/2⌋`） |

⚠️ **不能用一个大 `snap` 代替。** `snap` 结束时调 `recycle(step)`，而 `recycle` 只能把环重基到「绘制带还装得下」的位置——超过 `DRAG_MAX`(5) 的落点没有环可以重基，于是它会被 `clampReach` 截断。行走则是**一槽一槽地改 `current`**，每一盘自己的 `ring − current + progress` 连续变化，中间那些磁带就是自然地被推过去——这正是用户要看到的。

⚠️ **整槽行走顺便绕过了穿模修法**：`PASS_TWIST` / `PASS_GAP` 读的是**小数槽位**，而行走在每一格落点都是整数槽，任何时刻都没有磁带停在两格之间，所以不需要它们。

- **时长**：`GLIDE_BASE_MS 420 + dist × GLIDE_SLOT_MS 120`，封顶 `GLIDE_MAX_MS 1600`。曲线只用 **ease-out**（`easeOutCubic`）：出发即有速度、落位渐渐停下；ease-in-out 会在每次选择前先「蓄力」，读起来很假。
- **小数部分是 `progress`**：`carried += target − at`，整数部分改 `current`、小数部分给 `progress`，所以运动是连续的而不是一帧一格。
- **落位必须精确**：行走结束把 `progress` 归零，否则书架会停在两盘之间，下一次箭头就只走半格。
- **`lock` 在行走期间为真**：箭头、滚轮、另一次选择都被挡在外面；但 **`stage.pointerdown` 仍然可以接管**（和弹簧落位期间一样），抓住就取消 glide——访客的手永远比动画优先。
- **flat 模式**用同一套行走，只是时钟更短（`300 + dist × 90`）；**reduced-motion** 直接落位（`current = target` + `reseat(true)`）。
- ⚠️ 选择器跳转**不再使用** `filterOutPending` / `pendingSeat`，这两个量已从代码里删掉（`pendingSeat` 整个概念消失）。

### 二、磁带盒入场动画 = 站内跳转专属；会话首页只播站点开场

用户要求：「逐个进入磁带盒动画，则可以作为当从其他界面切换到 projects 或 lab 界面时，播放的入场动画。但如果用户是第一次加载这个网页，这时候则只播放 RrSuika Studio 入场动画」。

**判定不自己算，直接读站点开场自己的结论。** `Layout.astro` 的 SITE INTRO GUARD（`<head>` 内联脚本）已经回答了「这一页播不播封面」——会话首页播、F5 播、站内跳转不播、back/forward 与 reduced-motion 不播——现在它在**决定播放**的那一支多写一个 `window.__rrsIntroPlayed = true`，书架读它：

| `__rrsIntroPlayed` | 这一页是 | 书架入场 |
| --- | --- | --- |
| `true` | 会话首页 / F5（封面在播） | **`silent`**：书架已经就位，开场幕布在第一帧就摘掉 |
| 不存在 | 站内跳转（封面被跳过） | **`ladder`**：逐个升起的入场动画 |

⚠️ **不要用 `sessionStorage["rrsuika-intro-seen"]` 自己推。** 第一版就是这么写的，结果正好错在首页：内联 guard 在**模块运行之前**就把这个键设成 `"1"` 了，所以模块读到的一直是 `"1"`，判定成「站内跳转」，于是书架的梯级动画在封面**底下**跑完——正是用户要去掉的那个行为（实测首页 1.2s 时 `rising: true`）。两个「是不是首次加载」的定义一旦分开，就一定会对不上。

⚠️ **也不要读 `window.__rrsIntroGate` 是否存在**：guard 在两条分支里都会创建它（跳过时是 `Promise.resolve()`），所以它永远存在，判定会一路沉默（实测：站内跳转也不播入场）。

`startIntro` 的形参因此从 `full: boolean` 改成 `mode: "ladder" | "silent"`；`silent` 把 `introT0` 回拨到整个序列之前，于是梯级不播、幕布在第一帧摘掉、书架直接就是就位状态。站点开场存在时仍在 gate 回调里**重新** stage 一次，保证梯级从封面打开那一刻开始。

⚠️ `boot.warm` / `WARM_KEY` 从模块里删除了（`rrsuika-shelf-warm` 仍由组件底部那段内联预加载脚本使用，只是书架不再读它）。原地留下的一段旧注释也已同步。

### 三、复验（CDP，`--disable-frame-rate-limit` 必加）

⚠️ **headless Chrome 会把 rAF 限到约 9fps**，不开这个开关，行走的时长/帧数全部失真（实测 3 秒只跑到 `t=0.47`，看起来像动画卡死）。

| 判据 | 结果 |
| --- | --- |
| 会话首页不播梯级（`rising === false`，且 1.2s 时已 `ready`） | ✓ |
| 站内跳转播梯级（`rising === true`） | ✓ |
| 跳转是一次 `glide`（`active`、`dist` 与实际距离一致） | ✓ |
| 中间唱片被依次经过（`passed` ≥ 行走槽数−1） | ✓ |
| **环没有被重建**（`ringSize` 前后不变） | ✓ 26 → 26 |
| 用到了小数槽位（说明是「走」而不是「跳」） | ✓ `max |progress| = 1.0` |
| 落到所选那盘，右侧档案面板同步 | ✓ |
| glide 结束、`lock` 释放 | ✓ |
| 走完之后箭头照常换盘 | ✓ 连续三下依次前进 |
| 行走途中按住鼠标可以接管（`lock:false`、`glide:false`） | ✓ |
| tag 筛选仍然走两拍混合（不是行走） | ✓ `busy.filter === true` |

⚠️ `window.__rrsShelfInfo` 新增只读 getter：`glide`（`active/at/dist/dir/carried/dur/t`）、`index`、`bounds`（`from/to/ring/lock/launching/introDone/swapRising/glide`）、`rising`、`swapRising`。`rising` 是必要的：**模式切换（`applyMode → reseat → startRiseIn`）会做和梯级一样的淡入**，只看 `--cas-o` 会把两者混为一谈。另外**CDP 的回复是 `{id, result:{result:{value}}}` 两层**——`r.result.value` 对任何表达式都返回 `undefined`，看起来就像「页面没有 hook」，这一轮为它绕了一大圈。


---

## 追加（2026-09-28 之三）：入场「看不到升起」+ 进这两个页面要等好几秒

用户报：「从首页切换到 project 界面时，所有磁带盒都是直接从暗处浮现」+「每次切换到 project 或 lab 界面，都要等好几秒加载。之前是直接显示磁带盒，不需要加载」+「这些加载应该在 RrSuika Studio 开场动画时加载完成」。

**四个原因，都实测过。**

### 一、入场动画其实播完了，只是「没升起」——因为它早就在时钟上跑完了

`startIntro` 算的是 `introDuration = introEnd()`，而 `introEnd()` 是**整段开场**的长度（十个梯级 + 中央拉出 ≈ 4.7s）；循环要等到 `now - introT0 >= introDuration + CURTAIN_FADE` 才调 `finishIntro`。于是梯级在 ~2.7s 就播完了，**但书架还会「没就绪」两秒多**——箭头不响应、面板不出现、什么都不工作。这就是「要等好几秒」。

更隐蔽的一半：`finishIntro` 一旦被这一行提前触发（时间戳早过终点线），它就把 `introDone` 记成 `true`，之后 `navigate` 一直拒绝按键。前一轮修的就是这个。

**修法**：入场的时钟改成**梯级自己的长度**：

```js
function introEnd() { return riseMs() + PULL_DUR * 0.25; }
```

同时把梯级本身收紧：`RISE_START` 260 → **150**、`RISE_STAGGER` 130 → **90**、`RISE_DUR` 1150 → **900**、`PULL_DUR` 1700 → **1250**、`CURTAIN_FADE` 320 → **260**。

**实测**（CDP，`--disable-frame-rate-limit`）：
| | 修前 | 修后 |
| --- | --- | --- |
| 梯级持续时间 | ~2.7s | **2.09s** |
| 书架可交互 | ~4.7s | **2.28s**（= 梯级结束那一帧） |

⚠️ 关键判据是 **`ready - riseEnd < 400ms`**：入场结束的那一刻就该能用，而不是再等两秒。

### 二、十三张封面全部 `loading="eager"`

`.cas img` 无条件 `loading="eager"`，于是一个列表页在**最高优先级**上先抓十三张 960px webp（**实测 1.2MB**）。改成只有**静止时在台上的前五盘** eager（`index < MAX_SLOT_COUNT + 1`），其余 lazy。

⚠️ `items` 是**按日期倒序**排的，而 `buildRing` 把主磁带坐在 `half`（= `MAX_SLOT_COUNT` = 4）个位置之后，所以静止时在台上的是 `items[0..4]`。**这个索引变了要跟着改**。

实测发布页：eager 5 / lazy 8 ✓。

### 三、下一批图没人预热

首页和书架页**没有任何共用封面**（实测：首页 3 张、书架 12 张、交集 0）。所以从首页点进 /projects/ 要付两块账：列表 HTML 一次、十二张封面一次。

现在**在开场动画打开的那一刻**就把**另一个列表页**抓下来：文档进 HTTP 缓存，而文档里带着封面的 URL，封面自然跟着走。

⚠️ **这件事原来放在 `CassetteShelf` 的内联脚本里，所以只在这两个列表页自己身上跑**——实测「到达 /projects/ 的时候抓了 /lab/」，而**首页那次最重要的预热从来没发生**。现在移到 `Layout.astro` 的 head guard 里，每页都跑，首页也在内。

⚠️ 三条实现约束，每条都是踩出来的：
1. **用 `fetch()`，不用 `<link rel="prefetch">`**：prefetch 只是提示，而浏览器在「这个 URL 同时也是导航目标」时会丢掉它；fetch 才会把**文档**放进缓存。
2. **不要再顺手 `<link rel="preload">` 那些封面**：实测「文档正在被抓取时，同一张图的 preload 提示会被浏览器丢弃」——它是个什么都不做的提示，删掉了。
3. **不要抓访客当前所在的那一页**：实测这会被算进到达过程里（/projects/ 上量到 **CLS 0.121**）。现在跳过当前页，实测 CLS **0**。

⚠️ **不要用一次性事件**：guard 在 body 之前跑，内联事件会在任何监听器存在之前就发完。所以它只置一个 **`window.__rrsIntroOpened = true`** 旗标，消费方「先查旗标、再轮询」——正常路径是立刻命中。

### 四、复验

| 判据 | 结果 |
| --- | --- |
| 首页在封面打开后抓 **两个**列表页 | ✓ `["/projects/","/lab/"]` |
| 到达 /projects/ 播放梯级 | ✓ riseStart 197ms |
| 梯级是真的一段动画（不是瞬间到位） | ✓ 持续 **2087ms** |
| 梯级结束即可交互 | ✓ `ready - riseEnd = 0ms` |
| 整段到达 < 3s | ✓ **2284ms** |
| 只有台上的封面 eager | ✓ eager 5 / lazy 8 |
| 预热不带来布局位移 | ✓ **CLS 0** |
| 回归：会话首页只播站点开场、不播梯级 | ✓ |
| 回归：选择器走过去、环不重建、glide 释放 | ✓ 走 3 槽、passed 3、rebuilt 0 |
| 回归：箭头换盘、拖动仍然可用 | ✓ |

## 追加（2026-09-28 之四）：站内跳转的入场必须走 `startRiseIn`，不是 `startIntro("ladder")`

用户原话：「我依旧没有看到你做的那个磁带盒逐个插入画面中的动画效果。他应该在切换到 lab 或者 project 时跳出来，而不是显示 RRSUIKA LAB Mounting archive 进度条（我不想等进度条，需要像之前那样切换直接就渐入磁带盒动画）。目前只能通过筛选 tag，选择不同的 tag 时才能看到这个磁带盒上升、新磁带盒从下方逐个进入的动画。」

**病灶：两种入场都叫 `ladder`，但只有一种会摘幕布。**

| 入口 | 播的梯级 | 幕布 |
| --- | --- | --- |
| `startIntro("ladder")`（原来的站内跳转） | 会 | **会重新挂上**：`introEl.classList.remove("is-done")`，要等 `finishIntro` 跑完 `introEnd()` 才摘 |
| `startRiseIn()`（筛选换盘用的那个） | 会（同一套 `introAt` 阶梯） | **保持 `is-done`**，第一帧就是隐藏的 |
| `startIntro("silent")`（站点封面在场时的首页） | 不播 | 第一帧摘掉 |

于是站内跳转时：梯级**确实在跑**，只是跑在一块写着 `MOUNTING ARCHIVE` 的黑色幕布**底下**；访客看到的是进度条，等的是 `introEnd() + CURTAIN_FADE`（实测约 2.1s）。tag 筛选之所以正常，正是因为它走 `startRiseIn`——**能看见的那个入口，恰好就是唯一不挂幕布的那个**。

**修法**：站内到达改成 `if (entrance === "ladder") startRiseIn(); else startIntro(entrance);`。首发（站点封面在场）仍然 `startIntro("silent")`，幕布由封面负责，进场的重新 staging 照旧。

**实测（CDP，从首页点导航进 `/projects/`）**：

| 时刻 | `#shelf-intro` | `is-done` | `introDone` | `rising` | `swapRising` |
| --- | --- | --- | --- | --- | --- |
| 400ms | opacity 1 | true | false | true | true |
| 900ms | 0.026 | true | false | true | true |
| 1500ms | 0 | true | false | true | true |
| 2400ms | 0 | true | false | true | true |

幕布在 **400ms 内就淡到 0.03**（`CURTAIN_FADE` 是 260ms），并且是**淡出**而不是「存在然后消失」；`rising` 全程为真，梯级全程可见。

⚠️ **`entrance` 这个名字骗人**：它区分的是「首发 / 站内到达」，不是「播不播梯级」——两种都播梯级。改这里之前先看清调用的是哪个函数，**会不会摘幕布才是唯一的差别**。
## 追加（2026-09-28 之五）：入场末尾的一闪、以及幕布顶边

### 一、入场结束时“闪一下”：入场时钟比最后一档短了 780ms

`introAt` 的阶梯按 `clamp(slotIndex, -span, span) + span` 排，而 `slotIndex = tape.ring - current + progress`，`tape.ring` 跑的是**整个环**（0..2·half）。所以最后一档的阶数是

```
RISE_LAST_ORDER = 2 * MAX_SLOTS + PARK_SLOTS     // half=4 时 = 9
```

**而不是** `half + PARK_SLOTS`（= 5）。后者是“选中那盘到边缘”的距离，只有梯子的一半。实测：

| 量 | 旧 | 新 |
| --- | --- | --- |
| 最后一档 `introAt` | 600ms | 960ms |
| 最后一档淡入结束 | 1560ms | 1920ms |
| `riseMs()`（入场时钟） | **1500ms** | 1860ms |
| `introEnd()` | 1812ms | 2172ms |

于是 `introDone` 在最后一档还差 420ms 淡入时就翻成 `true`，渲染循环的门条件 `introElapsed < introAt + RISE_DUR + 60` 立刻失效，那一档被**直接摆到 hero 姿态**：缩放从 ~1.93 跳到 ~1.3、Y 位置突变，看起来就是“画面突然闪一下，左侧磁带盒变成一部分在画面外”。

**修法**：新增 `RISE_LAST_ORDER = 2 * MAX_SLOTS + PARK_SLOTS`，`riseMs()` 用它算。现在最后一档的淡入在 1920ms 结束，入场时钟 1860ms，**进入 hero 姿态的那一帧已经是稳态**，没有可跳的东西。

⚠️ **这类 bug 的通用形式：动画结束的判据不是“动画真的结束了”。** 旧的值不是算错，是算了另一件事（选中盘到边缘的距离）。判据要从动画自己的用量推出来（最后一档的 `introAt + RISE_DUR`）。

### 二、幕布顶边：不是曲线不够缓，是**最浓的一端落在了页面中间**

上一轮把渐变做成了对数空间里常比衰减（0.72 → 0.403 → 0.226 …），曲线本身很缓——**但那不是访客看到的边**。实测几何：

```
header        0 .. 75
.shelf-page  75 .. 899
.shelf-stage 155 .. 899      <-- 幕布（inset: 0）就从这里开始
```

幕布用 `inset: 0` 时，**整条曲线最浓的一端（0.72）落在页面内部 80px 处**：上面是原始星野，下面是 0.72 黑场，一条横贯全宽的接缝。“把曲线改更缓”治不了它，因为缓的是变化率，不是起点的位置。

**修法是位置性的**：幕布向上延到**页面自己的顶部**（`.shelf-page` 发布 `--shelf-top: 80px`，幕布 `top: calc(-1 * var(--shelf-top))`），于是最浓的一端落在视口上沿（读起来是明暗对比，不是接缝），而**幕布顶在 4% 处只剩 0.50**（原来是 0.72）。渐变重新铺到 92% 才到透明。`.shelf-stage` 的 `overflow: hidden` 会把多出去的部分裁掉，所以这个改动不会溢出去。

⚠️ **不要用 `getBoundingClientRect` 判断“有没有硬边”。** 带字是一条色阶，边是它里面的不连续点，几何 API 看不见。要么截图后读像素（在页面里用 canvas 解码，不要自己写 PNG 解码器），要么直接看截图。这一轮就是先把“已经很缓了”当成结论才绕远了。
## 追加（2026-09-28 之六）：换 tag 的一帧闪现、以及每个磁带盒轮流闪

### 一、选 tag 后的“闪一下再消失”：`filterOut` 在重建前被归零

连拍 `--cas-o`（每一帧）得到的序列：

```
1.00 … 0.01   退场节拍，真的在淡出
0.01 -> 1.00    <-- 一帧，整排重建完毕且全不透明
1.00 -> 0       又没了
                然后才开始升起
```

`stepFilterSwap` 在 `buildRing` 前把 `filterOut = 0`，于是渲染循环下一帧的 `opacity *= (1 - filterOut)` 变回乘 1，而**新环里每个 tape 的 `vis` 初始值就是 1**，所以那一帧把整排画了出来。

**修法：空档期间 `filterOut` 保持 1**（乘 0），直到 `startRiseIn` 接管这一拍时才归零。那一帧虽然还是“新环 + Y 偏移”，但 opacity 为 0，不可能被看到。

### 二、“从左往右每个磁带盒都闪一下”：CSS 过渡在和 JS 抢同一个属性

`.cas-f::after`（深度遮罩）上有 `transition: opacity 0.2s linear`，那是给遮罩用的。但**入场期间渲染循环每一帧都在写 `--cas-o`**，每一次写入都重启一次 200ms 交叉淡入，画面上的透明度因此**滞后于姿态**。梯子是从左往右走的，所以这个滞后一帧落在一个磁带盒上——就是访客描述的那个“依次闪”。

**修法**：渲染循环把 `rowBusy` 镜像成元素上的 `.is-anim`，`.shelf.is-anim .cas-f::after { transition: none }`。安静下来后类名移除，遮罩拿回它自己的过渡。实测：入场 104 帧里 63 帧 `is-anim` 为真，2375ms 左右关掉；**上升期间“已经亮起来的磁带盒又暗下去”的帧数 = 0**。

⚠️ **不要把 `transition` 写在 `.cas-f` 上**：过渡在**遮罩**身上，写到 face 上是同一个属性的第二道更重的淡入。

### 三、一个跨整个会话的教训：锚点要从文件里复制

这一轮有四个脚本因为**把多行锚点凭记忆写出来**而静默地什么都没替换（缩进差两个空格、CRLF 与 LF、`cn:` 的层级不同），其中一次还因为存在性检查失败而**只写了一半**。规矩：

1. **先检查全部锚点，最后只写一次**；任何一个不命中就整个中止，不要边改边写。
2. **能用单行锚点就用单行**：它不可能把下一行的缩进猜错。
3. **改完读回来验一个结构性特征**（`includes` 一个只能由这次修改产生的字符串），而不是相信脚本自己的回执。
## 追加（2026-09-28 之七）：中间磁带盒穿模

实测（逐帧读 inline transform）：升起期间**只有第 10..19 号磁带盒拿到了 transform**，其余二十个没有，于是它们以 **identity 矩阵**停在舞台原点——就是一堆满尺寸的磁带盒叠在 (0,0)。配上当时的 `RISE_SCALE_FROM = 2.05`，这堆盒子就从正中间穿出来。

**修法两部分：**

1. 没有姿态的磁带盒**不该被画出来**。`inRing` 本来就能回答“这盘不在环里”，直接给它 `is-hidden`（元素级的 `visibility` 开关，**不动 `tape.vis`**，所以带宽淡入照旧）。
2. `RISE_SCALE_FROM` **2.05 → 1.72**：2.05 时相邻盒子在 1440px 舞台里就会重叠，而后墙还没开始后撒。

⚠️ **判据：一个元素没有 inline transform 就不是“不可见”，而是“停在原点”。** `getComputedStyle().transform` 会返回 `matrix(1,0,0,1,0,0)`，看起来就像“尺寸 1、位置 0”，很容易被误读成一个合法姿态。
## 追加（2026-09-28 之八）：「突然刷新放大」的真正原因 —— X 没有一起补间

访客自己定位到了：「一开始从下往上渐入的时候，左右侧的磁带盒暂停后的位置距离刷新后的位置还差很多…然后出现一次从左到右的刷新，磁带盒会放大，或者说会放大并移动到他们常态的位置。」

**原因在 X，不在缩放。** `introFrom()` 在整个攀爬过程里把 X 按死在**架子车道**上：

```js
x = from.x          // shelfPose(pos).x = pos * SHELF_STEP   —— 线性
```

而升起结束的那一瞬间 X 变成 `heroPose(pos).x`，它是

```js
p * SPREAD_X + p * |p| * SPREAD_X2 + sign(p) * PASS_GAP * pass   // 线性 + 二次
```

**两条曲线在中间重合、越往两边分开得越厉害。** 所以跳的恰恰是最外侧的磁带盒——就是访客看到的“最左侧一半在画面内一半在画面外”。实测最大侧向跳变约 **230px**。

**修法**：X 和其他量一样按 `rt` 补间，磁带盒是**升到**它的终点，而不是先爬一条车道再被横移到 hero 曲线上：

```js
x = lerp(from.x, heroX(pos), rt);
```

实测修后：全程最大单帧侧移 **32px**（发生在 t=112ms，就是起步那一下），磁带盒的总侧向行程 227px 平均分摊在整段升起里。

⚠️ **同时修了一个同类的一帧台阶：呼吸。** `heroPose` 的 `breath` 项受 `idle` 控制，而 `idle = rowBusy`，`rowBusy` 在 `introDone` 翻转的那一帧就变 false——于是 breath 被冻结在一个非零值上，Y 突然跳回。现在只有整排真正静止时才停。

⚠️ **判据：不要用缩放量去猜这类 bug。** 第一轮我测的是 `scale`，它一直是连续的，于是我得出“已经很平滑”的错结论。**要测的是那个真正在跳的量**——问一句“哪个量在跳”比“再优化一下”快得多。
## 追加（2026-09-28 之九）：升起的缓动曲线、每帧重绘成本

### 一、「跳了 35px」的根因：`easeOutCubic` 在 t=0 的斜率是 3

升起用的是 `easeOutCubic`，它在 t=0 处的斜率是 **3**，也就是说**每个磁带盒的第一帧就跑了平均速度的三倍**。实测 pos 5 的磁带盒在那一帧移了 35px，而它整段 900ms 的平均步长只有 ≈12px。

**修法：换成 `easeInOutSine`**（斜率 π/2 ≈ 1.57，且在两端为 0）——磁带盒**慢慢离开车道、慢慢到达**。实测最大单帧侧移 35px → **23–31px**。

⚠️ **23–31px 已经接近这个方案的下限。** 227px 的总侧向行程分摊在升起里，平均步长就是 227 / （900ms / 16.7）≈ **25px**；想再小只能动三个参数之一：**拉长 `RISE_DUR`**、**减小总行程**（即 `SPREAD_X2` / `PASS_GAP`）、或**分正负两侧对向升起**。

### 二、帧率：两个每帧都在重绘的东西

升起期间每一帧都在重绘所有磁带盒，而两件事在那个时候毫无收益：

1. **两块毛玻璃面板的 `backdrop-filter: blur(14px/16px) saturate(150%)`**。背景滤镜会在**它背后的内容每变一次就重采样一次**，而升起期间它背后每一帧都在变。这是这个页面上单件最贵的东西。
2. **远处磁带盒的 `filter: blur(calc(var(--cas-depth) * 2.4px))`**。模糊**半径在变**就不是合成而是**重新光栅化**，而升起期间每个盒子的 depth 每帧都在变。

两者现在都在 `.shelf.is-ladder` 期间关掉（这个类名由渲染循环发布，与上一轮的 `will-change` 共用），整排静下来立刻还原。

同时：`will-change: transform` 不再挂在全部三十个磁带盒上（那是三十个长期存活的合成层），而是只给**这一帧真的在爬的那几个**；主选磁带盒的**盘面自转在升起期间冻结**（每次写入都重绘一个 `repeating-conic-gradient`，是磁带盒上最贵的一笔）。

⚠️ **这一节的帧率结论没有硬数据。** 无头 Chrome 测不出真实帧时（采样间隔本身就是 20–50ms），所以这里是**按渲染成本推断**的修法，不是测出来的。要真验证得在真机上看 Performance 面板的帧时分布。
## 追加（2026-09-28 之十）：那 23px 是呼吸和抬升，不是路径

访客描述得很准：「目前 23px，视觉表现是动画停止以后整体**往上**移动 23px」。上一轮我测的 23px 是**侧向**的，他看到的是**竖向**的 —— 两个不同的量。

**竖向那一下的根因是 `heroPose` 的两个项，它们只在“整排还活着”时存在：**

| 项 | 量级 | 条件 |
| --- | --- | --- |
| `breath` | ±0.046 世界单位 | `idle` |
| `lift` | **+0.3 × heroMask** | 无条件 |

`idle = rowBusy`，而 `rowBusy` 在 `introDone` 翻转的那一帧就变 false，于是那个被存下来的 breath 值被一帧丢掉。`lift` 更大（世界单位 × `S` 是几十 px），而它之前**在升起期间也是开着的**——问题在于升起的**目标**和它落地的**姿态**不是同一组数。

**修法（采纳了访客的思路，但做在源头）**：`heroPose` 多一个 `crisp` 参数，升起用 `crisp = true` 取目标——**不带 breath、不带 lift**。于是梯子抵达的那一组数字，**就是**架子静下来的那一组，不差一像素。不需要偏置，因为已经没有位移可以偏。

**实测**（报 `introDone` 翻转的前一帧 vs 后一帧，逐个磁带盒）：

```
flipAtMs   2026
snapX      0
snapY      0
```

⚠️ **偏置是错的工具。** 把动画的 Y 往上挪 15px，只会把同一个缝换个位置（而且会在动画开头多出一条）。真正该做的是**让两端取同一组数**。

⚠️ **「动画停了以后还会动一下」这类报告，要问“哪个轴”。** 两轮里我都先测了错的轴（先 scale、后侧移），而访客一句“往上”就省掉一轮。
## 追加（2026-09-28 之十一）：正中间那盘的 16px —— `lift` 是目标，不是装饰

访客说得很准：「**除了正中间的磁带盒**，其他磁带盒在整个动画播放结束到常态之间都是无缝切换。但正中间这个磁带在动画结尾会突然向上移一段距离。」

**只有中间那盘会动，就是线索。** `heroPose` 里只有一个项是“中间高、两边低”的形状：

```js
const heroMask = Math.exp(-p * p * LIFT_FALL);   // 中间 ≈ 1，三个位置之外 ≈ 0
const lift = TUNE("lift", LIFT) * heroMask;
```

而上一轮把 `crisp`（关掉 breath + lift）挂在 `!introDone` 上，于是**所有磁带盒都朝着 `lift = 0` 补间，而中间那盘在翻转那一帧被交付 `lift = 0.3`**。逐帧实测（按 `data-index` 追踪中间那盘）：

```
2084ms  done=true  y = 13.6   <-- introDone 在这里翻转
2139ms  done=true  y = -2.3
```

**一帧 15.9px，且只有中间那盘。**

**修法：把两个项分开。**

| 项 | 本质 | 现在怎么办 |
| --- | --- | --- |
| `lift` | **目标的一部分** | `crisp` 完全不再碰它，梯子直接朝着它补间 |
| `breath` | 唯一剩下的装饰项 | 不再挂在翻转上，而是 `finishIntro` 打一个时间戳，`crisp` 再多持续 `BREATH_SETTLE_MS = 700ms` |

于是**翻转那一帧什么都不变**，breath 在之后静静地被释放。实测：中间那盘跨翻转点 `y = -2.3 → -2.3`，`snapX = 0 / snapY = 0`。

⚠️ **「只有某一个对象会跳」是一条强线索。** 它把范围直接收到那个对象独有的项上（这里就是 `heroMask`）——比“再优化一下整体动画”快得多。

⚠️ **取样要用稳定键。** 第一次探针用 `.cas.is-center` 和“离屏幕中心最近”取中间那盘，结果锁到一个停在原点的未授姿态盒子（y=0, s=1），报了个 2.3px 的假结论。`data-index` 在重排序后仍然稳定。
## 追加（2026-09-28 之十二）：中间那盘转身时和左邻子穿模

访客：「从下往上渐入动画里面的居中磁带盒和他左侧的磁带盒，在居中磁带盒旋转的时候会和左侧的磁带盒穿模。」

**算一下就知道为什么。** 间距是 `p·SPREAD_X + p·|p|·SPREAD_X2`，磁带盒宽约 **2.4 世界单位**：

| p | 安静时间距 | 安静时 scale | 升起时 scale | 升起时间距 |
| --- | --- | --- | --- | --- |
| 1 | 2.31 × 0.90 = **2.08** | 0.90 | 1.72 | 2.31 × 1.72 = 3.97 |

安静时就已经是 2.4 的宽度对 2.08 的间距（几乎没有缝隙），而升起期 **盒子变宽了一倍、间距没变**。叠上中间那盘的 `lift`、`Z_NEAR` 和 hero 旋转，它**旋转后的角**扫进了左邻子的体积。屏幕空间从来没有重叠 —— **是 3D 里交了**。

**修法：升起期间把横向间距撑开。** 新增 `RISE_SPREAD = 1.34`，只乘在**线性项** `SPREAD_X` 上，并按 `introDone` 缓动（不是硬切）—— 邻居在中间那盘转身时让开，随后再靠回来。

⚠️ **不能乘 `SPREAD_X2` 和 `PASS_GAP`**：二次项和半格 bump 是**安静时的构图**，缩放它们会改变架子静下来的样子。

⚠️ **`heroX()` 必须用同一个乘数。** 梯子的 X 目标和它落地的姿态一旦不一致，就是这个文件早先那个 **230px 侧向跳变**的同一类错误。两处现在都传 `riseSpread`。
## 追加（2026-09-28 之十三）：动画结束后整排再「往中间拉伸」一次

访客：「从下往上的动画后，磁带盒停止移动的时候只有三个磁带盒，而这个动画结束后两侧的磁带盒（从铺满画面的 6 个变成 11 个）会再往中间拉伸一次，这时候左侧边缘外移动进来两个磁带盒。我不需要这个拉伸，我希望在从下往上的动画时候他们的位置就是一步到位的。」

**这是之十二那次修的副作用，不是新 bug。** `RISE_SPREAD` 是为了让邻居在中间那盘转身时让开，但它是**整排属性**、而且缓动挂在 `introDone` 上：

```js
const spreadTarget = introDone ? 1 : RISE_SPREAD;   // ← 旧代码
riseSpread += (spreadTarget - riseSpread) * Math.min(1, dt * 3.4);
```

`introDone` 翻转的那一刻，**整排已经落在 1.34 倍的宽位上了**，然后才开始往里收 —— 收的过程就是访客看到的那一次多余拉伸。

**实测（`输入/_scratch/shelf-ladder.mjs`，/projects/，1440×950）**：

| | 修前 | 修后 |
| --- | --- | --- |
| 最后一档爬升结束后每盘的最大横移 | **166px**，1.5s 后还没停 | **0px** |
| 爬升结束时屏幕上的磁带 | 6（之后涨到 11） | 11（爬升途中就到了） |
| 左侧空白磁带（b19 等） | 先荡出 190px 再荡回来 | 不动（|p| ≥ 3 不再参与让位） |

### 改法：让位从「整排的目标」变成「每一盘自己爬升途中的临时量」

```js
const near = clamp(1.6 - 0.6 * Math.abs(pos));                   // 只有中间那盘和它左右的邻居需要让
const spreadNow = 1 + (RISE_SPREAD - 1) * near * (1 - smooth((rt - 0.72) / 0.28));
x = lerp(from.x, heroX(pos, spreadNow), rt);
```

- **`rt = 1` 时乘数正好是 1**，所以每一盘**落在它将来静止的那个位置上**，动画一结束没有任何东西还需要移动；
- **保留到 `rt = 0.72`**：在那之前磁带盒的 scale 还在 1.72 → hero 之间过渡，体积是超的，让位是必需的（之十二的穿模修复原样保留）；
- **按离中心距离加权**：真正会撞上转身那盘的只有它左右各一盘，所以外侧磁带（以及填满左侧的空白磁带）整段爬升都待在自己的终点位置上。

⚠️ **判据是「动画结束之后还动不动」，不是「爬升途中动不动」。** 爬升本身当然有位移 —— 那是动画。修前的问题是有位移发生在 `introDone` **之后**。

⚠️ **两个量测陷阱，都踩过：**

1. **按 DOM 顺序配对两帧，而不是按 `data-index`。** 环里有 24 个空白磁带会在重排时换位置，于是「第 3 个元素」在两帧里根本不是同一盘 —— 第一版探针因此报了一个 **779px 的假拉伸**。
2. **必须把空白磁带算进来。** 选中项是最新的一条，**它左边没有更早的条目**，那半排全是空白磁带。「左侧边缘外移动进来两个磁带盒」说的正是它们；只看 `.cas[data-index]` 会得到一排「没有左侧」的假象（13 条里只看到 6 条）。

### 三个入口都验了

| 入口 | 结果 |
| --- | --- |
| 站内跳转的梯级（`/lab/` 13 条、`/projects/` 6 条） | 最后一档结束后 **0px** |
| 冷启动首屏（站内开场幕布下面的同一段梯级，`shelf-ladder.mjs … direct`） | **0px** |
| 筛选换盘（`startRiseIn`，`shelf-swap.mjs` 点 ESP32 标签） | **0px**，静止 11 盘 |

⚠️ 换盘走的是**同一段爬升代码**，所以改这里必须一起验它 —— `startRiseIn` 设的也是 `introAt`，只是没有幕布、`swapRising` 为真。