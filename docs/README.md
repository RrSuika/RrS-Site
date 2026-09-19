# docs/ — 按需阅读的技术细则

`CLAUDE.md`（每轮自动注入，必须短）与 `AI_CONTEXT.md`（接手任务时读，是索引不是散文）只保留**规则、索引和架构事实**；某个模块的完整规格、踩过的坑、历史原因都在这里——**只在动到相关部分时才打开**。

| 文件 | 什么时候读 |
| --- | --- |
| `cassette-shelf.md` | 改 `src/components/CassetteShelf.astro`、`src/scripts/shelf-tuner.ts`、或 `/projects` `/lab` 六页的任何视觉/交互/拖动之前——**必读** |
| `site-intro.md` | 改站点开场（`Layout.astro` 的 SITE INTRO GUARD、`src/scripts/site-intro.ts`、global.css §16）之前 |
| `theme-switch.md` | 改主题切换（`src/scripts/theme-transition.ts`、§15）或星空入场（`arriveBackground`）之前 |
| `backgrounds.md` | 改星空 / 引力透镜 / 黑洞视频层（§10、`GravitationalLens.astro`、Layout 星空脚本）之前 |
| `decisions.md` | 想知道「为什么现在是这样」、或准备推翻某个既有设计之前——按编号查，不用通读 |
| `tech-debt.md` | 规划清理/重构，或撞见已知残留问题时 |
| `pitfalls.md` | 写测量脚本之前；遇到「dev 正常生产失效」「样式静默失效」「改了没反应」这类怪现象时 |
| `writing-style.md` | 改写 en/zh/nl 任何文案之前——文风约定是**硬规则**，不是建议 |
| `changelog.md` | 追溯某次改动（v1.x）的完整来龙去脉时；平时完全不用读 |

**编号对照**（拆分时为了不破坏正文里的相互引用，编号一律保留原样）：

| 引用 | 实际位置 |
| --- | --- |
| `§N`（N = 1–8、11、12） | `AI_CONTEXT.md` 的同号章节 |
| `§9 决策 N` | `decisions.md` 第 N 条 |
| `§10` 问题/技术债 | `tech-debt.md` |
| `global.css §N` | `src/styles/global.css` 里的分节注释（与上面无关） |
| `§12 规则 N` | N ≤ 13 在 `AI_CONTEXT.md` §12；N ≥ 14 在 `writing-style.md` |
| `v1.xx` | `changelog.md` |
