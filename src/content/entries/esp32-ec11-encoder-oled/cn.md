---
title: ESP32 + EC11 旋转编码器 + OLED 角度反馈
date: 2026-08-02
description: 双 EC11 旋转编码器 + OLED 显示 + WiFi WebSocket 实时角度反馈。

type: lab
category: 嵌入式系统
cover: 01-setup.png

tags:
  - ESP32
  - WiFi
  - EC11 Encoder
  - OLED
  - FreeRTOS
  - Web Server

tools:
  - ESP32
  - EC11 旋转编码器 ×2
  - SH1106 1.3寸 OLED
  - FreeRTOS
  - AsyncWebServer

featured: true

lang: zh

translationKey: esp32-ec11-encoder-oled
---

![硬件接线](./01-setup.png)

# 项目目标

这是走向完整电机控制平台的第一块砖。在把步进电机和驱动器搬上工作台之前，我得先确认 ESP32 能不能同时处理好几个任务而不翻车。所以我搭了一个测试平台来验证：

1. **双 EC11 旋转编码器输入**;两路编码器同时读取，支持正反转检测、增量计数和按键去抖。不能丢步。
2. **SH1106 OLED 显示**;两块 OLED 共享同一根 I2C 总线（0x3C），10 Hz 刷新角度数据，不闪屏、不抢总线。
3. **WiFi WebSocket 服务器**;浏览器端仪表盘实时显示两路角度。这种低延迟 UI 用 WebSocket 比轮询强太多了，我还加了心跳包防止连接超时断开。
4. **FreeRTOS 多任务架构**;三个任务钉在 Core 1：编码器任务 1000 Hz、电机任务 100 Hz、OLED 任务 10 Hz。Core 0 跑 web server。用互斥锁保护 motor 结构体的共享状态。

目的是验证这套软件架构在并发负载下能不能稳住，之后再接真正的电机。

# 系统架构

```
                 ESP32
            ┌───────────────┐
 Core 0     │ WebServer     │
            │ WebSocket     │
            └───────────────┘
            ┌───────────────┐
 Core 1     │ Encoder Task  │ 1000 Hz
            │ Motor Task    │  100 Hz
            │ OLED Task     │   10 Hz
            └───────────────┘
```

# 引脚定义

## 模块 1 — 编码器 + OLED

| 信号 | ESP32 引脚 | 功能             |
| ---- | ---------- | ---------------- |
| SDA  | GPIO21     | I²C 数据         |
| SCL  | GPIO22     | I²C 时钟         |
| VCC  | 3.3V       | 供电             |
| GND  | GND        | 接地             |
| TRA  | GPIO32     | 编码器 A（旋转） |
| TRB  | GPIO33     | 编码器 B（旋转） |
| PSH  | GPIO25     | 按压按钮         |
| BAK  | GPIO26     | 返回按钮         |
| CON  | GPIO27     | 确认按钮         |

## 模块 2 — 编码器 + OLED

| 信号 | ESP32 引脚 | 功能                 |
| ---- | ---------- | -------------------- |
| SDA  | GPIO21     | I²C 数据（共享总线） |
| SCL  | GPIO22     | I²C 时钟（共享总线） |
| VCC  | 3.3V       | 供电                 |
| GND  | GND        | 接地                 |
| TRA  | GPIO16     | 编码器 A（旋转）     |
| TRB  | GPIO17     | 编码器 B（旋转）     |
| PSH  | GPIO18     | 按压按钮             |
| BAK  | GPIO19     | 返回按钮             |
| CON  | GPIO23     | 确认按钮             |

> 两个 OLED 模块共享同一 I²C 总线（GPIO21/22）。每个模块的按钮和编码器使用独立 GPIO。

# 网页界面

![网页显示](./02-web-display.png)

浏览器走 WebSocket 连接，实时显示两路编码器角度，肉眼感知不到延迟。JS 重连逻辑处理 WiFi 断线也还算优雅;ESP32 掉线的话，页面会安静地每 2 秒重试一次，直到恢复。

有个小优化我挺满意：Motor Task 只在角度实际变化时才发数据，而且限制了最低 50ms 的发送间隔。不加这个限流的话，旋转编码器每跳一个 tick 就发一帧 WebSocket，快速旋转时能把浏览器淹了。

# OLED 显示

OLED 屏幕显示：

- 当前模式指示（根据状态显示 `[>]` 或 `[||]`）
- 顶部一条来回跑的小动画条;没啥实际用途，但看着挺解压
- Motor 1 和 Motor 2 的角度值

# 完整代码

```cpp
#include <WiFi.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>
#include <ESP32Encoder.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>

//==============================
// WiFi
//==============================
const char* ssid = "YOUR_WIFI_USERNAME_HERE";
const char* password = "YOUR_WIFI_PASSWORD_HERE";

//==============================
// WebSocket 与 AsyncWebServer
//==============================
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

//==============================
// OLED
//==============================
Adafruit_SH1106G display(128, 64, &Wire);

//==============================
// 编码器
//==============================
ESP32Encoder encoder1;
ESP32Encoder encoder2;

//==============================
// 引脚
//==============================
#define ENC1_A 32
#define ENC1_B 33
#define PSH1   25
#define BAK1   26
#define CON1   27

#define ENC2_A 16
#define ENC2_B 17
#define PSH2   18
#define BAK2   19
#define CON2   23

//==============================
// 电机与动画
//==============================
struct Motor {
  long count;               // 用互斥锁保护
  float targetAngle;
  float currentAngle;
};
Motor motor1, motor2;

volatile bool animationRunning = true;
int animationFrame = 0;

struct Button {
  int pin;
  bool lastState;
  bool pressed;
};
Button btnPSH1, btnBAK1, btnCON1;
Button btnPSH2, btnBAK2, btnCON2;

//==============================
// 同步
//==============================
SemaphoreHandle_t motorMutex;

// WebSocket 发送缓存
String lastSentJson = "";
unsigned long lastHeartbeat = 0;

//==============================
// HTML（自动重连与心跳）
//==============================
const char webpage[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{background:#111;color:white;font-family:Arial;text-align:center;}
.card{background:#222;border-radius:20px;padding:20px;margin:20px;}
.value{font-size:50px;color:#00ffaa;}
</style>
</head>
<body>
<h1>ESP32 电机控制器</h1>
<div class="card"><h2>电机 1</h2><div id="m1" class="value">0°</div></div>
<div class="card"><h2>电机 2</h2><div id="m2" class="value">0°</div></div>
<script>
function connectWS() {
  var socket = new WebSocket('ws://' + location.host + '/ws');
  socket.onmessage = function(event) {
    var data = JSON.parse(event.data);
    if (data.type === 'heartbeat') return; // 忽略心跳包
    document.getElementById("m1").innerHTML = data.m1 + "°";
    document.getElementById("m2").innerHTML = data.m2 + "°";
  };
  socket.onclose = function() {
    console.log('WebSocket 已关闭，2 秒后重连');
    setTimeout(connectWS, 2000);
  };
  socket.onerror = function(err) {
    console.log('WebSocket 错误', err);
    socket.close();
  };
}
connectWS();
</script>
</body>
</html>
)rawliteral";

//==============================
// 按钮辅助函数
//==============================
void initButton(Button &btn, int pin) {
  btn.pin = pin;
  btn.lastState = HIGH;
  btn.pressed = false;
  pinMode(pin, INPUT_PULLUP);
}

void scanButton(Button &btn) {
  bool cur = digitalRead(btn.pin);
  btn.pressed = (cur == LOW && btn.lastState == HIGH);
  btn.lastState = cur;
}

//==============================
// WebSocket 事件
//==============================
void onWsEvent(AsyncWebSocket *server, AsyncWebSocketClient *client,
               AwsEventType type, void *arg, uint8_t *data, size_t len) {
  if (type == WS_EVT_CONNECT) {
    Serial.println("WS client connected");
    // 发送当前角度
    xSemaphoreTake(motorMutex, portMAX_DELAY);
    float a1 = motor1.currentAngle;
    float a2 = motor2.currentAngle;
    xSemaphoreGive(motorMutex);
    char buf[64];
    snprintf(buf, sizeof(buf), "{\"m1\":%.0f,\"m2\":%.0f}", a1, a2);
    client->text(buf);
  }
}

// 广播消息（数据变化时调用）
void broadcastData(float m1, float m2) {
  char buf[64];
  snprintf(buf, sizeof(buf), "{\"m1\":%.0f,\"m2\":%.0f}", m1, m2);
  // 使用 strcmp 比较字符串内容
  if (strcmp(buf, lastSentJson.c_str()) != 0) {
    lastSentJson = buf;          // 更新缓存
    ws.textAll(buf);
  }
}

// 发送心跳（保持连接）
void sendHeartbeat() {
  ws.textAll("{\"type\":\"heartbeat\"}");
}

//==============================
// 编码器任务（1000 Hz）
//==============================
void encoderTask(void *pv) {
  ESP32Encoder::useInternalWeakPullResistors = puType::up;
  encoder1.attachHalfQuad(ENC1_A, ENC1_B);
  encoder2.attachHalfQuad(ENC2_A, ENC2_B);
  encoder1.clearCount();
  encoder2.clearCount();

  initButton(btnPSH1, PSH1); initButton(btnBAK1, BAK1); initButton(btnCON1, CON1);
  initButton(btnPSH2, PSH2); initButton(btnBAK2, BAK2); initButton(btnCON2, CON2);

  while (true) {
    long c1 = encoder1.getCount();
    long c2 = encoder2.getCount();

    xSemaphoreTake(motorMutex, portMAX_DELAY);
    motor1.count = c1;
    motor2.count = c2;
    motor1.targetAngle = c1 * 18;
    motor2.targetAngle = c2 * 18;
    xSemaphoreGive(motorMutex);

    // 按钮控制动画
    scanButton(btnPSH1); if(btnPSH1.pressed) animationRunning = !animationRunning;
    scanButton(btnBAK1); if(btnBAK1.pressed) animationRunning = false;
    scanButton(btnCON1); if(btnCON1.pressed) animationRunning = true;
    scanButton(btnPSH2); if(btnPSH2.pressed) animationRunning = !animationRunning;
    scanButton(btnBAK2); if(btnBAK2.pressed) animationRunning = false;
    scanButton(btnCON2); if(btnCON2.pressed) animationRunning = true;

    vTaskDelay(pdMS_TO_TICKS(5));
  }
}

//==============================
// 电机任务（500 Hz）+ 推送 + 心跳
//==============================
void motorTask(void *pv) {
  float lastM1 = 0, lastM2 = 0;
  unsigned long lastSend = 0;                 // 上次推送时间
  const unsigned long sendInterval = 50;      // 最小推送间隔 50ms（20Hz）

  while (true) {
    xSemaphoreTake(motorMutex, portMAX_DELAY);

    // 获取当前值与目标值
    float cur1 = motor1.currentAngle;
    float cur2 = motor2.currentAngle;
    float tar1 = motor1.targetAngle;
    float tar2 = motor2.targetAngle;

    // 角度平滑跟随
    if (cur1 < tar1) cur1 += 1.0f;
    else if (cur1 > tar1) cur1 -= 1.0f;

    if (cur2 < tar2) cur2 += 1.0f;
    else if (cur2 > tar2) cur2 -= 1.0f;

    motor1.currentAngle = cur1;
    motor2.currentAngle = cur2;

    xSemaphoreGive(motorMutex);

    // 数值变化且间隔足够时才发送
    if ((cur1 != lastM1 || cur2 != lastM2) &&
        (millis() - lastSend >= sendInterval)) {
      broadcastData(cur1, cur2);
      lastSend = millis();
      lastM1 = cur1;
      lastM2 = cur2;
    }

    // 每 5 秒发送心跳
    if (millis() - lastHeartbeat > 5000) {
      sendHeartbeat();
      lastHeartbeat = millis();
    }

    vTaskDelay(pdMS_TO_TICKS(10));   // 100Hz
  }
}

//==============================
// OLED 任务（10 Hz）
//==============================
void oledTask(void *pv) {
  while (true) {
    float a1, a2;
    xSemaphoreTake(motorMutex, portMAX_DELAY);
    a1 = motor1.currentAngle;
    a2 = motor2.currentAngle;
    xSemaphoreGive(motorMutex);

    display.clearDisplay();
    display.setTextColor(SH110X_WHITE);
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print("Dual Motor ");
    display.print(animationRunning ? "[>]" : "[||]");

    if (animationRunning) {
      animationFrame++;
      if (animationFrame > 20) animationFrame = 0;
    }
    int posX = animationFrame * 6;
    if (posX > 128) posX = 0;
    display.fillRect(posX, 8, 8, 8, SH110X_WHITE);

    display.setTextSize(2);
    display.setCursor(0, 18);
    display.print("M1:"); display.print(a1, 0); display.println("D");
    display.setCursor(0, 42);
    display.print("M2:"); display.print(a2, 0); display.println("D");

    display.display();
    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

//==============================
// 初始化
//==============================
void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  display.begin(0x3C, true);
  display.clearDisplay(); display.display();

  pinMode(PSH1, INPUT_PULLUP); pinMode(BAK1, INPUT_PULLUP); pinMode(CON1, INPUT_PULLUP);
  pinMode(PSH2, INPUT_PULLUP); pinMode(BAK2, INPUT_PULLUP); pinMode(CON2, INPUT_PULLUP);

  motorMutex = xSemaphoreCreateMutex();

  WiFi.begin(ssid, password);
  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED) { delay(300); Serial.print("."); }
  Serial.println("\nIP: " + WiFi.localIP().toString());

  ws.onEvent(onWsEvent);
  server.addHandler(&ws);

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *req){
    req->send(200, "text/html", webpage);
  });
  server.begin();

  xTaskCreatePinnedToCore(encoderTask, "Enc", 4096, NULL, 5, NULL, 1);
  xTaskCreatePinnedToCore(motorTask,   "Mot", 4096, NULL, 4, NULL, 1);
  xTaskCreatePinnedToCore(oledTask,    "OLED",4096, NULL, 1, NULL, 1);
}

void loop() {
  vTaskDelay(1000);
}
```

# 结果

全部通过验证：

- 双路 EC11 编码器稳定读取，方向识别准确;转再快也没丢步。
- SH1106 OLED 10 Hz 刷新无闪烁，共享 I2C 总线带两块屏完全没问题。关键在那个 `display.begin(0x3C, true)` 调用;`true` 参数触发硬件复位，解决了 OLED 只显示一条横线的问题，当时排查了一个多小时。
- WebSocket 服务器以 50ms 节流向浏览器推送角度数据。心跳包保证即使长时间没有数据变化，连接也不会被断开。
- Core 1 上的 FreeRTOS 任务没有互相抢占;在这些频率下互斥锁的获取时间可以忽略不计。

这个原型验证了整个软件栈是可行的。下一步：接上真正的 DM430 步进驱动器，把那些虚拟的"电机"角度值换成实际的 STEP 脉冲。
