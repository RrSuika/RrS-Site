---
title: ESP32 + RGBWW FCOB 灯带通信测试
date: 2026-08-02
description: ESP32 NeoPixelBus 与 RGBWW FCOB LED 灯带通信测试;通道循环与协议验证。

type: lab
category: 嵌入式系统
cover: 01-fcob-setup.png

tags:
  - ESP32
  - NeoPixel

tools:
  - ESP32
  - RGBWW FCOB LED 灯带
  - NeoPixelBus 库

featured: false

lang: zh

translationKey: esp32-rgbww-fcob-comm
---

![FCOB LED 接线](./01-fcob-setup.png)

# 目的

在做任何有意思的效果之前，我得先把最基本的东西确认清楚：ESP32 能不能跟这条 FCOB 灯带正常通信、数据线接对了没有、颜色通道的顺序我有没有搞错。FCOB 灯带跟普通可寻址 LED 有点不一样;它用的是一整条连续的荧光涂层，发光特别均匀柔和。但通信协议还是那个 NeoPixel/WS2812 风格的单线接口，软件这边倒是熟门熟路。

# 代码

```cpp
#include <NeoPixelBus.h>

#define LED_PIN 5
// 先假设 150 个控制点
#define LED_COUNT 150

NeoPixelBus<NeoGrbwFeature, NeoEsp32Rmt0800KbpsMethod> strip(LED_COUNT, LED_PIN);

void setup() {
  strip.Begin();
  strip.Show();
}

void loop() {
  // 红色
  for (int i = 0; i < LED_COUNT; i++) {
    strip.SetPixelColor(i, RgbwColor(255, 0, 0, 0));
  }
  strip.Show();
  delay(2000);

  // 绿色
  for (int i = 0; i < LED_COUNT; i++) {
    strip.SetPixelColor(i, RgbwColor(0, 255, 0, 0));
  }
  strip.Show();
  delay(2000);

  // 蓝色
  for (int i = 0; i < LED_COUNT; i++) {
    strip.SetPixelColor(i, RgbwColor(0, 0, 255, 0));
  }
  strip.Show();
  delay(2000);

  // 暖白（W 通道）
  for (int i = 0; i < LED_COUNT; i++) {
    strip.SetPixelColor(i, RgbwColor(0, 0, 0, 255));
  }
  strip.Show();
  delay(2000);
}
```

先假设了 150 个控制点;其实当时还不确定这条灯带到底有多少个（后面才搞清楚），反正是通信测试，写个够大的数就行。这里主要想验证两件事：一是 `NeoGrbwFeature` 的颜色顺序（库里要求的是红、白、绿、蓝，和常见的 R、G、B、W 顺序不同），二是 `NeoEsp32Rmt0800KbpsMethod` 能不能通过 ESP32 的 RMT 外设稳定输出 800 kbps 的信号。这两样要是搞错了，要么灯根本不亮，要么随机乱闪颜色，然后你就得对着接线怀疑人生半小时。

# 结果

FCOB 灯带依次显示红、绿、蓝、暖白四种颜色。ESP32 与 NeoPixel 灯带通信稳定，四个颜色通道（R、G、B、W）均正常响应。

挺解压的一刻;整条灯带干干净净地亮起同一种颜色，不闪不抖不抽风。ESP32 的 RMT 方式处理 WS2812 那种微秒级时序完全不吃力，波形非常稳。通信没问题，接下来就可以搭真正的调色界面了。
