---
title: ESP32 + Multi-OLED + Encoder HSV Control System
date: 2026-09-14
description: Three OLED + encoder modules on one I2C bus through a TCA9548A, two-way synced with a WiFi web page, the HSV tests.

type: lab
category: Embedded System
cover: 01-hardware.jpeg

tags:
  - ESP32
  - WiFi
  - OLED
  - EC11 Encoder
  - HSV
  - TCA9548A
  - Web Server

tools:
  - ESP32
  - TCA9548A I2C Multiplexer
  - SH1106 1.3" OLED + EC11 Module ×3
  - 5V 2A Power Adapter
  - WebServer

featured: true

lang: en

translationKey: esp32-multi-oled-encoder-hsv
---

![Hardware Setup](./01-hardware.jpeg)

# What I Built

This was a fairly important test: the multiplexer saves a lot of pins, so running out of GPIOs stops being a problem. The first prototype proved one ESP32 could juggle two encoders and two OLEDs over WebSocket. This time I went from two modules to three, and instead of raw angles each module got a real job: H, S and V. One ESP32, one TCA9548A, three SH1106 OLEDs and three EC11 encoders, plus a WiFi web page that previews the color live and stays in sync with the knobs in both directions.

The system does four things:

1. **Three OLEDs show one HSV channel each**: Hue (H), Saturation (S) and Value (V), each with a progress bar tinted in the current color.
2. **Three encoders adjust the three channels**: turn a knob and the value plus bar move with it.
3. **A web page previews the color live** and syncs with the hardware both ways.
4. **A clean hook for NeoPixel later**: the refresh path is built so an LED strip can hang off the same HSV state.

Three problems made this interesting:

1. **All three OLEDs share I2C address 0x3C**, so they can't just sit on the bus in parallel.
2. **Three encoders eat six GPIOs**, and I wanted the pin budget to stay sane.
3. **WiFi RF interferes with I2C**, and the transmit current spike can reset the board.

# Hardware

| Component | Qty | Notes |
|---|---|---|
| ESP32 dev board | 1 | ESP32-D0WD-V3 |
| TCA9548A I2C multiplexer | 1 | Default address 0x70 |
| 1.3" OLED + EC11 module | 3 | Driver chip is SH1106, not SSD1306 |
| Dupont wires | a handful | Short and thick beats long and thin |
| 5V 2A power adapter | 1 | Do not power this from a PC USB port |

> Heads-up: 1.3" OLEDs are almost always SH1106, only the 0.96" ones are SSD1306. Wrong library means a white screen with the occasional black line.

# Wiring

## The OLED + EC11 module (9 pins, two groups)

OLED side (4 pins, I2C):

| Silkscreen | Meaning | Hookup |
|---|---|---|
| VCC | Power | 3.3V |
| GND | Ground | GND |
| SDA | I2C data | via TCA9548A channel |
| SCL | I2C clock | via TCA9548A channel |

Encoder side (5 pins, mechanical switch):

| Silkscreen | Meaning | Hookup |
|---|---|---|
| TRA | Phase A | ESP32 GPIO |
| TRB | Phase B | ESP32 GPIO |
| CON | Common | Module pulls it up internally, can float |
| PSH | Button side 1 | Float if unused |
| BAK | Button side 2 | Float if unused |

> The modules I have pull CON/BAK up to 3.3V internally, so no wires needed. If yours doesn't respond with CON floating, tie CON to GND.

## ESP32 to TCA9548A

| ESP32 | TCA9548A | Notes |
|---|---|---|
| GPIO 21 | SDA | Main I2C data |
| GPIO 22 | SCL | Main I2C clock |
| 3.3V | VIN | Power |
| GND | GND | Common ground |
| float | RST | Can float, I left it floating |

> About RST: active-low reset. Most modules have an internal pull-up, so floating works. I ran it floating the whole time without issues.

## TCA9548A to the three OLEDs

| Module | OLED SDA | OLED SCL |
|---|---|---|
| 1 | SD0 | SC0 |
| 2 | SD1 | SC1 |
| 3 | SD2 | SC2 |

Each module: VCC to 3.3V, GND to GND.

## ESP32 to the three encoders

| Module | TRA | TRB | CON | PSH | BAK |
|---|---|---|---|---|---|
| 1 | GPIO 25 | GPIO 18 | float | float | float |
| 2 | GPIO 26 | GPIO 27 | float | float | float |
| 3 | GPIO 4 | GPIO 16 | float | float | float |

## Pin budget

| Purpose | GPIOs | Count |
|---|---|---|
| I2C (SDA/SCL) | 21, 22 | 2 |
| Encoder module 1 | TRA→GPIO 25, TRB→GPIO 18 | 2 |
| Encoder module 2 | TRA→GPIO 26, TRB→GPIO 27 | 2 |
| Encoder module 3 | TRA→GPIO 4, TRB→GPIO 16 | 2 |
| Total | | 8 |

Every extra module costs two more GPIOs (TRA, TRB). That math held up fine.

# The TCA9548A Trick

All three OLEDs answer to 0x3C, so parallel wiring would make all three render the same frame. The TCA9548A fans one I2C bus out into 8 channels, and you pick the active one by writing a bitmask to address 0x70:

```cpp
Wire.beginTransmission(0x70);
Wire.write(1 << channel);  // enable channel `channel`
Wire.endTransmission();
```

Only one channel conducts at a time, so the three 0x3C OLEDs never see each other.

The encoders deliberately stay off the multiplexer: an EC11 is a mechanical switch outputting raw levels, not an I2C device. The TCA9548A forwards SDA/SCL and has no idea what a bare level means, so TRA/TRB wire straight to ESP32 GPIOs. If you really wanted to save pins, you'd move them to another kind of module, an I2C GPIO expander like the MCP23017. But each module only needs 2 GPIOs and three modules only 6, which the ESP32 has lying around, so the MCP23017 only earns its place past 5 modules.

# Encoder Decoding

An EC11 outputs Gray code on A/B: 11 → 10 → 00 → 01 → 11. Mechanical contacts bounce, and a naive lookup table drops or doubles steps. The Ben Buxton state machine keeps a 4-bit history and accumulates direction per transition through a 16-entry table:

```cpp
static const int8_t KNOB_DIR[16] = {
   0, -1,  1,  0,
   1,  0,  0, -1,
  -1,  0,  0,  1,
   0,  1, -1,  0
};

void IRAM_ATTR isrEnc1() {
  uint8_t s = (digitalRead(ENC1_A) << 1) | digitalRead(ENC1_B);
  encState[0] = ((encState[0] << 2) | s) & 0x0F;
  int8_t d = KNOB_DIR[encState[0]];
  if (d) encDelta[0] += d;
}
```

Bounce basically disappeared after this.

# Web Page Sync

![Web Page](./02-web-view.png)

The page has three sliders and a live color preview. It even has a dark/light toggle, because the preview looks wrong on a bright page.

- **Hardware to web**: the page polls GET /get every 400ms and only touches the sliders when the values actually differ.
- **Web to hardware**: every slider input fires GET /hsv?value=h,s,v, and the ESP32 refreshes all three OLEDs immediately.
- **Conflict prevention**: the page records lastInteraction and skips polling for 800ms after any user input, so a poll can't stomp on a drag in progress.

# The Bugs

## Bug 1: 1.3" OLEDs are SH1106, not SSD1306

**Symptom**: screen mostly white, occasionally flashing one line of black text.

**Cause**: the SH1106's RAM is 132 columns wide. An SSD1306 library writes 128 columns and the whole frame lands misaligned.

**Fix**: the Adafruit_SH110X library with an Adafruit_SH1106G object:

```cpp
#include <Adafruit_SH110X.h>
Adafruit_SH1106G disp(128, 64, &Wire, -1);
disp.begin(0x3C, true);   // true = the module has its own reset circuit
```

## Bug 2: WiFi transmit spike resets the board

**Symptom**: serial shows rst:0x1 (POWERON_RESET), always 1-2 seconds after WiFi starts.

**Cause**: WiFi TX peaks around 500mA. Add three OLEDs on top and the board's AMS1117 regulator can't keep up transiently.

**Fixes, in order of priority**:

1. Drop TX power (most effective, free):
   ```cpp
   WiFi.setTxPower(WIFI_POWER_11dBm);
   ```
   11dBm is plenty for a home router a few meters away.
2. Power from a 5V 2A wall adapter, never a PC USB port.
3. Add a 470µF-1000µF electrolytic across 3.3V and GND to soak the spikes.
4. Feed the three OLEDs from a separate 3.3V rail with common GND.

## Bug 3: WiFi RF interrupts break I2C

**Symptom**: once WiFi connects, the OLEDs stop refreshing, the encoders go dead and web page commands do nothing.

**Cause**: the ESP32's WiFi power-save mode bursts RF interrupts straight through I2C timing.

**Fix**:

```cpp
WiFi.setSleep(false);   // turn off WiFi power save
```

## Bug 4: TCA9548A RST pin

RST is active-low reset. Most modules pull it up internally, so leaving it floating is fine, and that's how it ran here, completely stable.

If the TCA9548A acts up, check the usual suspects first: SDA/SCL swapped, a flaky dupont wire, a wire somebody bumped.

## Bug 5: encoder phase A contact wore out

**Symptom**: module 1 jumps between 0 and 359, net delta zero. Modules 2 and 3 behave.

**Cause**: the EC11's A or B phase contact physically wore out. With only one phase toggling, the state machine registers +1 then -1 and the sum cancels.

**Diagnosis**:

1. Flash a tiny sketch that just prints the A/B levels.
2. Turn the knob and check that both phases toggle 0/1.
3. If only one toggles, swap the A/B wires.
4. If the problem follows the encoder, the encoder is dead. If it follows the GPIO, the GPIO or wire is.

**Fix**: swap in a spare module. That's what module 1 got.

# Result

Serial output on boot:

```
=== ESP32 HSV Controller (final) ===
OK OLED 1
OK OLED 2
OK OLED 3
Connecting to MyWiFi .....
WiFi OK. IP: 192.168.1.254
HTTP server on port 80
Ready.
```

Each OLED shows its channel name, the current value and a progress bar tinted with the current HSV color, all three bars showing the same color. Interactions:

| Action | Effect |
|---|---|
| Turn encoder 1 | H changes, OLED 1 and the web page follow |
| Turn encoder 2 | S changes |
| Turn encoder 3 | V changes |
| Drag a web slider | All three OLEDs update at once |
| Page polls every 400ms | Encoder changes show up on the page automatically |

# Scaling Up

| Modules | Approach |
|---|---|
| 1-5 | Straight to GPIOs, simplest |
| 6-8 | TCA9548A with all 8 channels + 12 GPIOs |
| 8+ | Add an MCP23017 (16 GPIOs over I2C) or a second TCA9548A |

The NeoPixel hook: add a call in refreshAll() that converts the current HSV to RGB888 and pushes it to the strip.

```cpp
#include <Adafruit_NeoPixel.h>

Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

void updateStrip() {
  uint8_t r, g, b;
  hsvToRgb888(hVal, sVal, vVal, r, g, b);
  for (int i = 0; i < LED_COUNT; i++) {
    strip.setPixelColor(i, strip.Color(r, g, b));
  }
  strip.show();
}
```

The web page and encoder paths don't change at all.

# Full Code

Libraries: Adafruit SH110X, Adafruit GFX Library, Adafruit BusIO (auto-installed). Board: ESP32 Dev Module.

```cpp
/*
 * ESP32 + TCA9548A + 3x (OLED + EC11) + WiFi web sync
 * Final version
 */

#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>

// ==================== WiFi config ====================
const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// ==================== I2C ====================
#define SDA_PIN 21
#define SCL_PIN 22
#define TCA_ADDR 0x70

// ==================== Encoders ====================
#define ENC1_A 25
#define ENC1_B 18
#define ENC2_A 26
#define ENC2_B 27
#define ENC3_A 4
#define ENC3_B 16

// ==================== OLED ====================
Adafruit_SH1106G disp1(128, 64, &Wire, -1);
Adafruit_SH1106G disp2(128, 64, &Wire, -1);
Adafruit_SH1106G disp3(128, 64, &Wire, -1);

WebServer server(80);

// ==================== HSV state ====================
int hVal = 0;
int sVal = 100;
int vVal = 100;

// ==================== Encoder state machine ====================
static const int8_t KNOB_DIR[16] = {
   0, -1,  1,  0,
   1,  0,  0, -1,
  -1,  0,  0,  1,
   0,  1, -1,  0
};

volatile uint8_t encState[3] = {0, 0, 0};
volatile int8_t  encDelta[3] = {0, 0, 0};

// ==================== Web page HTML ====================
const char htmlPage[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=yes">
<title>HSV Controller</title>
<style>
:root{--bg:#000;--text:#f5f5f7;--card-bg:rgba(28,28,30,0.65);--slider-track:#3a3a3c;--slider-thumb:#0a84ff;--border:rgba(255,255,255,0.15);--shadow:rgba(0,0,0,0.5);}
body.light{--bg:#f2f2f7;--text:#1c1c1e;--card-bg:rgba(255,255,255,0.7);--slider-track:#c7c7cc;--slider-thumb:#007aff;--border:rgba(0,0,0,0.1);--shadow:rgba(0,0,0,0.08);}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:var(--bg);color:var(--text);margin:0;padding:20px;display:flex;justify-content:center;align-items:center;min-height:100vh;transition:background-color .3s ease,color .3s ease;}
.container{width:100%;max-width:480px;background:var(--card-bg);backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);border-radius:32px;padding:30px 28px;box-shadow:0 20px 50px var(--shadow);border:1px solid var(--border);}
.color-preview{width:100%;height:130px;border-radius:20px;margin-bottom:24px;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:background .12s linear;border:1px solid var(--border);}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;}
h1{font-size:22px;font-weight:600;margin:0;letter-spacing:-.4px;}
.theme-toggle{background:rgba(255,255,255,.15);border:none;border-radius:50%;width:42px;height:42px;font-size:18px;cursor:pointer;color:var(--text);display:flex;align-items:center;justify-content:center;transition:transform .2s;}
.theme-toggle:hover{transform:scale(1.08);}
.slider-group{margin:16px 0;}
.slider-group label{display:flex;align-items:center;justify-content:space-between;font-size:15px;font-weight:500;gap:8px;}
.slider-group span{min-width:60px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums;}
input[type="range"]{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;background:var(--slider-track);outline:none;margin:8px 0;}
input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:24px;height:24px;border-radius:50%;background:var(--slider-thumb);border:2px solid rgba(255,255,255,.3);cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.3);}
input[type="range"]::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:var(--slider-thumb);border:2px solid rgba(255,255,255,.3);cursor:pointer;}
.info{margin-top:20px;font-size:13px;opacity:.75;text-align:center;font-weight:500;line-height:1.6;}
.status-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#30d158;margin-right:6px;vertical-align:middle;animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
</style></head>
<body class="dark">
<div class="container">
<div class="header"><h1>HSV Control</h1><button class="theme-toggle" id="theme-toggle">☀️</button></div>
<div class="color-preview" id="preview"></div>
<div class="slider-group"><label>Hue <input id="h" type="range" min="0" max="360" value="0"><span id="h-val">0°</span></label></div>
<div class="slider-group"><label>Saturation <input id="s" type="range" min="0" max="100" value="100"><span id="s-val">100%</span></label></div>
<div class="slider-group"><label>Value <input id="v" type="range" min="0" max="100" value="100"><span id="v-val">100%</span></label></div>
<div class="info" id="info"><span class="status-dot"></span>RGB: 255,0,0</div>
</div>
<script>
let H=0,S=100,V=100,lastInteraction=0;
const preview=document.getElementById('preview'),info=document.getElementById('info');
const elH=document.getElementById('h'),elS=document.getElementById('s'),elV=document.getElementById('v');
const elHv=document.getElementById('h-val'),elSv=document.getElementById('s-val'),elVv=document.getElementById('v-val');
function hsvToRgb(h,s,v){s/=100;v/=100;let c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c,r=0,g=0,b=0;if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}return[Math.round((r+m)*255),Math.round((g+m)*255),Math.round((b+m)*255)];}
function updateUI(){const rgb=hsvToRgb(H,S,V);preview.style.background='rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')';info.innerHTML='<span class="status-dot"></span>RGB: '+rgb.join(',')+' &nbsp;|&nbsp; HSV: '+Math.round(H)+'°, '+S+'%, '+V+'%';if(document.activeElement!==elH)elH.value=H;if(document.activeElement!==elS)elS.value=S;if(document.activeElement!==elV)elV.value=V;elHv.textContent=Math.round(H)+'°';elSv.textContent=S+'%';elVv.textContent=V+'%';}
function sendHSV(){lastInteraction=Date.now();fetch('/hsv?value='+Math.round(H)+','+Math.round(S)+','+Math.round(V)).catch(()=>{});}
elH.addEventListener('input',function(){H=Number(this.value)%360;updateUI();sendHSV();});
elS.addEventListener('input',function(){S=Number(this.value);updateUI();sendHSV();});
elV.addEventListener('input',function(){V=Number(this.value);updateUI();sendHSV();});
setInterval(function(){if(Date.now()-lastInteraction<800)return;fetch('/get').then(r=>r.json()).then(d=>{if(d.h!==Math.round(H)||d.s!==S||d.v!==V){H=d.h;S=d.s;V=d.v;updateUI();}}).catch(()=>{});},400);
const themeToggle=document.getElementById('theme-toggle');const body=document.body;const savedTheme=localStorage.getItem('theme');
if(savedTheme==='light'){body.classList.remove('dark');body.classList.add('light');themeToggle.innerHTML='🌙';}
themeToggle.addEventListener('click',function(){if(body.classList.contains('dark')){body.classList.remove('dark');body.classList.add('light');themeToggle.innerHTML='🌙';localStorage.setItem('theme','light');}else{body.classList.remove('light');body.classList.add('dark');themeToggle.innerHTML='☀️';localStorage.setItem('theme','dark');}});
updateUI();
</script></body></html>
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

// ==================== HSV to RGB565 ====================
uint16_t hsvToRgb565(int h, int s, int v) {
  float sf = s / 100.0f, vf = v / 100.0f, hf = h / 60.0f;
  int i = (int)hf; float f = hf - i;
  float p = vf * (1 - sf);
  float q = vf * (1 - sf * f);
  float t = vf * (1 - sf * (1 - f));
  float r, g, b;
  switch (i % 6) {
    case 0: r=vf; g=t;  b=p;  break;
    case 1: r=q;  g=vf; b=p;  break;
    case 2: r=p;  g=vf; b=t;  break;
    case 3: r=p;  g=q;  b=vf; break;
    case 4: r=t;  g=p;  b=vf; break;
    case 5: r=vf; g=p;  b=q;  break;
    default: r=g=b=0;
  }
  return ((uint16_t)(r*31)<<11) | ((uint16_t)(g*63)<<5) | (uint16_t)(b*31);
}

// ==================== Draw one OLED ====================
void drawOne(Adafruit_SH1106G &disp, const char* label, int value,
             int maxVal, uint16_t barColor) {
  disp.clearDisplay();
  disp.setTextSize(1);
  disp.setTextColor(SH110X_WHITE);
  disp.setCursor(0, 0);
  disp.print(label);

  disp.setTextSize(2);
  disp.setCursor(0, 14);
  disp.print(value);
  disp.print(maxVal == 359 ? " deg" : " %");

  disp.drawRect(0, 46, 128, 14, SH110X_WHITE);
  int fillW = map(value, 0, maxVal, 0, 126);
  if (fillW > 0) disp.fillRect(1, 47, fillW, 12, barColor);

  disp.display();
}

void refreshAll() {
  uint16_t color = hsvToRgb565(hVal, sVal, vVal);
  if (tcaSelect(0)) drawOne(disp1, "Hue (H)", hVal, 359, color);
  if (tcaSelect(1)) drawOne(disp2, "Saturation (S)", sVal, 100, color);
  if (tcaSelect(2)) drawOne(disp3, "Value (V)", vVal, 100, color);
}

// ==================== Encoder ISRs ====================
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

// ==================== Handle encoders ====================
void handleEncoders() {
  int8_t d[3];
  noInterrupts();
  d[0] = encDelta[0]; encDelta[0] = 0;
  d[1] = encDelta[1]; encDelta[1] = 0;
  d[2] = encDelta[2]; encDelta[2] = 0;
  interrupts();

  bool changed = false;
  if (d[0] != 0) {
    hVal = (hVal + d[0] + 360) % 360;
    changed = true;
  }
  if (d[1] != 0) {
    sVal = constrain(sVal + d[1], 0, 100);
    changed = true;
  }
  if (d[2] != 0) {
    vVal = constrain(vVal + d[2], 0, 100);
    changed = true;
  }
  if (changed) refreshAll();
}

// ==================== HTTP handlers ====================
void handleRoot() {
  server.send_P(200, "text/html; charset=utf-8", htmlPage);
}

void handleHSV() {
  if (server.hasArg("value")) {
    String val = server.arg("value");
    int p1 = val.indexOf(',');
    int p2 = val.indexOf(',', p1 + 1);
    if (p1 > 0 && p2 > p1) {
      hVal = constrain(val.substring(0, p1).toInt(), 0, 359);
      sVal = constrain(val.substring(p1 + 1, p2).toInt(), 0, 100);
      vVal = constrain(val.substring(p2 + 1).toInt(), 0, 100);
      refreshAll();
    }
  }
  server.send(200, "text/plain", "OK");
}

void handleGet() {
  char buf[64];
  snprintf(buf, sizeof(buf), "{\"h\":%d,\"s\":%d,\"v\":%d}", hVal, sVal, vVal);
  server.send(200, "application/json", buf);
}

// ==================== Setup ====================
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n=== ESP32 HSV Controller (final) ===");

  Wire.begin(SDA_PIN, SCL_PIN);
  Wire.setClock(100000);
  delay(100);

  // --- Init the three OLEDs ---
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
      // Self-test: show a big number
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

  // --- Three encoders ---
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

  // --- First real frame ---
  refreshAll();

  // --- Start WiFi ---
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);                 // keep WiFi from interfering with I2C
  WiFi.setTxPower(WIFI_POWER_11dBm);    // keep the current spike from resetting the board
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
  refreshAll();   // refresh once more after WiFi settles

  // --- HTTP routes ---
  server.on("/",    handleRoot);
  server.on("/hsv", handleHSV);
  server.on("/get", handleGet);
  server.begin();
  Serial.println("HTTP server on port 80");
  Serial.println("Ready.");
}

// ==================== Loop ====================
uint32_t lastRefresh = 0;

void loop() {
  server.handleClient();
  handleEncoders();

  // Force a full refresh every 3 seconds (against display drift)
  if (millis() - lastRefresh > 3000) {
    lastRefresh = millis();
    refreshAll();
  }

  delay(3);
}
```
