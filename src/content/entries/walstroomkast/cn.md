---
title: "模块化岸电柜"
date: 2026-06-15
dateLabel: "Jun 15"
description: "为荷兰内河船舶做的岸电方案;用电池缓冲把 3×80A 的有限并网顶到 3×250A 的峰值需求，柜体按模组化设计，可按需拼装扩展。"
type: projects
category: 工业设计 / 电气系统
cover: cover.webp
tags:
  - 工业设计
  - 电气工程
  - 模组化设计
  - 材料研究
  - 缩比模型
  - 人机工学
tools:
  - SolidWorks
  - Arduino / RFID
  - 技术图纸
  - BOM 清单
  - 材料对比研究
collaboration: team
featured: true
lang: zh
translationKey: walstroomkast
---

# 项目背景

内河船舶停靠码头时不再允许用柴油发电机，必须接岸电。船上的用电需求很大而且波动剧烈，峰值可以到 3×250A；但码头这边的并网容量只有 3×80A，两者差了三倍多。

这是来自 Hogeschool Rotterdam 学校的项目，合作方是 Endenburg 公司。团队一共 5 个人：我和搭档负责工业设计，另外三位电气工程组员负责电气技术验证和交付物。我和搭档之前在 ZOEM Bike 实习时就一起做过一台完整的货运自行车货箱，分工方式直接沿用下来。我负责调研、材料分析、把研究结论写成设计决策，以及文档、视觉呈现和最终答辩；搭档主要负责 3D 建模、渲染和绘制工程图。

# 设计目标

主要问题：在 3×80A 的并网容量下，做一台能应付 3×250A 峰值、并且能跟着用电需求一起长的模组化柜体。

项目还定了五个关键成功因素，后面每一步设计决策都要能对上它们：

| 关键成功因素 | 具体要求 |
| --- | --- |
| 安全与合规 | 满足相关的电气与海事规范 |
| 电气容量 | 在有限的输入下可靠输出 |
| 耐候性 | 抗腐蚀、满足 IP 等级，紧固件适合港口环境 |
| 易用与易维护 | 元件容易接近、模块可更换、故障诊断清晰 |
| 模组化 | 能应对后续的改动和扩展 |

# 调研与构思

<div class="info-tabs">
<div class="tab-nav">
<div class="tab-item">文档与规范</div>
<div class="tab-item">已有的岸电柜方案</div>
<div class="tab-item">柜体构造调研</div>
<div class="tab-item">可行方案调研</div>
<div class="tab-item">可扩展性调研</div>
</div>
<div class="tab-panel tab-image">
<h4>文档与规范</h4>
<img src="./research-documentation.webp" alt="规范与文档调研" style="max-width:100%; border-radius:8px; display:block; margin:0 0 14px;" />
<p>根据相关技术文件提取出条件约束和判断。防护等级、涂层体系、接地电阻、安装高度、器件配置这些硬约束都是从这一步来的。</p>
</div>
<div class="tab-panel tab-image">
<h4>已有的岸电柜方案</h4>
<img src="./research-existing-web.webp" alt="已有的岸电柜方案盘点" style="max-width:100%; border-radius:8px; display:block; margin:0 0 14px;" />
<p>先把市面上已经在用的岸电柜产品摊开看了一遍，看它们怎么布置接口、怎么处理防护和操作界面。这一步决定了后面哪些做法是行业里已经验证过的，哪些要自己试。</p>
</div>
<div class="tab-panel tab-image">
<h4>柜体构造调研</h4>
<div class="side-by-side">
<div><p>柜体从里到外分成四层：</p>
<ul>
<li><strong>外壳</strong>：框架、型材、加强筋、密封、门、三点锁、铰链、电源插座</li>
<li><strong>防护</strong>：腐蚀、机械碰撞、IP 等级、接地、通风</li>
<li><strong>电子部分</strong>：变压器、变换器、控制器、传感器、BMS、电池、RFID、LED</li>
<li><strong>扩展位</strong>：为模组化预留</li>
</ul>
</div>
<div><img src="./research-cabinet-build-up.webp" alt="柜体构造调研：从里到外四层" style="width:100%; border-radius:8px; display:block; margin:0;" /></div>
</div>
</div>
<div class="tab-panel tab-image">
<h4>可行方案调研</h4>
<img src="./research-possible-solutions.webp" alt="可行方案调研" style="max-width:100%; border-radius:8px; display:block; margin:0 0 14px;" />
<p>把可能的技术和结构路线列出来逐条过：哪些能在这个尺寸和环境下实现，哪些成本或工期上不成立。</p>
</div>
<div class="tab-panel tab-image">
<h4>可扩展性调研</h4>
<img src="./ideation-expandability.webp" alt="可扩展性调研" style="max-width:100%; border-radius:8px; display:block; margin:0 0 14px;" />
<p>调研的是这台柜子以后能往哪几个方向长：容量、造型、附加功能。</p>
</div>
</div>

我们先翻规范文档，再分析现有的岸电产品，然后把可能的用户场景和里面的变量理清楚。

变量主要是四类：

1. **功率**：需要的 kVA 不同，配置就不同。
2. **接入方式**：直接接变压器，还是直接接电网。
3. **船型**：小型和大型货船的用电需求不一样。
4. **接口**：柜上的接口类型和安培数，跟着上面几种场景变。

## 材料与组装方式研究

<div class="info-tabs">
<div class="tab-nav">
<div class="tab-item">框架方案</div>
<div class="tab-item">连接方式</div>
<div class="tab-item">可扩展性方案</div>
</div>
<div class="tab-panel tab-image">
<h4>框架方案</h4>
<img src="./solutions-frame.webp" alt="五种框架方案" style="max-width:100%; border-radius:8px; display:block; margin:0 0 14px;" />
<table class="mat-table">
<thead><tr><th>方案</th><th>优点</th><th>缺点</th></tr></thead>
<tbody>
<tr><td>冲孔型材 / Strut Channel<br />（25mm 孔距）</td><td><span class="plus">+</span>元件位置灵活<br /><span class="plus">+</span>模块可扩展<br /><span class="plus">+</span>标准件好买</td><td><span class="minus">−</span>密封处理麻烦</td></tr>
<tr><td>型材系统</td><td><span class="plus">+</span>刚度和机械强度高<br /><span class="plus">+</span>标准件好买<br /><span class="plus">+</span>模块可扩展</td><td><span class="minus">−</span>密封能力有限</td></tr>
<tr><td>玻璃纤维增强塑料型材</td><td>—</td><td><span class="minus">−</span>寿命短<br /><span class="minus">−</span>在使用环境里可靠性不够</td></tr>
<tr><td>企口夹芯板</td><td>—</td><td><span class="minus">−</span>扩展性受限<br /><span class="minus">−</span>密封不足</td></tr>
<tr><td>模块化管轨</td><td>—</td><td><span class="minus">−</span>连接点太多<br /><span class="minus">−</span>密封不足</td></tr>
<tr class="verdict"><td colspan="3"><strong>最终选择：</strong>25mm 孔距的冲孔型材，配侧面密封条加顶盖来处理密封。</td></tr>
</tbody>
</table>
</div>
<div class="tab-panel tab-image">
<h4>连接方式</h4>
<img src="./solutions-connections.webp" alt="连接方式研究" style="max-width:100%; border-radius:8px; display:block; margin:0 0 8px;" />
<p>模块之间最终采用上下夹层固定的方式，每个柜子模块可以左右连接。这意味着假设加入新的模块，就需要为它配新的上下夹层：下层需要承载足够的重量，上层（也就是屋顶）需要足够的防水性能。</p>
<p><strong>最终选择：</strong>上下夹层固定、模块左右相连。整壳连续的结构比全模块化拼板防水更好。</p>
</div>
<div class="tab-panel">
<h4>可扩展性方案</h4>
<img src="./studies-expandability.webp" alt="可扩展性方案" style="max-width:100%; border-radius:8px; display:block; margin:0 0 14px;" />
<p><strong>电池</strong>：内部电池组用来吸收电流峰值和大功率需求；另设外部电源接口，接外部应急电源或发电机输入。</p>
<p><strong>造型</strong>：城市里用自然化的处理（种植槽、低调配色）融进周边环境；港口环境则保留功能性的工业气质。</p>
<p><strong>模组化</strong>：预留 5G 基站，为将来港区的无人机和自动驾驶设备增强信号；预留应急供电点，给手机这类小设备充电。</p>
<p><strong>最终选择：</strong>三个方向都采用，电池、造型和模组化。</p>
</div>
</div>

## 概念方案

<div class="info-tabs">
<div class="tab-nav">
<div class="tab-item">概念探索</div>
<div class="tab-item">设计概念</div>
<div class="tab-item">定稿概念</div>
</div>
<div class="tab-panel tab-image">
<h4>概念探索</h4>
<img src="./concept-exploration.webp" alt="十二个概念设计方案的探索" style="max-width:100%; max-height:62% !important; border-radius:8px; display:block; margin:0 0 14px;" />
<p>这一轮铺开做了 12 个不同的概念设计，横跨柜体轮廓、模组划分、接口布置和造型语言几个方向，用来把可能性摊平了看。</p>
</div>
<div class="tab-panel tab-image">
<h4>设计概念</h4>
<img src="./design-urban-nature.webp" alt="城市绿化模块概念（AI 生成）" style="max-width:100%; max-height:62% !important; border-radius:8px; display:block; margin:0 0 14px;" />
<p>柜顶做成种植槽（sedumdak），把柜体的视觉性格压下去，让它在城市公共空间里不那么突兀。</p>
<p><strong>结构：</strong>只做在柜顶，不向两侧扩展，做成矩形种植槽。模块本身要可识别、可更换、好维护。</p>
<p><strong>植物要求：</strong>耐晒、抗风、耐旱、根系浅、维护量低。</p>
<p>植物给设计带进一点自然感，缓和工业外观，让岸电柜在城市的公共环境里更容易被接受。</p>
<p class="src"><strong>素材来源：</strong>这张图由 <strong>AI 生成</strong>，仅作概念示意，不是实物效果。</p>
</div>
<div class="tab-panel tab-image">
<h4>定稿概念</h4>
<img src="./cad-render-annotated.png" alt="带标注的柜体渲染图" style="max-width:100%; border-radius:8px; display:block; margin:0 0 14px;" />
<p>把前面收敛下来的方向画成完整的柜体：四列模组，顶部控制、电源、计量和 AC/DC 变换，往下是安全器件、控制面板和 DC/AC 逆变部分。</p>
</div>
</div>

# 方案

## 电流缓冲

市电从有限的并网接入进来，先整流成直流给电池组充电；船上的峰值需求由电池补上，再把直流逆变成船舶要的交流输出。中间配上电流计量、保护和监控，认证与计费相关的部分按港口的实际规范走。

## 模组化结构

一柜分四列，每列一个模组。顶部是控制、电源、计量和 AC/DC 变换，往下依次是安全器件、控制面板和 DC/AC 逆变部分。

<div class="showcase">
<div class="show-item"><img src="./scale-model-02.webp" alt="缩比模型渲染" /><p>模块 A</p></div>
<div class="show-item"><img src="./scale-model-01.webp" alt="缩比模型渲染" /><p>缩比模型；整体</p></div>
<div class="show-item"><img src="./scale-model-03.webp" alt="缩比模型渲染" /><p>模块 B</p></div>
</div>

缩比模型按真实布局搭：全部电子元件装在 3D 打印的框架里，模块 A 是硬件和控制器件所在的上段，模块 B 是留给后续扩展的下段，用来说明整柜的分区和结构逻辑。

柜顶做成种植槽，目的是把工业柜体的观感压一压，让它在城市公共空间里不那么突兀。模块本身可拆换、好维护，不向两侧扩展。选的是耐晒、抗风、耐旱、根系浅、好打理的植物。

## 材料与防护

| 项 | 选择 |
| --- | --- |
| 柜体 | 不锈钢 AISI 316L 钣金，板厚 ≥ 2mm，焊接成型 |
| 防护等级 | 外部 IP54，内部 IP20；抗冲击 IK10 |
| 涂层 | 内外各至少 2 层，干膜厚度 ≥ 120 µm，适用 C5 腐蚀环境，寿命 > 15 年 |
| 锁定 | 三点锁 |
| 接地 | 接地电阻 ≤ 1 Ω，柜门与金属件用软接地线连到柜体 |
| 环境温度 | −25 °C 到 +40 °C |
| 安装位置 | 必须高于当地最高水位；装在浮桥或栈桥上时要垫高底座，所有电缆入口做防水封堵 |

材料是分两块比的：柜体钣金的牌号，和结构型材的材质。

<div class="info-tabs">
<div class="tab-nav">
<div class="tab-item">柜体钣金</div>
<div class="tab-item">结构型材</div>
</div>
<div class="tab-panel tab-image">
<h4>柜体钣金</h4>
<img src="./material-steel-overview.webp" alt="不锈钢牌号对比" style="max-width:100%; border-radius:8px; display:block; margin:0 0 10px;" />
<img src="./material-steel-corrosion.webp" alt="氯化物环境下的腐蚀机理" style="max-width:100%; border-radius:8px; display:block; margin:0 0 14px;" />
<table class="mat-table">
<thead><tr><th>牌号</th><th>优点</th><th>缺点</th></tr></thead>
<tbody>
<tr><td>316<br />（钣金 + 焊接）</td><td><span class="plus">+</span>含钼，抗氯化物环境不错</td><td><span class="minus">−</span>加工难<br /><span class="minus">−</span>焊接、清洗或钝化质量不到位仍会局部腐蚀<br /><span class="minus">−</span>抗氯化物能力不如 316L</td></tr>
<tr><td>316L<br />（钣金 + 焊接）</td><td><span class="plus">+</span>碳含量比 316 更低，耐腐蚀更好<br /><span class="plus">+</span>焊接相对容易<br /><span class="plus">+</span>抗氯化物环境好</td><td><span class="minus">−</span>加工难<br /><span class="minus">−</span>焊接和清洗质量不到位仍会局部腐蚀<br /><span class="minus">−</span>价格高于 316</td></tr>
<tr><td>2205 双相不锈钢<br />（钣金 + 焊接）</td><td><span class="plus">+</span>强度高于 316L<br /><span class="plus">+</span>抗氯化物环境优秀<br /><span class="plus">+</span>适用于氯离子浓度超过 1000 ppm 或温度高于 60 °C 的场合<br /><span class="plus">+</span>铁素体与奥氏体比例均衡</td><td><span class="minus">−</span>比 316 这类奥氏体不锈钢更难加工</td></tr>
<tr class="verdict"><td colspan="3"><strong>最终选择：</strong>316L。港口环境氯化物含量高，2205 的性能余量用不上但价格和加工难度都上去了。</td></tr>
</tbody>
</table>
</div>
<div class="tab-panel tab-image">
<h4>结构型材</h4>
<img src="./material-profiles.webp" alt="型材材质对比" style="max-width:100%; border-radius:8px; display:block; margin:0 0 14px;" />
<table class="mat-table">
<thead><tr><th>材料</th><th>优点</th><th>缺点</th></tr></thead>
<tbody>
<tr><td>HDPE<br />（加 UV 稳定剂；挤出／注塑）</td><td><span class="plus">+</span>耐腐蚀好<br /><span class="plus">+</span>抗冲击强<br /><span class="plus">+</span>便宜好生产<br /><span class="plus">+</span>可回收</td><td><span class="minus">−</span>UV 稳定性一般<br /><span class="minus">−</span>刚度低，不适合做结构件<br /><span class="minus">−</span>长期受力会蠕变变形<br /><span class="minus">−</span>热膨胀大</td></tr>
<tr><td>ASA<br />（挤出／注塑）</td><td><span class="plus">+</span>耐腐蚀好<br /><span class="plus">+</span>UV 稳定性好<br /><span class="plus">+</span>比 HDPE 更适合长期户外<br /><span class="plus">+</span>形状稳定性和耐热性更好</td><td><span class="minus">−</span>刚度低，不能承力<br /><span class="minus">−</span>比 HDPE 贵</td></tr>
<tr><td>GFRP<br />（玻璃纤维增强塑料；拉挤成型）</td><td><span class="plus">+</span>UV 稳定性和耐腐蚀都好<br /><span class="plus">+</span>刚度高，可以当结构型材<br /><span class="plus">+</span>寿命长</td><td><span class="minus">−</span>比 HDPE 和 ASA 贵<br /><span class="minus">−</span>生产难度高</td></tr>
<tr class="verdict"><td colspan="3"><strong>最终选择：</strong>GFRP 拉挤型材。HDPE 即使加了 UV 稳定剂，长期紫外和蠕变表现仍不如 GFRP；ASA 耐候好但刚度不足，承担不了结构件。GFRP 的耐候、耐腐蚀、抗拉强度和长期结构稳定性都更合适。</td></tr>
</tbody>
</table>
</div>
</div>

# 动手做

<div class="process-scroll">
  <div class="process-track" data-copies="3" data-unique="3">
    <div class="step"><img src="./step-01-rfid-prototype.jpeg" alt="RFID 打样" /><span>步骤 1: RFID 授权打样</span></div>
    <div class="step"><img src="./step-02-assembly-testing.jpeg" alt="接线与调试" /><span>步骤 2: 接线与调试</span></div>
    <div class="step"><img src="./step-03-scale-model.jpeg" alt="缩比模型" /><span>步骤 3: 缩比模型装配</span></div>
    <div class="step"><img src="./step-01-rfid-prototype.jpeg" alt="RFID 打样" /><span>步骤 1: RFID 授权打样</span></div>
    <div class="step"><img src="./step-02-assembly-testing.jpeg" alt="接线与调试" /><span>步骤 2: 接线与调试</span></div>
    <div class="step"><img src="./step-03-scale-model.jpeg" alt="缩比模型" /><span>步骤 3: 缩比模型装配</span></div>
    <div class="step"><img src="./step-01-rfid-prototype.jpeg" alt="RFID 打样" /><span>步骤 1: RFID 授权打样</span></div>
    <div class="step"><img src="./step-02-assembly-testing.jpeg" alt="接线与调试" /><span>步骤 2: 接线与调试</span></div>
    <div class="step"><img src="./step-03-scale-model.jpeg" alt="缩比模型" /><span>步骤 3: 缩比模型装配</span></div>
  </div>
</div>

先在面包板上把 RFID 读卡和授权逻辑跑通；然后进入整柜接线，用万用表逐点核对电压和回路；最后按图纸装出缩比模型，内部按真实柜体分区走线，通电调试后用于答辩演示。

# 工程图纸

<div class="side-by-side">
  <div><img src="./technical-drawing-top.png" alt="俯视图" /><p>俯视图</p></div>
  <div><img src="./technical-drawing-full.png" alt="总装图" /><p>总装图</p></div>
</div>

<div class="side-by-side">
  <div><img src="./technical-drawing-front.png" alt="正视图" /><p>正视图</p></div>
  <div><img src="./cad-render-detail.png" alt="内部布局渲染" /><p>内部布局渲染</p></div>
</div>

# 未来可拓展性

模组化是为后面留的口子。中央柜负责控制和接入，需要更多容量时，在旁边挂一个外形相同的电池柜就行。往下还能继续挂：余热回收、5G 基站、无人机降落平台、外部电源输入口。顶上除了标配的绿顶，也可以选装太阳能板，给柜上的显示器和传感器供电。

# 实物

<div class="process-scroll">
  <div class="process-track" data-copies="3" data-unique="5">
    <div class="step"><img src="./photo-front.webp" alt="实机；正视图" /><span>正视图</span></div>
    <div class="step"><img src="./photo-side.webp" alt="实机；侧视图" /><span>侧视图</span></div>
    <div class="step"><img src="./photo-back.webp" alt="实机；背视图" /><span>背视图</span></div>
    <div class="step"><img src="./photo-door-open-1.webp" alt="实机；开门视图" /><span>开门视图（一）</span></div>
    <div class="step"><img src="./photo-door-open-2.webp" alt="实机；开门视图" /><span>开门视图（二）</span></div>
    <div class="step"><img src="./photo-front.webp" alt="实机；正视图" /><span>正视图</span></div>
    <div class="step"><img src="./photo-side.webp" alt="实机；侧视图" /><span>侧视图</span></div>
    <div class="step"><img src="./photo-back.webp" alt="实机；背视图" /><span>背视图</span></div>
    <div class="step"><img src="./photo-door-open-1.webp" alt="实机；开门视图" /><span>开门视图（一）</span></div>
    <div class="step"><img src="./photo-door-open-2.webp" alt="实机；开门视图" /><span>开门视图（二）</span></div>
    <div class="step"><img src="./photo-front.webp" alt="实机；正视图" /><span>正视图</span></div>
    <div class="step"><img src="./photo-side.webp" alt="实机；侧视图" /><span>侧视图</span></div>
    <div class="step"><img src="./photo-back.webp" alt="实机；背视图" /><span>背视图</span></div>
    <div class="step"><img src="./photo-door-open-1.webp" alt="实机；开门视图" /><span>开门视图（一）</span></div>
    <div class="step"><img src="./photo-door-open-2.webp" alt="实机；开门视图" /><span>开门视图（二）</span></div>
  </div>
</div>

# 交付与协作

交付内容是一台缩比模型（全部电子元件按真实布局装在 3D 打印框架里）、完整的 SolidWorks 模型、技术图纸和文档，用来演示柜体的分区逻辑和结构方案。

这个项目跟委托方的期待一开始没对上。开头有几周卡在等对方补充信息和用户场景上；等我们确认对方实际要的是电气计算、而这类题目本身不属于工业设计的范畴时，两边的方向已经错开了。我们和两位指导老师谈过之后，把项目重构成自己的设计题目：一台模组化可扩展的岸电柜。事后看这个决定是对的，项目从这时候起才真正对上我们的学习目标。

# 这个项目教会我的

- <strong style="color:var(--accent)">材料研究的价值在于能不能落成决定</strong>：316、316L、2205 双相不锈钢的对比，HDPE 和 GFRP 的取舍，最后都要能给出一句"所以选这个"。研究本身不难，难的是把结论收成一个可以被追问的选择。
- <strong style="color:var(--accent)">电气规范是设计输入，不是背景资料</strong>：IP 等级、IK10、C5 涂层、接地电阻 1 Ω、安装高度，这些都是决定柜体长什么样的硬约束。
- <strong style="color:var(--accent)">等不到信息就要自己下决定</strong>：这个项目最贵的一课。委托方的方向一直不明确，我们等得太久。下次会先给关键信息定一个截止日期，到期没有就换路或自己重写题目。
- <strong style="color:var(--accent)">跨专业协作靠问对问题</strong>：电气同学讲他们的方案时我能跟上，是因为我自学过电工基础，能问到发热、变压器效率、电源选型这些具体的地方。
- <strong style="color:var(--accent)">想成为混合型设计师</strong>：这个项目把我从"只管造型和概念"往技术那侧推了一截。我希望接下来在电气安全、嵌入式系统和基础电子上继续补。

## 来源

### 材料与结构

**柜体钣金**

1. [Identificatie van roestvrij staal 304 versus 316 · Gids (2026)](https://oceanplayer.com/nl/304-vs-316-stainless-steel-identification-guide-2026/)
2. [AISI 316 vs 316L Stainless Steel, Difference of SS316 & SS316L Properties Composition Yield Strength Density](https://www.theworldmaterial.com/difference-ss316-vs-ss316l-stainless-steel/)
3. [Duplex roestvrij staal 2205 - Eigenschappen, Toepassingen & Voordelen - LangHe Industry Co., Ltd.](https://langhe-industry.com/nl/duplex-stainless-steel-2205/)

**结构型材**

1. [ABS & ASA Extrusions - Condale Plastics](https://www.condaleplastics.com/materials/material-selection/abs-asa-extrusions/)
2. [Glass Fiber Reinforced Polymer (GFRP) | Definition, Advantage](https://petronthermoplast.com/everything-you-need-to-know-about-glass-fiber-reinforced-polymer-gfrp/)
3. [HDPE vs FRP Pipe：Strength, Lifespan, Density Comparative](https://www.ganglongfiberglass.com/hdpe-vs-frp-pipe/#UV_Resistance)

### 种植槽（绿顶）

1. [10 tips: ik wil een sedumdak en nu? – SedumSpecialist](https://www.sedumspecialist.nl/blog/10-tips-ik-wil-een-sedumdak-en-nu/)
2. [Sedum mix voor groendak in de zon: 15 soorten – Groenpalet Shop](https://groenpalet-shop.be/shop/sedums/inpot/sedum-mix-groendak-zon-15-soorten/)
3. [Sedumdak voor- en nadelen: een eerlijk overzicht - GROEN Dichterbij](https://www.groendichterbij.nl/sedumdak-voor-en-nadelen/)
