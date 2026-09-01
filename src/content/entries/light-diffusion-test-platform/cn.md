---
title: 光扩散测试平台

date: 2026-04-20

description: 我搭了一个桌面光学测试台，专门用来系统评估材料的多种光学视觉效果。CMF 选材不用再靠主观判断，有了可重复的量化对比。

type: projects

category: CMF与光学测试

cover: 03-final-platform-3d.png

tags:
  - 工业设计
  - CMF
  - 材料测试
  - 光扩散
  - 光学测量

tools:
  - Arduino
  - LED灯带 (PWM控制)
  - 实验室升降台
  - 12V变压器
  - PWM控制器模块

featured: true

lang: zh

translationKey: light-diffusion-test-platform
---

# 解决问题

产品设计里有个场景反复出现：你要给灯罩、扩散板或显示屏盖板选一种半透明材料，然后你基本上是在猜。拿着样品凑到灯光前，眯眼看一看，再拿另一个样品比一比，最后感觉"嗯，这个差不多。"

问题是两片在室内光线下看起来一模一样的材料，一旦背光，效果可能天差地别。表面处理、厚度，还有内部结构; 它们全都在影响光的传播路径，而渲染图只能帮你到这儿。到了一定程度，你得肉眼去看。

于是我搭了这个测试装置；从今往后，需要设计发光板时的 CMF 决策，我都可以用固定的流程来支撑，不再靠直觉。

# 测量因素

四个光学特性，每个都直接关联到产品设计决策：

| 特性         | 它在告诉你什么           | 对设计的实际意义                     |
| ------------ | ------------------------ | ------------------------------------ |
| **透光率**   | 多少光穿透了材料         | 背光显示屏的亮度、LED 指示灯的可视性 |
| **扩散度**   | 光穿透后被散射得有多均匀 | 消除热点、保证发光面的整体均匀度     |
| **反射率**   | 材料表面怎么反弹入射光   | 表面处理选择、眩光控制               |
| **亮度分布** | 被照亮的区域亮度怎么变化 | 视觉舒适度、导光板设计               |

除了测量目标本身，我还列了几个实操层面的要求;后来证明这些跟光学指标同样重要：

- <strong style="color:var(--accent)">可重复定位</strong>：样品离光源的距离如果不一致，任何对比都失去意义。
- <strong style="color:var(--accent)">可调节亮度</strong>：材料在 10% 亮度和 100% 亮度下的表现完全不同。光源必须能覆盖这个范围。
- <strong style="color:var(--accent)">环境光控制</strong>：在阳光充足的房间里测光学数据基本是白测。测试环境必须尽量排除外部干扰。
- <strong style="color:var(--accent)">快速更换样品</strong>：如果换一次材料就得折腾五分钟，你根本不会愿意跑足够多的对比来学到有用的东西。
- <strong style="color:var(--accent)">可观测输出</strong>：我需要亲眼看到结果。并排对比的视觉效果本身就是一半的价值。

# 设计与搭建

![概念设计](./02-concept-design.png)

## 平台架构

整个架子是垂直结构：光源在底部，可调样品台在中间，从上方观察。布局思路基本是精简版的实验室光学平台;只保留必要的东西，不塞进任何碍事的零件。

<div class="side-by-side">
  <div><img src="./04-final-render.png" alt="最终渲染" /><p>最终 3D 渲染图</p></div>
  <div><img src="./05-concept-sketch.png" alt="概念草图" /><p>概念草图</p></div>
</div>

### 核心组件

- <strong style="color:var(--accent)">光源</strong>：LED 自然光灯带。从几乎不亮到全功率输出。
- <strong style="color:var(--accent)">样品台</strong>：使用了一个实验室升降台。高度可调让我能精确控制光源和材料之间的距离。
- <strong style="color:var(--accent)">框架</strong>：激光切割的结构件，喷涂哑光黑。黑色能吸收环境杂光、消除内部反射。
- <strong style="color:var(--accent)">控制系统</strong>：PWM 控制器调节灯带亮度。
- <strong style="color:var(--accent)">供电</strong>：无氧铜导线 0.5mm²，额定 2A。

## 制造流程

<div class="process-scroll" id="process-scroll">
  <div class="process-track" id="process-track" data-copies="3" data-unique="10">
    <div class="step"><img src="./06-3d-modelling.png" alt="三维建模" /><span>步骤 1: 三维建模</span></div>
    <div class="step"><img src="./07-laser-cutting.png" alt="激光切割" /><span>步骤 2: 激光切割</span></div>
    <div class="step"><img src="./08-test-build.png" alt="试装" /><span>步骤 3: 试装</span></div>
    <div class="step"><img src="./09-surface-finish.png" alt="表面处理" /><span>步骤 4: 表面处理</span></div>
    <div class="step"><img src="./10-subassembly-1.png" alt="部件组装" /><span>步骤 5: 部件组装</span></div>
    <div class="step"><img src="./11-circuit-soldering.png" alt="电路焊接" /><span>步骤 6: 电路焊接</span></div>
    <div class="step"><img src="./12-circuit-verification.png" alt="电路验证" /><span>步骤 7: 电路验证</span></div>
    <div class="step"><img src="./13-polarity-check.png" alt="极性检查" /><span>步骤 8: 极性检查</span></div>
    <div class="step"><img src="./14-subassembly-2.png" alt="总装" /><span>步骤 9: 总装</span></div>
    <div class="step"><img src="./15-circuit-testing.png" alt="电路测试" /><span>步骤 10: 电路测试</span></div>
    <div class="step"><img src="./06-3d-modelling.png" alt="三维建模" /><span>步骤 1: 三维建模</span></div>
    <div class="step"><img src="./07-laser-cutting.png" alt="激光切割" /><span>步骤 2: 激光切割</span></div>
    <div class="step"><img src="./08-test-build.png" alt="试装" /><span>步骤 3: 试装</span></div>
    <div class="step"><img src="./09-surface-finish.png" alt="表面处理" /><span>步骤 4: 表面处理</span></div>
    <div class="step"><img src="./10-subassembly-1.png" alt="部件组装" /><span>步骤 5: 部件组装</span></div>
    <div class="step"><img src="./11-circuit-soldering.png" alt="电路焊接" /><span>步骤 6: 电路焊接</span></div>
    <div class="step"><img src="./12-circuit-verification.png" alt="电路验证" /><span>步骤 7: 电路验证</span></div>
    <div class="step"><img src="./13-polarity-check.png" alt="极性检查" /><span>步骤 8: 极性检查</span></div>
    <div class="step"><img src="./14-subassembly-2.png" alt="总装" /><span>步骤 9: 总装</span></div>
    <div class="step"><img src="./15-circuit-testing.png" alt="电路测试" /><span>步骤 10: 电路测试</span></div>
    <div class="step"><img src="./06-3d-modelling.png" alt="三维建模" /><span>步骤 1: 三维建模</span></div>
    <div class="step"><img src="./07-laser-cutting.png" alt="激光切割" /><span>步骤 2: 激光切割</span></div>
    <div class="step"><img src="./08-test-build.png" alt="试装" /><span>步骤 3: 试装</span></div>
    <div class="step"><img src="./09-surface-finish.png" alt="表面处理" /><span>步骤 4: 表面处理</span></div>
    <div class="step"><img src="./10-subassembly-1.png" alt="部件组装" /><span>步骤 5: 部件组装</span></div>
    <div class="step"><img src="./11-circuit-soldering.png" alt="电路焊接" /><span>步骤 6: 电路焊接</span></div>
    <div class="step"><img src="./12-circuit-verification.png" alt="电路验证" /><span>步骤 7: 电路验证</span></div>
    <div class="step"><img src="./13-polarity-check.png" alt="极性检查" /><span>步骤 8: 极性检查</span></div>
    <div class="step"><img src="./14-subassembly-2.png" alt="总装" /><span>步骤 9: 总装</span></div>
    <div class="step"><img src="./15-circuit-testing.png" alt="电路测试" /><span>步骤 10: 电路测试</span></div>
  </div>
</div>

# 材料测试

我测试的几种半透明/透明材料都是产品外壳、扩散板和导光件中常见的类型：

### 测试材料矩阵

| 材料             | 类型         | 关键特性                               |
| ---------------- | ------------ | -------------------------------------- |
| **半透明PLA**    | 3D打印       | 层纹散射、原型打样成本低               |
| **半透明PETG**   | 3D打印       | 比 PLA 更透、层间附着力更强            |
| **亚克力板**     | 激光切割     | 高透光率、量大便宜                     |
| **AB环氧树脂板** | 浇铸树脂     | 高透明度、内部能填充物品、玻璃替代方案 |
| **PC 光扩散板**  | 挤出聚碳酸酯 | 专为扩散而生、棱柱状表面纹理           |

每种材料都在多种配置下跑过;不同厚度、不同表面处理、不同扩散间距;这样我可以在可比的条件下看清每种材料选择对最终视觉效果的真正影响。

# 可控变量

我搭测试台的整个意义就在这里：一次只改一个参数。系统化的 A/B 对比只有在锁定所有其他变量的前提下才成立。

<div class="variables-grid">

- <strong style="color:var(--accent)">光照强度</strong> — PWM 控制器调节，从微亮到全功率
- <strong style="color:var(--accent)">材料类型</strong> — PLA、PETG、亚克力、AB环氧、PC扩散板
- <strong style="color:var(--accent)">材料颜色</strong> — PETG和亚克力的本色、白色、着色版本
- <strong style="color:var(--accent)">材料厚度</strong> — 单层、叠层、不同板材厚度
- <strong style="color:var(--accent)">表面处理</strong> — 原始打印面、打磨（80–5000目）、抛光、纹理
- <strong style="color:var(--accent)">扩散距离</strong> — 通过升降台调节光源与样品之间的间隙

</div>

# 三版迭代

这个平台经过了三个版本。每个版本都在修正上一个版本犯下的错误。

![迭代对比](./01-iteration-comparison.png)

|                       | V1 — 单 LED                                       | V2 — LED 灯带                                      | V3 — LED 灯带 + PWM                                             |
| --------------------- | ------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------- |
| <strong>方法</strong> | 手工焊接                                          | 铜箔胶带                                           | PWM 控制器                                                      |
| <strong>问题</strong> | <span style="color:#e53935">✕</span> 焊接速度太慢 | <span style="color:#e53935">✕</span> 胶带不适配 2A | <span style="color:var(--terminal-green)">✓</span> 亮度可调     |
|                       | <span style="color:#e53935">✕</span> 灯光效果差   | <span style="color:#e53935">✕</span> 无亮度控制    | <span style="color:var(--terminal-green)">✓</span> 暗表面漫反射 |
| <strong>结论</strong> | <span style="color:#e53935">✕ 已弃用</span>       | <span style="color:#e53935">✕ 已弃用</span>        | <span style="color:var(--terminal-green)">✓ 最终版本</span>     |

### 版本一：单 LED ;手工焊接

一开始用单个 LED 手工焊在底板上。这是最直接的第一反应，也犯了最典型的错。

- <span style="color:#e53935">**问题：**</span> 手工焊二十个 LED 既慢又不一致。每个焊点的接触电阻略有差异，每个灯的亮度就略有区别。对测试平台来说，"略有区别"是致命的。
- <span style="color:#e53935">**问题：**</span> 单点光源导致样品上的照度不均匀。如果光本身就不是均匀的，你没法判断看到的扩散图案来自材料还是来自光源本身。

### 版本二：LED 灯带 ;铜箔胶带

把单个 LED 换成了均匀发光的 LED 灯带，用铜箔胶带走电。好了一些，但迎来了新坑。

- <span style="color:#e53935">**问题：**</span> 铜箔胶带用起来方便、看起来干净，但它扛不住 2A 电流。我算了截面积之后意识到这是潜在的火灾隐患。原型的美观在导线规格不够面前一文不值。
- <span style="color:#e53935">**问题：**</span> 亮度锁死。不管测什么材料、什么距离，光输出都一样。不同场景需要不同的照度水平，而我完全无法调节。

### 版本三：LED 灯带 + PWM 控制器（当前版本）

这个版本是最终钉下来的：

- <span style="color:var(--terminal-green)">**改进：**</span> 铜箔胶带全部拆掉，换成无氧铜导线（最小截面积 0.5mm²）。额定 2A 且有余量。比胶带难走线，但安全比方便重要得多。
- <span style="color:var(--terminal-green)">**改进：**</span> 加了PWM 控制器，全范围可调亮度。现在可以测任意中间档位;而且每次读数一致。
- <span style="color:var(--terminal-green)">**改进：**</span> 框架内壁全喷哑光黑。环境光和内部反射一直在悄悄污染每一次读数。

# 平台能做什么

做好的测试台给了我一个可靠、可复现的环境来对比材料的光学表现：

- <strong style="color:var(--accent)">同条件并排对比</strong>不同材料;不再需要说"我觉得这个看起来好一点"
- <strong style="color:var(--accent)">表面处理评估</strong>;打磨、抛光、纹理会怎么影响光的传播？
- <strong style="color:var(--accent)">厚度与透光率的关系</strong>;板材加厚一倍，亮度到底降多少？
- <strong style="color:var(--accent)">全段亮度扫描</strong>;观察材料从最低到最高亮度的完整表现
- <strong style="color:var(--accent)">光分布模式存档</strong>;以后的项目可以直接引用这些视觉记录

![最终平台](./03-final-platform-3d.png)

## 搭台子教会我的事

除了 CMF 测试数据，搭这个平台扎扎实实敲进去几条原则，往后的设计和建造都用得上：

- <strong style="color:var(--accent)">电流规格也很重要</strong>：铜箔胶带的失败就是一个很具体的教训;原型阶段的材料也必须对照真实电气负载做评估。走线再好看，截面积不够就是不够。安全规格没有讨价还价的余地。
- <strong style="color:var(--accent)">环境本身就是仪器的一部分</strong>：光学测量对环境光的敏感度高到离谱。那个只花了二十分钟的哑光黑喷漆，对测量一致性的提升超过了任何其他改动。有时候最简单的改动带来最大的效果。
- <strong style="color:var(--accent)">一次只动一个变量，否则就是在猜</strong>：能独立地改材料、改厚度、改表面处理、改距离;这就是把"凑在灯下看"变成"系统性测试"的关键。对比实验只有在锁定所有其他变量的前提下才叫实验。
- <strong style="color:var(--accent)">工具是跨项目的投资</strong>：花时间做好一个测试平台前期感觉很慢，但之后每一个涉及半透明材料的 CMF 决策，我都可以引用实测数据，一劳永逸属于是。

## 未来改进

- <strong style="color:var(--accent)">用精准数字控制取代手动PWM控制</strong>：目前的设置依赖于手动调节的PWM控制器，虽然足以满足探索性测试的需求，但会导致测量间光强度存在一定差异。配合单片机可以生成精确定义的PWM信号并存储可重复的亮度设置，从而确保在不同测试中实现相同的照明条件。这将提高数据的可靠性，并使材料间的比较更加严谨。
