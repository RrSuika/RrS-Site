# 背景层 — 星空 / 引力透镜 / 黑洞视频

> 来源：原 `CLAUDE.md`「Background layers (§10)」里的星空、黑洞视频层、引力透镜三段（逐字搬运），后接原 `AI_CONTEXT.md` §6.3 的同一主题中文说明。
> 涉及文件：`Layout.astro` 的星空脚本、`src/components/GravitationalLens.astro`、`global.css §10`。
> 历史与实测见 `decisions.md` 决策 18（黑洞层与 `--blackhole-y` 教训）/ 19（星空每帧开销）/ 20（透镜物理）/ 21（视口自适应拟合）。
> ⚠️ 基线值分散在两处（`global.css §10` 与组件内的 `FALLBACK`/`SCALED`），**改一处必须两处同步**。

## A. 规则与陷阱（原 `CLAUDE.md`，逐字）

- Background layers (§10): active 3D starfield canvas (`#starfield-canvas`, script in Layout.astro — celestial-sphere stars with realistic spectral colours, proper motion, camera drift + local star drag; opacity 0.85 dark / hidden in light (replaced by retro black grid)) + hex grid + noise + scanlines (0.28 dark / 0.08 light) + vignette.
- The old `#neural-canvas` neural network and the earlier 2D star script are disabled-but-preserved for rollback (`data-neural="enabled"` / `data-star-version="2d"`).
- **Homepage black-hole video layer** (§10, dark mode, homepage only): `#blackhole-layer` (pure black base + `public/media/blackhole.mp4` — **1950×1062 / 60fps / 301 frames / 5.017s / 2.79 MB**, the user's own render with its colour drift and brightness swing corrected; **§D** below) sits *before* `#starfield-canvas` in the DOM, so the homepage stack is black → video → stars → lens → content. All four backgrounds share `z-index: 0`; **layer order is DOM order — do not move the markup**. Tune size/position with the `--blackhole-*` knobs inside `#blackhole-layer` (`--blackhole-y` is `calc(122px + 37.8vh)`, fitted to two hand-tuned measurements — never assume the viewport matches the screen resolution). **Desktop only**: the layer is `display: none` until JS adds `.bh-on` at ≥ 769px, and the video uses `data-src` so phones never download it. Only the three homepages pass `blackhole` to `<Layout>`; other pages, light mode and mobile are unchanged. The video plays **continuously** — no pause on tab-hidden or theme switch (user request); a 2s watchdog re-plays it if the browser pauses background media.
- **Gravitational-lens starfield** (§10, homepage only, dark mode + desktop): `src/components/GravitationalLens.astro` renders `#lens-canvas` *after* `#starfield-canvas` and takes over from it (`html[data-lens="on"]` hides the celestial field and the Layout script skips its work). Stars are **one continuous inward stream** — each is born near the outer edge and falls monotonically toward the hole through three speed segments (outer very slow → middle fast → inner slowing toward the ring) while spiralling clockwise (`--lens-swirl`, ∝ rRing/r); mid-flight the disk occludes them, and they **fade out at the black-hole outer ring** before respawning outside (no per-layer loops); **inside `--lens-r-ring` nothing is drawn (pure black)**. Because the video sits *below* the starfield, an **accretion-disk annulus** — a rotated ellipse whose inner and outer edges each have independent half-width/half-height (`--lens-disk-inner-w/h`, `--lens-disk-outer-w/h`, `--lens-disk-tilt/dx/dy/feather`), shifted up so its lower half is smaller — hides stars whose lensed screen position lands on the disk; they **fade out at the edge** and fade back in inside `diskInner`, next to the ring, where a **circular photon band** of tiny, bright, **non-stretched** stars fills the gap (`--lens-photon-band` width — keep it inside the disk's inner ellipse so the band stays circular — `--lens-photon-size` size multiplier, `--lens-gap-boost` brightness). All knobs are unitless custom properties on `#lens-canvas`; **the seven video-anchored geometry knobs** (centre-Y `cyVh`, radii `r-outer/r-mid/r-inner`, ring `r-ring`, disk-inner `w/h`) **are viewport-adaptive while §10 sits at the shipped baseline**: the component two-point-fits them (px ∝ viewport W) between the §10/FALLBACK profile (tuned on a 2K desktop, 1661×802) and a second calibration profile (1080p desktop, 1234×562 — the `SCALED` table in GravitationalLens.astro §2a), so the hole/ring/disk line up with the video on any window wider than the clip's own ratio (⚠️ **1.836:1** since 2026-09-30, it was 16:9 before; see §D.6) — drag the window to another screen and it re-fits on resize. Tuner inline values or a hand-edited §10 block that differs from FALLBACK freeze verbatim. **Re-baselining the look = replace global.css §10 AND the matching `FALLBACK`/`SCALED` values in the component together** (the COPY output's `⚠` note says when a block contains auto-fitted values). **Keyboard tuner** (frosted-glass panel, draggable by its header; opens from the navbar tool icon, `` ` `` or `?lens=tune`): `1`–`0`/`TAB` select, arrows nudge (**Shift ×10 / Alt ×0.1**), the panel shows a per-target description (localised en/zh/nl; drag clamped to the viewport; themed thin scrollbar), the **COPY button** (or `C`) copies the tuned values — viewport size + px radii included — for global.css §10 or the AI, `R` resets. Tuning persists in `localStorage["rrsuika-lens-tune-v7"]` per browser — never in the repo (only nudged knobs are saved, so a tune from one screen never freezes another screen's defaults).

## B. 参数与实测（原 `AI_CONTEXT.md` §6.3，逐字）

### 6.3 背景层（§10）

**首页（en/zh/nl 三个 index）暗色模式叠层，由下到上固定为：纯黑底（`#blackhole-layer` 的 `background: #000`）→ 黑洞视频（`#blackhole-video`，`public/media/blackhole.mp4`）→ 星空（`#starfield-canvas`，桌面端暗色下由 `#lens-canvas` 引力透镜星空接管）→ 页面内容（`.site-content` z-index 1）+ 扫描线/暗角。** 三者同为 `z-index: 0`，靠 DOM 顺序决定前后（`#blackhole-layer` 在 `#starfield-canvas` 之前）；其他页面不渲染黑洞层，只有「`--bg` → 星空 → 内容」。黑洞视频层的尺寸/位置由 6 个 `--blackhole-*` 变量控制（定义在 global.css §10 的 `#blackhole-layer` 内，注释即说明书）；light 模式 `display: none`，`prefers-reduced-motion` 时脚本停播、只留首帧静帧；首帧解码完成后 0.5s 渐入（`.bh-fade` → `.is-ready`），避免加载时视频闪跳。**仅桌面端**：层默认 `display: none`，JS 在 `min-width: 769px` 时加 `.bh-on` 才显示，且 `<video>` 用 `data-src` 由 JS 挂载，手机端零请求（实测 390px 视口 `readyState=0`、`src` 为空）。

`#starfield-canvas` 动态星空画布（fixed，dark `opacity: 0.85`，light 隐藏星空，改用复古黑色四边形+十字网格背景，3D 天球式星星：真实恒星光谱色、自行运动、缓慢相机漂移 + 鼠标近旁星点局部拖拽动画、微光/十字星芒）+ hex grid（`body::before` 三向 linear-gradient，`52px 90px`）+ noise（`body::after` SVG feTurbulence data-URI）+ scanlines（`#crt-overlay`，dark `opacity: 0.28` / light `0.08`，`mix-blend-mode: screen`）+ amber vignette（`#tube-vignette`，`opacity: 0.6` / `0.4`）。星空脚本在 Layout.astro 内（参数区：恒星数 90–3000（前端视锥内约 88% 正向采样，桌面端最多 3000 / 移动端约 900）、`AUTO_ROTATION = 0.00032`、鼠标近旁星点局部拖拽（不随鼠标整体旋转）、`STAR_WEIGHTS` 按真实恒星颜色分布；性能折衷：光晕仅在亮星启用、DPR cap 1.5；星空不再整体跟随鼠标，改为局部星点拖拽）。原 `#neural-canvas` 神经网络粒子画布与 2D 版星空脚本被暂时禁用保留（`<html data-neural="enabled">` / `data-star-version="2d"` 可回退）。**性能（2026-09-09）**：每颗星的径向渐变在首帧算一次并缓存到 `star.cache`（`prepareStar()`），绘制时用 `ctx.translate()` 复用；此前是每帧每星 `createRadialGradient()` + 4 次 `addColorStop()` + 现拼 rgba 字符串，600 颗星实测约 3.0ms/帧，缓存后约 0.9ms/帧（headless Chrome 软件渲染基准），这也是首页视频偶发掉帧的主因。

## C. 黑洞视频：慢速 / 60fps / 无缝循环（2026-09-20；⚠️ **已被 §D 取代，本节保留为方法与实测记录**）

> **当前线上素材不是本节做出来的那个。** §C 记录的是 2026-09-20 那版（从旧成片反推、RIFE 补帧慢放）。2026-09-30 用户提供了新渲染，见 **§D**。本节仍有价值：里面的量法、时长约束、以及「慢放会放大素材固有抖动」那条结论都还成立，而且**再遇到「给一段成品做慢放/循环」时照抄即可**。

`public/media/blackhole.mp4` = **1920×1080 / 60fps / 600 帧 / 10.000s / 5.48 MB / 无音轨**，是原始 5 秒素材的 **1/2 速**版本。原始素材已不在工作区（`输入/黑洞动画 - AI 插帧.mp4` 已删），只有仓库里那份 298 帧的成片，所以下面全部是**从成片反推**的。

### C.0 ⚠️ 时长不是自由参数：无缝 + 慢速 + 60fps 三者把它锁死了

**动画本身的周期是 300 帧 = 5.000s（见 C.1），这是硬约束。** 慢放 S 倍 ⇒ 时长 `5.000 × S`，**与帧率无关**（帧率只决定帧数，不决定时长）：

| 慢放 | 时长 | 60fps 帧数 | 起步体积 |
| --- | --- | --- | --- |
| 1× | **5.000s** | 300 | ~3 MB |
| **2×（当前）** | **10.000s** | **600** | **~5.5 MB** |
| 3× | 15.000s | 900 | ~8 MB |
| 4× | 20.000s | 1200 | ~10 MB |

**所以「5 秒」和「慢速」不可能同时成立**——5 秒正好就是原速。第一版做成 4× / 20s / 10.16 MB，用户反馈「20 秒也许过长了，其实 5 秒就可以，只要能无缝循环、慢速、高帧」，于是收到 **2× / 10s**：比原速慢一倍、体积几乎减半，而且慢放倍数越小、C.5 那个「慢放放大固有抖动」的效应越轻。想更慢就往上走一格，改法只是换掉 C.2 第 3 步的 `-n`。

### C.1 先量出来的两件事（推翻了「原片无缝」这个前提）

1. **原片不是 298 帧的循环，是 300 帧。** 对全部 298 帧算 `MSE(frame i, frame 0)`：曲线在 **i = 132 处取极大（167.7）**，且**关于 i = 150 对称**——`g(12)=57.5 vs g(288)=61.7`、`g(24)=90.3 vs g(276)=91.0`、`g(96)=146.7 vs g(204)=148.1`。自相关函数必然偶对称，这是**周期 300 帧（正好 5.000s）**的签名：导出时丢了最后 2 帧。
   → 后果：原片首尾**并不真的吻合**。`frame297 → frame0` 的 MSE 是 **24.93（34.16 dB）**，而 297 个相邻步的中位数只有 **3.58** —— 接缝是 **6.96 倍**于一步正常位移，相当于一步跳掉 5–6 帧的运动量。用户说「几乎看不出来差别」是对的（34 dB 在静帧上肉眼确实分不出），但**在运动上是断的**。
2. **原片每帧位移是匀速的**：298 步的 MSE 按 25 帧分块统计，均值稳定在 1.84–2.29，全程无速度变化。所以可以做**均匀** 1/4 慢放，不需要变速处理。

### C.2 做法：先把丢掉的 2 帧补回来，再插帧

⚠️ **顺序是关键，也正是「剪辑软件 4 倍慢放 + AI 插帧」必然失败的地方**：NLE 先把时间轴拉长再插帧，插帧器拿到的最后一对是 `297 → 297`；循环点真正需要的 `297 → 300` 那一对**根本不在素材里**，所以首尾必然接不上。

正确顺序是先**补周期**、再**插帧**：

1. `RIFE(frame297, frame0)` 取 `t = 1/3`、`2/3`，合成出周期里缺的第 298、299 帧（这一对跨越 3 个相位，所以 `t = 1/3` 正好落在相位 298）。补完得到完整的 **300 帧周期**。
2. 在周期末尾再拼一份 `frame0` 当第 301 张（**闭环锚点**），得到 301 帧输入。
3. **一趟搞定，不必两趟**：`rife-ncnn-vulkan -i in -o out -n 602`。⚠️ 目录模式的步长是 **`count / numframe`**（不是 `(count-1)/(numframe-1)`），所以 `C = 301` 配 `-n 2C` 让输出 j 正好落在源位置 `0.5j` —— 2× 一趟到位；**同理 4× 也只需一趟 `-n 4C`**，不需要两趟 2×。
   - 取前 **600** 帧（位置 0 … 299.5）；末尾几帧是被 clamp 的重复帧，丢掉。
   - ⚠️ 输出目录**必须先建好**，否则 `path_is_directory` 为假、该路径被当成输出文件而报 `invalid outputpath extension type`。
   - ⚠️ `-n` / `-s` 只对 `rife-v4*` 模型有效（`rife-v2/v3` 直接报错退出）。
   - **一趟与两趟精度实测等价**：把源片「每 4 帧留 1 帧」做成 15fps 再重建回 60fps、与丢掉的真实帧逐帧比，两趟 2× 平均 **40.50 dB**、一趟 `-n 4C` **40.39 dB**，最差帧同为 36.83 dB。选一趟只是因为更简单更快。
4. H.264 编码：`-preset veryslow -crf 22 -x264-params keyint=120:min-keyint=60:bframes=3:ref=4:aq-mode=3` + `-an` + `+faststart`。

**工具链实测**：RTX 5080 + `rife-ncnn-vulkan 20221029` + `rife-v4.6`，71 ms/帧、两趟共约 2 分钟。ncnn 的 cooperative-matrix 查询在这台 Blackwell 机器上**没有崩**（`vulkaninfo` 显示驱动确实广告了 `VK_NV_cooperative_matrix`，而 2022 版二进制只带 NV v1 那道门，不是论坛点名的 KHR / NV2 路径）。**每第 4 帧与源帧逐位相同（PSNR `inf`）**——插帧没有重绘任何原始帧，1/4 速是精确的。

### C.3 结果：接缝比原片还好

| | 相邻步中位 MSE | 循环接缝 MSE | 接缝 ÷ 正常步 |
| --- | --- | --- | --- |
| 原片（298 帧循环，原速） | 3.58 | **24.93**（34.16 dB） | 6.96× |
| 2× / 10s（当前） | 1.08 | **2.75**（43.74 dB） | 2.55× |
| 4× / 20s（第一版） | 0.29 | **0.53**（50.86 dB） | 1.84× |

慢放倍数越小，每一步的位移越大，同一个绝对接缝误差摊进一步就越显眼——所以 2× 的「接缝 ÷ 正常步」比 4× 差（2.55× vs 1.84×），但两者都远好于原片的 6.96×。

接缝绝对误差降了 **47×**。另外三种接缝做法里**有两种被数据否掉**，记下来免得重走：

- **A：不补周期，直接把 `frame0` 接在 297 后面插帧。** 插帧器把 3 个相位的位移摊到 4 个子步上，末尾三步的 MSE 变成 `14.96 / 6.94 / 11.25`（正常步 0.28）——接缝处一段 3× 的「加速小跳」。**弃用。**
- **C/D：整个接缝区间只用「一对帧、单一光流」采 11 个 `t`，并额外试了空间 TTA（`-x`）。** 直觉上更一致，实测**更差**（步序列 `2.30 3.56 4.59 3.82 13.91 3.45 6.74 5.51 4.82 2.07`，TTA 几乎无改善）——RIFE 对**跨 3 帧的大位移**估算不够准，把它线性缩放 11 份，不如让两趟 2× 在**相邻帧之间**（位移小、光流准）去做。**弃用。**
- **B（采用）**：先补周期再两趟插帧。接缝窗口的步是 `0.35 9.11 1.85 3.13 0.85 3.73 0.73 1.23`，最大值落在素材本身的自然范围内（原片单步最大 16.34）。

### C.4 编码体积的取舍

原片 4.97s / 3.14 MB / **632 KB/s**。10 秒的成品要对齐「同等每秒码率」大约就是 6.3 MB。实测几个点（预设 veryslow，均无音轨）：

| 规格 | 体积 | KB/s | 平均 PSNR |
| --- | --- | --- | --- |
| **x264 CRF 22 · aq-mode 3（当前采用）** | **5.48 MB** | **561** | **47.42 dB** |
| x264 CRF 21 · aq-mode 3 | 6.17 MB | 632 | 48.09 dB |
| x264 CRF 23 · aq-mode 3 | 4.85 MB | 497 | 46.73 dB |
| AV1（SVT）CRF 34 | 20s 版实测 4.78 MB | 245 | 48.58 dB |

**采用 H.264 而不是 AV1 是有意的**：首页同时在跑星空与引力透镜两个 canvas，不支持 AV1 硬解的老机器会落到 dav1d **软解**，1080p60 软解会抢主线程、直接威胁那两个 60fps 动画——省下来的两三 MB 不值这个风险。`aq-mode=3`（偏暗场）保留，因为画面是暗底暖光，暗部条带是唯一的真实风险；已按 3 倍增益目视比对过 CRF 18 / 22 / AV1 四档，**都没有可见条带或块效应**。

⚠️ **编码器的帧内误差会沿 GOP 尾部累积**（GOP 内第 0 帧 MSE 0.44 → 第 119 帧 0.97，末帧 2.42），所以「解码之后再量接缝」会比在无损序列上量差：实测**解码后**的接缝是 **39.22 dB（7.79 MSE）**，仍优于原片的 34.16 dB。⚠️ 缩短 GOP（`keyint=60`）**改善不了**这一点（末帧 MSE 2.41 vs 2.42）——尾部那几帧本身是 RIFE 合成的、时域一致性略差、更难压，加密 keyframe 只是白多花 1 MB。

**复现入口**：脚本不在仓库里，存在 **`%TEMP%\rife-ncnn\blackhole-pipeline\`**（与 `rife-ncnn-vulkan` 二进制同处，临时目录被清就一起没）：`01-build-2x.ps1`（当前采用的构建）、`02-encode-and-seam.ps1`（编码矩阵 + 接缝剖面）、`03/04-ground-truth-*.ps1`（C.2 那个地面真值测试）、`05-inbetween-position.ps1`（测源片中间帧的真实时间位置）、`06-motion-evenness.mjs` / `07-compare-two-variants.mjs`（C.5 的均匀度分析）、`08-REJECTED-dejudder.ps1`（被否掉的奇数帧重建）、`09-polar-rotation-probe.mjs`（极坐标自相关探针，结论是角度分辨率不够、没采用），另有 **`orig-1x.mp4`**（原速成片）与合成好的周期帧 `cycle-frame-298.png` / `cycle-frame-299.png`——**只改慢放倍数或编码参数时不需要重跑补帧**，从这两个文件接上 C.2 的第 2 步即可。RIFE 二进制 = `%TEMP%\rife-ncnn\rife-ncnn-vulkan-20221029-windows\`（431 MB 官方 release，模型用 `rife-v4.6`）。

### C.5 ⚠️ 慢放会放大素材本身的时域不均匀（「看起来一顿一顿」的真正来源）

用户在 4× / 20s 版本上反馈「视频看起来很卡，一顿一顿的」。逐项量过，**不是编码、不是插帧、也不是播放**：

- **播放侧干净**：headless Chrome（开 GPU）+ 真实首页跑 10 秒——页面 rAF **59.3–59.5 fps**（中位间隔 16.7ms，>25ms 的帧只有 2–3 个），视频呈现 **599–612 帧 / 10s**，丢帧 **0.7–3.6%**。三个版本（原片 / 10s / 20s）数字几乎一致，所以既不是「文件变长变重」，也不是页面被两个 canvas 拖垮。
- **插帧侧干净**：见 C.2 第 3 步的地面真值测试（40.5 dB）。
- **接缝侧干净**：见 C.3。
- **源素材本身不均匀**：原片相邻帧位移（MAD）中位 0.2417，但 **p05 = 0.41×、p95 = 1.70×、最大 2.18×**，而且有**明显的周期 2 结构（偶/奇帧位移差 35%）**。原文件名就叫「黑洞动画 - AI 插帧.mp4」，这几乎就是上一轮 AI 插帧留下的痕迹。
- **慢放把这个不均匀搬进了眼睛最敏感的频段**：源片里 60 Hz 的 ±35% 抖动，4× 慢放后变成 **15 Hz**——60 Hz 会被视觉整合成平滑运动，10–20 Hz 恰恰是运动调制最显眼的区间。这就是「一顿一顿」。

**试过并被数据否掉的补救**（别再走）：

1. **把源片奇数帧换成真正的中间帧**（只用偶数帧重建：偶数帧 150 张 + 回环锚点 → 一趟 `-n 302`，输出 j 正好落在源位置 j，奇位即精确中点）。假设是「奇数帧位置偏了」。实测**更差**：周期 2 桶间差 `36.14% → 42.27%`、周期 4 `64.84% → 81.48%`，9 步滑动均值（≈150ms 内的可感速度）的 p95/p05 从 `1.56×` 变 `1.58×`（无改善）。说明不均匀**不是**奇偶帧位置错位，而是素材的运动本身时快时慢。**弃用。**
2. **改 GOP 长度 / 提高码率**：与运动均匀度无关，只是白花体积（缩短 GOP 还实测过：末帧 MSE 2.41 vs 2.42，无改善）。

**结论与取舍**：这是素材的固有属性，**唯一的杠杆是慢放倍数**——倍数越小，抖动频率越高、越不明显。所以最终从 4× 收到 **2×**：既满足「20 秒太长」，也把抖动从 15 Hz 推到 30 Hz。⚠️ 若日后要回到 4×，请预期这个抖动会回来；彻底解决只能重新渲染原始动画（源片已不在工作区）。

## D. 黑洞视频 v2：用户提供的新渲染 + 暖色漂移修正（2026-09-30）

`public/media/blackhole.mp4` = **1950×1062 / 60fps CFR / 301 帧 / 5.0167s / 2.47 MB / 无音轨**。
来源：用户放进 `输入/` 的 `画面黑洞位置不动，构图不动，颜色不变，只增加吸积盘+光效动态。吸积盘按照真实黑洞....mp4`（1950×1062 / 变帧率 / 121 帧 / 5.0167s / 18.7 Mbps / 带 AAC）。要求：**构图与黑洞位置都不动，只把中后段偏中性/偏冷的颜色改回开头那种暖色**。

### D.1 素材是变帧率的

`ffprobe` 报 121 帧却 5.0167s（`avg_frame_rate = 7260/301` = 24.12）。逐包看 PTS：**帧间隔在 1/30 s 和 1/20 s 之间跳**（40+20 个 1/30、60 个 1/20，合计正好 5.000s）。

⚠️ **不能用 `-f concat` 重建时间轴**：那个 demuxer 会把时长量化到 1/25 s——实测输出 PTS 变成 0.04/0.08/0.12…、`r_frame_rate` 被读成 25/1、最大偏差 0.02s。
✅ 正解：**1/30 与 1/20 都能被 1/60 整除**，所以转成 **60fps CFR、每帧按原时长保持 2 或 3 个 tick**，播放画面与源逐帧一致，兼容性却好得多。实测保持分布 = `2 ticks × 60 帧 / 3 ticks × 60 帧`，共 **301 帧**。

### D.2 变色是「整条色带被转过去了」

逐帧统计亮部像素：**暖度 (Cr−Cb) 从 +0.226 掉到 −0.072 再回 +0.226，彩度从 0.160 塌到 0.011 再回 0.154**（121 帧里 31 帧偏冷、13 帧中性）。再按亮度分桶后发现：**画面其实是一条「亮度 → 颜色」的色带**——同一亮度下黑洞上方与下方颜色几乎相同（上方 bin 7 `rgb(226,148,54)` vs 下方 `rgb(232,150,51)`）。**漂移的只有这条色带的方向与饱和度**，所以能精确修回来。

### D.3 修法：加法式色带校正（不是整条替换）

`输出 = 原像素 + [ C_ref(亮度) − C_own(亮度) ]`，`C_ref` 取开头 1–24 帧，`C_own` 是当前帧自己的色带。等价于「**只把色带本身搬回暖色，像素相对自己色带的偏差原样保留**」。

⚠️ 先试过更暴力的**整条替换**（`输出 = C_ref(亮度)`）并**目视否掉**：它把画面压成一片均匀橙色、丢掉高光白核的层次，也把开头第 1 帧那条**银白色下缘弧**一起染暖——而那正是用户说「很完美」的部分。

### D.4 ⚠️ 用户第二轮反馈：黑洞下方应该是白的，不是暖的

加法式校正把色带搬了回来，但**黑洞下方那条弧也跟着变暖了**。测下来这是**结构性**的：

用「像素饱和度 − 该帧色带在同一亮度下的饱和度」判别并画成图，**去饱和区正好是黑洞外那圈细亮环 + 下方那条透镜弧**。在用户满意的开头帧这块有 **2765 px**，到偏冷的第 81 帧只剩 **72 px**——**它的「白」在中后段是真的消失了**，所以任何只看色度统计的校正都救不回来（它落在自己的蓝调色带上，属「正常」）。同一亮度下的对比更直接：第 1 帧 **盘面 sat 0.84 / 弧 sat 0.44**，第 46 帧 **盘面 0.46 / 弧 0.03（几乎纯灰）**。

**修法（定稿）**——构图静止，所以做一张**静态空间遮罩**：

1. 用开头 24 帧算「每像素比本帧色带灰多少」，跨帧平均 + 半径 4px 模糊 → 静态遮罩 `M(p)`，覆盖 **2.16%** 像素（44820 px），正好是那圈亮环 + 下方弧。
2. 用遮罩内像素单独建一条参考色带 `C_arc(亮度)`：`luma 162 → rgb(184,158,135) sat 0.26`、`luma 227 → rgb(243,224,204) sat 0.16`——**银白**，与盘面色带（sat 0.52–0.80）明确分开。
3. 渲染：**盘面侧**（`M≈0`）保留 D.3 的加法式校正（保细节），**弧侧**（`M≈1`）直接替换成 `C_arc(亮度)`（冷色帧里已经没有可用偏差了），两者按 `M` 平滑混合。

**实测**（遮罩内像素）：弧的彩度离散度 **sd 0.130 → 0.057**、暖度离散度 **sd 7.9 → 1.5**；第 81 帧的弧从 `rgb(99,49,31) sat 0.685` 变成 `rgb(80,54,40) sat 0.500`（源片该帧 `rgb(41,63,85) sat 0.517`，开头第 1 帧 `sat 0.436`）——**冷色帧的弧现在和开头一样是银白，不再是橙色**。

### D.5 编码

| 规格 | 体积 | 平均 PSNR |
| --- | --- | --- |
| x264 CRF 17 | 3.42 MB | 50.24 dB |
| **x264 CRF 19（采用）** | **2.47 MB** | **49.21 dB** |
| x264 CRF 21 | 1.79 MB | 48.21 dB |

⚠️ 比它取代的 10s 版（5.48 MB / 561 KB/s）**体积只有 45%、质量还略高**——新渲染本身更干净（源片 18.7 Mbps），压缩友好得多。音频整条丢掉。

### D.6 几何：换片子之后，镜头标定还对得上吗

**换任何黑洞素材前先看这一节。** `GravitationalLens.astro` 的七个几何旋钮是按**屏幕坐标**标定的（`cx = 0.7658W`、`cy = 122px + cyVh·H`、`rRing = rRingVh·H`），视频里洞的位置则由 `--blackhole-*` 决定。**只要新片子的洞落在同一屏幕位置、同一个屏幕半径，镜头标定一个字都不用改。**

量法：单帧阈值 + 从边界洪泛填充，剩下被包围的暗区即黑洞阴影，取质心与等面积半径。⚠️ **不要用「时间最大帧」量质心**——吸积盘会横穿阴影下缘、把暗区切掉一块，质心会偏（实测偏 0.02 帧高）。

| | 洞心（帧内占比） | 等面积半径（× 帧宽） |
| --- | --- | --- |
| 旧 1920×1080 | (0.5144, 0.5375) | 0.07854 |
| 新 1950×1062 | (0.5108, 0.5325) | 0.07794 |

**用旧片复现标定常量** (0.5126, 0.5397)：实测 (0.5144, 0.5375)，差 (0.0018, −0.0022) → **量法可信**。
**新旧之差**：洞心约 (−4, +2) px（1639×704 视口）、半径小 2%。因为无星圈本来就比阴影大一圈（`rRing` 176px vs 阴影 ~170px），这点偏差落在圈内；**实测截图确认星场仍贴着黑洞边缘**，因此**没有改任何 CSS 或镜头参数**。

⚠️ 但记住：**新片子比例是 1.8362，不是 16:9**。`SCALED` 两点拟合与 `--blackhole-y` 的推导都隐含 16:9（`Vh/Vw = 0.5625`，新片是 0.5446）——上面那 2px 就来自这里。**日后要精调：水平改 `--blackhole-x` 即可（纯 CSS、零风险）；垂直必须同步改镜头 `SCALED` 的 `--lens-cy-vh` 两个值，绝不能只改一边**（`--blackhole-y` 的 px 项一改，镜头那边的 `cyPx = 122` 就对不上了）。

**复现入口**：`%TEMP%\blackhole-recolour\`。换素材时**先跑几何这一组**：`dump-both.ps1`（抽帧）→ `geometry.mjs` / `geometry2.mjs`（洞心与等面积半径，后者用单帧、前者用时间最大，**以单帧为准**）→ `radial.mjs`（径向亮度剖面，看光环峰值半径）→ `shotcmp.mjs`（在真实页面上比对新旧洞心；它读 `.tmp-bh/*_videoonly.png`，那两张图要用 `%TEMP%\bh-shot.ps1` + `bh-shot.mjs` 现拍——脚本把页面上的 `#lens-canvas`/`#starfield-canvas`/扫描线/暗角都 `display:none` 掉，只留视频层，这样洪泛填充量到的才是黑洞本身）。修色这一组：`fix-colour.mjs`（加法式校正）/ `fix-colour2.mjs`（加遮罩定稿）/ `build-cfr.mjs` + `build-cfr2.ps1`（CFR 重建）/ `arcmap.mjs` + `arc-structure.mjs`（找出去饱和区在哪）/ `verify-final.mjs`、`verify-arc2.mjs`（验证）。图：`before-after-arc.png`（源 / 旧修法 / 定稿 三行对照）、`site-alignment-old-vs-new.png`（新旧片子在真实首页上的黑洞对比）。

### D.7 第三轮：亮度也要「差不多一样」

用户第三轮反馈：「黑洞会在中段变暗，尾段突然发光，能不能让整个视频里黑洞都差不多亮度」。

**量**：逐帧算「能量」（整帧亮度均值，相当于眼睛积分的总光量）。曲线是一个**平滑的 U，不是台阶**：

| | 相对能量 |
| --- | --- |
| 开头 1–25 帧 | 1.10–1.13 |
| 第 85–90 帧（最暗） | **0.83** |
| 结尾 117–121 帧 | 1.11–1.15 |

`cv 0.115`、最暗 0.827×、最亮 1.159×——**总摆幅约 40%**。而**帧间最大跳变只有 ×1.03**，所以「尾段突然发光」不是一步跳变，而是**从最暗处一路涨回来、20 帧内 +33%（约 0.8 秒）**，在长暗段之后读起来就像「突然亮了」。

**修法：逐帧 gamma 归一化，不是线性增益。** ⚠️ 线性增益会**削顶**——暗帧的 p99 亮度是 219，直接乘 `1/0.83 = 1.21` 变成 265 → 裁到 255，高光核就糊了。gamma 的好处是 **0→0、255→255 精确不变**：黑底仍是纯黑、高光永不溢出，只抬中间调。每帧解一个 γ 使其能量等于目标（取全部帧能量的**中位数**，即净变化为零），二分求解；⚠️ 二分方向别写反（能量对 γ 单调递减）。实测 γ 落在 **0.795–1.227**，很温和。

**结果**：能量 `min 0.987× / max 1.030× / cv 0.0117` —— **摆幅从 ±16% 收进 ±3%，cv 降约 10 倍**。

⚠️ 并复验它没有破坏 D.4 的修色：遮罩内弧的彩度 `0.436 (sd 0.056) → 0.426 (sd 0.020)`、暖度 `23.4 (sd 1.47) → 23.4 (sd 1.86)`——**银白弧完好，而且更均匀了**。⚠️ 逐通道 gamma 会**轻微压缩饱和度**（实测弧彩度只差 0.01，安全），但若将来要做**大**的亮度校正（>30%），得改用保饱和度的做法。

**代价**：CRF 19 下 **2.47 MB → 2.79 MB**（归一化后画面更亮、细节更多，更难压），仍远小于被取代的 5.48 MB。实测页面 **593 帧 / 10s、丢帧 1.3%、页面 59.4 fps**。

⚠️ **三轮修改的顺序是有依赖的，重跑时必须按这个顺序**：`fix-colour2.mjs`（色带 + 遮罩修色）→ `bright-fix.mjs`（gamma 归一化）→ CFR 重建 → 编码。把亮度放到前面会让 γ 的目标值受色偏影响（虽然最终也会收敛，但两轮的统计基准就不一致了）。

