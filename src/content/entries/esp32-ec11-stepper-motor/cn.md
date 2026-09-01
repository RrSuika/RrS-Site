---
title: ESP32 + EC11 旋转编码器 + 步进电机控制
date: 2026-08-02
description: 嵌入式运动控制;EC11 编码器、DM430 驱动器、步进电机、WiFi WebSocket 仪表盘。

type: lab
category: 嵌入式系统
cover: cover.png

tags:
  - ESP32
  - WiFi
  - EC11 Encoder
  - 步进电机
  - DM430
  - FreeRTOS
  - 运动控制
  - Web Server

tools:
  - ESP32
  - EC11 旋转编码器 ×2
  - SH1106 OLED ×2
  - DM430 步进驱动器
  - 42BL40 步进电机
  - FreeRTOS

featured: true

lang: zh

translationKey: esp32-ec11-stepper-motor
---

# 项目简介

上一个编码器 + OLED 原型，这次正式升级成了真正的运动控制平台。我把 DM430 步进驱动器和 42BL40 电机搬上了工作台，全部接到 ESP32 上，从头写了固件。系统现在能完成：

1. **双 EC11 编码器输入**;方向检测、增量计数、按键切换模式。
2. **双 OLED 显示控制**;两块 SH1106 并联在同一根 I2C 总线上，实时显示角度、步数、速度和当前模式。
3. **DM430 步进电机驱动**;GPIO4/5 输出 STEP/DIR 脉冲，42BL40 设置为 1600 微步/转。驱动器的电流和细分参数是反复试出来的。
4. **WiFi WebSocket 仪表盘**;实时控制页面，自动重连和心跳，跟 OLED 显示的内容同步。
5. **FreeRTOS 多任务架构**;编码器任务、电机任务、OLED 任务全部跑在 Core 1，互斥锁保护共享数据。

# 系统架构

```
                    ESP32
               ┌──────────────┐
    Core 0     │ AsyncWebSvr  │  WiFi + WebSocket
               └──────────────┘
               ┌──────────────┐
    Core 1     │ Encoder Task │  旋钮输入
               │ Motor Task   │  DM430 脉冲
               │ OLED Task    │  显示刷新
               └──────────────┘
                        │
                   STEP / DIR
                        │
                  ┌─────────┐
                  │  DM430  │  24V 供电
                  └─────────┘
                        │
                  ┌─────────┐
                  │ 42BL40  │  步进电机
                  └─────────┘
```

# 双模式控制

我想用两种完全不同的方式来操控电机，所以都做了：

- **MANUAL 模式：** 拧旋钮，电机跟着一步一步走。EC11 每跳一格，电机移动 20 步（可配置）。这就是直接位置控制;适合精确点动和对位操作。
- **AUTO 模式：** 旋钮改成控制速度。转动旋钮调节步进速率，范围 -5000 到 +5000 步/秒，编码器每格改变 50 步/秒。电机会持续转。负速度 = 反转方向。这个模式适合扫一遍运动范围或者测试速度上限。

按下任意编码器的按钮切换模式。切换时固件会把目标位置同步到当前位置，防止电机突然跳变;这一点是吃了亏才学会的，早期测试时电机直接撞到了限位块上。

# 硬件接线

## 引脚 — 模块 1（编码器 + OLED）

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

## 引脚 — 模块 2（编码器 + OLED）

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

## 引脚 — DM430 步进驱动器 → ESP32

| DM430 端 | ESP32 引脚 | 功能         |
| -------- | ---------- | ------------ |
| PUL+     | GPIO4      | STEP 脉冲    |
| DIR+     | GPIO5      | 方向信号     |
| ENA+     | GPIO13     | 使能（可选） |
| PUL-     | GND        | —            |
| DIR-     | GND        | —            |
| ENA-     | GND        | —            |

## DM430 → 42BL40 步进电机

| DM430 | 电机线   |
| ----- | -------- |
| A+    | A+（黑） |
| A-    | A-（绿） |
| B+    | B+（红） |
| B-    | B-（蓝） |

## 供电

| 设备    | 电压 | 来源       |
| ------- | ---- | ---------- |
| ESP32   | 5V   | USB        |
| OLED ×2 | 3.3V | ESP32      |
| EC11 ×2 | 3.3V | ESP32      |
| DM430   | 24V  | 外接电源   |
| 42BL40  | —    | DM430 输出 |

# 调试过程

让步进电机转起来听着简单，直到你盯着纹丝不动的电机轴和驱动器上亮着红灯的 FLT 指示灯时才发现事情没那么容易。以下是踩过的坑和解决方法：

| 问题                 | 原因                  | 解决                                               |
| -------------------- | --------------------- | -------------------------------------------------- |
| OLED 仅显示一条横线  | SH1106 初始化参数错误 | `display.begin(0x3C, true)`;`true` 触发硬件复位    |
| 电机不转             | ENA 信号逻辑反了      | 索性断开 ENA，只用 STEP+DIR 就能正常控制           |
| DM430 红灯报警 (FLT) | PA 电流参数设置错误   | 重新调整驱动器 DIP 开关匹配 42BL40 额定电流        |
| 电机转速过慢         | 每格步数太保守        | 把代码里的速度因子从初始保守值调高到实际跟手的程度 |

ENA 引脚是最让人头大的。DM430 的使能逻辑取决于你怎么接光耦输入端;把 ENA+ 拉高并没有像我预期那样启用驱动器。最后干脆不接了，驱动器默认就是使能状态，做个原型够用了。

# 完整代码

```cpp
#include <WiFi.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>
#include <ESP32Encoder.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>

//================================================
// WiFi
//================================================
const char* ssid = "YOUR_WIFI_USERNAME_HERE";
const char* password = "YOUR_WIFI_PASSWORD_HERE";

//================================================
// Web 服务
//================================================
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

//================================================
// OLED 显示屏
//================================================
Adafruit_SH1106G display(128, 64, &Wire);

//================================================
// 编码器
//================================================
ESP32Encoder encoder1;
ESP32Encoder encoder2;

//================================================
// 模块 1
//================================================
#define ENCODER_SPEED 20          // 手动模式每格步数

#define ENC1_A 32
#define ENC1_B 33

#define PSH1 25
#define BAK1 26
#define CON1 27

//================================================
// 模块 2
//================================================
#define ENC2_A 16
#define ENC2_B 17

#define PSH2 18
#define BAK2 19
#define CON2 23

//================================================
// DM430 步进驱动器
//================================================
#define STEP_PIN 4
#define DIR_PIN 5
#define EN_PIN 13

//================================================
// 步进电机参数
//================================================
#define MICROSTEP 1600
#define STEP_PER_REV MICROSTEP

volatile long targetStep = 0;
volatile long currentStep = 0;
float currentAngle = 0;

//=====================================
// 控制模式
//=====================================
enum ControlMode {
    MANUAL,
    AUTO
};
volatile ControlMode mode = MANUAL;

// 自动模式目标速度（步/秒）
volatile int autoSpeed = 0;               // 实际速度值
#define AUTO_SPEED_MIN  -5000
#define AUTO_SPEED_MAX   5000
#define AUTO_SPEED_STEP  50               // 编码器每格改变 50 步/秒

// 自动模式方向（暂时不用，可忽略）
volatile int autoDirection = 1;

//================================================
// 按钮结构体
//================================================
struct Button {
    int pin;
    bool lastState;
    bool pressed;
};

Button btnPSH1;
Button btnPSH2;

//================================================
// 互斥锁（保护共享变量）
//================================================
SemaphoreHandle_t motorMutex;

//================================================
// WebSocket 与心跳
//================================================
String lastJson = "";
unsigned long lastHeartbeat = 0;

//================================================
// HTML 页面（PROGMEM）
//================================================
const char webpage[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{background:#111;color:white;font-family:Arial;text-align:center;}
.card{background:#222;padding:20px;border-radius:20px;margin:20px;}
.value{font-size:50px;color:#00ffaa;}
.small{font-size:20px;color:#aaaaaa;}
</style>
</head>
<body>
<h1>ESP32 步进控制器</h1>
<div class="card">
<div id="angle" class="value">0°</div>
<div id="step" class="small">0 步</div>
<div id="mode" class="small">MANUAL</div>
<div id="speed" class="small">速度:0</div>
</div>
<script>
function connectWS(){
  let socket = new WebSocket("ws://"+location.host+"/ws");
  socket.onmessage = function(event){
    let data = JSON.parse(event.data);
    if(data.type=="heartbeat") return;
    document.getElementById("angle").innerHTML = data.angle+"°";
    document.getElementById("step").innerHTML = data.step+" 步";
    document.getElementById("mode").innerHTML = data.mode;
    document.getElementById("speed").innerHTML = "速度:"+data.speed;
  };
  socket.onclose=function(){ setTimeout(connectWS,1000); };
  socket.onerror=function(){ socket.close(); };
}
connectWS();
</script>
</body>
</html>
)rawliteral";

//================================================
// 按钮初始化与扫描
//================================================
void initButton(Button& btn, int pin) {
    btn.pin = pin;
    btn.lastState = HIGH;
    btn.pressed = false;
    pinMode(pin, INPUT_PULLUP);
}

void scanButton(Button& btn) {
    bool cur = digitalRead(btn.pin);
    btn.pressed = (cur == LOW && btn.lastState == HIGH);
    btn.lastState = cur;
}

//================================================
// WebSocket
//================================================
void sendHeartbeat() {
    ws.textAll("{\"type\":\"heartbeat\"}");
}

void broadcastData() {
    char buf[128];
    snprintf(buf, sizeof(buf),
        "{\"angle\":%.1f,"
        "\"step\":%ld,"
        "\"speed\":%d,"
        "\"mode\":\"%s\"}",
        currentAngle,
        currentStep,
        autoSpeed,
        mode == MANUAL ? "MANUAL" : "AUTO");

    if (lastJson != String(buf)) {
        lastJson = String(buf);
        ws.textAll(buf);
    }
}

void onWsEvent(AsyncWebSocket *server, AsyncWebSocketClient *client,
               AwsEventType type, void *arg, uint8_t *data, size_t len) {
    if (type == WS_EVT_CONNECT) {
        broadcastData();
    }
}

//================================================
// 步进脉冲（单脉冲）
//================================================
void pulseMotor(int dir) {
    digitalWrite(DIR_PIN, dir > 0);
    digitalWrite(STEP_PIN, HIGH);
    delayMicroseconds(5);
    digitalWrite(STEP_PIN, LOW);
    delayMicroseconds(5);
}

//================================================
// 编码器任务
//================================================
void encoderTask(void *pv) {
    ESP32Encoder::useInternalWeakPullResistors = puType::up;

    encoder1.attachHalfQuad(ENC1_A, ENC1_B);
    encoder2.attachHalfQuad(ENC2_A, ENC2_B);

    encoder1.clearCount();
    encoder2.clearCount();

    initButton(btnPSH1, PSH1);
    initButton(btnPSH2, PSH2);

    long old1 = 0;
    long old2 = 0;

    // 记录上一次模式，用于检测模式切换
    ControlMode lastMode = MANUAL;

    while (true) {
        // 读取编码器增量
        long c1 = encoder1.getCount();
        long c2 = encoder2.getCount();
        long delta1 = c1 - old1;
        long delta2 = c2 - old2;

        // 根据当前模式处理编码器输入
        xSemaphoreTake(motorMutex, portMAX_DELAY);   // 保护共享变量

        if (mode == MANUAL) {
            // 手动模式：直接改变目标步数
            if (delta1 != 0) {
                targetStep += delta1 * ENCODER_SPEED;
                old1 = c1;
            }
            if (delta2 != 0) {
                targetStep += delta2 * ENCODER_SPEED;
                old2 = c2;
            }
        } else { // 自动模式
            // 自动模式：调整速度值
            if (delta1 != 0) {
                autoSpeed += delta1 * AUTO_SPEED_STEP;
                autoSpeed = constrain(autoSpeed, AUTO_SPEED_MIN, AUTO_SPEED_MAX);
                old1 = c1;
            }
            if (delta2 != 0) {
                autoSpeed += delta2 * AUTO_SPEED_STEP;
                autoSpeed = constrain(autoSpeed, AUTO_SPEED_MIN, AUTO_SPEED_MAX);
                old2 = c2;
            }
        }

        // 检测模式是否刚刚发生了切换
        if (lastMode != mode) {
            if (mode == MANUAL) {
                // 切回手动时：清零编码器硬件计数，消除历史增量
                encoder1.clearCount();
                encoder2.clearCount();
                old1 = 0;
                old2 = 0;
                // 将目标步数同步到当前实际位置，防止突变
                targetStep = currentStep;
            } else { // 进入自动模式
                // 进入自动时也将目标同步，且速度归零
                targetStep = currentStep;
                autoSpeed = 0;
            }
            lastMode = mode;
        }

        xSemaphoreGive(motorMutex);

        // 扫描按钮（切换模式）
        scanButton(btnPSH1);
        if (btnPSH1.pressed) {
            xSemaphoreTake(motorMutex, portMAX_DELAY);
            if (mode == MANUAL) {
                mode = AUTO;
                autoSpeed = 0;
                targetStep = currentStep;   // 同步位置
            } else {
                mode = MANUAL;
                autoSpeed = 0;
                targetStep = currentStep;
                // 编码器计数清零将在下次循环的 mode 变化检测中处理
            }
            xSemaphoreGive(motorMutex);
        }

        scanButton(btnPSH2);
        if (btnPSH2.pressed) {
            xSemaphoreTake(motorMutex, portMAX_DELAY);
            if (mode == MANUAL) {
                mode = AUTO;
                autoSpeed = 0;
                targetStep = currentStep;
            } else {
                mode = MANUAL;
                autoSpeed = 0;
                targetStep = currentStep;
            }
            xSemaphoreGive(motorMutex);
        }

        vTaskDelay(pdMS_TO_TICKS(2));
    }
}

//================================================
// 电机任务
//================================================
void motorTask(void *pv) {
    unsigned long lastSend = 0;
    unsigned long lastPulseTime = 0;   // 用于自动模式定时脉冲

    while (true) {
        bool pulseSent = false;   // 标记本次循环是否发送了脉冲

        // 根据模式产生运动
        xSemaphoreTake(motorMutex, portMAX_DELAY);

        if (mode == MANUAL) {
            if (currentStep < targetStep) {
                pulseMotor(1);
                currentStep++;
                pulseSent = true;
            } else if (currentStep > targetStep) {
                pulseMotor(-1);
                currentStep--;
                pulseSent = true;
            }
            if (!pulseSent) lastPulseTime = micros();  // 重置计时器
        } else { // 自动模式
            if (autoSpeed != 0) {
                unsigned long now = micros();
                unsigned long interval = (1000000UL / abs(autoSpeed));
                if (interval < 50) interval = 50;
                if (now - lastPulseTime >= interval) {
                    int dir = (autoSpeed > 0) ? 1 : -1;
                    pulseMotor(dir);
                    currentStep += dir;
                    lastPulseTime = now;
                    pulseSent = true;
                }
            } else {
                lastPulseTime = micros();
            }
        }

        // 更新角度显示
        currentAngle = 360.0f * currentStep / STEP_PER_REV;

        xSemaphoreGive(motorMutex);

        if (!pulseSent) {
            vTaskDelay(pdMS_TO_TICKS(1));   // 无动作时休眠 1ms，让出 CPU
        }

        if (millis() - lastSend > 10) {
            broadcastData();
            lastSend = millis();
        }
        if (millis() - lastHeartbeat > 5000) {
            sendHeartbeat();
            lastHeartbeat = millis();
        }

        taskYIELD();
    }
}

//================================================
// OLED 显示任务
//================================================
void oledTask(void *pv) {
    while (true) {
        display.clearDisplay();
        display.setTextSize(1);
        display.setCursor(0, 0);
        display.print("MODE:");
        if (mode == MANUAL) display.println("MANUAL");
        else                 display.println("AUTO");

        display.drawLine(0, 10, 128, 10, SH110X_WHITE);

        display.setTextSize(2);
        display.setCursor(0, 18);
        display.print(currentAngle, 0);
        display.println(" D");

        display.setTextSize(1);
        display.setCursor(0, 45);
        display.print("STEP:");
        display.println(currentStep);

        display.setCursor(0, 55);
        display.print("SPD:");
        display.println(autoSpeed);

        display.display();
        vTaskDelay(pdMS_TO_TICKS(50));
    }
}

//================================================
// 初始化
//================================================
void setup() {
    Serial.begin(115200);
    motorMutex = xSemaphoreCreateMutex();

    Wire.begin(21, 22);
    display.begin(0x3C, true);
    display.clearDisplay();
    display.setTextColor(SH110X_WHITE);
    display.setTextSize(1);
    display.setCursor(0,0);
    display.println("ESP32 STEPPER");
    display.display();

    pinMode(STEP_PIN, OUTPUT);
    pinMode(DIR_PIN, OUTPUT);
    pinMode(EN_PIN, OUTPUT);
    digitalWrite(EN_PIN, HIGH);   // 使能（视驱动而定，可能需要 LOW 使能）

    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(300);
        Serial.print(".");
    }
    Serial.println();
    Serial.println(WiFi.localIP());

    ws.onEvent(onWsEvent);
    server.addHandler(&ws);
    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
        request->send(200, "text/html", webpage);
    });
    server.begin();

    // 创建任务（均绑定到核心 1，利用互斥锁同步）
    xTaskCreatePinnedToCore(encoderTask, "ENCODER", 4096, NULL, 5, NULL, 1);
    xTaskCreatePinnedToCore(motorTask,   "MOTOR",   4096, NULL, 4, NULL, 1);
    xTaskCreatePinnedToCore(oledTask,    "OLED",    4096, NULL, 3, NULL, 1);
}

void loop() {
    delay(1000);
}
```

# 结果

这个项目确实折腾了不少;步进驱动器各有各的脾气;但最终全部跑通了：

- 双路 EC11 编码器输入稳定，模式切换逻辑（带位置同步）保证 MANUAL 和 AUTO 之间切换时电机不会跳变。
- 双 OLED 同步显示角度、步数、速度和模式;I2C 共享总线在这个刷新率下完全没问题。
- WebSocket 仪表盘实时镜像 OLED 数据，常规心跳和自动重连都在。
- DM430 驱动 42BL40 在 1600 微步/转下运行平滑。某些速度段电机会有点啸叫，但这只是步进电机的谐波问题;微调细分参数应该能消除。
- FreeRTOS 调度稳定：1000 Hz 的编码器任务、脉冲生成的电机任务、10 Hz OLED 刷新任务全部共存于 Core 1，互不抢占。

这个项目已经从"软件能不能跑"进化到了"实际可用的运动控制平台"。下一轮升级计划：加 TCA9548A I2C 多路复用器支持四路独立 OLED（避免地址冲突），基于电机位置的 HSV 灯光控制，以及最终在电机轴上装编码器实现闭环反馈。
