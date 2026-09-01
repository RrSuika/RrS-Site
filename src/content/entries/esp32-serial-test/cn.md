---
title: ESP32 串口输出测试
date: 2026-07-20
description: 验证 ESP32 单片机基本功能;上传程序并通过 USB 串口确认通信正常。

type: lab
category: 嵌入式系统
cover: cover.png

tags:
  - ESP32
  - 串口通信
  - 入门

tools:
  - ESP32
  - Arduino IDE
  - USB 数据线

featured: false

lang: zh

translationKey: esp32-serial-test
---

# 目的

在搞更复杂的东西之前，我得先确认这块 ESP32 板子本身没问题;能烧录程序、能通过 USB 跟电脑通信、能在 Serial Monitor 里看到输出。这是那种看似不起眼但能帮你省掉后面大量排查时间的检查。串口通信要是不通，后面的东西都没法玩。

# 代码

```cpp
void setup() {
  Serial.begin(115200);
}

void loop() {
  Serial.println("ESP32 OK");
  delay(1000);
}
```

没什么花哨的;就是把串口设到 115200 波特率，然后每秒打印一次心跳。只要这条消息能在串口监视器里刷出来，就说明板子活着、USB 转 UART 芯片工作正常、Arduino IDE 也能正常跟板子对话。

# 测试步骤

1. 在 Arduino IDE 中选择 ESP32 开发板和对应 COM 端口。
2. 使用 USB 连接 ESP32 并上传代码。
3. 当显示 `Connecting......` 时按下 ESP32 的 IO0 键进入烧录模式。
4. 上传完成后打开串口监视器，设置波特率为 **115200**。

第三步那个 IO0 按钮我一开始还愣了一下;有些 ESP32 板子不会自动进入烧录模式，得手动在 IDE 显示"Connecting......"的时候按下（或点一下）IO0。如果错过了这个时间窗口，上传就会超时失败，再来一次就好。算是 ESP32 的经典小坑。

# 结果

串口监视器持续显示：

```
ESP32 OK
ESP32 OK
ESP32 OK
```

一切正常。板子能吃进程序，程序能跑起来，输出也能看到。可以往下走了。
