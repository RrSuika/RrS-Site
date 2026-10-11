---
title: ESP32 + WiFi LED 亮度控制
date: 2026-08-04
description: 由 ESP32 自己提供的网页，通过 8 位 PWM 控制板载 LED，局域网里任何设备都能调亮度。

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

# 目的

想法很简单：用手机控制一颗 LED。不用蓝牙、不装 App，只要 ESP32 自己跑一个网页，家里 WiFi 下的任何设备打开浏览器就能用。页面上一个滑块，拖动的时候 LED 实时跟着变。这么一个小东西把 WiFi、HTTP、PWM 三样都串了一遍，所以我拿它当练习。

这套东西里，ESP32 既是 WiFi 客户端，也是网页服务器。

# 硬件

- ESP32-WROOM-32 开发板
- 内置 LED（GPIO 2）
- USB 数据线

先用板载 LED，是为了把元件数量压到零：不用面包板、不用外接元件，一块开发板加一根 USB 线就够。板载 LED 接在 GPIO 2 上，限流电阻已经串好了，所以写代码之前，硬件这边没有什么可以搞错的。

# 软件

环境：Arduino IDE + ESP32 Arduino Core。

```cpp
#include <WiFi.h>
#include <WebServer.h>
```

两个库都是 Core 自带的，不用额外装。`WiFi.h` 管连接，`WebServer.h` 提供一个轻量 HTTP 服务器，这个项目要的就是这些。

# 实现过程

## WiFi 网页服务器

ESP32 连上我家的 WiFi，然后提供一个控制页面。<br>
同一网络下的设备打开分配给它的 IP 就能访问，比如 http://192.168.x.x/。

这是 ESP32 我最喜欢的一点。几行代码就能起一个网页服务器，局域网里任何设备都能访问到它。不用配路由器、不用端口转发，就是一个本地地址。

## PWM 亮度控制

亮度走 8 位 PWM，0–255 对应 0%–100%。<br>
滑块每移动一次就发一条 HTTP 请求改变占空比：

浏览器 → /set?value=亮度值 → ESP32 PWM 输出

选 8 位是因为它跟 `ledcWrite` 的取值范围、以及滑块的 `min`/`max` 属性刚好对上。网页用 `fetch()` 在滑块移动时向 `/set?value=128` 发一个 GET，ESP32 解析出数值写进 PWM 通道。5000 Hz 下人眼看不到闪烁。

# 测试步骤

1. 把程序上传到 ESP32。
2. 打开串口监视器，记下连接后显示的 IP 地址。
3. 在浏览器里访问这个 IP。
4. 拖动滑块，观察 LED 亮度变化。

# 结果

ESP32 连接网络、提供网页界面、接收 HTTP 亮度值并通过 PWM 驱动 LED。整条链路从硬件到网络、到界面、再到实际输出都是通的，往上再加功能，底子已经打好了。

大概 160 行代码就能得到一个能用网页控制的灯。WiFi、网页服务器加 PWM 这个组合，可以直接搬去控制电机转速、舵机角度，或者通过 MOSFET 驱动大功率灯带。

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
