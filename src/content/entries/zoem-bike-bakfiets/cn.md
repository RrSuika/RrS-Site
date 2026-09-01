---
title: "ZOEM Bike\n模块化货运自行车货箱"
date: 2025-11-15
description: 为 ZOEM Bike 平台重新设计模块化货箱;针对客户的实际痛点优化设计，并负责从材料选型、工厂对接到组装和最终交付的完整流程。

type: projects
category: 工业设计 / 制造加工
cover: cover.png

tags:
  - 工业设计
  - 钣金加工
  - 模块化设计
  - BOM
  - 人体工学
  - 制造加工
  - 货运自行车

tools:
  - SolidWorks
  - 钣金（折弯 / 焊接）
  - 气弹簧
  - BOM 管理
  - 工厂对接

featured: true

collaboration: team

lang: zh

translationKey: zoem-bike-cargo-box
---

# 项目背景

ZOEM Bike 是一家荷兰货运自行车制造商。我们的任务来自他们的一位客户；一位油漆工，他为自己的 ZOEM 底盘定制了一个专属货箱。这个货箱每天载着梯子、油漆桶和工具穿梭在城市的车流里。实习期间，我和另一位工业设计实习生组成了两人的项目小组；我主要负责材料分析与选型、物理计算与测试、气弹簧测试、人机工学计算、3D 渲染、贴纸的 Photoshop 处理以及成品的最终组装。

整个项目走完了完整的开发流程：调研市场上的现有方案，对比各种部件的可行性，实地分析客户痛点，最终把结论落成一个优化后的设计；生产、安装，并在项目结束时交付给客户。

# 设计目标

起点是现款货箱。它能用，但积攒了多年的妥协。重新设计的任务书归结为五个针对性改动：

| 改动                 | 设计依据                                                                                                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 单侧盖板取代双侧盖板 | 一个盖子比两个盖子打开更方便，一把锁就够。新设计只从一侧开合，并且朝右：自行车停靠在街道旁时，油漆工在人行道一侧打开货箱，背对左侧的车流；装卸货更安全。                  |
| 重新设计防水系统     | 两个盖子合并为一个开合后，密封方式和整体框架都需要围绕新的开启方式重新设计。                                                                                                                              |
| 重新设计结构框架     | 开合盖板需要与铰链配合，关闭状态下持续承受气弹簧的压力。我们对盖板做了强化处理防止形变，同时保证开合过程与关闭状态的静态受力都不会损伤钣金外壳。                                                          |
| 重新设计铰链机构     | 铰链采用不锈钢材质，满足反复开合、防水防锈的要求，通过铆钉固定，安装后与固定的 U 形钢保持平直。                                                                                                           |
| 使用更轻的材料       | 该结实的地方结实，其他地方用更轻的材料：载荷由型钢框架承担，外壳用 [Alupanel](https://kunststofplatenshop.nl/alupanel-platen/) 铝复合板让整车轻便;类似汽车 A 柱与车身外壳的分工，省下的重量换成了载货量。 |

<div style="text-align:center; margin:40px auto;">
<img src="./01-old-bike-design.jpg" alt="现有货箱设计" style="max-width:420px; border-radius:12px; display:block; margin:0 auto;" />
<p style="text-align:center; font-family:var(--font-mono); font-size:var(--text-scale-2xs); letter-spacing:var(--tracking-micro); color:var(--text-tertiary); margin-top:10px;">客户之前的正常货箱</p>
</div>

### 成品展示

<div class="showcase">
<div class="show-item"><img src="./03-box-detail-top.jpg" alt="货箱细节；上部" /><p>货箱细节；上部</p></div>
<div class="show-item"><img src="./02-redesigned-box.jpg" alt="重新设计的货箱" /><p>重新设计的货箱</p></div>
<div class="show-item"><img src="./04-box-detail-bottom.jpg" alt="货箱细节；下部" /><p>货箱细节；下部</p></div>
</div>

# 调研与分析

在开始任何 CAD 工作之前，重新设计基于三方面的输入：对市场上现有方案的研究、部件选项的可行性与成本对比，以及和货箱的直接使用者;油漆工客户本人的访谈。

### 研究问题

动笔之前，我们把五个问题写了下来；每一个设计决策都要能回答其中之一：

1. 如何选择合适的气弹簧，开合省力且闭合压力适中？
2. 如何让货箱的外观更有吸引力？
3. 如何做到从任何角度都防水？
4. 如何让日常使用更友好？
5. 如何让货箱具备足够的功能？

### 设计细节

客户直接回答了我们的问题；下面这些回答左右了多个设计选择：

- <strong style="color:var(--accent)">盖板重量</strong>：SolidWorks 实测约 10–12 kg；气弹簧的选型从这里开始。
- <strong style="color:var(--accent)">开盖幅度</strong>：客户希望盖板开得越大越好。
- <strong style="color:var(--accent)">材料渠道</strong>：盖板用 6XXX 系铝板钣金；兼顾强度与可焊性，阳极氧化效果好；框架用钢材。
- <strong style="color:var(--accent)">框架结构</strong>：方钢管材，焊接成型。
- <strong style="color:var(--accent)">漏水史</strong>：上一版设计在铰链附近进水；旧的解决方案被过度设计了。
- <strong style="color:var(--accent)">盖板坡度</strong>：可以有，但不强求；没有坡度时雨水自然流走。
- <strong style="color:var(--accent)">防锈</strong>：铝件需要防护（阳极氧化或镀锌），粉末喷涂也是选项之一。
- <strong style="color:var(--accent)">铆钉</strong>：现有的抽芯铆钉防水可能不够；闭口型拉铆钉（closed-end）看起来更合适。
- <strong style="color:var(--accent)">额外要求</strong>：把电池到前灯的走线藏起来。

### 客户档案

- 油漆工身高 1.95 m；够取高度直接决定人体工学。
- 同类的盖板普遍用较薄的铝板。
- 盖板值得考虑配气弹簧;上方还要挂一个 15 公斤的梯子。
- 货箱高度约 75 cm。
- 车把高度必须与 ZOEM 标准车把一致。
- 货运自行车的货舱本身就有不小的分量。

<div style="clear:both"></div>

# 材料分析

### 初版草图

<img src="./14-material-notes.jpg" alt="概念草图" style="max-width:620px; border-radius:12px; display:block; margin:36px auto;" />

### 材料研究和选择

<div class="info-tabs">
<div class="tab-nav">
<div class="tab-item">金属腐蚀</div>
<div class="tab-item">铰链类型</div>
<div class="tab-item">铆钉选型</div>
<div class="tab-item">气弹簧</div>
<div class="tab-item">固定方式</div>
<div class="tab-item">防水密封</div>
<div class="tab-item">采购清单</div>
</div>
<div class="tab-panel active"><h4>金属腐蚀</h4><p>当铝材与不锈钢紧固件接触时会发生腐蚀；这就是电偶腐蚀。它发生在两种材料（阳极与阴极）通过电解质（雨水就足够了）相互接触时。</p><p><strong>最终选择：</strong>钢框架与铝件整体粉末喷涂。流程：工厂加工钣金并在工厂焊接（我们的工坊没有焊接铝材的能力）→ 运回组装测试 → 打孔，此后不能再更改 → 发往另一家工厂粉末喷涂 → 运回最终组装。目标是在产品的预估使用寿命内，把腐蚀程度控制在可接受的范围。</p><p class="src">Source: 1. Why Can't You Use Stainless Steel and Aluminum Together?</p></div>
<div class="tab-panel"><h4>铰链类型</h4><p><strong>枢轴铰链</strong>；寿命 10–15 年；隐藏式设计；承载力；美观。</p><p><strong>钢琴铰链</strong>；寿命 60 年；载荷均匀分布；承载力；坚固。</p><p><strong>合页 / 重型铰链</strong>；寿命 5–7 年；便宜；承载力。</p><p><strong>最终选择：</strong>不锈钢钢琴铰链；寿命长、载荷沿全长均匀分布，同时满足任务书中不锈钢、防水防锈的要求。由 <a href="https://lino-metaal.nl/">Lino Metaalwaren</a> 赞助。</p><p class="src">Source: 1. Camax Hardware 2. China industrial hinges factory</p></div>
<div class="tab-panel"><h4>铆钉选型</h4><p>POP 闭口型拉铆钉的抗拉强度比开口型高 23%，且在压力下液体与气体零渗透。闭口铆钉提供多种铆体/芯杆材料组合。</p><p>防水性对照 IPX 等级评估：IPX2（滴水）、IPX4（溅水）、IPX6（强力水柱；15 psi 持续 3 分钟，100 升/分钟）、IPX6K（更高压力）、IPX7（浸水）。</p><p><strong>最终选择：</strong>闭口型拉铆钉；强度更高且对液体和气体完全密封，对照 IPX 等级验证过。</p><p class="src">Source: 1. The Difference Between Open and Closed End Blind Rivets 2. IPX Waterproof Rating Chart (Storyteller Tech)</p></div>
<div class="tab-panel"><h4>气弹簧</h4><p>供应商对比：Amatec（标准固定眼式气弹簧）、Tevema、Gasveerwinkel（全系列在线销售，含选型配置器）、Spring Masters（现货供应）。同时考虑了球头铰链（kogelscharnier）作为替代安装方案。</p><p><strong>最终选择：</strong>250N 气弹簧 ×2，托住 10–12 kg 盖板的全程行程；在最终装配时重新选定并实测验证。</p><p class="src">Source: 1. Gasveerwinkel 2. Gasveerexpert 3. Amatec 4. Tevema 5. Spring Masters</p></div>
<div class="tab-panel"><h4>固定方式</h4><p><strong>拉帽螺母</strong>；抗振、防水、耐腐蚀；承载力有限，易磨损松脱，不适合重载。</p><p><strong>闭口型拉铆钉</strong>；抗振、防水、耐腐蚀、承载力好；不可维护，金属与湿气间存在腐蚀风险，强度不如焊接。</p><p><strong>密封螺钉</strong>；抗振、防水、耐腐蚀、承载力好、可维护；价格贵，O 型圈有使用寿命。</p><p><strong>最终选择：</strong>方钢管框架焊接成型；铰链按任务书要求用铆钉固定；Alupanel 铝复合板外壳同样用铆钉组装到钢框架上；铆钉经测试确认防水。</p><p class="src">Source: 1. Well Nuts vs Nutserts 2. What Are Sealing Screws? (ACCU)</p></div>
<div class="tab-panel"><h4>防水密封</h4><p>防水由三层构成：防水铆钉、接缝处的玻璃胶密封，以及框架本身的结构设计；盖板边缘做成类似屋顶流水槽的造型，雨水顺着边缘流走，灌不进货仓。</p></div>
<div class="tab-panel"><h4>采购清单</h4><p>采购部件：钢琴铰链、闭口型拉铆钉、气弹簧、长杆防水锁。</p></div>
</div>

<!-- RESERVED: BOM 表（待添加） -->

# 技术验证

开发早期，我们先验证了设计里风险最高的部分，再投入生产：

- <strong style="color:var(--accent)">气弹簧选型</strong>：盖板大约重 10–12 kg。我们测试了能舒服地托起盖板的弹簧，同时尽量减小关闭状态下的机械疲劳;弹簧的大部分寿命都是在带载状态下度过的。
- <strong style="color:var(--accent)">实地走访 [Lino Metaalwaren](https://lino-metaal.nl/)</strong>：专门去了当地这家五金件供应商，在敲定自己的方案之前，亲手把各种铰链选项摸了一遍。

## 设计迭代；四个版本

货箱在定稿之前经历了四个大版本。每一轮迭代都解决了上一版暴露的问题；从左到右，逐版递进：

<div class="versions-grid">
<div class="version-cell"><img src="./iteration-01.jpg" alt="版本 1；框架与钣金" /><h4>版本 1<br />框架与钣金</h4><p>型钢框架型材调整，选择更细的尺寸。</p><p>将正确的型钢截面加入 weldments 焊接结构件库。</p><p>钣金焊点尺寸缩减。</p><p>侧面雨水导槽不再需要，予以移除。</p><p>盖板侧边与箱体之间的间隙加大。</p><p>气弹簧完成第一轮测试。</p></div>
<div class="version-cell"><img src="./iteration-02.jpg" alt="版本 2；首次实物测试" /><h4>版本 2<br />首次实物测试</h4><p>原型完成组装并进行首次实物测试。</p><p>盖板侧边与箱体之间的间隙进一步加大。</p><p>前侧改为与后侧一致（见版本图）。</p><p>壳体内部增加加强筋。</p></div>
<div class="version-cell"><img src="./iteration-03.jpg" alt="版本 3；铰链与尺寸" /><h4>版本 3<br />铰链与尺寸</h4><p>换用另一种尺寸的钢琴铰链。</p><p>铰链移到不同的安装位置。</p><p>调整密封位置，改善防水。</p><p>整体减重。</p></div>
<div class="version-cell"><img src="./iteration-04.jpg" alt="版本 4；U 形槽与安装" /><h4>版本 4<br />U 形槽与安装</h4><p>为铰链引入 U 形槽型材。</p><p>气弹簧完成第二轮测试。</p><p>新的安装位置；盖板随之加宽。</p><p>关闭时盖板与箱体的公差距离加大。</p><p>防水性能进一步优化。</p></div>
</div>

## 气弹簧评估

用实测数据确定弹簧规格，并用计算表验证；最终装配选用 250N 气弹簧 ×2 托住盖板的全程行程：

![气弹簧测试与计算](./17-ergonomics-eval.jpg)

<!-- RESERVED: 工程图（待添加） -->

# 人机工学

弹簧和铰链只有在"人也用得舒服"的前提下才有意义。开盖高度、够取距离和装货通道都对照这位油漆工的实际工作姿势做了尺寸标定：

<img src="./16-gas-spring-test.jpg" alt="人机工学评估" style="max-width:500px; border-radius:12px; display:block; margin:40px auto;" />

# 从草图到交付

![拆下旧货箱](./step-06-dismantle-old-box.jpg)

我和搭档一起焊接了框架，切割了外壳，拆下旧货箱并组装了新货箱，途中在多个阶段进行了气弹簧测试。最终装配时重新选定了气弹簧：250N ×2，托住盖板的全程行程，并且留足了安全余量。

从建模到实物；最终渲染图与上路的真车：

<div class="side-by-side">
  <div><img src="./18-final-assembly-render.png" alt="最终组装；3D 渲染图" /><p>最终组装；3D 渲染图</p></div>
  <div><img src="./step-09-test-run.jpg" alt="上路的实物" /><p>实物；试骑</p></div>
</div>

# 这个项目教会我的

这是第一个以"客户骑上成品"为终点的项目。

- <strong style="color:var(--accent)">钣金是一种完全不同的设计语言</strong>：折弯半径、焊缝、喷塑公差，这些几何约束远早于审美进入对话。在 SolidWorks 里画图和用钢铁把它造出来，是两套完全不同的交流方式。
- <strong style="color:var(--accent)">设计是平衡的语言</strong>：每一个零件决策;铰链、气弹簧、板材厚度;都要在成本、使用寿命、可加工性、交期和客户的日常使用体验之间权衡。纸面上最好的零件，未必是产品里最好的零件。
- <strong style="color:var(--accent)">两人小组的现实处境</strong>：只有两个人，意味着每一张草图、每一个决策都必须立刻能被对方读懂。文档成了我们保持同步的唯一方式。
- <strong style="color:var(--accent)">收尾意味着验证成品本身</strong>：盖板变成实物之后，最终气弹簧重新选型为 250N ×2。规格只有在最后重新验证过，才算真正经得起现实的检验。
- <strong style="color:var(--accent)">气弹簧的选型是真正的技术难点</strong>：不带梯子时盖板约十几公斤，带梯子时约三十公斤。日常两种状态都会出现，重量差异巨大，因此选择气弹簧的力是一个复杂的决定。
- <strong style="color:var(--accent)">理想值只是起点</strong>：在纸上算出气弹簧的理想牛顿值和预计尺寸参数是有用的；但真正把它装上、亲手掀开盖板感受它的表现，比表格里的任何理想数字都更有价值。

_特别感谢 [Lino Metaalwaren](https://lino-metaal.nl/) 赞助本项目的不锈钢钢琴铰链。_
