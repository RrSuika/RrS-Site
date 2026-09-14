---
title: ESP32 + A4988 24V 步进电机控制
date: 2026-09-15
description: HSV 三通道改造成通用 Rail 通道，Rail 1 通过 A4988 驱动 24V 步进电机，非阻塞控制，编码器和网页照常可用。

type: lab
category: 嵌入式系统
cover: cover.png

tags:
  - ESP32
  - WiFi
  - EC11 Encoder
  - OLED
  - 步进电机
  - A4988
  - 运动控制
  - Web Server

tools:
  - ESP32
  - A4988 步进驱动器
  - 24V 步进电机
  - SH1106 1.3寸 OLED + EC11 一体化模块 ×3
  - TCA9548A

featured: true

lang: zh

translationKey: esp32-a4988-stepper-motor
---

# 项目目标

上一套 HSV 测试这次正式毕业，转向运动控制。原来的三个 HSV 通道改成了三个通用控制通道：Rail 1、Rail 2、Rail 3，范围都是 0-100，还是各自由编码器和网页滑块驱动。变的是通道后面接的东西。Rail 1 现在通过 A4988 驱动器驱动一台 24V 供电的步进电机，而且全程非阻塞：电机在转的时候，OLED 和网页照样工作。

ESP32 到 A4988 的接线：GPIO 12 ── DIRECTION，GPIO 13 ── STEP，3.3V ── SLEEP 和 RESET，GND ── MS1、MS2、MS3 和 ENABLE。

目前只有 Rail 1 接了电机。Rail 2 和 Rail 3 留着给以后的轴。

# 硬件清单

| 组件 | 数量 | 用途 |
|---|---|---|
| ESP32 | 1 | 主控制器 |
| A4988 步进驱动器 | 1 | 步进电机驱动 |
| 24V 步进电机 | 1 | 执行机构 |
| 24V 外部电源 | 1 | 电机供电 |
| 47µF / 50V 电解电容 | 1 | VMOT 电源滤波 |
| TCA9548A | 1 | I2C 多路复用器 |
| 1.3 寸 SH1106 OLED + EC11 一体化模块 | 3 | Rail 显示与调节 |

电机单独供电，ESP32 只提供逻辑信号。

# 引脚分配

| ESP32 GPIO | 功能 |
|---|---|
| GPIO 21 | I2C SDA |
| GPIO 22 | I2C SCL |
| GPIO 25 | 编码器 1 A 相 |
| GPIO 18 | 编码器 1 B 相 |
| GPIO 26 | 编码器 2 A 相 |
| GPIO 27 | 编码器 2 B 相 |
| GPIO 4 | 编码器 3 A 相 |
| GPIO 16 | 编码器 3 B 相 |
| GPIO 12 | A4988 DIRECTION |
| GPIO 13 | A4988 STEP |

A4988 只新占两个引脚：12 号管方向，13 号管脉冲。其余引脚和 HSV 那套完全一致。

# A4988 接线

## 逻辑与控制引脚

| A4988 引脚 | 接法 | 功能 |
|---|---|---|
| DIRECTION | ESP32 GPIO 12 | 电机方向 |
| STEP | ESP32 GPIO 13 | 步进脉冲 |
| SLEEP | 3.3V | 保持驱动器唤醒 |
| RESET | 3.3V | 解除复位 |
| MS1 | GND | 整步模式 |
| MS2 | GND | 整步模式 |
| MS3 | GND | 整步模式 |
| ENABLE | GND | 驱动器常使能 |

## 供电

A4988 有两个电源域。VDD 接 ESP32 的 3.3V，给逻辑部分供电。VMOT 接外部 24V，给电机部分供电。24V 的负极接 A4988 电机侧 GND，ESP32 的 GND 也接进同一个节点，这样 STEP 和 DIRECTION 信号与驱动器共参考地。

24V 电源绝不碰 ESP32 的 3.3V 或 5V 引脚。

## VMOT 电容

A4988 的 VMOT 输入端就近挂了一颗 47µF / 50V 电解电容，正极接 VMOT，负极接 GND。它给电机电源提供本地储能，压住驱动器开关动作造成的电压波动。50V 耐压对 24V 电源来说余量充足。

## 步进电机

电机四根线，两个线圈：1A/1B 接线圈 A，2A/2B 接线圈 B。线色因电机而异，可靠的办法是用万用表配对：同一个线圈的两根线之间有可测电阻，不同线圈之间是开路。

## 细分设置

第一次测试用整步，MS1/MS2/MS3 全部接地，这是故意的。整步下 STEP 脉冲和机械位移的对应关系最直观，第一次测试要的就是这个。以后需要更平滑或更精细的定位时再上细分。

# Rail 架构

原来的 HSV 变量 hVal、sVal、vVal 改成了 rail1Val、rail2Val、rail3Val。每个 Rail 范围 0-100。编码器 1 调 Rail 1，编码器 2 调 Rail 2，编码器 3 调 Rail 3；网页滑块写的是同一组值；每块 OLED 显示自己的 Rail。三个通道从此和颜色无关。

# Rail 1 与电机位置的映射

Rail 1 线性映射到目标步数：

```
Rail 1 = 0   → 0 步
Rail 1 = 10  → 100 步
Rail 1 = 50  → 500 步
Rail 1 = 100 → 1000 步
```

1000 步的上限目前只是一个测试值，不等于电机一整圈。实际转多少取决于电机的步距角和细分设置。

# 电机软件

干活的是两个引脚：STEP 和 DIRECTION。固件里维护两个位置：

```cpp
long currentStep;
long targetStep;
```

targetStep 是 Rail 1 要的位置，currentStep 是软件认为电机现在的位置。两者不一致时，控制器就发 STEP 脉冲直到追上，DIRECTION 由哪边在前决定。

步进本身是非阻塞的。主循环按顺序跑：web server → 编码器处理 → 每个间隔（1000µs）走一步 → OLED 刷新，然后循环。电机运动期间网页和另外两个编码器始终有响应。这个结构也方便以后接三个 A4988。

# 网页界面

页面概念和 HSV 那套一样，现在换成三个 Rail 滑块（0-100）。浏览器里动 Rail 1，效果和转编码器 1 一样，都是改电机目标位置。/get 端点返回当前三个 Rail 值外加 currentStep 和 targetStep，浏览器定时同步。

# 测试过程

第一轮不给满量程指令。上电后逐项确认：ESP32 启动、OLED 初始化、TCA9548A 通信、编码器输入、WiFi 连接、A4988 控制信号。然后 Rail 1 小步加：1、5、10、20、50。每一步电机都跟上了。

# 结果

测试通过。ESP32 通过 GPIO 12/13 驱动 A4988，A4988 驱动 24V 步进电机，原来的三通道界面全程正常工作。Rail 1 既能用 EC11 旋钮调，也能用网页调，数值显示在第一块 OLED 上。Rail 2 和 Rail 3 作为独立通道留在那里，给以后的电机或其他执行器用。

# 当前系统架构

ESP32 ── TCA9548A 多路复用器 ── 3 个 OLED + EC11 一体化模块；另一侧 ESP32 ── A4988 电机驱动器 ── 42 步进电机。

# 安全注意

- 电机电源和逻辑电源分开。24V 只进 A4988 的电机供电口；逻辑供电由 ESP32 提供。
- 两侧共地，STEP 和 DIRECTION 才有一个共同的参考。
- 电解电容极性接对：+ 接 VMOT，− 接 GND。50V 耐压用在 24V 电源上。
- 驱动器通电时不要插拔电机。感性负载会产生电压尖峰，可能打坏驱动器。
- 长时间运行前，先把 A4988 的电流限制调到电机的额定电流。

# 下一步

单电机测试就是三轴系统的模板：

```
Rail 1 → A4988 → 电机 1
Rail 2 → A4988 → 电机 2
Rail 3 → A4988 → 电机 3
```

三个 A4988、三台电机，软件结构不变。

# 完整代码

```cpp
/*
 * ESP32 + TCA9548A + 3× (OLED + EC11)
 * + WiFi 网页控制
 * + A4988 步进电机
 *
 * Rail 1 → A4988 → 步进电机
 * Rail 2 → 独立控制变量
 * Rail 3 → 独立控制变量
 *
 * A4988:
 * STEP      GPIO 13
 * DIRECTION GPIO 12
 * SLEEP     3.3V
 * RESET     3.3V
 * MS1       GND
 * MS2       GND
 * MS3       GND
 * ENABLE    GND
 *
 * 电机电源：
 * VMOT → 外部 24V
 * GND  → 24V电源GND
 *
 * ESP32 GND 与 24V电源GND共地
 */

#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>

// ==================== WiFi ====================
const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// ==================== I2C ====================
#define SDA_PIN 21
#define SCL_PIN 22
#define TCA_ADDR 0x70

// ==================== 三个旋转编码器 ====================
#define ENC1_A 25
#define ENC1_B 18
#define ENC2_A 26
#define ENC2_B 27
#define ENC3_A 4
#define ENC3_B 16

// ==================== A4988 ====================
#define A4988_DIR  12
#define A4988_STEP 13

// ==================== OLED ====================
Adafruit_SH1106G disp1(128, 64, &Wire, -1);
Adafruit_SH1106G disp2(128, 64, &Wire, -1);
Adafruit_SH1106G disp3(128, 64, &Wire, -1);

// ==================== Web Server ====================
WebServer server(80);

// ==================== Rail 状态 ====================
int rail1Val = 0;
int rail2Val = 0;
int rail3Val = 0;

// ==================== 编码器状态机 ====================
static const int8_t KNOB_DIR[16] = {
   0, -1,  1,  0,
   1,  0,  0, -1,
  -1,  0,  0,  1,
   0,  1, -1,  0
};

volatile uint8_t encState[3] = {0, 0, 0};
volatile int8_t  encDelta[3] = {0, 0, 0};

// ==================== A4988 电机控制 ====================
long currentStep = 0;                 // 当前实际位置
long targetStep  = 0;                 // 目标位置

const long MAX_MOTOR_STEPS = 1000;    // Rail 1 = 100 → 1000 步

const unsigned long STEP_INTERVAL_US = 1000;  // 数值越小，电机越快

unsigned long lastStepMicros = 0;

// ==================== 网页 ====================
const char htmlPage[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=yes">
<title>Rail Controller</title>
<style>
:root{--bg:#000;--text:#f5f5f7;--card-bg:rgba(28,28,30,0.65);--slider-track:#3a3a3c;--slider-thumb:#0a84ff;--border:rgba(255,255,255,0.15);--shadow:rgba(0,0,0,0.5);}
body.light{--bg:#f2f2f7;--text:#1c1c1e;--card-bg:rgba(255,255,255,0.7);--slider-track:#c7c7cc;--slider-thumb:#007aff;--border:rgba(0,0,0,0.1);--shadow:rgba(0,0,0,0.08);}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:var(--bg);color:var(--text);margin:0;padding:20px;display:flex;justify-content:center;align-items:center;min-height:100vh;transition:background-color .3s ease,color .3s ease;}
.container{width:100%;max-width:480px;background:var(--card-bg);backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);border-radius:32px;padding:30px 28px;box-shadow:0 20px 50px var(--shadow);border:1px solid var(--border);}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:25px;}
h1{font-size:22px;font-weight:600;margin:0;letter-spacing:-.4px;}
.theme-toggle{background:rgba(255,255,255,.15);border:none;border-radius:50%;width:42px;height:42px;font-size:18px;cursor:pointer;color:var(--text);display:flex;align-items:center;justify-content:center;transition:transform .2s;}
.theme-toggle:hover{transform:scale(1.08);}
.slider-group{margin:20px 0;}
.slider-group label{display:flex;align-items:center;justify-content:space-between;font-size:15px;font-weight:500;gap:8px;}
.slider-group span{min-width:50px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums;}
input[type="range"]{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;background:var(--slider-track);outline:none;margin:12px 0;}
input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:24px;height:24px;border-radius:50%;background:var(--slider-thumb);border:2px solid rgba(255,255,255,.3);cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.3);}
input[type="range"]::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:var(--slider-thumb);border:2px solid rgba(255,255,255,.3);cursor:pointer;}
.info{margin-top:25px;font-size:13px;opacity:.75;text-align:center;font-weight:500;line-height:1.6;}
.status-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#30d158;margin-right:6px;vertical-align:middle;animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
</style>
</head>
<body class="dark">
<div class="container">
<div class="header"><h1>Rail Control</h1><button class="theme-toggle" id="theme-toggle">☀️</button></div>
<div class="slider-group"><label>Rail 1 <span id="rail1-val">0</span></label><input id="rail1" type="range" min="0" max="100" value="0"></div>
<div class="slider-group"><label>Rail 2 <span id="rail2-val">0</span></label><input id="rail2" type="range" min="0" max="100" value="0"></div>
<div class="slider-group"><label>Rail 3 <span id="rail3-val">0</span></label><input id="rail3" type="range" min="0" max="100" value="0"></div>
<div class="info" id="info"><span class="status-dot"></span>Rail 1: 0 &nbsp;|&nbsp; Rail 2: 0 &nbsp;|&nbsp; Rail 3: 0</div>
</div>
<script>
let R1 = 0, R2 = 0, R3 = 0;
let lastInteraction = 0;
const elR1 = document.getElementById('rail1');
const elR2 = document.getElementById('rail2');
const elR3 = document.getElementById('rail3');
const elR1v = document.getElementById('rail1-val');
const elR2v = document.getElementById('rail2-val');
const elR3v = document.getElementById('rail3-val');
const info = document.getElementById('info');
function updateUI(){
  if(document.activeElement !== elR1) elR1.value = R1;
  if(document.activeElement !== elR2) elR2.value = R2;
  if(document.activeElement !== elR3) elR3.value = R3;
  elR1v.textContent = R1;
  elR2v.textContent = R2;
  elR3v.textContent = R3;
  info.innerHTML = '<span class="status-dot"></span>' +
    'Rail 1: ' + R1 + ' &nbsp;|&nbsp; ' +
    'Rail 2: ' + R2 + ' &nbsp;|&nbsp; ' +
    'Rail 3: ' + R3;
}
function sendRails(){
  lastInteraction = Date.now();
  fetch('/rail?value=' + Math.round(R1) + ',' + Math.round(R2) + ',' + Math.round(R3)).catch(()=>{});
}
elR1.addEventListener('input', function(){ R1 = Number(this.value); updateUI(); sendRails(); });
elR2.addEventListener('input', function(){ R2 = Number(this.value); updateUI(); sendRails(); });
elR3.addEventListener('input', function(){ R3 = Number(this.value); updateUI(); sendRails(); });
setInterval(function(){
  if(Date.now() - lastInteraction < 800) return;
  fetch('/get').then(r => r.json()).then(d => {
    if(d.r1 !== R1 || d.r2 !== R2 || d.r3 !== R3){
      R1 = d.r1; R2 = d.r2; R3 = d.r3;
      updateUI();
    }
  }).catch(()=>{});
}, 400);
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const savedTheme = localStorage.getItem('theme');
if(savedTheme === 'light'){
  body.classList.remove('dark');
  body.classList.add('light');
  themeToggle.innerHTML = '🌙';
}
themeToggle.addEventListener('click', function(){
  if(body.classList.contains('dark')){
    body.classList.remove('dark');
    body.classList.add('light');
    themeToggle.innerHTML = '🌙';
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.remove('light');
    body.classList.add('dark');
    themeToggle.innerHTML = '☀️';
    localStorage.setItem('theme', 'dark');
  }
});
updateUI();
</script>
</body>
</html>
)rawliteral";

// ==================== TCA9548A ====================
bool tcaSelect(uint8_t ch) {
  for (int i = 0; i < 3; i++) {
    Wire.beginTransmission(TCA_ADDR);
    Wire.write(1 << ch);
    if (Wire.endTransmission() == 0) return true;
    delayMicroseconds(100);
  }
  return false;
}

// ==================== OLED 绘制 ====================
void drawOne(Adafruit_SH1106G &disp, const char* label, int value) {
  disp.clearDisplay();
  disp.setTextSize(1);
  disp.setTextColor(SH110X_WHITE);
  disp.setCursor(0, 0);
  disp.print(label);

  disp.setTextSize(2);
  disp.setCursor(0, 14);
  disp.print(value);
  disp.print(" %");

  disp.drawRect(0, 46, 128, 14, SH110X_WHITE);   // 外框
  int fillW = map(value, 0, 100, 0, 126);        // 进度条
  if (fillW > 0) disp.fillRect(1, 47, fillW, 12, SH110X_WHITE);

  disp.display();
}

// ==================== 刷新三个 OLED ====================
void refreshAll() {
  if (tcaSelect(0)) drawOne(disp1, "Rail 1", rail1Val);
  if (tcaSelect(1)) drawOne(disp2, "Rail 2", rail2Val);
  if (tcaSelect(2)) drawOne(disp3, "Rail 3", rail3Val);
}

// ==================== 编码器 ISR ====================
void IRAM_ATTR isrEnc1() {
  uint8_t s = (digitalRead(ENC1_A) << 1) | digitalRead(ENC1_B);
  encState[0] = ((encState[0] << 2) | s) & 0x0F;
  int8_t d = KNOB_DIR[encState[0]];
  if (d) encDelta[0] += d;
}
void IRAM_ATTR isrEnc2() {
  uint8_t s = (digitalRead(ENC2_A) << 1) | digitalRead(ENC2_B);
  encState[1] = ((encState[1] << 2) | s) & 0x0F;
  int8_t d = KNOB_DIR[encState[1]];
  if (d) encDelta[1] += d;
}
void IRAM_ATTR isrEnc3() {
  uint8_t s = (digitalRead(ENC3_A) << 1) | digitalRead(ENC3_B);
  encState[2] = ((encState[2] << 2) | s) & 0x0F;
  int8_t d = KNOB_DIR[encState[2]];
  if (d) encDelta[2] += d;
}

// ==================== 更新 A4988 目标位置 ====================
void updateMotorTarget() {
  targetStep = map(rail1Val, 0, 100, 0, MAX_MOTOR_STEPS);
}

// ==================== 非阻塞步进电机控制 ====================
void updateMotor() {
  if (currentStep == targetStep) return;

  unsigned long now = micros();
  if (now - lastStepMicros < STEP_INTERVAL_US) return;
  lastStepMicros = now;

  // 设置方向
  if (targetStep > currentStep) digitalWrite(A4988_DIR, HIGH);
  else                          digitalWrite(A4988_DIR, LOW);

  // STEP 脉冲
  digitalWrite(A4988_STEP, HIGH);
  delayMicroseconds(3);
  digitalWrite(A4988_STEP, LOW);

  // 更新软件位置
  if (targetStep > currentStep) currentStep++;
  else                          currentStep--;
}

// ==================== 处理编码器 ====================
void handleEncoders() {
  int8_t d[3];
  noInterrupts();
  d[0] = encDelta[0]; encDelta[0] = 0;
  d[1] = encDelta[1]; encDelta[1] = 0;
  d[2] = encDelta[2]; encDelta[2] = 0;
  interrupts();

  bool changed = false;

  // -------------------- Rail 1 --------------------
  if (d[0] != 0) {
    rail1Val = constrain(rail1Val + d[0], 0, 100);
    updateMotorTarget();
    changed = true;
  }

  // -------------------- Rail 2 --------------------
  if (d[1] != 0) {
    rail2Val = constrain(rail2Val + d[1], 0, 100);
    changed = true;
  }

  // -------------------- Rail 3 --------------------
  if (d[2] != 0) {
    rail3Val = constrain(rail3Val + d[2], 0, 100);
    changed = true;
  }

  if (changed) refreshAll();
}

// ==================== HTTP Root ====================
void handleRoot() {
  server.send_P(200, "text/html; charset=utf-8", htmlPage);
}

// ==================== HTTP Rail ====================
void handleRail() {
  if (server.hasArg("value")) {
    String val = server.arg("value");
    int p1 = val.indexOf(',');
    int p2 = val.indexOf(',', p1 + 1);
    if (p1 > 0 && p2 > p1) {
      rail1Val = constrain(val.substring(0, p1).toInt(), 0, 100);
      rail2Val = constrain(val.substring(p1 + 1, p2).toInt(), 0, 100);
      rail3Val = constrain(val.substring(p2 + 1).toInt(), 0, 100);
      updateMotorTarget();
      refreshAll();
    }
  }
  server.send(200, "text/plain", "OK");
}

// ==================== HTTP Get ====================
void handleGet() {
  char buf[100];
  snprintf(buf, sizeof(buf),
    "{\"r1\":%d,\"r2\":%d,\"r3\":%d,\"currentStep\":%ld,\"targetStep\":%ld}",
    rail1Val, rail2Val, rail3Val, currentStep, targetStep);
  server.send(200, "application/json", buf);
}

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n=== ESP32 Rail Controller ===");

  // --- A4988 GPIO ---
  pinMode(A4988_DIR, OUTPUT);
  pinMode(A4988_STEP, OUTPUT);
  digitalWrite(A4988_DIR, LOW);
  digitalWrite(A4988_STEP, LOW);
  Serial.println("A4988 GPIO initialized.");

  // --- I2C ---
  Wire.begin(SDA_PIN, SCL_PIN);
  Wire.setClock(100000);
  delay(100);

  // --- OLED 自检 ---
  Adafruit_SH1106G* disps[3] = { &disp1, &disp2, &disp3 };
  for (int ch = 0; ch < 3; ch++) {
    if (!tcaSelect(ch)) {
      Serial.printf("!! tcaSelect(%d) FAIL\n", ch);
      continue;
    }
    delay(20);
    if (!disps[ch]->begin(0x3C, true)) {
      Serial.printf("!! OLED %d begin FAIL\n", ch + 1);
    } else {
      Serial.printf("OK OLED %d\n", ch + 1);
      // 自检：显示大号数字
      disps[ch]->clearDisplay();
      disps[ch]->setTextSize(5);
      disps[ch]->setTextColor(SH110X_WHITE);
      char num[2] = { (char)('1' + ch), 0 };
      disps[ch]->setCursor(50, 12);
      disps[ch]->print(num);
      disps[ch]->display();
    }
  }

  delay(800);

  // --- 编码器 ---
  const uint8_t aPin[3] = {ENC1_A, ENC2_A, ENC3_A};
  const uint8_t bPin[3] = {ENC1_B, ENC2_B, ENC3_B};
  for (int i = 0; i < 3; i++) {
    pinMode(aPin[i], INPUT_PULLUP);
    pinMode(bPin[i], INPUT_PULLUP);
    encState[i] = (digitalRead(aPin[i]) << 1) | digitalRead(bPin[i]);
  }
  attachInterrupt(digitalPinToInterrupt(ENC1_A), isrEnc1, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENC1_B), isrEnc1, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENC2_A), isrEnc2, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENC2_B), isrEnc2, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENC3_A), isrEnc3, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENC3_B), isrEnc3, CHANGE);

  // --- 初始 OLED ---
  refreshAll();

  // --- WiFi ---
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);                  // 防止 WiFi 干扰 I2C
  WiFi.setTxPower(WIFI_POWER_11dBm);     // 防止电流冲击导致复位
  Serial.printf("Connecting to %s ", ssid);
  WiFi.begin(ssid, password);
  uint32_t t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 20000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WiFi OK. IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi failed");
  }

  delay(300);
  refreshAll();   // WiFi 稳定后再刷一次

  // --- HTTP 路由 ---
  server.on("/", handleRoot);
  server.on("/rail", handleRail);
  server.on("/get", handleGet);
  server.begin();
  Serial.println("HTTP server on port 80");
  Serial.println("Ready.");
  Serial.println();
  Serial.println("Rail 1 controls A4988.");
  Serial.println("Rail 1 = 0   -> 0 step");
  Serial.println("Rail 1 = 100 -> 1000 step");
}

// ==================== LOOP ====================
uint32_t lastRefresh = 0;

void loop() {
  server.handleClient();   // WiFi
  handleEncoders();        // 三个旋钮
  updateMotor();           // A4988

  // 每 3 秒刷新 OLED
  if (millis() - lastRefresh > 3000) {
    lastRefresh = millis();
    refreshAll();
  }

  delay(1);
}
```
