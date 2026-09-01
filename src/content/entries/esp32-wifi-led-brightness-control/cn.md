---
title: ESP32 WiFi LED 亮度控制
date: 2026-08-04
description: 使用 ESP32 WiFi 网页服务器和 PWM，通过浏览器控制内置 LED 亮度。

type: lab
category: 嵌入式系统
cover: cover.png

tags:
  - ESP32
  - WiFi
  - PWM
  - Web Server

tools:
  - ESP32
  - Arduino IDE
  - NeoPixelBus

featured: true

lang: zh

translationKey: esp32-wifi-led-brightness-control
---

# 概述

想法很简单：用手机控制一颗 LED。不搞蓝牙、不装 App;就用 ESP32 自己跑一个网页，家里 WiFi 下的任何设备打开浏览器就能用。页面上放个滑块，拖动的时候 LED 亮度跟着实时变化。做下来发现这其实是个挺好的小练习，把 WiFi、HTTP 和 PWM 这三样 IoT 项目里绕不开的东西串在了一起。

# 系统架构

ESP32 既当 WiFi 客户端，又当 Web 服务器。

# 硬件

- ESP32-WROOM-32 开发板
- 内置 LED（GPIO 2）
- USB 数据线

先用板载 LED 试试手。不用面包板、不用外接元件;一块开发板加一根 USB 线就够。板载 LED 接在 GPIO 2 上，已经串好了限流电阻，直接写代码就能亮，省心。

# 软件

开发环境：Arduino IDE，需安装 ESP32 Arduino 核心支持包。

用到的库：

```cpp
#include <WiFi.h>
#include <WebServer.h>
```

两个库都是 ESP32 Arduino Core 自带的，不用额外装任何东西。`WiFi.h` 管网络连接，`WebServer.h` 提供一个轻量级的 HTTP 服务器，做这种小项目刚刚好。

# 实现过程

## WiFi 网页服务器

ESP32 连接到本地 WiFi 后，会提供一个控制页面。
同一网络下的设备可以通过分配的 IP 地址（例如 http://192.168.x.x/）访问该页面。

这是 ESP32 让我最喜欢的一点;几行代码就能起一个 Web 服务器，然后局域网里任何设备都能访问到它。不用配路由器、不用端口转发，就是一个本地 IP 地址，直接打开就行。

## PWM 亮度控制

亮度控制采用 8 位分辨率的 PWM（0–255 对应 0%–100%）。
网页上的滑块会发送 HTTP 请求来改变占空比：

浏览器 → /set?value=亮度值 → ESP32 PWM 输出

选 8 位分辨率是因为它跟 `ledcWrite` 的取值范围刚好对上，滑块的 `min`/`max` 也能直接设成 0 和 255。网页端用 `fetch()` 在滑块每次移动时发一个 GET 请求到 `/set?value=128`，ESP32 收到后把数值解析出来写到 PWM 通道。5000 Hz 的频率下人眼完全看不到闪烁，很顺滑。

# 测试步骤

将程序上传到 ESP32。

打开串口监视器，记下连接后显示的 IP 地址。

在浏览器中访问该 IP 地址。

拖动滑块，观察 LED 的亮度变化。

# 结果

ESP32 成功连接网络、提供网页界面、接收 HTTP 亮度值并通过 PWM 驱动 LED。整个链路;硬件，网络，界面，物理输出;按预期工作。之后再往上加交互性更强的 IoT 功能，底子就算打好了。

这属于那种投入产出比特别舒服的小项目。大概 160 行代码就搞出一个能用的网页调光灯。WiFi + Web 服务器 + PWM 这个模式也很容易扩展;换成舵机就是角度控制，换成 MOSFET 就能驱动大功率灯带了。

# 完整代码

```cpp
#include <WiFi.h>
#include <WebServer.h>

// 请替换为你自己的 WiFi 名称和密码
const char* ssid = "YOUR_WIFI_USERNAME_HERE";
const char* password = "YOUR_WIFI_PASSWORD_HERE";

WebServer server(80);

// LED 引脚
#define LED_PIN 2

// PWM 设置
#define PWM_CHANNEL 0
#define PWM_FREQ 5000
#define PWM_RESOLUTION 8   // 8 位分辨率 = 0–255

void setup() {
  Serial.begin(115200);

  // 配置 PWM
  ledcAttach(LED_PIN, PWM_FREQ, PWM_RESOLUTION);

  // 初始亮度 50%
  ledcWrite(PWM_CHANNEL, 128);

  // 连接 WiFi
  WiFi.begin(ssid, password);
  Serial.print("正在连接 WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("WiFi 已连接");
  Serial.print("IP 地址：");
  Serial.println(WiFi.localIP());

  // 主页
  server.on("/", []() {
    String html = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>ESP32 LED 控制</title>
<style>
body { text-align: center; font-family: Arial; }
input { width: 80%; }
</style>
</head>
<body>
<h1>ESP32 LED 控制</h1>
<h2>亮度调节</h2>
<input type="range" min="0" max="255" value="128" id="brightness"
       oninput="changeBrightness(this.value)">
<p>当前亮度：<span id="value">128</span></p>
<script>
function changeBrightness(value) {
  document.getElementById("value").innerHTML = value;
  fetch("/set?value=" + value);
}
</script>
</body>
</html>
    )rawliteral";
    server.send(200, "text/html;charset=utf-8", html);
  });

  // 接收网页亮度数据
  server.on("/set", []() {
    if (server.hasArg("value")) {
      int brightness = server.arg("value").toInt();
      // 输出 PWM 信号
      ledcWrite(LED_PIN, brightness);
      Serial.print("亮度：");
      Serial.println(brightness);
    }
    server.send(200, "text/plain", "OK");
  });

  server.begin();
  Serial.println("Web 服务器已启动");
}

void loop() {
  server.handleClient();
}
```
